import { z } from 'zod';

import { fetchAbout } from '@/data/api/pokeapi';
import { readThrough } from '@/data/cache';
import { emitDataRefreshed } from '@/data/events';
import type { PokemonAbout } from '@/domain/about';
import { logger } from '@/lib/logger';

import { getDatabase } from './database';

/** Checks our own saved JSON too, so an old or damaged row is refetched instead of crashing. */
const savedAboutSchema: z.ZodType<PokemonAbout> = z.object({
  genus: z.string().nullable(),
  flavorText: z.string().nullable(),
  generation: z.string().nullable(),
  isBaby: z.boolean(),
  heightM: z.number().nullable(),
  weightKg: z.number().nullable(),
  abilities: z.array(z.object({ name: z.string(), hidden: z.boolean() })),
});

/** The About section for one species: SQLite first, one small GraphQL request when missing or older than 30 days. */
export function getAbout(speciesId: number): Promise<PokemonAbout> {
  return readThrough({
    key: `about:${speciesId}`,
    read: async () => {
      const db = await getDatabase();
      if (!db) return null;
      const row = await db.getFirstAsync<{ about_json: string; fetched_at: number }>(
        'SELECT about_json, fetched_at FROM pokemon_about WHERE id = ?',
        speciesId,
      );
      if (!row) return null;
      try {
        const parsed = savedAboutSchema.safeParse(JSON.parse(row.about_json));
        if (parsed.success) return { value: parsed.data, fetchedAt: row.fetched_at };
      } catch {
        // fall through to refetch
      }
      logger.warn('Saved About data is unreadable, refetching', { speciesId });
      return null;
    },
    fetch: () => fetchAbout(speciesId),
    write: async (about, fetchedAt) => {
      const db = await getDatabase();
      if (!db) return;
      await db.runAsync(
        'INSERT OR REPLACE INTO pokemon_about (id, about_json, fetched_at) VALUES (?, ?, ?)',
        speciesId,
        JSON.stringify(about),
        fetchedAt,
      );
    },
    onRefreshed: (about) => emitDataRefreshed({ kind: 'about', speciesId, about }),
  });
}
