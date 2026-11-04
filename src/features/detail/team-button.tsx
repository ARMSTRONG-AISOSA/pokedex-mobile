import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/theme/useTheme';

type Props = {
  onTeam: boolean;
  teamFull: boolean;
  /** The Pokémon's deep type color. */
  color: string;
  onPress: () => void;
};

/** "Add to team" / "Remove from team" / disabled "Team is full (6 of 6)" (DESIGN.md §10). */
export function TeamButton({ onTeam, teamFull, color, onPress }: Props) {
  const { colors, text } = useTheme();
  const disabled = teamFull && !onTeam;
  const label = onTeam ? 'Remove from team' : disabled ? 'Team is full (6 of 6)' : 'Add to team';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        disabled
          ? { backgroundColor: colors.line }
          : onTeam
            ? { backgroundColor: 'transparent', borderWidth: 2, borderColor: color }
            : { backgroundColor: color },
        { opacity: pressed ? 0.85 : 1 },
      ]}>
      <Text style={[text.label, styles.label, { color: disabled ? colors.muted : onTeam ? colors.ink : '#ffffff' }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: 'Figtree_600SemiBold', fontSize: 16 },
});
