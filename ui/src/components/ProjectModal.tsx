import React, { useState } from 'react';
import { X, ExternalLink, Github, Cpu, Layers, Server, ShieldCheck, CheckCircle2, AlertTriangle, Lightbulb, MapPin } from 'lucide-react';
import { MermaidViewer } from './MermaidViewer';

interface ProjectModalProps {
  project: any;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'contributions' | 'endpoints' | 'modules' | 'roadmap'>('architecture');

  if (!project) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 8, 15, 0.85)',
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
          backgroundColor: '#111827',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(17, 24, 39, 0.9)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f9fafb' }}>{project.title}</h2>
              <span className="badge badge-primary">{project.category || 'General'}</span>
            </div>
            <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '0.95rem' }}>{project.shortDescription}</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: '#9ca3af',
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

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', padding: '12px 32px', background: '#0b0f19', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
          {[
            { id: 'architecture', label: 'Architecture Topology', icon: Layers },
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
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isActive ? '#6366f1' : 'transparent',
                  color: isActive ? '#ffffff' : '#9ca3af',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Content Body */}
        <div style={{ padding: '32px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* TAB 1: ARCHITECTURE TOPOLOGY */}
          {activeTab === 'architecture' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {project.architectureDiagram && (
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: '#f3f4f6', marginBottom: '12px' }}>Multi-Tier System Topology</h3>
                  <MermaidViewer chart={project.architectureDiagram} id={project.slug} />
                </div>
              )}

              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#f3f4f6', marginBottom: '8px' }}>System Overview</h3>
                <p style={{ color: '#d1d5db', lineHeight: 1.7, fontSize: '0.95rem', whiteSpace: 'pre-line' }}>{project.description}</p>
              </div>

              {/* Tech Stack Breakdown */}
              {project.techStackBreakdown && (
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: '#f3f4f6', marginBottom: '12px' }}>Tech Stack Breakdown</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {Object.entries(project.techStackBreakdown).map(([key, items]: [string, any]) => {
                      if (!Array.isArray(items) || items.length === 0) return null;
                      return (
                        <div key={key} style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '14px', borderRadius: '12px' }}>
                          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 700, letterSpacing: '0.05em' }}>{key}</span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                            {items.map((tech: string) => (
                              <span key={tech} className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
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

          {/* TAB 2: TECHNICAL ACCOMPLISHMENTS */}
          {activeTab === 'contributions' && (
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#f3f4f6', marginBottom: '16px' }}>Engineering Accomplishments</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(project.myContributions || []).map((item: string, idx: number) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'rgba(255, 255, 255, 0.02)', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <CheckCircle2 size={18} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ color: '#e5e7eb', fontSize: '0.95rem' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: API ENDPOINTS MATRIX */}
          {activeTab === 'endpoints' && (
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#f3f4f6', marginBottom: '16px' }}>Exposed API Endpoints & Routes</h3>
              {project.apiEndpoints && project.apiEndpoints.length > 0 ? (
                <div style={{ border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: '#0b0f19', color: '#9ca3af', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <th style={{ padding: '12px 16px' }}>Method</th>
                        <th style={{ padding: '12px 16px' }}>Route Path</th>
                        <th style={{ padding: '12px 16px' }}>Source / Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {project.apiEndpoints.map((ep: any, idx: number) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', color: '#d1d5db' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <span className={ep.method === 'GET' ? 'badge badge-emerald' : 'badge badge-cyan'} style={{ fontFamily: 'monospace' }}>
                              {ep.method}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 600, color: '#f3f4f6' }}>{ep.path}</td>
                          <td style={{ padding: '12px 16px', color: '#9ca3af' }}>{ep.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: '#9ca3af' }}>No explicit HTTP/REST API endpoints detected in codebase analysis.</p>
              )}
            </div>
          )}

          {/* TAB 4: KEY MODULES */}
          {activeTab === 'modules' && (
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#f3f4f6', marginBottom: '16px' }}>Core Repository Modules</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {(project.keyModules || []).map((mod: any, idx: number) => (
                  <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '16px', borderRadius: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Cpu size={18} color="#6366f1" />
                      <h4 style={{ fontSize: '1rem', color: '#f9fafb', fontWeight: 700 }}>{mod.name}</h4>
                    </div>
                    <code style={{ fontSize: '0.8rem', color: '#818cf8', display: 'block', marginTop: '6px', fontFamily: 'monospace' }}>{mod.path}</code>
                    <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '8px' }}>{mod.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ROADMAP & LEARNINGS */}
          {activeTab === 'roadmap' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#f3f4f6', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} color="#f59e0b" /> Engineering Challenges & Trade-offs
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(project.challenges || []).map((c: string, idx: number) => (
                    <div key={idx} style={{ padding: '12px 16px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '10px', color: '#fbbf24', fontSize: '0.9rem' }}>
                      {c}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#f3f4f6', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lightbulb size={18} color="#10b981" /> Architectural Learnings
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(project.learnings || []).map((l: string, idx: number) => (
                    <div key={idx} style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '10px', color: '#34d399', fontSize: '0.9rem' }}>
                      {l}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#f3f4f6', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={18} color="#a855f7" /> Future Roadmap Items
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(project.futureRoadmap || []).map((r: string, idx: number) => (
                    <div key={idx} style={{ padding: '12px 16px', background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '10px', color: '#c084fc', fontSize: '0.9rem' }}>
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '20px 32px', background: '#0b0f19', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', color: '#ffffff', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}
              >
                <Github size={16} /> GitHub Repository
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#4f46e5', borderRadius: '10px', color: '#ffffff', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}
              >
                <ExternalLink size={16} /> Live Demo
              </a>
            )}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Generated by Aftercode Engine</span>
        </div>
      </div>
    </div>
  );
};
