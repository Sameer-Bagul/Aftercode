import { processSingleRepository } from '../dist/processing/runner.js';
import { loadInventoryState, saveInventoryState } from '../dist/processing/status.js';
import * as path from 'path';
import 'dotenv/config';

async function analyzeTargetRepo() {
  const repoName = 'portfolio-admin';
  const owner = 'Sameer-Bagul';
  const repoUrl = `https://github.com/${owner}/${repoName}`;

  const inventoryPath = path.resolve('processing/repository-inventory.json');
  const workspaceDir = path.resolve('workspace/current');
  const outputMetadataDir = path.resolve('output/metadata');
  const schemaPath = path.resolve('schemas/project.schema.json');

  let state = loadInventoryState(inventoryPath);
  if (!state) {
    state = {
      owner,
      totalRepositories: 1,
      lastUpdated: new Date().toISOString(),
      repositories: [],
    };
  }

  let item = state.repositories.find((r) => r.slug === repoName || r.name === repoName);
  if (!item) {
    item = {
      name: repoName,
      slug: repoName,
      url: repoUrl,
      status: 'pending',
      classification: null,
      lastProcessedTime: null,
      error: null,
      fork: false,
      archived: false,
    };
    state.repositories.push(item);
    saveInventoryState(inventoryPath, state);
  }

  const config = {
    owner,
    inventoryPath,
    workspaceDir,
    outputMetadataDir,
    schemaPath,
  };

  console.log(`\n🔍 Analyzing repository: ${repoUrl}...`);
  const success = await processSingleRepository(item, state, config);
  if (success) {
    console.log(`\n🎉 Analysis completed successfully for ${repoName}!`);
  } else {
    console.error(`\n❌ Processing failed for ${repoName}`);
  }
}

analyzeTargetRepo();
