#!/usr/bin/env node
import { runAftercodeMcpServer } from '../mcp/server.js';
import { fetchRepositoriesFromGitHub, buildInventoryState } from '../github/discover-repositories.js';
import { processSingleRepository } from '../processing/runner.js';
import { loadInventoryState, saveInventoryState } from '../processing/status.js';
import { getPendingItems } from '../processing/queue.js';
import { createMetadataValidator } from '../validation/schema-validator.js';
import { wipeWorkspace } from '../repository/workspace-manager.js';
import { InventoryItem } from '../github/github-types.js';
import * as fs from 'fs';
import * as path from 'path';

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  const projectRoot = process.cwd();
  const inventoryPath = path.join(projectRoot, 'processing', 'repository-inventory.json');
  const metadataDir = path.join(projectRoot, 'output', 'metadata');
  const indexesDir = path.join(projectRoot, 'output', 'indexes');
  const workspaceDir = path.join(projectRoot, 'workspace', 'current');
  const schemaPath = path.join(projectRoot, 'schemas', 'project.schema.json');

  if (command === 'serve') {
    await runAftercodeMcpServer();
    return;
  }

  console.log(`
┌───────────────────────────────────────────────────────────┐
│  ⚡ Aftercode - Portfolio & Architecture AI Engine v1.0.0 │
└───────────────────────────────────────────────────────────┘
`);

  if (command === 'discover') {
    const username = args[1] || 'Sameer-Bagul';
    const token = process.env.GITHUB_TOKEN;
    console.log(`🚀 [Aftercode Discover] Searching repositories for username: ${username}...`);
    const repos = await fetchRepositoriesFromGitHub(username, token);
    const state = buildInventoryState(username, repos, inventoryPath);
    saveInventoryState(inventoryPath, state);
    console.log(` ✅ Discovered ${state.totalRepositories} repositories. Saved to ${inventoryPath}`);
    return;
  }

  if (command === 'process') {
    const target = args[1] || 'all';
    const owner = process.env.GITHUB_OWNER || 'Sameer-Bagul';
    const config = {
      owner,
      inventoryPath,
      workspaceDir,
      outputMetadataDir: metadataDir,
      schemaPath,
    };

    const state = loadInventoryState(inventoryPath);
    if (!state) {
      console.error(` ❌ Inventory file missing at ${inventoryPath}. Run 'npx aftercode discover' first.`);
      process.exit(1);
    }

    if (target === 'all') {
      const pendingItems = getPendingItems(state);
      console.log(`🚀 [Aftercode Process] Starting batch execution across ${pendingItems.length} pending repositories...`);
      for (const item of pendingItems) {
        await processSingleRepository(item, state, config);
      }
      console.log(' 🎉 Batch processing completed!');
    } else {
      console.log(`🚀 [Aftercode Process] Single repository execution for: ${target}`);
      const repo = state.repositories.find((r: InventoryItem) => r.name === target || r.slug === target);
      if (!repo) {
        console.error(` ❌ Repository ${target} not found in inventory.`);
        process.exit(1);
      }
      await processSingleRepository(repo, state, config);
      await wipeWorkspace(workspaceDir);
      console.log(` ✅ Successfully processed ${target}`);
    }
    return;
  }

  if (command === 'validate') {
    console.log('🛡️ [Aftercode Validate] Validating metadata JSON files...');
    if (!fs.existsSync(metadataDir)) {
      console.log(' ⚠️ Metadata directory empty.');
      return;
    }
    const files = fs.readdirSync(metadataDir).filter((f) => f.endsWith('.json'));
    const validator = createMetadataValidator(schemaPath);
    let passed = 0;
    let failed = 0;

    for (const file of files) {
      const content = JSON.parse(fs.readFileSync(path.join(metadataDir, file), 'utf-8'));
      const res = validator(content);
      if (res.valid) {
        passed++;
      } else {
        failed++;
        console.error(` ❌ Validation failed for ${file}:`, res.errors);
      }
    }
    console.log(` 📊 Validation Results: ${passed} Passed | ${failed} Failed`);
    return;
  }

  if (command === 'rebuild') {
    console.log('📊 [Aftercode Rebuild] Rebuilding output index catalogs...');
    fs.mkdirSync(indexesDir, { recursive: true });
    const files = fs.existsSync(metadataDir) ? fs.readdirSync(metadataDir).filter((f) => f.endsWith('.json')) : [];
    const allMetadata = files.map((f) => JSON.parse(fs.readFileSync(path.join(metadataDir, f), 'utf-8')));

    fs.writeFileSync(path.join(indexesDir, 'projects-index.json'), JSON.stringify(allMetadata, null, 2));
    console.log(` ✅ Successfully compiled index catalogs for ${allMetadata.length} projects.`);
    return;
  }

  console.log(`
Usage:
  npx aftercode serve           Run as native Model Context Protocol (MCP) server
  npx aftercode discover [user] Discover public/private repositories for a user
  npx aftercode process [slug]  Process single or all repositories in queue
  npx aftercode validate        Validate output JSON files against AJV schema
  npx aftercode rebuild         Compile project index catalogs
`);
}

main().catch((err) => {
  console.error('Fatal CLI Error:', err);
  process.exit(1);
});
