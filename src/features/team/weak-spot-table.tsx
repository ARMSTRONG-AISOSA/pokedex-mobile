import { StyleSheet, Text, View } from 'react-native';

import { TypePill } from '@/components/ui/type-pill';
import { titleCase } from '@/domain/names';
import type { WeakSpot } from '@/domain/typeChart';
import { useTheme } from '@/theme/useTheme';

/**
 * One row per attack type: how many members are weak, how many resist, and a
 * "Needs cover" flag in words, not just color (DESIGN.md §5.3, §11).
 */
export function WeakSpotTable({ spots }: { spots: readonly WeakSpot[] }) {
  const { colors, text } = useTheme();
  return (
    <View>
      <View style={[styles.row, styles.head, { borderBottomColor: colors.rule }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Text style={[text.label, styles.typeCol, { color: colors.muted }]}>Attack type</Text>
        <Text style={[text.label, styles.numCol, { color: colors.muted }]}>Weak</Text>
        <Text style={[text.label, styles.numCol, { color: colors.muted }]}>Resist</Text>
        <View style={styles.flagCol} />
      </View>
      {spots.map((spot) => (
        <View
          key={spot.attack}
          style={[styles.row, styles.body, { borderBottomColor: colors.line }]}
          accessible
          accessibilityLabel={`${titleCase(spot.attack)}: ${spot.weak} weak, ${spot.resist} resist${spot.needsCover ? ', needs cover' : ''}`}>
          <View style={styles.typeCol}>
            <TypePill type={spot.attack} />
          </View>
          <Text
            style={[
              text.label,
              styles.numCol,
              styles.num,
              { color: spot.needsCover ? colors.bad : colors.ink },
              spot.needsCover && styles.strong,
            ]}>
            {spot.weak}
          </Text>
          <Text style={[text.label, styles.numCol, styles.num, { color: colors.ink }]}>{spot.resist}</Text>
          <Text style={[text.labelStrong, styles.flagCol, { color: colors.bad }]}>
            {spot.needsCover ? 'Needs cover' : ''}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1 },
  head: { paddingVertical: 6 },
  body: { paddingVertical: 8 },
  typeCol: { flex: 1.4 },
  numCol: { flex: 0.7 },
  num: { fontVariant: ['tabular-nums'] },
  strong: { fontFamily: 'Figtree_600SemiBold' },
  flagCol: { flex: 1.1, fontSize: 13 },
});
