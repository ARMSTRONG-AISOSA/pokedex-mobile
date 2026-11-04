import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Skeleton } from '@/components/ui/skeleton';
import { formatHeight, formatWeight, type PokemonAbout } from '@/domain/about';
import { parentOf } from '@/domain/evolution';
import { displayName } from '@/domain/names';
import type { EvolutionNode, TypeName } from '@/domain/types';
import { mix } from '@/theme/color';
import { useTheme } from '@/theme/useTheme';

type Props = {
  about: PokemonAbout;
  pokemonId: number;
  type: TypeName;
  /** The evolution tree, once loaded; used for "Evolves from". */
  tree: EvolutionNode | undefined;
  onOpen: (id: number) => void;
};

/**
 * Category, Pokédex entry, height / weight / generation, abilities and
 * "Evolves from" (design draft, 2026-11-04). Each Pokémon has its own, so it
 * changes when you open another stage from the tree.
 */
export function AboutSection({ about, pokemonId, type, tree, onOpen }: Props) {
  const { colors, typeColors, text } = useTheme();
  const reduceMotion = useReducedMotion();
  const appear = useSharedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (!reduceMotion) appear.set(withTiming(1, { duration: 300 }));
  }, [appear, reduceMotion]);
  const appearStyle = useAnimatedStyle(() => ({
    opacity: appear.value,
    transform: [{ translateY: (1 - appear.value) * 6 }],
  }));

  const parent = tree ? parentOf(tree, pokemonId) : undefined;
  const facts = [
    { label: 'Height', value: about.heightM != null ? formatHeight(about.heightM) : '—' },
    { label: 'Weight', value: about.weightKg != null ? formatWeight(about.weightKg) : '—' },
    { label: 'Generation', value: about.generation ?? '—' },
  ];

  return (
    <Animated.View style={appearStyle}>
      {about.genus || about.isBaby ? (
        <View style={styles.genusRow}>
          {about.genus ? (
            <Text style={[text.label, styles.genus, { color: colors.ink }]}>{about.genus}</Text>
          ) : null}
          {about.isBaby ? (
            <View style={[styles.badge, { backgroundColor: mix(typeColors[type].c, colors.surface, 24) }]}>
              <Text style={[text.pill, { color: colors.ink }]}>Baby</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {about.flavorText ? (
        <Text style={[text.body, styles.description, { color: colors.ink }]}>{about.flavorText}</Text>
      ) : null}

      <View style={styles.facts}>
        {facts.map((fact) => (
          <View
            key={fact.label}
            style={[styles.fact, { backgroundColor: colors.field, borderColor: colors.line }]}
            accessible
            accessibilityLabel={`${fact.label}: ${fact.value}`}>
            <Text style={[text.subtitle, styles.factLabel, { color: colors.muted }]}>{fact.label}</Text>
            <Text style={[text.labelStrong, styles.factValue, { color: colors.ink }]}>{fact.value}</Text>
          </View>
        ))}
      </View>

      {about.abilities.length > 0 ? (
        <View style={styles.abilities}>
          <Text style={[text.subtitle, styles.abilitiesLabel, { color: colors.muted }]}>Abilities</Text>
          {about.abilities.map((ability) => (
            <View
              key={ability.name}
              style={[styles.chip, { backgroundColor: colors.field, borderColor: colors.line }]}
              accessible
              accessibilityLabel={ability.hidden ? `${ability.name}, hidden ability` : ability.name}>
              <Text style={[text.label, styles.chipText, { color: colors.ink }]}>
                {ability.name}
                {ability.hidden ? <Text style={[styles.hidden, { color: colors.muted }]}> hidden</Text> : null}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {tree ? (
        parent ? (
          <View style={styles.fromRow}>
            <Text style={[text.subtitle, { color: colors.muted }]}>Evolves from </Text>
            <Pressable
              onPress={() => onOpen(parent.id)}
              accessibilityRole="link"
              accessibilityLabel={`Evolves from ${displayName(parent.speciesName)}. Open it.`}
              hitSlop={10}>
              <Text style={[text.labelStrong, styles.link, { color: colors.ink }]}>
                {displayName(parent.speciesName)}
              </Text>
            </Pressable>
          </View>
        ) : (
          <Text style={[text.subtitle, styles.from, { color: colors.muted }]}>First stage of its family.</Text>
        )
      ) : null}
    </Animated.View>
  );
}

/** Genus bar, three text lines and three fact boxes while the About data loads. */
export function AboutSkeleton() {
  return (
    <View style={styles.skeleton} accessibilityLabel="Loading" accessibilityState={{ busy: true }}>
      <Skeleton width={140} height={14} />
      <Skeleton width="100%" height={12} />
      <Skeleton width="92%" height={12} />
      <Skeleton width="60%" height={12} />
      <View style={styles.facts}>
        <Skeleton width="31%" height={56} radius={16} />
        <Skeleton width="31%" height={56} radius={16} />
        <Skeleton width="31%" height={56} radius={16} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  genusRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  genus: { fontFamily: 'Figtree_600SemiBold', fontSize: 15 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  description: { lineHeight: 24, marginBottom: 16 },
  facts: { flexDirection: 'row', gap: 8 },
  fact: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1 },
  factLabel: { fontSize: 12.5, lineHeight: 16 },
  factValue: { fontSize: 15, marginTop: 2, fontVariant: ['tabular-nums'] },
  abilities: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 12 },
  abilitiesLabel: { fontSize: 13.5, marginRight: 2 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1 },
  chipText: { fontSize: 13 },
  hidden: { fontSize: 12 },
  fromRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  from: { marginTop: 14 },
  link: { fontSize: 14, textDecorationLine: 'underline' },
  skeleton: { gap: 8 },
});
