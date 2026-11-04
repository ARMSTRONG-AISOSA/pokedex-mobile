/**
 * Replacement for CSS `color-mix(in srgb, a p%, b)`.
 * Blends two `#rrggbb` colors channel by channel in sRGB space.
 */

function parseHex(hex: string): [number, number, number] {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) {
    throw new Error(`mix(): expected a #rrggbb color, got "${hex}"`);
  }
  const n = parseInt(match[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex(channel: number): string {
  return Math.round(channel).toString(16).padStart(2, '0');
}

/**
 * @param a first color, e.g. a type's bright color
 * @param b second color, e.g. the surface color
 * @param percentA how much of `a` to use, 0 to 100
 */
export function mix(a: string, b: string, percentA: number): string {
  const t = Math.min(Math.max(percentA, 0), 100) / 100;
  const ca = parseHex(a);
  const cb = parseHex(b);
  return `#${ca.map((v, i) => toHex(v * t + cb[i] * (1 - t))).join('')}`;
}

/** `#rrggbb` plus an opacity (0 to 1) as `rgba(...)`. */
export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
