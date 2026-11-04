import { useEffect, useRef } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line } from 'react-native-svg';

import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { TypePill } from '@/components/ui/type-pill';
import { displayName, formatDexNumber } from '@/domain/names';
import type { Pokemon } from '@/domain/types';
import { Artwork } from '@/features/pokedex/pokemon-card';
import { duration, ease } from '@/theme/motion';
import { layout } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { Sparkles } from './sparkles';

export const ART_SIZE = 132;
/** The artwork's bottom edge sits this far above the hero's bottom edge (draft: 28). */
export const ART_BOTTOM = 28;

type Props = {
  pokemon: Pokemon;
  shiny: boolean;
  saved: boolean;
  onBack: () => void;
  onToggleShiny: () => void;
  onToggleSaved: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
};

/**
 * Colored header (DESIGN.md §5.2): back, shiny and heart buttons, name, number,
 * type pills, large artwork, and a faint Poké Ball outline behind.
 */
export function DetailHero({ pokemon, shiny, saved, onBack, onToggleShiny, onToggleSaved, onLayout }: Props) {
  const insets = useSafeAreaInsets();
  const { typeColors, text } = useTheme();
  const reduceMotion = useReducedMotion();

  // Entrance (DESIGN.md §7): name and number rise 14 px and fade in.
  const title = useSharedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (!reduceMotion) title.set(withDelay(120, withTiming(1, { duration: 450, easing: ease.out })));
  }, [title, reduceMotion]);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: title.value,
    transform: [{ translateY: (1 - title.value) * 14 }],
  }));

  return (
    <View
      onLayout={onLayout}
      style={[styles.hero, { paddingTop: insets.top + 18, backgroundColor: typeColors[pokemon.types[0]].d }]}>
      <Svg width={280} height={280} viewBox="0 0 100 100" style={styles.ring} accessible={false}>
        <Circle cx={50} cy={50} r={46} fill="none" stroke="#ffffff" strokeWidth={6} />
        <Line x1={4} y1={50} x2={96} y2={50} stroke="#ffffff" strokeWidth={8} />
        <Circle cx={50} cy={50} r={14} fill="none" stroke="#ffffff" strokeWidth={6} />
      </Svg>

      <View style={styles.bar}>
        <IconButton tone="onColor" accessibilityLabel="Back to list" onPress={onBack}>
          <Icon name="back" size={22} color="#ffffff" strokeWidth={2.4} />
        </IconButton>
        <View style={styles.barRight}>
          <IconButton
            tone="onColor"
            selected={shiny}
            accessibilityLabel={shiny ? 'Show normal colors' : 'Show shiny colors'}
            onPress={onToggleShiny}>
            <Icon name={shiny ? 'sparkle-filled' : 'sparkle'} size={22} color="#ffffff" />
          </IconButton>
          <IconButton
            tone="onColor"
            selected={saved}
            accessibilityLabel={saved ? 'Remove from saved' : 'Save Pokémon'}
            onPress={onToggleSaved}>
            <Icon name={saved ? 'heart-filled' : 'heart'} size={22} color="#ffffff" />
          </IconButton>
        </View>
      </View>

      <Animated.View style={titleStyle}>
        <Text style={[text.heroName, styles.name]} accessibilityRole="header">
          {displayName(pokemon.name)}
        </Text>
        <Text style={[text.dexNumber, styles.number]}>{formatDexNumber(pokemon.id)}</Text>
      </Animated.View>
      <View style={styles.pills}>
        {pokemon.types.map((type) => (
          <TypePill key={type} type={type} variant="onColor" />
        ))}
      </View>
    </View>
  );
}

/**
 * The large artwork. Drawn as its own layer above the sheet (like the draft,
 * where it overlaps the sheet's top edge). Rolls in on entrance; pops on shiny.
 */
export function HeroArtwork({ pokemon, shiny, top }: { pokemon: Pokemon; shiny: boolean; top: number }) {
  const reduceMotion = useReducedMotion();
  const art = useSharedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (!reduceMotion) art.set(withDelay(100, withTiming(1, { duration: 650, easing: ease.overshoot })));
  }, [art, reduceMotion]);

  // Shiny swap: the artwork pops (scale .7 → 1, rotate −30° → 0) when shiny changes, not on mount.
  const swap = useSharedValue(1);
  const previousShiny = useRef(shiny);
  useEffect(() => {
    if (previousShiny.current === shiny) return;
    previousShiny.current = shiny;
    if (reduceMotion) return;
    swap.set(0);
    swap.set(withTiming(1, { duration: duration.shiny, easing: ease.overshoot }));
  }, [shiny, swap, reduceMotion]);

  const artStyle = useAnimatedStyle(() => {
    const t = art.value;
    const s = swap.value;
    return {
      opacity: Math.min(1, t * 1.5),
      transform: [
        { translateX: (1 - t) * 70 },
        { rotate: `${(1 - t) * -140 + (1 - s) * -30}deg` },
        { scale: (0.6 + 0.4 * t) * (0.7 + 0.3 * s) },
      ],
    };
  });
  return (
    <Animated.View style={[styles.art, { top }, artStyle]} pointerEvents="none" accessible={false}>
      <Artwork pokemon={pokemon} size={ART_SIZE} shiny={shiny} />
      {shiny && !reduceMotion ? <Sparkles size={ART_SIZE} /> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: layout.screenPadding, paddingBottom: 96, overflow: 'hidden' },
  ring: { position: 'absolute', right: -70, top: 30, opacity: 0.16 },
  bar: { flexDirection: 'row', justifyContent: 'space-between', zIndex: 2 },
  barRight: { flexDirection: 'row', gap: 8 },
  name: { color: '#ffffff', marginTop: 22, marginBottom: 10, maxWidth: '62%' },
  number: { color: '#ffffff', fontSize: 14, opacity: 0.85 },
  pills: { flexDirection: 'row', gap: 6, marginTop: 12, zIndex: 2 },
  art: { position: 'absolute', right: 18 },
});
