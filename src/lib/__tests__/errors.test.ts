import { AppError, errorCopy } from '@/lib/errors';

// Wording from DESIGN.md §10: say what happened and what to do, never just "Something went wrong".
describe('errorCopy', () => {
  it.each([
    ['NETWORK', 'No connection', 'Check your internet and try again.'],
    ['RATE_LIMITED', 'Too many requests', 'Wait a moment, then try again.'],
    ['SERVER', 'Server not responding', 'The Pokémon server isn’t responding. Try again in a minute.'],
    ['PARSE', 'Data couldn’t be read', 'This Pokémon’s data couldn’t be read. Try again, or open another one.'],
  ] as const)('%s → “%s”', (code, title, message) => {
    expect(errorCopy(new AppError(code, 'test'))).toEqual({ title, message });
  });

  it('every code has its own title', () => {
    const codes = ['NETWORK', 'NOT_FOUND', 'RATE_LIMITED', 'SERVER', 'PARSE', 'STORAGE', 'UNKNOWN'] as const;
    const titles = codes.map((code) => errorCopy(new AppError(code, 'test')).title);
    expect(new Set(titles).size).toBe(codes.length);
  });

  it('a plain crash (not an AppError) gets the generic copy, not “Something went wrong”', () => {
    const copy = errorCopy(new TypeError('x is undefined'));
    expect(copy.title).toBe('This screen stopped working');
    expect(`${copy.title} ${copy.message}`).not.toMatch(/something went wrong/i);
  });
});
