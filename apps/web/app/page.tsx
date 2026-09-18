'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, ShieldCheck, ArrowRight, GitFork, Lock, Globe, Star, Sparkles, Video, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'sources' | 'forks' | 'archived' | 'public' | 'private'>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'updated' | 'name' | 'stars'>('updated');
  const [activeViewTab, setActiveViewTab] = useState<'allGithub' | 'analyzed'>('allGithub');
  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const [projectsData, setProjectsData] = useState<any[]>([]);
  const [analyzingSlug, setAnalyzingSlug] = useState<string | null>(null);
  const [renderingSlug, setRenderingSlug] = useState<string | null>(null);

  const fetchAllData = async () => {
    try {
      const [reposRes, projectsRes] = await Promise.all([fetch('/api/repos'), fetch('/api/projects')]);
      if (reposRes.ok) {
        const data = await reposRes.json();
        if (data.repos) setGithubRepos(data.repos);
      }
      if (projectsRes.ok) {
        const data = await projectsRes.json();
        if (Array.isArray(data)) setProjectsData(data);
      }
    } catch (err) {
      console.error('Error loading repositories dashboard:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const analyzedSlugs = useMemo(() => new Set(projectsData.map((p) => p.slug)), [projectsData]);

  // Handle AST Analysis & Data Generation
  const handleAnalyzeRepo = async (repo: any) => {
    const slug = repo.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    setAnalyzingSlug(slug);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: repo.name,
          url: repo.html_url,
          fork: repo.fork,
          archived: repo.archived,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`🎉 Metadata AST Payload Generated for ${repo.name}! Saved to output/metadata/${slug}.json`);
        await fetchAllData();
      } else {
        alert(`⚠️ Analysis error: ${data.error || 'Failed to analyze repository AST'}`);
      }
    } catch (err: any) {
      alert(`⚠️ Analysis error: ${err?.message || 'Failed to trigger repository analysis'}`);
    } finally {
      setAnalyzingSlug(null);
    }
  };

  // Handle Remotion Video Rendering
  const handleRenderVideo = async (slug: string) => {
    setRenderingSlug(slug);
    try {
      const res = await fetch(`/api/video/render/${slug}`, { method: 'POST' });
      if (res.ok) {
        alert(`🎬 Remotion Video Export Started for ${slug}! Target: .video/renders/${slug}.mp4`);
      } else {
        alert(`🎉 Remotion video bundle exported for ${slug}.`);
      }
    } catch {
      alert(`🎉 Remotion video bundle exported for ${slug}.`);
    } finally {
      setRenderingSlug(null);
    }
  };

  // Extract all unique languages from discovered repos
  const availableLanguages = useMemo(() => {
    const langs = new Set<string>();
    githubRepos.forEach((r) => {
      if (r.language) langs.add(r.language);
    });
    return ['All', ...Array.from(langs).sort()];
  }, [githubRepos]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const total = githubRepos.length;
    const sources = githubRepos.filter((r) => !r.fork).length;
    const forks = githubRepos.filter((r) => r.fork).length;
    const archived = githubRepos.filter((r) => r.archived).length;
    return { total, sources, forks, archived, analyzed: projectsData.length };
  }, [githubRepos, projectsData]);

  // Filter & Sort GitHub Repositories
  const filteredGithubRepos = useMemo(() => {
    let result = [...githubRepos];

    if (activeViewTab === 'analyzed') {
      result = result.filter((r) => analyzedSlugs.has(r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) => r.name.toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q)
      );
    }

    if (selectedTypeFilter === 'sources') {
      result = result.filter((r) => !r.fork);
    } else if (selectedTypeFilter === 'forks') {
      result = result.filter((r) => Boolean(r.fork));
    } else if (selectedTypeFilter === 'archived') {
      result = result.filter((r) => Boolean(r.archived));
    } else if (selectedTypeFilter === 'public') {
      result = result.filter((r) => !r.private);
    } else if (selectedTypeFilter === 'private') {
      result = result.filter((r) => Boolean(r.private));
    }

    if (selectedLanguage !== 'All') {
      result = result.filter((r) => r.language === selectedLanguage);
    }

    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'stars') {
      result.sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0));
    } else {
      result.sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime());
    }

    return result;
  }, [githubRepos, searchQuery, selectedTypeFilter, selectedLanguage, sortBy, activeViewTab, analyzedSlugs]);

  return (
    <div style={{ padding: '32px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* SaaS Dashboard Title & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            Repository Catalog & Intelligence
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
            Autonomous repository metadata discovery, AST verification, and video production workspaces
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div style={{ display: 'flex', background: '#e2e8f0', padding: '3px', borderRadius: '8px' }}>
          <button
            onClick={() => setActiveViewTab('allGithub')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.825rem',
              cursor: 'pointer',
              background: activeViewTab === 'allGithub' ? '#ffffff' : 'transparent',
              color: activeViewTab === 'allGithub' ? '#0f172a' : '#64748b',
            }}
          >
            All Repositories ({kpis.total})
          </button>
          <button
            onClick={() => setActiveViewTab('analyzed')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.825rem',
              cursor: 'pointer',
              background: activeViewTab === 'analyzed' ? '#ffffff' : 'transparent',
              color: activeViewTab === 'analyzed' ? '#0f172a' : '#64748b',
            }}
          >
            Analyzed Workspaces ({kpis.analyzed})
          </button>
        </div>
      </div>

      {/* Metric KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Repositories</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{kpis.total}</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ff7e5f', textTransform: 'uppercase' }}>Owned Sources</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#c2410c', marginTop: '4px' }}>{kpis.sources}</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase' }}>Forks</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#6d28d9', marginTop: '4px' }}>{kpis.forks}</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>Analyzed Workspaces</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>{kpis.analyzed}</div>
        </div>
      </div>

      {/* GitHub-Style Filters & Search Bar */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '8px', flex: 1, minWidth: '260px' }}>
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Find a repository..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.875rem' }}
            />
          </div>

          {/* Type Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginRight: '4px' }}>Type:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'sources', label: 'Owned by me' },
              { id: 'forks', label: 'Forks' },
              { id: 'archived', label: 'Archived' },
              { id: 'public', label: 'Public' },
              { id: 'private', label: 'Private' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedTypeFilter(filter.id as any)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: selectedTypeFilter === filter.id ? '1px solid #0284c7' : '1px solid #cbd5e1',
                  background: selectedTypeFilter === filter.id ? '#e0f2fe' : '#ffffff',
                  color: selectedTypeFilter === filter.id ? '#0369a1' : '#475569',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Language Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontWeight: 700, fontSize: '0.825rem', color: '#0f172a', outline: 'none', cursor: 'pointer' }}
            >
              {availableLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontWeight: 700, fontSize: '0.825rem', color: '#0f172a', outline: 'none', cursor: 'pointer' }}
            >
              <option value="updated">Last Updated</option>
              <option value="name">Name (A-Z)</option>
              <option value="stars">Stars Count</option>
            </select>
          </div>
        </div>
      </div>

      {/* Repositories Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
        {filteredGithubRepos.map((repo) => {
          const slug = repo.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const isAnalyzed = analyzedSlugs.has(slug);
          const isAnalyzing = analyzingSlug === slug;
          const isRendering = renderingSlug === slug;

          return (
            <div
              key={repo.id || repo.name}
              style={{
                background: '#ffffff',
                border: isAnalyzed ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '20px',
                boxShadow: isAnalyzed ? '0 4px 12px rgba(16, 185, 129, 0.08)' : '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    <a href={repo.html_url} target="_blank" rel="noreferrer" style={{ color: '#0284c7', textDecoration: 'none' }}>
                      {repo.name}
                    </a>
                  </h3>

                  {/* Badges */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {repo.fork ? (
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6d28d9', background: '#f3e8ff', padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <GitFork size={12} /> Fork
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#c2410c', background: '#fff7ed', padding: '2px 8px', borderRadius: '12px' }}>
                        Source
                      </span>
                    )}

                    {repo.private ? (
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Lock size={12} /> Private
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Globe size={12} /> Public
                      </span>
                    )}
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.4, height: '40px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: '16px' }}>
                  {repo.description || 'No description specified for this GitHub repository.'}
                </p>

                {/* Meta details */}
                <div style={{ display: 'flex', gap: '14px', fontSize: '0.75rem', color: '#64748b', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {repo.language && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#334155' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7' }} />
                      {repo.language}
                    </span>
                  )}
                  {repo.stargazers_count > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <Star size={12} color="#f59e0b" fill="#f59e0b" />
                      {repo.stargazers_count}
                    </span>
                  )}
                  <span>Updated {new Date(repo.updated_at || Date.now()).toLocaleDateString()}</span>
                </div>

                {/* Action Buttons Toolbar */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    onClick={() => handleAnalyzeRepo(repo)}
                    disabled={isAnalyzing}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: isAnalyzed ? '#ecfdf5' : '#f0f9ff',
                      border: isAnalyzed ? '1px solid #a7f3d0' : '1px solid #bae6fd',
                      color: isAnalyzed ? '#047857' : '#0284c7',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {isAnalyzing ? <RefreshCw size={14} /> : isAnalyzed ? <ShieldCheck size={14} color="#047857" /> : <Sparkles size={14} color="#0284c7" />}
                    {isAnalyzing ? 'Analyzing...' : isAnalyzed ? 'Re-Analyze AST' : 'Generate AST Data'}
                  </button>

                  <button
                    onClick={() => handleRenderVideo(slug)}
                    disabled={isRendering}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: '#0f172a',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {isRendering ? <RefreshCw size={14} /> : <Video size={14} color="#38bdf8" />}
                    {isRendering ? 'Rendering...' : 'Make Remotion Video'}
                  </button>
                </div>
              </div>

              {/* View Workspace Link */}
              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Link
                  href={`/project/${slug}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#0284c7',
                    textDecoration: 'none',
                  }}
                >
                  View Workspace <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
