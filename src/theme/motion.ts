import { Easing } from 'react-native-reanimated';

/** Curves from DESIGN.md §7. */
export const ease = {
  /** Smooth settle. Default for entrances and sheets. */
  out: Easing.bezier(0.22, 1, 0.36, 1),
  /** Small springy overshoot. For pops and bounces. */
  overshoot: Easing.bezier(0.3, 1.4, 0.5, 1),
} as const;

/** Durations in ms (DESIGN.md §7). */
export const duration = {
  tabSwitch: 400,
  tabIndicator: 380,
  tabIcon: 300,
  detail: 340,
  statBar: 700,
  sheetOpen: 400,
  sheetClose: 350,
  slotPop: 500,
  shiny: 500,
  sparkle: 700,
  cardPress: 150,
  sortArrow: 300,
  sortSegment: 200,
  shimmer: 1300,
  /** Used instead of slides and pops when the user prefers reduced motion. */
  reducedFade: 150,
} as const;
