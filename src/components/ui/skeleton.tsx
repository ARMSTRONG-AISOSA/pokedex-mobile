import { useEffect } from 'react';
import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { mix } from '@/theme/color';
import { duration } from '@/theme/motion';
import { useTheme } from '@/theme/useTheme';

type Props = {
  width: DimensionValue;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Placeholder block with a light band sweeping across (DESIGN.md §7, §8).
 * Only shown while a real request is pending. No shimmer with reduced motion.
 */
export function Skeleton({ width, height, radius = 10, style }: Props) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const boxWidth = useSharedValue(0);
  const highlight = mix(colors.line, colors.bg, 45);

  useEffect(() => {
    if (reduceMotion) return;
    progress.set(withRepeat(withTiming(1, { duration: duration.shimmer, easing: Easing.linear }), -1));
  }, [progress, reduceMotion]);

  const bandStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (progress.value * 2 - 1) * boxWidth.value }],
  }));

  return (
    <View
      accessible={false}
      onLayout={(e) => {
        boxWidth.set(e.nativeEvent.layout.width);
      }}
      style={[{ width, height, borderRadius: radius, backgroundColor: colors.line, overflow: 'hidden' }, style]}>
      {reduceMotion ? null : (
        <Animated.View style={[StyleSheet.absoluteFill, bandStyle]}>
          <Svg width="100%" height="100%" preserveAspectRatio="none">
            <Defs>
              <LinearGradient id="band" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={highlight} stopOpacity={0} />
                <Stop offset="0.5" stopColor={highlight} stopOpacity={1} />
                <Stop offset="1" stopColor={highlight} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#band)" />
          </Svg>
        </Animated.View>
      )}
    </View>
  );
}
