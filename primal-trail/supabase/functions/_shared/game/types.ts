// Shared game types. This folder is pure TypeScript with no runtime
// dependencies so it runs unchanged in the Expo app and in Supabase Edge
// Functions (Deno). Keep imports relative and with explicit `.ts` extensions.

export type Biome = 'forest' | 'plains' | 'wetland' | 'urban';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type Role = 'gatherer' | 'fighter' | 'mount' | 'flyer';
export type ActiveTime = 'day' | 'night' | 'any';
export type TameMethod = 'knockout' | 'passive';
export type WeaponId = 'slingshot' | 'blowpipe';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface CreatureStats {
  health: number;
  attack: number;
  speed: number;
  stamina: number;
}

export interface CreatureDef {
  id: string;
  name: string;
  emoji: string; // placeholder art until real sprites exist
  description: string;
  kind: 'dinosaur' | 'mammal' | 'mythical' | 'reptile' | 'pterosaur';
  role: Role;
  rarity: Rarity;
  biomes: Biome[] | 'any';
  activeTime: ActiveTime;
  baseStats: CreatureStats;
  tameMethod: TameMethod;
  /** Weakest weapon that can knock it out. Ignored for passive tames. */
  minWeapon?: WeaponId;
  preferredFood: ItemId;
  /** false = defined for later phases (raids, events) but never spawns yet. */
  spawnsInMvp: boolean;
}

export type ItemCategory = 'resource' | 'food' | 'taming_food' | 'tool' | 'weapon' | 'ammo' | 'medical';

export type ItemId =
  | 'wood'
  | 'stone'
  | 'fiber'
  | 'berries'
  | 'dozeberry'
  | 'prime_berry'
  | 'metal'
  | 'raw_meat'
  | 'grilled_meat'
  | 'trail_ration'
  | 'bandage'
  | 'basic_kibble'
  | 'prime_kibble'
  | 'tranq_dart'
  | 'stone_hatchet'
  | 'stone_pick'
  | 'slingshot'
  | 'blowpipe';

export interface ItemDef {
  id: ItemId;
  name: string;
  emoji: string;
  category: ItemCategory;
  description: string;
  /** Eating restores hunger. */
  hunger?: number;
  /** Using restores health. */
  heal?: number;
}

export interface Recipe {
  id: string;
  output: ItemId;
  outputQty: number;
  inputs: Partial<Record<ItemId, number>>;
  unlockLevel: number;
}

export type NodeType = 'tree' | 'rock' | 'bush' | 'metal_deposit' | 'supply_drop';

export interface CreatureSpawn {
  id: string;
  creatureId: string;
  pos: LatLng;
  level: number;
  expiresAt: number;
}

export interface ResourceNode {
  id: string;
  type: NodeType;
  pos: LatLng;
  /** Supply drops disappear when their window ends; normal nodes are permanent. */
  expiresAt?: number;
}

export interface Survival {
  health: number;
  hunger: number;
  stamina: number;
  /** ms epoch of the last time these were brought up to date. */
  updatedAt: number;
}

export interface TameSession {
  spawnId: string;
  creatureId: string;
  level: number;
  method: TameMethod;
  startedAt: number;
  /** knockout: torpor built up so far */
  torpor: number;
  torporNeeded: number;
  knockedOutAt: number | null;
  lastShotAt: number;
  /** feeding progress 0..100 */
  progress: number;
  lastFedAt: number;
  /** passive: times the creature caught you */
  spotted: number;
  /** 0..1, drops a little with every non-preferred food */
  effectiveness: number;
}

export interface PlayerState {
  survival: Survival;
  xp: number;
  inventory: Partial<Record<ItemId, number>>;
  location: (LatLng & { at: number }) | null;
  /** Anti-spoof strikes; reset slowly. */
  strikes: number;
  lockedUntil: number;
  /** nodeId -> gathered-at timestamp (pruned once respawned) */
  gathered: Record<string, number>;
  /** spawnId -> timestamp. Spawns this player already tamed or scared off. */
  spentSpawns: Record<string, number>;
  tameSession: TameSession | null;
  safetyAcknowledgedAt: number | null;
}

export interface TamedCreature {
  id: string;
  creatureId: string;
  nickname: string | null;
  level: number;
  stats: CreatureStats;
  tamedAt: number;
  /** Rough location label only (cell id), never exact coords. */
  tamedInCell: string;
}

export interface GameConfig {
  /** Server-only secret mixed into spawn seeds so clients can't predict spawns. */
  spawnSecret: string;
}
