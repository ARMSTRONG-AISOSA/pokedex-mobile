import { onlineManager, QueryClient, type InfiniteData } from '@tanstack/react-query';
import * as Network from 'expo-network';

import type { PokemonPage } from '@/data/db/pokemonRepo';
import type { Pokemon } from '@/domain/types';
import { onDataRefreshed } from '@/data/events';
import { isAppError } from '@/lib/errors';

import { queryKeys } from './keys';

/** Defaults from ARCHITECTURE.md §8.3. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // Pokémon data does not change
      gcTime: 24 * 60 * 60 * 1000,
      retry: (failureCount, error) => isAppError(error) && error.retryable && failureCount < 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    },
  },
});

/**
 * Pause queries while the phone is offline and resume when it reconnects.
 * `isInternetReachable` can be undefined while unknown; treat that as online
 * and let the request itself fail if it must.
 */
// Skipped during web server rendering, where there is no network to watch.
if (typeof window !== 'undefined') {
  onlineManager.setEventListener((setOnline) => {
    const subscription = Network.addNetworkStateListener((state) => {
      setOnline(state.isConnected !== false && state.isInternetReachable !== false);
    });
    return () => subscription.remove();
  });
}

/**
 * Data older than 30 days is shown right away and refreshed in the background
 * (data/cache.ts). When a refresh lands, put the new copy on screen.
 */
onDataRefreshed((event) => {
  switch (event.kind) {
    case 'pokemon': {
      const { pokemon } = event;
      queryClient.setQueryData(queryKeys.pokemon(pokemon.id), pokemon);
      queryClient.setQueryData<Pokemon[]>(queryKeys.allPokemon, (list) =>
        list?.map((p) => (p.id === pokemon.id ? pokemon : p)),
      );
      queryClient.setQueryData<InfiniteData<PokemonPage>>(queryKeys.pokemonPages, (data) =>
        data
          ? {
              ...data,
              pages: data.pages.map((page) => ({
                ...page,
                items: page.items.map((p) => (p.id === pokemon.id ? pokemon : p)),
              })),
            }
          : data,
      );
      break;
    }
    case 'all':
      queryClient.setQueryData(queryKeys.allPokemon, event.list);
      for (const pokemon of event.list) queryClient.setQueryData(queryKeys.pokemon(pokemon.id), pokemon);
      break;
    case 'about':
      queryClient.setQueryData(queryKeys.about(event.speciesId), event.about);
      break;
    case 'evolution':
      // Every member of the family shares the tree, so refresh them all (from SQLite, no network).
      queryClient.invalidateQueries({ queryKey: ['evolution'] });
      break;
    case 'speciesCount':
      // New Pokémon may exist; reload the pages (mostly from SQLite) to pick up the new total.
      queryClient.invalidateQueries({ queryKey: queryKeys.pokemonPages });
      break;
  }
});
