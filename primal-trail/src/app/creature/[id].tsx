import { CREATURES_BY_ID } from '@game';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { BackendError, backend } from '@/backend';
import { Bar, Button, Card, Muted, Pill } from '@/components/ui';
import { useGame } from '@/game/GameProvider';
import { colors, radius, rarityColor, space } from '@/theme';

const STAT_MAX = { health: 400, attack: 60, speed: 35, stamina: 300 };
const STAT_ICON = { health: '❤️', attack: '⚔️', speed: '💨', stamina: '⚡' };

export default function CreatureDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { creatures, refreshCreatures, showToast } = useGame();
  const c = creatures.find((x) => x.id === id);
  const [name, setName] = useState(c?.nickname ?? '');
  const [saving, setSaving] = useState(false);
  if (!c) return <Muted style={{ padding: space(6) }}>Creature not found.</Muted>;
  const def = CREATURES_BY_ID[c.creatureId];

  async function save() {
    setSaving(true);
    try {
      await backend.renameCreature(c!.id, name);
      await refreshCreatures();
      showToast('Saved.', 'success');
    } catch (e) {
      showToast(e instanceof BackendError ? e.message : "Couldn't save.", 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.emoji}>{def.emoji}</Text>
        <Text style={styles.name}>{c.nickname ?? def.name}</Text>
        <View style={{ flexDirection: 'row', gap: space(2) }}>
          <Pill text={def.rarity} color={rarityColor[def.rarity]} />
          <Pill text={def.role} color={colors.primaryDark} />
          <Pill text={`Lv ${c.level}`} color={colors.accent} />
        </View>
      </View>
      <Card style={{ gap: space(3) }}>
        {(Object.keys(STAT_MAX) as (keyof typeof STAT_MAX)[]).map((k) => (
          <View key={k}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>
                {STAT_ICON[k]} {k}
              </Text>
              <Text style={styles.statLabel}>{c.stats[k]}</Text>
            </View>
            <Bar value={c.stats[k]} max={STAT_MAX[k]} color={colors.primary} />
          </View>
        ))}
      </Card>
      <Card style={{ gap: space(2) }}>
        <Text style={styles.statLabel}>{def.name}</Text>
        <Muted>{def.description}</Muted>
        <Muted>Tamed {new Date(c.tamedAt).toLocaleDateString()}</Muted>
        <Muted>Riding and battles arrive in a later update.</Muted>
      </Card>
      <Card style={{ gap: space(3) }}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          maxLength={24}
          placeholder="Nickname"
          placeholderTextColor={colors.muted}
        />
        <Button title="Save name" onPress={save} busy={saving} variant="ghost" />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space(4), gap: space(4), maxWidth: 560, width: '100%', alignSelf: 'center' },
  hero: { alignItems: 'center', gap: space(2) },
  emoji: { fontSize: 88 },
  name: { fontSize: 28, fontWeight: '900', color: colors.ink },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  statLabel: { fontSize: 15, fontWeight: '700', color: colors.ink, textTransform: 'capitalize' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    paddingHorizontal: space(4),
    minHeight: 48,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.white,
  },
});
