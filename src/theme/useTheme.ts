import { useColorScheme } from 'react-native';

import { useSettings } from '@/data/storage/user-data-provider';

import { palettes, typeColors, type ColorScheme, type Palette } from './tokens';
import { text } from './typography';

export type Theme = {
  scheme: ColorScheme;
  colors: Palette;
  typeColors: typeof typeColors;
  text: typeof text;
};

/** Light or dark, following the system unless the user picked one in settings. */
export function useTheme(): Theme {
  const system = useColorScheme();
  const [settings] = useSettings();
  const scheme: ColorScheme =
    settings.theme === 'system' ? (system === 'dark' ? 'dark' : 'light') : settings.theme;
  return { scheme, colors: palettes[scheme], typeColors, text };
}
