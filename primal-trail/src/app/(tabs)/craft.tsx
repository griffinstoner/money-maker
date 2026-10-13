import { ITEMS, type ItemId, RECIPES } from '@game';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, H1, Muted, Pill } from '@/components/ui';
import { useGame } from '@/game/GameProvider';
import { colors, space } from '@/theme';

export default function Craft() {
  const { player, act, showToast } = useGame();
  if (!player) return null;
  const inv = player.inventory;
  const recipes = [...RECIPES].sort((a, b) => a.unlockLevel - b.unlockLevel);

  async function craft(id: string) {
    const recipe = RECIPES.find((r) => r.id === id)!;
    const r = await act({ type: 'craft', recipeId: id });
    if (r) showToast(`Crafted ${recipe.outputQty > 1 ? `${recipe.outputQty}× ` : ''}${ITEMS[recipe.output].name}! (+${r.event.kind === 'craft' ? r.event.xp : 0} XP)`, 'success');
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <H1>Crafting</H1>
        <Muted>New recipes unlock as you level up. You are level {player.level}.</Muted>
        {recipes.map((r) => {
          const out = ITEMS[r.output];
          const locked = player.level < r.unlockLevel;
          const isGear = out.category === 'tool' || out.category === 'weapon';
          const owned = isGear && (inv[r.output] ?? 0) > 0;
          const inputs = Object.entries(r.inputs) as [ItemId, number][];
          const affordable = inputs.every(([id, n]) => (inv[id] ?? 0) >= n);
          return (
            <Card key={r.id} style={[styles.card, locked && { opacity: 0.6 }]}>
              <View style={styles.head}>
                <Text style={styles.emoji}>{locked ? '🔒' : out.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>
                    {out.name}
                    {r.outputQty > 1 ? ` ×${r.outputQty}` : ''}
                  </Text>
                  <Muted>{out.description}</Muted>
                </View>
                {locked && <Pill text={`Lv ${r.unlockLevel}`} color={colors.muted} />}
                {owned && <Pill text="Owned" color={colors.primary} />}
              </View>
              <View style={styles.inputs}>
                {inputs.map(([id, n]) => {
                  const have = inv[id] ?? 0;
                  return (
                    <Text key={id} style={[styles.input, { color: have >= n ? colors.primary : colors.danger }]}>
                      {ITEMS[id].emoji} {Math.min(have, n)}/{n} {ITEMS[id].name}
                    </Text>
                  );
                })}
              </View>
              {!locked && !owned && (
                <Button testID={`craft-${r.id}`} title="Craft" disabled={!affordable} onPress={() => craft(r.id)} variant="secondary" />
              )}
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space(4), gap: space(3), maxWidth: 640, width: '100%', alignSelf: 'center' },
  card: { gap: space(3) },
  head: { flexDirection: 'row', alignItems: 'center', gap: space(3) },
  emoji: { fontSize: 32, width: 42, textAlign: 'center' },
  name: { fontSize: 17, fontWeight: '800', color: colors.ink },
  inputs: { flexDirection: 'row', flexWrap: 'wrap', gap: space(3) },
  input: { fontSize: 14, fontWeight: '600' },
});
