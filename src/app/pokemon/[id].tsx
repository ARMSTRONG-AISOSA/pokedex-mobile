import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { TypePill } from '@/components/ui/type-pill';
import { usePokemon } from '@/data/queries/usePokemon';
import { displayName, formatDexNumber } from '@/domain/names';
import { Artwork } from '@/features/pokedex/pokemon-card';
import { haptic } from '@/lib/haptics';
import { layout } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

/** Temporary detail screen so list taps go somewhere. The real one is Phase 7. */
export default function PokemonDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { colors, typeColors, text } = useTheme();
  const { data: pokemon } = usePokemon(Number(id));
  const bg = pokemon ? typeColors[pokemon.types[0]].d : colors.bg;

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 18, backgroundColor: bg }]}>
      <IconButton
        accessibilityLabel="Back to list"
        onPress={() => {
          haptic('light');
          router.back();
        }}>
        <Icon name="back" size={22} color={colors.ink} strokeWidth={2.4} />
      </IconButton>
      {pokemon ? (
        <View style={styles.body}>
          <Text style={[text.heroName, { color: '#ffffff' }]}>{displayName(pokemon.name)}</Text>
          <Text style={[text.dexNumber, { color: '#ffffff' }]}>{formatDexNumber(pokemon.id)}</Text>
          <View style={styles.pills}>
            {pokemon.types.map((t) => (
              <TypePill key={t} type={t} />
            ))}
          </View>
          <Artwork pokemon={pokemon} size={200} />
          <Text style={[text.subtitle, { color: '#ffffff' }]}>The full detail screen comes in Phase 7.</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: layout.screenPadding },
  body: { marginTop: 16, gap: 8 },
  pills: { flexDirection: 'row', gap: 6 },
});
