import { ITEMS, type ItemCategory, type ItemId } from '@game';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SurvivalHud } from '@/components/SurvivalHud';
import { Button, Card, H1, Muted } from '@/components/ui';
import { useGame } from '@/game/GameProvider';
import { colors, space } from '@/theme';

const SECTIONS: [ItemCategory, string][] = [
  ['food', 'Food'],
  ['medical', 'Medical'],
  ['taming_food', 'Taming food'],
  ['resource', 'Resources'],
  ['ammo', 'Ammo'],
  ['weapon', 'Weapons'],
  ['tool', 'Tools'],
];

export default function Bag() {
  const { player, act, showToast } = useGame();
  if (!player) return null;
  const owned = (Object.entries(player.inventory) as [ItemId, number][]).filter(([, n]) => n > 0);

  async function use(id: ItemId) {
    const def = ITEMS[id];
    const r = await act({ type: 'consume', itemId: id });
    if (r) showToast(def.hunger ? `Ate ${def.name}. +${def.hunger} hunger` : `Used ${def.name}. +${def.heal} health`, 'success');
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <H1>Bag</H1>
        <SurvivalHud player={player} />
        {owned.length === 0 && <Muted>Empty. Tap trees, rocks and bushes on the map to gather.</Muted>}
        {SECTIONS.map(([cat, title]) => {
          const items = owned.filter(([id]) => ITEMS[id].category === cat);
          if (!items.length) return null;
          return (
            <View key={cat} style={{ gap: space(2) }}>
              <Text style={styles.section}>{title}</Text>
              {items.map(([id, qty]) => {
                const def = ITEMS[id];
                const usable = !!(def.hunger || def.heal);
                return (
                  <Card key={id} style={styles.row}>
                    <Text style={styles.emoji}>{def.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.name} testID={`item-${id}`}>
                        {def.name} <Text style={styles.qty}>×{qty}</Text>
                      </Text>
                      <Muted>{def.description}</Muted>
                    </View>
                    {usable && (
                      <Button
                        testID={`use-${id}`}
                        title={def.hunger ? 'Eat' : 'Use'}
                        variant="ghost"
                        onPress={() => use(id)}
                        style={{ minHeight: 38, paddingHorizontal: space(3) }}
                      />
                    )}
                  </Card>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space(4), gap: space(4), maxWidth: 640, width: '100%', alignSelf: 'center' },
  section: { fontSize: 13, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', letterSpacing: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space(3), padding: space(3) },
  emoji: { fontSize: 30, width: 40, textAlign: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: colors.ink },
  qty: { color: colors.primary },
});
