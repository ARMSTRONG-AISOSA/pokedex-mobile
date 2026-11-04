/**
 * Versioned AsyncStorage keys (ARCHITECTURE.md §7).
 * If a value's shape changes, bump its version and migrate or reset it.
 */
export const storageKeys = {
  favorites: 'pokedex:v1:favorites',
  team: 'pokedex:v1:team',
  settings: 'pokedex:v1:settings',
} as const;

export type StorageKey = (typeof storageKeys)[keyof typeof storageKeys];
