import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import { logger } from '@/lib/logger';

import { migrate } from './migrations';

const DATABASE_NAME = 'pokedex.db';

let opening: Promise<SQLiteDatabase | null> | null = null;

async function open(): Promise<SQLiteDatabase | null> {
  try {
    const db = await openDatabaseAsync(DATABASE_NAME);
    await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
    await migrate(db);
    return db;
  } catch (error) {
    // The cache is an optimization. Without it the app runs network-only
    // (ARCHITECTURE.md §8.2) and shows an "Offline cache unavailable" notice.
    logger.error('Database unavailable, running without the offline cache', error);
    return null;
  }
}

/**
 * Opens and migrates the database once, then returns the same connection.
 * Resolves to `null` (never rejects) if the database could not be opened.
 */
export function getDatabase(): Promise<SQLiteDatabase | null> {
  opening ??= open();
  return opening;
}
