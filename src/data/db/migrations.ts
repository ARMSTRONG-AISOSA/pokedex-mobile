import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Schema migrations, tracked with `PRAGMA user_version` (ARCHITECTURE.md §7).
 * Migration N moves the database from version N-1 to N.
 * Never edit a migration that has shipped; add a new one instead.
 */
const migrations: readonly string[] = [
  // 1: initial cache tables
  `
  CREATE TABLE pokemon_index (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
  CREATE INDEX idx_pokemon_index_name ON pokemon_index (name COLLATE NOCASE);

  CREATE TABLE pokemon (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    hp INTEGER NOT NULL, attack INTEGER NOT NULL, defense INTEGER NOT NULL,
    sp_atk INTEGER NOT NULL, sp_def INTEGER NOT NULL, speed INTEGER NOT NULL,
    total INTEGER NOT NULL,
    artwork_url TEXT, artwork_shiny_url TEXT,
    fetched_at INTEGER NOT NULL
  );
  CREATE INDEX idx_pokemon_total ON pokemon (total);

  CREATE TABLE pokemon_types (
    pokemon_id INTEGER NOT NULL REFERENCES pokemon(id),
    slot INTEGER NOT NULL,
    type TEXT NOT NULL,
    PRIMARY KEY (pokemon_id, slot)
  );
  CREATE INDEX idx_pokemon_types_type ON pokemon_types (type);

  CREATE TABLE species (id INTEGER PRIMARY KEY, evolution_chain_id INTEGER NOT NULL, fetched_at INTEGER NOT NULL);
  CREATE TABLE evolution_chain (id INTEGER PRIMARY KEY, tree_json TEXT NOT NULL, fetched_at INTEGER NOT NULL);
  `,
];

export const LATEST_VERSION = migrations.length;

export async function migrate(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;

  while (version < LATEST_VERSION) {
    const next = version + 1;
    const sql = migrations[version];
    // Each step runs in a transaction, so a failed step leaves the old version intact.
    await db.withTransactionAsync(async () => {
      await db.execAsync(sql);
      // PRAGMA does not accept bound parameters; `next` is a number we control.
      await db.execAsync(`PRAGMA user_version = ${next}`);
    });
    version = next;
  }
}
