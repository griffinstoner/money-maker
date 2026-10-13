import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { colors } from '@/theme';

const icon = (emoji: string) =>
  function TabIcon({ focused }: { focused: boolean }) {
    return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
  };

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Explore', tabBarIcon: icon('🗺️') }} />
      <Tabs.Screen name="bag" options={{ title: 'Bag', tabBarIcon: icon('🎒') }} />
      <Tabs.Screen name="craft" options={{ title: 'Craft', tabBarIcon: icon('🔨') }} />
      <Tabs.Screen name="creatures" options={{ title: 'Creatures', tabBarIcon: icon('🦕') }} />
      <Tabs.Screen name="profile" options={{ title: 'Survivor', tabBarIcon: icon('🧍') }} />
    </Tabs>
  );
}
