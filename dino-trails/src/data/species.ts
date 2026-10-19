export type Tier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type Diet = 'herbivore' | 'carnivore' | 'piscivore';
export type Role = 'fighter' | 'gatherer' | 'scout';
export type Biome = 'park' | 'field' | 'woods' | 'water' | 'rocky' | 'town';
/** When a species is allowed to spawn in the wild. 'raid' = never wild. */
export type ActiveTime = 'any' | 'day' | 'night' | 'raid';

export interface Stats {
  hp: number;
  attack: number;
  speed: number;
  stamina: number;
}

export interface Species {
  id: string;
  name: string;
  tier: Tier;
  biomes: Biome[];
  diet: Diet;
  role: Role;
  active: ActiveTime;
  base: Stats;
  emoji: string;
}

export const TIER_COLORS: Record<Tier, string> = {
  common: '#8BC34A',
  uncommon: '#03A9F4',
  rare: '#9C27B0',
  epic: '#FF9800',
  legendary: '#F44336',
};

/** Chance (out of 100) that a wild spawn rolls each tier. */
export const TIER_WEIGHTS: Record<Tier, number> = {
  common: 62,
  uncommon: 25,
  rare: 10,
  epic: 3,
  legendary: 0, // legendaries only appear in raids
};

export const SPECIES: Species[] = [
  { id: 'compsognathus', name: 'Compsognathus', tier: 'common', biomes: ['park', 'town'], diet: 'carnivore', role: 'scout', active: 'any', base: { hp: 40, attack: 12, speed: 18, stamina: 14 }, emoji: '🦎' },
  { id: 'gallimimus', name: 'Gallimimus', tier: 'common', biomes: ['field'], diet: 'herbivore', role: 'scout', active: 'any', base: { hp: 50, attack: 10, speed: 20, stamina: 16 }, emoji: '🦤' },
  { id: 'psittacosaurus', name: 'Psittacosaurus', tier: 'common', biomes: ['woods'], diet: 'herbivore', role: 'gatherer', active: 'any', base: { hp: 60, attack: 10, speed: 10, stamina: 15 }, emoji: '🦕' },
  { id: 'pteranodon', name: 'Pteranodon', tier: 'common', biomes: ['water'], diet: 'piscivore', role: 'scout', active: 'any', base: { hp: 45, attack: 14, speed: 19, stamina: 12 }, emoji: '🪽' },
  { id: 'protoceratops', name: 'Protoceratops', tier: 'common', biomes: ['field'], diet: 'herbivore', role: 'gatherer', active: 'any', base: { hp: 70, attack: 12, speed: 9, stamina: 16 }, emoji: '🦏' },
  { id: 'velociraptor', name: 'Velociraptor', tier: 'uncommon', biomes: ['park'], diet: 'carnivore', role: 'fighter', active: 'any', base: { hp: 65, attack: 22, speed: 20, stamina: 14 }, emoji: '🦖' },
  { id: 'parasaurolophus', name: 'Parasaurolophus', tier: 'uncommon', biomes: ['water', 'field'], diet: 'herbivore', role: 'gatherer', active: 'any', base: { hp: 90, attack: 12, speed: 13, stamina: 20 }, emoji: '🦕' },
  { id: 'dilophosaurus', name: 'Dilophosaurus', tier: 'uncommon', biomes: ['woods'], diet: 'carnivore', role: 'fighter', active: 'any', base: { hp: 70, attack: 20, speed: 15, stamina: 13 }, emoji: '🦖' },
  { id: 'pachycephalosaurus', name: 'Pachycephalosaurus', tier: 'uncommon', biomes: ['field'], diet: 'herbivore', role: 'fighter', active: 'any', base: { hp: 85, attack: 19, speed: 12, stamina: 17 }, emoji: '🦕' },
  { id: 'ankylosaurus', name: 'Ankylosaurus', tier: 'rare', biomes: ['field', 'rocky'], diet: 'herbivore', role: 'gatherer', active: 'any', base: { hp: 140, attack: 16, speed: 6, stamina: 22 }, emoji: '🐢' },
  { id: 'stegosaurus', name: 'Stegosaurus', tier: 'rare', biomes: ['woods'], diet: 'herbivore', role: 'fighter', active: 'any', base: { hp: 130, attack: 24, speed: 8, stamina: 18 }, emoji: '🦕' },
  { id: 'baryonyx', name: 'Baryonyx', tier: 'rare', biomes: ['water'], diet: 'piscivore', role: 'fighter', active: 'any', base: { hp: 110, attack: 27, speed: 14, stamina: 16 }, emoji: '🐊' },
  { id: 'triceratops', name: 'Triceratops', tier: 'epic', biomes: ['field'], diet: 'herbivore', role: 'fighter', active: 'day', base: { hp: 170, attack: 30, speed: 10, stamina: 22 }, emoji: '🦏' },
  { id: 'spinosaurus', name: 'Spinosaurus', tier: 'epic', biomes: ['water'], diet: 'piscivore', role: 'fighter', active: 'night', base: { hp: 160, attack: 36, speed: 12, stamina: 18 }, emoji: '🐊' },
  { id: 'tyrannosaurus', name: 'Tyrannosaurus', tier: 'legendary', biomes: ['field', 'woods'], diet: 'carnivore', role: 'fighter', active: 'raid', base: { hp: 220, attack: 45, speed: 12, stamina: 20 }, emoji: '🦖' },
];

export const SPECIES_BY_ID: Record<string, Species> = Object.fromEntries(
  SPECIES.map((s) => [s.id, s]),
);
