import { StyleSheet, Text, View } from 'react-native';

import { TypePill } from '@/components/ui/type-pill';
import { formatMultiplier, matchupsFor, type Matchup } from '@/domain/typeChart';
import type { TypeName } from '@/domain/types';
import { useTheme } from '@/theme/useTheme';

/** "Weak to", "Resists" and (if any) "Immune to", across all 18 types (DESIGN.md §5.2). */
export function MatchupGroups({ types }: { types: readonly TypeName[] }) {
  const { weakTo, resists, immuneTo } = matchupsFor(types);
  return (
    <View style={styles.groups}>
      <Group label="Weak to" items={weakTo} showMultiplier />
      <Group label="Resists" items={resists} showMultiplier />
      {immuneTo.length > 0 ? <Group label="Immune to" items={immuneTo} showMultiplier={false} /> : null}
    </View>
  );
}

function Group({ label, items, showMultiplier }: { label: string; items: Matchup[]; showMultiplier: boolean }) {
  const { colors, text } = useTheme();
  return (
    <View>
      <Text style={[text.subtitle, styles.label, { color: colors.muted }]}>{label}</Text>
      {items.length > 0 ? (
        <View style={styles.pills}>
          {items.map((m) => (
            <TypePill
              key={m.type}
              type={m.type}
              size="large"
              suffix={showMultiplier ? formatMultiplier(m.multiplier) : undefined}
            />
          ))}
        </View>
      ) : (
        <Text style={[text.subtitle, { color: colors.muted }]}>None</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  groups: { gap: 14 },
  label: { fontSize: 13.5, marginBottom: 6 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
});
