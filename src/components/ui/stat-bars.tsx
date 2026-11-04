import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Skeleton } from '@/components/ui/skeleton';
import { statTotal, type Stats } from '@/domain/types';
import { duration, ease } from '@/theme/motion';
import { useTheme } from '@/theme/useTheme';

const ROWS: { key: keyof Stats; label: string }[] = [
  { key: 'hp', label: 'HP' },
  { key: 'attack', label: 'Attack' },
  { key: 'defense', label: 'Defense' },
  { key: 'spAtk', label: 'Sp. Atk' },
  { key: 'spDef', label: 'Sp. Def' },
  { key: 'speed', label: 'Speed' },
];

/** Bars are scaled so 150 fills the track (DESIGN.md §5.2). */
const SCALE_MAX = 150;

/** Six stat bars plus the total. Bars grow from 0 when they appear (DESIGN.md §7). */
export function StatBars({ stats, color, showTotal = true }: { stats: Stats; color: string; showTotal?: boolean }) {
  const { colors, text } = useTheme();
  return (
    <View>
      <View style={styles.list}>
        {ROWS.map(({ key, label }) => (
          <View key={key} style={styles.row} accessible accessibilityLabel={`${label} ${stats[key]}`}>
            <Text style={[text.label, styles.label, { color: colors.muted }]}>{label}</Text>
            <Text style={[text.labelStrong, styles.value, { color: colors.ink }]}>{stats[key]}</Text>
            <Bar fraction={Math.min(1, stats[key] / SCALE_MAX)} color={color} track={colors.line} />
          </View>
        ))}
      </View>
      {showTotal ? (
        <View style={[styles.total, { borderTopColor: colors.line }]}>
          <Text style={[text.label, { color: colors.ink }]}>Total</Text>
          <Text style={[text.labelStrong, styles.totalValue, { color: colors.ink }]}>{statTotal(stats)}</Text>
        </View>
      ) : null}
    </View>
  );
}

function Bar({ fraction, color, track }: { fraction: number; color: string; track: string }) {
  const reduceMotion = useReducedMotion();
  const trackWidth = useSharedValue(0);
  const progress = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (!reduceMotion) progress.set(withTiming(1, { duration: duration.statBar, easing: ease.out }));
  }, [progress, reduceMotion]);

  const fillStyle = useAnimatedStyle(() => ({ width: trackWidth.value * fraction * progress.value }));

  return (
    <View
      style={[styles.track, { backgroundColor: track }]}
      onLayout={(e) => trackWidth.set(e.nativeEvent.layout.width)}>
      <Animated.View style={[styles.fill, { backgroundColor: color }, fillStyle]} />
    </View>
  );
}

/** Six label + bar rows while the Pokémon itself is still loading. */
export function StatBarsSkeleton() {
  const widths = ['46%', '62%', '38%', '70%', '54%', '80%'] as const;
  return (
    <View style={styles.list} accessibilityLabel="Loading" accessibilityState={{ busy: true }}>
      {widths.map((w, i) => (
        <View key={i} style={styles.skeletonRow}>
          <Skeleton width={62} height={12} />
          <Skeleton width={w} height={9} radius={5} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 11, marginTop: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { width: 62 },
  value: { width: 34, textAlign: 'right', fontSize: 14, fontVariant: ['tabular-nums'] },
  track: { flex: 1, height: 9, borderRadius: 5, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5 },
  total: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalValue: { fontSize: 14, fontVariant: ['tabular-nums'] },
  skeletonRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
