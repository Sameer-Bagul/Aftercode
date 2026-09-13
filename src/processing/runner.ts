import * as path from 'path';
import * as fs from 'fs';
import { InventoryItem, InventoryState } from '../github/github-types.js';
import { saveInventoryState, updateItemStatus } from './status.js';
import { cloneRepositoryToWorkspace, wipeWorkspace } from '../repository/workspace-manager.js';
import { classifyRepository } from '../repository/classifier.js';
import { collectRepositoryEvidence } from '../repository/evidence-collector.js';
import { generateMetadataPayload } from '../metadata/generator.js';
import { readExistingMetadata, safeMergeMetadata } from '../metadata/merger.js';
import { createMetadataValidator } from '../validation/schema-validator.js';
import { validateBusinessRules } from '../validation/business-rules.js';

export interface RunnerConfig {
  owner: string;
  inventoryPath: string;
  workspaceDir: string;
  outputMetadataDir: string;
  schemaPath: string;
}

export async function processSingleRepository(
  item: InventoryItem,
  state: InventoryState,
  config: RunnerConfig
): Promise<boolean> {
  const { owner, inventoryPath, workspaceDir, outputMetadataDir, schemaPath } = config;

  console.log(`\n🚀 [Process] Starting repository: ${item.name} (${item.slug})`);
  updateItemStatus(state, item.slug, 'processing');
  saveInventoryState(inventoryPath, state);

  const validator = createMetadataValidator(schemaPath);

  try {
    // 1. Clone shallowly into workspace sandbox
    console.log(` └─ Clonation: ${item.url} -> ${workspaceDir}`);
    await cloneRepositoryToWorkspace(item.url, workspaceDir);

    // 2. Classify
    const classification = classifyRepository(workspaceDir, item.fork, item.archived);
    console.log(` └─ Classification: ${classification.type} (Worthiness: ${classification.portfolioWorthiness})`);

    // 3. Collect Evidence
    const evidence = collectRepositoryEvidence(workspaceDir, item.name);
    console.log(` └─ Extracted Tech: [${Object.values(evidence.techStack).flat().join(', ')}]`);

    // 4. Generate Metadata
    const generatedPayload = await generateMetadataPayload(
      owner,
      item.name,
      item.url,
      item.fork,
      evidence,
      classification
    );

    // 5. Read Existing & Safe Merge
    const existing = readExistingMetadata(outputMetadataDir, item.slug);
    const finalPayload = safeMergeMetadata(existing, generatedPayload);

    // 6. Validate
    const schemaValidation = validator(finalPayload);
    if (!schemaValidation.valid) {
      throw new Error(`AJV Schema validation failed: ${schemaValidation.errors.join('; ')}`);
    }

    const businessValidation = validateBusinessRules(finalPayload, new Set());
    if (!businessValidation.valid) {
      throw new Error(`Business rules validation failed: ${businessValidation.errors.join('; ')}`);
    }

    // 7. Save Output Metadata File
    fs.mkdirSync(outputMetadataDir, { recursive: true });
    const outputPath = path.join(outputMetadataDir, `${item.slug}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(finalPayload, null, 2), 'utf-8');
    console.log(` └─ Saved Metadata: ${outputPath}`);

    // 8. Update Inventory Status
    updateItemStatus(state, item.slug, 'completed', classification.type);
    saveInventoryState(inventoryPath, state);

    console.log(` ✅ Successfully processed ${item.name}`);
    return true;
  } catch (err: any) {
    const errorMsg = err.message || 'Unknown processing error';
    console.error(` ❌ Failed processing ${item.name}: ${errorMsg}`);
    updateItemStatus(state, item.slug, 'failed', undefined, errorMsg);
    saveInventoryState(inventoryPath, state);
    return false;
  } finally {
    // Always wipe workspace sandbox after processing
    await wipeWorkspace(workspaceDir);
    console.log(` └─ Workspace sandbox cleaned.`);
  }
}
