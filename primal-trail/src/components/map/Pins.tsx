import { CREATURES_BY_ID, type NearbyCreature, type NearbyNode } from '@game';
import { StyleSheet, Text, View } from 'react-native';

import { colors, rarityColor } from '@/theme';

import { NODE_EMOJI } from './types';

export function CreaturePin({ creature }: { creature: NearbyCreature }) {
  const def = CREATURES_BY_ID[creature.creatureId];
  return (
    <View style={[styles.creature, { borderColor: rarityColor[def.rarity] }]}>
      <Text style={styles.creatureEmoji}>{def.emoji}</Text>
    </View>
  );
}

export function NodePin({ node, ready }: { node: NearbyNode; ready: boolean }) {
  return (
    <View style={[styles.node, node.type === 'supply_drop' && styles.drop, !ready && styles.depleted]}>
      <Text style={styles.nodeEmoji}>{NODE_EMOJI[node.type]}</Text>
    </View>
  );
}

export function PlayerPin() {
  return (
    <View style={styles.playerHalo}>
      <View style={styles.player}>
        <Text style={styles.playerEmoji}>🧭</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  creature: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 3,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatureEmoji: { fontSize: 26 },
  node: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFFDF7CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drop: { borderWidth: 2, borderColor: colors.accent, backgroundColor: '#FFF3DC' },
  depleted: { opacity: 0.35 },
  nodeEmoji: { fontSize: 20 },
  playerHalo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2F6B4533',
    alignItems: 'center',
    justifyContent: 'center',
  },
  player: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerEmoji: { fontSize: 12 },
});
