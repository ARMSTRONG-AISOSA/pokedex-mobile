import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { haptic } from '@/lib/haptics';
import { useTheme } from '@/theme/useTheme';

const TABS: Record<string, { label: string; icon: IconName }> = {
  index: { label: 'Pokédex', icon: 'grid' },
  team: { label: 'Team', icon: 'shield' },
  saved: { label: 'Saved', icon: 'heart' },
};

/**
 * Custom tab bar matching the draft (D-008): 64 tall plus the bottom safe area,
 * a short bar above the active tab. The sliding indicator and icon lift come in Phase 9.
 */
export function TabBar({ state, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const { colors, text } = useTheme();

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.bar,
        { paddingBottom: insets.bottom, backgroundColor: colors.surface, borderTopColor: colors.line },
      ]}>
      {state.routes.map((route, index) => {
        const tab = TABS[route.name] ?? { label: route.name, icon: 'grid' as const };
        const focused = index === state.index;
        const color = focused ? colors.ink : colors.muted;

        const onPress = () => {
          const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            haptic('selection');
            navigateToTab(route.key);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            onLongPress={() => emitter.emit({ type: 'tabLongPress', target: route.key })}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={tab.label}
            style={styles.tab}>
            {focused ? <View style={[styles.indicator, { backgroundColor: colors.ink }]} /> : null}
            <Icon name={tab.icon} size={24} color={color} />
            <Text style={[text.labelStrong, styles.label, { color }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: 1 },
  tab: { flex: 1, height: 64, alignItems: 'center', justifyContent: 'center', gap: 2 },
  indicator: {
    position: 'absolute',
    top: -1,
    width: 36,
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  label: { fontSize: 12 },
});
