import { z } from 'zod';

import { storageKeys } from './keys';
import { readJson, writeJson } from './kv';

/** Saved Pokémon, as a list of Pokédex ids. */
export const favoritesSchema = z.array(z.number().int().positive());

export function loadFavorites(): Promise<number[]> {
  return readJson(storageKeys.favorites, favoritesSchema, []);
}

export function saveFavorites(ids: number[]): Promise<void> {
  return writeJson(storageKeys.favorites, ids);
}
