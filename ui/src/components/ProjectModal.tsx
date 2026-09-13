import React, { useState } from 'react';
import { X, ExternalLink, Github, Cpu, Layers, Server, ShieldCheck, CheckCircle2, AlertTriangle, Lightbulb, MapPin, Play, Image, Zap, Film } from 'lucide-react';
import { MermaidViewer } from './MermaidViewer';
import { ThumbnailPreview } from './ThumbnailPreview';
import { VideoPreviewModal } from './VideoPreviewModal';

interface ProjectModalProps {
  project: any;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'thumbnail' | 'contributions' | 'endpoints' | 'modules' | 'roadmap'>('architecture');
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);

  if (!project) return null;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(31, 41, 55, 0.7)',
          backdropFilter: 'blur(12px)',
          zIndex: 1000,
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
            maxWidth: '1020px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e5e7eb',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ padding: '24px 32px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafaf9' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827' }}>{project.title}</h2>
                <span className="badge badge-peach">{project.category || 'General'}</span>
              </div>
              <p style={{ color: '#4b5563', marginTop: '4px', fontSize: '0.95rem' }}>{project.shortDescription}</p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                color: '#4b5563',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Action Toolbar */}
          <div style={{ padding: '12px 32px', background: '#fffaf8', borderBottom: '1px solid rgba(255, 126, 95, 0.15)', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e0533c', textTransform: 'uppercase', marginRight: '8px' }}>Action Controls:</span>
            <button className="btn-fruity-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => alert('Metadata generation triggered for ' + project.title)}>
              <Zap size={14} color="#ff7e5f" /> Generate Metadata
            </button>
            <button className="btn-fruity-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => setActiveTab('thumbnail')}>
              <Image size={14} color="#10b981" /> Generate Thumbnail
            </button>
            <button className="btn-fruity-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => setShowVideoModal(true)}>
              <Film size={14} color="#8b5cf6" /> Generate Video
            </button>
            <button className="btn-fruity-primary" style={{ padding: '6px 16px', fontSize: '0.8rem' }} onClick={() => setShowVideoModal(true)}>
              <Play size={14} /> Preview Remotion Video
            </button>
          </div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '8px', padding: '12px 32px', background: '#fafaf9', borderBottom: '1px solid #f3f4f6', overflowX: 'auto' }}>
            {[
              { id: 'architecture', label: 'Architecture Topology', icon: Layers },
              { id: 'thumbnail', label: 'Thumbnail Cover', icon: Image },
              { id: 'contributions', label: 'Accomplishments', icon: ShieldCheck },
              { id: 'endpoints', label: `API Endpoints (${(project.apiEndpoints || []).length})`, icon: Server },
              { id: 'modules', label: `Key Modules (${(project.keyModules || []).length})`, icon: Cpu },
              { id: 'roadmap', label: 'Roadmap & Learnings', icon: MapPin },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    background: isActive ? '#ff7e5f' : 'transparent',
                    color: isActive ? '#ffffff' : '#4b5563',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Scrollable Content Body */}
          <div style={{ padding: '32px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* TAB 1: ARCHITECTURE TOPOLOGY */}
            {activeTab === 'architecture' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {project.architectureDiagram && (
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: '#111827', marginBottom: '12px', fontWeight: 700 }}>Multi-Tier System Topology</h3>
                    <MermaidViewer chart={project.architectureDiagram} id={project.slug} />
                  </div>
                )}

                <div>
                  <h3 style={{ fontSize: '1.1rem', color: '#111827', marginBottom: '8px', fontWeight: 700 }}>System Overview</h3>
                  <p style={{ color: '#374151', lineHeight: 1.7, fontSize: '0.95rem', whiteSpace: 'pre-line' }}>{project.description}</p>
                </div>

                {/* Tech Stack Breakdown */}
                {project.techStackBreakdown && (
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: '#111827', marginBottom: '12px', fontWeight: 700 }}>Tech Stack Breakdown</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      {Object.entries(project.techStackBreakdown).map(([key, items]: [string, any]) => {
                        if (!Array.isArray(items) || items.length === 0) return null;
                        return (
                          <div key={key} style={{ background: '#fafaf9', border: '1px solid #e5e7eb', padding: '14px', borderRadius: '12px' }}>
                            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: 700, letterSpacing: '0.05em' }}>{key}</span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                              {items.map((tech: string) => (
                                <span key={tech} className="badge badge-mint" style={{ fontSize: '0.7rem', background: '#ffffff' }}>
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: THUMBNAIL COVER */}
            {activeTab === 'thumbnail' && (
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#111827', marginBottom: '16px', fontWeight: 700 }}>Generated OpenGraph Portfolio Card</h3>
                <ThumbnailPreview project={project} />
              </div>
            )}

            {/* TAB 2: TECHNICAL ACCOMPLISHMENTS */}
            {activeTab === 'contributions' && (
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#111827', marginBottom: '16px', fontWeight: 700 }}>Engineering Accomplishments</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(project.myContributions || []).map((item: string, idx: number) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: '#fafaf9', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                      <CheckCircle2 size={18} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span style={{ color: '#374151', fontSize: '0.95rem' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: API ENDPOINTS MATRIX */}
            {activeTab === 'endpoints' && (
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#111827', marginBottom: '16px', fontWeight: 700 }}>Exposed API Endpoints & Routes</h3>
                {project.apiEndpoints && project.apiEndpoints.length > 0 ? (
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: '14px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ background: '#fafaf9', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
                          <th style={{ padding: '12px 16px' }}>Method</th>
                          <th style={{ padding: '12px 16px' }}>Route Path</th>
                          <th style={{ padding: '12px 16px' }}>Source / Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {project.apiEndpoints.map((ep: any, idx: number) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6', color: '#374151' }}>
                            <td style={{ padding: '12px 16px' }}>
                              <span className="badge badge-sky" style={{ fontFamily: 'monospace' }}>
                                {ep.method}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 600, color: '#111827' }}>{ep.path}</td>
                            <td style={{ padding: '12px 16px', color: '#6b7280' }}>{ep.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: '#6b7280' }}>No explicit HTTP/REST API endpoints detected in codebase analysis.</p>
                )}
              </div>
            )}

            {/* TAB 4: KEY MODULES */}
            {activeTab === 'modules' && (
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#111827', marginBottom: '16px', fontWeight: 700 }}>Core Repository Modules</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {(project.keyModules || []).map((mod: any, idx: number) => (
                    <div key={idx} style={{ background: '#fafaf9', border: '1px solid #e5e7eb', padding: '16px', borderRadius: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Cpu size={18} color="#ff7e5f" />
                        <h4 style={{ fontSize: '1rem', color: '#111827', fontWeight: 700 }}>{mod.name}</h4>
                      </div>
                      <code style={{ fontSize: '0.8rem', color: '#e0533c', display: 'block', marginTop: '6px', fontFamily: 'monospace' }}>{mod.path}</code>
                      <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '8px' }}>{mod.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: ROADMAP & LEARNINGS */}
            {activeTab === 'roadmap' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: '#111827', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                    <AlertTriangle size={18} color="#f59e0b" /> Engineering Challenges & Trade-offs
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(project.challenges || []).map((c: string, idx: number) => (
                      <div key={idx} style={{ padding: '12px 16px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '10px', color: '#b45309', fontSize: '0.9rem' }}>
                        {c}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.1rem', color: '#111827', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                    <Lightbulb size={18} color="#10b981" /> Architectural Learnings
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(project.learnings || []).map((l: string, idx: number) => (
                      <div key={idx} style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '10px', color: '#047857', fontSize: '0.9rem' }}>
                        {l}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.1rem', color: '#111827', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                    <MapPin size={18} color="#8b5cf6" /> Future Roadmap Items
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(project.futureRoadmap || []).map((r: string, idx: number) => (
                      <div key={idx} style={{ padding: '12px 16px', background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '10px', color: '#6d28d9', fontSize: '0.9rem' }}>
                        {r}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '20px 32px', background: '#fafaf9', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-fruity-secondary"
                  style={{ textDecoration: 'none' }}
                >
                  <Github size={16} /> GitHub Repository
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-fruity-primary"
                  style={{ textDecoration: 'none' }}
                >
                  <ExternalLink size={16} /> Live Demo
                </a>
              )}
            </div>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Generated by Aftercode Engine</span>
          </div>
        </div>
      </div>

      {/* Remotion Video Preview Modal */}
      {showVideoModal && <VideoPreviewModal project={project} onClose={() => setShowVideoModal(false)} />}
    </>
  );
};
