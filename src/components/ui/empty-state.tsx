import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/useTheme';

/** "Nothing matches" style message that invites the next action (DESIGN.md §10). */
export function EmptyState({ title, message }: { title: string; message: string }) {
  const { colors, text } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={[text.h3, styles.title, { color: colors.ink }]}>{title}</Text>
      <Text style={[text.body, styles.message, { color: colors.muted }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 40, marginHorizontal: 28, alignItems: 'center', gap: 6 },
  title: { fontSize: 20, textAlign: 'center' },
  message: { textAlign: 'center' },
});
