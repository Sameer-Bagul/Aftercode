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
  console.log(`\n🔄 [Resume] Resuming processing. Total: ${state.totalRepositories} | Pending/Failed: ${pendingItems.length}`);

  if (pendingItems.length === 0) {
    console.log(` ✨ All repositories are completed! Nothing to resume.`);
    return;
  }

  const config = { owner, inventoryPath, workspaceDir, outputMetadataDir, schemaPath };

  for (const item of pendingItems) {
    await processSingleRepository(item, state, config);
  }

  console.log(`\n🎉 Resumed batch execution completed.`);
}

main();
