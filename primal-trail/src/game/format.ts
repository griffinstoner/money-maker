import { ITEMS, type ItemId } from '@game';

export function formatLoot(loot: Partial<Record<ItemId, number>>): string {
  return Object.entries(loot)
    .map(([id, n]) => `+${n} ${ITEMS[id as ItemId].emoji} ${ITEMS[id as ItemId].name}`)
    .join('  ');
}

export function formatSeconds(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : `${s}s`;
}
