import { z } from 'zod';

import { API_BASE, fetchJson, REQUEST_TIMEOUT_MS } from '@/data/api/client';

const schema = z.object({ id: z.number() });

const realFetch = globalThis.fetch;
const mockFetch = jest.fn();

beforeEach(() => {
  mockFetch.mockReset();
  globalThis.fetch = mockFetch as unknown as typeof fetch;
});

afterAll(() => {
  globalThis.fetch = realFetch;
});

function respond(status: number, body: unknown, { badJson = false } = {}) {
  mockFetch.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => {
      if (badJson) throw new SyntaxError('Unexpected token <');
      return body;
    },
  });
}

describe('fetchJson', () => {
  it('returns parsed data and calls the PokéAPI base URL', async () => {
    respond(200, { id: 25, extra: 'ignored' });
    await expect(fetchJson('/pokemon/25', schema)).resolves.toEqual({ id: 25 });
    expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/pokemon/25`, expect.any(Object));
  });

  it.each([
    [404, 'NOT_FOUND', false],
    [429, 'RATE_LIMITED', true],
    [500, 'SERVER', true],
    [503, 'SERVER', true],
    [418, 'UNKNOWN', false],
  ])('HTTP %i → %s (retryable: %p)', async (status, code, retryable) => {
    respond(status, {});
    await expect(fetchJson('/x', schema)).rejects.toMatchObject({ code, retryable });
  });

  it('no connection → NETWORK, retryable', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Network request failed'));
    await expect(fetchJson('/x', schema)).rejects.toMatchObject({ code: 'NETWORK', retryable: true });
  });

  it('a body that is not JSON → PARSE', async () => {
    respond(200, null, { badJson: true });
    await expect(fetchJson('/x', schema)).rejects.toMatchObject({ code: 'PARSE', retryable: false });
  });

  it('JSON in the wrong shape → PARSE', async () => {
    respond(200, { id: 'twenty-five' });
    await expect(fetchJson('/x', schema)).rejects.toMatchObject({ code: 'PARSE' });
  });

  it('gives up after the timeout → NETWORK', async () => {
    jest.useFakeTimers();
    mockFetch.mockImplementationOnce(
      (_url: string, init: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          init.signal.addEventListener('abort', () => reject(new Error('aborted')));
        }),
    );
    const pending = fetchJson('/slow', schema);
    jest.advanceTimersByTime(REQUEST_TIMEOUT_MS + 1);
    await expect(pending).rejects.toMatchObject({ code: 'NETWORK', message: 'Timed out: /slow' });
    jest.useRealTimers();
  });

  it('never has more than 5 requests in flight', async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    mockFetch.mockImplementation(async () => {
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((r) => setTimeout(r, 5));
      inFlight -= 1;
      return { ok: true, status: 200, json: async () => ({ id: 1 }) };
    });
    await Promise.all(Array.from({ length: 12 }, () => fetchJson('/x', schema)));
    expect(mockFetch).toHaveBeenCalledTimes(12);
    expect(maxInFlight).toBe(5);
  });
});
