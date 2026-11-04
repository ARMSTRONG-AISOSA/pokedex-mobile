import Svg, { Circle, Path, Rect } from 'react-native-svg';

/** Icons from the HTML draft, drawn with react-native-svg. 24×24 grid, stroke style. */
export type IconName =
  | 'search'
  | 'moon'
  | 'sun'
  | 'arrow-up'
  | 'heart'
  | 'heart-filled'
  | 'grid'
  | 'shield'
  | 'close'
  | 'back';

type Props = { name: IconName; size?: number; color: string; strokeWidth?: number };

export function Icon({ name, size = 24, color, strokeWidth = 2 }: Props) {
  const stroke = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
      {name === 'search' ? (
        <>
          <Circle cx={11} cy={11} r={7} {...stroke} />
          <Path d="m20 20-3.5-3.5" {...stroke} />
        </>
      ) : null}
      {name === 'moon' ? <Path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" {...stroke} /> : null}
      {name === 'sun' ? (
        <>
          <Circle cx={12} cy={12} r={4} {...stroke} />
          <Path
            d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
            {...stroke}
          />
        </>
      ) : null}
      {name === 'arrow-up' ? <Path d="M12 19V5M5 12l7-7 7 7" {...stroke} /> : null}
      {name === 'heart' || name === 'heart-filled' ? (
        <Path
          d="M12 20.5s-8-4.7-8-10.6A4.4 4.4 0 0 1 12 7.5a4.4 4.4 0 0 1 8 2.4c0 5.9-8 10.6-8 10.6z"
          {...stroke}
          fill={name === 'heart-filled' ? color : 'none'}
        />
      ) : null}
      {name === 'grid' ? (
        <>
          <Rect x={3.5} y={3.5} width={7} height={7} rx={2} {...stroke} />
          <Rect x={13.5} y={3.5} width={7} height={7} rx={2} {...stroke} />
          <Rect x={3.5} y={13.5} width={7} height={7} rx={2} {...stroke} />
          <Rect x={13.5} y={13.5} width={7} height={7} rx={2} {...stroke} />
        </>
      ) : null}
      {name === 'shield' ? <Path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6z" {...stroke} /> : null}
      {name === 'close' ? <Path d="M6 6l12 12M18 6L6 18" {...stroke} /> : null}
      {name === 'back' ? <Path d="M15 5l-7 7 7 7" {...stroke} /> : null}
    </Svg>
  );
}
