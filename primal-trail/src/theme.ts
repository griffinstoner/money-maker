import type { Rarity } from '@game';

export const colors = {
  bg: '#F4EFE3',
  card: '#FFFDF7',
  ink: '#2A2A22',
  muted: '#6B6A5C',
  border: '#E3DCCB',
  primary: '#2F6B45',
  primaryDark: '#1F3A2B',
  accent: '#D98E2B',
  danger: '#C2452D',
  health: '#D2483A',
  hunger: '#E09A2D',
  stamina: '#4A9E5C',
  torpor: '#7A5FC0',
  white: '#FFFFFF',
};

export const rarityColor: Record<Rarity, string> = {
  common: '#7D837B',
  uncommon: '#3E8E4E',
  rare: '#2F6FB5',
  epic: '#7B4BB7',
  legendary: '#C9821F',
};

export const space = (n: number) => n * 4;
export const radius = 12;
