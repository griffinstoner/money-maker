/**
 * Seeded random numbers. The same seed always gives the same sequence,
 * which is what lets every player standing in the same spot see the same dinos.
 */

/** Turns any string into a 32-bit number (FNV-1a hash). */
export function hashString(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Returns a function that gives a new number between 0 and 1 each call (mulberry32). */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Picks a key from a { key: weight } table using one random roll. */
export function pickWeighted<K extends string>(weights: Record<K, number>, roll: number): K {
  const entries = Object.entries(weights) as [K, number][];
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let target = roll * total;
  for (const [key, weight] of entries) {
    if (target < weight) return key;
    target -= weight;
  }
  return entries[entries.length - 1][0];
}
