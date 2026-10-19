import { SPECIES, Species, Tier, TIER_WEIGHTS } from '../data/species';
import { distanceMeters, isNight, LatLng } from './geo';
import { hashString, pickWeighted, seededRandom } from './rng';

/**
 * How spawning works:
 * The world is split into a grid of cells (~275 m tall). Time is split into
 * 15-minute windows. Each (cell, window) pair is turned into a seed, and that seed
 * decides which dinos appear in the cell. No server is needed for everyone to see
 * the same dinos — and in M3 the server runs this same code to check taming requests.
 *
 * Biomes (parks, water, woods…) need real map data, which arrives in M3.
 * Until then, spawns use tier, day/night, and species rules only.
 */

export const CELL_SIZE_DEG = 0.0025;
export const WINDOW_MS = 15 * 60 * 1000;
/** How many cells out from the player's cell to generate (2 → a 5×5 block). */
const CELL_RADIUS = 2;
/** Chance (out of 100) that a cell has 0, 1, 2 or 3 dinos. */
const COUNT_WEIGHTS = { '0': 30, '1': 40, '2': 20, '3': 10 };

export interface Spawn {
  id: string;
  species: Species;
  coordinate: LatLng;
  despawnsAt: number;
}

function speciesFor(tier: Tier, night: boolean): Species[] {
  return SPECIES.filter(
    (s) =>
      s.tier === tier &&
      s.active !== 'raid' &&
      (s.active === 'any' || (s.active === 'night') === night),
  );
}

export function spawnsInCell(cellX: number, cellY: number, windowIndex: number): Spawn[] {
  const random = seededRandom(hashString(`${cellX}:${cellY}:${windowIndex}`));
  const count = Number(pickWeighted(COUNT_WEIGHTS, random()));
  const despawnsAt = (windowIndex + 1) * WINDOW_MS;
  const spawns: Spawn[] = [];

  for (let i = 0; i < count; i++) {
    const latitude = (cellY + random()) * CELL_SIZE_DEG;
    const longitude = (cellX + random()) * CELL_SIZE_DEG;
    const night = isNight(longitude, new Date(windowIndex * WINDOW_MS));
    const choices = speciesFor(pickWeighted(TIER_WEIGHTS, random()), night);
    const pick = random();
    if (choices.length === 0) continue;
    spawns.push({
      id: `${cellX}:${cellY}:${windowIndex}:${i}`,
      species: choices[Math.floor(pick * choices.length)],
      coordinate: { latitude, longitude },
      despawnsAt,
    });
  }
  return spawns;
}

/** All dinos within `radiusMeters` of the player right now. */
export function spawnsNear(player: LatLng, now: number, radiusMeters = 500): Spawn[] {
  const windowIndex = Math.floor(now / WINDOW_MS);
  const centerX = Math.floor(player.longitude / CELL_SIZE_DEG);
  const centerY = Math.floor(player.latitude / CELL_SIZE_DEG);
  const result: Spawn[] = [];

  for (let dx = -CELL_RADIUS; dx <= CELL_RADIUS; dx++) {
    for (let dy = -CELL_RADIUS; dy <= CELL_RADIUS; dy++) {
      for (const spawn of spawnsInCell(centerX + dx, centerY + dy, windowIndex)) {
        if (distanceMeters(player, spawn.coordinate) <= radiusMeters) result.push(spawn);
      }
    }
  }
  return result;
}
