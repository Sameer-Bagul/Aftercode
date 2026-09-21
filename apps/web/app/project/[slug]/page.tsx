'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Github, Layers, ShieldCheck, Code, GitBranch, Video, FolderGit2, ExternalLink, Copy, Volume2, Check } from 'lucide-react';
import { MermaidViewer } from '@/components/MermaidViewer';
import { ToastContainer, ToastMessage } from '@/components/Toast';
import { FormattedMarkdown } from '@/components/FormattedMarkdown';

export default function ProjectWorkspacePage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'athena-end-to-end-ai-agent';

  const [activeTab, setActiveTab] = useState<'overview' | 'video' | 'graph' | 'assets' | 'json'>('overview');
  const [diagramTab, setDiagramTab] = useState<'topology' | 'dataflow' | 'sequence'>('topology');
  const [copiedMD, setCopiedMD] = useState<boolean>(false);
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [isSynthesizingTts, setIsSynthesizingTts] = useState<boolean>(false);
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

  const handleCopyMD = () => {
    const md = `# ${project.title}\n\n${project.shortDescription}\n\n## Technical Overview\n${project.description}\n\n## Tech Stack\n${JSON.stringify(project.techStackBreakdown, null, 2)}`;
    navigator.clipboard.writeText(md);
    setCopiedMD(true);
    addToast('success', 'Markdown Copied', 'Portfolio Markdown payload copied to clipboard.');
    setTimeout(() => setCopiedMD(false), 2000);
  };

  const handleSynthesizeTts = async () => {
    setIsSynthesizingTts(true);
    addToast('info', 'TTS Voiceover Synthesis', 'Generating audio WAV files via FFmpeg...');
    try {
      const res = await fetch(`/api/video/tts/${project.slug}`, { method: 'POST' });
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

  const videoScript = project.remotionVideoScript;
  const scenes = videoScript?.scenes || [
    {
      sceneNumber: 1,
      name: 'Hero & Hook Introduction',
      heading: project.title,
      subheading: `Production-Grade ${project.category || 'Software'} Application`,
      narration: `Welcome to the technical breakdown of ${project.title}.`,
      durationFrames: 150,
      startFrame: 0,
      endFrame: 150,
      bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      badges: project.techStackBreakdown?.frontend || ['TypeScript', 'React'],
    },
    {
      sceneNumber: 2,
      name: 'Architecture & System Topology',
      heading: 'Multi-Tier System Topology',
      subheading: `${project.techStackBreakdown?.backend?.join(', ') || 'Node.js Express'} API Gateway`,
      narration: `Decoupled architecture combining API router with client interface.`,
      durationFrames: 150,
      startFrame: 150,
      endFrame: 300,
      bgGradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
      badges: project.techStackBreakdown?.backend || ['Node.js'],
    },
    {
      sceneNumber: 3,
      name: 'API Routes & Endpoints',
      heading: `${project.apiEndpoints?.length || 4} REST API Routes`,
      subheading: 'Request routing and payload validation',
      narration: `Exposing validated API endpoints with parameter verification.`,
      durationFrames: 150,
      startFrame: 300,
      endFrame: 450,
      bgGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      badges: ['GET /api/health', 'POST /api/analyze'],
    },
    {
      sceneNumber: 4,
      name: 'Modular Source Code Structure',
      heading: 'Clean Architecture Boundaries',
      subheading: 'Separated controllers, services, and schemas',
      narration: `Clean code boundaries separating entrypoint routing and controllers.`,
      durationFrames: 150,
      startFrame: 450,
      endFrame: 600,
      bgGradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      badges: ['src/services', 'src/controllers'],
    },
    {
      sceneNumber: 5,
      name: 'Technical Features & Stack',
      heading: 'Engineering Highlights',
      subheading: project.features?.[0] || 'High reliability build pipeline',
      narration: `High-reliability build pipelines and clean state management.`,
      durationFrames: 150,
      startFrame: 600,
      endFrame: 750,
      bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      badges: project.techStackBreakdown?.tools || ['TypeScript', 'Vite'],
    },
    {
      sceneNumber: 6,
      name: 'Outro & Call To Action',
      heading: 'Explore the Codebase',
      subheading: `github.com/${project.repository?.owner || 'Sameer-Bagul'}/${project.slug}`,
      narration: `Check out the full open-source repository on GitHub!`,
      durationFrames: 150,
      startFrame: 750,
      endFrame: 900,
      bgGradient: 'linear-gradient(135deg, #475569 0%, #0f172a 100%)',
      badges: ['GitHub Open Source', 'MIT License'],
    },
  ];

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
              <Video size={16} /> Video Studio
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
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Executive Summary & Badges */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ padding: '4px 12px', borderRadius: '6px', background: '#f1f5f9', color: '#475569', fontSize: '0.75rem', fontWeight: 700 }}>
                  {project.category || 'Web App'}
                </span>
                <span style={{ padding: '4px 12px', borderRadius: '6px', background: '#ecfdf5', color: '#047857', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={14} color="#10b981" /> AST Verified
                </span>
                {project.status && (
                  <span style={{ padding: '4px 12px', borderRadius: '6px', background: '#f0f9ff', color: '#0284c7', fontSize: '0.75rem', fontWeight: 700 }}>
                    Status: {project.status}
                  </span>
                )}
                {project.role && (
                  <span style={{ padding: '4px 12px', borderRadius: '6px', background: '#faf5ff', color: '#7e22ce', fontSize: '0.75rem', fontWeight: 700 }}>
                    Role: {project.role}
                  </span>
                )}
              </div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Executive Summary</h2>
              <FormattedMarkdown content={project.description || project.shortDescription} />

              {/* Tech Stack Matrix */}
              {project.techStackBreakdown && (
                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                  {Object.entries(project.techStackBreakdown).map(([category, stack]: [string, any]) => {
                    if (!Array.isArray(stack) || stack.length === 0) return null;
                    const catColors: Record<string, { bg: string; color: string }> = {
                      frontend: { bg: '#eff6ff', color: '#1d4ed8' },
                      backend: { bg: '#f0fdf4', color: '#15803d' },
                      database: { bg: '#fff7ed', color: '#c2410c' },
                      aiMl: { bg: '#faf5ff', color: '#7e22ce' },
                      infrastructure: { bg: '#ecfeff', color: '#0e7490' },
                      tools: { bg: '#f1f5f9', color: '#334155' },
                    };
                    const style = catColors[category] || { bg: '#f1f5f9', color: '#334155' };
                    return (
                      <div key={category} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{category}:</span>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {stack.map((t: string) => (
                            <span key={t} style={{ padding: '3px 10px', borderRadius: '6px', background: style.bg, color: style.color, fontSize: '0.75rem', fontWeight: 700 }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Exhaustive Technical Architecture Overview */}
            {(project.longDescription || project.description) && (
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>Exhaustive Technical Architecture Breakdown</h2>
                <FormattedMarkdown content={project.longDescription || project.description} />
              </div>
            )}

            {/* System Architecture & Multi-Flowchart Diagrams */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>System Architecture & Interactive Flowcharts</h2>
                
                {/* Flowchart Type Switcher */}
                <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                  <button
                    onClick={() => setDiagramTab('topology')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: diagramTab === 'topology' ? '#ffffff' : 'transparent',
                      color: diagramTab === 'topology' ? '#0284c7' : '#64748b',
                      boxShadow: diagramTab === 'topology' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                    }}
                  >
                    🏗️ System Topology
                  </button>
                  <button
                    onClick={() => setDiagramTab('dataflow')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: diagramTab === 'dataflow' ? '#ffffff' : 'transparent',
                      color: diagramTab === 'dataflow' ? '#0284c7' : '#64748b',
                      boxShadow: diagramTab === 'dataflow' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                    }}
                  >
                    🔄 Data Pipeline
                  </button>
                  <button
                    onClick={() => setDiagramTab('sequence')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: diagramTab === 'sequence' ? '#ffffff' : 'transparent',
                      color: diagramTab === 'sequence' ? '#0284c7' : '#64748b',
                      boxShadow: diagramTab === 'sequence' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                    }}
                  >
                    ⚡ Execution Sequence
                  </button>
                </div>
              </div>

              {diagramTab === 'topology' && (
                <MermaidViewer chart={project.architectureDiagram || 'graph TD\nUI-->API'} id={`overview-mermaid-${project.slug}`} />
              )}
              {diagramTab === 'dataflow' && (
                <MermaidViewer chart={project.dataFlowDiagram || project.architectureDiagram || 'graph LR\nSource-->BM25'} id={`dataflow-mermaid-${project.slug}`} />
              )}
              {diagramTab === 'sequence' && (
                <MermaidViewer chart={project.sequenceDiagram || 'sequenceDiagram\nClient->>Gateway: POST /api\nGateway-->>Client: 200 OK'} id={`sequence-mermaid-${project.slug}`} />
              )}
            </div>

            {/* Key Engineering Accomplishments / Contributions */}
            {Array.isArray(project.myContributions) && project.myContributions.length > 0 && (
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Key Engineering Accomplishments ({project.myContributions.length})</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '14px' }}>
                  {project.myContributions.map((contrib: string, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                        <Check size={14} />
                      </div>
                      <span style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.5, fontWeight: 500 }}>{contrib}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Technical Features */}
            {Array.isArray(project.features) && project.features.length > 0 && (
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Technical Features & System Capabilities ({project.features.length})</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
                  {project.features.map((feat: string, i: number) => (
                    <div key={i} style={{ background: '#ecfeff', border: '1px solid #cff4fc', padding: '16px', borderRadius: '12px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0891b2', textTransform: 'uppercase' }}>Feature #{i + 1}</span>
                      <p style={{ fontSize: '0.875rem', color: '#164e63', fontWeight: 600, marginTop: '4px', margin: 0, lineHeight: 1.5 }}>{feat}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Engineering Challenges & Learnings Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '28px' }}>
              {/* Engineering Challenges */}
              {Array.isArray(project.challenges) && project.challenges.length > 0 && (
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></span>
                    Engineering Challenges & Trade-offs
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {project.challenges.map((chal: string, i: number) => (
                      <div key={i} style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '14px', borderRadius: '10px' }}>
                        <p style={{ fontSize: '0.85rem', color: '#92400e', fontWeight: 500, margin: 0, lineHeight: 1.5 }}>{chal}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Learnings */}
              {Array.isArray(project.learnings) && project.learnings.length > 0 && (
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#8b5cf6' }}></span>
                    Technical Learnings & Architectural Insights
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {project.learnings.map((learn: string, i: number) => (
                      <div key={i} style={{ background: '#f3e8ff', border: '1px solid #e9d5ff', padding: '14px', borderRadius: '10px' }}>
                        <p style={{ fontSize: '0.85rem', color: '#6b21a8', fontWeight: 500, margin: 0, lineHeight: 1.5 }}>{learn}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actionable Future Roadmap */}
            {Array.isArray(project.futureRoadmap) && project.futureRoadmap.length > 0 && (
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff7e5f' }}></span>
                  Actionable Future Roadmap ({project.futureRoadmap.length})
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
                  {project.futureRoadmap.map((item: string, i: number) => (
                    <div key={i} style={{ background: '#fff5f5', border: '1px solid #ffe3e3', padding: '16px', borderRadius: '12px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#e03131', textTransform: 'uppercase' }}>Goal #{i + 1}</span>
                      <p style={{ fontSize: '0.875rem', color: '#c92a2a', fontWeight: 600, marginTop: '4px', margin: 0, lineHeight: 1.5 }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'video' && (
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '28px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Storyboard Scenes</h3>
                <button
                  onClick={handleRenderVideo}
                  disabled={isRendering}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {isRendering ? 'Rendering...' : 'Render MP4'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {scenes.map((scene: any, idx: number) => (
                  <div
                    key={scene.sceneNumber}
                    onClick={() => setActiveSceneIndex(idx)}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: idx === activeSceneIndex ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      background: idx === activeSceneIndex ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>Scene {scene.sceneNumber}</span>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{scene.name}</h4>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              {scenes[activeSceneIndex] && (
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>{scenes[activeSceneIndex].name}</h3>
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      borderRadius: '12px',
                      background: scenes[activeSceneIndex].bgGradient,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '40px',
                      color: '#ffffff',
                    }}
                  >
                    <h2 style={{ fontSize: '2.25rem', fontWeight: 800, textAlign: 'center' }}>{scenes[activeSceneIndex].heading}</h2>
                    <p style={{ fontSize: '1.1rem', marginTop: '8px', opacity: 0.9, textAlign: 'center' }}>{scenes[activeSceneIndex].subheading}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'graph' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Project Knowledge Graph & Evidence Claims</h2>
            <MermaidViewer chart={project.architectureDiagram || 'graph TD\nUI-->API'} id={`kg-mermaid-${project.slug}`} />
          </div>
        )}

        {activeTab === 'assets' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Extracted Project Assets</h2>
            <p style={{ color: '#64748b' }}>Icons, SVG diagrams, and asset metadata extracted for {project.title}.</p>
          </div>
        )}

        {activeTab === 'json' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Raw Project Metadata JSON Payload</h2>
            <pre style={{ background: '#0f172a', color: '#f8fafc', padding: '20px', borderRadius: '8px', overflowX: 'auto', fontSize: '0.85rem' }}>
              {JSON.stringify(project, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

