import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { duration, ease } from '@/theme/motion';

/** Four-point star from the draft, on a 20×20 box centered at 0,0. */
const STAR = 'M0 -10Q0 0 10 0Q0 0 0 10Q0 0 -10 0Q0 0 0 -10z';

/** Where the three sparkles sit, as fractions of the artwork box (from the draft's 100×100 SVG). */
const SPOTS = [
  { x: 0.88, y: 0.14, scale: 1, delay: 0 },
  { x: 0.12, y: 0.22, scale: 0.7, delay: 120 },
  { x: 0.9, y: 0.84, scale: 0.6, delay: 240 },
] as const;

/** Three white sparkles that pop in, staggered, when shiny is turned on (DESIGN.md §7). */
export function Sparkles({ size }: { size: number }) {
  const star = size * 0.2;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" accessible={false}>
      {SPOTS.map((spot, i) => (
        <Sparkle key={i} size={star * spot.scale} left={size * spot.x} top={size * spot.y} delay={spot.delay} />
      ))}
    </View>
  );
}

function Sparkle({ size, left, top, delay }: { size: number; left: number; top: number; delay: number }) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.set(
      reduceMotion
        ? withTiming(1, { duration: duration.reducedFade })
        : withDelay(delay, withTiming(1, { duration: duration.sparkle, easing: ease.overshoot })),
    );
  }, [delay, progress, reduceMotion]);

  // Reduced motion: a plain fade, no pop or twist.
  const style = useAnimatedStyle(() =>
    reduceMotion
      ? { opacity: progress.value }
      : {
          opacity: Math.min(1, progress.value * 2),
          transform: [{ scale: progress.value }, { rotate: `${(1 - progress.value) * -90}deg` }],
        },
  );

  return (
    <Animated.View style={[{ position: 'absolute', left: left - size / 2, top: top - size / 2 }, style]}>
      <Svg width={size} height={size} viewBox="-10 -10 20 20">
        <Path d={STAR} fill="#ffffff" />
      </Svg>
    </Animated.View>
  );
}
