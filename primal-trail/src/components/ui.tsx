import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';

import { colors, radius, space } from '@/theme';

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  busy,
  style,
  testID,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  busy?: boolean;
  style?: ViewStyle;
  testID?: string;
}) {
  const bg = { primary: colors.primary, secondary: colors.accent, danger: colors.danger, ghost: 'transparent' }[variant];
  const fg = variant === 'ghost' ? colors.primary : colors.white;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      onPress={onPress}
      disabled={disabled || busy}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.45 : pressed ? 0.8 : 1 },
        variant === 'ghost' && styles.ghost,
        style,
      ]}
    >
      {busy ? <ActivityIndicator color={fg} /> : <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>}
    </Pressable>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Bar({
  value,
  max = 100,
  color,
  label,
  height = 10,
  style,
}: {
  value: number;
  max?: number;
  color: string;
  label?: string;
  height?: number;
  style?: ViewStyle;
}) {
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <View style={style} accessibilityLabel={label ? `${label} ${Math.round(value)} of ${max}` : undefined}>
      <View style={[styles.track, { height, borderRadius: height / 2 }]}>
        <View style={{ width: `${pct * 100}%`, height, borderRadius: height / 2, backgroundColor: color }} />
      </View>
    </View>
  );
}

export function Pill({ text, color, style }: { text: string; color: string; style?: ViewStyle }) {
  return (
    <View style={[styles.pill, { backgroundColor: color }, style]}>
      <Text style={styles.pillText}>{text}</Text>
    </View>
  );
}

export function H1({ children, style }: { children: ReactNode; style?: TextStyle }) {
  return <Text style={[styles.h1, style]}>{children}</Text>;
}

export function Muted({ children, style }: { children: ReactNode; style?: TextStyle }) {
  return <Text style={[styles.muted, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingHorizontal: space(5),
    borderRadius: radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghost: { borderWidth: 1.5, borderColor: colors.primary },
  buttonText: { fontSize: 16, fontWeight: '700' },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space(4),
  },
  track: { backgroundColor: '#00000018', overflow: 'hidden' },
  pill: { paddingHorizontal: space(2), paddingVertical: 2, borderRadius: 999, alignSelf: 'flex-start' },
  pillText: { color: colors.white, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  h1: { fontSize: 24, fontWeight: '800', color: colors.ink },
  muted: { fontSize: 14, color: colors.muted },
});
