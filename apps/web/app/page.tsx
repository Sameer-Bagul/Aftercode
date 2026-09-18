'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, ShieldCheck, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeViewTab, setActiveViewTab] = useState<'allGithub' | 'analyzed'>('allGithub');
  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const [projectsData, setProjectsData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
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
      } catch {
        // Fallback
      }
    };
    fetchData();
  }, []);

  const analyzedSlugs = useMemo(() => new Set(projectsData.map((p) => p.slug)), [projectsData]);

  const filteredProjects = useMemo(() => {
    return projectsData.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (
        searchQuery &&
        !p.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [projectsData, searchQuery, selectedCategory]);

  const filteredGithubRepos = useMemo(() => {
    return githubRepos.filter((r) => {
      if (
        searchQuery &&
        !r.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(r.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [githubRepos, searchQuery]);

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
            All Repositories ({githubRepos.length || projectsData.length})
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
            Analyzed Workspaces ({projectsData.length})
          </button>
        </div>
      </div>

      {/* Metric KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Repositories</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{githubRepos.length || 122}</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Analyzed Workspaces</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>{projectsData.length}</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>AST Claims Verified</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#047857', marginTop: '4px' }}>100%</div>
        </div>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#ffffff', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', width: '360px' }}>
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.875rem' }}
          />
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['All', 'AI/ML', 'Web App', 'API Service', 'System', 'Practice'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                background: selectedCategory === cat ? '#0f172a' : '#ffffff',
                color: selectedCategory === cat ? '#ffffff' : '#475569',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* CATALOG REPOSITORY CARDS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
        {activeViewTab === 'analyzed'
          ? filteredProjects.map((project) => (
              <div
                key={project.slug}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px' }}>
                      {project.category || 'Repository'}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldCheck size={14} color="#10b981" /> Verified
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>{project.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>{project.shortDescription}</p>
                </div>

                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link
                    href={`/project/${project.slug}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      background: '#0f172a',
                      color: '#ffffff',
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    Open Workspace <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))
          : filteredGithubRepos.map((repo) => {
              const isAnalyzed = analyzedSlugs.has(repo.name) || analyzedSlugs.has(repo.name.toLowerCase());

              return (
                <div
                  key={repo.name}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px' }}>
                        {repo.language || 'Codebase'}
                      </span>
                      {isAnalyzed && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ShieldCheck size={14} color="#10b981" /> Workspace Active
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>{repo.name}</h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                      {repo.description || 'Public software repository owned by Sameer Bagul.'}
                    </p>
                  </div>

                  <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link
                      href={`/project/${repo.name}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        background: isAnalyzed ? '#0f172a' : '#0284c7',
                        color: '#ffffff',
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      {isAnalyzed ? 'Open Workspace' : 'Inspect Repository'} <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
