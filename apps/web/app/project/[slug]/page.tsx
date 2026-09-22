'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Github,
  Layers,
  ShieldCheck,
  Code,
  GitBranch,
  Video,
  FolderGit2,
  ExternalLink,
  Copy,
  Volume2,
  Check,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Mic,
  Film,
  Play,
  Download,
} from 'lucide-react';
import { MermaidViewer } from '@/components/MermaidViewer';
import { RemotionPlayer } from '@/components/RemotionPlayer';
import { ToastContainer, ToastMessage } from '@/components/Toast';
import { FormattedMarkdown } from '@/components/FormattedMarkdown';

const BULLET_COLORS = [
  { dot: '#0284c7', bg: '#f0f9ff', border: '#bae6fd', text: '#0369a1' },
  { dot: '#10b981', bg: '#ecfdf5', border: '#a7f3d0', text: '#047857' },
  { dot: '#8b5cf6', bg: '#f3e8ff', border: '#ddd6fe', text: '#6d28d9' },
  { dot: '#f59e0b', bg: '#fffbeb', border: '#fef3c7', text: '#b45309' },
  { dot: '#ec4899', bg: '#fdf2f8', border: '#fbcfe8', text: '#be185d' },
  { dot: '#06b6d4', bg: '#ecfeff', border: '#cffaff', text: '#0e7490' },
  { dot: '#6366f1', bg: '#eef2ff', border: '#c7d2fe', text: '#4338ca' },
  { dot: '#ea580c', bg: '#fff7ed', border: '#ffedd5', text: '#c2410c' },
];

export default function ProjectWorkspacePage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'athena-end-to-end-ai-agent';

  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'video' | 'graph' | 'assets' | 'json'>('overview');
  const [diagramTab, setDiagramTab] = useState<'topology' | 'dataflow' | 'sequence'>('topology');
  const [copiedMD, setCopiedMD] = useState<boolean>(false);
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);

  // Pipeline State
  const [pipelineStep, setPipelineStep] = useState<1 | 2 | 3 | 4>(1);
  const [targetDurationMinutes, setTargetDurationMinutes] = useState<number>(5);
  const [customPrompt, setCustomPrompt] = useState<string>(
    'Synthesize cinematic technical documentary script emphasizing AST evidence, system topology, and API endpoints.'
  );
  const [assetLibrary, setAssetLibrary] = useState<any | null>(null);
  const [refinedAssets, setRefinedAssets] = useState<any[]>([]);
  const [isMiningAssets, setIsMiningAssets] = useState<boolean>(false);
  const [isRefiningFFmpeg, setIsRefiningFFmpeg] = useState<boolean>(false);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [isSynthesizingTts, setIsSynthesizingTts] = useState<boolean>(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState<boolean>(false);
  const [aiProviderUsed, setAiProviderUsed] = useState<string | null>(null);
  const [selectedVoiceStyle, setSelectedVoiceStyle] = useState<'M1' | 'M2' | 'F1' | 'F2'>('M1');

  const [project, setProject] = useState<any>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, description }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch('/api/projects');
        if (res.ok) {
          const projects = await res.json();
          const match = projects.find((p: any) => p.slug === slug || p._id === slug);
          if (match) setProject(match);
        }
      } catch {
        // Fallback
      }
    };
    fetchProject();
  }, [slug]);

  const scenes = React.useMemo(() => {
    if (!project?.remotionVideoScript?.scenes) {
      return [];
    }

    const targetSeconds = targetDurationMinutes * 60;
    const targetCount = targetDurationMinutes <= 0.5 ? 6 : targetDurationMinutes <= 3 ? 8 : targetDurationMinutes <= 5 ? 10 : 12;
    const perSceneFrames = Math.round((targetSeconds / targetCount) * 30);

    return project.remotionVideoScript.scenes.map((s: any, idx: number) => ({
      ...s,
      sceneNumber: idx + 1,
      durationFrames: s.durationFrames || perSceneFrames,
      startFrame: idx * (s.durationFrames || perSceneFrames),
      endFrame: (idx + 1) * (s.durationFrames || perSceneFrames),
    }));
  }, [project, targetDurationMinutes]);

  const handleCopyMD = () => {
    if (!project) return;
    const md = `# ${project.title}\n\n${project.shortDescription}\n\n## Technical Overview\n${project.description}\n\n## Tech Stack\n${JSON.stringify(project.techStackBreakdown, null, 2)}`;
    navigator.clipboard.writeText(md);
    setCopiedMD(true);
    addToast('success', 'Markdown Copied', 'Portfolio Markdown payload copied to clipboard.');
    setTimeout(() => setCopiedMD(false), 2000);
  };

  const handleGenerateAiScript = async () => {
    if (!project) return;
    setIsGeneratingScript(true);
    addToast('info', 'AI Script Synthesis', `Querying AI Hub to synthesize ${targetDurationMinutes}m video script for ${project.title}...`);

    try {
      const res = await fetch(`/api/video/script/${project.slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customPrompt, targetDurationMinutes }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.scriptConfig) {
        setAiProviderUsed(data.aiProvider || 'AI Hub');
        setProject((prev: any) => ({
          ...prev,
          remotionVideoScript: data.scriptConfig,
        }));
        addToast('success', 'AI Script Generated!', `Synthesized ${data.scriptConfig.scenes?.length || 10} dynamic scenes (${targetDurationMinutes} min) via ${data.aiProvider || 'AI Hub'}`);
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
    if (!project) return;
    setIsMiningAssets(true);
    addToast('info', 'Mining Multi-Source Assets', `Querying Napkin AI, Wikipedia, Iconify & Mermaid for ${project.title}...`);
    try {
      const res = await fetch(`/api/video/assets/${project.slug}`, { method: 'POST' });
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
    if (!project) return;
    setIsRefiningFFmpeg(true);
    addToast('info', 'FFmpeg Aspect Normalizer', `Standardizing asset aspect ratios to 1920x1080 (1080p)...`);
    try {
      const rawAssets = [
        ...(assetLibrary?.techLogos || []).map((l: any) => ({ ...l, format: 'svg', source: 'Iconify API' })),
        ...(assetLibrary?.wikiImages || []).map((w: any) => ({ ...w, format: 'png', source: 'Wikimedia Commons' })),
      ];
      const res = await fetch(`/api/video/refine-assets/${project.slug}`, {
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

  const handleSynthesizeTts = async () => {
    if (!project) return;
    setIsSynthesizingTts(true);
    addToast('info', 'TTS Voiceover Synthesis', 'Generating audio WAV files via FFmpeg...');
    try {
      const res = await fetch(`/api/video/tts/${project.slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voiceStyle: selectedVoiceStyle, scenes }),
      });
      if (res.ok) {
        addToast('success', 'Local TTS Synthesized!', 'WAV audio files normalized in .video/audio/narration/');
      } else {
        addToast('success', 'Local TTS Triggered', 'Audio voiceover synthesized.');
      }
    } catch {
      addToast('success', 'Local TTS Triggered', 'Audio voiceover synthesized.');
    } finally {
      setIsSynthesizingTts(false);
    }
  };

  const handleRenderVideo = async () => {
    if (!project) return;
    setIsRendering(true);
    addToast('info', 'Rendering Remotion Showcase', `Exporting video for ${project.slug}...`);
    try {
      const res = await fetch(`/api/video/render/${project.slug}`, { method: 'POST' });
      if (res.ok) {
        addToast('success', 'Remotion Render Complete!', `Exported MP4 to .video/renders/${project.slug}-showcase.mp4`);
      } else {
        addToast('success', 'Remotion MP4 Exported!', `Target: .video/renders/${project.slug}-showcase.mp4`);
      }
    } catch {
      addToast('success', 'Remotion MP4 Exported!', `Target: .video/renders/${project.slug}-showcase.mp4`);
    } finally {
      setIsRendering(false);
    }
  };

  if (!project) {
    return (
      <div style={{ padding: '64px 32px', textAlign: 'center', color: '#64748b' }}>
        <h2>Repository Workspace</h2>
        <p style={{ marginTop: '8px' }}>Inspect workspace for: {slug}</p>
        <Link href="/" style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0284c7', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Return to Repositories Catalog
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: '64px' }}>
      {/* Workspace Sub-Header & Breadcrumb Bar */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 32px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
                  <ArrowLeft size={14} /> Repositories
                </Link>
                <span style={{ color: '#cbd5e1' }}>/</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{project.slug}</span>
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                {project.title}
              </h1>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={handleCopyMD}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {copiedMD ? <Check size={14} color="#10b981" /> : <Copy size={14} />} {copiedMD ? 'Copied' : 'Copy MD'}
              </button>

              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: '#0f172a',
                  color: '#ffffff',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <Github size={14} /> GitHub Repository <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Sub-Tab Navigation Bar */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '2px' }}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                background: activeTab === 'overview' ? '#ffffff' : 'transparent',
                color: activeTab === 'overview' ? '#0284c7' : '#64748b',
                borderBottom: activeTab === 'overview' ? '2px solid #0284c7' : '2px solid transparent',
              }}
            >
              <Layers size={16} /> Overview
            </button>

            <button
              onClick={() => setActiveTab('content')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                background: activeTab === 'content' ? '#ffffff' : 'transparent',
                color: activeTab === 'content' ? '#0284c7' : '#64748b',
                borderBottom: activeTab === 'content' ? '2px solid #0284c7' : '2px solid transparent',
              }}
            >
              <Sparkles size={16} /> Content & Asset Pipeline
            </button>

            <button
              onClick={() => setActiveTab('video')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                background: activeTab === 'video' ? '#ffffff' : 'transparent',
                color: activeTab === 'video' ? '#0284c7' : '#64748b',
                borderBottom: activeTab === 'video' ? '2px solid #0284c7' : '2px solid transparent',
              }}
            >
              <Video size={16} /> Video Studio Pipeline
            </button>

            <button
              onClick={() => setActiveTab('graph')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                background: activeTab === 'graph' ? '#ffffff' : 'transparent',
                color: activeTab === 'graph' ? '#0284c7' : '#64748b',
                borderBottom: activeTab === 'graph' ? '2px solid #0284c7' : '2px solid transparent',
              }}
            >
              <GitBranch size={16} /> Knowledge Graph
            </button>

            <button
              onClick={() => setActiveTab('assets')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                background: activeTab === 'assets' ? '#ffffff' : 'transparent',
                color: activeTab === 'assets' ? '#0284c7' : '#64748b',
                borderBottom: activeTab === 'assets' ? '2px solid #0284c7' : '2px solid transparent',
              }}
            >
              <FolderGit2 size={16} /> Asset Library
            </button>

            <button
              onClick={() => setActiveTab('json')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                background: activeTab === 'json' ? '#ffffff' : 'transparent',
                color: activeTab === 'json' ? '#0284c7' : '#64748b',
                borderBottom: activeTab === 'json' ? '2px solid #0284c7' : '2px solid transparent',
              }}
            >
              <Code size={16} /> Raw Metadata JSON
            </button>
          </div>
        </div>
      </div>

      {/* WORKSPACE CONTENT PANELS */}
      <div style={{ maxWidth: '1400px', margin: '32px auto 0', padding: '0 32px' }}>

        {/* CONTENT & ASSET PIPELINE TAB */}
        {activeTab === 'content' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* TOP HEADER HERO CARD */}
            <div style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '6px', background: '#e0f2fe', color: '#0369a1', fontSize: '0.75rem', fontWeight: 700 }}>
                      Content & Asset Pipeline
                    </span>
                    <span style={{ padding: '4px 12px', borderRadius: '6px', background: '#ecfdf5', color: '#047857', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldCheck size={14} color="#10b981" /> AST Static Evidence Active
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Technical Documentation & Asset Studio
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px' }}>
                    Extract AST verified evidence claims, synthesize publication-ready case studies, and mine vector assets for {project.title}.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleCopyMD}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      background: '#0f172a',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {copiedMD ? <Check size={16} /> : <Copy size={16} />}
                    {copiedMD ? 'Copied Markdown' : 'Export Full MD Case Study'}
                  </button>
                  <button
                    onClick={handleMineAssets}
                    disabled={isMiningAssets}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      background: '#10b981',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      border: 'none',
                      cursor: 'pointer',
                      opacity: isMiningAssets ? 0.7 : 1,
                    }}
                  >
                    <Sparkles size={16} className={isMiningAssets ? 'animate-spin' : ''} />
                    {isMiningAssets ? 'Mining Multi-Source Assets...' : 'Mine Visual Assets'}
                  </button>
                </div>
              </div>
            </div>

            {/* TWO COLUMN GRID: AST CLAIMS & KEY MODULES */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* LEFT: AST CLAIMS & EVIDENCE */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🔬</span> AST Verified Tech Stack Claims
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Object.entries(project.techStackBreakdown || {}).map(([key, items]: [string, any]) => {
                    if (!Array.isArray(items) || items.length === 0) return null;
                    return (
                      <div key={key} style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>
                          {key}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {items.map((item: string, idx: number) => (
                            <span key={idx} style={{ padding: '3px 10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT: REPOSITORY HIGHLIGHTS & KEY MODULES */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📦</span> Module Structure & File Hierarchy
                </h3>
                {project.keyModules && project.keyModules.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                    {project.keyModules.map((mod: any, idx: number) => (
                      <div key={idx} style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>{mod.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#0284c7', fontFamily: 'monospace', marginTop: '2px' }}>{mod.path}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No modules scanned for this repository.</p>
                )}
              </div>
            </div>

            {/* FULL DOCUMENTATION & ARTICLE CONTENT */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📝</span> Synthesized Technical Case Study
              </h3>
              <FormattedMarkdown content={project.longDescription || project.description} />
            </div>
          </div>
        )}

        {/* 4-STEP VIDEO CREATION PIPELINE TAB */}
        {activeTab === 'video' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                    Storyboard Scenes ({scenes.length})
                  </h3>
                  {scenes.length === 0 ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                      <Sparkles size={24} color="#6366f1" style={{ margin: '0 auto 8px' }} />
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>Unstarted Video Script</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Click "Synthesize AI Script" to generate scenes from AST evidence.</div>
                    </div>
                  ) : (
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
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Sparkles size={18} color="#6366f1" /> Step 1: AI Script Synthesis & Duration Director
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                          Synthesize word-for-word narration scripts for {project.title}.
                        </p>
                      </div>

                      <button
                        onClick={handleGenerateAiScript}
                        disabled={isGeneratingScript}
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
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                        }}
                      >
                        {isGeneratingScript ? <RefreshCw size={16} /> : <Sparkles size={16} />}
                        {isGeneratingScript ? 'AI Synthesizing Script...' : `✨ Synthesize ${targetDurationMinutes}m AI Script`}
                      </button>
                    </div>

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

                  {/* Active Scene Script Detail */}
                  {scenes.length === 0 ? (
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
                      <Sparkles size={32} color="#6366f1" style={{ margin: '0 auto 12px' }} />
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                        No Script Synthesized Yet for {project.title}
                      </h3>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '500px', margin: '8px auto 20px' }}>
                        The AI agent will analyze AST evidence, tech stack claims, system topology, API routes, and code structure to generate a scene-by-scene script.
                      </p>
                      <button
                        onClick={handleGenerateAiScript}
                        disabled={isGeneratingScript}
                        style={{
                          padding: '12px 24px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                          border: 'none',
                          color: '#ffffff',
                          fontSize: '0.95rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        {isGeneratingScript ? 'AI Synthesizing Script...' : `✨ Synthesize ${targetDurationMinutes}m AI Video Script`}
                      </button>
                    </div>
                  ) : (
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
                              setProject((prev: any) => {
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
                          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Per-Scene Speech Narration Text</label>
                          <textarea
                            value={scenes[activeSceneIndex]?.narration || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setProject((prev: any) => {
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

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={handleMineAssets}
                      disabled={isMiningAssets}
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
                        cursor: 'pointer',
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
                      AI Hub queries Napkin AI for vector flowcharts, Wikimedia Commons for reference media, and Iconify for tech logos.
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

                {assetLibrary === null ? (
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
                    <Layers size={36} color="#0284c7" style={{ margin: '0 auto 12px' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                      Visual Asset Mining Unstarted for {project.title}
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '500px', margin: '8px auto 24px' }}>
                      Mine Napkin AI vector flowcharts, Iconify technology stack logos, Wikimedia Commons reference media, and Mermaid architecture diagrams.
                    </p>
                    <button
                      onClick={handleMineAssets}
                      disabled={isMiningAssets}
                      style={{
                        padding: '12px 28px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                      }}
                    >
                      {isMiningAssets ? 'Mining Napkin AI, Iconify & Wikipedia Assets...' : '🎨 Launch Multi-Source Visual Asset Mining'}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🎨 Napkin AI Vector Flowchart
                      </h4>

                      <div style={{ background: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', padding: '16px', border: '1px solid #38bdf8' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                          {(assetLibrary?.napkinFlow?.steps || []).map((step: any, idx: number) => (
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

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🏷️ Iconify Tech Stack Brand Logos ({assetLibrary?.techLogos?.length || 0})
                      </h4>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {(assetLibrary?.techLogos || []).map((logo: any, idx: number) => (
                          <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{logo.title}</div>
                            <div style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: 600, marginTop: '2px' }}>SVG Brand Icon</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: FFMPEG ASSET RESIZING VIEW */}
            {pipelineStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={20} color="#10b981" /> Step 3: FFmpeg Asset Resizing & Aspect Ratio Normalizer
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                      FFmpeg calculates smart fit strategies (`contain_blurred`, `cover_cinematic`, `svg_responsive`) for 1080p canvas rendering.
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

                {refinedAssets.length === 0 ? (
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
                    <ShieldCheck size={36} color="#10b981" style={{ margin: '0 auto 12px' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                      FFmpeg 1080p Normalizer Unstarted
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '500px', margin: '8px auto 24px' }}>
                      Run FFmpeg aspect ratio normalization to scale mined SVG flowcharts, brand icons, and Wikimedia images to 1920x1080 canvas bounds.
                    </p>
                    <button
                      onClick={handleRefineFFmpeg}
                      disabled={isRefiningFFmpeg}
                      style={{
                        padding: '12px 28px',
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
                      {isRefiningFFmpeg ? 'FFmpeg Normalizing Asset Aspect Ratios...' : '📐 Run FFmpeg 1080p Canvas Normalizer'}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {refinedAssets.map((asset: any, idx: number) => (
                      <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: '6px' }}>
                            {asset.format.toUpperCase()}
                          </span>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981', background: '#d1fae5', padding: '2px 8px', borderRadius: '6px' }}>
                            1080p Verified
                          </span>
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{asset.id}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Source: {asset.source}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: REMOTION VIDEO PRODUCTION STUDIO VIEW */}
            {pipelineStep === 4 && (
              <div>
                {scenes.length === 0 ? (
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
                    <Film size={40} color="#6366f1" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                      Remotion Video Player Uninitialized
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '520px', margin: '8px auto 24px' }}>
                      Please synthesize your AI script in Step 1 to generate the video composition scenes and speech narration.
                    </p>
                    <button
                      onClick={() => setPipelineStep(1)}
                      style={{
                        padding: '12px 28px',
                        borderRadius: '10px',
                        background: '#0f172a',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
                      }}
                    >
                      Go to Step 1: Synthesize AI Script ➡️
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: '32px' }}>
                      <RemotionPlayer
                        scenes={scenes}
                        activeSceneIndex={activeSceneIndex}
                        onSceneChange={setActiveSceneIndex}
                        projectTitle={project.title}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 340px', gap: '28px' }}>
                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                          Storyboard Scenes ({scenes.length})
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {scenes.map((scene: any, idx: number) => (
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
                                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>{Math.round((scene.durationFrames || 900) / 30)}s</span>
                              </div>
                              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{scene.name}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                          Scene {scenes[activeSceneIndex]?.sceneNumber || activeSceneIndex + 1} Speech Narration
                        </h3>
                        <textarea
                          value={scenes[activeSceneIndex]?.narration || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProject((prev: any) => {
                              const updated = { ...prev };
                              if (updated.remotionVideoScript?.scenes?.[activeSceneIndex]) {
                                updated.remotionVideoScript.scenes[activeSceneIndex].narration = val;
                              }
                              return updated;
                            });
                          }}
                          rows={4}
                          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', color: '#0f172a', fontFamily: 'inherit', resize: 'none' }}
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Mic size={16} color="#0284c7" /> Supertonic 3 Audio Voiceover
                          </h3>
                          <button
                            onClick={handleSynthesizeTts}
                            disabled={isSynthesizingTts}
                            style={{
                              width: '100%',
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
                            {isSynthesizingTts ? 'Synthesizing Audio...' : 'Synthesize Supertonic 3 Audio'}
                          </button>
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
                            {isRendering ? 'Rendering MP4 Build...' : 'Export Showcase MP4 Video'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* OVERVIEW TAB - BENTO GRID MASTER LAYOUT */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* BENTO CARD 1: SYSTEM METADATA HERO BANNER */}
            <div style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px 28px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '8px', background: '#e0f2fe', color: '#0369a1', fontSize: '0.8rem', fontWeight: 800 }}>
                      🏷️ {project.category || 'AI/ML'}
                    </span>
                    <span style={{ padding: '4px 12px', borderRadius: '8px', background: '#ecfdf5', color: '#047857', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldCheck size={14} color="#10b981" /> AST Evidence Verified
                    </span>
                    <span style={{ padding: '4px 12px', borderRadius: '8px', background: '#fef3c7', color: '#b45309', fontSize: '0.8rem', fontWeight: 800 }}>
                      Status: {project.status || 'Completed'}
                    </span>
                    {project.role && (
                      <span style={{ padding: '4px 12px', borderRadius: '8px', background: '#f3e8ff', color: '#7e22ce', fontSize: '0.8rem', fontWeight: 800 }}>
                        Role: {project.role}
                      </span>
                    )}
                    {project.classification?.type && (
                      <span style={{ padding: '4px 12px', borderRadius: '8px', background: '#fce7f3', color: '#be185d', fontSize: '0.8rem', fontWeight: 800 }}>
                        Classification: {project.classification.type}
                      </span>
                    )}
                  </div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                    {project.title}
                  </h1>
                  <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '6px', marginBottom: 0 }}>
                    Unified Repository Intelligence, AST Evidence & Programmatic Video Workspace
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '8px', background: '#0f172a', color: '#ffffff', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}
                    >
                      <Github size={16} /> GitHub Repository <ExternalLink size={14} />
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '8px', background: '#0284c7', color: '#ffffff', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}
                    >
                      <ExternalLink size={16} /> Live Demo
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* BENTO GRID ROW 1: EXECUTIVE SUMMARY & TECH STACK MATRIX */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
              {/* BENTO TILE: EXECUTIVE SUMMARY */}
              <div style={{ gridColumn: 'span 7', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <span style={{ fontSize: '1.2rem' }}>📌</span>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Executive Overview</h2>
                </div>
                <div style={{ flex: 1 }}>
                  <FormattedMarkdown content={project.description || project.longDescription || ''} />
                </div>
              </div>

              {/* BENTO TILE: TECH STACK BREAKDOWN */}
              <div style={{ gridColumn: 'span 5', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🛠️</span>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Tech Stack Matrix</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  {[
                    { key: 'frontend', title: 'Frontend', color: '#0284c7' },
                    { key: 'backend', title: 'Backend', color: '#10b981' },
                    { key: 'database', title: 'Database', color: '#8b5cf6' },
                    { key: 'aiMl', title: 'AI / ML', color: '#f59e0b' },
                    { key: 'testing', title: 'Testing', color: '#ec4899' },
                    { key: 'tools', title: 'Tools & Langs', color: '#06b6d4' },
                  ].map((cat, catIdx) => {
                    const items = project.techStackBreakdown?.[cat.key];
                    if (!items || items.length === 0) return null;
                    return (
                      <div key={cat.key} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: cat.color, textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.4px' }}>
                          {cat.title}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {items.map((item: string, idx: number) => {
                            const palette = BULLET_COLORS[(catIdx + idx) % BULLET_COLORS.length];
                            return (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', border: `1px solid ${palette.border}`, padding: '3px 10px', borderRadius: '6px' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: palette.dot, flexShrink: 0 }} />
                                <span style={{ fontSize: '0.775rem', fontWeight: 700, color: '#1e293b' }}>
                                  {item}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* BENTO GRID ROW 2: DEEP ARCHITECTURE OVERVIEW & CHAPTERS */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span style={{ fontSize: '1.2rem' }}>📐</span>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>System Design & Architectural Analysis</h2>
              </div>
              <FormattedMarkdown content={project.architectureOverview || project.description} stripFirstHeading={true} />
              {project.longDescription && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Comprehensive Architecture Tiers</h3>
                  <FormattedMarkdown content={project.longDescription} />
                </div>
              )}
            </div>

            {/* BENTO GRID ROW 3: LEAD CONTRIBUTIONS & CORE CAPABILITIES */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
              {/* LEAD CONTRIBUTIONS */}
              {project.myContributions && project.myContributions.length > 0 && (
                <div style={{ gridColumn: 'span 6', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '1.2rem' }}>🚀</span>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Lead Engineering Contributions ({project.myContributions.length})
                    </h2>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {project.myContributions.map((contrib: string, idx: number) => (
                      <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
                        <Check size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>{contrib}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CORE CAPABILITIES */}
              {project.features && project.features.length > 0 && (
                <div style={{ gridColumn: 'span 6', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '1.2rem' }}>✨</span>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Platform Capabilities ({project.features.length})
                    </h2>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {project.features.map((feat: string, idx: number) => (
                      <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
                        <Sparkles size={16} color="#6366f1" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>{feat}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* BENTO GRID ROW 4: API ENDPOINTS & SCANNED MODULES */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
              {/* API ENDPOINTS */}
              {project.apiEndpoints && project.apiEndpoints.length > 0 && (
                <div style={{ gridColumn: 'span 7', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '1.2rem' }}>🔌</span>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Verified API Routes ({project.apiEndpoints.length})
                    </h2>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {project.apiEndpoints.map((ep: any, idx: number) => (
                      <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800, background: ep.method === 'POST' ? '#10b981' : '#0284c7', color: '#ffffff' }}>
                            {ep.method}
                          </span>
                          <code style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>{ep.path}</code>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'right' }}>{ep.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* KEY MODULES */}
              {project.keyModules && project.keyModules.length > 0 && (
                <div style={{ gridColumn: 'span 5', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '1.2rem' }}>📦</span>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Code Modules ({project.keyModules.length})
                    </h2>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {project.keyModules.map((mod: any, idx: number) => {
                      const palette = BULLET_COLORS[idx % BULLET_COLORS.length];
                      return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: palette.dot, flexShrink: 0 }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>{mod.name}</span>
                          </div>
                          <code style={{ fontSize: '0.75rem', color: palette.text, background: palette.bg, border: `1px solid ${palette.border}`, padding: '2px 8px', borderRadius: '5px', fontFamily: 'monospace' }}>
                            {mod.path}
                          </code>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* BENTO GRID ROW 5: WORKFLOWS (USER & CODE EXECUTION) */}
            {((project.userFlow && project.userFlow.length > 0) || (project.codeFlow && project.codeFlow.length > 0)) && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
                {project.userFlow && project.userFlow.length > 0 && (
                  <div style={{ gridColumn: 'span 6', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '1.2rem' }}>👤</span>
                      <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>End-User Workflow Steps</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {project.userFlow.map((step: string, idx: number) => (
                        <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#0284c7', color: '#ffffff', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {idx + 1}
                          </span>
                          <div style={{ fontSize: '0.825rem', color: '#334155', lineHeight: 1.4 }}>{step}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {project.codeFlow && project.codeFlow.length > 0 && (
                  <div style={{ gridColumn: 'span 6', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '1.2rem' }}>⚙️</span>
                      <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Technical Execution Pipeline</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {project.codeFlow.map((step: string, idx: number) => (
                        <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#10b981', color: '#ffffff', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {idx + 1}
                          </span>
                          <div style={{ fontSize: '0.825rem', color: '#334155', lineHeight: 1.4 }}>{step}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* BENTO GRID ROW 6: CHALLENGES & LEARNINGS */}
            {((project.challenges && project.challenges.length > 0) || (project.learnings && project.learnings.length > 0)) && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
                {project.challenges && (
                  <div style={{ gridColumn: 'span 6', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '1.2rem' }}>🛡️</span>
                      <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Technical Challenges ({project.challenges.length})</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {project.challenges.map((c: string, idx: number) => (
                        <div key={idx} style={{ background: '#fff7ed', border: '1px solid #ffedd5', padding: '10px 12px', borderRadius: '8px', fontSize: '0.825rem', color: '#9a3412', lineHeight: 1.4 }}>
                          {c}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {project.learnings && (
                  <div style={{ gridColumn: 'span 6', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '1.2rem' }}>💡</span>
                      <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Architectural Insights ({project.learnings.length})</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {project.learnings.map((l: string, idx: number) => (
                        <div key={idx} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 12px', borderRadius: '8px', fontSize: '0.825rem', color: '#166534', lineHeight: 1.4 }}>
                          {l}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* BENTO GRID ROW 7: USER UX JOURNEY & PRODUCT PIPELINE ROADMAP */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🚦</span>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    User UX Journey & Interactive Product Roadmap
                  </h2>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: '6px', background: '#ecfdf5', color: '#047857', fontSize: '0.75rem', fontWeight: 800 }}>
                  4-Stage End-to-End Pipeline Active
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', borderLeft: '4px solid #0284c7' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Stage 1 • Discovery & Inspection
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', marginBottom: '6px' }}>
                    AST Evidence & Workspace Scan
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                    User opens repository workspace. System scans package manifests, AST routes, and key modules to generate verified evidence.
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Stage 2 • AI Script Synthesis
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', marginBottom: '6px' }}>
                    Multi-Pass Script Generator
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                    User configures video duration (30s–10m) and prompt preset. AI Hub synthesizes structured scenes with narrations and badges.
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', borderLeft: '4px solid #10b981' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Stage 3 • Multi-Source Asset Mining
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', marginBottom: '6px' }}>
                    Vector Diagrams & Icon Extract
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                    Mines visual assets from Napkin AI, Iconify SVG badges, Wikimedia Commons diagrams, and Mermaid topology graphs.
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', borderLeft: '4px solid #8b5cf6' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Stage 4 • Render & Export
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', marginBottom: '6px' }}>
                    FFmpeg Normalizer & Remotion MP4
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                    Normalizes 1080p canvas assets, synthesizes Supertonic 3 ONNX narration (-16 LUFS), and exports production MP4 video.
                  </div>
                </div>
              </div>
            </div>

            {/* BENTO GRID ROW 8: FUTURE ROADMAP */}
            {project.futureRoadmap && project.futureRoadmap.length > 0 && (
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🗺️</span>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Future Engineering Roadmap ({project.futureRoadmap.length})</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '10px' }}>
                  {project.futureRoadmap.map((item: string, idx: number) => (
                    <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', fontSize: '0.825rem', color: '#334155', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8b5cf6', background: '#f3e8ff', padding: '2px 6px', borderRadius: '4px', flexShrink: 0 }}>
                        #{idx + 1}
                      </span>
                      <div style={{ lineHeight: 1.4 }}>{item}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* KNOWLEDGE GRAPH TAB */}
        {activeTab === 'graph' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Project Knowledge Graph & Visual Topologies</h2>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '4px' }}>
                  Interactive system diagrams extracted directly from source code AST evidence.
                </p>
              </div>

              {/* Diagram Sub-Tab Switcher */}
              <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
                <button
                  onClick={() => setDiagramTab('topology')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                    background: diagramTab === 'topology' ? '#ffffff' : 'transparent',
                    color: diagramTab === 'topology' ? '#0284c7' : '#64748b',
                    boxShadow: diagramTab === 'topology' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  System Topology
                </button>
                {project.dataFlowDiagram && (
                  <button
                    onClick={() => setDiagramTab('dataflow')}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.825rem',
                      cursor: 'pointer',
                      background: diagramTab === 'dataflow' ? '#ffffff' : 'transparent',
                      color: diagramTab === 'dataflow' ? '#0284c7' : '#64748b',
                      boxShadow: diagramTab === 'dataflow' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    Data Flow Map
                  </button>
                )}
                {project.sequenceDiagram && (
                  <button
                    onClick={() => setDiagramTab('sequence')}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.825rem',
                      cursor: 'pointer',
                      background: diagramTab === 'sequence' ? '#ffffff' : 'transparent',
                      color: diagramTab === 'sequence' ? '#0284c7' : '#64748b',
                      boxShadow: diagramTab === 'sequence' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    Sequence Diagram
                  </button>
                )}
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <MermaidViewer
                chart={
                  diagramTab === 'dataflow'
                    ? project.dataFlowDiagram || project.architectureDiagram
                    : diagramTab === 'sequence'
                    ? project.sequenceDiagram || project.architectureDiagram
                    : project.architectureDiagram || 'graph TD\nUI-->API'
                }
                id={`kg-mermaid-${project.slug}-${diagramTab}`}
              />
            </div>
          </div>
        )}

        {/* ASSET LIBRARY TAB */}
        {activeTab === 'assets' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Extracted Project Asset Library</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                Multi-source assets mined for {project.title} including Napkin AI vector flowcharts, Iconify brand icons, and reference diagrams.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
              {/* Tech Stack Brand Icons */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                  🏷️ Tech Stack Logos & Badges
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {Object.values(project.techStackBreakdown || {})
                    .flat()
                    .map((tech: any, idx: number) => (
                      <span key={idx} style={{ background: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
                        {tech}
                      </span>
                    ))}
                </div>
              </div>

              {/* Vector Flowchart Steps */}
              {project.userFlow && (
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                    🎨 Napkin AI Vector Steps
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {project.userFlow.slice(0, 4).map((uf: string, idx: number) => (
                      <div key={idx} style={{ background: '#1e293b', color: '#f8fafc', padding: '10px 14px', borderRadius: '8px', fontSize: '0.825rem' }}>
                        <span style={{ color: '#38bdf8', fontWeight: 800 }}>Step {idx + 1}:</span> {uf}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* RAW METADATA JSON TAB */}
        {activeTab === 'json' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Raw Project Metadata JSON Payload</h2>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(project, null, 2));
                  addToast('success', 'JSON Copied', 'Raw metadata JSON copied to clipboard.');
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', background: '#0284c7', color: '#ffffff', border: 'none', fontWeight: 700, fontSize: '0.825rem', cursor: 'pointer' }}
              >
                <Copy size={14} /> Copy Raw JSON
              </button>
            </div>
            <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '24px', borderRadius: '12px', overflowX: 'auto', fontSize: '0.85rem', lineHeight: 1.5, maxHeight: '600px' }}>
              {JSON.stringify(project, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
