import type { z } from 'zod';

import { AppError } from '@/lib/errors';
import { createLimiter } from '@/lib/limit';
import { logger } from '@/lib/logger';

export const API_BASE = 'https://pokeapi.co/api/v2';
export const REQUEST_TIMEOUT_MS = 10_000;

/** PokéAPI's fair use policy: keep the number of requests in flight low (ARCHITECTURE.md §6). */
const limit = createLimiter(5);

/**
 * GET a PokéAPI path and check the response shape with zod.
 * Every failure becomes an `AppError` (ARCHITECTURE.md §8.2):
 * no connection or timeout → NETWORK, 404 → NOT_FOUND, 429 → RATE_LIMITED,
 * 5xx → SERVER, bad JSON or wrong shape → PARSE.
 */
export function fetchJson<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  return limit(() => request(path, schema));
}

/** POST a JSON body (used for PokéAPI's GraphQL endpoint). Same error mapping as `fetchJson`. */
export function postJson<T>(
  url: string,
  body: unknown,
  schema: z.ZodType<T>,
  { timeoutMs = REQUEST_TIMEOUT_MS }: { timeoutMs?: number } = {},
): Promise<T> {
  return limit(() =>
    request(url, schema, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      timeoutMs,
    }),
  );
}

type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
};

async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  { timeoutMs = REQUEST_TIMEOUT_MS, ...init }: RequestOptions = {},
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: { Accept: 'application/json', ...init.headers },
    });
  } catch (error) {
    const timedOut = controller.signal.aborted;
    throw new AppError('NETWORK', timedOut ? `Timed out: ${path}` : `Network failure: ${path}`, {
      retryable: true,
      cause: error,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const { status } = response;
    if (status === 404) throw new AppError('NOT_FOUND', `Not found: ${path}`);
    if (status === 429) throw new AppError('RATE_LIMITED', `Rate limited: ${path}`, { retryable: true });
    if (status >= 500) throw new AppError('SERVER', `Server error ${status}: ${path}`, { retryable: true });
    throw new AppError('UNKNOWN', `HTTP ${status}: ${path}`);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch (error) {
    throw new AppError('PARSE', `Response is not JSON: ${path}`, { retryable: false, cause: error });
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    logger.warn('Response did not match the schema', { path, issues: result.error.issues.slice(0, 5) });
    throw new AppError('PARSE', `Unexpected response shape: ${path}`, { retryable: false, cause: result.error });
  }
  return result.data;
}
