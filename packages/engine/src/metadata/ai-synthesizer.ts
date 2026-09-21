import { ExtractedEvidence } from '../repository/evidence-collector.js';
import { stripEmojis } from './normalizer.js';
import { AiProviderRegistry } from '../ai/provider-registry.js';

export interface SynthesisResult {
  contributions: string[];
  features: string[];
  challenges: string[];
  learnings: string[];
  futureRoadmap: string[];
}

export function generateMermaidArchitectureDiagram(evidence: ExtractedEvidence): string {
  const { techStack, apiEndpoints, keyModules } = evidence;
  const hasFrontend = techStack.frontend.length > 0;
  const hasBackend = techStack.backend.length > 0;
  const hasDb = techStack.database.length > 0;
  const hasAi = techStack.aiMl.length > 0;
  const hasInfra = techStack.infrastructure.length > 0;

  const frontendTech = techStack.frontend.join(' / ') || 'React / HTML5';
  const backendTech = techStack.backend.join(' / ') || 'Node.js Express / Python API';
  const aiTech = techStack.aiMl.join(' / ') || 'Local ONNX / ML Inference';
  const dbTech = techStack.database.join(' / ') || 'SQL / NoSQL Database';
  const infraTech = techStack.infrastructure.join(' / ') || 'Docker Multi-Stage Build';

  const lines: string[] = ['graph TD'];

  // Subgraph 1: Client / Presentation Tier
  lines.push('    subgraph ClientTier ["Presentation & Client Layer"]');
  lines.push(`        UI["${hasFrontend ? `Frontend UI Components (${frontendTech})` : 'Client / User App Interface'}"]`);
  if (techStack.backend.includes('WebSockets')) {
    lines.push('        AudioPlayer["WebAudio / HTML5 Binary Stream Player"]');
  }
  lines.push('    end');

  // Subgraph 2: API Gateway & Routing Tier
  lines.push('    subgraph APITier ["API Gateway & Routing Layer"]');
  lines.push(`        Router["${hasBackend ? `Backend Service Router (${backendTech})` : 'HTTP Request Router'}"]`);
  if (techStack.backend.includes('WebSockets')) {
    lines.push('        WSStream["WebSocket Binary Frame Handler (WS /stream)"]');
  }
  lines.push('    end');

  // Subgraph 3: Business Logic & Controllers Tier
  lines.push('    subgraph ServiceTier ["Service Logic & Controllers Layer"]');
  const serviceModuleName = keyModules.find((m) => m.name.toLowerCase().includes('service'))?.path || 'src/services';
  lines.push(`        Controller["Service Controllers & Handlers (${serviceModuleName})"]`);
  lines.push('    end');

  // Subgraph 4: AI & Storage Tier
  if (hasAi || hasDb) {
    lines.push('    subgraph DataEngineTier ["Inference Engine & Data Storage"]');
    if (hasAi) {
      lines.push(`        InferenceEngine["AI/ML Model Inference Runtime (${aiTech})"]`);
    }
    if (hasDb) {
      lines.push(`        Database["Persistence Storage Layer (${dbTech})"]`);
    }
    lines.push('    end');
  }

  // Subgraph 5: Infrastructure Tier
  if (hasInfra) {
    lines.push('    subgraph InfraTier ["Infrastructure & Deployment Environment"]');
    lines.push(`        Container["Docker Container Sandbox (${infraTech})"]`);
    lines.push('    end');
  }

  // Connection Flow Arrows
  if (apiEndpoints.length > 0) {
    const epList = apiEndpoints.slice(0, 3).map((e) => `${e.method} ${e.path.replace(/[:"()]/g, '')}`).join(', ');
    lines.push(`    UI -->|"HTTP Requests: ${epList}"| Router`);
  } else {
    lines.push('    UI -->|"HTTP / REST API Payload"| Router');
  }

  if (techStack.backend.includes('WebSockets')) {
    lines.push('    UI -->|"WebSocket Connection (WS)"| WSStream');
    lines.push('    WSStream -->|"Chunked Audio Buffer"| Controller');
  }

  lines.push('    Router -->|"Validate & Dispatch"| Controller');

  if (hasAi) {
    lines.push('    Controller -->|"Tensor Inputs & Config"| InferenceEngine');
    lines.push('    InferenceEngine -->|"Synthesized Data / Audio Chunks"| Controller');
  }

  if (hasDb) {
    lines.push('    Controller -->|"ORM Queries & CRUD"| Database');
    lines.push('    Database -->|"Recordsets & State"| Controller');
  }

  lines.push('    Controller -->|"JSON Response / Stream Output"| UI');

  if (hasInfra) {
    lines.push('    Container -.->|"Encloses & Isolates"| Router');
    lines.push('    Container -.->|"Encloses & Isolates"| Controller');
  }


  return lines.join('\n');
}

export function generateMermaidDataFlowDiagram(evidence: ExtractedEvidence): string {
  const { repoName, techStack, apiEndpoints } = evidence;
  const hasAi = techStack.aiMl.length > 0;
  const hasDb = techStack.database.length > 0;

  const lines: string[] = ['graph LR'];
  lines.push('    subgraph Ingestion ["Data Ingestion & Extraction Layer"]');
  lines.push('        RawSource["Source Code & Documents"]')
  lines.push('        ASTScanner["AST Parser & Manifest Extractor"]')
  lines.push('        Chunker["Code Chunker & Tokenizer"]')
  lines.push('    end');

  lines.push('    subgraph Indexing ["Hybrid Search & Indexing Engine"]');
  lines.push('        BM25["BM25 Lexical Index"]')
  lines.push('        VectorStore["TF-IDF / Vector Store"]')
  lines.push('        RRF["Reciprocal Rank Fusion (RRF)"]')
  lines.push('    end');

  lines.push('    subgraph Processing ["Synthesis & Inference Engine"]');
  lines.push('        ContextAssembler["Context Window Assembler"]')
  lines.push(`        LLMProvider["${hasAi ? techStack.aiMl.join(' / ') : 'AI LLM Multi-Provider Registry'}"]`);
  if (hasDb) {
    lines.push(`        DatabaseLayer["${techStack.database.join(' / ')} Persistence"]`);
  }
  lines.push('    end');

  lines.push('    RawSource -->|"Extract Syntax Trees"| ASTScanner');
  lines.push('    ASTScanner -->|"Segment Text Tokens"| Chunker');
  lines.push('    Chunker -->|"Build Lexical Tokens"| BM25');
  lines.push('    Chunker -->|"Generate Dense Embeddings"| VectorStore');
  lines.push('    BM25 -->|"Score Chunks"| RRF');
  lines.push('    VectorStore -->|"Cosine Similarity"| RRF');
  lines.push('    RRF -->|"Top-Ranked Context"| ContextAssembler');
  lines.push('    ContextAssembler -->|"Prompt Payload"| LLMProvider');
  if (hasDb) {
    lines.push('    LLMProvider -->|"Store Structured State"| DatabaseLayer');
  }

  return lines.join('\n');
}

export function generateMermaidSequenceDiagram(evidence: ExtractedEvidence): string {
  const { repoName, techStack, apiEndpoints } = evidence;
  const mainEndpoint = apiEndpoints[0] ? `${apiEndpoints[0].method} ${apiEndpoints[0].path.replace(/[:"()]/g, '')}` : 'POST /api/analyze';

  const lines: string[] = ['sequenceDiagram'];
  lines.push('    autonumber');
  lines.push('    actor Client as Client / Browser');
  lines.push('    participant Gateway as API Gateway / Router');
  lines.push('    participant Controller as Service Controller');
  lines.push('    participant Engine as AI / Business Engine');
  lines.push('    participant DB as Persistence Storage');

  lines.push(`    Client->>Gateway: ${mainEndpoint} (JSON Payload)`);
  lines.push('    Gateway->>Gateway: Validate CORS, Headers & Rate Limits');
  lines.push('    Gateway->>Controller: Dispatch Sanitized Request');
  lines.push('    Controller->>Engine: Execute Business Logic & RAG Context Lookup');
  lines.push('    Engine->>DB: Query / Mutate Recordsets');
  lines.push('    DB-->>Engine: Return State / Documents');
  lines.push('    Engine-->>Controller: Return Processed Data Frame');
  lines.push('    Controller-->>Gateway: HTTP 200 OK + JSON Body');
  lines.push('    Gateway-->>Client: Render UI Update / Toast');

  return lines.join('\n');
}

export function generateMediumDescription(evidence: ExtractedEvidence): string {
  const { repoName, techStack, detectedLanguages, apiEndpoints } = evidence;
  const langList = detectedLanguages.map(l => `**${l}**`).join(', ') || '**TypeScript**';
  const backendTech = techStack.backend.map(b => `\`${b}\``).join(', ') || '`Node.js Express`';
  const frontendTech = techStack.frontend.map(f => `\`${f}\``).join(', ');
  const aiTech = techStack.aiMl.length > 0 ? ` with local AI/ML acceleration via ${techStack.aiMl.map(a => `\`${a}\``).join(', ')}` : '';
  const dbTech = techStack.database.length > 0 ? ` and structured persistence powered by ${techStack.database.map(d => `\`${d}\``).join(', ')}` : '';
  const endpointsCount = apiEndpoints.length > 0 ? ` exposing **${apiEndpoints.length} REST API routes**` : '';

  return `**${repoName}** is a production-grade software engineering system implemented primarily in ${langList}${aiTech}${dbTech}. The backend service layer is built on ${backendTech}${endpointsCount}, managing incoming payload validation, CORS security, and rate-limiting middleware.${frontendTech ? ` The presentation tier is engineered using ${frontendTech}, featuring reactive component hierarchies and modular state synchronization.` : ''} The entire application adopts a clean, decoupled architecture optimized for containerized deployment and automated AST inspection.`;
}

export function generateExhaustiveTechnicalDescription(evidence: ExtractedEvidence): string {
  const { repoName, techStack, detectedLanguages, apiEndpoints, keyModules, readmeSummary } = evidence;

  const cleanSummary = stripEmojis(readmeSummary || '').replace(/^#+\s*/g, '');
  const langList = detectedLanguages.map(l => `**${l}**`).join(', ') || '**TypeScript**';
  const frontendTech = techStack.frontend.map(f => `\`${f}\``).join(', ') || '`React` / `HTML5`';
  const backendTech = techStack.backend.map(b => `\`${b}\``).join(', ') || '`Node.js Express`';
  const aiTech = techStack.aiMl.length > 0 ? ` featuring local AI/ML inference via ${techStack.aiMl.map(a => `\`${a}\``).join(', ')}` : '';
  const dbTech = techStack.database.length > 0 ? ` and structured persistence powered by ${techStack.database.map(d => `\`${d}\``).join(', ')}` : '';
  const infraTech = techStack.infrastructure.length > 0 ? ` Deployment is containerized and orchestrated through ${techStack.infrastructure.map(i => `\`${i}\``).join(', ')}.` : '';

  const modulesList = keyModules.length > 0
    ? ` The codebase is structured modularly across key functional boundaries including ${keyModules.map((m) => `\`${m.name}\` (\`${m.path}\`)`).join(', ')}.`
    : '';

  const endpointsList = apiEndpoints.length > 0
    ? ` The network interface exposes **${apiEndpoints.length} primary REST/WebSocket routes** including ${apiEndpoints.slice(0, 4).map((e) => `\`${e.method} ${e.path}\``).join(', ')}.`
    : '';

  return [
    `### Core System Architecture & Service Topology\n**${repoName}** is a production-grade software engineering system implemented in ${langList}.${aiTech}${dbTech}. The core application is partitioned into decoupled service boundaries. Backend request processing is powered by ${backendTech}, managing incoming payload validation, CORS security policies, and rate-limiting middleware. ${frontendTech ? `The presentation tier is built using ${frontendTech}, utilizing reactive component hierarchies and state management.` : ''}${modulesList}`,

    `### Data Pipeline, Processing & Execution Flow\nIncoming requests follow a deterministic execution lifecycle. ${endpointsList} Requests enter through designated entrypoint routes, pass through parameter validation, and execute business logic within isolated service controllers. Output data frames and JSON models are serialized cleanly back to callers with low latency overhead.`,

    `### Algorithmic Design Patterns & Decoupled Controllers\nThe system enforces separation of concerns between HTTP routing handlers, business domain logic, and data layer models. Service controllers isolate side-effects, while data transformation utilities normalize payloads prior to persistence or UI rendering. Error boundaries capture runtime exceptions gracefully to maintain service availability.`,

    `### Infrastructure, Reliability & Build System\n${infraTech} Environment variables are managed using isolated configuration templates. Automated linting, static analysis, and code quality checks are enforced via ${techStack.tools.concat(techStack.testing).map(t => `\`${t}\``).join(', ') || '`TypeScript` / `ESLint`'}.`,

    cleanSummary ? `### Project Documentation & Context\n${cleanSummary}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
}

export async function runMultiPassSynthesis(evidence: ExtractedEvidence): Promise<SynthesisResult> {
  if (process.env.ENABLE_AI_LLM_SYNTHESIS !== 'false') {
    console.log(` 🤖 [Step 4/7] Invoking AI Provider Registry for multi-pass technical synthesis...`);
    const llmResult = await runLlmMultiPassSynthesis(evidence);
    console.log(` ✅ [Step 4/7] AI LLM synthesis completed successfully (${llmResult.contributions.length} contributions, ${llmResult.features.length} features, ${llmResult.challenges.length} challenges generated).`);
    return llmResult;
  }

  const heuristicResult = runDeepHeuristicSynthesis(evidence);
  console.log(` ✅ [Step 4/7] Deep Heuristic Synthesis completed (${heuristicResult.contributions.length} contributions, ${heuristicResult.features.length} features, ${heuristicResult.challenges.length} challenges, ${heuristicResult.futureRoadmap.length} roadmap goals).`);
  return heuristicResult;
}

function runDeepHeuristicSynthesis(evidence: ExtractedEvidence): SynthesisResult {
  const { repoName, techStack, detectedLanguages, apiEndpoints, keyModules } = evidence;

  // Pass 1: Detailed Technical Accomplishments (10 - 15 items)
  const contributions: string[] = [
    `Architected and implemented end-to-end repository structure for ${repoName}`,
  ];

  if (techStack.frontend.length > 0) {
    contributions.push(`Built responsive user interface using ${techStack.frontend.join(', ')} with modular component hierarchy`);
  }
  if (techStack.backend.length > 0) {
    contributions.push(`Designed robust backend service layer using ${techStack.backend.join(', ')} managing routing and request pipelines`);
  }
  if (techStack.aiMl.length > 0) {
    contributions.push(`Integrated high-performance AI/ML inference runtime using ${techStack.aiMl.join(', ')} for on-device processing`);
  }
  if (techStack.database.length > 0) {
    contributions.push(`Configured database persistence and schema models using ${techStack.database.join(', ')}`);
  }
  if (techStack.infrastructure.length > 0) {
    contributions.push(`Containerized application and configured multi-stage builds using ${techStack.infrastructure.join(', ')}`);
  }
  if (apiEndpoints.length > 0) {
    contributions.push(`Defined and exposed ${apiEndpoints.length} REST/WebSocket API endpoints (${apiEndpoints.map((e) => e.path).slice(0, 4).join(', ')})`);
  }
  for (const lang of detectedLanguages) {
    contributions.push(`Developed core logic and type-safe abstractions in ${lang}`);
  }
  if (keyModules.length > 0) {
    contributions.push(`Organized modular code structure across key components: ${keyModules.map((m) => m.name).join(', ')}`);
  }
  contributions.push(`Established automated quality assurance and linting configuration using ${techStack.tools.concat(techStack.testing).join(', ') || 'standard tools'}`);

  // Pass 2: Engineering Challenges & Trade-offs (5+ items)
  const challenges: string[] = [];
  if (techStack.aiMl.length > 0) {
    challenges.push(`Optimizing local AI/ML model inference latency and RAM memory footprint for concurrent worker threads`);
  }
  if (techStack.backend.includes('WebSockets') || techStack.backend.includes('FastAPI')) {
    challenges.push(`Managing real-time streaming buffer pools and preventing audio/data frame stuttering over WebSocket connections`);
  }
  if (techStack.infrastructure.includes('Docker')) {
    challenges.push(`Minimizing container image size and build times for cross-platform deployment environments`);
  }
  if (techStack.database.length > 0) {
    challenges.push(`Ensuring atomic database transactions and connection pool scaling under high concurrent read/write loads`);
  }
  challenges.push(`Maintaining backward API compatibility while decoupling service modules and route handlers`);

  // Pass 3: Technical Learnings (5+ items)
  const learnings: string[] = [];
  for (const tech of techStack.frontend.concat(techStack.backend, techStack.aiMl, techStack.database).slice(0, 4)) {
    learnings.push(`Deep domain experience in design patterns and optimization with ${tech}`);
  }
  if (techStack.aiMl.length > 0) {
    learnings.push(`Inference engine quantization trade-offs between floating-point precision and model execution speed`);
  }
  if (techStack.infrastructure.length > 0) {
    learnings.push(`Best practices for microservice containerization, environment variable isolation, and health monitoring`);
  }
  learnings.push(`Effective clean architecture patterns for decoupling application entrypoints from business logic`);

  // Pass 4: Actionable Future Roadmap (5+ items)
  const futureRoadmap: string[] = [
    `Implement WebRTC streaming protocol for sub-100ms real-time audio/data transmission`,
    `Apply INT8 quantization to local ML models for 50% memory footprint reduction`,
    `Integrate Prometheus metrics exporter for HTTP endpoint latency and queue depth telemetry`,
    `Expand automated end-to-end testing coverage using Playwright and Vitest`,
    `Set up CI/CD GitHub Actions workflow for automated container build and deployment verification`,
  ];

  // Strip emojis from all features and contributions
  const cleanFeatures = evidence.features.map((f) => stripEmojis(f));
  const cleanContributions = contributions.map((c) => stripEmojis(c));
  const cleanChallenges = challenges.map((c) => stripEmojis(c));
  const cleanLearnings = learnings.map((l) => stripEmojis(l));
  const cleanRoadmap = futureRoadmap.map((r) => stripEmojis(r));

  return {
    contributions: Array.from(new Set(cleanContributions)),
    features: cleanFeatures,
    challenges: Array.from(new Set(cleanChallenges)),
    learnings: Array.from(new Set(cleanLearnings)),
    futureRoadmap: cleanRoadmap,
  };
}

export function truncateToTokenBudget(text: string, maxChars = 15000): string {
  if (!text || text.length <= maxChars) return text;
  return `${text.substring(0, maxChars)}\n\n[Content truncated to maintain AI token safety budget]`;
}

async function runLlmMultiPassSynthesis(evidence: ExtractedEvidence): Promise<SynthesisResult> {
  const safeSummary = truncateToTokenBudget(evidence.readmeSummary || '', 12000);
  const prompt = `Synthesize exhaustive technical portfolio metadata for repository '${evidence.repoName}':
Summary: ${safeSummary}
Languages: ${evidence.detectedLanguages.join(', ')}
Tech Stack: ${JSON.stringify(evidence.techStack)}
Endpoints: ${JSON.stringify(evidence.apiEndpoints)}

Return strictly valid JSON with keys: "contributions" (10-15 detailed bullet points), "features" (8+ bullet points), "challenges" (5+ items), "learnings" (5+ items), "futureRoadmap" (5+ items). DO NOT include any emojis in the text.`;

  const response = await AiProviderRegistry.synthesizeJson<any>(prompt);
  if (response && response.data) {
    const parsed = response.data;
    return {
      contributions: (parsed.contributions || []).map((s: string) => stripEmojis(s)),
      features: (parsed.features || []).map((s: string) => stripEmojis(s)),
      challenges: (parsed.challenges || []).map((s: string) => stripEmojis(s)),
      learnings: (parsed.learnings || []).map((s: string) => stripEmojis(s)),
      futureRoadmap: (parsed.futureRoadmap || []).map((s: string) => stripEmojis(s)),
    };
  }
  throw new Error('Failed to parse JSON from AI Provider Registry response');
}

