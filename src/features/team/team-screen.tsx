import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '@/components/ui/error-state';
import { StatBars } from '@/components/ui/stat-bars';
import { useTeamMembers } from '@/data/queries/useTeamMembers';
import { useUserData } from '@/data/storage/user-data-provider';
import { averageStats, TEAM_SIZE, teamSummary } from '@/domain/team';
import { teamWeakSpots } from '@/domain/typeChart';
import type { Pokemon } from '@/domain/types';
import { errorCopy } from '@/lib/errors';
import { haptic } from '@/lib/haptics';
import { layout } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { PickerSheet } from './picker-sheet';
import { EmptySlot, FilledSlot } from './team-slot';
import { WeakSpotTable } from './weak-spot-table';

/** The Team tab (DESIGN.md §5.3). */
export function TeamScreen() {
  const insets = useSafeAreaInsets();
  const { colors, text } = useTheme();
  const { team, setTeam } = useUserData();
  const { members, error, retry } = useTeamMembers(team);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const save = (next: number[]) => {
    setSaveError(null);
    setTeam(next).catch(() => setSaveError('Couldn’t save your team. Try again.'));
  };

  const openPicker = () => {
    haptic('light');
    setPickerOpen(true);
  };
  const pick = (pokemon: Pokemon) => {
    if (team.length >= TEAM_SIZE || team.includes(pokemon.id)) return;
    haptic('success');
    save([...team, pokemon.id]);
  };
  const remove = (id: number) => {
    haptic('medium');
    save(team.filter((t) => t !== id));
  };
  const clear = () => {
    haptic('medium');
    save([]);
  };
  const open = (id: number) => {
    haptic('light');
    router.push({ pathname: '/pokemon/[id]', params: { id: String(id) } });
  };

  const byId = new Map(members.map((m) => [m.id, m]));
  const ready = team.map((id) => byId.get(id)).filter((m): m is Pokemon => m !== undefined);
  const spots = teamWeakSpots(ready.map((m) => m.types));

  // Six slots, in pairs: filled ones first (in team order), then empty ones.
  const slots: ReactNode[] = [];
  for (let i = 0; i < TEAM_SIZE; i += 1) {
    const id = team[i];
    const member = id !== undefined ? byId.get(id) : undefined;
    slots.push(
      member ? (
        <FilledSlot key={member.id} pokemon={member} onOpen={() => open(member.id)} onRemove={() => remove(member.id)} />
      ) : id !== undefined ? (
        <View key={`loading-${id}`} style={[styles.loadingSlot, { backgroundColor: colors.field }]} />
      ) : (
        <EmptySlot key={`empty-${i}`} slotNumber={i + 1} onPress={openPicker} />
      ),
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 22, paddingBottom: 28 }}>
        <View style={styles.padded}>
          <Text style={[text.h1, { color: colors.ink }]} accessibilityRole="header">
            My team
          </Text>
          <Text style={[text.subtitle, styles.subtitle, { color: colors.muted }]}>
            {team.length} of {TEAM_SIZE} chosen. Pick up to 6 and see how well they cover each other.
          </Text>
        </View>

        <View style={styles.slots}>
          {[0, 2, 4].map((start) => (
            <View key={start} style={styles.slotRow}>
              {slots[start]}
              {slots[start + 1]}
            </View>
          ))}
        </View>

        {saveError ? (
          <Text style={[text.subtitle, styles.padded, styles.saveError, { color: colors.bad }]} accessibilityLiveRegion="polite">
            {saveError}
          </Text>
        ) : null}
        {error ? (
          <View style={styles.section}>
            <ErrorState {...errorCopy(error)} colors={colors} onRetry={retry} />
          </View>
        ) : null}

        {team.length === 0 ? (
          <Text style={[text.subtitle, styles.padded, styles.tip, { color: colors.muted }]}>
            Add Pokémon here, or tap “Add to team” on any Pokémon’s detail screen.
          </Text>
        ) : ready.length > 0 ? (
          <>
            <View style={[styles.section, styles.padded]}>
              <Text style={[text.h3, styles.sectionTitle, { color: colors.ink }]} accessibilityRole="header">
                Type weak spots
              </Text>
              <Text style={[text.subtitle, styles.note, { color: colors.muted }]}>{teamSummary(spots, ready.length)}</Text>
              <WeakSpotTable spots={spots} />
            </View>

            <View style={[styles.section, styles.padded]}>
              <Text style={[text.h3, styles.sectionTitle, { color: colors.ink }]} accessibilityRole="header">
                Average stats
              </Text>
              <Text style={[text.subtitle, styles.note, { color: colors.muted }]}>
                The average of your {ready.length} Pokémon.
              </Text>
              <StatBars stats={averageStats(ready.map((m) => m.stats))} color={colors.ink} showTotal={false} />
            </View>

            <View style={styles.padded}>
              <Pressable
                onPress={clear}
                accessibilityRole="button"
                style={({ pressed }) => [styles.clear, { borderColor: colors.rule, opacity: pressed ? 0.7 : 1 }]}>
                <Text style={[text.label, styles.clearText, { color: colors.ink }]}>Clear team</Text>
              </Pressable>
            </View>
          </>
        ) : null}
      </ScrollView>

      <PickerSheet visible={pickerOpen} teamIds={team} onClose={() => setPickerOpen(false)} onPick={pick} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  padded: { paddingHorizontal: layout.screenPadding },
  subtitle: { marginTop: 6, fontSize: 14.5 },
  slots: { paddingHorizontal: layout.screenPadding, paddingTop: 14, gap: layout.gridGap },
  slotRow: { flexDirection: 'row', gap: layout.gridGap },
  loadingSlot: { flex: 1, minHeight: 168, borderRadius: 22 },
  saveError: { marginTop: 12 },
  tip: { marginTop: 16, fontSize: 13 },
  section: { marginTop: 28 },
  sectionTitle: { marginBottom: 4 },
  note: { marginBottom: 12 },
  clear: {
    alignSelf: 'flex-start',
    marginTop: 26,
    height: 46,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
  },
  clearText: { fontFamily: 'Figtree_600SemiBold' },
});
