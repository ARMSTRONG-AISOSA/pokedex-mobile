import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { TypePill } from '@/components/ui/type-pill';
import { displayName, formatDexNumber } from '@/domain/names';
import type { Pokemon } from '@/domain/types';
import { Artwork } from '@/features/pokedex/pokemon-card';
import { mix, withAlpha } from '@/theme/color';
import { duration, ease } from '@/theme/motion';
import { useTheme } from '@/theme/useTheme';

type FilledProps = {
  pokemon: Pokemon;
  onOpen: () => void;
  onRemove: () => void;
  /** True for a Pokémon just chosen in the add sheet: the slot pops in once. */
  pop?: boolean;
};

/** A team member (DESIGN.md §5.3): tinted card with a round "×" to remove it. */
export function FilledSlot({ pokemon, onOpen, onRemove, pop = false }: FilledProps) {
  const { colors, typeColors, text } = useTheme();
  const tint = typeColors[pokemon.types[0]].c;
  const name = displayName(pokemon.name);

  // Slot pop (DESIGN.md §7): scale .82 → 1 and fade in while the sheet slides away.
  // Decided once, when the slot first appears, so later renders never replay it.
  const reduceMotion = useReducedMotion();
  const [popOnMount] = useState(pop);
  const appear = useSharedValue(popOnMount ? 0 : 1);
  useEffect(() => {
    if (!popOnMount) return;
    appear.set(
      reduceMotion
        ? withTiming(1, { duration: duration.reducedFade })
        : withDelay(300, withTiming(1, { duration: duration.slotPop, easing: ease.overshoot })),
    );
  }, [popOnMount, appear, reduceMotion]);
  const appearStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, appear.value),
    transform: reduceMotion ? [] : [{ scale: 0.82 + 0.18 * appear.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.slot,
        { backgroundColor: mix(tint, colors.surface, 16), borderColor: mix(tint, colors.line, 30), borderWidth: 1 },
        appearStyle,
      ]}>
      <Pressable onPress={onOpen} accessibilityRole="button" accessibilityLabel={`Open ${name}`} style={styles.main}>
        <Text style={[text.dexNumber, { color: colors.muted }]}>{formatDexNumber(pokemon.id)}</Text>
        <View style={styles.art}>
          <Artwork pokemon={pokemon} size={64} />
        </View>
        <Text style={[text.cardName, { color: colors.ink }]} numberOfLines={1}>
          {name}
        </Text>
        <View style={styles.pills}>
          {pokemon.types.map((type) => (
            <TypePill key={type} type={type} />
          ))}
        </View>
      </Pressable>
      <Pressable
        onPress={onRemove}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${name} from team`}
        hitSlop={6}
        style={({ pressed }) => [
          styles.remove,
          { backgroundColor: withAlpha(colors.ink, 0.1), opacity: pressed ? 0.7 : 1 },
        ]}>
        <Text style={[styles.removeText, { color: colors.ink }]}>×</Text>
      </Pressable>
    </Animated.View>
  );
}

/** Dashed empty slot that opens the add-to-team sheet. */
export function EmptySlot({ slotNumber, onPress }: { slotNumber: number; onPress: () => void }) {
  const { colors, text } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Add a Pokémon to slot ${slotNumber}`}
      style={({ pressed }) => [styles.slot, styles.empty, { borderColor: colors.rule, opacity: pressed ? 0.7 : 1 }]}>
      <Text style={[text.h1, styles.plus, { color: colors.ink }]}>+</Text>
      <Text style={[text.label, { color: colors.muted }]}>Add Pokémon</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: { flex: 1, minHeight: 168, borderRadius: 22 },
  main: { flex: 1, padding: 14, gap: 6 },
  art: { alignSelf: 'center', marginTop: 2, marginBottom: 4 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  remove: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: { fontSize: 22, lineHeight: 24 },
  empty: { borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4 },
  plus: { fontSize: 34, lineHeight: 36, letterSpacing: 0 },
});
