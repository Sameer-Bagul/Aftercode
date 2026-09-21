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

  const hybridIndex = new EphemeralHybridIndex();
  let currentStep = 'Step 1/7: Initializing Sandbox & Git Clone';

  try {
    // 1. Clone shallowly into workspace sandbox
    currentStep = 'Step 1/7: Shallow Clone';
    try {
      await cloneRepositoryToWorkspace(item.url, workspaceDir);
    } catch (err: any) {
      throw new Error(`[Step 1/7 Failure - Git Clone]: ${err.message || 'Failed to clone repository into sandbox.'}`);
    }

    // 2. Classify
    currentStep = 'Step 2/7: Complexity Classification';
    let classification;
    try {
      classification = classifyRepository(workspaceDir, item.fork, item.archived);
    } catch (err: any) {
      throw new Error(`[Step 2/7 Failure - Classification]: ${err.message || 'Failed to classify repository structural complexity.'}`);
    }

    // 3. Collect Evidence
    currentStep = 'Step 3/7: Code Evidence Extraction';
    let evidence;
    try {
      evidence = collectRepositoryEvidence(workspaceDir, item.name);
    } catch (err: any) {
      throw new Error(`[Step 3/7 Failure - Evidence Extraction]: ${err.message || 'Failed to extract AST routes and manifests.'}`);
    }

    // 4. Build Ephemeral Hybrid RAG Index & Perform RAG Synthesis
    currentStep = 'Step 4/7: Hybrid RAG Indexing & Prompt Synthesis';
    let ragSynthesis;
    try {
      console.log(` 🧩 [Step 4/7] Chunking repository source files & building Ephemeral Hybrid RAG Index (BM25 + Vector)...`);
      const chunks = chunkWorkspaceDirectory(workspaceDir);
      await hybridIndex.buildIndex(chunks);
      console.log(` 🧩 [Step 4/7] Ephemeral Hybrid Index populated with ${hybridIndex.getChunkCount()} code/config chunks.`);
      ragSynthesis = await runRagMultiPassSynthesis(evidence, hybridIndex);
    } catch (err: any) {
      throw new Error(`[Step 4/7 Failure - RAG Synthesis]: ${err.message || 'Failed to build RAG index or execute prompt synthesis.'}`);
    }

    // 5. Generate Metadata Payload
    currentStep = 'Step 5/7: Metadata Payload Assembly';
    let finalPayload;
    try {
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

      console.log(` 🛡️ [Step 5/7] Checking for existing human-curated metadata to preserve verified fields...`);
      const existing = readExistingMetadata(outputMetadataDir, item.slug);
      finalPayload = safeMergeMetadata(existing, generatedPayload);
      if (existing?.manuallyVerified) {
        console.log(` 🔒 [Step 5/7] Human override lock active (manuallyVerified: true). Preserved all human edits.`);
      } else if (existing) {
        console.log(` 🔄 [Step 5/7] Safely merged generated payload with existing unverified metadata.`);
      } else {
        console.log(` 🆕 [Step 5/7] Created brand new metadata record for slug: '${item.slug}'.`);
      }
    } catch (err: any) {
      throw new Error(`[Step 5/7 Failure - Payload Assembly]: ${err.message || 'Failed to assemble metadata payload.'}`);
    }

    // 6. Validate Schema & Business Rules
    currentStep = 'Step 6/7: AJV Schema & Business Rules Validation';
    try {
      console.log(` 📋 [Step 6/7] Validating final payload against AJV JSON Schema & anti-hallucination business rules...`);
      const validator = createMetadataValidator(schemaPath);
      const schemaValidation = validator(finalPayload);
      if (!schemaValidation.valid) {
        throw new Error(`Schema errors: ${schemaValidation.errors.join('; ')}`);
      }
      console.log(` ✅ [Step 6/7] AJV Schema Validation: PASSED`);

      const businessValidation = validateBusinessRules(finalPayload, new Set());
      if (!businessValidation.valid) {
        throw new Error(`Business rule violations: ${businessValidation.errors.join('; ')}`);
      }
      console.log(` ✅ [Step 6/7] Business Rules & Anti-Hallucination Validation: PASSED`);
    } catch (err: any) {
      throw new Error(`[Step 6/7 Failure - Validation]: ${err.message || 'Metadata validation failed.'}`);
    }

    // 7. Write Output Metadata File
    currentStep = 'Step 7/7: File Storage';
    try {
      console.log(` 💾 [Step 7/7] Writing output JSON metadata file...`);
      fs.mkdirSync(outputMetadataDir, { recursive: true });
      const outputPath = path.join(outputMetadataDir, `${item.slug}.json`);
      const jsonStr = JSON.stringify(finalPayload, null, 2);
      fs.writeFileSync(outputPath, jsonStr, 'utf-8');
      console.log(` 💾 [Step 7/7] Saved Metadata File: ${outputPath} (${Buffer.byteLength(jsonStr, 'utf-8')} bytes)`);
    } catch (err: any) {
      throw new Error(`[Step 7/7 Failure - File System]: ${err.message || 'Failed to write output JSON metadata file.'}`);
    }

    // Update Inventory Status
    updateItemStatus(state, item.slug, 'completed', classification.type);
    saveInventoryState(inventoryPath, state);

    console.log(` 🎉 [Complete] Successfully processed repository '${item.name}' -> ${item.slug}.json\n`);
    return true;
  } catch (err: any) {
    const errorMsg = err.message || `Processing failed during ${currentStep}`;
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
