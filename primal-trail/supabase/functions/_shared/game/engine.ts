import { CREATURES_BY_ID, RARITY_TUNING } from './creatures.ts';
import { cellKey, cellOf, distanceMeters } from './geo.ts';
import { ITEMS, RECIPES_BY_ID, WEAPONS, isTamingFood } from './items.ts';
import { hashString, randInt } from './random.ts';
import {
  DROP_WINDOW_MS,
  INTERACT_RADIUS_M,
  type WorldOptions,
  type WorldView,
  findCreatureSpawn,
  findResourceNode,
  worldAround,
} from './spawns.ts';
import { SURVIVAL_RULES, applyTime, levelForXp } from './survival.ts';
import type {
  CreatureSpawn,
  GameConfig,
  ItemId,
  LatLng,
  PlayerState,
  ResourceNode,
  TameSession,
  TamedCreature,
  WeaponId,
} from './types.ts';

export class GameError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'GameError';
  }
}

export const RULES = {
  /** Anything faster than this between fixes is suspicious (180 km/h). */
  maxSpeedMps: 50,
  /** Jumps shorter than this are treated as GPS noise. */
  gpsNoiseM: 100,
  /** Fixes worse than this are ignored, not punished. */
  maxAccuracyM: 100,
  strikesToLock: 3,
  lockMs: 10 * 60 * 1000,
  /** Interactions need a location fix newer than this. */
  locationFreshMs: 2 * 60 * 1000,
  gatherStaminaCost: 4,
  nodeRespawnMs: 10 * 60 * 1000,
  shotCooldownMs: 500,
  /** How long a knocked-out creature stays down. */
  knockoutMs: 2 * 60 * 1000,
  /** Give up on a knockout attempt after this long. */
  sessionTimeoutMs: 5 * 60 * 1000,
  passiveSpotsToFlee: 2,
  watchCycleMs: 5000,
  watchDurationMs: 1800,
  /** A passive feed counts as spotted only if the creature watched for this whole span, to forgive network lag. */
  watchGraceMs: 500,
  xp: { gather: 10, supplyDrop: 25, craft: 15 },
};

// Approximate long-distance travel cooldowns: [distance km, minutes].
const TRAVEL_COOLDOWN: [number, number][] = [
  [1, 0.5], [5, 2], [10, 6], [25, 11], [100, 35], [250, 45], [500, 60], [1000, 90], [1500, 120],
];

export function travelCooldownMs(distanceM: number): number {
  const km = distanceM / 1000;
  for (const [maxKm, minutes] of TRAVEL_COOLDOWN) if (km <= maxKm) return minutes * 60_000;
  return 120 * 60_000;
}

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

export function newPlayerState(now: number): PlayerState {
  return {
    survival: { health: 100, hunger: 100, stamina: 100, updatedAt: now },
    xp: 0,
    inventory: { berries: 5 },
    location: null,
    strikes: 0,
    lockedUntil: 0,
    gathered: {},
    spentSpawns: {},
    tameSession: null,
    safetyAcknowledgedAt: null,
  };
}

/** Bring time-based state up to date. Every action calls this first. */
export function tick(state: PlayerState, now: number): PlayerState {
  const s = clone(state);
  s.survival = applyTime(s.survival, now);
  for (const [id, t] of Object.entries(s.gathered)) {
    const keepFor = id.startsWith('d:') ? DROP_WINDOW_MS : RULES.nodeRespawnMs;
    if (now - t >= keepFor) delete s.gathered[id];
  }
  for (const [id, t] of Object.entries(s.spentSpawns)) {
    if (now - t >= 60 * 60 * 1000) delete s.spentSpawns[id];
  }
  const sess = s.tameSession;
  if (sess && isSessionOver(sess, now)) s.tameSession = null;
  return s;
}

function isSessionOver(sess: TameSession, now: number): boolean {
  if (sess.method === 'knockout' && sess.knockedOutAt !== null) return now - sess.knockedOutAt > RULES.knockoutMs;
  return now - Math.max(sess.startedAt, sess.lastFedAt, sess.lastShotAt) > RULES.sessionTimeoutMs;
}

export function level(state: PlayerState): number {
  return levelForXp(state.xp);
}

function addItems(state: PlayerState, items: Partial<Record<ItemId, number>>) {
  for (const [id, qty] of Object.entries(items) as [ItemId, number][]) {
    if (!qty) continue;
    const next = (state.inventory[id] ?? 0) + qty;
    if (next < 0) throw new GameError('missing_items', `Not enough ${ITEMS[id].name}.`);
    if (next === 0) delete state.inventory[id];
    else state.inventory[id] = next;
  }
}

function has(state: PlayerState, id: ItemId, qty = 1): boolean {
  return (state.inventory[id] ?? 0) >= qty;
}

function assertNotLocked(state: PlayerState, now: number) {
  if (state.lockedUntil > now) {
    const mins = Math.ceil((state.lockedUntil - now) / 60_000);
    throw new GameError('locked', `Unusual movement detected. Actions are paused for ${mins} min.`);
  }
}

function assertNear(state: PlayerState, target: LatLng, now: number) {
  assertNotLocked(state, now);
  const loc = state.location;
  if (!loc || now - loc.at > RULES.locationFreshMs) throw new GameError('no_location', 'Waiting for a GPS fix.');
  if (distanceMeters(loc, target) > INTERACT_RADIUS_M) throw new GameError('too_far', 'Walk closer to interact.');
}

// ---------------------------------------------------------------------------
// Location + anti-spoofing

export interface LocationInput extends LatLng {
  accuracy?: number | null;
}

export type LocationResult = { accepted: true } | { accepted: false; reason: 'locked' | 'low_accuracy' | 'too_fast' | 'invalid' };

export function updateLocation(state0: PlayerState, input: LocationInput, now: number): { state: PlayerState; result: LocationResult } {
  const state = tick(state0, now);
  const valid =
    Number.isFinite(input.lat) && Number.isFinite(input.lng) && Math.abs(input.lat) <= 85 && Math.abs(input.lng) <= 180;
  if (!valid) return { state, result: { accepted: false, reason: 'invalid' } };
  if (state.lockedUntil > now) return { state, result: { accepted: false, reason: 'locked' } };
  if (input.accuracy != null && input.accuracy > RULES.maxAccuracyM) {
    return { state, result: { accepted: false, reason: 'low_accuracy' } };
  }

  const prev = state.location;
  if (prev) {
    const dist = distanceMeters(prev, input);
    const dtMs = Math.max(1, now - prev.at);
    const speed = dist / (dtMs / 1000);
    const suspicious = dist > RULES.gpsNoiseM && speed > RULES.maxSpeedMps && dtMs < travelCooldownMs(dist);
    if (suspicious) {
      state.strikes += 1;
      if (state.strikes >= RULES.strikesToLock) {
        state.strikes = 0;
        state.lockedUntil = now + RULES.lockMs;
      }
      return { state, result: { accepted: false, reason: 'too_fast' } };
    }
    if (dtMs > 10 * 60_000 && state.strikes > 0) state.strikes -= 1;
  }
  state.location = { lat: input.lat, lng: input.lng, at: now };
  return { state, result: { accepted: true } };
}

// ---------------------------------------------------------------------------
// World view

export interface NearbyCreature extends CreatureSpawn {
  spent: boolean;
}
export interface NearbyNode extends ResourceNode {
  readyAt: number | null; // null = ready now
}
export interface Nearby extends Omit<WorldView, 'creatures' | 'nodes'> {
  creatures: NearbyCreature[];
  nodes: NearbyNode[];
}

export function nearby(state: PlayerState, now: number, cfg: GameConfig, opts?: WorldOptions): Nearby | null {
  if (!state.location) return null;
  const world = worldAround(state.location, now, cfg, opts);
  return {
    ...world,
    creatures: world.creatures.map((c) => ({ ...c, spent: c.id in state.spentSpawns })),
    nodes: world.nodes
      .map((n) => {
        const t = state.gathered[n.id];
        if (t === undefined) return { ...n, readyAt: null };
        return { ...n, readyAt: n.type === 'supply_drop' ? Number.POSITIVE_INFINITY : t + RULES.nodeRespawnMs };
      })
      .filter((n) => n.readyAt !== Number.POSITIVE_INFINITY),
  };
}

// ---------------------------------------------------------------------------
// Gathering

type Loot = Partial<Record<ItemId, number>>;

export function rollLoot(node: ResourceNode, state: PlayerState, rng: () => number): Loot {
  const loot: Loot = {};
  const add = (id: ItemId, n: number) => {
    if (n > 0) loot[id] = (loot[id] ?? 0) + n;
  };
  switch (node.type) {
    case 'tree':
      add('wood', randInt(rng, 3, 5) * (has(state, 'stone_hatchet') ? 2 : 1));
      add('fiber', randInt(rng, 0, 2));
      break;
    case 'bush':
      add('berries', randInt(rng, 3, 6));
      add('fiber', randInt(rng, 1, 3));
      if (rng() < 0.45) add('dozeberry', randInt(rng, 1, 3));
      if (rng() < 0.08) add('prime_berry', 1);
      break;
    case 'rock':
      add('stone', randInt(rng, 3, 5) * (has(state, 'stone_pick') ? 2 : 1));
      break;
    case 'metal_deposit':
      add('metal', randInt(rng, 1, 3));
      add('stone', randInt(rng, 1, 2));
      break;
    case 'supply_drop':
      add('raw_meat', randInt(rng, 2, 4));
      add('metal', randInt(rng, 1, 3));
      add('prime_berry', randInt(rng, 0, 2));
      add('tranq_dart', randInt(rng, 0, 3));
      add('basic_kibble', randInt(rng, 0, 1));
      break;
  }
  return loot;
}

export function gather(
  state0: PlayerState,
  nodeId: string,
  now: number,
  cfg: GameConfig,
  opts?: WorldOptions,
  rng: () => number = Math.random,
): { state: PlayerState; loot: Loot; xp: number } {
  const state = tick(state0, now);
  const node = findResourceNode(nodeId, now, cfg, opts);
  if (!node) throw new GameError('not_found', 'That resource is gone.');
  assertNear(state, node.pos, now);
  if (nodeId in state.gathered) {
    throw new GameError('cooldown', node.type === 'supply_drop' ? 'Already looted.' : 'Still regrowing.');
  }
  if (node.type === 'metal_deposit' && !has(state, 'stone_pick')) {
    throw new GameError('need_tool', 'You need a Stone Pick to mine metal.');
  }
  const isDrop = node.type === 'supply_drop';
  if (!isDrop && state.survival.stamina < RULES.gatherStaminaCost) {
    throw new GameError('tired', 'Too tired. Rest a bit to recover stamina.');
  }
  const loot = rollLoot(node, state, rng);
  addItems(state, loot);
  if (!isDrop) state.survival.stamina -= RULES.gatherStaminaCost;
  state.gathered[nodeId] = now;
  const xp = isDrop ? RULES.xp.supplyDrop : RULES.xp.gather;
  state.xp += xp;
  return { state, loot, xp };
}

// ---------------------------------------------------------------------------
// Survival actions

export function consume(state0: PlayerState, itemId: ItemId, now: number): { state: PlayerState } {
  const state = tick(state0, now);
  const def = ITEMS[itemId];
  if (!def || (!def.hunger && !def.heal)) throw new GameError('not_consumable', "You can't use that.");
  if (!has(state, itemId)) throw new GameError('missing_items', `No ${def.name} left.`);
  addItems(state, { [itemId]: -1 });
  const max = SURVIVAL_RULES.max;
  if (def.hunger) state.survival.hunger = Math.min(max, state.survival.hunger + def.hunger);
  if (def.heal) state.survival.health = Math.min(max, state.survival.health + def.heal);
  return { state };
}

export function acknowledgeSafety(state0: PlayerState, now: number): { state: PlayerState } {
  const state = tick(state0, now);
  state.safetyAcknowledgedAt = now;
  return { state };
}

// ---------------------------------------------------------------------------
// Crafting

export function craft(state0: PlayerState, recipeId: string, now: number): { state: PlayerState; xp: number } {
  const state = tick(state0, now);
  const recipe = RECIPES_BY_ID[recipeId];
  if (!recipe) throw new GameError('not_found', 'Unknown recipe.');
  if (level(state) < recipe.unlockLevel) {
    throw new GameError('locked_recipe', `Unlocks at level ${recipe.unlockLevel}.`);
  }
  const ownsTool = ['tool', 'weapon'].includes(ITEMS[recipe.output].category) && has(state, recipe.output);
  if (ownsTool) throw new GameError('already_owned', `You already have a ${ITEMS[recipe.output].name}.`);
  for (const [id, qty] of Object.entries(recipe.inputs) as [ItemId, number][]) {
    if (!has(state, id, qty)) throw new GameError('missing_items', `Need ${qty} ${ITEMS[id].name}.`);
  }
  const delta: Loot = {};
  for (const [id, qty] of Object.entries(recipe.inputs) as [ItemId, number][]) delta[id] = -qty;
  addItems(state, delta);
  addItems(state, { [recipe.output]: recipe.outputQty });
  state.xp += RULES.xp.craft;
  return { state, xp: RULES.xp.craft };
}

// ---------------------------------------------------------------------------
// Taming

/**
 * Passive tames: the creature glances around on a fixed, seeded rhythm. The
 * client draws the same rhythm, and the server checks feeds against it.
 */
export function isWatching(spawnId: string, t: number): boolean {
  const cycle = Math.floor(t / RULES.watchCycleMs);
  const offset = hashString(`${spawnId}|${cycle}`) % (RULES.watchCycleMs - RULES.watchDurationMs);
  const pos = t - cycle * RULES.watchCycleMs;
  return pos >= offset && pos < offset + RULES.watchDurationMs;
}

function torporNeeded(rarityTorpor: number, lvl: number) {
  return Math.round(rarityTorpor * (1 + lvl / 30));
}

function bestWeapon(state: PlayerState): WeaponId | null {
  const owned = (Object.keys(WEAPONS) as WeaponId[]).filter((w) => has(state, w));
  owned.sort((a, b) => WEAPONS[b].tier - WEAPONS[a].tier);
  return owned[0] ?? null;
}

export function startTame(
  state0: PlayerState,
  spawnId: string,
  now: number,
  cfg: GameConfig,
  opts?: WorldOptions,
): { state: PlayerState; session: TameSession } {
  const state = tick(state0, now);
  const spawn = findCreatureSpawn(spawnId, now, cfg, opts);
  if (!spawn) throw new GameError('not_found', 'It wandered off.');
  if (spawnId in state.spentSpawns) throw new GameError('spent', 'This one already left you.');
  assertNear(state, spawn.pos, now);
  const def = CREATURES_BY_ID[spawn.creatureId];
  const tuning = RARITY_TUNING[def.rarity];

  if (state.tameSession?.spawnId === spawnId) return { state, session: state.tameSession };

  if (def.tameMethod === 'knockout') {
    const weapon = bestWeapon(state);
    const minTier = WEAPONS[def.minWeapon ?? 'slingshot'].tier;
    if (!weapon || WEAPONS[weapon].tier < minTier) {
      const need = ITEMS[def.minWeapon ?? 'slingshot'].name;
      throw new GameError('need_weapon', `${def.name} is too tough. You need a ${need}.`);
    }
  }
  const hasFood = (Object.keys(state.inventory) as ItemId[]).some((id) => isTamingFood(id));
  if (!hasFood) throw new GameError('need_food', 'Bring taming food first (berries, meat or kibble).');

  const session: TameSession = {
    spawnId,
    creatureId: def.id,
    level: spawn.level,
    method: def.tameMethod,
    startedAt: now,
    torpor: 0,
    torporNeeded: torporNeeded(tuning.torpor, spawn.level),
    knockedOutAt: null,
    lastShotAt: 0,
    progress: 0,
    lastFedAt: 0,
    spotted: 0,
    effectiveness: 1,
  };
  state.tameSession = session;
  return { state, session };
}

function requireSession(state: PlayerState): TameSession {
  if (!state.tameSession) throw new GameError('no_session', 'The creature got away.');
  return state.tameSession;
}

export function shoot(
  state0: PlayerState,
  weapon: WeaponId,
  /** 0 = miss, 1 = perfect hit, from the aiming minigame. */
  accuracy: number,
  now: number,
): { state: PlayerState; session: TameSession; knockedOut: boolean } {
  const state = tick(state0, now);
  assertNotLocked(state, now);
  const sess = requireSession(state);
  if (sess.method !== 'knockout') throw new GameError('wrong_method', "Don't shoot! This one has to be tamed gently.");
  if (sess.knockedOutAt !== null) throw new GameError('already_down', "It's already out cold. Feed it!");
  const w = WEAPONS[weapon];
  if (!w || !has(state, weapon)) throw new GameError('missing_items', "You don't have that weapon.");
  const def = CREATURES_BY_ID[sess.creatureId];
  if (w.tier < WEAPONS[def.minWeapon ?? 'slingshot'].tier) {
    throw new GameError('weapon_too_weak', `That won't work on a ${def.name}.`);
  }
  if (!has(state, w.ammo)) throw new GameError('no_ammo', `Out of ${ITEMS[w.ammo].name}.`);
  if (now - sess.lastShotAt < RULES.shotCooldownMs) throw new GameError('too_soon', 'Reloading...');

  addItems(state, { [w.ammo]: -1 });
  const a = Math.max(0, Math.min(1, Number.isFinite(accuracy) ? accuracy : 0));
  sess.torpor = Math.min(sess.torporNeeded, sess.torpor + Math.round(w.torpor * a));
  sess.lastShotAt = now;
  const knockedOut = sess.torpor >= sess.torporNeeded;
  if (knockedOut) sess.knockedOutAt = now;
  return { state, session: sess, knockedOut };
}

export type FeedOutcome = 'fed' | 'tamed' | 'spotted' | 'fled';

export function feed(
  state0: PlayerState,
  itemId: ItemId,
  now: number,
  rng: () => number = Math.random,
): { state: PlayerState; outcome: FeedOutcome; session: TameSession | null; tamed: TamedCreature | null } {
  const state = tick(state0, now);
  assertNotLocked(state, now);
  const sess = requireSession(state);
  const def = CREATURES_BY_ID[sess.creatureId];
  const tuning = RARITY_TUNING[def.rarity];

  if (sess.method === 'knockout' && sess.knockedOutAt === null) {
    throw new GameError('not_down', 'Knock it out first.');
  }
  if (!isTamingFood(itemId)) throw new GameError('not_food', `${def.name} won't eat that.`);
  if (!has(state, itemId)) throw new GameError('missing_items', `No ${ITEMS[itemId].name} left.`);
  if (sess.lastFedAt && now - sess.lastFedAt < tuning.feedIntervalMs) {
    throw new GameError('too_soon', "It's still chewing.");
  }

  if (sess.method === 'passive' && isWatching(sess.spawnId, now) && isWatching(sess.spawnId, now - RULES.watchGraceMs)) {
    sess.spotted += 1;
    sess.lastFedAt = now;
    if (sess.spotted >= RULES.passiveSpotsToFlee) {
      state.tameSession = null;
      state.spentSpawns[sess.spawnId] = now;
      return { state, outcome: 'fled', session: null, tamed: null };
    }
    return { state, outcome: 'spotted', session: sess, tamed: null };
  }

  addItems(state, { [itemId]: -1 });
  const perFeed = 100 / tuning.feeds;
  let mult: number;
  if (itemId === def.preferredFood) mult = 1;
  else if (itemId === 'prime_kibble') mult = 1.2;
  else if (itemId === 'basic_kibble') mult = 0.8;
  else mult = 0.5;
  if (itemId !== def.preferredFood && itemId !== 'prime_kibble') sess.effectiveness = Math.max(0.5, sess.effectiveness - 0.05);
  sess.progress = Math.min(100, sess.progress + perFeed * mult);
  sess.lastFedAt = now;

  if (sess.progress < 100 - 1e-9) return { state, outcome: 'fed', session: sess, tamed: null };

  // Tamed! Bonus levels scale with how well it was fed.
  const bonusLevels = Math.floor(sess.level * 0.5 * sess.effectiveness);
  const lvl = sess.level + bonusLevels;
  const scale = 1 + 0.08 * (lvl - 1);
  const jitter = () => 0.9 + rng() * 0.2;
  const b = def.baseStats;
  const tamed: TamedCreature = {
    id: `t_${now.toString(36)}_${Math.floor(rng() * 1e9).toString(36)}`,
    creatureId: def.id,
    nickname: null,
    level: lvl,
    stats: {
      health: Math.round(b.health * scale * jitter()),
      attack: Math.round(b.attack * scale * jitter()),
      speed: Math.round(b.speed * jitter()),
      stamina: Math.round(b.stamina * scale * jitter()),
    },
    tamedAt: now,
    tamedInCell: state.location ? cellKey(cellOf(state.location)) : 'unknown',
  };
  state.spentSpawns[sess.spawnId] = now;
  state.tameSession = null;
  state.xp += tuning.xp;
  return { state, outcome: 'tamed', session: null, tamed };
}

export function abandonTame(state0: PlayerState, now: number): { state: PlayerState } {
  const state = tick(state0, now);
  if (state.tameSession) {
    // A creature you've already hit or fed won't give you a second chance.
    const s = state.tameSession;
    if (s.torpor > 0 || s.progress > 0 || s.spotted > 0) state.spentSpawns[s.spawnId] = now;
    state.tameSession = null;
  }
  return { state };
}
