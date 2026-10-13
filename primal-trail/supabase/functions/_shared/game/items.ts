import type { ItemDef, ItemId, Recipe, WeaponId } from './types.ts';

export const ITEMS: Record<ItemId, ItemDef> = {
  wood: { id: 'wood', name: 'Wood', emoji: '🪵', category: 'resource', description: 'Chopped from trees.' },
  stone: { id: 'stone', name: 'Stone', emoji: '🪨', category: 'resource', description: 'Building block and slingshot ammo.' },
  fiber: { id: 'fiber', name: 'Fiber', emoji: '🌿', category: 'resource', description: 'Plant fiber for bindings.' },
  berries: { id: 'berries', name: 'Sweetberries', emoji: '🫐', category: 'food', description: 'Common snack. Herbivores like them.', hunger: 6 },
  dozeberry: { id: 'dozeberry', name: 'Dozeberry', emoji: '🍇', category: 'resource', description: 'Sleepy berry. Too bitter to eat, perfect for darts.' },
  prime_berry: { id: 'prime_berry', name: 'Prime Berry', emoji: '🍒', category: 'taming_food', description: 'Rare, glowing berry. Picky creatures love it.', hunger: 10 },
  metal: { id: 'metal', name: 'Metal Ore', emoji: '⛓️', category: 'resource', description: 'Needs a pick to mine.' },
  raw_meat: { id: 'raw_meat', name: 'Raw Meat', emoji: '🥩', category: 'taming_food', description: 'Found in supply drops. Carnivores want it.' },
  grilled_meat: { id: 'grilled_meat', name: 'Grilled Meat', emoji: '🍖', category: 'food', description: 'Filling meal.', hunger: 30 },
  trail_ration: { id: 'trail_ration', name: 'Trail Ration', emoji: '🥙', category: 'food', description: 'Berries and grain pressed together.', hunger: 35 },
  bandage: { id: 'bandage', name: 'Bandage', emoji: '🩹', category: 'medical', description: 'Restores health.', heal: 30 },
  basic_kibble: { id: 'basic_kibble', name: 'Trail Kibble', emoji: '🥠', category: 'taming_food', description: 'Decent taming food for any creature.' },
  prime_kibble: { id: 'prime_kibble', name: 'Prime Kibble', emoji: '🍪', category: 'taming_food', description: 'Top-tier taming food.' },
  tranq_dart: { id: 'tranq_dart', name: 'Tranq Dart', emoji: '💉', category: 'ammo', description: 'Blowpipe ammo. Strong knockout.' },
  stone_hatchet: { id: 'stone_hatchet', name: 'Stone Hatchet', emoji: '🪓', category: 'tool', description: 'Doubles wood from trees.' },
  stone_pick: { id: 'stone_pick', name: 'Stone Pick', emoji: '⛏️', category: 'tool', description: 'Doubles stone. Needed for metal.' },
  slingshot: { id: 'slingshot', name: 'Slingshot', emoji: '🪃', category: 'weapon', description: 'Fires stones. Knocks out small creatures.' },
  blowpipe: { id: 'blowpipe', name: 'Blowpipe', emoji: '🎋', category: 'weapon', description: 'Fires tranq darts. Needed for big creatures.' },
};

export const RECIPES: Recipe[] = [
  { id: 'stone_hatchet', output: 'stone_hatchet', outputQty: 1, inputs: { wood: 2, stone: 2, fiber: 3 }, unlockLevel: 1 },
  { id: 'stone_pick', output: 'stone_pick', outputQty: 1, inputs: { wood: 2, stone: 3, fiber: 3 }, unlockLevel: 1 },
  { id: 'slingshot', output: 'slingshot', outputQty: 1, inputs: { wood: 3, fiber: 5 }, unlockLevel: 1 },
  { id: 'bandage', output: 'bandage', outputQty: 1, inputs: { fiber: 4, berries: 2 }, unlockLevel: 2 },
  { id: 'trail_ration', output: 'trail_ration', outputQty: 1, inputs: { berries: 6, fiber: 1 }, unlockLevel: 2 },
  { id: 'grilled_meat', output: 'grilled_meat', outputQty: 1, inputs: { raw_meat: 1, wood: 2 }, unlockLevel: 2 },
  { id: 'basic_kibble', output: 'basic_kibble', outputQty: 2, inputs: { berries: 5, fiber: 3, stone: 1 }, unlockLevel: 3 },
  { id: 'blowpipe', output: 'blowpipe', outputQty: 1, inputs: { wood: 8, fiber: 10, metal: 2 }, unlockLevel: 4 },
  { id: 'tranq_dart', output: 'tranq_dart', outputQty: 3, inputs: { dozeberry: 4, fiber: 2, stone: 1 }, unlockLevel: 4 },
  { id: 'prime_kibble', output: 'prime_kibble', outputQty: 1, inputs: { prime_berry: 2, basic_kibble: 2, metal: 1 }, unlockLevel: 6 },
];

export const RECIPES_BY_ID: Record<string, Recipe> = Object.fromEntries(RECIPES.map((r) => [r.id, r]));

export interface WeaponDef {
  id: WeaponId;
  ammo: ItemId;
  /** torpor per perfect hit */
  torpor: number;
  /** ordering for minWeapon checks */
  tier: number;
}

export const WEAPONS: Record<WeaponId, WeaponDef> = {
  slingshot: { id: 'slingshot', ammo: 'stone', torpor: 12, tier: 1 },
  blowpipe: { id: 'blowpipe', ammo: 'tranq_dart', torpor: 40, tier: 2 },
};

export function isTamingFood(id: ItemId): boolean {
  return ['berries', 'prime_berry', 'raw_meat', 'basic_kibble', 'prime_kibble'].includes(id);
}
