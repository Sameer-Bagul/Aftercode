import * as fs from 'fs';
import * as path from 'path';

export interface TechStackCategorized {
  frontend: string[];
  backend: string[];
  database: string[];
  aiMl: string[];
  infrastructure: string[];
  devops: string[];
  testing: string[];
  tools: string[];
  other: string[];
}

export interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
}

export interface KeyModule {
  name: string;
  path: string;
  description: string;
}

export interface ExtractedEvidence {
  repoName: string;
  detectedLanguages: string[];
  detectedManifests: string[];
  techStack: TechStackCategorized;
  features: string[];
  configs: string[];
  readmeSummary: string | null;
  architectureOverview: string | null;
  userFlow: string[];
  codeFlow: string[];
  apiEndpoints: ApiEndpoint[];
  keyModules: KeyModule[];
}

export function collectRepositoryEvidence(workspaceDir: string, repoName: string): ExtractedEvidence {
  const techStack: TechStackCategorized = {
    frontend: [],
    backend: [],
    database: [],
    aiMl: [],
    infrastructure: [],
    devops: [],
    testing: [],
    tools: [],
    other: [],
  };

  const detectedLanguages = new Set<string>();
  const detectedManifests: string[] = [];
  const features: string[] = [];
  const configs: string[] = [];
  const apiEndpoints: ApiEndpoint[] = [];
  const keyModulesMap = new Map<string, KeyModule>();
  const userFlowSteps: string[] = [];
  const codeFlowSteps: string[] = [];

  let readmeContent: string | null = null;
  let readmeSummary: string | null = null;

  if (!fs.existsSync(workspaceDir)) {
    return {
      repoName,
      detectedLanguages: [],
      detectedManifests: [],
      techStack,
      features: [],
      configs: [],
      readmeSummary: null,
      architectureOverview: null,
      userFlow: [],
      codeFlow: [],
      apiEndpoints: [],
      keyModules: [],
    };
  }

  const IGNORED_DIRS = new Set([
    '.git',
    'node_modules',
    'dist',
    'build',
    'out',
    '.next',
    '.nuxt',
    'target',
    'bin',
    'obj',
    'release',
    'debug',
    'coverage',
    '.cache',
    'vendor',
    '.venv',
    'venv',
    '__pycache__',
    '.idea',
    '.vscode',
  ]);

  const IGNORED_EXTS = new Set([
    '.exe',
    '.dll',
    '.so',
    '.dylib',
    '.bin',
    '.o',
    '.a',
    '.lib',
    '.class',
    '.jar',
    '.war',
    '.zip',
    '.tar',
    '.gz',
    '.7z',
    '.rar',
    '.iso',
    '.dmg',
    '.pkg',
    '.deb',
    '.rpm',
    '.pyc',
    '.pyo',
    '.db',
    '.sqlite',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.ico',
    '.pdf',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot',
    '.mp3',
    '.mp4',
    '.mov',
    '.avi',
  ]);

  function scan(dir: string, depth = 0) {
    if (depth > 10) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(workspaceDir, fullPath);

      if (entry.isDirectory()) {
        const lowerDir = entry.name.toLowerCase();
        if (
          [
            'src',
            'lib',
            'app',
            'components',
            'pages',
            'server',
            'routes',
            'controllers',
            'services',
            'models',
            'utils',
            'api',
            'packages',
            'core',
            'backend',
            'frontend',
            'client',
            'ui',
            'apps',
            'internal',
            'cmd',
            'pkg',
            'modules',
            'handlers',
            'middleware',
            'config',
            'hooks',
            'store',
            'types',
            'scripts',
            'tests',
            'docs',
          ].includes(lowerDir)
        ) {
          keyModulesMap.set(entry.name, {
            name: entry.name.charAt(0).toUpperCase() + entry.name.slice(1),
            path: relativePath,
            description: `Module component managing ${entry.name} source logic`,
          });
        }
        scan(fullPath, depth + 1);
      } else if (entry.isFile()) {
        const lower = entry.name.toLowerCase();
        const ext = path.extname(entry.name).toLowerCase();
        if (IGNORED_EXTS.has(ext)) continue;

        if (ext === '.ts' || ext === '.tsx') detectedLanguages.add('TypeScript');
        if (ext === '.js' || ext === '.jsx') detectedLanguages.add('JavaScript');
        if (ext === '.py') detectedLanguages.add('Python');
        if (ext === '.rs') detectedLanguages.add('Rust');
        if (ext === '.go') detectedLanguages.add('Go');
        if (ext === '.java') detectedLanguages.add('Java');

        // Package.json parsing
        if (lower === 'package.json') {
          detectedManifests.push(entry.name);
          try {
            const raw = fs.readFileSync(fullPath, 'utf-8');
            const pkg = JSON.parse(raw);
            const deps = { ...pkg.dependencies, ...pkg.devDependencies };

            if (deps['react']) techStack.frontend.push('React');
            if (deps['next']) techStack.frontend.push('Next.js');
            if (deps['vue']) techStack.frontend.push('Vue');
            if (deps['remotion'] || deps['@remotion/cli'] || deps['@remotion/player']) techStack.frontend.push('Remotion Video Engine');
            if (deps['tailwindcss']) techStack.frontend.push('TailwindCSS');
            if (deps['lucide-react']) techStack.frontend.push('Lucide Icons');
            if (deps['express']) techStack.backend.push('Express');
            if (deps['@nestjs/core']) techStack.backend.push('NestJS');
            if (deps['hono']) techStack.backend.push('Hono API');
            if (deps['trpc'] || deps['@trpc/server']) techStack.backend.push('tRPC');
            if (deps['prisma'] || deps['@prisma/client']) techStack.database.push('Prisma');
            if (deps['pg']) techStack.database.push('PostgreSQL');
            if (deps['mongoose'] || deps['mongodb']) techStack.database.push('MongoDB');
            if (deps['redis'] || deps['ioredis']) techStack.database.push('Redis');
            if (deps['drizzle-orm']) techStack.database.push('Drizzle ORM');
            if (deps['openai']) techStack.aiMl.push('OpenAI API');
            if (deps['@google/genai'] || deps['@google/generative-ai']) techStack.aiMl.push('Gemini AI');
            if (deps['onnxruntime-node'] || deps['onnxruntime-web']) techStack.aiMl.push('ONNX Runtime');
            if (deps['vitest'] || deps['jest']) techStack.testing.push('Vitest/Jest');
            if (deps['typescript']) techStack.tools.push('TypeScript');
            if (deps['zod']) techStack.tools.push('Zod Schema Validator');
            if (deps['eslint']) techStack.tools.push('ESLint');
          } catch {
            // Ignore parse errors
          }
        }

        // Python requirements parsing
        if (lower === 'requirements.txt' || lower === 'pipfile' || lower === 'pyproject.toml') {
          detectedManifests.push(entry.name);
          try {
            const content = fs.readFileSync(fullPath, 'utf-8').toLowerCase();
            if (content.includes('fastapi')) techStack.backend.push('FastAPI');
            if (content.includes('flask')) techStack.backend.push('Flask');
            if (content.includes('django')) techStack.backend.push('Django');
            if (content.includes('torch') || content.includes('pytorch')) techStack.aiMl.push('PyTorch');
            if (content.includes('onnx')) techStack.aiMl.push('ONNX');
            if (content.includes('langchain')) techStack.aiMl.push('LangChain');
            if (content.includes('sqlalchemy')) techStack.database.push('SQLAlchemy');
          } catch {
            // Ignore
          }
        }

        // Docker / IaC
        if (lower === 'dockerfile' || lower === 'docker-compose.yml') {
          configs.push(entry.name);
          techStack.infrastructure.push('Docker');
        }
        if (lower === 'vercel.json') {
          configs.push('vercel.json');
          techStack.infrastructure.push('Vercel');
        }

        // Next.js App Router API Route Scanner (app/api/**/route.ts or route.js)
        if (['route.ts', 'route.js', 'route.tsx', 'route.jsx'].includes(lower) && relativePath.includes('api')) {
          const apiDirMatch = relativePath.match(/(?:app|src\/app)\/(api\/[^\/]+(?:\/[^\/]+)*)\/(?:route\.(?:ts|js|tsx|jsx))/);
          if (apiDirMatch) {
            const routePath = '/' + apiDirMatch[1];
            try {
              const code = fs.readFileSync(fullPath, 'utf-8');
              const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
              let foundMethod = false;
              for (const method of methods) {
                if (code.includes(`export async function ${method}`) || code.includes(`export function ${method}`)) {
                  apiEndpoints.push({
                    method,
                    path: routePath,
                    description: `Next.js App Router API endpoint defined in ${relativePath}`,
                  });
                  foundMethod = true;
                }
              }
              if (!foundMethod) {
                apiEndpoints.push({
                  method: 'GET',
                  path: routePath,
                  description: `Next.js App Router API endpoint defined in ${relativePath}`,
                });
              }
            } catch {
              // Ignore
            }
          }
        }

        // Code AST / Pattern Route Scanner
        if (['.js', '.ts', '.py'].includes(ext)) {
          try {
            const code = fs.readFileSync(fullPath, 'utf-8');

            // Express / Router patterns
            const expressMatches = code.matchAll(/(app|router)\.(get|post|put|delete|patch)\(\s*['"`]([^'"`]+)['"`]/gi);
            for (const match of expressMatches) {
              apiEndpoints.push({
                method: match[2].toUpperCase(),
                path: match[3],
                description: `Endpoint defined in ${relativePath}`,
              });
            }

            // FastAPI / Flask patterns
            const pyMatches = code.matchAll(/@(app|router)\.(get|post|put|delete|patch)\(\s*['"`]([^'"`]+)['"`]/gi);
            for (const match of pyMatches) {
              apiEndpoints.push({
                method: match[2].toUpperCase(),
                path: match[3],
                description: `FastAPI/Flask endpoint in ${relativePath}`,
              });
            }

            // WebSocket pattern
            if (code.includes('WebSocket') || code.includes('ws://') || code.includes('wss://') || code.includes('socket.io')) {
              techStack.backend.push('WebSockets');
            }
          } catch {
            // Ignore file read error
          }
        }

        // README Parsing
        if (lower === 'readme.md') {
          try {
            readmeContent = fs.readFileSync(fullPath, 'utf-8');
            readmeSummary = readmeContent.substring(0, 500).replace(/\r?\n|\r/g, ' ');

            // Extract features from README section
            const featureMatches = readmeContent.match(/(?:###?|##)\s*(?:Features|Capabilities|What This Service Does)[\s\S]*?(?=(?:###?|##)\s*|\n\n\n)/i);
            if (featureMatches) {
              const bullets = featureMatches[0].match(/[-*]\s+\*\*?([^\*\n]+)\*\*?:?\s*([^\n]+)/g);
              if (bullets) {
                for (const bullet of bullets.slice(0, 8)) {
                  features.push(bullet.replace(/^[-*]\s+/, '').trim());
                }
              }
            }
          } catch {
            // Ignore read error
          }
        }
      }
    }
  }

  console.log(` 🔬 [Step 3/7] Extracting source code evidence, AST routes, package manifests, & system architecture...`);
  try {
    scan(workspaceDir);
  } catch {
    // Workspace scan handled
  }

  // Deduplicate techStack items
  for (const key of Object.keys(techStack) as (keyof TechStackCategorized)[]) {
    techStack[key] = Array.from(new Set(techStack[key]));
  }

  // Deduplicate endpoints by path + method
  const uniqueEndpoints: ApiEndpoint[] = [];
  const endpointKeys = new Set<string>();
  for (const ep of apiEndpoints) {
    const key = `${ep.method}:${ep.path}`;
    if (!endpointKeys.has(key)) {
      endpointKeys.add(key);
      uniqueEndpoints.push(ep);
    }
  }

  // Synthesize Architectural Flow Evidence
  const hasFrontend = techStack.frontend.length > 0;
  const hasBackend = techStack.backend.length > 0;
  const hasDb = techStack.database.length > 0;
  const hasAi = techStack.aiMl.length > 0;

  if (hasFrontend) userFlowSteps.push('User accesses application user interface via browser');
  if (apiEndpoints.length > 0) userFlowSteps.push('User triggers action invoking HTTP/WebSocket API endpoints');
  if (hasAi) userFlowSteps.push('Payload processed through AI/ML pipeline or local inference model');
  if (hasDb) userFlowSteps.push('Data persisted or retrieved from database storage layer');
  if (userFlowSteps.length === 0) userFlowSteps.push('User executes CLI or entrypoint script');

  codeFlowSteps.push('Client or caller initiates request to application entrypoint');
  if (hasBackend) codeFlowSteps.push('Backend router validates request parameters and applies middleware');
  if (hasAi) codeFlowSteps.push('Service layer delegates task to ML runtime or LLM API worker');
  if (hasDb) codeFlowSteps.push('Database ORM/client executes storage query');
  codeFlowSteps.push('Application serializes JSON/audio/data response back to client');

  const architectureOverview = [
    hasFrontend ? `Frontend built with ${techStack.frontend.join(', ')}.` : null,
    hasBackend ? `Backend API powered by ${techStack.backend.join(', ')}.` : null,
    hasAi ? `AI/ML capabilities powered by ${techStack.aiMl.join(', ')}.` : null,
    hasDb ? `Persistence managed by ${techStack.database.join(', ')}.` : null,
    techStack.infrastructure.length > 0 ? `Deployed using ${techStack.infrastructure.join(', ')}.` : null,
  ]
    .filter(Boolean)
    .join(' ') || `Standalone system repository for ${repoName}.`;

  console.log(` 🧬 [Step 3/7] Detected Languages (${detectedLanguages.size}): [${Array.from(detectedLanguages).join(', ')}]`);
  console.log(` 📦 [Step 3/7] Detected Manifests (${detectedManifests.length}): [${detectedManifests.join(', ')}]`);
  console.log(` 🔌 [Step 3/7] Extracted API Endpoints (${uniqueEndpoints.length}): ${uniqueEndpoints.slice(0, 5).map(e => `${e.method} ${e.path}`).join(', ')}${uniqueEndpoints.length > 5 ? ' ...' : ''}`);
  console.log(` 🧩 [Step 3/7] Discovered Key Modules (${keyModulesMap.size}): [${Array.from(keyModulesMap.keys()).join(', ')}]`);
  console.log(` 🛠️ [Step 3/7] Tech Stack Matrix: Frontend: [${techStack.frontend.join(', ')}], Backend: [${techStack.backend.join(', ')}], DB: [${techStack.database.join(', ')}], AI/ML: [${techStack.aiMl.join(', ')}]`);

  return {
    repoName,
    detectedLanguages: Array.from(detectedLanguages),
    detectedManifests,
    techStack,
    features: features.length > 0 ? features : [`Core ${repoName} functionality`],
    configs,
    readmeSummary,
    architectureOverview,
    userFlow: userFlowSteps,
    codeFlow: codeFlowSteps,
    apiEndpoints: uniqueEndpoints,
    keyModules: Array.from(keyModulesMap.values()),
  };
}
