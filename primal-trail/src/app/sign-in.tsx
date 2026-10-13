import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackendError, backend } from '@/backend';
import { Button } from '@/components/ui';
import { useGame } from '@/game/GameProvider';
import { colors, radius, space } from '@/theme';

export default function SignIn() {
  const { showToast } = useGame();
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!email.includes('@')) return showToast('Enter a valid email.', 'error');
    if (password.length < 6) return showToast('Password needs at least 6 characters.', 'error');
    setBusy(true);
    try {
      if (mode === 'signUp') {
        const { needsConfirmation } = await backend.signUp(email, password);
        if (needsConfirmation) {
          showToast('Check your email to confirm your account, then sign in.', 'success');
          setMode('signIn');
        }
      } else {
        await backend.signIn(email, password);
      }
    } catch (e) {
      showToast(e instanceof BackendError ? e.message : 'Something went wrong.', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.logo}>🦖</Text>
          <Text style={styles.title}>Primal Trail</Text>
          <Text style={styles.tagline}>The wild is back. Go find it.</Text>

          <View style={styles.form}>
            <TextInput
              testID="email"
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              testID="password"
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.muted}
              secureTextEntry
              autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={submit}
            />
            <Button
              testID="submit"
              title={mode === 'signUp' ? 'Create account' : 'Sign in'}
              onPress={submit}
              busy={busy}
              variant="secondary"
            />
            <Button
              title={mode === 'signUp' ? 'I already have an account' : 'New here? Create an account'}
              variant="ghost"
              onPress={() => setMode(mode === 'signUp' ? 'signIn' : 'signUp')}
              style={{ borderColor: '#FFFFFF55' }}
            />
          </View>

          {backend.mode === 'offline' && (
            <Text style={styles.offline}>
              Offline playtest mode: no server is configured, so accounts and progress stay on this device.
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryDark },
  container: { flexGrow: 1, justifyContent: 'center', padding: space(6), maxWidth: 440, width: '100%', alignSelf: 'center' },
  logo: { fontSize: 64, textAlign: 'center' },
  title: { fontSize: 34, fontWeight: '900', color: colors.white, textAlign: 'center' },
  tagline: { fontSize: 16, color: '#FFFFFFAA', textAlign: 'center', marginTop: space(1) },
  form: { gap: space(3), marginTop: space(8) },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius,
    paddingHorizontal: space(4),
    minHeight: 50,
    fontSize: 16,
    color: colors.ink,
  },
  offline: { color: '#FFFFFF99', fontSize: 13, textAlign: 'center', marginTop: space(8) },
});
