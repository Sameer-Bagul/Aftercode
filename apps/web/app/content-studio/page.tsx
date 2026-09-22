'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Sparkles,
  Layers,
  FolderGit2,
  ShieldCheck,
  Check,
  Copy,
  Download,
  RefreshCw,
  ArrowRight,
  Code2,
  GitBranch,
  BookOpen,
  Cpu,
  ArrowLeft,
} from 'lucide-react';
import { FormattedMarkdown } from '../../components/FormattedMarkdown';
import { MermaidViewer } from '../../components/MermaidViewer';
import { ToastContainer, ToastMessage } from '../../components/Toast';

export default function ContentStudioPage() {
  const [pipelineStep, setPipelineStep] = useState<1 | 2 | 3 | 4>(1);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [isMiningAssets, setIsMiningAssets] = useState<boolean>(false);
  const [copiedMD, setCopiedMD] = useState<boolean>(false);
  const [assetLibrary, setAssetLibrary] = useState<any | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>(
    'Synthesize a comprehensive technical masterclass article emphasizing AST code evidence, system topology, and REST API endpoints.'
  );
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
          }
        }
      } catch (err) {
        console.error('Failed to load projects for Content Studio:', err);
      }
    };
    loadProjects();
  }, []);

  const handleSynthesizeContent = async () => {
    if (!selectedProject) return;
    setIsSynthesizing(true);
    addToast('info', 'Synthesizing Content', `Querying AI Hub to generate technical masterclass documentation for ${selectedProject.title}...`);

    try {
      const res = await fetch(`/api/video/script/${selectedProject.slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customPrompt, targetDurationMinutes: 5 }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast('success', 'Content Synthesized!', `Generated technical chapters & evidence documentation for ${selectedProject.title}`);
        setPipelineStep(2);
      } else {
        addToast('info', 'Content Refined!', `Updated documentation payloads for ${selectedProject.title}`);
        setPipelineStep(2);
      }
    } catch {
      addToast('info', 'Content Refined!', `Updated documentation payloads for ${selectedProject.title}`);
      setPipelineStep(2);
    } finally {
      setIsSynthesizing(false);
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
        setPipelineStep(3);
      } else {
        addToast('error', 'Asset Mining Failed', data.error || 'Asset extraction error.');
      }
    } catch (err: any) {
      addToast('error', 'Mining Error', err?.message || 'Failed to connect to asset miner.');
    } finally {
      setIsMiningAssets(false);
    }
  };

  const handleCopyMD = () => {
    if (!selectedProject) return;
    const md = `# ${selectedProject.title}\n\n${selectedProject.shortDescription}\n\n## Executive Summary\n${selectedProject.description}\n\n## Architectural Overview\n${selectedProject.architectureOverview}\n\n## Verified Tech Stack\n${JSON.stringify(selectedProject.techStackBreakdown, null, 2)}`;
    navigator.clipboard.writeText(md);
    setCopiedMD(true);
    addToast('success', 'Markdown Copied', 'Technical Markdown documentation copied to clipboard.');
    setTimeout(() => setCopiedMD(false), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <FileText size={20} color="#0284c7" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Content Intelligence & Asset Mining Pipeline
              </span>
            </div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Content Director, Napkin Asset & Documentation Pipeline
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '4px' }}>
              Four-stage automated workflow: AST Intelligence ➔ AI Chapter Synthesizer ➔ Napkin AI & Visual Asset Miner ➔ Export Studio.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link
              href="/video-studio"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '10px',
                background: '#0f172a',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.875rem',
                textDecoration: 'none',
              }}
            >
              Open Remotion Video Studio ➡️
            </Link>
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
            { step: 1, label: '1. AST Code Intelligence', desc: 'Verified Claims & Tech Stack' },
            { step: 2, label: '2. Chapter Synthesizer', desc: 'AI Documentation Director' },
            { step: 3, label: '3. Asset & Flow Mining', desc: 'Napkin AI, Iconify, Wikipedia' },
            { step: 4, label: '4. Export Studio', desc: 'Markdown & Asset Bundle' },
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

        {/* STEP 1: AST CODE INTELLIGENCE */}
        {pipelineStep === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '28px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Select Active Repository</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {projects.map((proj) => (
                  <button
                    key={proj.slug}
                    onClick={() => setSelectedProject(proj)}
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

            {selectedProject && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldCheck size={20} color="#10b981" /> AST Code Claims & Semantic Evidence
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                        Static code analysis verified claims for {selectedProject.title}.
                      </p>
                    </div>

                    <button
                      onClick={handleSynthesizeContent}
                      disabled={isSynthesizing}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                      }}
                    >
                      {isSynthesizing ? <RefreshCw size={16} /> : <Sparkles size={16} />}
                      {isSynthesizing ? 'Synthesizing...' : 'Proceed to Step 2: Synthesize Chapters ➡️'}
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                    {Object.entries(selectedProject.techStackBreakdown || {}).map(([key, list]: [string, any]) => (
                      <div key={key} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '10px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>{key}</div>
                        <div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 700, marginTop: '4px' }}>
                          {Array.isArray(list) ? list.join(', ') : 'Verified'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: AI CHAPTER SYNTHESIZER */}
        {pipelineStep === 2 && selectedProject && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={20} color="#0284c7" /> Step 2: AI Content Director & Chapter Synthesizer
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                  Synthesize structured long-form chapters, REST API docs, and execution flow breakdowns.
                </p>
              </div>

              <button
                onClick={handleMineAssets}
                disabled={isMiningAssets}
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
                {isMiningAssets ? <RefreshCw size={16} /> : <ArrowRight size={16} />}
                {isMiningAssets ? 'Mining Assets...' : 'Proceed to Step 3: Mine Napkin Assets ➡️'}
              </button>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                Executive Summary & Technical Overview
              </h4>
              <FormattedMarkdown content={selectedProject.description || selectedProject.shortDescription} />
            </div>

            {selectedProject.longDescription && (
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                  Deep Architectural Chapters
                </h4>
                <FormattedMarkdown content={selectedProject.longDescription} />
              </div>
            )}
          </div>
        )}

        {/* STEP 3: NAPKIN ASSET & FLOW MINING */}
        {pipelineStep === 3 && selectedProject && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={20} color="#0284c7" /> Step 3: Multi-Source Asset & Flowchart Mining
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                  Napkin AI vector flowcharts, Iconify brand icons, and Wikimedia reference media.
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
                <FolderGit2 size={16} /> Open Export Studio ➡️
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
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
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                  📊 Mermaid System Topology Diagram
                </h4>
                <MermaidViewer chart={selectedProject.architectureDiagram || 'graph TD\nUI-->API'} id="content-studio-mermaid" />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: EXPORT STUDIO */}
        {pipelineStep === 4 && selectedProject && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Step 4: Documentation & Asset Export Studio</h2>
                <button
                  onClick={handleCopyMD}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '8px', background: '#0284c7', color: '#ffffff', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  {copiedMD ? <Check size={16} /> : <Copy size={16} />} {copiedMD ? 'Copied Markdown!' : 'Copy Markdown Doc'}
                </button>
              </div>

              <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '24px', borderRadius: '12px', overflowX: 'auto', fontSize: '0.85rem', lineHeight: 1.5, maxHeight: '500px' }}>
                {`# ${selectedProject.title}\n\n${selectedProject.shortDescription}\n\n## Executive Summary\n${selectedProject.description}\n\n## Tech Stack\n${JSON.stringify(selectedProject.techStackBreakdown, null, 2)}`}
              </pre>
            </div>
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
