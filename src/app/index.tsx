import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSettings } from '@/data/storage/user-data-provider';
import { haptic } from '@/lib/haptics';
import { mix } from '@/theme/color';
import { layout, TYPE_NAMES } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const THEME_ORDER = ['system', 'light', 'dark'] as const;

/**
 * Temporary screen to check the foundations on a device: fonts, colors,
 * light/dark mode, saved settings and haptics. Replaced by the Pokédex list in Phase 6.
 */
export default function Index() {
  const insets = useSafeAreaInsets();
  const { colors, typeColors, text } = useTheme();
  const [settings, setSettings] = useSettings();

  const nextTheme = THEME_ORDER[(THEME_ORDER.indexOf(settings.theme) + 1) % THEME_ORDER.length];

  const cycleTheme = () => {
    haptic('selection');
    setSettings({ ...settings, theme: nextTheme }).catch(() => {
      // The provider already rolled back and logged; nothing else to do on this test screen.
    });
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[text.h1, { color: colors.ink }]}>Pokédex</Text>
          <Text style={[text.subtitle, { color: colors.muted }]}>
            Find a Pokémon, then follow its evolutions.
          </Text>
        </View>
        <Pressable
          onPress={cycleTheme}
          accessibilityRole="button"
          accessibilityLabel={`Theme: ${settings.theme}. Tap to switch to ${nextTheme}.`}
          style={[styles.themeButton, { backgroundColor: colors.field, borderColor: colors.line }]}>
          <Text style={[text.labelStrong, { color: colors.ink }]}>{settings.theme}</Text>
        </Pressable>
      </View>

      <Text style={[text.h3, { color: colors.ink }]}>Type colors</Text>
      <View style={styles.pills}>
        {TYPE_NAMES.map((type) => (
          <View
            key={type}
            style={[styles.pill, { backgroundColor: mix(typeColors[type].c, colors.surface, 24) }]}>
            <View style={[styles.dot, { backgroundColor: typeColors[type].c }]} />
            <Text style={[text.pill, styles.capitalize, { color: colors.ink }]}>{type}</Text>
          </View>
        ))}
      </View>

      <View style={styles.headers}>
        {TYPE_NAMES.map((type) => (
          <View key={type} style={[styles.header18, { backgroundColor: typeColors[type].d }]}>
            <Text style={[text.cardName, styles.capitalize, { color: '#ffffff' }]}>{type}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: layout.screenPadding, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  headerText: { flex: 1, gap: 6 },
  themeButton: {
    minHeight: layout.minTouch,
    minWidth: layout.minTouch,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 24,
    paddingHorizontal: 9,
    borderRadius: 12,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  capitalize: { textTransform: 'capitalize' },
  headers: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  header18: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, minWidth: 100 },
});
