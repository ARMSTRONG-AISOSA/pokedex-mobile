import { z } from 'zod';

import type { ChainLinkInput, EvolutionDetailInput } from '@/domain/evolution';

/**
 * zod schemas for the PokéAPI responses we use. They list only the fields we
 * read; zod drops the rest. If PokéAPI changes a field we rely on, parsing
 * fails with a PARSE error instead of the app crashing later.
 */

const namedRef = z.object({ name: z.string(), url: z.string() });

/** `/pokemon-species?limit=N` */
export const speciesListSchema = z.object({
  count: z.number().int().nonnegative(),
  results: z.array(namedRef),
});

/** `/pokemon/{id}` */
export const pokemonSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  species: namedRef,
  types: z
    .array(z.object({ slot: z.number().int(), type: z.object({ name: z.string() }) }))
    .min(1),
  stats: z.array(z.object({ base_stat: z.number().int(), stat: z.object({ name: z.string() }) })),
  sprites: z.object({
    other: z
      .object({
        'official-artwork': z
          .object({
            front_default: z.string().nullable().optional(),
            front_shiny: z.string().nullable().optional(),
          })
          .optional(),
      })
      .optional(),
  }),
});
export type PokemonResponse = z.infer<typeof pokemonSchema>;

/** `/pokemon-species/{id}` */
export const speciesSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  evolution_chain: z.object({ url: z.string() }).nullable(),
});
export type SpeciesResponse = z.infer<typeof speciesSchema>;

const optionalRef = z.object({ name: z.string(), url: z.string().optional() }).nullish();

const evolutionDetailSchema: z.ZodType<EvolutionDetailInput> = z.object({
  trigger: optionalRef,
  min_level: z.number().nullish(),
  item: optionalRef,
  held_item: optionalRef,
  min_happiness: z.number().nullish(),
  min_affection: z.number().nullish(),
  min_beauty: z.number().nullish(),
  time_of_day: z.string().nullish(),
  known_move: optionalRef,
  known_move_type: optionalRef,
  location: optionalRef,
  gender: z.number().nullish(),
  needs_overworld_rain: z.boolean().nullish(),
  turn_upside_down: z.boolean().nullish(),
  relative_physical_stats: z.number().nullish(),
  party_species: optionalRef,
  party_type: optionalRef,
  trade_species: optionalRef,
  is_default: z.boolean().nullish(),
});

const chainLinkSchema: z.ZodType<ChainLinkInput> = z.lazy(() =>
  z.object({
    species: namedRef,
    is_baby: z.boolean().optional(),
    evolution_details: z.array(evolutionDetailSchema),
    evolves_to: z.array(chainLinkSchema),
  }),
);

/** `/evolution-chain/{id}` */
export const evolutionChainSchema = z.object({
  id: z.number().int().positive(),
  chain: chainLinkSchema,
});
