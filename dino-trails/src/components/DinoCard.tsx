import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TIER_COLORS } from '../data/species';
import { Spawn } from '../game/spawns';

/** How close (meters) you must be to start taming. */
export const TAME_RANGE_METERS = 40;

interface Props {
  spawn: Spawn;
  distance: number;
  now: number;
  onClose: () => void;
}

export function DinoCard({ spawn, distance, now, onClose }: Props) {
  const { species } = spawn;
  const inRange = distance <= TAME_RANGE_METERS;
  const minutesLeft = Math.max(0, Math.ceil((spawn.despawnsAt - now) / 60000));

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{species.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{species.name}</Text>
          <Text style={[styles.tier, { color: TIER_COLORS[species.tier] }]}>
            {species.tier.toUpperCase()} · {species.diet} · {species.role}
          </Text>
        </View>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
      </View>

      <View style={styles.stats}>
        <Stat label="HP" value={species.base.hp} />
        <Stat label="ATK" value={species.base.attack} />
        <Stat label="SPD" value={species.base.speed} />
        <Stat label="STA" value={species.base.stamina} />
      </View>

      <Text style={styles.meta}>
        {Math.round(distance)} m away · leaves in {minutesLeft} min
      </Text>

      <View style={[styles.button, !inRange && styles.buttonDisabled]}>
        <Text style={styles.buttonText}>
          {inRange ? 'Taming arrives in M2 🦴' : `Walk closer (${TAME_RANGE_METERS} m to tame)`}
        </Text>
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 36,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emoji: { fontSize: 44 },
  name: { fontSize: 22, fontWeight: '800' },
  tier: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  close: { fontSize: 22, color: '#888' },
  stats: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 12, color: '#777' },
  meta: { textAlign: 'center', color: '#555', marginBottom: 12 },
  button: { backgroundColor: '#689F38', borderRadius: 12, paddingVertical: 14 },
  buttonDisabled: { backgroundColor: '#9E9E9E' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center' },
});
