import type { GameAction, GameResponse, TamedCreature } from '@game';

export interface Account {
  id: string;
  email: string;
}

export class BackendError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'BackendError';
  }
}

/** Everything the app needs from a server. Two implementations: Supabase and offline. */
export interface Backend {
  mode: 'online' | 'offline';
  getAccount(): Promise<Account | null>;
  onAccountChange(cb: (account: Account | null) => void): () => void;
  signUp(email: string, password: string): Promise<{ needsConfirmation: boolean }>;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  /** Run one game action. Throws BackendError on rule violations. */
  act(action: GameAction): Promise<GameResponse>;
  listCreatures(): Promise<TamedCreature[]>;
  renameCreature(id: string, nickname: string): Promise<void>;
}
