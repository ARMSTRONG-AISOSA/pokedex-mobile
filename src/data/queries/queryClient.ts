import { onlineManager, QueryClient } from '@tanstack/react-query';
import * as Network from 'expo-network';

import { isAppError } from '@/lib/errors';

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
onlineManager.setEventListener((setOnline) => {
  const subscription = Network.addNetworkStateListener((state) => {
    setOnline(state.isConnected !== false && state.isInternetReachable !== false);
  });
  return () => subscription.remove();
});
