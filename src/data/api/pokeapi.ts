import { cleanFlavorText, generationLabel, type PokemonAbout } from '@/domain/about';
import { buildEvolutionTree, idFromUrl } from '@/domain/evolution';
import { titleCase } from '@/domain/names';
import { isTypeName, type EvolutionNode, type Pokemon, type Stats } from '@/domain/types';
import { z } from 'zod';

import { AppError } from '@/lib/errors';

import { fetchJson, postJson } from './client';
import {
  evolutionChainSchema,
  pokemonSchema,
  speciesListSchema,
  speciesSchema,
  aboutSchema,
  summarySchema,
  type PokemonResponse,
} from './schemas';

export const GRAPHQL_URL = 'https://graphql.pokeapi.co/v1beta2';
const SUMMARY_TIMEOUT_MS = 45_000; // one larger response; allow for slow connections

const ARTWORK_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

/** Official artwork URLs follow a fixed pattern by Pokédex number (checked 2026-11-04 for #25 and #1025). */
export function artworkUrls(id: number) {
  return { artworkUrl: `${ARTWORK_BASE}/${id}.png`, artworkShinyUrl: `${ARTWORK_BASE}/shiny/${id}.png` };
}

const STAT_KEYS: Record<string, keyof Stats> = {
  hp: 'hp',
  attack: 'attack',
  defense: 'defense',
  'special-attack': 'spAtk',
  'special-defense': 'spDef',
  speed: 'speed',
};

/**
 * API shape → app shape. Pure, so it is tested with saved responses.
 * Uses the species name ("giratina"), not the default form's name ("giratina-altered").
 */
export function toPokemon(raw: PokemonResponse): Pokemon {
  const artwork = raw.sprites.other?.['official-artwork'];
  return buildPokemon(raw.id, raw.species.name, raw.types, raw.stats, {
    artworkUrl: artwork?.front_default ?? null,
    artworkShinyUrl: artwork?.front_shiny ?? null,
  });
}

function buildPokemon(
  id: number,
  name: string,
  rawTypes: readonly { slot: number; type: { name: string } }[],
  rawStats: readonly { base_stat: number; stat: { name: string } }[],
  artwork: { artworkUrl: string | null; artworkShinyUrl: string | null },
): Pokemon {
  const stats: Partial<Stats> = {};
  for (const s of rawStats) {
    const key = STAT_KEYS[s.stat.name];
    if (key) stats[key] = s.base_stat;
  }
  const missing = Object.values(STAT_KEYS).filter((k) => stats[k] === undefined);
  if (missing.length > 0) {
    throw new AppError('PARSE', `Pokémon ${id} is missing stats: ${missing.join(', ')}`);
  }

  const types = [...rawTypes]
    .sort((a, b) => a.slot - b.slot)
    .map((t) => t.type.name)
    .filter(isTypeName);
  if (types.length === 0) {
    throw new AppError('PARSE', `Pokémon ${id} has no known type`);
  }

  return {
    id,
    name,
    types,
    stats: stats as Stats, // every key checked above
    ...artwork,
  };
}

const SUMMARY_QUERY = `query PokedexSummary {
  pokemon: pokemonspecies(order_by: {id: asc}) {
    id
    name
    pokemons(where: {is_default: {_eq: true}}) {
      pokemontypes { slot type { name } }
      pokemonstats { base_stat stat { name } }
    }
  }
}`;

/**
 * Every species with its types and base stats, in one GraphQL request
 * (about 25 KB compressed). Lets sort, filter and search cover all Pokémon (D-021).
 */
export async function fetchSummary(): Promise<Pokemon[]> {
  const body = await postJson(GRAPHQL_URL, { query: SUMMARY_QUERY }, summarySchema, {
    timeoutMs: SUMMARY_TIMEOUT_MS,
  });
  if (!body.data || body.errors?.length) {
    throw new AppError('SERVER', `GraphQL error: ${body.errors?.[0]?.message ?? 'no data'}`, {
      retryable: true,
    });
  }
  const list = body.data.pokemon.flatMap((species) => {
    const form = species.pokemons[0];
    if (!form) return []; // no default form listed; skip rather than fail the whole list
    return [buildPokemon(species.id, species.name, form.pokemontypes, form.pokemonstats, artworkUrls(species.id))];
  });
  if (list.length === 0) throw new AppError('PARSE', 'GraphQL summary was empty');
  return list;
}

/** How many species exist (1025 on 2026-11-04). Their ids run 1…count with no gaps. */
export async function fetchSpeciesCount(): Promise<number> {
  const data = await fetchJson('/pokemon-species?limit=1', speciesListSchema);
  return data.count;
}

/** Every species name and id, for searching by name offline. One request, about 60 KB. */
export async function fetchSpeciesIndex(count: number): Promise<{ id: number; name: string }[]> {
  const data = await fetchJson(`/pokemon-species?limit=${count}`, speciesListSchema);
  return data.results.map((r) => ({ id: idFromUrl(r.url), name: r.name }));
}

export async function fetchPokemon(id: number): Promise<Pokemon> {
  return toPokemon(await fetchJson(`/pokemon/${id}`, pokemonSchema));
}

/** The evolution chain id for a species, or null if PokéAPI has none. */
export async function fetchEvolutionChainId(speciesId: number): Promise<number | null> {
  const species = await fetchJson(`/pokemon-species/${speciesId}`, speciesSchema);
  return species.evolution_chain ? idFromUrl(species.evolution_chain.url) : null;
}

export async function fetchEvolutionTree(chainId: number): Promise<EvolutionNode> {
  const data = await fetchJson(`/evolution-chain/${chainId}`, evolutionChainSchema);
  return buildEvolutionTree(data.chain);
}

const ABOUT_QUERY = `query About($id: Int!) {
  species: pokemonspecies(where: {id: {_eq: $id}}) {
    id
    name
    is_baby
    generation { name }
    names: pokemonspeciesnames(where: {language: {name: {_eq: "en"}}}) { genus }
    entries: pokemonspeciesflavortexts(where: {language: {name: {_eq: "en"}}}, order_by: {version_id: desc}, limit: 1) { flavor_text }
    pokemons(where: {is_default: {_eq: true}}) {
      height
      weight
      pokemonabilities(order_by: {slot: asc}) { is_hidden ability { name } }
    }
  }
}`;

/** API shape → app shape for the About section. Height is in decimetres, weight in hectograms. */
export function toAbout(body: unknown): PokemonAbout {
  const parsed = aboutSchema.safeParse(body);
  if (!parsed.success) throw new AppError('PARSE', 'Unexpected About response', { retryable: false, cause: parsed.error });
  const { data, errors } = parsed.data;
  if (!data || errors?.length) {
    throw new AppError('SERVER', `GraphQL error: ${errors?.[0]?.message ?? 'no data'}`, { retryable: true });
  }
  const species = data.species[0];
  if (!species) throw new AppError('NOT_FOUND', 'No such species');
  const form = species.pokemons[0];
  return {
    genus: species.names[0]?.genus ?? null,
    flavorText: species.entries[0] ? cleanFlavorText(species.entries[0].flavor_text) : null,
    generation: species.generation ? generationLabel(species.generation.name) : null,
    isBaby: species.is_baby,
    heightM: form?.height != null ? form.height / 10 : null,
    weightKg: form?.weight != null ? form.weight / 10 : null,
    abilities: (form?.pokemonabilities ?? []).flatMap((a) =>
      a.ability ? [{ name: titleCase(a.ability.name), hidden: a.is_hidden }] : [],
    ),
  };
}

/** Category, Pokédex entry, height, weight, generation and abilities for one species. */
export async function fetchAbout(speciesId: number): Promise<PokemonAbout> {
  // The schema is permissive here; `toAbout` does the real check and error mapping.
  const body = await postJson(GRAPHQL_URL, { query: ABOUT_QUERY, variables: { id: speciesId } }, z.unknown());
  return toAbout(body);
}
