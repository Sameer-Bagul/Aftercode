import { ExtractedEvidence } from '../repository/evidence-collector.js';
import { EphemeralHybridIndex, RetrievalResult } from './hybrid-indexer.js';
import { stripEmojis } from '../metadata/normalizer.js';
import { AiProviderRegistry } from '../ai/provider-registry.js';

export interface RagSynthesisResult {
  mediumDescription?: string;
  longDescription?: string;
  architectureDescription: string;
  contributions: string[];
  features: string[];
  challenges: string[];
  learnings: string[];
  futureRoadmap: string[];
  ragRetrievedChunksCount: number;
}

export async function runRagMultiPassSynthesis(
  evidence: ExtractedEvidence,
  hybridIndex: EphemeralHybridIndex
): Promise<RagSynthesisResult> {
  // Perform 4 RAG Searches across the Ephemeral Hybrid Index
  console.log(` 🔍 [RAG Retriever] Querying Ephemeral Hybrid Index (${hybridIndex.getChunkCount()} total chunks)...`);

  const archChunks = hybridIndex.search('backend router controllers services models database persistence API', 6);
  const routeChunks = hybridIndex.search('express fastapi router get post put delete endpoint route handler', 6);
  const configChunks = hybridIndex.search('package.json dockerfile requirements cargo build dependencies config setup', 6);
  const docChunks = hybridIndex.search('readme documentation overview system entrypoint main', 6);

  const allRetrieved = [...archChunks, ...routeChunks, ...configChunks, ...docChunks];
  const uniqueChunkIds = new Set<string>();
  const topChunks: RetrievalResult[] = [];

  for (const item of allRetrieved) {
    if (!uniqueChunkIds.has(item.chunk.chunkId)) {
      uniqueChunkIds.add(item.chunk.chunkId);
      topChunks.push(item);
    }
  }

  console.log(` 🎯 [RAG Retriever] Retrived ${topChunks.length} top-ranked Hybrid RAG code chunks for synthesis.`);

  if (process.env.ENABLE_AI_LLM_SYNTHESIS !== 'false') {
    return await executeMultiProviderRagSynthesis(evidence, topChunks);
  }

  return executeHeuristicRagSynthesis(evidence, topChunks);
}

async function executeMultiProviderRagSynthesis(
  evidence: ExtractedEvidence,
  retrievedChunks: RetrievalResult[]
): Promise<RagSynthesisResult> {
  const contextSnippet = retrievedChunks
    .slice(0, 10)
    .map((c) => `--- File: ${c.chunk.relativePath} (RRF Score: ${c.score.toFixed(4)}) ---\n${c.chunk.content.substring(0, 1200)}`)
    .join('\n\n');

  const prompt = `You are a Principal Software Architect analyzing repository '${evidence.repoName}'.
Use ONLY the following retrieved code chunks and evidence context to synthesize JSON technical portfolio metadata. DO NOT invent fake endpoints or dependencies.

Retrieved Code Context:
${contextSnippet}

Repo Evidence:
Languages: ${evidence.detectedLanguages.join(', ')}
Tech Stack: ${JSON.stringify(evidence.techStack)}
Endpoints: ${JSON.stringify(evidence.apiEndpoints)}

Return strictly valid JSON with key fields:
- "mediumDescription": (1 large, rich paragraph summarizing core purpose, architectural style, and tech stack using Markdown **bold** and \`code\` formatting)
- "longDescription": (3-5 detailed paragraphs explaining core system architecture, data ingestion pipelines, execution flow, security guardrails, and build topology formatted with Markdown **bold**, *italics*, and \`code\` formatting)
- "architectureDescription": (3-4 paragraphs detailed technical overview)
- "contributions": (10-15 technical bullet points)
- "features": (8+ bullet points)
- "challenges": (5+ engineering trade-off bullet points)
- "learnings": (5+ technical learnings)
- "futureRoadmap": (5+ actionable future roadmap goals)

DO NOT use emojis.`;

  const response = await AiProviderRegistry.synthesizeJson<any>(prompt);
  if (response && response.data) {
    const parsed = response.data;
    return {
      mediumDescription: parsed.mediumDescription || '',
      longDescription: parsed.longDescription || parsed.architectureDescription || '',
      architectureDescription: parsed.architectureDescription || parsed.longDescription || '',
      contributions: (parsed.contributions || []).map((s: string) => stripEmojis(s)),
      features: (parsed.features || []).map((s: string) => stripEmojis(s)),
      challenges: (parsed.challenges || []).map((s: string) => stripEmojis(s)),
      learnings: (parsed.learnings || []).map((s: string) => stripEmojis(s)),
      futureRoadmap: (parsed.futureRoadmap || []).map((s: string) => stripEmojis(s)),
      ragRetrievedChunksCount: retrievedChunks.length,
    };
  }
  throw new Error('Failed to parse JSON from multi-provider AI response');
}

function executeHeuristicRagSynthesis(evidence: ExtractedEvidence, retrievedChunks: RetrievalResult[]): RagSynthesisResult {
  const { repoName, techStack, detectedLanguages, apiEndpoints, keyModules } = evidence;

  const contributions: string[] = [
    `Architected end-to-end codebase for ${repoName} utilizing ${detectedLanguages.join(', ')}`,
  ];

  if (techStack.frontend.length > 0) contributions.push(`Engineered presentation layer with ${techStack.frontend.join(', ')}`);
  if (techStack.backend.length > 0) contributions.push(`Built backend router and service controllers with ${techStack.backend.join(', ')}`);
  if (techStack.database.length > 0) contributions.push(`Configured data persistence and schema models using ${techStack.database.join(', ')}`);
  if (techStack.aiMl.length > 0) contributions.push(`Integrated AI/ML inference runtime powered by ${techStack.aiMl.join(', ')}`);
  if (apiEndpoints.length > 0) contributions.push(`Exposed ${apiEndpoints.length} REST/WebSocket API endpoints`);

  for (const chunk of retrievedChunks.slice(0, 5)) {
    contributions.push(`Modularized logic within ${chunk.chunk.relativePath}`);
  }

  const challenges: string[] = [
    `Managing state synchronization and component decoupling across ${keyModules.length} core modules`,
    `Optimizing data serialization and payload validation for concurrent requests`,
    `Ensuring cross-platform container stability and build isolation`,
  ];

  const learnings: string[] = [
    `Deep technical patterns in ${detectedLanguages.concat(techStack.frontend, techStack.backend).slice(0, 4).join(', ')}`,
    `Effective hybrid search indexing and code chunking for automated AST analysis`,
  ];

  const futureRoadmap: string[] = [
    `Implement WebRTC real-time binary stream handler`,
    `Add automated end-to-end integration test coverage`,
    `Deploy automated CI/CD container build pipeline`,
  ];

  return {
    architectureDescription: [
      `System Architecture for ${repoName}: Built with ${detectedLanguages.join(', ')}.`,
      `Backend service layer powered by ${techStack.backend.join(', ') || 'Node.js/Express service architecture'}, managing incoming payload validation, CORS policies, and rate-limiting middleware.`,
      `Presentation and data storage layers integrate ${techStack.frontend.concat(techStack.database).join(', ') || 'standard web technologies'}.`,
    ].join('\n\n'),
    contributions: Array.from(new Set(contributions.map((c) => stripEmojis(c)))),
    features: evidence.features.map((f) => stripEmojis(f)),
    challenges: Array.from(new Set(challenges.map((c) => stripEmojis(c)))),
    learnings: Array.from(new Set(learnings.map((l) => stripEmojis(l)))),
    futureRoadmap: Array.from(new Set(futureRoadmap.map((r) => stripEmojis(r)))),
    ragRetrievedChunksCount: retrievedChunks.length,
  };
}
