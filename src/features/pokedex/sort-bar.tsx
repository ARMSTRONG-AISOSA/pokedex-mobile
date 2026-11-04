import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { SegmentedControl } from '@/components/ui/segmented-control';
import type { SortKey } from '@/domain/sorting';
import { duration, ease } from '@/theme/motion';
import { useTheme } from '@/theme/useTheme';

const OPTIONS = [
  { value: 'number', label: 'Number' },
  { value: 'name', label: 'Name' },
  { value: 'power', label: 'Power' },
] as const;

type Props = {
  sortKey: SortKey;
  ascending: boolean;
  onChangeKey: (key: SortKey) => void;
  onToggleDirection: () => void;
};

/** Number / Name / Power plus a direction arrow that flips 180° (DESIGN.md §7). */
export function SortBar({ sortKey, ascending, onChangeKey, onToggleDirection }: Props) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const rotation = useSharedValue(ascending ? 0 : 180);

  useEffect(() => {
    const target = ascending ? 0 : 180;
    rotation.set(reduceMotion
      ? target
      : withTiming(target, { duration: duration.sortArrow, easing: ease.overshoot }));
  }, [ascending, reduceMotion, rotation]);

  const arrowStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));

  return (
    <View style={styles.row}>
      <SegmentedControl options={OPTIONS} value={sortKey} onChange={onChangeKey} accessibilityLabel="Sort by" />
      <IconButton
        shape="square"
        onPress={onToggleDirection}
        accessibilityLabel={
          ascending ? 'Sorted low to high. Tap to reverse' : 'Sorted high to low. Tap to reverse'
        }>
        <Animated.View style={arrowStyle}>
          <Icon name="arrow-up" size={22} color={colors.ink} strokeWidth={2.2} />
        </Animated.View>
      </IconButton>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
