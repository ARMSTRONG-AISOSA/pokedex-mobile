import { useNavigation } from 'expo-router';
import type { NativeStackNavigationProp } from 'expo-router/native-stack';
import type { ParamListBase } from 'expo-router/react-navigation';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

import { duration, ease } from '@/theme/motion';
import { useTheme } from '@/theme/useTheme';

/**
 * Dims the tabs while a Pokémon's detail screen slides over them, and brings
 * them back when it closes (DESIGN.md §7 "Open/Close detail"). The slide itself
 * is the native stack's `ios_from_right` animation (D-027); the native stack
 * can't fade the screen underneath, so this layer does.
 */
export function DetailDim() {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const dim = useSharedValue(0);

  useEffect(() => {
    const animate = (to: number) =>
      dim.set(withTiming(to, { duration: reduceMotion ? duration.reducedFade : duration.detail, easing: ease.out }));
    const offStart = navigation.addListener('transitionStart', (event) => animate(event.data.closing ? 0.5 : 0));
    // Safety net: whatever happened in between, the tabs are never left dimmed.
    const offFocus = navigation.addListener('focus', () => animate(0));
    return () => {
      offStart();
      offFocus();
    };
  }, [navigation, dim, reduceMotion]);

  const style = useAnimatedStyle(() => ({ opacity: dim.value }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }, style]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
