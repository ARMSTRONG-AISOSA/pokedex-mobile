import { StyleSheet, Text, View } from 'react-native';

import { titleCase } from '@/domain/names';
import type { TypeName } from '@/domain/types';
import { mix } from '@/theme/color';
import { useTheme } from '@/theme/useTheme';

/** Small type label with a colored dot. Always shows the name, never color alone (DESIGN.md §11). */
export function TypePill({ type, label }: { type: TypeName; label?: string }) {
  const { colors, typeColors, text } = useTheme();
  const c = typeColors[type].c;
  return (
    <View style={[styles.pill, { backgroundColor: mix(c, colors.surface, 24) }]}>
      <View style={[styles.dot, { backgroundColor: c }]} />
      <Text style={[text.pill, { color: colors.ink }]}>{label ?? titleCase(type)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    height: 24,
    paddingHorizontal: 9,
    borderRadius: 12,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
