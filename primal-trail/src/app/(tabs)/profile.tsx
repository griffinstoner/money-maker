import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { backend } from '@/backend';
import { SafetyTips } from '@/components/SafetyTips';
import { SurvivalHud } from '@/components/SurvivalHud';
import { Button, Card, H1, Muted } from '@/components/ui';
import { useGame } from '@/game/GameProvider';
import { colors, space } from '@/theme';

export default function Profile() {
  const { account, player, creatures, mode } = useGame();
  if (!player) return null;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <H1>Survivor</H1>
        <Muted>{account?.email}</Muted>
        <SurvivalHud player={player} />
        <Card style={styles.stats}>
          <Stat label="Level" value={player.level} />
          <Stat label="XP" value={player.xp} />
          <Stat label="Tamed" value={creatures.length} />
        </Card>
        <Card style={{ gap: space(2) }}>
          <Text style={styles.title}>How survival works</Text>
          <Muted>
            Hunger drains slowly, about a day from full to empty, so taking a break never hurts. If you starve, health drops but
            never below 20. Eat to stay well fed: you heal naturally while hunger is above 50. Gathering uses stamina, which
            refills over time.
          </Muted>
        </Card>
        <Card style={{ gap: space(3) }}>
          <Text style={styles.title}>Play safe</Text>
          <SafetyTips />
        </Card>
        <Muted style={{ textAlign: 'center' }}>
          {mode === 'offline' ? 'Offline playtest mode: progress is stored on this device.' : 'Connected to the Primal Trail server.'}
        </Muted>
        <Button testID="sign-out" title="Sign out" variant="ghost" onPress={() => backend.signOut()} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={styles.value}>{value}</Text>
      <Muted>{label}</Muted>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: space(4), gap: space(4), maxWidth: 640, width: '100%', alignSelf: 'center' },
  stats: { flexDirection: 'row' },
  value: { fontSize: 24, fontWeight: '900', color: colors.ink },
  title: { fontSize: 17, fontWeight: '800', color: colors.ink },
});
