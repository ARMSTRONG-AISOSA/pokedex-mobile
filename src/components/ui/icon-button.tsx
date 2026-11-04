import type { ReactNode } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/useTheme';

type Props = {
  /** Required: icon-only buttons must say what they do (DESIGN.md §11). */
  accessibilityLabel: string;
  onPress: () => void;
  children: ReactNode;
  /** Round by default; the sort-direction button uses a rounded square. */
  shape?: 'circle' | 'square';
  selected?: boolean;
  /** "onColor" = translucent white, for the colored detail header. */
  tone?: 'default' | 'onColor';
  style?: StyleProp<ViewStyle>;
};

/** 44×44 button with the soft `field` background (DESIGN.md §4). */
export function IconButton({
  accessibilityLabel,
  onPress,
  children,
  shape = 'circle',
  selected,
  tone = 'default',
  style,
}: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={selected === undefined ? undefined : { selected }}
      hitSlop={4}
      style={({ pressed }) => [
        styles.base,
        {
          borderRadius: shape === 'circle' ? 22 : 14,
          backgroundColor:
            tone === 'onColor' ? (selected ? 'rgba(255,255,255,0.34)' : 'rgba(255,255,255,0.16)') : colors.field,
          borderColor: tone === 'onColor' ? 'transparent' : colors.line,
          opacity: pressed ? 0.75 : 1,
        },
        style,
      ]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 44,
    height: 44,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
