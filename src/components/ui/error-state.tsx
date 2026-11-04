import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Palette } from '@/theme/tokens';
import { text } from '@/theme/typography';

type Props = {
  title: string;
  message: string;
  colors: Palette;
  onRetry?: () => void;
  retryLabel?: string;
};

/**
 * Says what happened and how to fix it, with a Retry button (DESIGN.md §10).
 * Takes `colors` as a prop so it also works in the root error boundary,
 * which renders outside the app's providers.
 */
export function ErrorState({ title, message, colors, onRetry, retryLabel = 'Try again' }: Props) {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={[text.h3, { color: colors.ink }]}>{title}</Text>
      <Text style={[text.body, styles.message, { color: colors.muted }]}>{message}</Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: colors.ink, opacity: pressed ? 0.8 : 1 },
          ]}>
          <Text style={[text.label, { color: colors.bg }]}>{retryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  message: {
    textAlign: 'center',
    maxWidth: 320,
  },
  button: {
    marginTop: 12,
    minHeight: 44,
    paddingHorizontal: 22,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
