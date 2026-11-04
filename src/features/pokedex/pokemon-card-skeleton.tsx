import { StyleSheet, View } from 'react-native';

import { Skeleton } from '@/components/ui/skeleton';
import { mix } from '@/theme/color';
import { useTheme } from '@/theme/useTheme';

import { ARTWORK_SIZE } from './pokemon-card';

/** Card-shaped placeholder: number bar, ball circle, name bar, pill bar (DESIGN.md §8). */
export function PokemonCardSkeleton() {
  const { colors } = useTheme();
  const neutral = '#9fb0ad';
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: mix(neutral, colors.surface, 16), borderColor: mix(neutral, colors.line, 30) },
      ]}>
      <Skeleton width={34} height={12} />
      <Skeleton width={ARTWORK_SIZE} height={ARTWORK_SIZE} radius={ARTWORK_SIZE / 2} style={styles.ball} />
      <Skeleton width="70%" height={18} />
      <Skeleton width={56} height={24} radius={12} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minHeight: 176, padding: 14, gap: 6, borderRadius: 22, borderWidth: 1 },
  ball: { alignSelf: 'center', marginTop: 2, marginBottom: 4 },
});
