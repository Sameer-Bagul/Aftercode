import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Cpu,
  Layers,
  Server,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  MapPin,
  Play,
  Zap,
  Code,
  Check,
  Clock,
  User,
  Building,
  Target,
  Sparkles,
  GitPullRequest,
  Workflow,
  Activity,
  Compass
} from 'lucide-react';
import projectsData from '../data/projects.json';
import { MermaidViewer } from '../components/MermaidViewer';
import { ThumbnailPreview } from '../components/ThumbnailPreview';
import { VideoPreviewModal } from '../components/VideoPreviewModal';

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const [copiedMD, setCopiedMD] = useState<boolean>(false);

  const project = (projectsData as any[]).find((p) => p.slug === slug || p._id === slug) || (projectsData as any[])[0];

  if (!project) {
    return (
      <div style={{ padding: '64px 40px', textAlign: 'center', color: '#4b5563' }}>
        <h2>Project Not Found</h2>
        <p style={{ marginTop: '12px' }}>No metadata recorded for slug: {slug}</p>
        <Link to="/" className="btn-fruity-primary" style={{ marginTop: '20px', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Return to Catalog Dashboard
        </Link>
      </div>
    );
  }

  const handleCopyMD = () => {
    const md = `# ${project.title}\n\n${project.shortDescription}\n\n## Description\n${project.description}\n\n## Tech Stack\n${JSON.stringify(project.techStackBreakdown, null, 2)}`;
    navigator.clipboard.writeText(md);
    setCopiedMD(true);
    setTimeout(() => setCopiedMD(false), 2000);
  };

  const getMethodBadgeStyle = (method: string) => {
    const m = (method || 'GET').toUpperCase();
    switch (m) {
      case 'GET':
        return { bg: 'rgba(16, 185, 129, 0.12)', color: '#047857', border: 'rgba(16, 185, 129, 0.3)' };
      case 'POST':
        return { bg: 'rgba(2, 132, 199, 0.12)', color: '#0369a1', border: 'rgba(2, 132, 199, 0.3)' };
      case 'PUT':
        return { bg: 'rgba(245, 158, 11, 0.12)', color: '#b45309', border: 'rgba(245, 158, 11, 0.3)' };
      case 'DELETE':
        return { bg: 'rgba(244, 63, 94, 0.12)', color: '#be123c', border: 'rgba(244, 63, 94, 0.3)' };
      default:
        return { bg: 'rgba(139, 92, 246, 0.12)', color: '#6d28d9', border: 'rgba(139, 92, 246, 0.3)' };
    }
  };

  // Helper to parse description into formatted sections
  const descriptionParagraphs = (project.description || '')
    .split(/\n\n+/)
    .filter((p: string) => p.trim().length > 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafaf9', paddingBottom: '80px' }}>
      {/* Sticky Quick-Nav & Breadcrumb Toolbar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, padding: '14px 40px', borderBottom: '1px solid #e5e7eb', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#e0533c', fontWeight: 700, textDecoration: 'none', fontSize: '0.875rem' }}>
            <ArrowLeft size={16} /> Back to Catalog
          </Link>
          <span style={{ color: '#d1d5db' }}>|</span>
          {/* Section Navigation Jump Links */}
          <nav style={{ display: 'flex', gap: '14px', fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>
            <a href="#topology" style={{ textDecoration: 'none', color: '#4b5563' }}>01 Topology</a>
            <a href="#overview" style={{ textDecoration: 'none', color: '#4b5563' }}>02 Overview</a>
            <a href="#techstack" style={{ textDecoration: 'none', color: '#4b5563' }}>03 Tech Stack</a>
            <a href="#accomplishments" style={{ textDecoration: 'none', color: '#4b5563' }}>04 Accomplishments</a>
            <a href="#api-endpoints" style={{ textDecoration: 'none', color: '#4b5563' }}>05 API Routes</a>
            <a href="#modules" style={{ textDecoration: 'none', color: '#4b5563' }}>06 Modules</a>
            <a href="#roadmap" style={{ textDecoration: 'none', color: '#4b5563' }}>07 Roadmap</a>
            <a href="#media-studio" style={{ textDecoration: 'none', color: '#4b5563' }}>08 Media</a>
          </nav>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-fruity-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={handleCopyMD}>
            {copiedMD ? <Check size={14} color="#10b981" /> : <Code size={14} />} {copiedMD ? 'MD Copied' : 'Copy Markdown'}
          </button>
          <button className="btn-fruity-primary" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => setShowVideoModal(true)}>
            <Play size={14} /> Remotion Video Studio
          </button>
        </div>
      </div>

      {/* CONTINUOUS BENTO DOCUMENT CONTAINER */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '36px 40px 0', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* ==================================================================== */}
        {/* SECTION 1: HERO & EXECUTIVE SUMMARY BENTO ROW */}
        {/* ==================================================================== */}
        <section style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '24px', padding: '36px', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ flex: 1, minWidth: '320px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span className="badge badge-peach">{project.category || 'Engineering'}</span>
                <span style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} /> AST Evidence Verified
                </span>
                {project.classification?.portfolioWorthiness && (
                  <span className="badge badge-lavender" style={{ textTransform: 'capitalize' }}>
                    <Sparkles size={12} /> {project.classification.portfolioWorthiness} Worthy
                  </span>
                )}
              </div>

              <h1 style={{ fontSize: '2.6rem', fontWeight: 800, color: '#111827', marginTop: '14px', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                {project.title}
              </h1>

              {/* Clean Short Description Callout */}
              <div style={{ marginTop: '14px', background: 'linear-gradient(135deg, rgba(255, 126, 95, 0.06), rgba(255, 107, 107, 0.06))', borderLeft: '4px solid #ff7e5f', padding: '16px 20px', borderRadius: '12px', color: '#374151', fontSize: '1.05rem', lineHeight: 1.6 }}>
                <strong>Executive Summary:</strong> {project.shortDescription}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noreferrer" className="btn-fruity-secondary" style={{ textDecoration: 'none' }}>
                  <Github size={18} /> GitHub Repository
                </a>
              )}
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noreferrer" className="btn-fruity-primary" style={{ textDecoration: 'none' }}>
                  <ExternalLink size={18} /> Live Application
                </a>
              )}
            </div>
          </div>

          {/* Key Project Metadata Pills Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #f3f4f6' }}>
            <div style={{ background: '#fafaf9', padding: '12px 16px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} color="#ff7e5f" /> Role
              </span>
              <strong style={{ color: '#111827', fontSize: '0.95rem', display: 'block', marginTop: '4px' }}>{project.role || 'Sole Developer'}</strong>
            </div>

            <div style={{ background: '#fafaf9', padding: '12px 16px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building size={14} color="#10b981" /> Organization
              </span>
              <strong style={{ color: '#111827', fontSize: '0.95rem', display: 'block', marginTop: '4px' }}>{project.clientOrCompany || 'Open Source'}</strong>
            </div>

            <div style={{ background: '#fafaf9', padding: '12px 16px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} color="#8b5cf6" /> Status
              </span>
              <strong style={{ color: '#111827', fontSize: '0.95rem', display: 'block', marginTop: '4px' }}>{project.status || 'Active'}</strong>
            </div>

            <div style={{ background: '#fafaf9', padding: '12px 16px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Target size={14} color="#06b6d4" /> Target Audience
              </span>
              <strong style={{ color: '#111827', fontSize: '0.95rem', display: 'block', marginTop: '4px' }}>{project.targetAudience || 'Developers & Engineering Leads'}</strong>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 2: ARCHITECTURE TOPOLOGY BENTO ROW */}
        {/* ==================================================================== */}
        <section id="topology" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '24px', padding: '36px', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#e0533c', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>01. SYSTEM ARCHITECTURE</span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', marginTop: '4px' }}>Multi-Tier System Topology Graph</h2>
            </div>
            <span className="badge badge-lavender">Auto-generated Mermaid AST</span>
          </div>

          {project.architectureDiagram ? (
            <MermaidViewer chart={project.architectureDiagram} id={project.slug} />
          ) : (
            <div style={{ padding: '32px', background: '#fafaf9', borderRadius: '16px', textAlign: 'center', color: '#6b7280' }}>
              No architecture diagram generated yet.
            </div>
          )}
        </section>

        {/* ==================================================================== */}
        {/* SECTION 3: SYSTEM OVERVIEW & PROSE DESCRIPTION */}
        {/* ==================================================================== */}
        <section id="overview" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '24px', padding: '36px', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.8rem', color: '#e0533c', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>02. SYSTEM OVERVIEW</span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', marginTop: '4px', marginBottom: '20px' }}>Detailed System Architecture & Execution Lifecycle</h2>
          
          {/* Architecture Overview Banner */}
          {project.architectureOverview && (
            <div style={{ marginBottom: '24px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '16px 20px', borderRadius: '14px', color: '#047857', fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Compass size={20} color="#10b981" />
              <span>{project.architectureOverview}</span>
            </div>
          )}

          {/* Structured Paragraph Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {descriptionParagraphs.map((paragraph: string, idx: number) => {
              const colonIndex = paragraph.indexOf(':');
              const hasHeader = colonIndex > 0 && colonIndex < 45;
              const headerText = hasHeader ? paragraph.substring(0, colonIndex).trim() : null;
              const bodyText = hasHeader ? paragraph.substring(colonIndex + 1).trim() : paragraph;

              return (
                <div key={idx} style={{ background: '#fafaf9', border: '1px solid #e5e7eb', padding: '22px 26px', borderRadius: '16px' }}>
                  {headerText && (
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff7e5f' }} />
                      {headerText}
                    </div>
                  )}
                  <p style={{ color: '#374151', fontSize: '1rem', lineHeight: 1.7, margin: 0 }}>
                    {bodyText}
                  </p>
                </div>
              );
            })}
          </div>

          {/* User Flow & Code Flow Grid */}
          {(project.userFlow?.length > 0 || project.codeFlow?.length > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '28px' }}>
              {/* User Flow */}
              {project.userFlow?.length > 0 && (
                <div style={{ background: '#fafaf9', border: '1px solid #e5e7eb', padding: '24px', borderRadius: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.05rem', fontWeight: 800, color: '#111827', marginBottom: '16px' }}>
                    <Workflow size={18} color="#06b6d4" /> User Interaction Lifecycle
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {project.userFlow.map((step: string, sIdx: number) => (
                      <div key={sIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '0.9rem', color: '#374151' }}>
                        <span style={{ background: '#06b6d4', color: '#ffffff', fontSize: '0.75rem', fontWeight: 800, borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                          {sIdx + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Code Flow */}
              {project.codeFlow?.length > 0 && (
                <div style={{ background: '#fafaf9', border: '1px solid #e5e7eb', padding: '24px', borderRadius: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.05rem', fontWeight: 800, color: '#111827', marginBottom: '16px' }}>
                    <Activity size={18} color="#8b5cf6" /> Code Execution Pipeline
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {project.codeFlow.map((step: string, sIdx: number) => (
                      <div key={sIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '0.9rem', color: '#374151' }}>
                        <span style={{ background: '#8b5cf6', color: '#ffffff', fontSize: '0.75rem', fontWeight: 800, borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                          {sIdx + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ==================================================================== */}
        {/* SECTION 4: VERIFIED TECH STACK BENTO GRID */}
        {/* ==================================================================== */}
        <section id="techstack" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '24px', padding: '36px', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.8rem', color: '#e0533c', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>03. CODEBASE EVIDENCE</span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', marginTop: '4px', marginBottom: '20px' }}>Verified Technology Stack Breakdown</h2>

          {project.techStackBreakdown && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              {Object.entries(project.techStackBreakdown).map(([categoryKey, techItems]: [string, any]) => {
                if (!Array.isArray(techItems) || techItems.length === 0) return null;
                return (
                  <div key={categoryKey} style={{ background: '#fafaf9', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '20px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em', marginBottom: '10px' }}>
                      {categoryKey}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {techItems.map((tech: string) => (
                        <span key={tech} className="badge badge-mint" style={{ fontSize: '0.8rem', background: '#ffffff' }}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ==================================================================== */}
        {/* SECTION 5: ENGINEERING ACCOMPLISHMENTS */}
        {/* ==================================================================== */}
        <section id="accomplishments" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '24px', padding: '36px', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.8rem', color: '#e0533c', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>04. ENGINEERING IMPACT</span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', marginTop: '4px', marginBottom: '20px' }}>Key Engineering Accomplishments</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {(project.myContributions || []).map((contribution: string, idx: number) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', background: '#fafaf9', border: '1px solid #e5e7eb', padding: '18px 24px', borderRadius: '16px' }}>
                <CheckCircle2 size={22} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span style={{ color: '#111827', fontSize: '1.05rem', lineHeight: 1.5, fontWeight: 500 }}>{contribution}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 6: EXPOSED REST API ENDPOINTS MATRIX */}
        {/* ==================================================================== */}
        <section id="api-endpoints" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '24px', padding: '36px', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.8rem', color: '#e0533c', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>05. API MATRIX</span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', marginTop: '4px', marginBottom: '20px' }}>
            Exposed REST API Endpoints & Routes ({(project.apiEndpoints || []).length})
          </h2>

          {project.apiEndpoints && project.apiEndpoints.length > 0 ? (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '16px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                <thead>
                  <tr style={{ background: '#fafaf9', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '14px 20px', width: '120px' }}>Method</th>
                    <th style={{ padding: '14px 20px', width: '280px' }}>Route Path</th>
                    <th style={{ padding: '14px 20px' }}>Description / Contract</th>
                  </tr>
                </thead>
                <tbody>
                  {project.apiEndpoints.map((ep: any, idx: number) => {
                    const style = getMethodBadgeStyle(ep.method);
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6', color: '#374151' }}>
                        <td style={{ padding: '14px 20px' }}>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontFamily: 'monospace',
                              fontWeight: 800,
                              background: style.bg,
                              color: style.color,
                              border: `1px solid ${style.border}`,
                            }}
                          >
                            {ep.method}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px', fontFamily: 'monospace', fontWeight: 700, color: '#111827' }}>{ep.path}</td>
                        <td style={{ padding: '14px 20px', color: '#4b5563' }}>{ep.description}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>No explicit HTTP REST endpoints detected in AST traversal.</p>
          )}
        </section>

        {/* ==================================================================== */}
        {/* SECTION 7: CORE MODULES BENTO GRID */}
        {/* ==================================================================== */}
        <section id="modules" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '24px', padding: '36px', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.8rem', color: '#e0533c', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>06. REPOSITORY STRUCTURE</span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', marginTop: '4px', marginBottom: '20px' }}>
            Core Repository Modules & File Paths
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {(project.keyModules || []).map((mod: any, idx: number) => (
              <div key={idx} style={{ background: '#fafaf9', border: '1px solid #e5e7eb', padding: '24px', borderRadius: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Cpu size={20} color="#ff7e5f" />
                  <h3 style={{ fontSize: '1.15rem', color: '#111827', fontWeight: 800 }}>{mod.name}</h3>
                </div>
                <code style={{ fontSize: '0.85rem', color: '#e0533c', display: 'block', marginTop: '8px', fontFamily: 'monospace', fontWeight: 600 }}>
                  {mod.path}
                </code>
                <p style={{ fontSize: '0.95rem', color: '#4b5563', marginTop: '10px', lineHeight: 1.6 }}>{mod.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 8: CHALLENGES, LEARNINGS & ROADMAP (3-COLUMN BENTO) */}
        {/* ==================================================================== */}
        <section id="roadmap" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '24px', padding: '36px', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.8rem', color: '#e0533c', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>07. ENGINEERING RETROSPECTIVE</span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', marginTop: '4px', marginBottom: '24px' }}>
            Challenges, Architectural Learnings & Roadmap
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {/* Column 1: Challenges */}
            <div style={{ background: 'rgba(245, 158, 11, 0.04)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '24px', borderRadius: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontWeight: 800, fontSize: '1.1rem', marginBottom: '16px' }}>
                <AlertTriangle size={20} color="#f59e0b" /> Challenges & Trade-offs
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(project.challenges || []).map((c: string, idx: number) => (
                  <div key={idx} style={{ color: '#92400e', fontSize: '0.95rem', lineHeight: 1.5, padding: '10px 14px', background: '#ffffff', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    {c}
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Learnings */}
            <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '24px', borderRadius: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', fontWeight: 800, fontSize: '1.1rem', marginBottom: '16px' }}>
                <Lightbulb size={20} color="#10b981" /> Architectural Learnings
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(project.learnings || []).map((l: string, idx: number) => (
                  <div key={idx} style={{ color: '#065f46', fontSize: '0.95rem', lineHeight: 1.5, padding: '10px 14px', background: '#ffffff', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    {l}
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Roadmap */}
            <div style={{ background: 'rgba(139, 92, 246, 0.04)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '24px', borderRadius: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6d28d9', fontWeight: 800, fontSize: '1.1rem', marginBottom: '16px' }}>
                <MapPin size={20} color="#8b5cf6" /> Future Roadmap Items
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(project.futureRoadmap || []).map((r: string, idx: number) => (
                  <div key={idx} style={{ color: '#5b21b6', fontSize: '0.95rem', lineHeight: 1.5, padding: '10px 14px', background: '#ffffff', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                    {r}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* SECTION 9: MEDIA ASSETS STUDIO BENTO GRID */}
        {/* ==================================================================== */}
        <section id="media-studio" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '24px', padding: '36px', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#e0533c', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>08. GENERATED MEDIA ASSETS</span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', marginTop: '4px' }}>OpenGraph Card & Remotion Studio</h2>
            </div>
            <button className="btn-fruity-primary" onClick={() => setShowVideoModal(true)}>
              <Play size={16} /> Open Remotion Reel Studio
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
            <ThumbnailPreview project={project} />
          </div>
        </section>

      </div>

      {/* REMOTION VIDEO PREVIEW MODAL */}
      {showVideoModal && <VideoPreviewModal project={project} onClose={() => setShowVideoModal(false)} />}
    </div>
  );
};
