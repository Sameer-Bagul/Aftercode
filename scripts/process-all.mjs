import { loadInventoryState } from '../dist/processing/status.js';
import { getPendingItems } from '../dist/processing/queue.js';
import { processSingleRepository } from '../dist/processing/runner.js';
import * as path from 'path';
import 'dotenv/config';

async function main() {
  const owner = process.env.GITHUB_OWNER || 'Sameer-Bagul';
  const inventoryPath = path.resolve('processing/repository-inventory.json');
  const workspaceDir = path.resolve('workspace/current');
  const outputMetadataDir = path.resolve('output/metadata');
  const schemaPath = path.resolve('schemas/project.schema.json');

  const state = loadInventoryState(inventoryPath);
  if (!state) {
    console.error(` ❌ Inventory missing at ${inventoryPath}. Run 'npm run discover' first.`);
    process.exit(1);
  }

  const pendingItems = getPendingItems(state);
  console.log(`\n📦 [Batch Process] Total: ${state.totalRepositories} | Pending/Failed: ${pendingItems.length}`);

  if (pendingItems.length === 0) {
    console.log(` ✨ All repositories are already processed and marked completed!`);
    return;
  }

  const config = { owner, inventoryPath, workspaceDir, outputMetadataDir, schemaPath };

  let successCount = 0;
  let failCount = 0;

  for (const item of pendingItems) {
    const ok = await processSingleRepository(item, state, config);
    if (ok) successCount++;
    else failCount++;
  }

  console.log(`\n🎉 Batch processing finished. Passed: ${successCount} | Failed: ${failCount}`);
}

main();
