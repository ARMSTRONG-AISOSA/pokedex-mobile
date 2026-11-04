import { useQueries } from '@tanstack/react-query';

import { getPokemon } from '@/data/db/pokemonRepo';
import type { Pokemon } from '@/domain/types';

import { queryKeys } from './keys';

/** The team's Pokémon in slot order. Usually instant: the list summary already seeded them. */
export function useTeamMembers(ids: readonly number[]) {
  return useQueries({
    queries: ids.map((id) => ({ queryKey: queryKeys.pokemon(id), queryFn: () => getPokemon(id) })),
    combine: (results) => ({
      members: results.map((r) => r.data).filter((p): p is Pokemon => p !== undefined),
      isPending: results.some((r) => r.isPending),
      error: results.find((r) => r.isError)?.error ?? null,
      retry: () => results.forEach((r) => void r.refetch()),
    }),
  });
}
