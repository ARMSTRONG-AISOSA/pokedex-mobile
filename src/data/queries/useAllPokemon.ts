import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getAllPokemon } from '@/data/db/pokemonRepo';

import { queryKeys } from './keys';

/** Every Pokémon (summary data), for the list's sort, filter and search. */
export function useAllPokemon() {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: queryKeys.allPokemon,
    queryFn: async () => {
      const list = await getAllPokemon();
      // Seed each Pokémon's own query so the detail screen opens with no request.
      for (const pokemon of list) queryClient.setQueryData(queryKeys.pokemon(pokemon.id), pokemon);
      return list;
    },
  });
}
