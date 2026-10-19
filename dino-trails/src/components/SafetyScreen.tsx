import { Pressable, StyleSheet, Text, View } from 'react-native';

export function SafetyScreen({ onAccept }: { onAccept: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🦖 Dino Trails</Text>
      <Text style={styles.heading}>Stay aware of your surroundings</Text>
      <Text style={styles.body}>
        • Watch where you're walking — look up from your phone.{'\n'}
        • Never play while driving or riding a bike.{'\n'}
        • Don't enter private property or unsafe areas to reach a dino.{'\n'}
        • Play with friends, especially at night.
      </Text>
      <Pressable style={styles.button} onPress={onAccept}>
        <Text style={styles.buttonText}>I understand — let's go</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1B2A1B', padding: 32, justifyContent: 'center' },
  title: { fontSize: 40, fontWeight: '800', color: '#C5E1A5', textAlign: 'center', marginBottom: 40 },
  heading: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 16 },
  body: { fontSize: 17, lineHeight: 28, color: '#E0E0E0', marginBottom: 40 },
  button: { backgroundColor: '#689F38', borderRadius: 14, paddingVertical: 16 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center' },
});
