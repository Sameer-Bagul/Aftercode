'use client';

import React, { useState, useEffect } from 'react';
import { FolderGit2, Image as ImageIcon, FileCode, Video, Search, Sparkles, Layers, Download, ExternalLink } from 'lucide-react';

export default function AssetLibraryPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'repo' | 'search' | 'napkin'>('repo');

  // Search state
  const [query, setQuery] = useState('react');
  const [imageSource, setImageSource] = useState<'all' | 'iconify' | 'wikimedia' | 'openverse'>('iconify');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Napkin Flowchart state
  const [flowchartTitle, setFlowchartTitle] = useState('Aftercode AI Pipeline');
  const [flowchartType, setFlowchartType] = useState<'mindmap' | 'flowchart' | 'timeline' | 'hierarchy'>('flowchart');
  const [flowchartSvg, setFlowchartSvg] = useState<string | null>(null);
  const [isGeneratingFlowchart, setIsGeneratingFlowchart] = useState(false);

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

  const handleSearchAssets = async () => {
    if (!query) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/assets/search?query=${encodeURIComponent(query)}&source=${imageSource}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch (err) {
      console.error('Failed to search assets:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGenerateFlowchart = async () => {
    setIsGeneratingFlowchart(true);
    try {
      const res = await fetch('/api/diagrams/flowchart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: flowchartTitle,
          type: flowchartType,
          subtitle: `Programmatic Napkin/SVG Architecture (${flowchartType})`,
          nodes: [
            { id: '1', label: 'GitHub Repository', sublabel: 'Source AST Codebase', category: 'frontend' },
            { id: '2', label: 'AST Collector', sublabel: 'Tree-sitter Parser', category: 'backend' },
            { id: '3', label: 'Supertonic 3 TTS', sublabel: '99M Local ONNX Engine', category: 'ai' },
            { id: '4', label: 'GSAP Remotion', sublabel: 'Frame-Accurate Video', category: 'infra' },
          ],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setFlowchartSvg(data.svgContent);
      }
    } catch (err) {
      console.error('Failed to generate Napkin flowchart:', err);
    } finally {
      setIsGeneratingFlowchart(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <FolderGit2 size={20} color="#0284c7" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Asset & Visual Content Hub
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Asset Library & Visual Studio
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '4px' }}>
              Iconify tech logos, Wikimedia photography, Napkin AI flowcharts, and local repository media bundles.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('repo')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: activeTab === 'repo' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                background: activeTab === 'repo' ? '#f0f9ff' : '#ffffff',
                color: activeTab === 'repo' ? '#0284c7' : '#334155',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Repository Bundles
            </button>
            <button
              onClick={() => {
                setActiveTab('search');
                handleSearchAssets();
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: activeTab === 'search' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                background: activeTab === 'search' ? '#f0f9ff' : '#ffffff',
                color: activeTab === 'search' ? '#0284c7' : '#334155',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Iconify & Wikimedia Search
            </button>
            <button
              onClick={() => {
                setActiveTab('napkin');
                if (!flowchartSvg) handleGenerateFlowchart();
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: activeTab === 'napkin' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                background: activeTab === 'napkin' ? '#f0f9ff' : '#ffffff',
                color: activeTab === 'napkin' ? '#0284c7' : '#334155',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Napkin AI Flowcharts
            </button>
          </div>
        </div>

        {/* Tab 1: Repository Bundles */}
        {activeTab === 'repo' && (
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
        )}

        {/* Tab 2: Iconify & Wikimedia Image Search */}
        {activeTab === 'search' && (
          <div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search tech icons (e.g. react, python, postgresql, docker)..."
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 38px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <select
                  value={imageSource}
                  onChange={(e: any) => setImageSource(e.target.value)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    background: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <option value="all">All Providers</option>
                  <option value="iconify">Iconify Tech Logos (SVG)</option>
                  <option value="wikimedia">Wikimedia Commons</option>
                  <option value="openverse">Openverse CC Photos</option>
                </select>

                <button
                  onClick={handleSearchAssets}
                  disabled={isSearching}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '10px',
                    background: '#0284c7',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {/* Results Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {searchResults.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <img src={item.url} alt={item.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ textAlign: 'center', width: '100%' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.title}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: '8px', marginTop: '4px', display: 'inline-block' }}>
                      {item.source}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Napkin AI Flowchart Generator */}
        {activeTab === 'napkin' && (
          <div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={flowchartTitle}
                  onChange={(e) => setFlowchartTitle(e.target.value)}
                  placeholder="Enter Flowchart Title..."
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                  }}
                />
                <button
                  onClick={handleGenerateFlowchart}
                  disabled={isGeneratingFlowchart}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    borderRadius: '10px',
                    background: '#8b5cf6',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  <Sparkles size={16} />
                  {isGeneratingFlowchart ? 'Generating Napkin SVG...' : 'Generate Flowchart'}
                </button>
              </div>
            </div>

            {/* SVG Output Preview */}
            {flowchartSvg && (
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Napkin AI / SVG Rendered Diagram</h3>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8b5cf6', background: '#f3e8ff', padding: '4px 10px', borderRadius: '12px' }}>
                    SVG 1200x650
                  </span>
                </div>
                <div
                  dangerouslySetInnerHTML={{ __html: flowchartSvg }}
                  style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #f1f5f9' }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
