import { loadInventoryState } from '../dist/processing/status.js';
import { processSingleRepository } from '../dist/processing/runner.js';
import * as path from 'path';
import 'dotenv/config';

async function main() {
  const targetSlug = process.argv[2];
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

  if (!targetSlug) {
    console.error(` ❌ Please specify a target slug: npm run process-one <slug>`);
    console.log(` Available Repositories (${state.repositories.length}):`);
    state.repositories.slice(0, 10).forEach(r => console.log(`  - ${r.slug}`));
    process.exit(1);
  }

  const item = state.repositories.find(r => r.slug === targetSlug || r.name === targetSlug);
  if (!item) {
    console.error(` ❌ Repository '${targetSlug}' not found in inventory.`);
    process.exit(1);
  }

  const config = {
    owner,
    inventoryPath,
    workspaceDir,
    outputMetadataDir,
    schemaPath,
  };

  const success = await processSingleRepository(item, state, config);
  if (success) {
    console.log(`\n🎉 Single repository processing POC completed successfully!`);
  } else {
    console.error(`\n❌ Processing failed for ${targetSlug}`);
    process.exit(1);
  }
}

main();
