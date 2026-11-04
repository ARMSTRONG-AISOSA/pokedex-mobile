import { z } from 'zod';

import { storageKeys } from './keys';
import { readJson, writeJson } from './kv';

export const TEAM_SIZE = 6;

/** The team, as up to six Pokédex ids. */
export const teamSchema = z.array(z.number().int().positive()).max(TEAM_SIZE);

export function loadTeam(): Promise<number[]> {
  return readJson(storageKeys.team, teamSchema, []);
}

export function saveTeam(ids: number[]): Promise<void> {
  return writeJson(storageKeys.team, ids);
}
