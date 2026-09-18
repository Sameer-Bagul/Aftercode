import * as fs from 'fs';
import * as path from 'path';
export function loadInventoryState(inventoryPath) {
    if (!fs.existsSync(inventoryPath))
        return null;
    try {
        const raw = fs.readFileSync(inventoryPath, 'utf-8');
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
export function saveInventoryState(inventoryPath, state) {
    const dir = path.dirname(inventoryPath);
    fs.mkdirSync(dir, { recursive: true });
    state.lastUpdated = new Date().toISOString();
    fs.writeFileSync(inventoryPath, JSON.stringify(state, null, 2), 'utf-8');
}
export function updateItemStatus(state, slug, status, classification, error) {
    const item = state.repositories.find((r) => r.slug === slug);
    if (item) {
        item.status = status;
        if (classification)
            item.classification = classification;
        if (error)
            item.error = error;
        else if (status === 'completed')
            item.error = null;
        item.lastProcessedTime = new Date().toISOString();
    }
}
