import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { FunctionsHttpError, type Session, createClient } from '@supabase/supabase-js';
import type { GameAction, GameErrorBody, GameResponse, TamedCreature } from '@game';
import { AppState, Platform } from 'react-native';

import { type Account, type Backend, BackendError } from './types';

interface CreatureRow {
  id: string;
  creature_id: string;
  nickname: string | null;
  level: number;
  stats: TamedCreature['stats'];
  tamed_at: string;
  tamed_in_cell: string;
}

const toAccount = (s: Session | null): Account | null => (s ? { id: s.user.id, email: s.user.email ?? '' } : null);

export function createSupabaseBackend(url: string, anonKey: string): Backend {
  const supabase = createClient(url, anonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web',
    },
  });

  // Only refresh tokens while the app is in the foreground.
  if (Platform.OS !== 'web') {
    AppState.addEventListener('change', (state) => {
      if (state === 'active') supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });
  }

  const fail = (e: { message: string; code?: string } | null) => {
    if (e) throw new BackendError(e.code ?? 'auth_error', e.message);
  };

  return {
    mode: 'online',
    async getAccount() {
      const { data } = await supabase.auth.getSession();
      return toAccount(data.session);
    },
    onAccountChange(cb) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(toAccount(session)));
      return () => data.subscription.unsubscribe();
    },
    async signUp(email, password) {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
      fail(error);
      return { needsConfirmation: !data.session };
    },
    async signIn(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      fail(error);
    },
    async signOut() {
      fail((await supabase.auth.signOut()).error);
    },
    async act(action: GameAction) {
      const { data, error } = await supabase.functions.invoke<GameResponse>('game', { body: action });
      if (error) {
        if (error instanceof FunctionsHttpError) {
          const body = (await error.context.json().catch(() => null)) as GameErrorBody | null;
          if (body?.error) throw new BackendError(body.error.code, body.error.message);
        }
        throw new BackendError('network', "Can't reach the server. Check your connection.");
      }
      return data!;
    },
    async listCreatures() {
      const { data, error } = await supabase
        .from('tamed_creatures')
        .select('id, creature_id, nickname, level, stats, tamed_at, tamed_in_cell')
        .order('tamed_at', { ascending: false });
      if (error) throw new BackendError('db_error', error.message);
      return (data as CreatureRow[]).map((r) => ({
        id: r.id,
        creatureId: r.creature_id,
        nickname: r.nickname,
        level: r.level,
        stats: r.stats,
        tamedAt: Date.parse(r.tamed_at),
        tamedInCell: r.tamed_in_cell,
      }));
    },
    async renameCreature(id, nickname) {
      const { error } = await supabase
        .from('tamed_creatures')
        .update({ nickname: nickname.trim().slice(0, 24) || null })
        .eq('id', id);
      if (error) throw new BackendError('db_error', error.message);
    },
  };
}
