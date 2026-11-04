import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

import { getPokemonPage } from '@/data/db/pokemonRepo';

import { PAGE_SIZE, queryKeys } from './keys';

/**
 * The Pokédex 20 at a time. Since D-021 this is only the fallback for when the
 * one-request summary fails (e.g. the GraphQL beta is down).
 */
export function usePokemonPages({ enabled = true }: { enabled?: boolean } = {}) {
  const queryClient = useQueryClient();
  return useInfiniteQuery({
    queryKey: queryKeys.pokemonPages,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const page = await getPokemonPage(pageParam, PAGE_SIZE);
      // Seed each Pokémon's own query so opening its detail screen needs no request.
      for (const pokemon of page.items) {
        queryClient.setQueryData(queryKeys.pokemon(pokemon.id), pokemon);
      }
      return page;
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    enabled,
  });
}
