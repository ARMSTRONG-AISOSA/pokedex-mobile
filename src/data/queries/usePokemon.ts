import { useQuery } from '@tanstack/react-query';

import { getPokemon } from '@/data/db/pokemonRepo';

import { queryKeys } from './keys';

/** One Pokémon. Usually already in the cache from the list, so the detail header shows instantly. */
export function usePokemon(id: number) {
  return useQuery({
    queryKey: queryKeys.pokemon(id),
    queryFn: () => getPokemon(id),
    enabled: Number.isInteger(id) && id > 0,
  });
}
