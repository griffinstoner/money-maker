import AsyncStorage from '@react-native-async-storage/async-storage';
import { type GameAction, GameError, type PlayerState, type TamedCreature, applyAction, hashString, newPlayerState } from '@game';

import { type Account, type Backend, BackendError } from './types';

// Offline mode: the exact same rules engine, running on the device with
// AsyncStorage. For playtesting before a Supabase project exists. Not secure:
// a player could edit their own storage, which is fine for a dev build.

const SPAWN_SECRET = 'offline-dev-secret';
const ACCOUNTS_KEY = 'pt.offline.accounts';
const CURRENT_KEY = 'pt.offline.current';
const stateKey = (id: string) => `pt.offline.state.${id}`;
const creaturesKey = (id: string) => `pt.offline.creatures.${id}`;

type Accounts = Record<string, { id: string; passwordHash: number }>;

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : fallback;
}

const writeJson = (key: string, value: unknown) => AsyncStorage.setItem(key, JSON.stringify(value));

export function createOfflineBackend(): Backend {
  const listeners = new Set<(a: Account | null) => void>();
  const emit = (a: Account | null) => listeners.forEach((l) => l(a));
  // Serialize actions like the server's optimistic lock does.
  let queue: Promise<unknown> = Promise.resolve();

  async function requireAccount(): Promise<Account> {
    const account = await readJson<Account | null>(CURRENT_KEY, null);
    if (!account) throw new BackendError('unauthorized', 'Sign in first.');
    return account;
  }

  return {
    mode: 'offline',
    getAccount: () => readJson<Account | null>(CURRENT_KEY, null),
    onAccountChange(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    async signUp(email, password) {
      const key = email.trim().toLowerCase();
      if (password.length < 6) throw new BackendError('weak_password', 'Use at least 6 characters.');
      const accounts = await readJson<Accounts>(ACCOUNTS_KEY, {});
      if (accounts[key]) throw new BackendError('exists', 'That email already has an account.');
      const id = `offline-${hashString(key + Date.now()).toString(36)}`;
      accounts[key] = { id, passwordHash: hashString(password) };
      await writeJson(ACCOUNTS_KEY, accounts);
      const account = { id, email: key };
      await writeJson(CURRENT_KEY, account);
      emit(account);
      return { needsConfirmation: false };
    },
    async signIn(email, password) {
      const key = email.trim().toLowerCase();
      const accounts = await readJson<Accounts>(ACCOUNTS_KEY, {});
      const found = accounts[key];
      if (!found || found.passwordHash !== hashString(password)) {
        throw new BackendError('bad_credentials', 'Wrong email or password.');
      }
      const account = { id: found.id, email: key };
      await writeJson(CURRENT_KEY, account);
      emit(account);
    },
    async signOut() {
      await AsyncStorage.removeItem(CURRENT_KEY);
      emit(null);
    },
    act(action: GameAction) {
      const run = async () => {
        const account = await requireAccount();
        const now = Date.now();
        const state = await readJson<PlayerState>(stateKey(account.id), newPlayerState(now));
        try {
          const result = applyAction(state, action, now, { spawnSecret: SPAWN_SECRET });
          await writeJson(stateKey(account.id), result.state);
          if (result.newTames.length) {
            const list = await readJson<TamedCreature[]>(creaturesKey(account.id), []);
            await writeJson(creaturesKey(account.id), [...result.newTames, ...list]);
          }
          return result.response;
        } catch (e) {
          if (e instanceof GameError) throw new BackendError(e.code, e.message);
          throw e;
        }
      };
      const p = queue.then(run, run);
      queue = p.catch(() => undefined);
      return p;
    },
    async listCreatures() {
      const account = await requireAccount();
      return readJson<TamedCreature[]>(creaturesKey(account.id), []);
    },
    async renameCreature(id, nickname) {
      const account = await requireAccount();
      const list = await readJson<TamedCreature[]>(creaturesKey(account.id), []);
      await writeJson(
        creaturesKey(account.id),
        list.map((c) => (c.id === id ? { ...c, nickname: nickname.trim().slice(0, 24) || null } : c)),
      );
    },
  };
}
