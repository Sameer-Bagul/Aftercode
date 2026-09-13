import { ExtractedEvidence } from '../repository/evidence-collector.js';

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

export function generateRemotionVideoScript(evidence: ExtractedEvidence): RemotionScriptConfig {
  const { repoName, techStack, detectedLanguages, apiEndpoints, keyModules, features } = evidence;

  const fps = 30;
  const langStr = detectedLanguages.slice(0, 3).join(', ') || 'TypeScript';
  const frontendTech = techStack.frontend.join(', ') || 'React';
  const backendTech = techStack.backend.join(', ') || 'Node.js Express';
  const dbTech = techStack.database.join(', ') || 'Database Layer';
  const aiTech = techStack.aiMl.join(', ');

  // 1. Construct Full Voiceover Script (Ideal for ElevenLabs TTS)
  const voiceoverScript = [
    `Welcome to the technical breakdown of ${repoName}, a production-grade application engineered with ${langStr}.`,
    `System Architecture & Topology: The application uses a decoupled multi-tier architecture powered by ${backendTech} on the backend and ${frontendTech} on the client.`,
    apiEndpoints.length > 0
      ? `Network Routes: The API exposes ${apiEndpoints.length} primary routes including ${apiEndpoints.slice(0, 3).map((e) => `${e.method} ${e.path}`).join(' and ')}, managing request routing and data serialization.`
      : `Modular Structure: The codebase is partitioned into isolated modules across ${keyModules.map((m) => m.name).slice(0, 4).join(', ')}.`,
    aiTech
      ? `AI Capabilities: Powered by ${aiTech}, delivering real-time inference and intelligent processing.`
      : `Persistence Layer: Data persistence and query execution are managed by ${dbTech}.`,
    `Performance & Quality: Automated quality checks and clean component patterns ensure high reliability.`,
    `Explore the full open-source codebase on GitHub at Sameer-Bagul slash ${repoName}.`,
  ].join(' ');

  // 2. Define 6 Storyboard Scenes (Total 30s @ 30 FPS = 900 Frames)
  let currentFrame = 0;
  const scenes: RemotionScene[] = [
    {
      sceneNumber: 1,
      name: 'Hero & Hook Introduction',
      heading: repoName,
      subheading: `Production-Grade ${langStr} Application`,
      narration: `Welcome to the technical breakdown of ${repoName}, built with ${langStr}.`,
      durationFrames: 150, // 5s
      startFrame: currentFrame,
      endFrame: (currentFrame += 150),
      bgGradient: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
      badges: detectedLanguages.concat(techStack.frontend).slice(0, 4),
    },
    {
      sceneNumber: 2,
      name: 'Architecture & System Topology',
      heading: 'Multi-Tier System Topology',
      subheading: `${backendTech} API • ${frontendTech} UI`,
      narration: `Decoupled architecture combining ${backendTech} backend with ${frontendTech} client interface.`,
      durationFrames: 150, // 5s
      startFrame: currentFrame,
      endFrame: (currentFrame += 150),
      bgGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      badges: techStack.backend.concat(techStack.infrastructure).slice(0, 4),
    },
    {
      sceneNumber: 3,
      name: 'API Routes & Endpoints',
      heading: apiEndpoints.length > 0 ? `${apiEndpoints.length} REST/WS API Routes` : 'Key Functional Modules',
      subheading: apiEndpoints.slice(0, 3).map((e) => `${e.method} ${e.path}`).join(' | ') || 'Modular Architecture',
      narration: apiEndpoints.length > 0 ? `Exposing ${apiEndpoints.length} API routes with parameter validation and rate limiting.` : `Structured codebase across core functional modules.`,
      durationFrames: 150, // 5s
      startFrame: currentFrame,
      endFrame: (currentFrame += 150),
      bgGradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
      badges: apiEndpoints.map((e) => e.method).slice(0, 4),
    },
    {
      sceneNumber: 4,
      name: 'Core Code Modules',
      heading: 'Modular Source Code Structure',
      subheading: keyModules.map((m) => m.name).slice(0, 4).join(' • ') || 'Source Tree',
      narration: `Clean code boundaries separating entrypoint routing, controllers, and data storage logic.`,
      durationFrames: 150, // 5s
      startFrame: currentFrame,
      endFrame: (currentFrame += 150),
      bgGradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      badges: keyModules.map((m) => m.name).slice(0, 4),
    },
    {
      sceneNumber: 5,
      name: 'Technical Features & Stack',
      heading: 'Engineering Highlights',
      subheading: features.slice(0, 2).join(' • ') || 'Robust & Scalable System',
      narration: `High-reliability build pipelines, clean state management, and continuous quality checks.`,
      durationFrames: 150, // 5s
      startFrame: currentFrame,
      endFrame: (currentFrame += 150),
      bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      badges: techStack.tools.concat(techStack.testing).slice(0, 4),
    },
    {
      sceneNumber: 6,
      name: 'Outro & Call To Action',
      heading: 'Explore the Codebase',
      subheading: `github.com/Sameer-Bagul/${repoName}`,
      narration: `Check out the complete open-source repository on GitHub!`,
      durationFrames: 150, // 5s
      startFrame: currentFrame,
      endFrame: (currentFrame += 150),
      bgGradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      badges: ['GitHub Open-Source', 'MIT License', 'Star on GitHub'],
    },
  ];

  const totalDurationFrames = currentFrame;
  const totalDurationSeconds = totalDurationFrames / fps;

  // 3. Generate Remotion React Component Code (.tsx)
  const remotionReactCode = `import { Composition, Sequence, interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';
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
        shortDescription: '${evidence.readmeSummary?.slice(0, 100) || 'Production-Grade Application'}',
      }}
    />
  );
};

const MainComposition: React.FC<{ title: string; shortDescription: string }> = ({ title, shortDescription }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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

  return {
    videoTitle: `${repoName} - Technical Video Showcase`,
    totalDurationSeconds,
    totalDurationFrames,
    fps,
    resolution: { width: 1920, height: 1080 },
    voiceoverScript,
    scenes,
    remotionReactCode,
  };
}
