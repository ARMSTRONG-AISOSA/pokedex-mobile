import { logger } from '@/lib/logger';

/**
 * Read-through cache with a freshness limit (ARCHITECTURE.md §6, D-019).
 *
 *   saved and fresh   → return it, no network
 *   saved but old     → return it now, and refresh it in the background
 *   not saved         → fetch, save, return (errors go to the caller)
 *
 * Saving is best effort: if it fails we log and still return the data.
 * Reading is best effort too: if it fails we treat it as "not saved".
 */

/** Saved data older than this is refreshed in the background. */
export const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export type Cached<T> = { value: T; fetchedAt: number };

export function isStale(fetchedAt: number, now: number, maxAgeMs = MAX_AGE_MS): boolean {
  return now - fetchedAt > maxAgeMs;
}

type ReadThroughOptions<T> = {
  /** Unique name for this piece of data, used to avoid duplicate background refreshes. */
  key: string;
  read: () => Promise<Cached<T> | null>;
  fetch: () => Promise<T>;
  write: (value: T, fetchedAt: number) => Promise<void>;
  /** Called after a background refresh saved newer data. */
  onRefreshed?: (value: T) => void;
  now?: () => number;
  maxAgeMs?: number;
};

const refreshing = new Map<string, Promise<void>>();

export async function readThrough<T>(options: ReadThroughOptions<T>): Promise<T> {
  const { key, read, fetch, write, onRefreshed, now = Date.now, maxAgeMs = MAX_AGE_MS } = options;

  let cached: Cached<T> | null = null;
  try {
    cached = await read();
  } catch (error) {
    logger.warn('Cache read failed, using the network', { key, error });
  }

  if (cached && !isStale(cached.fetchedAt, now(), maxAgeMs)) {
    return cached.value;
  }

  if (cached) {
    refreshInBackground(key, async () => {
      const fresh = await fetch();
      await safeWrite(key, write, fresh, now());
      onRefreshed?.(fresh);
    });
    return cached.value;
  }

  const fresh = await fetch();
  await safeWrite(key, write, fresh, now());
  return fresh;
}

async function safeWrite<T>(
  key: string,
  write: (value: T, fetchedAt: number) => Promise<void>,
  value: T,
  fetchedAt: number,
) {
  try {
    await write(value, fetchedAt);
  } catch (error) {
    logger.warn('Cache write failed, continuing without saving', { key, error });
  }
}

function refreshInBackground(key: string, task: () => Promise<void>) {
  if (refreshing.has(key)) return;
  const run = task()
    .catch((error: unknown) => {
      // Offline or the server failed: keep showing the saved copy; try again next time.
      logger.info('Background refresh failed, keeping saved data', { key, error });
    })
    .finally(() => refreshing.delete(key));
  refreshing.set(key, run);
}

/** Test helper: wait for background refreshes to finish. */
export function backgroundRefreshes(): Promise<void[]> {
  return Promise.all(refreshing.values());
}
