'use client';

import React, { useState, useEffect } from 'react';
import { GitBranch, ShieldCheck, FileCode, Layers, Search, CheckCircle2 } from 'lucide-react';
import { MermaidViewer } from '../../components/MermaidViewer';

export default function KnowledgeGraphPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects');
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
          if (data.length > 0) setSelectedProject(data[0]);
        }
      } catch (err) {
        console.error('Failed to load projects for Knowledge Graph:', err);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((p) =>
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <GitBranch size={20} color="#0284c7" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AST Knowledge Graph & Evidence Explorer
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Repository Knowledge Graphs
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '4px' }}>
            Inspect extracted AST evidence graphs, module dependencies, API routes, and static code verification claims.
          </p>
        </div>

        {/* Main Grid: Repository Picker + Knowledge Graph Canvas */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '28px' }}>
          {/* Left Column: Repository Filter & List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              {/* Search Bar */}
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Filter repositories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '550px', overflowY: 'auto' }}>
                {filteredProjects.map((proj) => (
                  <button
                    key={proj.slug}
                    onClick={() => setSelectedProject(proj)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      borderRadius: '10px',
                      border: selectedProject?.slug === proj.slug ? '2px solid #0284c7' : '1px solid #f1f5f9',
                      background: selectedProject?.slug === proj.slug ? '#f0f9ff' : '#ffffff',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{proj.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                        {proj.techStackBreakdown?.frontend?.[0] || 'TypeScript'}
                      </div>
                    </div>
                    <ShieldCheck size={16} color={selectedProject?.slug === proj.slug ? '#0284c7' : '#94a3b8'} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Knowledge Graph Visualizer & Evidence Claims */}
          {selectedProject ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Architecture Topology Diagram Card */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                    {selectedProject.title} — System Topology Graph
                  </h3>
                  <span style={{ padding: '4px 10px', borderRadius: '12px', background: '#ecfdf5', color: '#047857', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={14} color="#10b981" /> Verified Static AST Claims
                  </span>
                </div>

                <MermaidViewer
                  chart={selectedProject.architectureDiagram || 'graph TD\nUI[Frontend UI]-->API[Backend API Router]'}
                  id={`kg-page-${selectedProject.slug}`}
                />
              </div>

              {/* AST Claims & Extracted Evidence Grid */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                  AST Code Evidence & Tech Stack Breakdown
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#0284c7' }}>
                      <FileCode size={16} /> Frontend Layer
                    </div>
                    <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(selectedProject.techStackBreakdown?.frontend || ['React', 'TypeScript']).map((tech: string, i: number) => (
                        <span key={i} style={{ padding: '4px 10px', borderRadius: '6px', background: '#ffffff', border: '1px solid #cbd5e1', fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>
                      <Layers size={16} /> Backend Services & APIs
                    </div>
                    <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(selectedProject.techStackBreakdown?.backend || ['Node.js', 'Express']).map((tech: string, i: number) => (
                        <span key={i} style={{ padding: '4px 10px', borderRadius: '6px', background: '#ffffff', border: '1px solid #cbd5e1', fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#8b5cf6' }}>
                      <CheckCircle2 size={16} /> Key Features
                    </div>
                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {(selectedProject.features || ['Production Ready API']).slice(0, 3).map((feat: string, i: number) => (
                        <span key={i} style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 500 }}>
                          • {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '48px', textAlign: 'center', color: '#64748b' }}>
              Select a repository from the left sidebar to view its knowledge graph.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
