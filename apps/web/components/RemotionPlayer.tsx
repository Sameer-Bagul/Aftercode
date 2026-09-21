'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, Sparkles, BookOpen, Layers, Terminal, Code2, Cpu, ShieldCheck, Github, Radio, CheckCircle2 } from 'lucide-react';
import { MermaidViewer } from './MermaidViewer';

export interface RemotionScene {
  sceneNumber: number;
  name: string;
  heading: string;
  subheading: string;
  narration?: string;
  durationFrames?: number;
  bgGradient?: string;
  badges?: string[];
  mermaidDiagram?: string;
}

interface RemotionPlayerProps {
  scenes: RemotionScene[];
  activeSceneIndex: number;
  onSceneChange: (index: number) => void;
  projectTitle?: string;
}

export function RemotionPlayer({
  scenes,
  activeSceneIndex,
  onSceneChange,
  projectTitle = 'Aftercode Technical Showcase'
}: RemotionPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [visualMode, setVisualMode] = useState<'napkin' | 'mermaid' | 'code'>('napkin');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const fps = 30;

  const sceneOffsets = React.useMemo(() => {
    let acc = 0;
    return scenes.map((s) => {
      const start = acc;
      const duration = s.durationFrames || 150;
      acc += duration;
      return { start, end: acc, duration };
    });
  }, [scenes]);

  const totalFrames = sceneOffsets.length > 0 ? sceneOffsets[sceneOffsets.length - 1].end : scenes.length * 150;
  const totalSeconds = totalFrames / fps;

  const animRef = useRef<NodeJS.Timeout | null>(null);

  // Sync frame on external scene selection
  useEffect(() => {
    if (!isPlaying && sceneOffsets[activeSceneIndex]) {
      setCurrentFrame(sceneOffsets[activeSceneIndex].start);
    }
  }, [activeSceneIndex, isPlaying, sceneOffsets]);

  // Speech Narration Audio Function
  const speakNarration = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const cleanText = text.replace(/<[^>]*>/g, '').trim();
      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.volume = 1.0;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Male')));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  };

  // 30 FPS Continuous Playback Engine
  useEffect(() => {
    if (isPlaying) {
      animRef.current = setInterval(() => {
        setCurrentFrame((prev) => {
          const next = prev + 1;
          if (next >= totalFrames) {
            setIsPlaying(false);
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
              window.speechSynthesis.cancel();
            }
            onSceneChange(0);
            return 0;
          }
          const currentOffsetIdx = sceneOffsets.findIndex((off) => next >= off.start && next < off.end);
          if (currentOffsetIdx !== -1 && currentOffsetIdx !== activeSceneIndex && currentOffsetIdx < scenes.length) {
            onSceneChange(currentOffsetIdx);
          }
          return next;
        });
      }, 1000 / fps);
    } else if (animRef.current) {
      clearInterval(animRef.current);
    }
    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, [isPlaying, totalFrames, activeSceneIndex, scenes.length, onSceneChange, sceneOffsets]);

  // Synchronized Voiceover Speech when scene changes during playback
  useEffect(() => {
    if (isPlaying && !isMuted) {
      const currentNarration = scenes[activeSceneIndex]?.narration;
      if (currentNarration) {
        speakNarration(currentNarration);
      }
    }
  }, [activeSceneIndex, isPlaying, isMuted, scenes]);

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } else {
      setIsPlaying(true);
      if (!isMuted && scenes[activeSceneIndex]?.narration) {
        speakNarration(scenes[activeSceneIndex].narration!);
      }
    }
  };

  const handleTestVoice = () => {
    const text = scenes[activeSceneIndex]?.narration || `Welcome to the technical breakdown of ${projectTitle}.`;
    speakNarration(text);
  };

  const handleNext = () => {
    const nextIdx = activeSceneIndex < scenes.length - 1 ? activeSceneIndex + 1 : 0;
    if (sceneOffsets[nextIdx]) {
      setCurrentFrame(sceneOffsets[nextIdx].start);
    }
    onSceneChange(nextIdx);
  };

  const handlePrev = () => {
    const prevIdx = activeSceneIndex > 0 ? activeSceneIndex - 1 : 0;
    if (sceneOffsets[prevIdx]) {
      setCurrentFrame(sceneOffsets[prevIdx].start);
    }
    onSceneChange(prevIdx);
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const frame = parseInt(e.target.value, 10);
    setCurrentFrame(frame);
    const sceneIdx = sceneOffsets.findIndex((off) => frame >= off.start && frame < off.end);
    if (sceneIdx !== -1) {
      onSceneChange(sceneIdx);
    }
  };

  const currentScene = scenes[activeSceneIndex] || scenes[0];
  if (!currentScene) return null;

  // GSAP Entrance Motion Math
  const activeOffset = sceneOffsets[activeSceneIndex] || { start: 0, duration: 150 };
  const sceneFrame = currentFrame - activeOffset.start;
  const progress = Math.min(1, Math.max(0, sceneFrame / 22)); // 22 frames entrance ease
  const gsapScale = 0.94 + 0.06 * Math.sin(progress * (Math.PI / 2));
  const gsapOpacity = Math.min(1, progress * 1.5);
  const gsapTranslateY = (1 - progress) * 24;

  const currentSeconds = (currentFrame / fps).toFixed(1);
  const formattedTime = `${Math.floor(Number(currentSeconds) / 60)
    .toString()
    .padStart(2, '0')}:${(Math.floor(Number(currentSeconds)) % 60).toString().padStart(2, '0')}`;
  const formattedTotal = `${Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0')}:${(Math.floor(totalSeconds) % 60).toString().padStart(2, '0')}`;

  const currentSceneNum = currentScene.sceneNumber || activeSceneIndex + 1;

  const sampleMermaidChart = currentScene.mermaidDiagram || `graph TD
    subgraph ClientTier ["Presentation Layer"]
      UI["React / Next.js Client Interface"]
    end
    subgraph APITier ["API Gateway Layer"]
      Router["Node.js Express / FastAPI Router"]
    end
    subgraph EngineTier ["AI Inference & Logic"]
      Engine["Groq / Gemini AI Provider Registry"]
    end
    subgraph StorageTier ["Persistence Layer"]
      DB["PostgreSQL / Model Storage"]
    end
    UI --> Router
    Router --> Engine
    Engine --> DB`;

  return (
    <div style={{ background: '#090d16', borderRadius: '16px', overflow: 'hidden', border: '1px solid #1e293b', boxShadow: '0 25px 40px -10px rgba(0, 0, 0, 0.5)' }}>
      {/* Top Header Bar */}
      <div style={{ padding: '12px 20px', background: '#0f172a', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></div>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></div>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'monospace', marginLeft: '6px' }}>
            remotion-studio // {projectTitle} • 1080p @ 30 FPS
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={handleTestVoice}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Volume2 size={13} /> {isSpeaking ? '🔊 Speaking Voice...' : '🔊 Speak Voiceover Out Loud'}
          </button>

          <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={13} /> AST Code Verified
          </span>
          <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px', background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc', border: '1px solid rgba(192, 132, 252, 0.3)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={13} /> GSAP Motion
          </span>
        </div>
      </div>

      {/* Main Video Viewport Stage */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          background: currentScene.bgGradient || 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px',
          color: '#ffffff',
          transition: 'background 0.5s ease',
          userSelect: 'none',
          overflow: 'hidden',
        }}
      >
        {/* Upper Left: Active Scene & Name Marker */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            padding: '6px 14px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#38bdf8',
            zIndex: 10,
          }}
        >
          <span>SCENE {currentSceneNum} OF {scenes.length}</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>•</span>
          <span style={{ color: '#ffffff' }}>{currentScene.name}</span>
        </div>

        {/* Upper Right: Visual Diagram Mode Switcher Tabs */}
        <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '6px', zIndex: 10 }}>
          <button
            onClick={() => setVisualMode('napkin')}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              border: visualMode === 'napkin' ? '1px solid #34d399' : '1px solid rgba(255, 255, 255, 0.2)',
              background: visualMode === 'napkin' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(15, 23, 42, 0.75)',
              color: visualMode === 'napkin' ? '#34d399' : '#94a3b8',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Layers size={13} /> Napkin AI Flowchart
          </button>

          <button
            onClick={() => setVisualMode('mermaid')}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              border: visualMode === 'mermaid' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.2)',
              background: visualMode === 'mermaid' ? 'rgba(2, 132, 199, 0.25)' : 'rgba(15, 23, 42, 0.75)',
              color: visualMode === 'mermaid' ? '#38bdf8' : '#94a3b8',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Sparkles size={13} /> Mermaid Graph
          </button>

          <button
            onClick={() => setVisualMode('code')}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              border: visualMode === 'code' ? '1px solid #c084fc' : '1px solid rgba(255, 255, 255, 0.2)',
              background: visualMode === 'code' ? 'rgba(192, 132, 252, 0.25)' : 'rgba(15, 23, 42, 0.75)',
              color: visualMode === 'code' ? '#c084fc' : '#94a3b8',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Code2 size={13} /> Code Syntax
          </button>
        </div>

        {/* Dynamic Scene Content Container */}
        <div
          style={{
            width: '100%',
            maxWidth: '1000px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: gsapOpacity,
            transform: `translateY(${gsapTranslateY}px) scale(${gsapScale})`,
            transition: 'transform 0.05s linear, opacity 0.05s linear',
            zIndex: 5,
          }}
        >
          {/* SCENE 1: HERO & HOOK */}
          {currentSceneNum === 1 && (
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '20px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', marginBottom: '16px' }}>
                🚀 Production Software Engineering System Showcase
              </div>
              <h1 style={{ fontSize: '3.25rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '16px', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                {currentScene.heading}
              </h1>
              <p style={{ fontSize: '1.25rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500, maxWidth: '750px', margin: '0 auto 28px', lineHeight: 1.5 }}>
                {currentScene.subheading}
              </p>

              {/* Large Color-Coded Brand Badges */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {['TypeScript', 'React Flow', 'Node.js Express', 'Google Gemini', 'Docker Container', 'FFmpeg'].map((tech, i) => (
                  <span key={i} style={{ padding: '8px 18px', borderRadius: '12px', background: i % 2 === 0 ? 'rgba(56, 189, 248, 0.2)' : 'rgba(52, 211, 153, 0.2)', border: '1px solid rgba(255, 255, 255, 0.3)', fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* SCENE 2: SYSTEM ARCHITECTURE & TOPOLOGY (Napkin AI SVG or Mermaid Visual Graph) */}
          {currentSceneNum === 2 && (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }}>{currentScene.heading}</h2>
              <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.85)', marginBottom: '18px' }}>{currentScene.subheading}</p>

              {visualMode === 'mermaid' ? (
                <div style={{ background: '#ffffff', borderRadius: '16px', padding: '16px', boxShadow: '0 12px 30px rgba(0,0,0,0.4)', maxWidth: '900px', margin: '0 auto' }}>
                  <MermaidViewer chart={sampleMermaidChart} id={`scene2-mermaid-${activeSceneIndex}`} />
                </div>
              ) : (
                <div style={{ background: 'rgba(15, 23, 42, 0.92)', border: '1px solid rgba(56, 189, 248, 0.5)', borderRadius: '16px', padding: '24px', boxShadow: '0 12px 30px rgba(0,0,0,0.4)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', alignItems: 'center' }}>
                    <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', padding: '18px 14px', borderRadius: '14px', textAlign: 'center', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.9, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '6px' }}>Step 1</span>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '6px 0 2px 0' }}>Client Interface</h4>
                      <p style={{ fontSize: '0.78rem', margin: 0, opacity: 0.9 }}>React / Web App UI</p>
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '18px 14px', borderRadius: '14px', textAlign: 'center', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.9, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '6px' }}>Step 2</span>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '6px 0 2px 0' }}>API Gateway</h4>
                      <p style={{ fontSize: '0.78rem', margin: 0, opacity: 0.9 }}>REST / WebSockets</p>
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', padding: '18px 14px', borderRadius: '14px', textAlign: 'center', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.9, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '6px' }}>Step 3</span>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '6px 0 2px 0' }}>AI & Business Logic</h4>
                      <p style={{ fontSize: '0.78rem', margin: 0, opacity: 0.9 }}>Controllers & RAG</p>
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', padding: '18px 14px', borderRadius: '14px', textAlign: 'center', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.9, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '6px' }}>Step 4</span>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '6px 0 2px 0' }}>Persistence Layer</h4>
                      <p style={{ fontSize: '0.78rem', margin: 0, opacity: 0.9 }}>SQL / Model Storage</p>
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
                    <span>🎨 Napkin AI Vector Flowchart Canvas</span>
                    <span style={{ color: '#34d399', fontWeight: 800 }}>Decoupled Microservice Topology</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SCENE 3: API ROUTES & CODE EDITOR PREVIEW */}
          {currentSceneNum === 3 && (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }}>{currentScene.heading}</h2>
              <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.85)', marginBottom: '16px' }}>{currentScene.subheading}</p>

              {/* IDE Code Window Preview */}
              <div style={{ width: '100%', maxWidth: '780px', margin: '0 auto', background: '#0f172a', border: '1px solid #334155', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0,0,0,0.6)', textAlign: 'left' }}>
                <div style={{ background: '#1e293b', padding: '10px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></div>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></div>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#94a3b8' }}>src/api/routes.ts</span>
                </div>
                <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: 1.6, color: '#f8fafc' }}>
                  <div><span style={{ color: '#c084fc' }}>export async function</span> <span style={{ color: '#38bdf8' }}>POST</span>(req: Request) &#123;</div>
                  <div style={{ paddingLeft: '24px' }}><span style={{ color: '#c084fc' }}>const</span> body = <span style={{ color: '#c084fc' }}>await</span> req.<span style={{ color: '#38bdf8' }}>json</span>();</div>
                  <div style={{ paddingLeft: '24px' }}><span style={{ color: '#c084fc' }}>const</span> response = <span style={{ color: '#c084fc' }}>await</span> AiProviderRegistry.<span style={{ color: '#34d399' }}>synthesizeJson</span>(body);</div>
                  <div style={{ paddingLeft: '24px' }}><span style={{ color: '#c084fc' }}>return</span> NextResponse.<span style={{ color: '#38bdf8' }}>json</span>(&#123; success: <span style={{ color: '#f59e0b' }}>true</span>, data: response.data &#125;);</div>
                  <div>&#125;</div>
                </div>
              </div>
            </div>
          )}

          {/* SCENE 4: MODULAR CODE STRUCTURE & AST DIRECTORY TREE */}
          {currentSceneNum === 4 && (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }}>{currentScene.heading}</h2>
              <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.85)', marginBottom: '20px' }}>{currentScene.subheading}</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', width: '100%' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(139, 92, 246, 0.5)', padding: '20px', borderRadius: '14px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc', fontWeight: 800, fontSize: '0.95rem', marginBottom: '8px' }}>
                    <Code2 size={18} /> Controllers Module
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>Request parsing, schema verification & CORS headers.</p>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(56, 189, 248, 0.5)', padding: '20px', borderRadius: '14px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 800, fontSize: '0.95rem', marginBottom: '8px' }}>
                    <Cpu size={18} /> Domain Engine
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>Task execution queues, ML workers & RAG search.</p>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(52, 211, 153, 0.5)', padding: '20px', borderRadius: '14px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: 800, fontSize: '0.95rem', marginBottom: '8px' }}>
                    <Terminal size={18} /> Persistence Models
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>ORM schemas, database storage & cache layers.</p>
                </div>
              </div>
            </div>
          )}

          {/* SCENE 5: ENGINEERING HIGHLIGHTS & METRICS */}
          {currentSceneNum === 5 && (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }}>{currentScene.heading}</h2>
              <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.85)', marginBottom: '20px' }}>{currentScene.subheading}</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', width: '100%' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid #38bdf8', padding: '18px', borderRadius: '14px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#38bdf8' }}>99M</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, marginTop: '2px' }}>Supertonic 3 ONNX</div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid #34d399', padding: '18px', borderRadius: '14px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#34d399' }}>1080p</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, marginTop: '2px' }}>30 FPS Remotion</div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid #c084fc', padding: '18px', borderRadius: '14px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#c084fc' }}>-16 LUFS</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, marginTop: '2px' }}>FFmpeg Loudnorm</div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid #fbbf24', padding: '18px', borderRadius: '14px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fbbf24' }}>100%</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, marginTop: '2px' }}>AST Verified</div>
                </div>
              </div>
            </div>
          )}

          {/* SCENE 6 OUTRO OR GENERIC LAST SCENE */}
          {currentSceneNum === scenes.length && (
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', borderRadius: '20px', background: 'rgba(255, 255, 255, 0.12)', border: '1px solid rgba(255, 255, 255, 0.3)', fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px' }}>
                <Github size={20} /> Open Source GitHub Repository
              </div>
              <h2 style={{ fontSize: '2.75rem', fontWeight: 900, marginBottom: '8px' }}>{currentScene.heading}</h2>
              <p style={{ fontSize: '1.15rem', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '24px' }}>{currentScene.subheading}</p>

              <div style={{ display: 'inline-block', background: '#0f172a', border: '1px solid #38bdf8', padding: '12px 28px', borderRadius: '12px', fontFamily: 'monospace', fontSize: '1rem', color: '#38bdf8', boxShadow: '0 8px 20px rgba(0,0,0,0.4)' }}>
                git clone https://github.com/Sameer-Bagul/{projectTitle.toLowerCase().replace(/ /g, '-')}
              </div>
            </div>
          )}

          {/* DYNAMIC SCENES FOR LONG-FORM MASTERCLASS (SCENES 6 TO N-1) */}
          {currentSceneNum >= 6 && currentSceneNum < scenes.length && (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '20px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', marginBottom: '14px' }}>
                Scene {currentSceneNum}: {currentScene.name}
              </div>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '8px' }}>{currentScene.heading}</h2>
              <p style={{ fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.85)', marginBottom: '20px', maxWidth: '750px', margin: '0 auto 20px' }}>{currentScene.subheading}</p>

              <div style={{ width: '100%', maxWidth: '780px', margin: '0 auto', background: '#0f172a', border: '1px solid #334155', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0,0,0,0.6)', textAlign: 'left' }}>
                <div style={{ background: '#1e293b', padding: '10px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></div>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></div>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#94a3b8' }}>module-{currentSceneNum}.ts</span>
                </div>
                <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: 1.6, color: '#f8fafc' }}>
                  <div><span style={{ color: '#c084fc' }}>// Scene {currentSceneNum} Narration & Engineering Asset</span></div>
                  <div><span style={{ color: '#34d399' }}>const</span> sceneConfig = &#123;</div>
                  <div style={{ paddingLeft: '24px' }}>name: <span style={{ color: '#f59e0b' }}>&quot;{currentScene.name}&quot;</span>,</div>
                  <div style={{ paddingLeft: '24px' }}>badges: [{currentScene.badges?.map((b) => `"${b}"`).join(', ') || '"AST Verified"'}],</div>
                  <div style={{ paddingLeft: '24px' }}>duration: <span style={{ color: '#38bdf8' }}>{Math.round((currentScene.durationFrames || 900) / 30)}s</span>,</div>
                  <div>&#125;;</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Big Play Overlay Button when paused */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              border: '3px solid rgba(255, 255, 255, 0.6)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 0 40px rgba(2, 132, 199, 0.7)',
              zIndex: 20,
              transition: 'transform 0.2s ease',
            }}
          >
            <Play size={40} style={{ marginLeft: '4px' }} />
          </button>
        )}

        {/* Audio Waveform Indicator & Subtitle Bar */}
        {currentScene.narration && (
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              right: '20px',
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(14px)',
              padding: '12px 20px',
              borderRadius: '12px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              zIndex: 10,
            }}
          >
            <Radio size={20} color={isSpeaking ? '#34d399' : '#0284c7'} style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '0.9rem', color: '#f8fafc', margin: 0, fontWeight: 500, lineHeight: 1.4 }}>
              &quot;{currentScene.narration}&quot;
            </p>
          </div>
        )}
      </div>

      {/* Video Studio Control Bar */}
      <div style={{ padding: '16px 24px', background: '#0f172a', borderTop: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handlePrev}
            disabled={activeSceneIndex === 0}
            style={{
              background: 'none',
              border: 'none',
              color: activeSceneIndex === 0 ? '#475569' : '#cbd5e1',
              cursor: activeSceneIndex === 0 ? 'not-allowed' : 'pointer',
              padding: '4px',
            }}
          >
            <SkipBack size={20} />
          </button>

          <button
            onClick={togglePlay}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              border: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)',
            }}
          >
            {isPlaying ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: '2px' }} />}
          </button>

          <button
            onClick={handleNext}
            disabled={activeSceneIndex === scenes.length - 1}
            style={{
              background: 'none',
              border: 'none',
              color: activeSceneIndex === scenes.length - 1 ? '#475569' : '#cbd5e1',
              cursor: activeSceneIndex === scenes.length - 1 ? 'not-allowed' : 'pointer',
              padding: '4px',
            }}
          >
            <SkipForward size={20} />
          </button>

          <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, marginLeft: '8px', minWidth: '95px' }}>
            {formattedTime} / {formattedTotal}
          </span>
        </div>

        {/* Range Scrubber Bar */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <input
            type="range"
            min={0}
            max={totalFrames - 1}
            value={currentFrame}
            onChange={handleScrubberChange}
            style={{
              width: '100%',
              accentColor: '#0284c7',
              cursor: 'pointer',
              height: '6px',
            }}
          />
          <div style={{ display: 'flex', gap: '4px' }}>
            {scenes.map((s, idx) => {
              const durationRatio = (sceneOffsets[idx]?.duration || 150) / totalFrames;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (sceneOffsets[idx]) {
                      setCurrentFrame(sceneOffsets[idx].start);
                      onSceneChange(idx);
                    }
                  }}
                  style={{
                    flex: durationRatio,
                    height: '4px',
                    borderRadius: '2px',
                    background: idx === activeSceneIndex ? '#0284c7' : idx < activeSceneIndex ? '#0369a1' : '#334155',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  title={`Scene ${s.sceneNumber}: ${s.name} (${Math.round((s.durationFrames || 150) / 30)}s)`}
                />
              );
            })}
          </div>
        </div>

        {/* Audio Mute & Fullscreen Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setIsMuted(!isMuted)}
            style={{ background: 'none', border: 'none', color: isMuted ? '#ef4444' : '#cbd5e1', cursor: 'pointer', padding: '4px' }}
            title={isMuted ? 'Unmute Voiceover Audio' : 'Mute Voiceover Audio'}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          <Maximize2 size={18} color="#94a3b8" style={{ cursor: 'pointer' }} />
        </div>
      </div>
    </div>
  );
}
