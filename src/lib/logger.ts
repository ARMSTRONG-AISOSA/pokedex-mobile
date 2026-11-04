/**
 * The one place the app logs from (ARCHITECTURE.md §8.5).
 * Logs only in development. Crash reporting can plug in here later.
 * Never pass user-typed text to the logger.
 */

type Context = Record<string, unknown>;

export const logger = {
  info(message: string, context?: Context) {
    if (__DEV__) console.log(`[info] ${message}`, context ?? '');
  },
  warn(message: string, context?: Context) {
    if (__DEV__) console.warn(`[warn] ${message}`, context ?? '');
  },
  error(message: string, error?: unknown, context?: Context) {
    if (__DEV__) console.error(`[error] ${message}`, error, context ?? '');
  },
};
