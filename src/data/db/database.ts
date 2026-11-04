import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import { logger } from '@/lib/logger';

import { migrate } from './migrations';

const DATABASE_NAME = 'pokedex.db';

let opening: Promise<SQLiteDatabase | null> | null = null;

/** Opening and migrating normally takes milliseconds; past this we stop waiting. */
const OPEN_TIMEOUT_MS = 8000;

async function openAndMigrate(): Promise<SQLiteDatabase> {
  const db = await openDatabaseAsync(DATABASE_NAME);
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await migrate(db);
  return db;
}

async function open(): Promise<SQLiteDatabase | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Database did not open within ${OPEN_TIMEOUT_MS} ms`)), OPEN_TIMEOUT_MS);
  });
  try {
    // A hung open (not just a failed one) must not keep the app on the splash screen forever.
    return await Promise.race([openAndMigrate(), timeout]);
  } catch (error) {
    // The cache is an optimization. Without it the app runs network-only
    // (ARCHITECTURE.md §8.2) and shows an "Offline cache unavailable" notice.
    logger.error('Database unavailable, running without the offline cache', error);
    return null;
  } finally {
    clearTimeout(timer);
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
