import { fetchRepositoriesFromGitHub, buildInventoryState } from '../dist/github/discover-repositories.js';
import { saveInventoryState } from '../dist/processing/status.js';
import * as path from 'path';
import 'dotenv/config';

async function main() {
  const owner = process.env.GITHUB_OWNER || 'Sameer-Bagul';
  const token = process.env.GITHUB_TOKEN;
  const inventoryPath = path.resolve('processing/repository-inventory.json');

  console.log(`🔍 [Discover] Fetching repositories from GitHub for owner: ${owner}...`);
  try {
    const repos = await fetchRepositoriesFromGitHub(owner, token);
    console.log(` ✅ Discovered ${repos.length} repositories from GitHub API.`);

    const state = buildInventoryState(owner, repos, inventoryPath);
    saveInventoryState(inventoryPath, state);

    console.log(` 💾 Saved inventory state with ${state.totalRepositories} entries to ${inventoryPath}`);
  } catch (err) {
    console.error(` ❌ Discovery failed: ${err.message}`);
    process.exit(1);
  }
}

main();
