'use client';

import React, { useState, useEffect } from 'react';
import { FolderGit2, Image as ImageIcon, FileCode, Video, Search, Download } from 'lucide-react';

export default function AssetLibraryPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'diagrams' | 'audio' | 'video'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects');
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (err) {
        console.error('Failed to fetch projects for Asset Library:', err);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <FolderGit2 size={20} color="#0284c7" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Asset & Media Repository
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Asset Library
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '4px' }}>
              Extracted SVG architecture diagrams, local TTS narration audio buffers, and rendered Remotion MP4 showcases.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveFilter('all')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: activeFilter === 'all' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                background: activeFilter === 'all' ? '#f0f9ff' : '#ffffff',
                color: activeFilter === 'all' ? '#0284c7' : '#334155',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              All Assets
            </button>
            <button
              onClick={() => setActiveFilter('diagrams')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: activeFilter === 'diagrams' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                background: activeFilter === 'diagrams' ? '#f0f9ff' : '#ffffff',
                color: activeFilter === 'diagrams' ? '#0284c7' : '#334155',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Diagrams & SVGs
            </button>
            <button
              onClick={() => setActiveFilter('audio')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: activeFilter === 'audio' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                background: activeFilter === 'audio' ? '#f0f9ff' : '#ffffff',
                color: activeFilter === 'audio' ? '#0284c7' : '#334155',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Audio Voiceovers
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '24px', maxWidth: '480px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search assets by repository name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '0.875rem',
              outline: 'none',
              background: '#ffffff',
            }}
          />
        </div>

        {/* Asset Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {projects.map((proj) => (
            <div
              key={proj.slug}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '4px 10px', borderRadius: '12px' }}>
                    {proj.slug}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>4 Assets</span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>{proj.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.4, marginBottom: '16px' }}>
                  {proj.shortDescription}
                </p>

                {/* Asset Checklist List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#334155' }}>
                    <ImageIcon size={14} color="#0284c7" />
                    <span style={{ fontWeight: 600 }}>Architecture SVG Diagram</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#334155' }}>
                    <FileCode size={14} color="#10b981" />
                    <span style={{ fontWeight: 600 }}>Remotion Script Config (JSON)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#334155' }}>
                    <Video size={14} color="#8b5cf6" />
                    <span style={{ fontWeight: 600 }}>Rendered MP4 Showcase Video</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                <a
                  href={`/api/projects`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#0284c7',
                    textDecoration: 'none',
                  }}
                >
                  <Download size={14} /> Download Package
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
