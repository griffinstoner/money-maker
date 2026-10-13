import type { PlayerView } from '@game';
import { StyleSheet, Text, View } from 'react-native';

import { Bar } from '@/components/ui';
import { colors, radius, space } from '@/theme';

export function SurvivalHud({ player, compact }: { player: PlayerView; compact?: boolean }) {
  const s = player.survival;
  const xpInto = player.xp - player.levelXpStart;
  const xpSpan = player.levelXpEnd - player.levelXpStart;
  return (
    <View style={[styles.hud, compact && styles.compact]} testID="survival-hud">
      <View style={styles.levelBadge}>
        <Text style={styles.levelText}>{player.level}</Text>
      </View>
      <View style={styles.bars}>
        <Stat icon="❤️" label="Health" value={s.health} color={colors.health} />
        <Stat icon="🍖" label="Hunger" value={s.hunger} color={colors.hunger} />
        <Stat icon="⚡" label="Stamina" value={s.stamina} color={colors.stamina} />
        <Bar value={xpInto} max={xpSpan} color={colors.accent} height={4} label="Experience" style={{ marginTop: 2 }} />
      </View>
    </View>
  );
}

function Stat({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.icon} accessibilityLabel={label}>
        {icon}
      </Text>
      <Bar value={value} color={color} label={label} style={{ flex: 1 }} />
      <Text style={styles.num}>{Math.round(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hud: {
    flexDirection: 'row',
    gap: space(3),
    backgroundColor: '#FFFDF7EE',
    borderRadius: radius,
    padding: space(3),
    borderWidth: 1,
    borderColor: colors.border,
  },
  compact: { padding: space(2) },
  levelBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.accent,
  },
  levelText: { color: colors.white, fontWeight: '800', fontSize: 18 },
  bars: { flex: 1, gap: 4, justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space(2) },
  icon: { width: 20, fontSize: 13, textAlign: 'center' },
  num: { width: 28, textAlign: 'right', fontSize: 12, fontWeight: '700', color: colors.muted },
});
