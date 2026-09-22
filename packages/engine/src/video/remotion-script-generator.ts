import { ExtractedEvidence } from '../repository/evidence-collector.js';
import { AiProviderRegistry } from '../ai/provider-registry.js';
import { stripEmojis } from '../metadata/normalizer.js';

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
  resolution: {
    width: number;
    height: number;
  };
  voiceoverScript: string;
  scenes: RemotionScene[];
  remotionReactCode: string;
}

export function generateRemotionReactCode(repoName: string, totalDurationFrames: number, fps: number, scenes: RemotionScene[]): string {
  return `import { Composition, Sequence, useCurrentFrame } from 'remotion';
import React from 'react';

export const ProjectShowcaseVideo: React.FC = () => {
  return (
    <Composition
      id="${repoName.replace(/[^a-zA-Z0-9]/g, '')}Showcase"
      component={MainComposition}
      durationInFrames={${totalDurationFrames}}
      fps={${fps}}
      width={1920}
      height={1080}
      defaultProps={{
        title: '${repoName}',
      }}
    />
  );
};

const MainComposition: React.FC<{ title: string }> = ({ title }) => {
  const frame = useCurrentFrame();

  return (
    <div style={{ flex: 1, backgroundColor: '#090d16', color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
${scenes
  .map(
    (scene) => `      {/* Scene ${scene.sceneNumber}: ${scene.name} */}
      <Sequence from={${scene.startFrame}} durationInFrames={${scene.durationFrames}}>
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '${scene.bgGradient}' }}>
          <h1 style={{ fontSize: 72, fontWeight: 800 }}>${scene.heading}</h1>
          <p style={{ fontSize: 32, opacity: 0.9, marginTop: 16 }}>${scene.subheading}</p>
        </div>
      </Sequence>`
  )
  .join('\n\n')}
    </div>
  );
};
`;
}

export async function synthesizeAiRemotionVideoScript(
  evidence: ExtractedEvidence,
  targetDurationMinutes: number = 5
): Promise<RemotionScriptConfig> {
  if (process.env.ENABLE_AI_LLM_SYNTHESIS !== 'false') {
    try {
      console.log(` 🎬 [Video AI Hub] Synthesizing ${targetDurationMinutes}-minute long-form video script for ${evidence.repoName} using active AI Provider...`);
      const targetSeconds = targetDurationMinutes * 60;
      const prompt = `You are a Senior Technical Video Director & Masterclass Instructor. Synthesize an exhaustive ${targetDurationMinutes}-minute (${targetSeconds} seconds) long-form technical documentary script for repository '${evidence.repoName}':
Languages: ${evidence.detectedLanguages.join(', ')}
Tech Stack: ${JSON.stringify(evidence.techStack)}
Endpoints: ${JSON.stringify(evidence.apiEndpoints)}
Modules: ${JSON.stringify(evidence.keyModules)}
Features: ${JSON.stringify(evidence.features)}

Return strictly valid JSON with keys (DO NOT include emojis in text):
1. "voiceoverScript": Full continuous long-form narration script (approx 500-750 words) covering hero executive summary, multi-tier system topology, AST evidence extraction, RAG hybrid indexing, REST/WebSocket API router design, modular controller tree, database storage models, security guardrails, performance benchmarks, and deployment lifecycle.
2. "scenes": Array of 10-12 detailed scene objects with:
   - "sceneNumber": number (1 to 12)
   - "name": string (e.g. "Hero Executive Summary", "Multi-Tier System Topology", "AST Code Evidence Parsing", "Hybrid RAG Search Engine", "REST API Network Interfaces", "Modular Controller Hierarchy", "Model Engine & Storage Layer", "Security & Rate Limiting", "Performance Benchmarks", "Supertonic Audio Synthesis", "Containerized Build System", "GitHub Open Source Outro")
   - "heading": string (catchy technical headline)
   - "subheading": string (descriptive engineering subtitle)
   - "narration": string (3-5 sentences in-depth technical narration for this scene)
   - "badges": Array of 3-5 tech stack keywords`;

      const response = await AiProviderRegistry.synthesizeJson<any>(prompt);
      if (response && response.data && Array.isArray(response.data.scenes) && response.data.scenes.length >= 6) {
        const parsed = response.data;
        const fps = 30;
        const sceneCount = parsed.scenes.length;
        const perSceneSeconds = targetSeconds / sceneCount;
        const perSceneFrames = Math.round(perSceneSeconds * fps);

        let currentFrame = 0;
        const bgGradients = [
          'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
          'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
          'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
          'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
        ];

        const scenes: RemotionScene[] = parsed.scenes.map((s: any, i: number) => ({
          sceneNumber: i + 1,
          name: stripEmojis(s.name || `Scene ${i + 1}`),
          heading: stripEmojis(s.heading || evidence.repoName),
          subheading: stripEmojis(s.subheading || 'Technical Showcase'),
          narration: stripEmojis(s.narration || ''),
          durationFrames: perSceneFrames,
          startFrame: currentFrame,
          endFrame: (currentFrame += perSceneFrames),
          bgGradient: bgGradients[i % bgGradients.length],
          badges: (s.badges || []).map((b: string) => stripEmojis(b)),
        }));

        const totalDurationFrames = currentFrame;
        const totalDurationSeconds = totalDurationFrames / fps;
        const voiceoverScript = stripEmojis(parsed.voiceoverScript || scenes.map((s) => s.narration).join(' '));

        const remotionReactCode = generateRemotionReactCode(evidence.repoName, totalDurationFrames, fps, scenes);

        return {
          videoTitle: `${evidence.repoName} - ${targetDurationMinutes}-Minute Masterclass Video Showcase`,
          totalDurationSeconds,
          totalDurationFrames,
          fps,
          resolution: { width: 1920, height: 1080 },
          voiceoverScript,
          scenes,
          remotionReactCode,
        };
      }
    } catch (err) {
      console.warn(` ⚠️ [Video AI Hub] Long-form AI script synthesis fallback (${(err as Error).message}).`);
    }
  }

  return generateRemotionVideoScript(evidence, targetDurationMinutes);
}

export function generateRemotionVideoScript(evidence: ExtractedEvidence, targetDurationMinutes: number = 5): RemotionScriptConfig {
  const { repoName, techStack, detectedLanguages, apiEndpoints, keyModules, features } = evidence;

  const fps = 30;
  const langStr = detectedLanguages.join(', ') || 'TypeScript, JavaScript';
  const frontendTech = techStack.frontend.join(', ') || 'React UI';
  const backendTech = techStack.backend.join(', ') || 'Node.js Express API Router';
  const dbTech = techStack.database.join(', ') || 'PostgreSQL Storage';
  const aiTech = techStack.aiMl.join(', ') || 'Local ONNX Engine';

  const voiceoverScript = [
    `Welcome to the comprehensive ${targetDurationMinutes}-minute technical engineering deep dive into ${repoName}.`,
    `Section 1 System Topology: Engineered with ${langStr}, combining a decoupled backend powered by ${backendTech} and client interface built with ${frontendTech}.`,
    `Section 2 Static Code Analysis: AST code scanners inspect package manifests and component dependencies.`,
    `Section 3 API Network Layer: Exposing ${apiEndpoints.length || 4} REST and WebSocket routes with parameter validation schemas.`,
    `Section 4 Source Code Hierarchy: Codebase organized into isolated modules across ${keyModules.map((m) => m.name).slice(0, 4).join(', ')}.`,
    `Section 5 Intelligence & Persistence: AI inference accelerated by ${aiTech} with persistence managed by ${dbTech}.`,
    `Section 6 Performance Metrics: Optimized with 1080p rendering and -16 LUFS loudness normalization.`,
    `Section 7 Deployment & Outro: Explore the complete repository on GitHub at Sameer-Bagul slash ${repoName}.`,
  ].join(' ');

  const targetSeconds = targetDurationMinutes * 60;
  const sceneCount = targetDurationMinutes <= 0.5 ? 6 : targetDurationMinutes <= 3 ? 8 : targetDurationMinutes <= 5 ? 10 : 12;
  const perSceneFrames = Math.round((targetSeconds / sceneCount) * fps);

  let currentFrame = 0;
  const allScenes: RemotionScene[] = [
    {
      sceneNumber: 1,
      name: 'Hero & Hook Executive Summary',
      heading: repoName,
      subheading: `Production-Grade ${langStr} Engineering System`,
      narration: `Welcome to the comprehensive technical masterclass breakdown of ${repoName}, built with ${langStr}.`,
      durationFrames: perSceneFrames,
      startFrame: currentFrame,
      endFrame: (currentFrame += perSceneFrames),
      bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      badges: detectedLanguages.concat(techStack.frontend).slice(0, 4),
    },
    {
      sceneNumber: 2,
      name: 'Multi-Tier System Topology',
      heading: 'Decoupled Microservice Topology',
      subheading: `${backendTech} API • ${frontendTech} UI`,
      narration: `Decoupled multi-tier system topology isolating presentation state from backend domain controllers.`,
      durationFrames: perSceneFrames,
      startFrame: currentFrame,
      endFrame: (currentFrame += perSceneFrames),
      bgGradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
      badges: techStack.backend.concat(techStack.infrastructure).slice(0, 4),
    },
    {
      sceneNumber: 3,
      name: 'AST Code Evidence & RAG Indexing',
      heading: 'Static Code AST & RAG Search',
      subheading: 'Parsing AST trees and semantic code symbols',
      narration: `Deep static code analysis extracting verified tech stack claims and lexical search indices.`,
      durationFrames: perSceneFrames,
      startFrame: currentFrame,
      endFrame: (currentFrame += perSceneFrames),
      bgGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      badges: ['AST Evidence', 'BM25 Index', 'RAG Fusion'],
    },
    {
      sceneNumber: 4,
      name: 'REST & WebSocket API Routes',
      heading: `${apiEndpoints.length || 4} REST/WebSocket API Endpoints`,
      subheading: apiEndpoints.slice(0, 3).map((e) => `${e.method} ${e.path}`).join(' | ') || 'Request Router',
      narration: `Network routing layer exposing validated API endpoints with schema guards and rate-limiting limits.`,
      durationFrames: perSceneFrames,
      startFrame: currentFrame,
      endFrame: (currentFrame += perSceneFrames),
      bgGradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      badges: apiEndpoints.map((e) => e.method).slice(0, 4),
    },
    {
      sceneNumber: 5,
      name: 'Modular Source Code Structure',
      heading: 'Clean Controller & Service Hierarchy',
      subheading: keyModules.map((m) => m.name).slice(0, 4).join(' • ') || 'Source Tree',
      narration: `Clean code boundaries separating entrypoint routing, controllers, and data storage logic.`,
      durationFrames: perSceneFrames,
      startFrame: currentFrame,
      endFrame: (currentFrame += perSceneFrames),
      bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      badges: keyModules.map((m) => m.name).slice(0, 4),
    },
    {
      sceneNumber: 6,
      name: 'AI Engine & Persistence Layer',
      heading: 'Model Inference & Data Models',
      subheading: `${aiTech} • ${dbTech}`,
      narration: `High-performance ML model inference engine integrated with recordset persistence.`,
      durationFrames: perSceneFrames,
      startFrame: currentFrame,
      endFrame: (currentFrame += perSceneFrames),
      bgGradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      badges: techStack.aiMl.concat(techStack.database).slice(0, 4),
    },
    {
      sceneNumber: 7,
      name: 'Security & Fault Resilience',
      heading: 'CORS Guards & Rate Limiting',
      subheading: 'Schema Validation & Exception Isolation',
      narration: `Security middleware applying input sanitization schemas, CORS headers, and fallback error boundaries.`,
      durationFrames: perSceneFrames,
      startFrame: currentFrame,
      endFrame: (currentFrame += perSceneFrames),
      bgGradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      badges: ['CORS Guard', 'Input Sanitization', 'Rate Limiting'],
    },
    {
      sceneNumber: 8,
      name: 'Engineering Highlights & Benchmarks',
      heading: 'Performance & System Quality',
      subheading: features.slice(0, 2).join(' • ') || 'High Reliability Pipeline',
      narration: `Automated quality assurance checks, low latency endpoints, and clean component state management.`,
      durationFrames: perSceneFrames,
      startFrame: currentFrame,
      endFrame: (currentFrame += perSceneFrames),
      bgGradient: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
      badges: techStack.tools.concat(techStack.testing).slice(0, 4),
    },
    {
      sceneNumber: 9,
      name: 'Supertonic 3 Audio Voiceover',
      heading: 'Local Supertonic 3 ONNX Synthesis',
      subheading: '99M Parameter TTS & FFmpeg Normalization',
      narration: `Local speech narration synthesis using 99M parameter ONNX models with FFmpeg loudness normalization.`,
      durationFrames: perSceneFrames,
      startFrame: currentFrame,
      endFrame: (currentFrame += perSceneFrames),
      bgGradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
      badges: ['Supertonic 3', 'FFmpeg -16 LUFS', 'ONNX Runtime'],
    },
    {
      sceneNumber: 10,
      name: 'GitHub Outro & Community CTA',
      heading: 'Explore the Codebase',
      subheading: `github.com/Sameer-Bagul/${repoName}`,
      narration: `Explore the complete open-source codebase on GitHub! Clone, lint, and deploy in seconds.`,
      durationFrames: perSceneFrames,
      startFrame: currentFrame,
      endFrame: (currentFrame += perSceneFrames),
      bgGradient: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
      badges: ['GitHub Open-Source', 'MIT License', 'Star on GitHub'],
    },
  ];

  const scenes = allScenes.slice(0, sceneCount).map((s, idx) => ({
    ...s,
    sceneNumber: idx + 1,
    durationFrames: perSceneFrames,
    startFrame: idx * perSceneFrames,
    endFrame: (idx + 1) * perSceneFrames,
  }));

  const totalDurationFrames = sceneCount * perSceneFrames;
  const totalDurationSeconds = totalDurationFrames / fps;

  const remotionReactCode = generateRemotionReactCode(repoName, totalDurationFrames, fps, scenes);

  return {
    videoTitle: `${repoName} - ${targetDurationMinutes}-Minute Masterclass Video Showcase`,
    totalDurationSeconds,
    totalDurationFrames,
    fps,
    resolution: { width: 1920, height: 1080 },
    voiceoverScript,
    scenes,
    remotionReactCode,
  };
}
