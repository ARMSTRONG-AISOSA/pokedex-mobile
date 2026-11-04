import { Pressable, StyleSheet, Text, View } from 'react-native';

import { titleCase } from '@/domain/names';
import type { TypeName } from '@/domain/types';
import { useTheme } from '@/theme/useTheme';

type Props = {
  /** A type, or "all" for the first chip. */
  type: TypeName | 'all';
  selected: boolean;
  onPress: () => void;
};

/** Filter chip (DESIGN.md §4): 38 tall, pill shaped. Selected = the type's deep color, white text. */
export function TypeChip({ type, selected, onPress }: Props) {
  const { colors, typeColors, text } = useTheme();
  const isAll = type === 'all';
  const selectedBg = isAll ? colors.allChipOn : typeColors[type].d;
  const label = isAll ? 'All' : titleCase(type);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={isAll ? 'All types' : `${label} type`}
      style={({ pressed }) => [
        styles.chip,
        selected
          ? { backgroundColor: selectedBg, borderColor: 'transparent' }
          : { backgroundColor: colors.field, borderColor: colors.line },
        { opacity: pressed ? 0.8 : 1 },
      ]}>
      {isAll ? null : (
        <View style={[styles.dot, { backgroundColor: selected ? '#ffffff' : typeColors[type].c }]} />
      )}
      <Text style={[text.label, { color: selected ? '#ffffff' : colors.ink }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
