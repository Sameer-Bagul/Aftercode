import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Download, Sparkles, Server, Code2, Copy, Check, Mic, Video } from 'lucide-react';
import { MermaidViewer } from './MermaidViewer';

interface VideoPreviewModalProps {
  project: any;
  onClose: () => void;
}

export const VideoPreviewModal: React.FC<VideoPreviewModalProps> = ({ project, onClose }) => {
  const [activeTab, setActiveTab] = useState<'video' | 'narration' | 'code'>('video');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentScene, setCurrentScene] = useState<number>(1);
  const [progress, setProgress] = useState<number>(0);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const scriptConfig = project.remotionVideoScript || {};
  const scenes = scriptConfig.scenes || [
    {
      sceneNumber: 1,
      name: 'Hero Overview',
      heading: project.title,
      subheading: project.shortDescription,
      narration: `Welcome to ${project.title}. ${project.shortDescription}`,
      bgGradient: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
      badges: (project.techStackBreakdown?.frontend || []).slice(0, 3),
    },
    {
      sceneNumber: 2,
      name: 'System Architecture',
      heading: 'Multi-Tier System Topology',
      subheading: project.architectureOverview || 'Decoupled Microservice & Router Architecture',
      narration: project.architectureOverview || 'System components communicate over structured routes.',
      bgGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      badges: (project.techStackBreakdown?.backend || []).concat(project.techStackBreakdown?.database || []).slice(0, 3),
    },
    {
      sceneNumber: 3,
      name: 'API Route Walkthrough',
      heading: `${(project.apiEndpoints || []).length} API Routes Exposed`,
      subheading: (project.apiEndpoints || []).slice(0, 2).map((e: any) => `${e.method} ${e.path}`).join(' | ') || 'REST API Interface',
      narration: `Exposing REST and WebSocket API endpoints for client data serialization.`,
      bgGradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
      badges: (project.apiEndpoints || []).map((e: any) => e.method).slice(0, 3),
    },
    {
      sceneNumber: 4,
      name: 'Outro & Call To Action',
      heading: 'Explore Codebase on GitHub',
      subheading: project.githubUrl || `github.com/${project.repository?.owner || 'Sameer-Bagul'}/${project.slug}`,
      narration: `Explore the complete repository source code on GitHub.`,
      bgGradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      badges: ['GitHub Repository', 'Open Source'],
    },
  ];

  const totalDurationSeconds = scriptConfig.totalDurationSeconds || 30;

  useEffect(() => {
    let interval: any = null;
    if (isPlaying && activeTab === 'video') {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          const next = prev + 100 / (totalDurationSeconds * 10);
          const sceneIndex = Math.min(Math.floor((next / 100) * scenes.length), scenes.length - 1);
          setCurrentScene(sceneIndex + 1);
          return next;
        });
      }, 100);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeTab, scenes.length, totalDurationSeconds]);

  const handleRestart = () => {
    setProgress(0);
    setCurrentScene(1);
    setIsPlaying(true);
  };

  const handleCopyScript = () => {
    const text = scriptConfig.voiceoverScript || scenes.map((s: any) => s.narration).join(' ');
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleCopyCode = () => {
    const code = scriptConfig.remotionReactCode || `// Remotion Composition Code for ${project.title}\n// Render with: npx remotion render src/index.ts ${project.slug}Showcase out/video.mp4`;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!project) return null;

  const activeSceneData = scenes[currentScene - 1] || scenes[0];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(17, 24, 39, 0.82)',
        backdropFilter: 'blur(12px)',
        zIndex: 1100,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '92vh',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Toolbar */}
        <div style={{ padding: '18px 28px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafaf9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, #ff7e5f, #ff6b6b)', padding: '10px', borderRadius: '12px', color: '#ffffff', display: 'flex' }}>
              <Video size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827' }}>Remotion Video & Script Studio</h3>
              <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Programmatic React Video Reel & Voiceover Generator for {project.title}</p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '12px', padding: '4px', gap: '4px' }}>
            <button
              onClick={() => setActiveTab('video')}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: activeTab === 'video' ? '#ffffff' : 'transparent',
                color: activeTab === 'video' ? '#e0533c' : '#6b7280',
                boxShadow: activeTab === 'video' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Video size={14} /> Video Reel
            </button>
            <button
              onClick={() => setActiveTab('narration')}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: activeTab === 'narration' ? '#ffffff' : 'transparent',
                color: activeTab === 'narration' ? '#e0533c' : '#6b7280',
                boxShadow: activeTab === 'narration' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Mic size={14} /> Voiceover Script
            </button>
            <button
              onClick={() => setActiveTab('code')}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: activeTab === 'code' ? '#ffffff' : 'transparent',
                color: activeTab === 'code' ? '#e0533c' : '#6b7280',
                boxShadow: activeTab === 'code' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Code2 size={14} /> Remotion React (.tsx)
            </button>
          </div>

          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        {/* TAB 1: VIDEO CANVAS STAGE (16:9 ASPECT RATIO) */}
        {activeTab === 'video' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: activeSceneData.bgGradient || 'linear-gradient(135deg, #090d16 0%, #111827 100%)', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'background 0.5s ease' }}>
              <div style={{ textAlign: 'center', padding: '40px', color: '#ffffff', maxWidth: '800px' }}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <span className="badge badge-primary" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                    SCENE {currentScene} OF {scenes.length} • {activeSceneData.name}
                  </span>
                  {(activeSceneData.badges || []).map((b: string) => (
                    <span key={b} className="badge badge-primary" style={{ background: 'rgba(0,0,0,0.25)', color: '#ffffff' }}>
                      {b}
                    </span>
                  ))}
                </div>

                <h1 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1, marginBottom: '16px', textShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                  {activeSceneData.heading}
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.9)', maxWidth: '650px', margin: '0 auto 24px', lineHeight: 1.5 }}>
                  {activeSceneData.subheading}
                </p>

                {/* Subtitle Teleprompter Caption Bar */}
                <div style={{ background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '14px 24px', borderRadius: '16px', color: '#fef08a', fontSize: '0.95rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                  <Mic size={16} color="#facc15" />
                  <span>"{activeSceneData.narration}"</span>
                </div>
              </div>
            </div>

            {/* Video Player Controls & Scrubber */}
            <div style={{ padding: '16px 28px', background: '#fafaf9', borderTop: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(to right, #ff7e5f, #ff6b6b)', transition: 'width 0.1s linear' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button onClick={() => setIsPlaying(!isPlaying)} className="btn-fruity-primary" style={{ padding: '8px 16px' }}>
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>
                  <button onClick={handleRestart} className="btn-fruity-secondary" style={{ padding: '8px 14px' }}>
                    <RotateCcw size={16} /> Replay
                  </button>
                  <span style={{ fontSize: '0.85rem', color: '#4b5563', fontWeight: 700 }}>
                    Scene {currentScene} / {scenes.length} ({Math.round((progress / 100) * totalDurationSeconds)}s / {totalDurationSeconds}s)
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-fruity-secondary" onClick={handleCopyScript}>
                    {copiedScript ? <Check size={16} color="#10b981" /> : <Mic size={16} />} {copiedScript ? 'Script Copied' : 'Copy TTS Script'}
                  </button>
                  <button className="btn-fruity-primary" onClick={() => alert(`To render MP4 video for ${project.title}:\n\n1. Install Remotion: npm i remotion @remotion/cli\n2. Run command: npx remotion render src/index.ts ${project.slug}Showcase out/${project.slug}.mp4`)}>
                    <Download size={16} /> Export MP4 Command
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VOICEOVER NARRATION SCRIPT (TTS READY) */}
        {activeTab === 'narration' && (
          <div style={{ padding: '28px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>Full Spoken Voiceover Narration Script</h4>
                <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>Ready for ElevenLabs, OpenAI Audio API, or Studio Voiceover Generation</p>
              </div>
              <button className="btn-fruity-primary" onClick={handleCopyScript}>
                {copiedScript ? <Check size={16} /> : <Copy size={16} />} {copiedScript ? 'Copied' : 'Copy Full Script'}
              </button>
            </div>

            {/* Continuous Text Box */}
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '20px', fontSize: '1.05rem', lineHeight: 1.7, color: '#334155', fontFamily: 'sans-serif' }}>
              {scriptConfig.voiceoverScript || scenes.map((s: any) => s.narration).join(' ')}
            </div>

            {/* Timed Scene Breakdown Table */}
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', marginTop: '10px' }}>Scene-by-Scene Timed Breakdown</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {scenes.map((scene: any) => (
                <div key={scene.sceneNumber} style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge badge-peach">
                      SCENE {scene.sceneNumber}: {scene.name}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>
                      Frames {scene.startFrame || (scene.sceneNumber - 1) * 150} - {scene.endFrame || scene.sceneNumber * 150} ({scene.durationFrames || 150}f @ 30fps)
                    </span>
                  </div>
                  <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>{scene.heading}</p>
                  <p style={{ fontSize: '0.9rem', color: '#475569', fontStyle: 'italic' }}>"{scene.narration}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: REMOTION REACT COMPOSITION CODE (.TSX) */}
        {activeTab === 'code' && (
          <div style={{ padding: '28px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>Remotion React Component Code (.tsx)</h4>
                <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>Drop directly into your Remotion React video project</p>
              </div>
              <button className="btn-fruity-primary" onClick={handleCopyCode}>
                {copiedCode ? <Check size={16} /> : <Copy size={16} />} {copiedCode ? 'Copied' : 'Copy Code'}
              </button>
            </div>

            <pre
              style={{
                background: '#0f172a',
                color: '#38bdf8',
                padding: '20px',
                borderRadius: '16px',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                overflowX: 'auto',
                lineHeight: 1.5,
              }}
            >
              {scriptConfig.remotionReactCode ||
                `// Remotion React Code for ${project.title}\nimport { Composition, Sequence } from 'remotion';\n\nexport const ${project.slug}Showcase = () => (\n  <Composition id="${project.slug}" durationInFrames={900} fps={30} width={1920} height={1080} />\n);`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
