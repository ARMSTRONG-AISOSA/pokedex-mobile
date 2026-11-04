import { fetchPokemon, fetchSpeciesCount, fetchSpeciesIndex } from '@/data/api/pokeapi';
import { readThrough, type Cached } from '@/data/cache';
import { emitDataRefreshed } from '@/data/events';
import { matchesQuery } from '@/domain/sorting';
import { isTypeName, type Pokemon } from '@/domain/types';

import { getDatabase } from './database';

/**
 * Pokémon data: SQLite first, PokéAPI when missing or old (see `data/cache.ts`).
 * If the database is unavailable every read is a miss and writes are skipped,
 * so the app keeps working network-only.
 */

type PokemonRow = {
  id: number;
  name: string;
  hp: number;
  attack: number;
  defense: number;
  sp_atk: number;
  sp_def: number;
  speed: number;
  artwork_url: string | null;
  artwork_shiny_url: string | null;
  fetched_at: number;
};

async function readPokemon(id: number): Promise<Cached<Pokemon> | null> {
  const db = await getDatabase();
  if (!db) return null;
  const row = await db.getFirstAsync<PokemonRow>('SELECT * FROM pokemon WHERE id = ?', id);
  if (!row) return null;
  const typeRows = await db.getAllAsync<{ type: string }>(
    'SELECT type FROM pokemon_types WHERE pokemon_id = ? ORDER BY slot',
    id,
  );
  const types = typeRows.map((t) => t.type).filter(isTypeName);
  if (types.length === 0) return null; // incomplete row: treat as a miss
  return {
    fetchedAt: row.fetched_at,
    value: {
      id: row.id,
      name: row.name,
      types,
      stats: {
        hp: row.hp,
        attack: row.attack,
        defense: row.defense,
        spAtk: row.sp_atk,
        spDef: row.sp_def,
        speed: row.speed,
      },
      artworkUrl: row.artwork_url,
      artworkShinyUrl: row.artwork_shiny_url,
    },
  };
}

async function writePokemon(p: Pokemon, fetchedAt: number): Promise<void> {
  const db = await getDatabase();
  if (!db) return;
  const s = p.stats;
  const total = s.hp + s.attack + s.defense + s.spAtk + s.spDef + s.speed;
  // Exclusive, so five parallel saves can't interleave inside each other's transactions.
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync(
      `INSERT INTO pokemon (id, name, hp, attack, defense, sp_atk, sp_def, speed, total, artwork_url, artwork_shiny_url, fetched_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name, hp = excluded.hp, attack = excluded.attack, defense = excluded.defense,
         sp_atk = excluded.sp_atk, sp_def = excluded.sp_def, speed = excluded.speed, total = excluded.total,
         artwork_url = excluded.artwork_url, artwork_shiny_url = excluded.artwork_shiny_url,
         fetched_at = excluded.fetched_at`,
      p.id, p.name, s.hp, s.attack, s.defense, s.spAtk, s.spDef, s.speed, total,
      p.artworkUrl, p.artworkShinyUrl, fetchedAt,
    );
    await txn.runAsync('DELETE FROM pokemon_types WHERE pokemon_id = ?', p.id);
    for (const [index, type] of p.types.entries()) {
      await txn.runAsync(
        'INSERT INTO pokemon_types (pokemon_id, slot, type) VALUES (?, ?, ?)',
        p.id, index + 1, type,
      );
    }
    await txn.runAsync('INSERT OR REPLACE INTO pokemon_index (id, name) VALUES (?, ?)', p.id, p.name);
  });
}

export function getPokemon(id: number): Promise<Pokemon> {
  return readThrough({
    key: `pokemon:${id}`,
    read: () => readPokemon(id),
    fetch: () => fetchPokemon(id),
    write: writePokemon,
    onRefreshed: (pokemon) => emitDataRefreshed({ kind: 'pokemon', pokemon }),
  });
}

async function readMeta(key: string): Promise<Cached<string> | null> {
  const db = await getDatabase();
  if (!db) return null;
  const row = await db.getFirstAsync<{ value: string; fetched_at: number }>(
    'SELECT value, fetched_at FROM meta WHERE key = ?',
    key,
  );
  return row ? { value: row.value, fetchedAt: row.fetched_at } : null;
}

async function writeMeta(key: string, value: string, fetchedAt: number): Promise<void> {
  const db = await getDatabase();
  if (!db) return;
  await db.runAsync('INSERT OR REPLACE INTO meta (key, value, fetched_at) VALUES (?, ?, ?)', key, value, fetchedAt);
}

/** Number of species. Refreshed monthly, so new Pokémon appear once PokéAPI adds them. */
export function getSpeciesCount(): Promise<number> {
  return readThrough({
    key: 'meta:species_count',
    read: async () => {
      const meta = await readMeta('species_count');
      return meta ? { value: Number(meta.value), fetchedAt: meta.fetchedAt } : null;
    },
    fetch: fetchSpeciesCount,
    write: (count, fetchedAt) => writeMeta('species_count', String(count), fetchedAt),
    onRefreshed: (count) => emitDataRefreshed({ kind: 'speciesCount', count }),
  });
}

export type PokemonPage = {
  items: Pokemon[];
  /** Offset of the next page, or null on the last page. */
  nextOffset: number | null;
  total: number;
};

/**
 * One page of the Pokédex in number order (decision OQ-3 / D-016, option 1).
 * Species ids run 1…count with no gaps, so offset N holds ids N+1 … N+limit.
 * Cached Pokémon come from SQLite; the rest are fetched, at most 5 at a time.
 */
export async function getPokemonPage(offset: number, limit: number): Promise<PokemonPage> {
  const total = await getSpeciesCount();
  const end = Math.min(offset + limit, total);
  const ids: number[] = [];
  for (let id = offset + 1; id <= end; id += 1) ids.push(id);
  const items = await Promise.all(ids.map(getPokemon));
  return { items, nextOffset: end < total ? end : null, total };
}

type IndexEntry = { id: number; name: string };

/** All species names, for searching by name even before a Pokémon has been opened. */
function getNameIndex(): Promise<IndexEntry[]> {
  return readThrough({
    key: 'meta:name_index',
    read: async () => {
      const meta = await readMeta('name_index');
      const db = await getDatabase();
      if (!meta || !db) return null;
      const rows = await db.getAllAsync<IndexEntry>('SELECT id, name FROM pokemon_index ORDER BY id');
      return { value: rows, fetchedAt: meta.fetchedAt };
    },
    fetch: async () => fetchSpeciesIndex(await getSpeciesCount()),
    write: async (entries, fetchedAt) => {
      const db = await getDatabase();
      if (!db) return;
      await db.withExclusiveTransactionAsync(async (txn) => {
        for (const e of entries) {
          await txn.runAsync('INSERT OR REPLACE INTO pokemon_index (id, name) VALUES (?, ?)', e.id, e.name);
        }
        await txn.runAsync(
          'INSERT OR REPLACE INTO meta (key, value, fetched_at) VALUES (?, ?, ?)',
          'name_index', String(entries.length), fetchedAt,
        );
      });
    },
  });
}

/** Ids of species matching a name or number search, in number order. */
export async function searchPokemonIds(query: string): Promise<number[]> {
  const index = await getNameIndex();
  return index.filter((entry) => matchesQuery(entry, query)).map((entry) => entry.id);
}
