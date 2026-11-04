import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useState } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { ErrorState } from '@/components/ui/error-state';
import { getDatabase } from '@/data/db/database';
import { queryClient } from '@/data/queries/queryClient';
import { UserDataProvider, useUserData } from '@/data/storage/user-data-provider';
import { LaunchAnimation, shouldPlayLaunch } from '@/features/launch/launch-animation';
import { errorCopy } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { palettes } from '@/theme/tokens';
import { fontAssets } from '@/theme/typography';
import { useTheme } from '@/theme/useTheme';

// Keep the native splash up until fonts, saved data and the database are ready.
SplashScreen.preventAutoHideAsync().catch(() => {
  // Already hidden (e.g. after a fast refresh). Nothing to do.
});

/**
 * Shown if a screen crashes while rendering. It replaces the whole layout,
 * so it cannot use the app's providers; it reads the system theme directly.
 */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const colors = palettes[useColorScheme() === 'dark' ? 'dark' : 'light'];
  const copy = errorCopy(error);

  useEffect(() => {
    logger.error('Screen crashed', error);
    SplashScreen.hide();
  }, [error]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.bg }}>
      <ErrorState title={copy.title} message={copy.message} colors={colors} onRetry={retry} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserDataProvider>
        <AppShell />
      </UserDataProvider>
    </QueryClientProvider>
  );
}

function AppShell() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const { ready: userDataReady } = useUserData();
  const [databaseChecked, setDatabaseChecked] = useState(false);
  const { scheme, colors } = useTheme();
  const reduceMotion = useReducedMotion();
  // Once per cold start; skipped with reduced motion (DESIGN.md §5.6).
  const [launching, setLaunching] = useState(() => shouldPlayLaunch() && !reduceMotion);

  useEffect(() => {
    // Resolves to null if the database can't open; the app still runs without the cache.
    getDatabase().then(() => setDatabaseChecked(true));
  }, []);

  useEffect(() => {
    if (fontError) logger.error('Fonts failed to load, using system fonts', fontError);
  }, [fontError]);

  // Stops a white flash behind screens during transitions in dark mode.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.bg).catch((error: unknown) =>
      logger.warn('Could not set the root background color', { error }),
    );
  }, [colors.bg]);

  const appReady = (fontsLoaded || fontError !== null) && userDataReady && databaseChecked;

  useEffect(() => {
    if (appReady) SplashScreen.hide();
  }, [appReady]);

  if (!appReady) return null;

  return (
    <View style={styles.root}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)" />
        {/* Detail slides over the tabs, which shift left; DetailDim fades them (D-027). */}
        <Stack.Screen name="pokemon/[id]" options={{ animation: 'ios_from_right' }} />
      </Stack>
      {launching ? <LaunchAnimation onDone={() => setLaunching(false)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
