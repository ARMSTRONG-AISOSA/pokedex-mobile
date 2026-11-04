import { useQuery } from '@tanstack/react-query';

import { getEvolutionTree } from '@/data/db/evolutionRepo';

import { queryKeys } from './keys';

/** The evolution tree containing this species. Needs two requests the first time. */
export function useEvolutionChain(speciesId: number) {
  return useQuery({
    queryKey: queryKeys.evolution(speciesId),
    queryFn: () => getEvolutionTree(speciesId),
    enabled: Number.isInteger(speciesId) && speciesId > 0,
  });
}
