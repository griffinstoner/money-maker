import { CREATURES, CREATURES_BY_ID, RARITY_ORDER } from '@game';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, H1, Muted, Pill } from '@/components/ui';
import { useGame } from '@/game/GameProvider';
import { colors, radius, rarityColor, space } from '@/theme';

export default function Creatures() {
  const { creatures } = useGame();
  const discovered = new Set(creatures.map((c) => c.creatureId));
  const guide = [...CREATURES].sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity));

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <H1>Your creatures</H1>
        {creatures.length === 0 ? (
          <Card>
            <Muted>
              None yet. Find a creature on the map and walk up to it. Gentle ones like Pebblesnout only need berries. Tougher
              ones need a Slingshot first (craft one from wood and fiber).
            </Muted>
          </Card>
        ) : (
          creatures.map((c) => {
            const def = CREATURES_BY_ID[c.creatureId];
            return (
              <Pressable key={c.id} onPress={() => router.push({ pathname: '/creature/[id]', params: { id: c.id } })} testID={`tamed-${c.creatureId}`}>
                <Card style={styles.row}>
                  <Text style={styles.emoji}>{def.emoji}</Text>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.name}>{c.nickname ?? def.name}</Text>
                    <Muted>
                      Lv {c.level} {def.name} · {def.role}
                    </Muted>
                  </View>
                  <Pill text={def.rarity} color={rarityColor[def.rarity]} />
                </Card>
              </Pressable>
            );
          })
        )}

        <View style={styles.guideHead}>
          <H1 style={{ fontSize: 20 }}>Field guide</H1>
          <Muted>
            {discovered.size}/{CREATURES.length} discovered
          </Muted>
        </View>
        <View style={styles.grid}>
          {guide.map((def) => {
            const seen = discovered.has(def.id);
            return (
              <View key={def.id} style={[styles.tile, { borderColor: rarityColor[def.rarity] }]}>
                <Text style={[styles.tileEmoji, !seen && { opacity: 0.25 }]}>{seen ? def.emoji : '❔'}</Text>
                <Text style={styles.tileName} numberOfLines={1}>
                  {seen ? def.name : '???'}
                </Text>
                <Text style={[styles.tileHint, { color: rarityColor[def.rarity] }]}>
                  {def.spawnsInMvp ? def.rarity : 'coming soon'}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space(4), gap: space(3), maxWidth: 640, width: '100%', alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space(3), padding: space(3) },
  emoji: { fontSize: 34, width: 44, textAlign: 'center' },
  name: { fontSize: 17, fontWeight: '800', color: colors.ink },
  guideHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: space(4) },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
  tile: {
    width: '31.5%',
    alignItems: 'center',
    padding: space(2),
    borderRadius: radius,
    borderWidth: 1.5,
    backgroundColor: colors.card,
  },
  tileEmoji: { fontSize: 30 },
  tileName: { fontSize: 13, fontWeight: '700', color: colors.ink, marginTop: 2 },
  tileHint: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
});
