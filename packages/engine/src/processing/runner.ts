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
import { chunkWorkspaceDirectory } from '../rag/chunker.js';
import { EphemeralHybridIndex } from '../rag/hybrid-indexer.js';
import { runRagMultiPassSynthesis } from '../rag/rag-synthesizer.js';

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
  const hybridIndex = new EphemeralHybridIndex();

  try {
    // 1. Clone shallowly into workspace sandbox
    await cloneRepositoryToWorkspace(item.url, workspaceDir);

    // 2. Classify
    const classification = classifyRepository(workspaceDir, item.fork, item.archived);

    // 3. Collect Evidence
    const evidence = collectRepositoryEvidence(workspaceDir, item.name);

    // 4. Build Ephemeral Hybrid RAG Index & Perform RAG Synthesis
    console.log(` 🧩 [Step 4/7] Chunking repository source files & building Ephemeral Hybrid RAG Index (BM25 + Vector)...`);
    const chunks = chunkWorkspaceDirectory(workspaceDir);
    await hybridIndex.buildIndex(chunks);
    console.log(` 🧩 [Step 4/7] Ephemeral Hybrid Index populated with ${hybridIndex.getChunkCount()} code/config chunks.`);

    const ragSynthesis = await runRagMultiPassSynthesis(evidence, hybridIndex);

    // 5. Generate Metadata Payload
    console.log(` ⚙️ [Step 5/7] Assembling metadata payload, Mermaid diagram, and Remotion video script...`);
    const generatedPayload = await generateMetadataPayload(
      owner,
      item.name,
      item.url,
      item.fork,
      evidence,
      classification,
      ragSynthesis
    );

    // 6. Read Existing & Safe Merge (Human Override Protection)
    console.log(` 🛡️ [Step 5/7] Checking for existing human-curated metadata to preserve verified fields...`);
    const existing = readExistingMetadata(outputMetadataDir, item.slug);
    const finalPayload = safeMergeMetadata(existing, generatedPayload);
    if (existing?.manuallyVerified) {
      console.log(` 🔒 [Step 5/7] Human override lock active (manuallyVerified: true). Preserved all human edits.`);
    } else if (existing) {
      console.log(` 🔄 [Step 5/7] Safely merged generated payload with existing unverified metadata.`);
    } else {
      console.log(` 🆕 [Step 5/7] Created brand new metadata record for slug: '${item.slug}'.`);
    }

    // 7. Validate Schema & Business Rules
    console.log(` 📋 [Step 6/7] Validating final payload against AJV JSON Schema & anti-hallucination business rules...`);
    const schemaValidation = validator(finalPayload);
    if (!schemaValidation.valid) {
      throw new Error(`AJV Schema validation failed: ${schemaValidation.errors.join('; ')}`);
    }
    console.log(` ✅ [Step 6/7] AJV Schema Validation: PASSED`);

    const businessValidation = validateBusinessRules(finalPayload, new Set());
    if (!businessValidation.valid) {
      throw new Error(`Business rules validation failed: ${businessValidation.errors.join('; ')}`);
    }
    console.log(` ✅ [Step 6/7] Business Rules & Anti-Hallucination Validation: PASSED`);

    // Write Output Metadata File
    console.log(` 💾 [Step 7/7] Writing output JSON metadata file...`);
    fs.mkdirSync(outputMetadataDir, { recursive: true });
    const outputPath = path.join(outputMetadataDir, `${item.slug}.json`);
    const jsonStr = JSON.stringify(finalPayload, null, 2);
    fs.writeFileSync(outputPath, jsonStr, 'utf-8');
    console.log(` 💾 [Step 7/7] Saved Metadata File: ${outputPath} (${Buffer.byteLength(jsonStr, 'utf-8')} bytes)`);

    // Update Inventory Status
    updateItemStatus(state, item.slug, 'completed', classification.type);
    saveInventoryState(inventoryPath, state);

    console.log(` 🎉 [Complete] Successfully processed repository '${item.name}' -> ${item.slug}.json\n`);
    return true;
  } catch (err: any) {
    const errorMsg = err.message || 'Unknown processing error';
    console.error(` ❌ [Error] Failed processing ${item.name}: ${errorMsg}`);
    updateItemStatus(state, item.slug, 'failed', undefined, errorMsg);
    saveInventoryState(inventoryPath, state);
    return false;
  } finally {
    // MANDATORY PURGE: Destroy hybrid RAG index memory and wipe workspace sandbox
    hybridIndex.destroyIndex();
    console.log(` 🗑️ [Purge] Ephemeral Hybrid RAG Index destroyed in memory.`);
    await wipeWorkspace(workspaceDir);
    console.log(` 🧹 [Cleanup] Workspace sandbox cleaned.`);
  }
}
