import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SafetyTips } from '@/components/SafetyTips';
import { Button, Card, H1 } from '@/components/ui';
import { useGame } from '@/game/GameProvider';
import { colors, space } from '@/theme';

export default function Safety() {
  const { act } = useGame();
  const [busy, setBusy] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.icon}>⚠️</Text>
        <H1 style={{ textAlign: 'center' }}>Before you head out</H1>
        <Text style={styles.lead}>Primal Trail is played in the real world. Please keep these in mind:</Text>
        <Card>
          <SafetyTips />
        </Card>
        <Button
          testID="ack-safety"
          title="I understand, let's go"
          busy={busy}
          onPress={async () => {
            setBusy(true);
            await act({ type: 'ack_safety' });
            setBusy(false);
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space(6), gap: space(5), maxWidth: 520, width: '100%', alignSelf: 'center' },
  icon: { fontSize: 56, textAlign: 'center' },
  lead: { fontSize: 16, color: colors.muted, textAlign: 'center' },
});
