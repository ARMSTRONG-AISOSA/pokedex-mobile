import { useIsFocused } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * Wraps each tab. While tabs slide (D-027), the tab you just left stays on
 * screen for a moment, invisible but stacked on top on Android, and would
 * catch taps meant for the new tab. Only the focused tab takes touches.
 */
export function FocusGate({ children }: { children: ReactNode }) {
  const focused = useIsFocused();
  return (
    <View style={styles.fill} pointerEvents={focused ? 'auto' : 'none'}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
