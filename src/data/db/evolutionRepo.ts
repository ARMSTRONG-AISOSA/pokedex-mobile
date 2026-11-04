import { fetchEvolutionChainId, fetchEvolutionTree } from '@/data/api/pokeapi';
import { readThrough } from '@/data/cache';
import { emitDataRefreshed } from '@/data/events';
import type { EvolutionNode } from '@/domain/types';
import { logger } from '@/lib/logger';

import { getDatabase } from './database';
import { getPokemon } from './pokemonRepo';

/**
 * Evolution trees. A species points to a chain; one chain is shared by the
 * whole family, so Bulbasaur, Ivysaur and Venusaur reuse one saved tree.
 */

function getChainId(speciesId: number): Promise<number | null> {
  return readThrough<number | null>({
    key: `species:${speciesId}`,
    read: async () => {
      const db = await getDatabase();
      if (!db) return null;
      const row = await db.getFirstAsync<{ evolution_chain_id: number; fetched_at: number }>(
        'SELECT evolution_chain_id, fetched_at FROM species WHERE id = ?',
        speciesId,
      );
      return row ? { value: row.evolution_chain_id, fetchedAt: row.fetched_at } : null;
    },
    fetch: () => fetchEvolutionChainId(speciesId),
    write: async (chainId, fetchedAt) => {
      const db = await getDatabase();
      if (!db || chainId === null) return;
      await db.runAsync(
        'INSERT OR REPLACE INTO species (id, evolution_chain_id, fetched_at) VALUES (?, ?, ?)',
        speciesId, chainId, fetchedAt,
      );
    },
  });
}

function getTree(chainId: number, speciesId: number): Promise<EvolutionNode> {
  return readThrough({
    key: `chain:${chainId}`,
    read: async () => {
      const db = await getDatabase();
      if (!db) return null;
      const row = await db.getFirstAsync<{ tree_json: string; fetched_at: number }>(
        'SELECT tree_json, fetched_at FROM evolution_chain WHERE id = ?',
        chainId,
      );
      if (!row) return null;
      try {
        return { value: JSON.parse(row.tree_json) as EvolutionNode, fetchedAt: row.fetched_at };
      } catch (error) {
        logger.warn('Saved evolution tree is not valid JSON, refetching', { chainId, error });
        return null;
      }
    },
    fetch: () => fetchEvolutionTree(chainId),
    write: async (tree, fetchedAt) => {
      const db = await getDatabase();
      if (!db) return;
      await db.runAsync(
        'INSERT OR REPLACE INTO evolution_chain (id, tree_json, fetched_at) VALUES (?, ?, ?)',
        chainId, JSON.stringify(tree), fetchedAt,
      );
    },
    onRefreshed: (tree) => emitDataRefreshed({ kind: 'evolution', speciesId, tree }),
  });
}

/** The evolution tree that contains this species. */
export async function getEvolutionTree(speciesId: number): Promise<EvolutionNode> {
  const chainId = await getChainId(speciesId);
  if (chainId === null) {
    // PokéAPI has no chain for this species: show it on its own ("does not evolve").
    const pokemon = await getPokemon(speciesId);
    return { speciesName: pokemon.name, id: pokemon.id, via: '', isBaby: false, children: [] };
  }
  return getTree(chainId, speciesId);
}
