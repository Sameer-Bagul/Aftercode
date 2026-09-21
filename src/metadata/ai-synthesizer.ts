import { ExtractedEvidence } from '../repository/evidence-collector.js';
import { stripEmojis } from './normalizer.js';
import { AiProviderRegistry } from '../ai/provider-registry.js';

export interface SynthesisResult {
  shortDescription?: string;
  architectureOverview?: string;
  userFlow?: string[];
  codeFlow?: string[];
  contributions: string[];
  features: string[];
  challenges: string[];
  learnings: string[];
  futureRoadmap: string[];
}

export function cleanShortDescription(summary: string | undefined, repoName: string, category: string, detectedLanguages: string[]): string {
  let clean = stripEmojis(summary || '')
    .replace(/#+\s*/g, '')
    .replace(/\*\*|__|\*|_/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  const boilerplateKeywords = ['create-next-app', 'bootstrapped with', 'getting started', 'run the development server', 'open http://localhost'];
  const isBoilerplate = boilerplateKeywords.some(keyword => clean.toLowerCase().includes(keyword));

  if (!clean || clean.length < 20 || isBoilerplate) {
    const langStr = detectedLanguages.slice(0, 3).join(', ') || 'TypeScript';
    clean = `Production-grade ${category} software engineering system implemented in ${langStr}. Features a decoupled multi-tier architecture with validated API endpoints and resilient state processing.`;
  } else if (clean.length > 180) {
    clean = clean.substring(0, 180) + '...';
  }
  return clean;
}

export function generateTechnicalUserFlow(evidence: ExtractedEvidence): string[] {
  if (Array.isArray(evidence.userFlow) && evidence.userFlow.length >= 3) {
    return evidence.userFlow;
  }
  const { techStack, apiEndpoints } = evidence;
  const mainEp = apiEndpoints[0]?.path || '/api/analyze';
  return [
    `User Access & Preset Selection: User opens client interface and configures request parameters or task workflow presets.`,
    `Client Payload Dispatch: Front-end components (${techStack.frontend.join(', ') || 'React'}) serialize input objects and send HTTP/WebSocket requests to \`${mainEp}\`.`,
    `Middleware & Validation Check: API Gateway evaluates CORS headers, authorization tokens, and input validation schemas.`,
    `Service & Inference Execution: Service controllers dispatch request frames to model inference engine (${techStack.aiMl.join(', ') || 'Local Engine'}) or storage layer.`,
    `Response Delivery & State Synchronization: Serialized output payload is returned to the client and rendered in the visual workspace.`,
  ];
}

export function generateTechnicalCodeFlow(evidence: ExtractedEvidence): string[] {
  if (Array.isArray(evidence.codeFlow) && evidence.codeFlow.length >= 3) {
    return evidence.codeFlow;
  }
  const { techStack, apiEndpoints, keyModules } = evidence;
  const mainEp = apiEndpoints[0] ? `${apiEndpoints[0].method} ${apiEndpoints[0].path}` : 'POST /api/analyze';
  const mainModule = keyModules[0]?.name || 'Controllers';

  return [
    `Entrypoint Invocation: Request enters network interface layer via \`${mainEp}\`.`,
    `Schema & Guardrail Verification: Middleware sanitizes payload parameters and checks rate-limiting limits.`,
    `Controller Dispatch: Router delegates validated object to \`${mainModule}\` service controller.`,
    `Engine Execution & Storage Operations: Controller executes business logic, queries database models (${techStack.database.join(', ') || 'Persistence'}), and invokes ML workers.`,
    `Response Serialization: Result model is formatted into standard JSON response frame and delivered with HTTP 200 OK.`,
  ];
}

export function generateArchitectureOverview(evidence: ExtractedEvidence): string {
  if (evidence.architectureOverview && evidence.architectureOverview.trim().length > 100) {
    return evidence.architectureOverview;
  }

  const { repoName, techStack, apiEndpoints, keyModules } = evidence;
  const frontendTech = techStack.frontend.join(', ') || 'React / Next.js';
  const backendTech = techStack.backend.join(', ') || 'Node.js Express / Python API';
  const aiTech = techStack.aiMl.join(', ');
  const dbTech = techStack.database.join(', ');

  const overviewLines: string[] = [
    `### 📐 System Design & Core Architectural Engineering Analysis`,
    `**${repoName}** is engineered around a **decoupled, multi-tier system topology** designed for high concurrency, clear layer boundaries, and low request latency.`,
    `#### 1. Presentation & Client Application Tier`,
    `- **Client Interface**: Built with \`${frontendTech}\`, isolating client-side state transitions from API endpoints.`,
    `- **User State Management**: Maintains optimistic component rendering and reactive state synchronization.`,
    `#### 2. API Gateway & Middleware Security Tier`,
    `- **Request Router & Gateway**: Backend service layer powered by \`${backendTech}\`, enforcing input schema validation, CORS security, and rate limiting middleware.`,
    `- **API Interface**: Exposes ${apiEndpoints.length > 0 ? `${apiEndpoints.length} validated REST/WebSocket endpoints` : 'decoupled API routing handlers'}.`,
    `#### 3. Domain Controllers & Service Logic Tier`,
    `- **Business Rules**: Encapsulates domain logic in isolated service controllers, preventing side-effects across module boundaries.`,
    `${keyModules.length > 0 ? `- **Architectural Modules**: Structured across key directory boundaries (${keyModules.slice(0, 4).map(m => `\`${m.name}\``).join(', ')}).` : ''}`,
    `#### 4. Model Inference Engine & Persistence Tier`,
    `${aiTech ? `- **AI/ML Model Inference**: Execution pipeline accelerated by \`${aiTech}\`.` : ''}`,
    `${dbTech ? `- **Persistence Layer**: Data storage and recordset persistence powered by \`${dbTech}\`.` : '- **State Integrity**: Ensures deterministic state persistence and data frame serialization.'}`,
  ];

  return overviewLines.filter(Boolean).join('\n\n');
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
  lines.push('    subgraph ClientTier ["Presentation & Client Layer"]');
  lines.push(`        UI["${hasFrontend ? `Frontend UI Components (${frontendTech})` : 'Client / User App Interface'}"]`);
  lines.push('    end');

  lines.push('    subgraph APITier ["API Gateway & Routing Layer"]');
  lines.push(`        Router["${hasBackend ? `Backend Service Router (${backendTech})` : 'HTTP Request Router'}"]`);
  lines.push('    end');

  lines.push('    subgraph ServiceTier ["Service Logic & Controllers Layer"]');
  const serviceModuleName = keyModules.find((m) => m.name.toLowerCase().includes('service'))?.path || 'src/services';
  lines.push(`        Controller["Service Controllers & Handlers (${serviceModuleName})"]`);
  lines.push('    end');

  if (hasAi || hasDb) {
    lines.push('    subgraph DataEngineTier ["Inference Engine & Data Storage"]');
    if (hasAi) lines.push(`        InferenceEngine["AI/ML Model Inference Runtime (${aiTech})"]`);
    if (hasDb) lines.push(`        Database["Persistence Storage Layer (${dbTech})"]`);
    lines.push('    end');
  }

  if (hasInfra) {
    lines.push('    subgraph InfraTier ["Infrastructure & Sandbox"]');
    lines.push(`        Container["Docker Container Sandbox (${infraTech})"]`);
    lines.push('    end');
  }

  lines.push('    UI --> Router');
  lines.push('    Router --> Controller');
  if (hasAi) lines.push('    Controller --> InferenceEngine');
  if (hasDb) lines.push('    Controller --> Database');
  lines.push('    Controller --> UI');

  return lines.join('\n');
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
    `### Chapter 1: Core System Architecture & Service Topology\n**${repoName}** is a production-grade software engineering system implemented in ${langList}.${aiTech}${dbTech}. The core application is partitioned into decoupled service boundaries. Backend request processing is powered by ${backendTech}, managing incoming payload validation, CORS security policies, and rate-limiting middleware. ${frontendTech ? `The presentation tier is built using ${frontendTech}, utilizing reactive component hierarchies and state management.` : ''}${modulesList}`,

    `### Chapter 2: Data Pipeline, Processing & Execution Flow\nIncoming requests follow a deterministic execution lifecycle. ${endpointsList} Requests enter through designated entrypoint routes, pass through parameter validation, and execute business logic within isolated service controllers. Output data frames and JSON models are serialized cleanly back to callers with low latency overhead.`,

    `### Chapter 3: Algorithmic Design Patterns & Decoupled Controllers\nThe system enforces separation of concerns between HTTP routing handlers, business domain logic, and data layer models. Service controllers isolate side-effects, while data transformation utilities normalize payloads prior to persistence or UI rendering. Error boundaries capture runtime exceptions gracefully to maintain service availability.`,

    `### Chapter 4: Infrastructure, Reliability & Build System\n${infraTech} Environment variables are managed using isolated configuration templates. Automated linting, static analysis, and code quality checks are enforced via ${techStack.tools.concat(techStack.testing).map(t => `\`${t}\``).join(', ') || '`TypeScript` / `ESLint`'}.`,

    cleanSummary && !cleanSummary.toLowerCase().includes('create-next-app') ? `### Project Documentation & Context\n${cleanSummary}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
}

export async function runMultiPassSynthesis(evidence: ExtractedEvidence): Promise<SynthesisResult> {
  if (process.env.ENABLE_AI_LLM_SYNTHESIS !== 'false') {
    console.log(` 🤖 [Step 4/7] Invoking AI Provider Registry for multi-pass technical synthesis...`);
    try {
      const llmResult = await runLlmMultiPassSynthesis(evidence);
      console.log(` ✅ [Step 4/7] AI LLM synthesis completed successfully (${llmResult.contributions.length} contributions, ${llmResult.features.length} features, ${llmResult.challenges.length} challenges generated).`);
      return llmResult;
    } catch (err) {
      console.warn(` ⚠️ [Step 4/7] LLM synthesis failed (${(err as Error).message}). Falling back to Deep Heuristic Synthesis...`);
    }
  }

  const heuristicResult = runDeepHeuristicSynthesis(evidence);
  console.log(` ✅ [Step 4/7] Deep Heuristic Synthesis completed (${heuristicResult.contributions.length} contributions, ${heuristicResult.features.length} features, ${heuristicResult.challenges.length} challenges, ${heuristicResult.futureRoadmap.length} roadmap goals).`);
  return heuristicResult;
}

function runDeepHeuristicSynthesis(evidence: ExtractedEvidence): SynthesisResult {
  const { repoName, techStack, detectedLanguages, apiEndpoints, keyModules } = evidence;

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

  const futureRoadmap: string[] = [
    `Implement WebRTC streaming protocol for sub-100ms real-time audio/data transmission`,
    `Apply INT8 quantization to local ML models for 50% memory footprint reduction`,
    `Integrate Prometheus metrics exporter for HTTP endpoint latency and queue depth telemetry`,
    `Expand automated end-to-end testing coverage using Playwright and Vitest`,
    `Set up CI/CD GitHub Actions workflow for automated container build and deployment verification`,
  ];

  const cleanFeatures = evidence.features.map((f) => stripEmojis(f));
  const cleanContributions = contributions.map((c) => stripEmojis(c));
  const cleanChallenges = challenges.map((c) => stripEmojis(c));
  const cleanLearnings = learnings.map((l) => stripEmojis(l));
  const cleanRoadmap = futureRoadmap.map((r) => stripEmojis(r));

  return {
    architectureOverview: generateArchitectureOverview(evidence),
    userFlow: generateTechnicalUserFlow(evidence),
    codeFlow: generateTechnicalCodeFlow(evidence),
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
  const prompt = `You are a Principal Software Architect & AI Engineering Director. Synthesize exhaustive, senior-level technical portfolio metadata for repository '${evidence.repoName}':
Summary: ${safeSummary}
Languages: ${evidence.detectedLanguages.join(', ')}
Tech Stack: ${JSON.stringify(evidence.techStack)}
Endpoints: ${JSON.stringify(evidence.apiEndpoints)}
Modules: ${JSON.stringify(evidence.keyModules)}

Return strictly valid JSON with keys (DO NOT include any emojis in text):
- "shortDescription": High-impact 1-2 sentence senior-level executive summary (DO NOT include 'create-next-app' or boilerplate text).
- "architectureOverview": Detailed Markdown string explaining the multi-tier system design, layer boundaries, and state lifecycle across 4 pillars (Presentation, API Gateway, Service Logic, Persistence).
- "userFlow": Array of 5-7 technical step-by-step user interaction sequence items.
- "codeFlow": Array of 5-7 step-by-step runtime execution trace sequence items.
- "contributions": Array of 10-15 detailed, high-impact technical engineering accomplishments.
- "features": Array of 8+ core technical features.
- "challenges": Array of 5+ complex engineering trade-offs and latency/memory optimization challenges solved.
- "learnings": Array of 5+ deep architectural learnings.
- "futureRoadmap": Array of 5+ actionable, production-grade roadmap goals.`;

  const response = await AiProviderRegistry.synthesizeJson<any>(prompt);
  if (response && response.data) {
    const parsed = response.data;
    return {
      shortDescription: parsed.shortDescription ? stripEmojis(parsed.shortDescription) : undefined,
      architectureOverview: parsed.architectureOverview ? stripEmojis(parsed.architectureOverview) : undefined,
      userFlow: Array.isArray(parsed.userFlow) ? parsed.userFlow.map((s: string) => stripEmojis(s)) : undefined,
      codeFlow: Array.isArray(parsed.codeFlow) ? parsed.codeFlow.map((s: string) => stripEmojis(s)) : undefined,
      contributions: (parsed.contributions || []).map((s: string) => stripEmojis(s)),
      features: (parsed.features || []).map((s: string) => stripEmojis(s)),
      challenges: (parsed.challenges || []).map((s: string) => stripEmojis(s)),
      learnings: (parsed.learnings || []).map((s: string) => stripEmojis(s)),
      futureRoadmap: (parsed.futureRoadmap || []).map((s: string) => stripEmojis(s)),
    };
  }
  throw new Error('Failed to parse JSON from AI Provider Registry response');
}
