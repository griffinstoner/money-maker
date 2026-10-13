import type { CreatureDef, Rarity } from './types.ts';

// Original creatures for Primal Trail. Add new ones here; the rest of the game
// reads everything from this table. `spawnsInMvp: false` keeps a creature in
// the dex but out of the wild until its phase ships (raids, events, breeding).
export const CREATURES: CreatureDef[] = [
  // ---- Common -------------------------------------------------------------
  {
    id: 'pebblesnout', name: 'Pebblesnout', emoji: '🦕', kind: 'dinosaur', role: 'gatherer', rarity: 'common',
    description: 'A knee-high grazer that roots through gravel for seeds. Will follow anyone holding berries.',
    biomes: ['forest', 'plains'], activeTime: 'day', tameMethod: 'passive', preferredFood: 'berries',
    baseStats: { health: 60, attack: 4, speed: 9, stamina: 80 }, spawnsInMvp: true,
  },
  {
    id: 'brambleback', name: 'Brambleback', emoji: '🦔', kind: 'dinosaur', role: 'mount', rarity: 'common',
    description: 'Stocky plant-eater with a hedge of thorny plates. Slow, steady, carries a lot.',
    biomes: ['plains', 'forest'], activeTime: 'any', tameMethod: 'knockout', minWeapon: 'slingshot', preferredFood: 'berries',
    baseStats: { health: 120, attack: 8, speed: 6, stamina: 120 }, spawnsInMvp: true,
  },
  {
    id: 'ditchrunner', name: 'Ditchrunner', emoji: '🦎', kind: 'dinosaur', role: 'fighter', rarity: 'common',
    description: 'A wiry little raptor that lives in storm drains and steals sandwiches.',
    biomes: ['urban'], activeTime: 'any', tameMethod: 'knockout', minWeapon: 'slingshot', preferredFood: 'raw_meat',
    baseStats: { health: 70, attack: 14, speed: 16, stamina: 90 }, spawnsInMvp: true,
  },
  {
    id: 'marshwaddle', name: 'Marshwaddle', emoji: '🦆', kind: 'dinosaur', role: 'gatherer', rarity: 'common',
    description: 'Duck-billed paddler that sifts reeds out of ponds. Excellent fiber collector.',
    biomes: ['wetland'], activeTime: 'day', tameMethod: 'passive', preferredFood: 'berries',
    baseStats: { health: 80, attack: 5, speed: 8, stamina: 100 }, spawnsInMvp: true,
  },
  {
    id: 'binbeak', name: 'Binbeak', emoji: '🐦', kind: 'pterosaur', role: 'flyer', rarity: 'common',
    description: 'Gull-sized pterosaur that patrols rooftops. Loud, nosy and impossible to shoo.',
    biomes: ['urban', 'wetland'], activeTime: 'day', tameMethod: 'passive', preferredFood: 'raw_meat',
    baseStats: { health: 50, attack: 6, speed: 18, stamina: 70 }, spawnsInMvp: true,
  },
  // ---- Uncommon -----------------------------------------------------------
  {
    id: 'leafwing', name: 'Leafwing', emoji: '🪽', kind: 'pterosaur', role: 'flyer', rarity: 'uncommon',
    description: 'Glides between treetops on leaf-patterned wings. Hard to spot until it moves.',
    biomes: ['forest'], activeTime: 'day', tameMethod: 'knockout', minWeapon: 'slingshot', preferredFood: 'prime_berry',
    baseStats: { health: 90, attack: 10, speed: 22, stamina: 110 }, spawnsInMvp: true,
  },
  {
    id: 'rustjaw', name: 'Rustjaw', emoji: '🐺', kind: 'mammal', role: 'fighter', rarity: 'uncommon',
    description: 'Prehistoric bone-crusher dog. Packs of them roam parking lots after dark.',
    biomes: ['urban', 'plains'], activeTime: 'night', tameMethod: 'knockout', minWeapon: 'slingshot', preferredFood: 'raw_meat',
    baseStats: { health: 140, attack: 22, speed: 15, stamina: 110 }, spawnsInMvp: true,
  },
  {
    id: 'mosshorn', name: 'Mosshorn', emoji: '🦏', kind: 'mammal', role: 'mount', rarity: 'uncommon',
    description: 'Shaggy rhino with moss growing in its coat. Charges anything that startles it.',
    biomes: ['plains', 'forest'], activeTime: 'any', tameMethod: 'knockout', minWeapon: 'slingshot', preferredFood: 'basic_kibble',
    baseStats: { health: 220, attack: 18, speed: 10, stamina: 160 }, spawnsInMvp: true,
  },
  // ---- Rare ---------------------------------------------------------------
  {
    id: 'reedstalker', name: 'Reedstalker', emoji: '🐊', kind: 'reptile', role: 'fighter', rarity: 'rare',
    description: 'Ambush hunter that waits in shallow water, only its eyes showing.',
    biomes: ['wetland'], activeTime: 'any', tameMethod: 'knockout', minWeapon: 'blowpipe', preferredFood: 'raw_meat',
    baseStats: { health: 260, attack: 32, speed: 12, stamina: 140 }, spawnsInMvp: true,
  },
  {
    id: 'duskmane', name: 'Duskmane', emoji: '🐅', kind: 'mammal', role: 'mount', rarity: 'rare',
    description: 'Saber-fanged cat with a smoky mane. Only hunts at night.',
    biomes: ['forest', 'plains'], activeTime: 'night', tameMethod: 'knockout', minWeapon: 'blowpipe', preferredFood: 'raw_meat',
    baseStats: { health: 240, attack: 36, speed: 24, stamina: 150 }, spawnsInMvp: true,
  },
  {
    id: 'glimmerfin', name: 'Glimmerfin', emoji: '🐟', kind: 'mythical', role: 'gatherer', rarity: 'rare',
    description: 'Glowing river spirit-fish. Surfaces on calm nights and spooks at the faintest sound.',
    biomes: ['wetland'], activeTime: 'night', tameMethod: 'passive', preferredFood: 'prime_kibble',
    baseStats: { health: 110, attack: 8, speed: 20, stamina: 130 }, spawnsInMvp: false,
  },
  {
    id: 'gutterwyrm', name: 'Gutterwyrm', emoji: '🐍', kind: 'reptile', role: 'fighter', rarity: 'rare',
    description: 'A long, armored serpent that coils through sewers and old subway tunnels.',
    biomes: ['urban'], activeTime: 'night', tameMethod: 'knockout', minWeapon: 'blowpipe', preferredFood: 'raw_meat',
    baseStats: { health: 230, attack: 30, speed: 14, stamina: 140 }, spawnsInMvp: false,
  },
  {
    id: 'bramblefang', name: 'Bramblefang', emoji: '🦊', kind: 'mammal', role: 'fighter', rarity: 'uncommon',
    description: 'Fox-like predator with burr-covered fur. Hides in hedges and pounces.',
    biomes: ['forest'], activeTime: 'night', tameMethod: 'knockout', minWeapon: 'slingshot', preferredFood: 'raw_meat',
    baseStats: { health: 120, attack: 20, speed: 19, stamina: 100 }, spawnsInMvp: false,
  },
  // ---- Epic (raids / later phases) -----------------------------------------
  {
    id: 'ironcrest', name: 'Ironcrest Titan', emoji: '🦖', kind: 'dinosaur', role: 'mount', rarity: 'epic',
    description: 'Long-necked giant with a metallic head crest. Shakes the ground when it walks.',
    biomes: ['plains'], activeTime: 'day', tameMethod: 'knockout', minWeapon: 'blowpipe', preferredFood: 'prime_kibble',
    baseStats: { health: 600, attack: 30, speed: 8, stamina: 300 }, spawnsInMvp: false,
  },
  {
    id: 'skyrender', name: 'Skyrender', emoji: '🦅', kind: 'pterosaur', role: 'flyer', rarity: 'epic',
    description: 'Storm-chasing pterosaur with a nine-meter wingspan. Strong enough to carry a rider.',
    biomes: ['plains', 'wetland'], activeTime: 'day', tameMethod: 'knockout', minWeapon: 'blowpipe', preferredFood: 'prime_kibble',
    baseStats: { health: 340, attack: 34, speed: 32, stamina: 220 }, spawnsInMvp: false,
  },
  {
    id: 'cindertusk', name: 'Cindertusk', emoji: '🦣', kind: 'mammal', role: 'mount', rarity: 'epic',
    description: 'Mammoth whose tusks smolder like coals. Melts snow in a ring around it.',
    biomes: ['forest', 'plains'], activeTime: 'any', tameMethod: 'knockout', minWeapon: 'blowpipe', preferredFood: 'prime_kibble',
    baseStats: { health: 520, attack: 40, speed: 9, stamina: 260 }, spawnsInMvp: false,
  },
  {
    id: 'vaultback', name: 'Vaultback', emoji: '🐢', kind: 'dinosaur', role: 'gatherer', rarity: 'epic',
    description: 'Armored club-tail that smashes rocks open for ore. A walking mining crew.',
    biomes: ['plains', 'urban'], activeTime: 'day', tameMethod: 'knockout', minWeapon: 'blowpipe', preferredFood: 'basic_kibble',
    baseStats: { health: 480, attack: 26, speed: 7, stamina: 240 }, spawnsInMvp: false,
  },
  // ---- Legendary (raid bosses at landmarks) ---------------------------------
  {
    id: 'stormquill', name: 'Stormquill', emoji: '🦚', kind: 'mythical', role: 'flyer', rarity: 'legendary',
    description: 'Feathered thunder-beast. Its quills crackle with static before a storm.',
    biomes: 'any', activeTime: 'any', tameMethod: 'knockout', minWeapon: 'blowpipe', preferredFood: 'prime_kibble',
    baseStats: { health: 800, attack: 55, speed: 34, stamina: 320 }, spawnsInMvp: false,
  },
  {
    id: 'deepcoil', name: 'Deepcoil', emoji: '🐉', kind: 'mythical', role: 'fighter', rarity: 'legendary',
    description: 'Ancient lake serpent. Fishermen tell stories; few have seen the whole thing.',
    biomes: ['wetland'], activeTime: 'night', tameMethod: 'knockout', minWeapon: 'blowpipe', preferredFood: 'prime_kibble',
    baseStats: { health: 1000, attack: 60, speed: 18, stamina: 360 }, spawnsInMvp: false,
  },
  {
    id: 'thornwarden', name: 'Thornwarden', emoji: '🦌', kind: 'mythical', role: 'mount', rarity: 'legendary',
    description: 'Elk-like guardian of old forests, antlers wrapped in living vines.',
    biomes: ['forest'], activeTime: 'any', tameMethod: 'passive', preferredFood: 'prime_kibble',
    baseStats: { health: 700, attack: 45, speed: 28, stamina: 340 }, spawnsInMvp: false,
  },
];

export const CREATURES_BY_ID: Record<string, CreatureDef> = Object.fromEntries(CREATURES.map((c) => [c.id, c]));

export const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

/** Per-rarity taming tuning. */
export const RARITY_TUNING: Record<
  Rarity,
  { spawnWeight: number; torpor: number; feeds: number; feedIntervalMs: number; xp: number }
> = {
  common: { spawnWeight: 60, torpor: 30, feeds: 3, feedIntervalMs: 3_000, xp: 100 },
  uncommon: { spawnWeight: 28, torpor: 70, feeds: 4, feedIntervalMs: 4_000, xp: 200 },
  rare: { spawnWeight: 10, torpor: 140, feeds: 6, feedIntervalMs: 5_000, xp: 400 },
  epic: { spawnWeight: 0, torpor: 300, feeds: 8, feedIntervalMs: 6_000, xp: 800 },
  legendary: { spawnWeight: 0, torpor: 600, feeds: 10, feedIntervalMs: 8_000, xp: 2000 },
};
