/** Typed errors (ARCHITECTURE.md §8.1). */

export type ErrorCode =
  | 'NETWORK' // no connection, DNS, timeout
  | 'NOT_FOUND' // 404
  | 'RATE_LIMITED' // 429
  | 'SERVER' // 5xx
  | 'PARSE' // response did not match the zod schema
  | 'STORAGE' // SQLite / AsyncStorage failure
  | 'UNKNOWN';

export type AppErrorOptions = { retryable: boolean; cause?: unknown };

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly options: AppErrorOptions;

  constructor(code: ErrorCode, message: string, options: AppErrorOptions = { retryable: false }) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.options = options;
  }

  get retryable(): boolean {
    return this.options.retryable;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/** Wrap anything thrown into an AppError, keeping AppErrors as they are. */
export function toAppError(error: unknown, fallbackCode: ErrorCode = 'UNKNOWN'): AppError {
  if (isAppError(error)) return error;
  const message = error instanceof Error ? error.message : String(error);
  return new AppError(fallbackCode, message, { retryable: false, cause: error });
}

/** User-facing copy for each error (DESIGN.md §10). */
export function errorCopy(error: unknown): { title: string; message: string } {
  const code = isAppError(error) ? error.code : 'UNKNOWN';
  switch (code) {
    case 'NETWORK':
      return { title: 'No connection', message: 'Check your internet and try again.' };
    case 'RATE_LIMITED':
      return { title: 'Too many requests', message: 'Wait a moment, then try again.' };
    case 'SERVER':
      return { title: 'Server not responding', message: 'The Pokémon server isn’t responding. Try again in a minute.' };
    case 'NOT_FOUND':
      return { title: 'Pokémon not found', message: 'This Pokémon isn’t in the Pokédex. Go back and pick another one.' };
    case 'PARSE':
      return { title: 'Data couldn’t be read', message: 'This Pokémon’s data couldn’t be read. Try again, or open another one.' };
    case 'STORAGE':
      return { title: 'Couldn’t save', message: 'Your change wasn’t saved. Try again.' };
    default:
      return { title: 'This screen stopped working', message: 'Try again. If it keeps happening, restart the app.' };
  }
}
