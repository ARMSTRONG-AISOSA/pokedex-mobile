import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/ui/icon';
import { haptic } from '@/lib/haptics';
import { duration, ease } from '@/theme/motion';
import { useTheme } from '@/theme/useTheme';

const TABS: Record<string, { label: string; icon: IconName }> = {
  index: { label: 'Pokédex', icon: 'grid' },
  team: { label: 'Team', icon: 'shield' },
  saved: { label: 'Saved', icon: 'heart' },
};

const INDICATOR_WIDTH = 36;

/**
 * Custom tab bar matching the draft (D-008): 64 tall plus the bottom safe area.
 * A short bar above the active tab slides to the new tab, and the active icon
 * lifts 2 px and grows a little (DESIGN.md §7 "Tab indicator").
 */
export function TabBar({ state, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const { colors, text } = useTheme();
  const reduceMotion = useReducedMotion();
  const [barWidth, setBarWidth] = useState(0);
  const tabWidth = barWidth / state.routes.length;

  // Position of the indicator, measured in tabs (0, 1, 2).
  const position = useSharedValue(state.index);
  useEffect(() => {
    position.set(
      reduceMotion ? state.index : withTiming(state.index, { duration: duration.tabIndicator, easing: ease.out }),
    );
  }, [state.index, position, reduceMotion]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value * tabWidth + (tabWidth - INDICATOR_WIDTH) / 2 }],
  }));

  return (
    <View
      accessibilityRole="tablist"
      onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
      style={[
        styles.bar,
        { paddingBottom: insets.bottom, backgroundColor: colors.surface, borderTopColor: colors.line },
      ]}>
      {state.routes.map((route, index) => {
        const tab = TABS[route.name] ?? { label: route.name, icon: 'grid' as const };
        const focused = index === state.index;

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
            <TabIcon name={tab.icon} focused={focused} color={focused ? colors.ink : colors.muted} />
            <Text style={[text.labelStrong, styles.label, { color: focused ? colors.ink : colors.muted }]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
      {barWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.indicator, { backgroundColor: colors.ink }, indicatorStyle]}
        />
      ) : null}
    </View>
  );
}

/** The tab icon: lifts 2 px and scales to 1.1 when its tab becomes active. */
function TabIcon({ name, focused, color }: { name: IconName; focused: boolean; color: string }) {
  const reduceMotion = useReducedMotion();
  const lift = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    const to = focused ? 1 : 0;
    lift.set(reduceMotion ? to : withTiming(to, { duration: duration.tabIcon, easing: ease.overshoot }));
  }, [focused, lift, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -2 * lift.value }, { scale: 1 + 0.1 * lift.value }],
  }));

  return (
    <Animated.View style={style}>
      <Icon name={name} size={24} color={color} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: 1 },
  tab: { flex: 1, height: 64, alignItems: 'center', justifyContent: 'center', gap: 2 },
  indicator: {
    position: 'absolute',
    top: -1,
    left: 0,
    width: INDICATOR_WIDTH,
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  label: { fontSize: 12 },
});
