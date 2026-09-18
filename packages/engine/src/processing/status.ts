import * as fs from 'fs';
import * as path from 'path';
import { InventoryState, InventoryItem } from '../github/github-types.js';

export function loadInventoryState(inventoryPath: string): InventoryState | null {
  if (!fs.existsSync(inventoryPath)) return null;
  try {
    const raw = fs.readFileSync(inventoryPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveInventoryState(inventoryPath: string, state: InventoryState): void {
  const dir = path.dirname(inventoryPath);
  fs.mkdirSync(dir, { recursive: true });
  state.lastUpdated = new Date().toISOString();
  fs.writeFileSync(inventoryPath, JSON.stringify(state, null, 2), 'utf-8');
}

export function updateItemStatus(
  state: InventoryState,
  slug: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  classification?: string,
  error?: string
): void {
  const item = state.repositories.find((r) => r.slug === slug);
  if (item) {
    item.status = status;
    if (classification) item.classification = classification;
    if (error) item.error = error;
    else if (status === 'completed') item.error = null;
    item.lastProcessedTime = new Date().toISOString();
  }
}
