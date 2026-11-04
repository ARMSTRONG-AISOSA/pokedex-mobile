import type { BottomTabNavigationOptions } from 'expo-router/js-tabs';
import { Easing } from 'react-native';

import { duration } from '@/theme/motion';

// The tab navigator animates with React Native's Animated API, so the curve is
// built with its Easing (same numbers as `ease.out` in theme/motion.ts).
const easeOut = Easing.bezier(0.22, 1, 0.36, 1);

/**
 * Tab switch (DESIGN.md §7): the new screen slides in 40 px from the side its
 * tab sits on while fading in. Each screen's progress is -1 (left of the active
 * tab), 0 (active) or 1 (right of it).
 */
export const slideTabs: BottomTabNavigationOptions = {
  transitionSpec: { animation: 'timing', config: { duration: duration.tabSwitch, easing: easeOut } },
  sceneStyleInterpolator: ({ current }) => ({
    sceneStyle: {
      opacity: current.progress.interpolate({ inputRange: [-1, 0, 1], outputRange: [0, 1, 0] }),
      transform: [{ translateX: current.progress.interpolate({ inputRange: [-1, 0, 1], outputRange: [-40, 0, 40] }) }],
    },
  }),
};

/** Reduced motion: a short cross-fade instead of the slide. */
export const fadeTabs: BottomTabNavigationOptions = {
  transitionSpec: { animation: 'timing', config: { duration: duration.reducedFade, easing: Easing.linear } },
  sceneStyleInterpolator: ({ current }) => ({
    sceneStyle: {
      opacity: current.progress.interpolate({ inputRange: [-1, 0, 1], outputRange: [0, 1, 0] }),
    },
  }),
};
