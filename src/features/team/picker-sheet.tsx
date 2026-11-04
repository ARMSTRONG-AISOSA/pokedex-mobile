import { useEffect, useRef, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { TypePill } from '@/components/ui/type-pill';
import { displayName, formatDexNumber } from '@/domain/names';
import type { Pokemon } from '@/domain/types';
import { Artwork } from '@/features/pokedex/pokemon-card';
import { SearchField } from '@/features/pokedex/search-field';
import { useDexList } from '@/features/pokedex/use-dex-list';
import { errorCopy } from '@/lib/errors';
import { mix } from '@/theme/color';
import { duration, ease } from '@/theme/motion';
import { layout } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type Props = {
  visible: boolean;
  teamIds: readonly number[];
  /** Called after the closing slide has finished; the parent then sets `visible` to false. */
  onClose: () => void;
  /** Save the choice; the sheet closes itself afterwards. */
  onPick: (pokemon: Pokemon) => void;
};

/**
 * "Add to team" bottom sheet (DESIGN.md §5.5): 80% of the screen, search, one
 * row per Pokémon. Rows already on the team are disabled and say "On team".
 * Built on React Native's Modal (D-025) so Android's back button closes it.
 */
export function PickerSheet({ visible, teamIds, onClose, onPick }: Props) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { colors, text } = useTheme();
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState('');
  const progress = useSharedValue(0);
  // Ignore extra taps while the sheet is already sliding away.
  const closing = useRef(false);

  // Opening: the parent shows the Modal; the sheet slides up from below.
  useEffect(() => {
    if (!visible) return;
    closing.current = false;
    progress.set(0);
    progress.set(withTiming(1, { duration: reduceMotion ? duration.reducedFade : duration.sheetOpen, easing: ease.out }));
  }, [visible, progress, reduceMotion]);

  // Closing: slide down first, then tell the parent (which hides the Modal).
  const finishClose = () => {
    setQuery('');
    onClose();
  };
  const close = () => {
    if (closing.current) return;
    closing.current = true;
    progress.set(
      withTiming(0, { duration: reduceMotion ? duration.reducedFade : duration.sheetClose, easing: ease.out }, (finished) => {
        if (finished) scheduleOnRN(finishClose);
      }),
    );
  };
  const choose = (pokemon: Pokemon) => {
    if (closing.current) return;
    onPick(pokemon);
    close();
  };

  const sheetHeight = Math.round(height * 0.8);
  const sheetStyle = useAnimatedStyle(() =>
    reduceMotion
      ? { opacity: progress.value }
      : { transform: [{ translateY: (1 - progress.value) * sheetHeight }] },
  );
  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  const list = useDexList({ type: 'all', query, sortKey: 'number', ascending: true });

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={close}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, scrimStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Close" accessibilityRole="button" />
      </Animated.View>
      <Animated.View
        style={[styles.sheet, { height: sheetHeight, backgroundColor: colors.bg }, sheetStyle]}
        accessibilityViewIsModal
        accessibilityLabel="Add a Pokémon to your team">
        <View style={styles.head}>
          <Text style={[text.h3, { color: colors.ink }]} accessibilityRole="header">
            Add to team
          </Text>
          <IconButton accessibilityLabel="Close" onPress={close}>
            <Icon name="close" size={22} color={colors.ink} strokeWidth={2.2} />
          </IconButton>
        </View>
        <View style={styles.search}>
          <SearchField value={query} onChangeText={setQuery} />
        </View>
        {list.status === 'error' ? (
          <ErrorState {...errorCopy(list.error)} colors={colors} onRetry={list.retry} />
        ) : (
          <FlatList
            data={list.items}
            keyExtractor={(p) => String(p.id)}
            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            initialNumToRender={10}
            onEndReached={list.loadMore}
            renderItem={({ item }) => (
              <PickRow pokemon={item} onTeam={teamIds.includes(item.id)} onPick={() => choose(item)} />
            )}
            ListEmptyComponent={
              list.status === 'ready' ? (
                <EmptyState title="Nothing matches" message="Try another name or number." />
              ) : undefined
            }
          />
        )}
      </Animated.View>
    </Modal>
  );
}

function PickRow({ pokemon, onTeam, onPick }: { pokemon: Pokemon; onTeam: boolean; onPick: () => void }) {
  const { colors, typeColors, text } = useTheme();
  const { c, d } = typeColors[pokemon.types[0]];
  const name = displayName(pokemon.name);
  return (
    <Pressable
      onPress={onPick}
      disabled={onTeam}
      accessibilityRole="button"
      accessibilityLabel={onTeam ? `${name}, already on team` : `Add ${name} to team`}
      accessibilityState={{ disabled: onTeam }}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: mix(c, colors.surface, 14), borderColor: mix(c, colors.line, 28) },
        { opacity: onTeam ? 0.6 : pressed ? 0.85 : 1 },
      ]}>
      <Artwork pokemon={pokemon} size={44} />
      <View style={styles.rowText}>
        <View style={styles.rowTop}>
          <Text style={[text.cardName, styles.rowName, { color: colors.ink }]} numberOfLines={1}>
            {name}
          </Text>
          <Text style={[text.dexNumber, styles.rowNumber, { color: colors.muted }]}>{formatDexNumber(pokemon.id)}</Text>
        </View>
        <View style={styles.pills}>
          {pokemon.types.map((type) => (
            <TypePill key={type} type={type} />
          ))}
        </View>
      </View>
      <View style={[styles.action, { backgroundColor: onTeam ? 'transparent' : d }]}>
        <Text style={[text.labelStrong, { color: onTeam ? colors.muted : '#ffffff' }]}>{onTeam ? 'On team' : 'Add'}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrim: { backgroundColor: 'rgba(11, 20, 23, 0.5)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 18,
    paddingHorizontal: layout.screenPadding,
  },
  search: { marginTop: 14, paddingHorizontal: layout.screenPadding },
  listContent: { paddingTop: 12, paddingHorizontal: layout.screenPadding, gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  rowText: { flex: 1, gap: 5 },
  rowTop: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  rowName: { fontSize: 16, flexShrink: 1 },
  rowNumber: { fontSize: 12 },
  pills: { flexDirection: 'row', gap: 6 },
  action: { paddingHorizontal: 13, paddingVertical: 7, borderRadius: 15 },
});
