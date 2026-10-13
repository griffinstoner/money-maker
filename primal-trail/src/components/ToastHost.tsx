import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useGame } from '@/game/GameProvider';
import { colors, radius, space } from '@/theme';

export function ToastHost() {
  const { toast } = useGame();
  const insets = useSafeAreaInsets();
  if (!toast) return null;
  const bg = { info: colors.primaryDark, success: colors.primary, error: colors.danger }[toast.kind];
  return (
    <View pointerEvents="none" style={[styles.wrap, { top: insets.top + space(2) }]}>
      <View style={[styles.toast, { backgroundColor: bg }]} accessibilityLiveRegion="polite" testID="toast">
        <Text style={styles.text}>{toast.message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: space(4), right: space(4), alignItems: 'center', zIndex: 100 },
  toast: { paddingHorizontal: space(4), paddingVertical: space(3), borderRadius: radius, maxWidth: 480 },
  text: { color: colors.white, fontSize: 15, fontWeight: '600', textAlign: 'center' },
});
