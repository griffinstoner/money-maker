import type { LatLng, NearbyCreature, NearbyNode, NodeType } from '@game';

export interface GameMapProps {
  center: LatLng;
  creatures: NearbyCreature[];
  nodes: NearbyNode[];
  /** Server time, to grey out regrowing nodes. */
  now: number;
  onPressCreature: (c: NearbyCreature) => void;
  onPressNode: (n: NearbyNode) => void;
}

export const NODE_EMOJI: Record<NodeType, string> = {
  tree: '🌳',
  rock: '🪨',
  bush: '🌿',
  metal_deposit: '⛏️',
  supply_drop: '📦',
};

export const NODE_LABEL: Record<NodeType, string> = {
  tree: 'Tree',
  rock: 'Rock',
  bush: 'Berry bush',
  metal_deposit: 'Metal deposit',
  supply_drop: 'Supply drop',
};
