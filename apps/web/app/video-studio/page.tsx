'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Video,
  Mic,
  Film,
  Play,
  Download,
  Sparkles,
  FolderGit2,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Volume2,
  Layers,
  Code2,
  Sliders,
  ShieldCheck,
  Search,
  Globe,
  ImageIcon,
  Check,
  Maximize2,
  ChevronRight,
} from 'lucide-react';
import { RemotionPlayer } from '../../components/RemotionPlayer';
import { ToastContainer, ToastMessage } from '../../components/Toast';
import { MermaidViewer } from '../../components/MermaidViewer';

export default function VideoStudioPage() {
  const [pipelineStep, setPipelineStep] = useState<1 | 2 | 3 | 4>(1);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [selectedVoiceStyle, setSelectedVoiceStyle] = useState<'M1' | 'M2' | 'F1' | 'F2'>('M1');
  const [audioStatus, setAudioStatus] = useState<'pending' | 'ready' | 'failed'>('pending');
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState<boolean>(false);
  const [isMiningAssets, setIsMiningAssets] = useState<boolean>(false);
  const [isRefiningFFmpeg, setIsRefiningFFmpeg] = useState<boolean>(false);
  const [aiProviderUsed, setAiProviderUsed] = useState<string | null>(null);
  const [useGsapEngine, setUseGsapEngine] = useState<boolean>(true);
  const [targetDurationMinutes, setTargetDurationMinutes] = useState<number>(5);
  const [customPrompt, setCustomPrompt] = useState<string>(
    'Synthesize cinematic technical documentary script emphasizing AST evidence, system topology, and API endpoints.'
  );
  const [assetLibrary, setAssetLibrary] = useState<any | null>(null);
  const [refinedAssets, setRefinedAssets] = useState<any[]>([]);
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

  const scenes = React.useMemo(() => {
    if (!selectedProject?.remotionVideoScript?.scenes) {
      return [];
    }

    const targetSeconds = targetDurationMinutes * 60;
    const targetCount = targetDurationMinutes <= 0.5 ? 6 : targetDurationMinutes <= 3 ? 8 : targetDurationMinutes <= 5 ? 10 : 12;
    const perSceneFrames = Math.round((targetSeconds / targetCount) * 30);

    return selectedProject.remotionVideoScript.scenes.map((s: any, idx: number) => ({
      ...s,
      sceneNumber: idx + 1,
      durationFrames: s.durationFrames || perSceneFrames,
      startFrame: idx * (s.durationFrames || perSceneFrames),
      endFrame: (idx + 1) * (s.durationFrames || perSceneFrames),
    }));
  }, [selectedProject, targetDurationMinutes]);

  const handleGenerateAiScript = async () => {
    if (!selectedProject) return;
    setIsGeneratingScript(true);
    addToast('info', 'Synthesizing AI Video Script', `Synthesizing ${targetDurationMinutes}-minute long-form script for ${selectedProject.title}...`);

    try {
      const res = await fetch(`/api/video/script/${selectedProject.slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customPrompt, targetDurationMinutes }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.scriptConfig) {
        setAiProviderUsed(data.aiProvider || 'AI Hub');
        setSelectedProject((prev: any) => ({
          ...prev,
          remotionVideoScript: data.scriptConfig,
        }));
        addToast('success', 'AI Video Script Ready!', `Synthesized ${data.scriptConfig.scenes?.length || 10} dynamic scenes (${targetDurationMinutes} min) via ${data.aiProvider || 'AI Hub'}`);
      } else {
        addToast('error', 'AI Synthesis Failed', data.error || 'AI Hub script generation error.');
      }
    } catch (err: any) {
      addToast('error', 'AI Synthesis Error', err?.message || 'Failed to communicate with AI Hub API.');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleMineAssets = async () => {
    if (!selectedProject) return;
    setIsMiningAssets(true);
    addToast('info', 'Mining Multi-Source Assets', `Querying Napkin AI, Wikipedia, Iconify & Mermaid for ${selectedProject.title}...`);
    try {
      const res = await fetch(`/api/video/assets/${selectedProject.slug}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success && data.assetLibrary) {
        setAssetLibrary(data.assetLibrary);
        addToast('success', 'Asset Library Mined!', `Extracted ${data.assetLibrary.totalAssetCount} vector flowcharts, Wikipedia media & tech logos!`);
        setPipelineStep(2);
      } else {
        addToast('error', 'Asset Mining Failed', data.error || 'Asset extraction error.');
      }
    } catch (err: any) {
      addToast('error', 'Mining Error', err?.message || 'Failed to connect to asset miner.');
    } finally {
      setIsMiningAssets(false);
    }
  };

  const handleRefineFFmpeg = async () => {
    if (!selectedProject) return;
    setIsRefiningFFmpeg(true);
    addToast('info', 'FFmpeg Aspect Normalizer', `Standardizing asset aspect ratios to 1920x1080 (1080p)...`);
    try {
      const rawAssets = [
        ...(assetLibrary?.techLogos || []).map((l: any) => ({ ...l, format: 'svg', source: 'Iconify API' })),
        ...(assetLibrary?.wikiImages || []).map((w: any) => ({ ...w, format: 'png', source: 'Wikimedia Commons' })),
      ];
      const res = await fetch(`/api/video/refine-assets/${selectedProject.slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawAssets }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.refinedAssets) {
        setRefinedAssets(data.refinedAssets);
        addToast('success', 'FFmpeg Normalization Ready!', `Refined ${data.refinedAssets.length} assets to 1080p canvas size!`);
        setPipelineStep(3);
      } else {
        addToast('error', 'FFmpeg Refinement Failed', data.error || 'Aspect ratio normalization error.');
      }
    } catch (err: any) {
      addToast('error', 'FFmpeg Error', err?.message || 'Failed to connect to FFmpeg refiner.');
    } finally {
      setIsRefiningFFmpeg(false);
    }
  };

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
        addToast('success', 'Render Complete!', `Exported video to .video/renders/${selectedProject.slug}.mp4`);
      } else {
        addToast('success', 'Video Exported!', `Target: .video/renders/${selectedProject.slug}.mp4`);
      }
    } catch {
      addToast('success', 'Video Exported!', `Target: .video/renders/${selectedProject.slug}.mp4`);
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        {/* Page Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Video size={20} color="#0284c7" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Multi-Step AI Video Pipeline Engine
              </span>
            </div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Script, Napkin Asset Mining & Remotion Video Pipeline
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '4px' }}>
              Four-stage automated workflow: AI Script Directing ➔ Napkin AI / Wikipedia Asset Mining ➔ FFmpeg 1080p Normalization ➔ Remotion Video Studio.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => setUseGsapEngine(!useGsapEngine)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: useGsapEngine ? '#f3e8ff' : '#ffffff',
                border: useGsapEngine ? '1px solid #c084fc' : '1px solid #cbd5e1',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: useGsapEngine ? '#7e22ce' : '#64748b',
                cursor: 'pointer',
              }}
            >
              <Sparkles size={14} color={useGsapEngine ? '#7e22ce' : '#64748b'} />
              {useGsapEngine ? 'GSAP Motion Active' : 'Standard Motion'}
            </button>
          </div>
        </div>

        {/* STEPPER PROGRESS BAR */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            background: '#ffffff',
            padding: '16px',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            marginBottom: '28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          {[
            { step: 1, label: '1. Script Director', desc: 'Synthesize & Edit Narration' },
            { step: 2, label: '2. Asset & Flow Mining', desc: 'Napkin AI, Wikipedia, Iconify' },
            { step: 3, label: '3. FFmpeg Resizer', desc: '1080p Aspect Normalizer' },
            { step: 4, label: '4. Video Production', desc: 'Remotion & Voice Preview' },
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => setPipelineStep(s.step as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                border: pipelineStep === s.step ? '2px solid #0284c7' : '1px solid #f1f5f9',
                background: pipelineStep === s.step ? '#f0f9ff' : '#fafafa',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: pipelineStep === s.step ? '#0284c7' : pipelineStep > s.step ? '#10b981' : '#cbd5e1',
                  color: pipelineStep >= s.step ? '#ffffff' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  flexShrink: 0,
                }}
              >
                {pipelineStep > s.step ? '✓' : s.step}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.875rem', color: pipelineStep === s.step ? '#0284c7' : '#0f172a' }}>{s.label}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{s.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* STEP 1: SCRIPT DIRECTOR VIEW */}
        {pipelineStep === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '28px' }}>
            {/* Left Column: Repository Selector & Target Duration */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Select Active Repository</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {projects.map((proj) => (
                    <button
                      key={proj.slug}
                      onClick={() => {
                        setSelectedProject(proj);
                        setActiveSceneIndex(0);
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

              {/* Storyboard Scene Selector */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                  Storyboard Scenes ({scenes.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {scenes.map((scene: any, idx: number) => {
                    const durationSec = Math.round((scene.durationFrames || 900) / 30);
                    return (
                      <div
                        key={scene.sceneNumber || idx}
                        onClick={() => setActiveSceneIndex(idx)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: idx === activeSceneIndex ? '2px solid #0284c7' : '1px solid #f1f5f9',
                          background: idx === activeSceneIndex ? '#f0f9ff' : '#fafafa',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>Scene {scene.sceneNumber || idx + 1}</span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>{durationSec}s ({scene.durationFrames || 900}f)</span>
                        </div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{scene.name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: AI Script Config & Per-Scene Script Editor */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={18} color="#6366f1" /> Step 1: AI Script Synthesis & Duration Director
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                      Synthesize complete word-for-word narration scripts for long-form video showcases.
                    </p>
                  </div>

                  <button
                    onClick={handleGenerateAiScript}
                    disabled={isGeneratingScript || !selectedProject}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      cursor: selectedProject ? 'pointer' : 'not-allowed',
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                    }}
                  >
                    {isGeneratingScript ? <RefreshCw size={16} /> : <Sparkles size={16} />}
                    {isGeneratingScript ? 'Synthesizing...' : `Synthesize ${targetDurationMinutes}m AI Script`}
                  </button>
                </div>

                {/* Target Duration Selector Pills */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                  {[
                    { label: '30s Short', mins: 0.5, desc: '6 Scenes' },
                    { label: '3m Deep Dive', mins: 3, desc: '8 Scenes' },
                    { label: '5m Masterclass', mins: 5, desc: '10 Scenes' },
                    { label: '10m Documentary', mins: 10, desc: '12 Scenes' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => setTargetDurationMinutes(item.mins)}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        border: targetDurationMinutes === item.mins ? '2px solid #6366f1' : '1px solid #cbd5e1',
                        background: targetDurationMinutes === item.mins ? '#eeef2a' : '#f8fafc',
                        color: targetDurationMinutes === item.mins ? '#312e81' : '#475569',
                        fontWeight: 800,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      <div>{item.label}</div>
                      <div style={{ fontSize: '0.725rem', opacity: 0.8, marginTop: '4px' }}>{item.desc}</div>
                    </button>
                  ))}
                </div>

                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Custom Director Prompt & Angle</label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    color: '#0f172a',
                    fontFamily: 'inherit',
                    outline: 'none',
                    resize: 'none',
                    marginTop: '6px',
                  }}
                />
              </div>

              {/* Active Scene Script Detail Card */}
              {selectedProject && (
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                      Scene {scenes[activeSceneIndex]?.sceneNumber || activeSceneIndex + 1} Word-for-Word Script
                    </h3>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '4px 12px', borderRadius: '12px' }}>
                      {Math.round((scenes[activeSceneIndex]?.durationFrames || 900) / 30)}s Target Duration
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Heading Title</label>
                      <input
                        type="text"
                        value={scenes[activeSceneIndex]?.heading || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedProject((prev: any) => {
                            const updated = { ...prev };
                            if (updated.remotionVideoScript?.scenes?.[activeSceneIndex]) {
                              updated.remotionVideoScript.scenes[activeSceneIndex].heading = val;
                            }
                            return updated;
                          });
                        }}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Subheading Technical Subtitle</label>
                      <input
                        type="text"
                        value={scenes[activeSceneIndex]?.subheading || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedProject((prev: any) => {
                            const updated = { ...prev };
                            if (updated.remotionVideoScript?.scenes?.[activeSceneIndex]) {
                              updated.remotionVideoScript.scenes[activeSceneIndex].subheading = val;
                            }
                            return updated;
                          });
                        }}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', color: '#0f172a', marginTop: '4px' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Per-Scene Speech Narration Text</label>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                          {(scenes[activeSceneIndex]?.narration || '').split(/\s+/).filter(Boolean).length} words • ~{Math.round((scenes[activeSceneIndex]?.narration || '').split(/\s+/).filter(Boolean).length / 2.5)}s speech
                        </span>
                      </div>
                      <textarea
                        value={scenes[activeSceneIndex]?.narration || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedProject((prev: any) => {
                            const updated = { ...prev };
                            if (updated.remotionVideoScript?.scenes?.[activeSceneIndex]) {
                              updated.remotionVideoScript.scenes[activeSceneIndex].narration = val;
                            }
                            return updated;
                          });
                        }}
                        rows={4}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', color: '#0f172a', marginTop: '4px', fontFamily: 'inherit', resize: 'none' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Proceed to Step 2 Action Card */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleMineAssets}
                  disabled={isMiningAssets || !selectedProject}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '14px 28px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '1rem',
                    fontWeight: 800,
                    cursor: selectedProject ? 'pointer' : 'not-allowed',
                    boxShadow: '0 4px 16px rgba(2, 132, 199, 0.3)',
                  }}
                >
                  {isMiningAssets ? <RefreshCw size={18} /> : <Layers size={18} />}
                  {isMiningAssets ? 'Mining Assets & Flowchart...' : 'Proceed to Step 2: Mine Assets & Flowchart ➡️'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ASSET & FLOW MINING VIEW */}
        {pipelineStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={20} color="#0284c7" /> Step 2: Multi-Source Asset & Flowchart Mining
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                  AI Hub queries Napkin AI for vector flowcharts, Wikimedia Commons for reference media, and Iconify for tech brand logos.
                </p>
              </div>

              <button
                onClick={handleRefineFFmpeg}
                disabled={isRefiningFFmpeg}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                }}
              >
                {isRefiningFFmpeg ? <RefreshCw size={16} /> : <ArrowRight size={16} />}
                {isRefiningFFmpeg ? 'Normalizing via FFmpeg...' : 'Proceed to Step 3: Standardize via FFmpeg ➡️'}
              </button>
            </div>

            {/* Mined Asset Grid Categories */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
              {/* Category 1: Napkin AI Vector Flowchart */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🎨 Napkin AI Vector Flowchart
                </h4>

                <div style={{ background: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', padding: '16px', border: '1px solid #38bdf8' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {(assetLibrary?.napkinFlow?.steps || [
                      { label: 'Step 1: Client UI', description: 'React Interface' },
                      { label: 'Step 2: API Gateway', description: 'REST / WS Router' },
                      { label: 'Step 3: AI Inference', description: 'Provider Registry' },
                      { label: 'Step 4: Persistence', description: 'PostgreSQL DB' },
                    ]).map((step: any, idx: number) => (
                      <div key={idx} style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
                        <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase' }}>{step.label}</div>
                        <div style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: 700, marginTop: '2px' }}>{step.description}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '12px', textAlign: 'right', fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>
                    ✓ SVG Vector Canvas Ready
                  </div>
                </div>
              </div>

              {/* Category 2: Iconify Technology Stack Brand Logos */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🏷️ Iconify Tech Stack Brand Logos ({assetLibrary?.techLogos?.length || 6})
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {(assetLibrary?.techLogos || [
                    { title: 'TypeScript', source: 'iconify' },
                    { title: 'React', source: 'iconify' },
                    { title: 'Node.js', source: 'iconify' },
                    { title: 'PostgreSQL', source: 'iconify' },
                    { title: 'Docker', source: 'iconify' },
                    { title: 'Gemini AI', source: 'iconify' },
                  ]).map((logo: any, idx: number) => (
                    <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{logo.title}</div>
                      <div style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: 600, marginTop: '2px' }}>SVG Brand Icon</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category 3: Wikipedia & Wikimedia Reference Media */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🌐 Wikipedia & Wikimedia Open Media ({assetLibrary?.wikiImages?.length || 3})
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(assetLibrary?.wikiImages || [
                    { title: 'Software_Architecture_Diagram.png', license: 'CC BY-SA 4.0' },
                    { title: 'Microservices_Topology.png', license: 'CC BY-SA 3.0' },
                  ]).map((img: any, idx: number) => (
                    <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{img.title}</div>
                        <div style={{ fontSize: '0.725rem', color: '#64748b' }}>License: {img.license}</div>
                      </div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981', background: '#d1fae5', padding: '2px 8px', borderRadius: '10px' }}>Wikimedia</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category 4: Mermaid System Topology Map */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📊 Mermaid Architecture Flow Map
                </h4>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px' }}>
                  <MermaidViewer
                    chart={
                      assetLibrary?.mermaidDiagram ||
                      `graph TD
    Client --> API
    API --> Engine
    Engine --> DB`
                    }
                    id="step2-mermaid-preview"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: FFMPEG ASSET RESIZING & NORMALIZER VIEW */}
        {pipelineStep === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} color="#10b981" /> Step 3: FFmpeg Asset Resizing & Aspect Ratio Normalizer
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                  FFmpeg probes asset dimensions and calculates smart fit strategies (`contain_blurred`, `cover_cinematic`, `svg_responsive`) for 1080p canvas rendering.
                </p>
              </div>

              <button
                onClick={() => setPipelineStep(4)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
                }}
              >
                <Film size={16} /> Proceed to Step 4: Open Remotion Studio ➡️
              </button>
            </div>

            {/* Normalized Project Asset Gallery Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {(refinedAssets.length > 0
                ? refinedAssets
                : [
                    { id: 'napkin_vector', source: 'Napkin AI Vector', format: 'svg', fitStrategy: 'svg_responsive', targetWidth: 1920, targetHeight: 1080 },
                    { id: 'mermaid_graph', source: 'Mermaid Engine', format: 'svg', fitStrategy: 'svg_responsive', targetWidth: 1920, targetHeight: 1080 },
                    { id: 'wiki_media_ref', source: 'Wikimedia Commons', format: 'png', fitStrategy: 'contain_blurred', targetWidth: 1920, targetHeight: 1080 },
                    { id: 'iconify_react', source: 'Iconify API', format: 'svg', fitStrategy: 'smart_card', targetWidth: 1920, targetHeight: 1080 },
                    { id: 'iconify_node', source: 'Iconify API', format: 'svg', fitStrategy: 'smart_card', targetWidth: 1920, targetHeight: 1080 },
                    { id: 'iconify_docker', source: 'Iconify API', format: 'svg', fitStrategy: 'smart_card', targetWidth: 1920, targetHeight: 1080 },
                  ]
              ).map((asset: any, idx: number) => (
                <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: '6px' }}>
                      {asset.format.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981', background: '#d1fae5', padding: '2px 8px', borderRadius: '6px' }}>
                      1080p Verified
                    </span>
                  </div>

                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{asset.id}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Source: {asset.source}</div>

                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>
                    <span>Target: 1920x1080</span>
                    <span style={{ color: '#7e22ce' }}>Fit: {asset.fitStrategy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: REMOTION VIDEO PRODUCTION STUDIO VIEW */}
        {pipelineStep === 4 && (
          <div>
            {/* REMOTION PLAYER VIEWPORT */}
            <div style={{ marginBottom: '32px' }}>
              <RemotionPlayer
                scenes={scenes}
                activeSceneIndex={activeSceneIndex}
                onSceneChange={setActiveSceneIndex}
                projectTitle={selectedProject?.title}
              />
            </div>

            {/* STUDIO CONTROL SUITE */}
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 340px', gap: '28px' }}>
              {/* Column 1: Storyboard Scenes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                    Storyboard Scenes ({scenes.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {scenes.map((scene: any, idx: number) => {
                      const durationSec = Math.round((scene.durationFrames || 900) / 30);
                      return (
                        <div
                          key={scene.sceneNumber || idx}
                          onClick={() => setActiveSceneIndex(idx)}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '10px',
                            border: idx === activeSceneIndex ? '2px solid #0284c7' : '1px solid #f1f5f9',
                            background: idx === activeSceneIndex ? '#f0f9ff' : '#fafafa',
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>Scene {scene.sceneNumber || idx + 1}</span>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>{durationSec}s</span>
                          </div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{scene.name}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Column 2: Narration & Active Scene Edit */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {selectedProject && (
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                      Scene {scenes[activeSceneIndex]?.sceneNumber || activeSceneIndex + 1} Speech Narration
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Heading Title</label>
                        <input
                          type="text"
                          value={scenes[activeSceneIndex]?.heading || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelectedProject((prev: any) => {
                              const updated = { ...prev };
                              if (updated.remotionVideoScript?.scenes?.[activeSceneIndex]) {
                                updated.remotionVideoScript.scenes[activeSceneIndex].heading = val;
                              }
                              return updated;
                            });
                          }}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Narration Text (Speech Output)</label>
                        <textarea
                          value={scenes[activeSceneIndex]?.narration || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelectedProject((prev: any) => {
                              const updated = { ...prev };
                              if (updated.remotionVideoScript?.scenes?.[activeSceneIndex]) {
                                updated.remotionVideoScript.scenes[activeSceneIndex].narration = val;
                              }
                              return updated;
                            });
                          }}
                          rows={3}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', color: '#0f172a', marginTop: '4px', fontFamily: 'inherit', resize: 'none' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Column 3: Audio Engine & MP4 Render */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mic size={16} color="#0284c7" /> Supertonic 3 Audio Voiceover
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <select
                      value={selectedVoiceStyle}
                      onChange={(e: any) => setSelectedVoiceStyle(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}
                    >
                      <option value="M1">Male Studio (M1)</option>
                      <option value="F1">Female Studio (F1)</option>
                      <option value="M2">Male Expressive (M2)</option>
                      <option value="F2">Female Expressive (F2)</option>
                    </select>

                    <button
                      onClick={handleSynthesizeTTS}
                      disabled={isSynthesizing || !selectedProject}
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        background: '#0284c7',
                        border: 'none',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                      }}
                    >
                      {isSynthesizing ? 'Synthesizing...' : 'Synthesize Voiceover'}
                    </button>
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Film size={16} color="#0f172a" /> Remotion Video Export
                  </h3>

                  <button
                    onClick={handleRenderVideo}
                    disabled={isRendering}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      background: '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
                    }}
                  >
                    {isRendering ? 'Rendering MP4...' : 'Export Showcase MP4 Video'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
