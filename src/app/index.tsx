import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '@/components/ui/error-state';
import { countSavedPokemon } from '@/data/db/pokemonRepo';
import { useEvolutionChain } from '@/data/queries/useEvolutionChain';
import { usePokemonPages } from '@/data/queries/usePokemonPages';
import { useSettings } from '@/data/storage/user-data-provider';
import { displayName, formatDexNumber } from '@/domain/names';
import type { EvolutionNode } from '@/domain/types';
import { errorCopy } from '@/lib/errors';
import { haptic } from '@/lib/haptics';
import { mix } from '@/theme/color';
import { layout } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const THEME_ORDER = ['system', 'light', 'dark'] as const;
const EEVEE = 133;

/**
 * Temporary screen to check the foundations and the data layer on a device.
 * Replaced by the Pokédex list in Phase 6.
 */
export default function Index() {
  const insets = useSafeAreaInsets();
  const { colors, typeColors, text } = useTheme();
  const [settings, setSettings] = useSettings();
  const pages = usePokemonPages();
  const eevee = useEvolutionChain(EEVEE);
  // Re-counted each time a page arrives, so the number grows as you load more.
  const saved = useQuery({
    queryKey: ['debug-saved-count', pages.data?.pages.length ?? 0],
    queryFn: countSavedPokemon,
  });

  const nextTheme = THEME_ORDER[(THEME_ORDER.indexOf(settings.theme) + 1) % THEME_ORDER.length];
  const cycleTheme = () => {
    haptic('selection');
    setSettings({ ...settings, theme: nextTheme }).catch(() => {
      // The provider already rolled back and logged.
    });
  };

  const pokemon = pages.data?.pages.flatMap((p) => p.items) ?? [];
  const total = pages.data?.pages[0]?.total;
  const nextPageError = pages.isFetchNextPageError ? pages.error : null;

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[text.h1, { color: colors.ink }]}>Pokédex</Text>
          <Text style={[text.subtitle, { color: colors.muted }]}>Data layer check (temporary screen)</Text>
          <Text style={[text.subtitle, { color: colors.muted }]}>
            {saved.data === null
              ? 'Offline cache unavailable'
              : `Saved on this phone: ${saved.data ?? '…'} Pokémon`}
          </Text>
        </View>
        <Pressable
          onPress={cycleTheme}
          accessibilityRole="button"
          accessibilityLabel={`Theme: ${settings.theme}. Tap to switch to ${nextTheme}.`}
          style={[styles.button, { backgroundColor: colors.field, borderColor: colors.line }]}>
          <Text style={[text.labelStrong, { color: colors.ink }]}>{settings.theme}</Text>
        </Pressable>
      </View>

      <Text style={[text.h3, { color: colors.ink }]}>Eevee’s evolutions</Text>
      {eevee.isPending ? (
        <ActivityIndicator color={colors.muted} />
      ) : eevee.isError ? (
        <ErrorState {...errorCopy(eevee.error)} colors={colors} onRetry={() => eevee.refetch()} />
      ) : (
        <Tree node={eevee.data} depth={0} color={colors.ink} muted={colors.muted} />
      )}

      <Text style={[text.h3, { color: colors.ink }]}>
        {total ? `Loaded ${pokemon.length} of ${total} Pokémon` : 'Pokémon'}
      </Text>
      {pages.isPending ? (
        <ActivityIndicator color={colors.muted} />
      ) : pages.isError ? (
        <ErrorState {...errorCopy(pages.error)} colors={colors} onRetry={() => pages.refetch()} />
      ) : (
        <>
          {pokemon.map((p) => (
            <View
              key={p.id}
              style={[styles.row, { backgroundColor: mix(typeColors[p.types[0]].c, colors.surface, 16) }]}>
              <Text style={[text.dexNumber, { color: colors.muted }]}>{formatDexNumber(p.id)}</Text>
              <Text style={[text.cardName, styles.name, { color: colors.ink }]}>{displayName(p.name)}</Text>
              <Text style={[text.pill, { color: colors.muted }]}>{p.types.join(' / ')}</Text>
            </View>
          ))}
          {pages.hasNextPage ? (
            <Pressable
              onPress={() => pages.fetchNextPage()}
              disabled={pages.isFetchingNextPage}
              accessibilityRole="button"
              style={[styles.button, { backgroundColor: colors.field, borderColor: colors.line }]}>
              <Text style={[text.label, { color: colors.ink }]}>
                {pages.isFetchingNextPage ? 'Loading…' : 'Load 20 more'}
              </Text>
            </Pressable>
          ) : null}
          {nextPageError ? (
            <Text style={[text.subtitle, { color: colors.bad }]}>{errorCopy(nextPageError).message}</Text>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

function Tree({ node, depth, color, muted }: { node: EvolutionNode; depth: number; color: string; muted: string }) {
  return (
    <View style={{ paddingLeft: depth * 16, gap: 2 }}>
      <Text style={{ color }}>
        {displayName(node.speciesName)}
        {node.via ? <Text style={{ color: muted }}> ({node.via})</Text> : null}
      </Text>
      {node.children.map((child) => (
        <Tree key={child.id} node={child} depth={depth + 1} color={color} muted={muted} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: layout.screenPadding, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  headerText: { flex: 1, gap: 6 },
  button: {
    minHeight: layout.minTouch,
    minWidth: layout.minTouch,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  name: { flex: 1 },
});
