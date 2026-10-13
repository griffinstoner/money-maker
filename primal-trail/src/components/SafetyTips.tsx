import { StyleSheet, Text, View } from 'react-native';

import { colors, space } from '@/theme';

export const SAFETY_TIPS: [string, string][] = [
  ['👀', 'Look up. Stay aware of traffic, people and obstacles around you.'],
  ['🚗', 'Never play while driving or cycling. Fast movement is ignored anyway.'],
  ['🚧', "Don't enter private property, roads, rail lines or water to reach anything. You can interact from 45 m away."],
  ['🌙', 'Play somewhere you feel safe, especially at night. Go with friends.'],
  ['🔒', 'Your exact location is never shown to other players.'],
];

export function SafetyTips() {
  return (
    <View style={{ gap: space(3) }}>
      {SAFETY_TIPS.map(([icon, text]) => (
        <View key={icon} style={styles.row}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.text}>{text}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space(3), alignItems: 'flex-start' },
  icon: { fontSize: 22, width: 30, textAlign: 'center' },
  text: { flex: 1, fontSize: 15, lineHeight: 21, color: colors.ink },
});
