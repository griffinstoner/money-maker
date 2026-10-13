import type { Survival } from './types.ts';

export const SURVIVAL_RULES = {
  max: 100,
  /** Full to empty in 25 hours, so a normal day off the app is harmless. */
  hungerDrainPerHour: 4,
  /** Starving only chips health, and never below the floor. */
  starvingHealthDrainPerHour: 3,
  starvingHealthFloor: 20,
  /** Natural healing while hunger is at least 50. */
  healthRegenPerHour: 6,
  wellFedHunger: 50,
  staminaRegenPerHour: 60,
};

/** Bring survival stats forward to `now`. Pure, order-independent. */
export function applyTime(s: Survival, now: number): Survival {
  const R = SURVIVAL_RULES;
  const hours = Math.max(0, (now - s.updatedAt) / 3_600_000);
  if (hours === 0) return s;

  const hunger = Math.max(0, s.hunger - R.hungerDrainPerHour * hours);
  const hoursFed = Math.min(hours, Math.max(0, (s.hunger - R.wellFedHunger) / R.hungerDrainPerHour));
  const hoursStarving = Math.max(0, hours - s.hunger / R.hungerDrainPerHour);

  let health = Math.min(R.max, s.health + R.healthRegenPerHour * hoursFed);
  if (hoursStarving > 0) {
    const floor = Math.min(health, R.starvingHealthFloor);
    health = Math.max(floor, health - R.starvingHealthDrainPerHour * hoursStarving);
  }
  const stamina = Math.min(R.max, s.stamina + R.staminaRegenPerHour * hours);

  return { health, hunger, stamina, updatedAt: now };
}

/** Total XP needed to reach `level`: 0, 100, 300, 600, 1000, ... */
export function xpForLevel(level: number): number {
  return 50 * level * (level - 1);
}

export const MAX_LEVEL = 30;

export function levelForXp(xp: number): number {
  const lvl = Math.floor((1 + Math.sqrt(1 + (8 * Math.max(0, xp)) / 100)) / 2);
  return Math.min(MAX_LEVEL, Math.max(1, lvl));
}
