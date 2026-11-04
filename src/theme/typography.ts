import type { TextStyle } from 'react-native';

import { BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque/700Bold';
import { BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque/800ExtraBold';
import { Figtree_400Regular } from '@expo-google-fonts/figtree/400Regular';
import { Figtree_500Medium } from '@expo-google-fonts/figtree/500Medium';
import { Figtree_600SemiBold } from '@expo-google-fonts/figtree/600SemiBold';

/**
 * Only the weights the design uses are bundled (DESIGN.md §3).
 * Pass this map to `useFonts` once, in the root layout.
 */
export const fontAssets = {
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
};

/**
 * On Android a custom font picks its weight by family name, not by
 * `fontWeight`, so each weight is its own family.
 */
export const fonts = {
  display700: 'BricolageGrotesque_700Bold',
  display800: 'BricolageGrotesque_800ExtraBold',
  body400: 'Figtree_400Regular',
  body500: 'Figtree_500Medium',
  body600: 'Figtree_600SemiBold',
} as const;

/** Text roles from DESIGN.md §3. Colors come from the theme, not from here. */
export const text = {
  h1: { fontFamily: fonts.display800, fontSize: 36, lineHeight: 36, letterSpacing: -1.08 },
  heroName: { fontFamily: fonts.display800, fontSize: 46, lineHeight: 44, letterSpacing: -1.6 },
  h3: { fontFamily: fonts.display700, fontSize: 22, lineHeight: 26, letterSpacing: -0.44 },
  cardName: { fontFamily: fonts.display700, fontSize: 18, lineHeight: 22, letterSpacing: -0.18 },
  wordmark: { fontFamily: fonts.display800, fontSize: 48, letterSpacing: -1.44 },
  body: { fontFamily: fonts.body400, fontSize: 16, lineHeight: 22 },
  subtitle: { fontFamily: fonts.body400, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: fonts.body500, fontSize: 14 },
  labelStrong: { fontFamily: fonts.body600, fontSize: 13 },
  pill: { fontFamily: fonts.body600, fontSize: 12 },
  dexNumber: { fontFamily: fonts.body500, fontSize: 12.5, fontVariant: ['tabular-nums'] },
} satisfies Record<string, TextStyle>;
