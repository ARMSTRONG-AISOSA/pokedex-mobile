import AsyncStorage from '@react-native-async-storage/async-storage';
import type { z } from 'zod';

import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';

import type { StorageKey } from './keys';

/**
 * Read a JSON value and check its shape.
 * Never throws: a failed read, bad JSON or a wrong shape all return `fallback`
 * (ARCHITECTURE.md §8.2). The next write overwrites the bad value.
 */
export async function readJson<T>(key: StorageKey, schema: z.ZodType<T>, fallback: T): Promise<T> {
  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(key);
  } catch (error) {
    logger.error('Storage read failed', error, { key });
    return fallback;
  }
  if (raw === null) return fallback;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    logger.warn('Stored value is not valid JSON, using fallback', { key, error });
    return fallback;
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    logger.warn('Stored value has the wrong shape, using fallback', { key, issues: result.error.issues });
    return fallback;
  }
  return result.data;
}

/** Write a JSON value. Throws `AppError('STORAGE')` so the UI can say the save failed. */
export async function writeJson(key: StorageKey, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    logger.error('Storage write failed', error, { key });
    throw new AppError('STORAGE', `Could not save ${key}`, { retryable: true, cause: error });
  }
}
