import { backgroundRefreshes, isStale, MAX_AGE_MS, readThrough, type Cached } from '@/data/cache';
import { AppError } from '@/lib/errors';

const NOW = 1_800_000_000_000;
const FRESH = NOW - 1000; // saved a second ago
const OLD = NOW - MAX_AGE_MS - 1000; // saved just over 30 days ago

let keyCounter = 0;

/** A fake store and network, so each test can say exactly what is saved and online. */
function setup(options: { saved?: Cached<string> | null; network?: 'ok' | 'down'; readFails?: boolean; writeFails?: boolean }) {
  const store = { current: options.saved ?? null };
  const fetch = jest.fn(async () => {
    if (options.network === 'down') throw new AppError('NETWORK', 'offline', { retryable: true });
    return 'from network';
  });
  const read = jest.fn(async () => {
    if (options.readFails) throw new Error('disk error');
    return store.current;
  });
  const write = jest.fn(async (value: string, fetchedAt: number) => {
    if (options.writeFails) throw new Error('disk full');
    store.current = { value, fetchedAt };
  });
  const onRefreshed = jest.fn();
  keyCounter += 1;
  const run = () =>
    readThrough({ key: `test:${keyCounter}`, read, fetch, write, onRefreshed, now: () => NOW });
  return { run, fetch, write, onRefreshed, store };
}

describe('readThrough: the four saved/network combinations', () => {
  it('saved + online → returns saved data without a request', async () => {
    const t = setup({ saved: { value: 'saved', fetchedAt: FRESH }, network: 'ok' });
    await expect(t.run()).resolves.toBe('saved');
    expect(t.fetch).not.toHaveBeenCalled();
  });

  it('saved + offline → returns saved data, no error', async () => {
    const t = setup({ saved: { value: 'saved', fetchedAt: FRESH }, network: 'down' });
    await expect(t.run()).resolves.toBe('saved');
  });

  it('not saved + online → fetches, saves and returns', async () => {
    const t = setup({ saved: null, network: 'ok' });
    await expect(t.run()).resolves.toBe('from network');
    expect(t.store.current).toEqual({ value: 'from network', fetchedAt: NOW });
  });

  it('not saved + offline → throws the NETWORK error', async () => {
    const t = setup({ saved: null, network: 'down' });
    await expect(t.run()).rejects.toMatchObject({ code: 'NETWORK' });
  });
});

describe('readThrough: data older than 30 days', () => {
  it('returns the old copy immediately, then refreshes it in the background', async () => {
    const t = setup({ saved: { value: 'old', fetchedAt: OLD }, network: 'ok' });
    await expect(t.run()).resolves.toBe('old');
    await backgroundRefreshes();
    expect(t.store.current).toEqual({ value: 'from network', fetchedAt: NOW });
    expect(t.onRefreshed).toHaveBeenCalledWith('from network');
  });

  it('keeps the old copy, quietly, when the refresh fails', async () => {
    const t = setup({ saved: { value: 'old', fetchedAt: OLD }, network: 'down' });
    await expect(t.run()).resolves.toBe('old');
    await backgroundRefreshes();
    expect(t.store.current?.value).toBe('old');
    expect(t.onRefreshed).not.toHaveBeenCalled();
  });

  it('starts only one background refresh for the same data', async () => {
    const t = setup({ saved: { value: 'old', fetchedAt: OLD }, network: 'ok' });
    await Promise.all([t.run(), t.run(), t.run()]);
    await backgroundRefreshes();
    expect(t.fetch).toHaveBeenCalledTimes(1);
  });

  it('isStale uses the 30-day limit', () => {
    expect(isStale(FRESH, NOW)).toBe(false);
    expect(isStale(OLD, NOW)).toBe(true);
  });
});

describe('readThrough: storage failures never block the user', () => {
  it('a failed read falls through to the network', async () => {
    const t = setup({ readFails: true, network: 'ok' });
    await expect(t.run()).resolves.toBe('from network');
  });

  it('a failed save still returns the fetched data', async () => {
    const t = setup({ saved: null, network: 'ok', writeFails: true });
    await expect(t.run()).resolves.toBe('from network');
    expect(t.write).toHaveBeenCalled();
  });
});
