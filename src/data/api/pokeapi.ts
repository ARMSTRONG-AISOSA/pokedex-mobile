import { buildEvolutionTree, idFromUrl } from '@/domain/evolution';
import { isTypeName, type EvolutionNode, type Pokemon, type Stats } from '@/domain/types';
import { AppError } from '@/lib/errors';

import { fetchJson } from './client';
import {
  evolutionChainSchema,
  pokemonSchema,
  speciesListSchema,
  speciesSchema,
  type PokemonResponse,
} from './schemas';

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
  const stats: Partial<Stats> = {};
  for (const s of raw.stats) {
    const key = STAT_KEYS[s.stat.name];
    if (key) stats[key] = s.base_stat;
  }
  const missing = Object.values(STAT_KEYS).filter((k) => stats[k] === undefined);
  if (missing.length > 0) {
    throw new AppError('PARSE', `Pokémon ${raw.id} is missing stats: ${missing.join(', ')}`);
  }

  const types = [...raw.types]
    .sort((a, b) => a.slot - b.slot)
    .map((t) => t.type.name)
    .filter(isTypeName);
  if (types.length === 0) {
    throw new AppError('PARSE', `Pokémon ${raw.id} has no known type`);
  }

  const artwork = raw.sprites.other?.['official-artwork'];
  return {
    id: raw.id,
    name: raw.species.name,
    types,
    stats: stats as Stats, // every key checked above
    artworkUrl: artwork?.front_default ?? null,
    artworkShinyUrl: artwork?.front_shiny ?? null,
  };
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
