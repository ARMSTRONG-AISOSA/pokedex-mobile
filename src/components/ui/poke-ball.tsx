import Svg, { Circle, Path, Rect } from 'react-native-svg';

import type { TypeName } from '@/domain/types';
import { useTheme } from '@/theme/useTheme';

/**
 * Poké Ball tinted by the Pokémon's types: top = first type, bottom = second
 * type (or white). Used while artwork loads and if it fails (DESIGN.md §12).
 */
export function PokeBall({ types, size }: { types: readonly TypeName[]; size: number }) {
  const { typeColors } = useTheme();
  const top = typeColors[types[0]].c;
  const second = types[1];
  const bottom = second ? typeColors[second].c : '#ffffff';
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessible={false}>
      <Circle cx={50} cy={50} r={46} fill={top} />
      <Path d="M4 50a46 46 0 0 0 92 0z" fill={bottom} opacity={second ? 0.9 : 0.92} />
      <Rect x={4} y={46} width={92} height={8} fill="#13222b" opacity={0.85} />
      <Circle cx={50} cy={50} r={14} fill="#ffffff" stroke="#13222b" strokeWidth={6} />
    </Svg>
  );
}
