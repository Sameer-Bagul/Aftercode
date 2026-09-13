import { ExtractedEvidence } from '../repository/evidence-collector.js';
import { stripEmojis } from './normalizer.js';

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
    const epList = apiEndpoints.slice(0, 3).map((e) => `${e.method} ${e.path}`).join(' | ');
    lines.push(`    UI -->|HTTP Requests (${epList})| Router`);
  } else {
    lines.push('    UI -->|HTTP / REST API Payload| Router');
  }

  if (techStack.backend.includes('WebSockets')) {
    lines.push('    UI -->|WebSocket Connection (WS)| WSStream');
    lines.push('    WSStream -->|Chunked Audio Buffer| Controller');
  }

  lines.push('    Router -->|Validate & Dispatch| Controller');

  if (hasAi) {
    lines.push('    Controller -->|Tensor Inputs & Config| InferenceEngine');
    lines.push('    InferenceEngine -->|Synthesized Data / Audio Chunks| Controller');
  }

  if (hasDb) {
    lines.push('    Controller -->|ORM Queries & CRUD| Database');
    lines.push('    Database -->|Recordsets & State| Controller');
  }

  lines.push('    Controller -->|JSON Response / Stream Output| UI');

  if (hasInfra) {
    lines.push('    Container -.->|Encloses & Isolates| Router');
    lines.push('    Container -.->|Encloses & Isolates| Controller');
  }

  return lines.join('\n');
}

export function generateExhaustiveTechnicalDescription(evidence: ExtractedEvidence): string {
  const { repoName, techStack, detectedLanguages, apiEndpoints, keyModules, readmeSummary } = evidence;

  const cleanSummary = stripEmojis(readmeSummary || '').replace(/^#+\s*/g, '');

  const langList = detectedLanguages.join(', ') || 'TypeScript/JavaScript';
  const frontendTech = techStack.frontend.join(', ') || 'standard web technologies';
  const backendTech = techStack.backend.join(', ') || 'Node.js/Express service architecture';
  const aiTech = techStack.aiMl.length > 0 ? ` featuring local AI/ML acceleration via ${techStack.aiMl.join(', ')}` : '';
  const dbTech = techStack.database.length > 0 ? ` and structured persistence powered by ${techStack.database.join(', ')}` : '';
  const infraTech = techStack.infrastructure.length > 0 ? ` Deployment is containerized and orchestrated through ${techStack.infrastructure.join(', ')}.` : '';

  const modulesList = keyModules.length > 0
    ? ` The codebase is structured modularly across key functional boundaries including ${keyModules.map((m) => `${m.name} (${m.path})`).join(', ')}.`
    : '';

  const endpointsList = apiEndpoints.length > 0
    ? ` The network interface exposes ${apiEndpoints.length} primary REST/WebSocket routes including ${apiEndpoints.slice(0, 4).map((e) => `${e.method} ${e.path}`).join(', ')}.`
    : '';

  return [
    `${repoName} is a production-grade software engineering system implemented primarily in ${langList}.${aiTech}${dbTech}.`,
    `System Architecture & Component Topology: The core application is partitioned into clear service boundaries. Backend request processing is powered by ${backendTech}, managing incoming payload validation, CORS policies, and rate-limiting middleware. ${frontendTech ? `The user presentation layer is built using ${frontendTech}, utilizing reactive component hierarchies and state management.` : ''}${modulesList}`,
    `Data Pipeline & Execution Lifecycle: Incoming requests follow a deterministic lifecycle. ${endpointsList} Requests enter through designated entrypoint routes, pass through authentication and parameter validation, and execute business logic within isolated service modules. Output data frames and JSON models are serialized cleanly back to callers.`,
    `Infrastructure, Reliability & Build System: ${infraTech} Environment variables are managed using isolated configuration templates. Automated linting, static analysis, and code quality checks are enforced via ${techStack.tools.concat(techStack.testing).join(', ') || 'standard tooling'}.`,
    cleanSummary ? `Project Background & Documentation: ${cleanSummary}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
}

export async function runMultiPassSynthesis(evidence: ExtractedEvidence): Promise<SynthesisResult> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  if (apiKey && process.env.ENABLE_AI_LLM_SYNTHESIS === 'true') {
    try {
      return await runLlmMultiPassSynthesis(evidence, apiKey);
    } catch {
      // Fallback to deep heuristic synthesizer if API call fails
    }
  }

  return runDeepHeuristicSynthesis(evidence);
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

async function runLlmMultiPassSynthesis(evidence: ExtractedEvidence, apiKey: string): Promise<SynthesisResult> {
  const safeSummary = truncateToTokenBudget(evidence.readmeSummary || '', 12000);
  const prompt = `Synthesize exhaustive technical portfolio metadata for repository '${evidence.repoName}':
Summary: ${safeSummary}
Languages: ${evidence.detectedLanguages.join(', ')}
Tech Stack: ${JSON.stringify(evidence.techStack)}
Endpoints: ${JSON.stringify(evidence.apiEndpoints)}

Return strictly valid JSON with keys: "contributions" (10-15 detailed bullet points), "features" (8+ bullet points), "challenges" (5+ items), "learnings" (5+ items), "futureRoadmap" (5+ items). DO NOT include any emojis in the text.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout guard

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`LLM synthesis failed HTTP ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as any;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = text.replace(/```json\s*|\s*```/g, '').match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        contributions: (parsed.contributions || []).map((s: string) => stripEmojis(s)),
        features: (parsed.features || []).map((s: string) => stripEmojis(s)),
        challenges: (parsed.challenges || []).map((s: string) => stripEmojis(s)),
        learnings: (parsed.learnings || []).map((s: string) => stripEmojis(s)),
        futureRoadmap: (parsed.futureRoadmap || []).map((s: string) => stripEmojis(s)),
      };
    }
    throw new Error('Failed to parse JSON from LLM response');
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`[AI Synthesizer Warning] LLM call failed (${(error as Error).message}). Falling back to deep heuristic synthesizer.`);
    return runDeepHeuristicSynthesis(evidence);
  }
}

