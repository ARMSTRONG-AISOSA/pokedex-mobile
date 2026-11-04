import { useAllPokemon } from '@/data/queries/useAllPokemon';
import { usePokemonPages } from '@/data/queries/usePokemonPages';
import { filterPokemon, sortPokemon, type DexFilter, type SortKey } from '@/domain/sorting';
import type { Pokemon } from '@/domain/types';

type Options = DexFilter & { sortKey: SortKey; ascending: boolean };

export type DexList = {
  status: 'loading' | 'error' | 'ready';
  items: Pokemon[];
  error: unknown;
  /**
   * True when the full summary failed and we fell back to 20-per-page loading:
   * sort and filters then cover only what has been loaded.
   */
  partial: boolean;
  loadedCount: number;
  loadMore?: () => void;
  isLoadingMore: boolean;
  retry: () => void;
};

/**
 * The list screen's data: every Pokémon from the one-request summary (D-021),
 * or page by page if that fails, then filtered and sorted.
 */
export function useDexList({ type, query, sortKey, ascending }: Options): DexList {
  const all = useAllPokemon();
  const fallback = all.isError;
  const pages = usePokemonPages({ enabled: fallback });

  const source: Pokemon[] | undefined = all.data ?? (fallback ? pages.data?.pages.flatMap((p) => p.items) : undefined);
  const items = source ? sortPokemon(filterPokemon(source, { type, query }), sortKey, ascending) : [];

  const status = source ? 'ready' : fallback && pages.isError ? 'error' : 'loading';

  return {
    status,
    items,
    error: pages.error ?? all.error,
    partial: fallback && source !== undefined,
    loadedCount: source?.length ?? 0,
    loadMore:
      fallback && pages.hasNextPage && !pages.isFetchingNextPage ? () => void pages.fetchNextPage() : undefined,
    isLoadingMore: pages.isFetchingNextPage,
    retry: () => {
      void all.refetch();
      if (fallback) void pages.refetch();
    },
  };
}
