import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { isDatabaseAvailable } from '@/data/db/database';
import { useUserData } from '@/data/storage/user-data-provider';
import { defaultAscending, type SortKey } from '@/domain/sorting';
import type { Pokemon, TypeName } from '@/domain/types';
import { errorCopy } from '@/lib/errors';
import { haptic } from '@/lib/haptics';
import { layout } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { PokemonCard } from './pokemon-card';
import { PokemonCardSkeleton } from './pokemon-card-skeleton';
import { SearchField } from './search-field';
import { SortBar } from './sort-bar';
import { TypeChipRow } from './type-chip-row';
import { useDexList } from './use-dex-list';

const SKELETON_ITEMS = [1, 2, 3, 4, 5, 6] as const;

const COPY = {
  all: { title: 'Pokédex', subtitle: 'Find a Pokémon, then follow its evolutions.' },
  saved: { title: 'Saved', subtitle: 'Your favorite Pokémon, all in one place.' },
} as const;

/** The Pokédex tab (DESIGN.md §5.1), and with `mode="saved"` the Saved tab (§5.4). */
export function PokedexScreen({ mode = 'all' }: { mode?: 'all' | 'saved' }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { colors, scheme, text } = useTheme();
  const { settings, setSettings, favorites } = useUserData();
  const [query, setQuery] = useState('');
  const [type, setType] = useState<TypeName | 'all'>('all');

  const { key: sortKey, asc: ascending } = settings.sort;
  const savedMode = mode === 'saved';
  const list = useDexList({ type, query, sortKey, ascending, only: savedMode ? favorites : undefined });
  const saved = new Set(favorites);

  // Two columns: screen width minus side padding and the gap between columns.
  const cardWidth = (width - layout.screenPadding * 2 - layout.gridGap) / 2;

  const save = (next: typeof settings) => {
    setSettings(next).catch(() => {
      // Rolled back and logged by the provider; a sort preference is not worth an error message.
    });
  };

  const onChangeType = (next: TypeName | 'all') => {
    haptic('selection');
    setType(next);
  };
  const onChangeSort = (key: SortKey) => {
    if (key === sortKey) return;
    haptic('selection');
    save({ ...settings, sort: { key, asc: defaultAscending(key) } });
  };
  const onToggleDirection = () => {
    haptic('selection');
    save({ ...settings, sort: { key: sortKey, asc: !ascending } });
  };
  const onToggleTheme = () => {
    haptic('selection');
    save({ ...settings, theme: scheme === 'dark' ? 'light' : 'dark' });
  };
  const openPokemon = (pokemon: Pokemon) => {
    haptic('light');
    router.push({ pathname: '/pokemon/[id]', params: { id: String(pokemon.id) } });
  };

  const countText =
    list.status === 'loading'
      ? 'Loading Pokémon…'
      : list.partial
        ? `${list.items.length} Pokémon. Sort and filters cover the ${list.loadedCount} loaded so far.`
        : `${list.items.length} Pokémon${savedMode ? ' saved' : ''}`;

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + 22 }]}>
      <View style={[styles.top, styles.padded]}>
        <View style={styles.titles}>
          <Text style={[text.h1, { color: colors.ink }]} accessibilityRole="header">
            {COPY[mode].title}
          </Text>
          <Text style={[text.subtitle, styles.subtitle, { color: colors.muted }]}>{COPY[mode].subtitle}</Text>
        </View>
        <IconButton
          onPress={onToggleTheme}
          accessibilityLabel={scheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          <Icon name={scheme === 'dark' ? 'sun' : 'moon'} size={22} color={colors.ink} />
        </IconButton>
      </View>
      {isDatabaseAvailable() === false ? (
        <View style={[styles.notice, { backgroundColor: colors.field, borderColor: colors.line }]}>
          <Text style={[text.subtitle, styles.noticeText, { color: colors.ink }]}>
            Offline cache unavailable. Pokémon you open won’t be kept for offline use.
          </Text>
        </View>
      ) : null}
      <View style={[styles.padded, styles.search]}>
        <SearchField value={query} onChangeText={setQuery} />
      </View>
      <View style={styles.chips}>
        <TypeChipRow value={type} onChange={onChangeType} />
      </View>
      <View style={[styles.padded, styles.sort]}>
        <SortBar
          sortKey={sortKey}
          ascending={ascending}
          onChangeKey={onChangeSort}
          onToggleDirection={onToggleDirection}
        />
      </View>
      <Text
        style={[text.subtitle, styles.padded, styles.count, { color: colors.muted }]}
        accessibilityLiveRegion="polite">
        {countText}
      </Text>
    </View>
  );

  if (list.status !== 'ready') {
    return (
      <FlatList
        style={{ backgroundColor: colors.bg }}
        data={list.status === 'loading' ? SKELETON_ITEMS : []}
        keyExtractor={(n) => `skeleton-${n}`}
        numColumns={2}
        columnWrapperStyle={styles.columns}
        ItemSeparatorComponent={RowGap}
        ListHeaderComponent={header}
        renderItem={() => (
          <View style={{ width: cardWidth }}>
            <PokemonCardSkeleton />
          </View>
        )}
        ListEmptyComponent={
          list.status === 'error' ? (
            <View style={styles.message}>
              <ErrorState {...errorCopy(list.error)} colors={colors} onRetry={list.retry} />
            </View>
          ) : undefined
        }
        keyboardShouldPersistTaps="handled"
        accessibilityState={{ busy: list.status === 'loading' }}
      />
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      data={list.items}
      keyExtractor={(p) => String(p.id)}
      numColumns={2}
      columnWrapperStyle={styles.columns}
      ItemSeparatorComponent={RowGap}
      ListHeaderComponent={header}
      ListFooterComponent={
        list.isLoadingMore ? <ActivityIndicator style={styles.footer} color={colors.muted} /> : <View style={styles.footer} />
      }
      ListEmptyComponent={
        savedMode && favorites.length === 0 ? (
          <EmptyState title="No saved Pokémon yet" message="Open a Pokémon and tap the heart to keep it here." />
        ) : (
          <EmptyState title="Nothing matches" message="Try another name, or clear the type filter." />
        )
      }
      renderItem={({ item }) => (
        <View style={{ width: cardWidth }}>
          <PokemonCard pokemon={item} saved={saved.has(item.id)} onPress={openPokemon} />
        </View>
      )}
      onEndReached={list.loadMore}
      onEndReachedThreshold={0.6}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      initialNumToRender={8}
      windowSize={7}
    />
  );
}

function RowGap() {
  return <View style={{ height: layout.gridGap }} />;
}

const styles = StyleSheet.create({
  header: { paddingBottom: 8 },
  padded: { paddingHorizontal: layout.screenPadding },
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  titles: { flex: 1 },
  subtitle: { marginTop: 6, fontSize: 14.5 },
  search: { marginTop: 16 },
  notice: {
    marginTop: 14,
    marginHorizontal: layout.screenPadding,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  noticeText: { fontSize: 13.5 },
  // 3 less than the design's 14/12: the chip row has 3 of padding for touch targets.
  chips: { marginTop: 11 },
  sort: { marginTop: 9 },
  count: { marginTop: 12, fontSize: 13.5 },
  columns: { gap: layout.gridGap, paddingHorizontal: layout.screenPadding },
  message: { marginTop: 32 },
  footer: { height: 24, marginVertical: 12 },
});
