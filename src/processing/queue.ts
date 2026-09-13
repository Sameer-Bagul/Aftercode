import { InventoryState, InventoryItem } from '../github/github-types.js';

export function getNextPendingItem(state: InventoryState): InventoryItem | null {
  return state.repositories.find((r) => r.status === 'pending' || r.status === 'failed') || null;
}

export function getPendingItems(state: InventoryState): InventoryItem[] {
  return state.repositories.filter((r) => r.status === 'pending' || r.status === 'failed');
}
