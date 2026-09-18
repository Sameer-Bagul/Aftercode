export interface ProjectMetadata {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  isFeatured: boolean;
  status: string;
  role: string;
  clientOrCompany?: string | null;
  duration?: string | null;
  techStackBreakdown: {
    frontend: string[];
    backend: string[];
    database: string[];
    aiMl: string[];
    infrastructure: string[];
    tools: string[];
    testing: string[];
  };
  myContributions: string[];
  architectureDiagram?: string;
  githubUrl: string;
  features: string[];
  challenges: string[];
  learnings: string[];
  apiEndpoints?: { method: string; path: string; description?: string }[];
  keyModules?: { name: string; path: string; purpose?: string }[];
  futureRoadmap: string[];
  remotionVideoScript?: RemotionScriptConfig;
  repository: {
    owner: string;
    name: string;
    url: string;
    visibility: string;
    fork: boolean;
  };
  classification: {
    type: string;
    portfolioWorthiness: string;
  };
  metadata: {
    generatedAt: string;
    lastAnalyzedAt: string;
    manuallyVerified: boolean;
  };
}

export interface RemotionScene {
  sceneNumber: number;
  name: string;
  heading: string;
  subheading: string;
  narration: string;
  durationFrames: number;
  startFrame: number;
  endFrame: number;
  bgGradient: string;
  badges: string[];
}

export interface RemotionScriptConfig {
  videoTitle: string;
  totalDurationSeconds: number;
  totalDurationFrames: number;
  fps: number;
  resolution: { width: number; height: number };
  voiceoverScript: string;
  scenes: RemotionScene[];
  remotionReactCode: string;
}

export interface ExtractedEvidence {
  repoName: string;
  readmeSummary?: string;
  detectedLanguages: string[];
  techStack: {
    frontend: string[];
    backend: string[];
    database: string[];
    aiMl: string[];
    infrastructure: string[];
    tools: string[];
    testing: string[];
  };
  apiEndpoints: { method: string; path: string; description?: string }[];
  keyModules: { name: string; path: string; purpose?: string }[];
  features: string[];
  architectureOverview?: string;
  userFlow?: string;
  codeFlow?: string;
}
