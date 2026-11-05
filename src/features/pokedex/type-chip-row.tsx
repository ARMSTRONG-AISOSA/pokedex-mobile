import { ScrollView, StyleSheet } from 'react-native';

import { TypeChip } from '@/components/ui/type-chip';
import { TYPE_NAMES, type TypeName } from '@/domain/types';
import { layout } from '@/theme/tokens';

type Props = {
  value: TypeName | 'all';
  onChange: (type: TypeName | 'all') => void;
};

/** Horizontal row of type filter chips, "All" first. */
export function TypeChipRow({ value, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityLabel="Filter by type">
      <TypeChip type="all" selected={value === 'all'} onPress={() => onChange('all')} />
      {TYPE_NAMES.map((type) => (
        <TypeChip key={type} type={type} selected={value === type} onPress={() => onChange(type)} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // The vertical padding leaves room for each chip's 44 dp touch area (hitSlop).
  row: { gap: 8, paddingHorizontal: layout.screenPadding, paddingVertical: 3 },
});
