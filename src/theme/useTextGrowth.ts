import { useWindowDimensions } from 'react-native';

/**
 * How much the user's system font size enlarges text (1 = default, capped at 1.6).
 * Multiply fixed widths that hold text by this, so labels grow with the text
 * instead of breaking mid-word (DESIGN.md §11 "layouts must not clip").
 */
export function useTextGrowth(): number {
  const { fontScale } = useWindowDimensions();
  return Math.min(Math.max(fontScale, 1), 1.6);
}
