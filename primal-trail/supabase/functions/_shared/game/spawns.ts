import { CREATURES, CREATURES_BY_ID, RARITY_TUNING } from './creatures.ts';
import { type Cell, cellBounds, cellOf, cellsAround, distanceMeters } from './geo.ts';
import { hashString, randInt, seededRng, weightedPick } from './random.ts';
import type { Biome, CreatureSpawn, GameConfig, LatLng, NodeType, ResourceNode } from './types.ts';

export const SPAWN_WINDOW_MS = 15 * 60 * 1000;
export const NODE_LAYOUT_MS = 24 * 60 * 60 * 1000;
export const DROP_WINDOW_MS = 60 * 60 * 1000;
export const VISIBLE_RADIUS_M = 350;
export const INTERACT_RADIUS_M = 45;

export interface WorldOptions {
  /**
   * Real map data hook. Return the biome for a cell from land-use data (OSM
   * parks/water/buildings). When missing, a pseudo-random biome map is used.
   */
  biomeOf?: (cell: Cell) => Biome | null;
  /**
   * Safety hook: return false for points on roads, water, or private property.
   * Spawns that fail are skipped. When missing, every point is allowed.
   */
  isSpawnable?: (p: LatLng) => boolean;
}

const BIOMES: Biome[] = ['forest', 'plains', 'urban', 'wetland'];
const BIOME_WEIGHT: Record<Biome, number> = { forest: 30, plains: 30, urban: 25, wetland: 15 };

/** Placeholder biome map: ~1.3 km regions with some per-cell variety. */
export function pseudoBiome(cell: Cell): Biome {
  const region = seededRng(`biome|${Math.floor(cell.cy / 8)}|${Math.floor(cell.cx / 8)}`);
  const regionBiome = weightedPick(region, BIOMES, (b) => BIOME_WEIGHT[b])!;
  const local = seededRng(`biome-cell|${cell.cy}|${cell.cx}`);
  if (local() < 0.75) return regionBiome;
  return weightedPick(local, BIOMES, (b) => BIOME_WEIGHT[b])!;
}

export function biomeFor(cell: Cell, opts: WorldOptions = {}): Biome {
  return opts.biomeOf?.(cell) ?? pseudoBiome(cell);
}

/** Local solar hour from longitude, so "night" means night where the cell is. */
export function solarHour(now: number, lng: number): number {
  const utcHours = (now % 86_400_000) / 3_600_000;
  return (((utcHours + lng / 15) % 24) + 24) % 24;
}

export function isNight(now: number, lng: number): boolean {
  const h = solarHour(now, lng);
  return h < 6 || h >= 20;
}

function randomPointIn(rng: () => number, cell: Cell): LatLng {
  const b = cellBounds(cell);
  return { lat: b.south + rng() * (b.north - b.south), lng: b.west + rng() * (b.east - b.west) };
}

export function creatureSpawnsForCell(cell: Cell, now: number, cfg: GameConfig, opts: WorldOptions = {}): CreatureSpawn[] {
  const window = Math.floor(now / SPAWN_WINDOW_MS);
  const rng = seededRng(`${cfg.spawnSecret}|c|${cell.cy}|${cell.cx}|${window}`);
  const biome = biomeFor(cell, opts);
  const b = cellBounds(cell);
  const night = isNight(window * SPAWN_WINDOW_MS, (b.west + b.east) / 2);
  const candidates = CREATURES.filter(
    (c) =>
      c.spawnsInMvp &&
      (c.biomes === 'any' || c.biomes.includes(biome)) &&
      (c.activeTime === 'any' || (c.activeTime === 'night') === night),
  );
  const count = randInt(rng, 0, 2) + (rng() < 0.3 ? 1 : 0);
  const out: CreatureSpawn[] = [];
  for (let i = 0; i < count; i++) {
    const def = weightedPick(rng, candidates, (c) => RARITY_TUNING[c.rarity].spawnWeight);
    const pos = randomPointIn(rng, cell);
    // Skewed toward low levels; rarer creatures start higher.
    const bonus = def ? { common: 0, uncommon: 3, rare: 6, epic: 10, legendary: 15 }[def.rarity] : 0;
    const level = 1 + bonus + Math.floor(rng() * rng() * 20);
    if (!def || (opts.isSpawnable && !opts.isSpawnable(pos))) continue;
    out.push({
      id: `s:${cell.cy}:${cell.cx}:${window}:${i}`,
      creatureId: def.id,
      pos,
      level,
      expiresAt: (window + 1) * SPAWN_WINDOW_MS,
    });
  }
  return out;
}

const NODE_WEIGHTS: Record<Biome, Partial<Record<NodeType, number>>> = {
  forest: { tree: 5, bush: 3, rock: 2, metal_deposit: 0.6 },
  plains: { tree: 2, bush: 4, rock: 3, metal_deposit: 1 },
  wetland: { tree: 2, bush: 5, rock: 1, metal_deposit: 0.4 },
  urban: { tree: 1, bush: 2, rock: 3, metal_deposit: 2.5 },
};
const NODE_TYPES: NodeType[] = ['tree', 'bush', 'rock', 'metal_deposit'];

export function resourceNodesForCell(cell: Cell, now: number, cfg: GameConfig, opts: WorldOptions = {}): ResourceNode[] {
  const day = Math.floor(now / NODE_LAYOUT_MS);
  const rng = seededRng(`${cfg.spawnSecret}|n|${cell.cy}|${cell.cx}|${day}`);
  const weights = NODE_WEIGHTS[biomeFor(cell, opts)];
  const count = randInt(rng, 3, 5);
  const out: ResourceNode[] = [];
  for (let i = 0; i < count; i++) {
    const type = weightedPick(rng, NODE_TYPES, (t) => weights[t] ?? 0)!;
    const pos = randomPointIn(rng, cell);
    if (opts.isSpawnable && !opts.isSpawnable(pos)) continue;
    out.push({ id: `n:${cell.cy}:${cell.cx}:${day}:${i}`, type, pos });
  }

  const hour = Math.floor(now / DROP_WINDOW_MS);
  const dropRng = seededRng(`${cfg.spawnSecret}|d|${cell.cy}|${cell.cx}|${hour}`);
  if (dropRng() < 0.1) {
    const pos = randomPointIn(dropRng, cell);
    if (!opts.isSpawnable || opts.isSpawnable(pos)) {
      out.push({
        id: `d:${cell.cy}:${cell.cx}:${hour}:0`,
        type: 'supply_drop',
        pos,
        expiresAt: (hour + 1) * DROP_WINDOW_MS,
      });
    }
  }
  return out;
}

export interface WorldView {
  creatures: CreatureSpawn[];
  nodes: ResourceNode[];
  biome: Biome;
  night: boolean;
}

export function worldAround(p: LatLng, now: number, cfg: GameConfig, opts: WorldOptions = {}): WorldView {
  const creatures: CreatureSpawn[] = [];
  const nodes: ResourceNode[] = [];
  for (const cell of cellsAround(p)) {
    creatures.push(...creatureSpawnsForCell(cell, now, cfg, opts));
    nodes.push(...resourceNodesForCell(cell, now, cfg, opts));
  }
  const near = (q: LatLng) => distanceMeters(p, q) <= VISIBLE_RADIUS_M;
  return {
    creatures: creatures.filter((c) => near(c.pos)),
    nodes: nodes.filter((n) => near(n.pos)),
    biome: biomeFor(cellOf(p), opts),
    night: isNight(now, p.lng),
  };
}

function parseId(id: string, prefix: string): { cell: Cell; time: number; index: number } | null {
  const parts = id.split(':');
  if (parts.length !== 5 || parts[0] !== prefix) return null;
  const [cy, cx, time, index] = parts.slice(1).map(Number);
  if (![cy, cx, time, index].every(Number.isInteger)) return null;
  return { cell: { cy, cx }, time, index };
}

/** Re-derive a spawn from its id. Returns null for forged or expired ids. */
export function findCreatureSpawn(id: string, now: number, cfg: GameConfig, opts: WorldOptions = {}): CreatureSpawn | null {
  const parsed = parseId(id, 's');
  if (!parsed || parsed.time !== Math.floor(now / SPAWN_WINDOW_MS)) return null;
  return creatureSpawnsForCell(parsed.cell, now, cfg, opts).find((s) => s.id === id) ?? null;
}

export function findResourceNode(id: string, now: number, cfg: GameConfig, opts: WorldOptions = {}): ResourceNode | null {
  const prefix = id.startsWith('d:') ? 'd' : 'n';
  const parsed = parseId(id, prefix);
  if (!parsed) return null;
  const expected = prefix === 'd' ? Math.floor(now / DROP_WINDOW_MS) : Math.floor(now / NODE_LAYOUT_MS);
  if (parsed.time !== expected) return null;
  return resourceNodesForCell(parsed.cell, now, cfg, opts).find((n) => n.id === id) ?? null;
}

export function creatureDef(id: string) {
  return CREATURES_BY_ID[id];
}

/** Stable short hash for ids/nicknames. */
export function shortHash(s: string): string {
  return hashString(s).toString(36);
}
