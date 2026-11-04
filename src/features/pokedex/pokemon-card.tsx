import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Icon } from '@/components/ui/icon';
import { PokeBall } from '@/components/ui/poke-ball';
import { TypePill } from '@/components/ui/type-pill';
import { displayName, formatDexNumber } from '@/domain/names';
import type { Pokemon } from '@/domain/types';
import { mix } from '@/theme/color';
import { duration, ease } from '@/theme/motion';
import { useTheme } from '@/theme/useTheme';

export const ARTWORK_SIZE = 78;

type Props = {
  pokemon: Pokemon;
  saved: boolean;
  onPress: (pokemon: Pokemon) => void;
};

/** List card (DESIGN.md §5.1): number, artwork, name, type pills, heart if saved. */
export function PokemonCard({ pokemon, saved, onPress }: Props) {
  const { colors, typeColors, text } = useTheme();
  const tint = typeColors[pokemon.types[0]].c;
  const name = displayName(pokemon.name);
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      style={styles.pressable}
      onPress={() => onPress(pokemon)}
      onPressIn={() => {
        scale.set(withTiming(0.97, { duration: duration.cardPress, easing: ease.out }));
      }}
      onPressOut={() => {
        scale.set(withTiming(1, { duration: duration.cardPress, easing: ease.out }));
      }}
      accessibilityRole="button"
      accessibilityLabel={`${name}, number ${pokemon.id}${saved ? ', saved' : ''}`}>
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: mix(tint, colors.surface, 16), borderColor: mix(tint, colors.line, 30) },
          pressStyle,
        ]}>
        {saved ? (
          <View style={styles.heart}>
            <Icon name="heart-filled" size={22} color={colors.heart} />
          </View>
        ) : null}
        <Text style={[text.dexNumber, { color: colors.muted }]}>{formatDexNumber(pokemon.id)}</Text>
        <Artwork pokemon={pokemon} size={ARTWORK_SIZE} />
        <Text style={[text.cardName, { color: colors.ink }]} numberOfLines={1}>
          {name}
        </Text>
        <View style={styles.pills}>
          {pokemon.types.map((type) => (
            <TypePill key={type} type={type} />
          ))}
        </View>
      </Animated.View>
    </Pressable>
  );
}

/**
 * Official artwork from the disk cache (works offline once seen). The Poké Ball
 * sits behind it while loading and stays if the image fails.
 */
export function Artwork({ pokemon, size, shiny = false }: { pokemon: Pokemon; size: number; shiny?: boolean }) {
  const [failed, setFailed] = useState(false);
  const uri = shiny ? pokemon.artworkShinyUrl : pokemon.artworkUrl;
  return (
    <View style={[styles.art, { width: size, height: size }]} accessible={false}>
      <View style={StyleSheet.absoluteFill}>
        <PokeBall types={pokemon.types} size={size} />
      </View>
      {uri && !failed ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="contain"
          cachePolicy="memory-disk"
          transition={150}
          recyclingKey={uri}
          onError={() => setFailed(true)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pressable: { flex: 1 },
  card: {
    flex: 1,
    minHeight: 176,
    padding: 14,
    gap: 6,
    borderRadius: 22,
    borderWidth: 1,
  },
  heart: { position: 'absolute', top: 10, right: 10 },
  art: { alignSelf: 'center', marginTop: 2, marginBottom: 4 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
});
