import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Skeleton } from '@/components/ui/skeleton';
import { usePokemon } from '@/data/queries/usePokemon';
import { displayName, formatDexNumber } from '@/domain/names';
import type { EvolutionNode } from '@/domain/types';
import { Artwork } from '@/features/pokedex/pokemon-card';
import { mix } from '@/theme/color';
import { layout } from '@/theme/tokens';
import { useTextGrowth } from '@/theme/useTextGrowth';
import { useTheme } from '@/theme/useTheme';

/** Sizes from DESIGN.md §4. */
const NODE_W = 70;
const NODE_H = 92;
const EDGE_W = 66;

type Props = {
  root: EvolutionNode;
  currentId: number;
  onOpen: (id: number) => void;
};

/**
 * The evolution tree (DESIGN.md §5.2). Drawn recursively: each node is followed
 * by a column of its children, each reached through a labeled arrow. A node
 * with several children gets a vertical bracket line. Wide trees scroll sideways.
 */
export function EvolutionTree({ root, currentId, onOpen }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}>
      <Branch node={root} currentId={currentId} onOpen={onOpen} />
    </ScrollView>
  );
}

function Branch({ node, currentId, onOpen }: { node: EvolutionNode } & Omit<Props, 'root'>) {
  const { colors } = useTheme();
  const multi = node.children.length > 1;
  return (
    <View style={styles.row}>
      <NodeCard node={node} current={node.id === currentId} onOpen={onOpen} />
      {node.children.length > 0 ? (
        <View style={styles.kids}>
          {multi ? <View style={[styles.bracket, { backgroundColor: colors.rule }]} /> : null}
          {node.children.map((child) => (
            <View key={child.id} style={styles.kid}>
              <Edge label={child.via} />
              <Branch node={child} currentId={currentId} onOpen={onOpen} />
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function NodeCard({ node, current, onOpen }: { node: EvolutionNode; current: boolean; onOpen: (id: number) => void }) {
  const { colors, typeColors, text } = useTheme();
  const grow = useTextGrowth();
  // Usually instant: the list's summary already holds every Pokémon.
  const { data: pokemon } = usePokemon(node.id);
  const name = displayName(node.speciesName);
  const type = pokemon?.types[0];

  return (
    <Pressable
      onPress={() => onOpen(node.id)}
      disabled={current}
      accessibilityRole="button"
      accessibilityLabel={`${name}, number ${node.id}${current ? ', current' : ''}${node.via ? `, ${node.via}` : ''}`}
      accessibilityState={{ selected: current }}
      style={({ pressed }) => [
        styles.node,
        { width: NODE_W * grow },
        current && type
          ? { backgroundColor: mix(typeColors[type].c, colors.surface, 20), borderColor: typeColors[type].d, borderWidth: 2 }
          : { backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1 },
        { opacity: pressed ? 0.8 : 1 },
      ]}>
      {pokemon ? <Artwork pokemon={pokemon} size={40} /> : <Skeleton width={40} height={40} radius={20} />}
      <Text
        style={[text.cardName, styles.nodeName, { color: colors.ink }]}
        numberOfLines={1}
        // Long names (Umbreon, Crabominable) shrink a little instead of breaking mid-word.
        adjustsFontSizeToFit
        minimumFontScale={0.7}>
        {name}
      </Text>
      <Text style={[text.dexNumber, styles.nodeNumber, { color: colors.muted }]}>{formatDexNumber(node.id)}</Text>
    </Pressable>
  );
}

/** Arrow with the "how it evolves" label above it. */
function Edge({ label }: { label: string }) {
  const { colors, text } = useTheme();
  const grow = useTextGrowth();
  return (
    <View style={[styles.edge, { width: EDGE_W * grow }]} accessible={false}>
      <View style={styles.edgeLabelArea}>
        <Text style={[text.subtitle, styles.edgeLabel, { color: colors.muted }]} numberOfLines={3}>
          {label}
        </Text>
      </View>
      <View style={styles.arrowRow}>
        <View style={[styles.line, { backgroundColor: colors.rule }]} />
        <Svg width={7} height={10} viewBox="0 0 7 10">
          <Path d="M0 0L7 5L0 10z" fill={colors.rule} />
        </Svg>
      </View>
      <View style={styles.edgeLabelArea} />
    </View>
  );
}

/** Three node-sized blocks joined by short bars (DESIGN.md §8). */
export function EvolutionTreeSkeleton() {
  return (
    <View style={[styles.row, styles.skeleton]} accessibilityLabel="Loading" accessibilityState={{ busy: true }}>
      <Skeleton width={NODE_W} height={NODE_H} radius={18} />
      <Skeleton width={34} height={10} />
      <Skeleton width={NODE_W} height={NODE_H} radius={18} />
      <Skeleton width={34} height={10} />
      <Skeleton width={NODE_W} height={NODE_H} radius={18} />
    </View>
  );
}

const styles = StyleSheet.create({
  // Bleed to the screen edges so a wide tree can scroll fully into view.
  scroll: { marginHorizontal: -layout.screenPadding },
  scrollContent: { paddingHorizontal: layout.screenPadding, paddingTop: 6, paddingBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  kids: { position: 'relative' },
  bracket: { position: 'absolute', left: 0, top: NODE_H / 2, bottom: NODE_H / 2, width: 2 },
  kid: { flexDirection: 'row', alignItems: 'center', minHeight: NODE_H },
  node: {
    width: NODE_W,
    minHeight: NODE_H,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  nodeName: { fontSize: 12.5, lineHeight: 14, letterSpacing: 0, textAlign: 'center' },
  nodeNumber: { fontSize: 11 },
  edge: { width: EDGE_W, alignSelf: 'stretch' },
  edgeLabelArea: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 4, paddingBottom: 3 },
  edgeLabel: { fontSize: 10.5, lineHeight: 12, textAlign: 'center' },
  arrowRow: { flexDirection: 'row', alignItems: 'center', height: 10 },
  line: { flex: 1, height: 2 },
  skeleton: { gap: 10, paddingVertical: 6 },
});
