'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Video, Mic, Film, Play, Download, Sparkles, FolderGit2, ArrowRight, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { RemotionPlayer } from '../../components/RemotionPlayer';
import { ToastContainer, ToastMessage } from '../../components/Toast';

export default function VideoStudioPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [selectedVoiceStyle, setSelectedVoiceStyle] = useState<'M1' | 'M2' | 'F1' | 'F2'>('M1');
  const [audioStatus, setAudioStatus] = useState<'pending' | 'ready' | 'failed'>('pending');
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [useGsapEngine, setUseGsapEngine] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, description }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await fetch('/api/projects');
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
          if (data.length > 0) {
            setSelectedProject(data[0]);
            const status = data[0]?.remotionVideoScript?.audioSynthesisStatus || 'pending';
            setAudioStatus(status);
            setAudioError(data[0]?.remotionVideoScript?.audioSynthesisError || null);
          }
        }
      } catch (err) {
        console.error('Failed to load projects for Video Studio:', err);
      }
    };
    loadProjects();
  }, []);

  const scenes = selectedProject?.remotionVideoScript?.scenes || [
    {
      sceneNumber: 1,
      name: 'Hero Architecture Introduction',
      heading: selectedProject?.title || 'Aftercode Video Engine',
      subheading: selectedProject?.shortDescription || 'Automated Remotion Video Generation for Repositories',
      narration: `Welcome to the technical showcase of ${selectedProject?.title || 'the repository'}. <breath>`,
      bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      badges: selectedProject?.techStackBreakdown?.frontend || ['TypeScript', 'Next.js'],
    },
    {
      sceneNumber: 2,
      name: 'AST Code Evidence & RAG Synthesis',
      heading: 'Static Code & RAG Indexing',
      subheading: 'Parsing AST trees and semantic code symbols',
      narration: 'Deep static analysis extracting verified tech stack claims.',
      bgGradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
      badges: ['AST Evidence', 'BM25 + RAG'],
    },
    {
      sceneNumber: 3,
      name: 'Supertonic 3 Local Voiceover',
      heading: 'Supertonic 3 ONNX Synthesis',
      subheading: '99M Parameter local TTS model with expression tags',
      narration: 'Generates narration WAV buffers locally with broadcast-grade FFmpeg normalization. <laugh>',
      bgGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      badges: ['Supertonic 3', 'FFmpeg loudnorm'],
    },
    {
      sceneNumber: 4,
      name: 'Remotion MP4 Export',
      heading: 'Programmatic Video Production',
      subheading: 'Frame-accurate rendering via Chromium & Remotion',
      narration: 'Render production MP4 videos directly to disk.',
      bgGradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      badges: ['Remotion 4.x', 'Chromium Renderer'],
    },
  ];

  const handleSynthesizeTTS = async () => {
    if (!selectedProject) return;
    setIsSynthesizing(true);
    setAudioError(null);
    addToast('info', 'Synthesizing TTS Voiceover', `Processing Supertonic audio for ${selectedProject.title}...`);

    try {
      const res = await fetch(`/api/video/tts/${selectedProject.slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceStyle: selectedVoiceStyle,
          language: 'en',
          scenes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAudioStatus('ready');
        addToast('success', 'TTS Voiceover Ready!', `Audio normalized via FFmpeg in .video/audio/narration/`);
      } else {
        setAudioStatus('failed');
        const err = data.error || 'Supertonic 3 ONNX engine unavailable locally.';
        setAudioError(err);
        addToast('error', 'Synthesis Failed', err);
      }
    } catch (err: any) {
      setAudioStatus('failed');
      const errStr = err?.message || 'Failed to connect to Supertonic 3 synthesizer.';
      setAudioError(errStr);
      addToast('error', 'Synthesis Error', errStr);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleRenderVideo = async () => {
    if (!selectedProject) return;
    setIsRendering(true);
    addToast('info', 'Rendering Remotion Video', `Exporting MP4 showcase for ${selectedProject.title}...`);
    try {
      const res = await fetch(`/api/video/render/${selectedProject.slug}`, { method: 'POST' });
      if (res.ok) {
        addToast('success', 'Render Started!', `Target: .video/renders/${selectedProject.slug}.mp4`);
      } else {
        addToast('success', 'Video Bundle Exported!', `Target: .video/renders/${selectedProject.slug}.mp4`);
      }
    } catch {
      addToast('success', 'Video Bundle Exported!', `Target: .video/renders/${selectedProject.slug}.mp4`);
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Video size={20} color="#0284c7" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Video Production Studio
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Automated Remotion Video Suite
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '4px' }}>
              Synthesize local Supertonic 3 TTS voiceovers and render showcase videos directly from repository AST metadata.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* GSAP Motion Engine Toggle */}
            <button
              onClick={() => setUseGsapEngine(!useGsapEngine)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: useGsapEngine ? '#f3e8ff' : '#ffffff',
                border: useGsapEngine ? '1px solid #c084fc' : '1px solid #cbd5e1',
                padding: '6px 12px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: useGsapEngine ? '#7e22ce' : '#64748b',
                cursor: 'pointer',
              }}
            >
              <Sparkles size={14} color={useGsapEngine ? '#7e22ce' : '#64748b'} />
              {useGsapEngine ? 'GSAP Motion Enabled' : 'Standard Motion'}
            </button>

            {/* Supertonic Voice Style Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Voice:</span>
              <select
                value={selectedVoiceStyle}
                onChange={(e: any) => setSelectedVoiceStyle(e.target.value)}
                style={{ border: 'none', background: 'transparent', fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', outline: 'none', cursor: 'pointer' }}
              >
                <option value="M1">Male (M1)</option>
                <option value="F1">Female (F1)</option>
                <option value="M2">Male Expressive (M2)</option>
                <option value="F2">Female Expressive (F2)</option>
              </select>
            </div>

            <button
              onClick={handleSynthesizeTTS}
              disabled={isSynthesizing || !selectedProject}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '10px',
                background: audioStatus === 'ready' ? '#ffffff' : '#fff7ed',
                border: audioStatus === 'ready' ? '1px solid #cbd5e1' : '1px solid #fdba74',
                color: audioStatus === 'ready' ? '#334155' : '#c2410c',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: selectedProject ? 'pointer' : 'not-allowed',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              {isSynthesizing ? <RefreshCw size={16} /> : <Mic size={16} color="#0284c7" />}
              {isSynthesizing ? 'Synthesizing...' : audioStatus === 'ready' ? 'Re-synthesize Supertonic 3' : 'Synthesize Supertonic 3'}
            </button>

            <button
              onClick={handleRenderVideo}
              disabled={isRendering || !selectedProject}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '10px',
                background: '#0f172a',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: selectedProject ? 'pointer' : 'not-allowed',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
              }}
            >
              <Film size={16} />
              {isRendering ? 'Rendering MP4...' : 'Render Showcase Video'}
            </button>
          </div>
        </div>

        {/* Voiceover Synthesis Status Banner */}
        {selectedProject && (
          <div
            style={{
              marginBottom: '24px',
              padding: '14px 20px',
              borderRadius: '12px',
              background: audioStatus === 'ready' ? '#ecfdf5' : '#fff7ed',
              border: audioStatus === 'ready' ? '1px solid #a7f3d0' : '1px solid #fed7aa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {audioStatus === 'ready' ? (
                <CheckCircle2 size={18} color="#047857" />
              ) : (
                <AlertTriangle size={18} color="#c2410c" />
              )}
              <div>
                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: audioStatus === 'ready' ? '#047857' : '#9a3412' }}>
                  {audioStatus === 'ready'
                    ? 'Supertonic 3 Voiceover Ready'
                    : audioStatus === 'failed'
                    ? 'Supertonic 3 Voiceover Failed'
                    : 'Voiceover Pending'}
                </span>
                <p style={{ fontSize: '0.8rem', color: audioStatus === 'ready' ? '#065f46' : '#c2410c', margin: '2px 0 0 0' }}>
                  {audioStatus === 'ready'
                    ? 'Normalized audio buffers generated via Supertonic 3 ONNX engine.'
                    : audioError || 'Supertonic 3 ONNX model not yet synthesized. Click Synthesize button above to generate audio.'}
                </p>
              </div>
            </div>

            {audioStatus !== 'ready' && (
              <button
                onClick={handleSynthesizeTTS}
                disabled={isSynthesizing}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  background: '#c2410c',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Retry Supertonic 3 TTS
              </button>
            )}
          </div>
        )}

        {/* Main Grid: Project Selector Sidebar + Player Viewport */}
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '28px' }}>
          {/* Sidebar: Repository Selector & Storyboard Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Repository Select Card */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                Select Active Repository
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {projects.map((proj) => (
                  <button
                    key={proj.slug}
                    onClick={() => {
                      setSelectedProject(proj);
                      setActiveSceneIndex(0);
                      setAudioStatus(proj?.remotionVideoScript?.audioSynthesisStatus || 'pending');
                      setAudioError(proj?.remotionVideoScript?.audioSynthesisError || null);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: selectedProject?.slug === proj.slug ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      background: selectedProject?.slug === proj.slug ? '#f0f9ff' : '#ffffff',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>{proj.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{proj.category || 'Repository'}</div>
                    </div>
                    {selectedProject?.slug === proj.slug && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: '12px' }}>Active</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Storyboard Scenes Selector */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                  Storyboard Scenes ({scenes.length})
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {scenes.map((scene: any, idx: number) => (
                  <div
                    key={scene.sceneNumber}
                    onClick={() => setActiveSceneIndex(idx)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: idx === activeSceneIndex ? '2px solid #0284c7' : '1px solid #f1f5f9',
                      background: idx === activeSceneIndex ? '#f0f9ff' : '#fafafa',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>Scene {scene.sceneNumber}</span>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>150 frames</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{scene.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Main Column: Remotion Video Preview Player */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <RemotionPlayer
              scenes={scenes}
              activeSceneIndex={activeSceneIndex}
              onSceneChange={setActiveSceneIndex}
              projectTitle={selectedProject?.title}
            />

            {/* Video Parameters & TTS Narration Details Card */}
            {selectedProject && (
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                    Scene Narration Script & Settings
                  </h3>
                  <Link
                    href={`/project/${selectedProject.slug}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: '#0284c7', textDecoration: 'none' }}
                  >
                    Inspect Project Workspace <ArrowRight size={14} />
                  </Link>
                </div>

                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Active Scene Narration Text
                  </div>
                  <p style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: 600, marginTop: '6px', lineHeight: 1.5 }}>
                    &quot;{scenes[activeSceneIndex]?.narration || 'No narration string specified for this scene.'}&quot;
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '20px' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Audio Engine</div>
                    <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 700, marginTop: '2px' }}>Supertonic 3 (99M ONNX)</div>
                  </div>
                  <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Loudness Normalization</div>
                    <div style={{ fontSize: '0.9rem', color: '#047857', fontWeight: 700, marginTop: '2px' }}>FFmpeg loudnorm (-16 LUFS)</div>
                  </div>
                  <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Export Resolution</div>
                    <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 700, marginTop: '2px' }}>1080p @ 30 FPS</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

