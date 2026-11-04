/** Query keys in one place, so cache updates and hooks always agree. */
export const queryKeys = {
  pokemon: (id: number) => ['pokemon', id] as const,
  allPokemon: ['pokemon-all'] as const,
  pokemonPages: ['pokemon-pages'] as const,
  evolution: (speciesId: number) => ['evolution', speciesId] as const,
  search: (query: string) => ['search', query] as const,
};

export const PAGE_SIZE = 20;
