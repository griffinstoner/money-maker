import type { LatLng } from './types.ts';

const EARTH_RADIUS_M = 6_371_000;

/** Spawn grid cell size in degrees of latitude (~167 m). */
export const CELL_DEG = 0.0015;

export function distanceMeters(a: LatLng, b: LatLng): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Move a point by meters north/east. Good enough at walking scale. */
export function offsetMeters(p: LatLng, northM: number, eastM: number): LatLng {
  const dLat = northM / 111_320;
  const dLng = eastM / (111_320 * Math.cos((p.lat * Math.PI) / 180));
  return { lat: p.lat + dLat, lng: p.lng + dLng };
}

export interface Cell {
  cy: number;
  cx: number;
}

/**
 * Cells are CELL_DEG tall. Width in longitude is widened by 1/cos(lat) of the
 * row's center so cells stay roughly square away from the equator.
 */
function rowLngDeg(cy: number): number {
  const centerLat = (cy + 0.5) * CELL_DEG;
  const c = Math.max(0.05, Math.cos((centerLat * Math.PI) / 180));
  return CELL_DEG / c;
}

export function cellOf(p: LatLng): Cell {
  const cy = Math.floor(p.lat / CELL_DEG);
  const cx = Math.floor(p.lng / rowLngDeg(cy));
  return { cy, cx };
}

export function cellBounds(cell: Cell): { south: number; north: number; west: number; east: number } {
  const w = rowLngDeg(cell.cy);
  return {
    south: cell.cy * CELL_DEG,
    north: (cell.cy + 1) * CELL_DEG,
    west: cell.cx * w,
    east: (cell.cx + 1) * w,
  };
}

export function cellKey(cell: Cell): string {
  return `${cell.cy}_${cell.cx}`;
}

/** The player's cell plus its 8 neighbours (~500 m square). */
export function cellsAround(p: LatLng): Cell[] {
  const center = cellOf(p);
  const out: Cell[] = [];
  for (let dy = -1; dy <= 1; dy++) {
    const cy = center.cy + dy;
    // neighbouring rows have slightly different widths, so recompute cx per row
    const rowCenter = cellOf({ lat: (cy + 0.5) * CELL_DEG, lng: p.lng });
    for (let dx = -1; dx <= 1; dx++) out.push({ cy, cx: rowCenter.cx + dx });
  }
  return out;
}
