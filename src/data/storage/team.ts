import { z } from 'zod';

import { TEAM_SIZE } from '@/domain/team';

import { storageKeys } from './keys';
import { readJson, writeJson } from './kv';

export { TEAM_SIZE };

/** The team, as up to six Pokédex ids. */
export const teamSchema = z.array(z.number().int().positive()).max(TEAM_SIZE);

export function loadTeam(): Promise<number[]> {
  return readJson(storageKeys.team, teamSchema, []);
}

export function saveTeam(ids: number[]): Promise<void> {
  return writeJson(storageKeys.team, ids);
}
