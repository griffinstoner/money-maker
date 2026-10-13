import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastHost } from '@/components/ToastHost';
import { Button } from '@/components/ui';
import { GameProvider, useGame } from '@/game/GameProvider';
import { colors, space } from '@/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GameProvider>
        <StatusBar style="dark" />
        <RootStack />
        <ToastHost />
      </GameProvider>
    </SafeAreaProvider>
  );
}

function RootStack() {
  const { account, player, act } = useGame();

  if (account === undefined) return <Splash />;
  const signedIn = account !== null;
  if (signedIn && !player) return <Splash onRetry={() => void act({ type: 'sync' })} />;
  const safetyOk = !!player?.safetyAcknowledgedAt;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="sign-in" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn && !safetyOk}>
        <Stack.Screen name="safety" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn && safetyOk}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="tame" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
        <Stack.Screen
          name="creature/[id]"
          options={{ headerShown: true, title: '', headerTintColor: colors.primaryDark, headerStyle: { backgroundColor: colors.bg } }}
        />
      </Stack.Protected>
    </Stack>
  );
}

function Splash({ onRetry }: { onRetry?: () => void }) {
  return (
    <View style={styles.splash}>
      <Text style={styles.logo}>🦖</Text>
      <Text style={styles.title}>Primal Trail</Text>
      <ActivityIndicator color={colors.accent} style={{ marginTop: space(6) }} />
      {onRetry && <Button title="Retry" variant="ghost" onPress={onRetry} style={{ marginTop: space(6), borderColor: colors.accent }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center' },
  logo: { fontSize: 72 },
  title: { color: colors.white, fontSize: 32, fontWeight: '900', marginTop: space(2) },
});
