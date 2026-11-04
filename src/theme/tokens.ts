/**
 * Color tokens from DESIGN.md §2. React Native has no CSS variables, so the
 * light and dark palettes are plain objects; `useTheme()` picks one.
 */

export type ColorScheme = 'light' | 'dark';

export type Palette = {
  bg: string;
  surface: string;
  field: string;
  ink: string;
  muted: string;
  line: string;
  rule: string;
  bad: string;
  heart: string;
  allChipOn: string;
};

export const palettes: Record<ColorScheme, Palette> = {
  light: {
    bg: '#ffffff',
    surface: '#ffffff',
    field: '#e9f0ee',
    ink: '#13222b',
    muted: '#55666e',
    line: '#d3dfdc',
    rule: '#94a9a9',
    bad: '#b3261e',
    heart: '#d63a5c',
    allChipOn: '#13222b',
  },
  dark: {
    bg: '#0e1618',
    surface: '#162226',
    field: '#162226',
    ink: '#e8f1f0',
    muted: '#94a7ac',
    line: '#263a3f',
    rule: '#4a666b',
    bad: '#ff9a90',
    heart: '#d63a5c',
    allChipOn: '#3b5a64',
  },
};

export const TYPE_NAMES = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
] as const;

export type TypeName = (typeof TYPE_NAMES)[number];

/**
 * `c` = bright (dots, stat bars, tints).
 * `d` = deep (headers, selected chips); white text on `d` is at least 4.5:1.
 * Same in light and dark mode. Approved by the user on 2026-11-04 (OD-5).
 */
export const typeColors: Record<TypeName, { c: string; d: string }> = {
  normal: { c: '#9a9a8a', d: '#636355' },
  fire: { c: '#ee6b3a', d: '#b8431a' },
  water: { c: '#3b8fe0', d: '#1f68b8' },
  electric: { c: '#f2c230', d: '#8a6500' },
  grass: { c: '#4caf6a', d: '#2f7d4a' },
  ice: { c: '#6fc7d6', d: '#2a7f90' },
  fighting: { c: '#d64236', d: '#c03028' },
  poison: { c: '#9b59b6', d: '#6f3a86' },
  ground: { c: '#d4a065', d: '#9a6b3f' },
  flying: { c: '#7b9de0', d: '#4a6cb8' },
  psychic: { c: '#e85d8f', d: '#b32f66' },
  bug: { c: '#9bbf3a', d: '#5f7d1c' },
  rock: { c: '#a8a07a', d: '#6e6742' },
  ghost: { c: '#7a62a8', d: '#523f80' },
  dragon: { c: '#5b6ee0', d: '#3a47b0' },
  dark: { c: '#6a5a55', d: '#3d3431' },
  steel: { c: '#8da5b5', d: '#4f6878' },
  fairy: { c: '#e391d4', d: '#a3449a' },
};

/** Launch screen colors. They do not change with light/dark mode. */
export const brand = {
  launchBg: '#13222b',
  ballTop: '#e8453c',
  ballBottom: '#f4f7f6',
  belt: '#0b1417',
  wordmark: '#ffffff',
} as const;

/** DESIGN.md §4 */
export const layout = {
  screenPadding: 20,
  gridGap: 12,
  detailSectionGap: 30,
  minTouch: 44,
} as const;
