import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layout } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

/** Temporary screen for tabs that are not built yet. */
export function PlaceholderScreen({ title, message }: { title: string; message: string }) {
  const insets = useSafeAreaInsets();
  const { colors, text } = useTheme();
  return (
    <View style={[styles.screen, { paddingTop: insets.top + 22, backgroundColor: colors.bg }]}>
      <Text style={[text.h1, { color: colors.ink }]} accessibilityRole="header">
        {title}
      </Text>
      <Text style={[text.subtitle, { color: colors.muted }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: layout.screenPadding, gap: 6 },
});
