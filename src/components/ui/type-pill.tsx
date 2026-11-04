import { StyleSheet, Text, View } from 'react-native';

import { titleCase } from '@/domain/names';
import type { TypeName } from '@/domain/types';
import { mix } from '@/theme/color';
import { useTheme } from '@/theme/useTheme';

type Props = {
  type: TypeName;
  /** "onColor" = white on a colored hero background. */
  variant?: 'default' | 'onColor';
  /** "large" is used in the matchup groups (28 tall, 13 pt). */
  size?: 'small' | 'large';
  /** Shown in bold after the name, e.g. "4×". */
  suffix?: string;
};

/** Type label with a colored dot. Always shows the name, never color alone (DESIGN.md §11). */
export function TypePill({ type, variant = 'default', size = 'small', suffix }: Props) {
  const { colors, typeColors, text } = useTheme();
  const c = typeColors[type].c;
  const onColor = variant === 'onColor';
  const large = size === 'large';
  const textColor = onColor ? '#ffffff' : colors.ink;

  return (
    <View
      style={[
        styles.pill,
        large && styles.large,
        { backgroundColor: onColor ? 'rgba(255,255,255,0.2)' : mix(c, colors.surface, 24) },
      ]}>
      <View style={[styles.dot, { backgroundColor: onColor ? '#ffffff' : c }]} />
      <Text style={[text.pill, large && styles.largeText, { color: textColor }]}>
        {titleCase(type)}
        {suffix ? <Text style={styles.suffix}> {suffix}</Text> : null}
      </Text>
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
  large: { height: 28, paddingHorizontal: 11, borderRadius: 14 },
  largeText: { fontSize: 13 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  suffix: { fontWeight: '700' },
});
