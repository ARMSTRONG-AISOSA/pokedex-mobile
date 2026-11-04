import { Tabs } from 'expo-router/js-tabs';
import { useReducedMotion } from 'react-native-reanimated';

import { DetailDim } from '@/features/navigation/detail-dim';
import { FocusGate } from '@/features/navigation/focus-gate';
import { TabBar } from '@/features/navigation/tab-bar';
import { fadeTabs, slideTabs } from '@/features/navigation/tab-transitions';
import { useTheme } from '@/theme/useTheme';

export default function TabsLayout() {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  return (
    <>
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenLayout={({ children }) => <FocusGate>{children}</FocusGate>}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: colors.bg },
          ...(reduceMotion ? fadeTabs : slideTabs),
        }}>
        <Tabs.Screen name="index" options={{ title: 'Pokédex' }} />
        <Tabs.Screen name="team" options={{ title: 'Team' }} />
        <Tabs.Screen name="saved" options={{ title: 'Saved' }} />
      </Tabs>
      <DetailDim />
    </>
  );
}
