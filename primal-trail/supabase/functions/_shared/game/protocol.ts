import {
  type FeedOutcome,
  GameError,
  type LocationInput,
  type LocationResult,
  type Nearby,
  abandonTame,
  acknowledgeSafety,
  consume,
  craft,
  feed,
  gather,
  nearby,
  shoot,
  startTame,
  tick,
  updateLocation,
} from './engine.ts';
import type { WorldOptions } from './spawns.ts';
import { levelForXp, xpForLevel } from './survival.ts';
import type { GameConfig, ItemId, PlayerState, TameSession, TamedCreature, WeaponId } from './types.ts';

/** Every request the client can make. One endpoint, one shape. */
export type GameAction =
  | { type: 'sync'; location?: LocationInput }
  | { type: 'gather'; nodeId: string }
  | { type: 'tame_start'; spawnId: string }
  | { type: 'tame_shoot'; weapon: WeaponId; accuracy: number }
  | { type: 'tame_feed'; itemId: ItemId }
  | { type: 'tame_abandon' }
  | { type: 'craft'; recipeId: string }
  | { type: 'consume'; itemId: ItemId }
  | { type: 'ack_safety' };

export type GameEvent =
  | { kind: 'location'; result: LocationResult }
  | { kind: 'gather'; loot: Partial<Record<ItemId, number>>; xp: number }
  | { kind: 'tame_start'; session: TameSession }
  | { kind: 'tame_shoot'; session: TameSession; knockedOut: boolean }
  | { kind: 'tame_feed'; outcome: FeedOutcome; session: TameSession | null; tamed: TamedCreature | null }
  | { kind: 'craft'; recipeId: string; xp: number }
  | { kind: 'none' };

/** What the client sees. Anti-cheat bookkeeping stays on the server. */
export interface PlayerView {
  survival: PlayerState['survival'];
  xp: number;
  level: number;
  levelXpStart: number;
  levelXpEnd: number;
  inventory: PlayerState['inventory'];
  location: PlayerState['location'];
  lockedUntil: number;
  tameSession: TameSession | null;
  safetyAcknowledgedAt: number | null;
}

export interface GameResponse {
  serverNow: number;
  player: PlayerView;
  nearby: Nearby | null;
  event: GameEvent;
}

export type GameErrorBody = { error: { code: string; message: string } };

export function toView(state: PlayerState): PlayerView {
  const level = levelForXp(state.xp);
  return {
    survival: state.survival,
    xp: state.xp,
    level,
    levelXpStart: xpForLevel(level),
    levelXpEnd: xpForLevel(level + 1),
    inventory: state.inventory,
    location: state.location,
    lockedUntil: state.lockedUntil,
    tameSession: state.tameSession,
    safetyAcknowledgedAt: state.safetyAcknowledgedAt,
  };
}

export interface ApplyResult {
  state: PlayerState;
  response: GameResponse;
  /** Creatures to persist in the collection. */
  newTames: TamedCreature[];
}

/**
 * Run one action against a player's state. Throws GameError for rule
 * violations; callers turn that into a 4xx and keep the old state.
 */
export function applyAction(
  state0: PlayerState,
  action: GameAction,
  now: number,
  cfg: GameConfig,
  opts?: WorldOptions,
  rng: () => number = Math.random,
): ApplyResult {
  let state = state0;
  let event: GameEvent = { kind: 'none' };
  const newTames: TamedCreature[] = [];

  switch (action?.type) {
    case 'sync': {
      if (action.location) {
        const r = updateLocation(state, action.location, now);
        state = r.state;
        event = { kind: 'location', result: r.result };
      } else {
        state = tick(state, now);
      }
      break;
    }
    case 'gather': {
      const r = gather(state, String(action.nodeId), now, cfg, opts, rng);
      state = r.state;
      event = { kind: 'gather', loot: r.loot, xp: r.xp };
      break;
    }
    case 'tame_start': {
      const r = startTame(state, String(action.spawnId), now, cfg, opts);
      state = r.state;
      event = { kind: 'tame_start', session: r.session };
      break;
    }
    case 'tame_shoot': {
      const r = shoot(state, action.weapon, Number(action.accuracy), now);
      state = r.state;
      event = { kind: 'tame_shoot', session: r.session, knockedOut: r.knockedOut };
      break;
    }
    case 'tame_feed': {
      const r = feed(state, action.itemId, now, rng);
      state = r.state;
      if (r.tamed) newTames.push(r.tamed);
      event = { kind: 'tame_feed', outcome: r.outcome, session: r.session, tamed: r.tamed };
      break;
    }
    case 'tame_abandon':
      state = abandonTame(state, now).state;
      break;
    case 'craft': {
      const r = craft(state, String(action.recipeId), now);
      state = r.state;
      event = { kind: 'craft', recipeId: action.recipeId, xp: r.xp };
      break;
    }
    case 'consume':
      state = consume(state, action.itemId, now).state;
      break;
    case 'ack_safety':
      state = acknowledgeSafety(state, now).state;
      break;
    default:
      throw new GameError('bad_request', 'Unknown action.');
  }

  return {
    state,
    newTames,
    response: { serverNow: now, player: toView(state), nearby: nearby(state, now, cfg, opts), event },
  };
}
