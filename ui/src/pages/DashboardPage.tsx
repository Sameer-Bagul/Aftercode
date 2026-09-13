import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Zap, Server, Sparkles, Filter, ChevronRight, Image, Play, CheckCircle2, Clock, GitBranch, Terminal, RefreshCw, Lock, Globe } from 'lucide-react';
import projectsData from '../data/projects.json';
import { VideoPreviewModal } from '../components/VideoPreviewModal';

export const DashboardPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeViewTab, setActiveViewTab] = useState<'analyzed' | 'allGithub'>('allGithub');
  const [activeVideoProject, setActiveVideoProject] = useState<any | null>(null);

  // Live GitHub state
  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const [isLoadingGithub, setIsLoadingGithub] = useState<boolean>(true);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [visibleRepoCount, setVisibleRepoCount] = useState<number>(30);

  const categories = ['All', 'AI/ML', 'Fullstack', 'TypeScript', 'Python', 'JavaScript', 'DevOps', 'Backend'];

  // Fetch live GitHub repos with pagination up to 500 repos
  const fetchLiveGithubRepos = async () => {
    setIsLoadingGithub(true);
    setGithubError(null);
    try {
      const token = localStorage.getItem('AFTERCODE_GITHUB_PAT') || '';
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let all: any[] = [];
      let page = 1;

      while (page <= 5) {
        const url = token
          ? `https://api.github.com/user/repos?per_page=100&page=${page}&sort=updated`
          : `https://api.github.com/users/Sameer-Bagul/repos?per_page=100&page=${page}&sort=updated`;

        const res = await fetch(url, { headers });
        if (!res.ok) {
          // Fallback to public endpoint if token fails
          if (token && res.status === 401) {
            const fallbackRes = await fetch(`https://api.github.com/users/Sameer-Bagul/repos?per_page=100&page=${page}&sort=updated`);
            if (fallbackRes.ok) {
              const data = await fallbackRes.json();
              if (Array.isArray(data) && data.length > 0) {
                all.push(...data);
                if (data.length < 100) break;
                page++;
                continue;
              }
            }
          }
          break;
        }

        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) break;
        all.push(...data);
        if (data.length < 100) break;
        page++;
      }

      if (all.length > 0) {
        const analyzedSlugs = new Set((projectsData as any[]).map((p) => (p.slug || '').toLowerCase()));
        const mapped = all.map((r) => ({
          name: r.name,
          fullName: r.full_name,
          description: r.description || 'GitHub Repository',
          hasMetadata: analyzedSlugs.has(r.name.toLowerCase()),
          category: r.language || 'Engineering',
          stars: r.stargazers_count,
          forks: r.forks_count,
          visibility: r.visibility || (r.private ? 'private' : 'public'),
          updatedAt: new Date(r.updated_at).toLocaleDateString(),
          htmlUrl: r.html_url,
        }));
        setGithubRepos(mapped);
      }
    } catch (err: any) {
      setGithubError(err.message || 'Failed to fetch repositories from GitHub');
    } finally {
      setIsLoadingGithub(false);
    }
  };

  useEffect(() => {
    fetchLiveGithubRepos();
  }, []);

  // Filtered analyzed projects
  const filteredProjects = useMemo(() => {
    return (projectsData as any[]).filter((p) => {
      const matchesCategory = selectedCategory === 'All' || (p.category || '').toLowerCase() === selectedCategory.toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        p.title.toLowerCase().includes(query) ||
        p.shortDescription.toLowerCase().includes(query) ||
        (p.techStackBreakdown &&
          Object.values(p.techStackBreakdown)
            .flat()
            .some((t: any) => String(t).toLowerCase().includes(query)));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  // Filtered GitHub Repos
  const filteredGithubRepos = useMemo(() => {
    return githubRepos.filter((r) => {
      const matchesCat = selectedCategory === 'All' || (r.category || '').toLowerCase() === selectedCategory.toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch = !query || r.name.toLowerCase().includes(query) || r.description.toLowerCase().includes(query);
      return matchesCat && matchesSearch;
    });
  }, [githubRepos, searchQuery, selectedCategory]);

  // Aggregate Stats
  const stats = useMemo(() => {
    const totalAnalyzed = projectsData.length;
    const totalGithub = githubRepos.length;
    const portfolioWorthy = projectsData.filter((p: any) => p.isFeatured || p.classification?.type === 'portfolio-worthy').length;
    const totalEndpoints = projectsData.reduce((acc: number, p: any) => acc + (p.apiEndpoints || []).length, 0);

    return {
      totalAnalyzed,
      totalGithub,
      portfolioWorthy,
      totalEndpoints,
    };
  }, [githubRepos]);

  return (
    <div style={{ paddingBottom: '64px' }}>
      {/* HERO & STATS BANNER */}
      <section style={{ padding: '40px 40px 24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <div className="badge badge-peach" style={{ marginBottom: '12px' }}>
              <Sparkles size={14} /> Autonomous Portfolio Intelligence & Video Engine
            </div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#111827', lineHeight: 1.2, letterSpacing: '-0.03em' }}>
              Developer Portfolio & Repository Catalog
            </h1>
            <p style={{ color: '#4b5563', fontSize: '1.05rem', marginTop: '8px', maxWidth: '680px' }}>
              Explore AST metadata, multi-tier topologies, OpenGraph thumbnail previews, and programmatic Remotion video reels across all your GitHub repositories.
            </p>
          </div>

          {/* Quick Statistics Grid */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {[
              { label: 'Live GitHub Repos', value: stats.totalGithub || '...', icon: GitBranch, color: '#ff7e5f' },
              { label: 'AST Analyzed Repos', value: stats.totalAnalyzed, icon: CheckCircle2, color: '#10b981' },
              { label: 'Portfolio Worthy', value: stats.portfolioWorthy, icon: Sparkles, color: '#8b5cf6' },
              { label: 'Extracted API Routes', value: stats.totalEndpoints, icon: Server, color: '#06b6d4' },
            ].map((st, idx) => {
              const Icon = st.icon;
              return (
                <div key={idx} style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '16px 20px', minWidth: '150px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    <Icon size={16} color={st.color} /> {st.label}
                  </div>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', display: 'block', marginTop: '4px' }}>{st.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CONTROLS BAR: SEARCH + VIEW TAB SWITCHER + CATEGORY PILLS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            {/* View Switcher (Analyzed vs Available) */}
            <div style={{ display: 'flex', background: '#e5e7eb', padding: '4px', borderRadius: '14px', gap: '4px' }}>
              <button
                onClick={() => setActiveViewTab('allGithub')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeViewTab === 'allGithub' ? '#ffffff' : 'transparent',
                  color: activeViewTab === 'allGithub' ? '#111827' : '#6b7280',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: activeViewTab === 'allGithub' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <GitBranch size={16} color="#ff7e5f" /> All GitHub Repositories ({githubRepos.length})
              </button>

              <button
                onClick={() => setActiveViewTab('analyzed')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeViewTab === 'analyzed' ? '#ffffff' : 'transparent',
                  color: activeViewTab === 'analyzed' ? '#111827' : '#6b7280',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: activeViewTab === 'analyzed' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <CheckCircle2 size={16} color="#10b981" /> Analyzed Repositories ({projectsData.length})
              </button>
            </div>

            {/* Live Refresh & Search Bar */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button className="btn-fruity-secondary" style={{ padding: '8px 12px', fontSize: '0.8rem' }} onClick={fetchLiveGithubRepos} disabled={isLoadingGithub}>
                <RefreshCw size={14} className={isLoadingGithub ? 'spin' : ''} /> {isLoadingGithub ? 'Fetching Repos...' : 'Sync GitHub Repos'}
              </button>

              <div style={{ position: 'relative', width: '320px' }}>
                <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder={`Search all ${githubRepos.length || 230} repos...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 16px 10px 42px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    color: '#111827',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Category Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
            <Filter size={16} color="#6b7280" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '9999px',
                  border: '1px solid',
                  borderColor: selectedCategory === cat ? '#ff7e5f' : '#e5e7eb',
                  background: selectedCategory === cat ? 'linear-gradient(135deg, #ff7e5f, #ff6b6b)' : '#ffffff',
                  color: selectedCategory === cat ? '#ffffff' : '#4b5563',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY MAIN AREA */}
      <main style={{ padding: '0 40px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {activeViewTab === 'analyzed' ? (
          /* TAB 1: ANALYZED REPOSITORIES (WITH METADATA) */
          filteredProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 20px', color: '#6b7280' }}>
              <p style={{ fontSize: '1.1rem' }}>No analyzed projects match your filter query.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
              {filteredProjects.map((project: any) => {
                const frontendTech = project.techStackBreakdown?.frontend || [];
                const backendTech = project.techStackBreakdown?.backend || [];
                const aiTech = project.techStackBreakdown?.aiMl || [];
                const allBadges = Array.from(new Set([...frontendTech, ...backendTech, ...aiTech])).slice(0, 5);

                return (
                  <div key={project._id || project.slug} className="card-glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      {/* Header Badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span className="badge badge-peach">{project.category || 'Engineering'}</span>
                        <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} /> AST Metadata Verified
                        </span>
                      </div>

                      <Link to={`/project/${project.slug}`} style={{ textDecoration: 'none' }}>
                        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>{project.title}</h3>
                      </Link>
                      <p style={{ color: '#4b5563', fontSize: '0.9rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {project.shortDescription || project.description}
                      </p>
                    </div>

                    {/* Tech Badges & Quick Action Controls */}
                    <div style={{ marginTop: '24px', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                        {allBadges.map((b: string) => (
                          <span key={b} className="badge badge-mint" style={{ fontSize: '0.7rem', background: '#fafaf9' }}>
                            {b}
                          </span>
                        ))}
                      </div>

                      {/* Quick Action Button Group */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        <Link to={`/project/${project.slug}`} className="btn-fruity-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', textDecoration: 'none' }}>
                          <Zap size={12} color="#ff7e5f" /> View Metadata
                        </Link>
                        <Link to={`/project/${project.slug}?tab=thumbnail`} className="btn-fruity-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', textDecoration: 'none' }}>
                          <Image size={12} color="#10b981" /> OpenGraph Card
                        </Link>
                        <button className="btn-fruity-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => setActiveVideoProject(project)}>
                          <Play size={12} /> Video Studio
                        </button>
                      </div>

                      <Link to={`/project/${project.slug}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#e0533c', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
                        <span>Inspect Full Topology & Routes</span>
                        <ChevronRight size={18} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* TAB 2: LIVE GITHUB PROFILE REPOSITORIES */
          <div>
            {isLoadingGithub ? (
              <div style={{ textAlign: 'center', padding: '64px 20px', color: '#6b7280' }}>
                <RefreshCw size={28} className="spin" color="#ff7e5f" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>Fetching live GitHub repositories for @Sameer-Bagul...</p>
                <p style={{ fontSize: '0.875rem', marginTop: '6px' }}>Retrieving complete public & private repository catalog</p>
              </div>
            ) : filteredGithubRepos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 20px', color: '#6b7280' }}>
                <p style={{ fontSize: '1.1rem' }}>No GitHub repositories match your search or filter query.</p>
              </div>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
                  {filteredGithubRepos.slice(0, visibleRepoCount).map((repo) => (
                    <div key={repo.name} className="card-glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span className="badge badge-sky">{repo.category}</span>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            {repo.visibility === 'private' ? (
                              <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Lock size={12} color="#f59e0b" /> Private
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Globe size={12} color="#10b981" /> Public
                              </span>
                            )}
                            {repo.hasMetadata ? (
                              <span className="badge badge-mint" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle2 size={12} /> Metadata Ready
                              </span>
                            ) : (
                              <span className="badge badge-lavender" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={12} /> Analysis Needed
                              </span>
                            )}
                          </div>
                        </div>

                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>{repo.name}</h3>
                        <p style={{ color: '#4b5563', fontSize: '0.875rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {repo.description}
                        </p>
                      </div>

                      <div style={{ marginTop: '20px', borderTop: '1px solid #f3f4f6', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Updated {repo.updatedAt}</div>
                        {repo.hasMetadata ? (
                          <Link to={`/project/${repo.name.toLowerCase()}`} className="btn-fruity-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem', textDecoration: 'none' }}>
                            Inspect Metadata <ChevronRight size={14} />
                          </Link>
                        ) : (
                          <button
                            className="btn-fruity-primary"
                            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                            onClick={() => alert(`Run command to analyze:\nnpm run analyze -- --repo Sameer-Bagul/${repo.name}`)}
                          >
                            <Terminal size={14} /> Analyze Repo
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More Button */}
                {visibleRepoCount < filteredGithubRepos.length && (
                  <div style={{ textAlign: 'center', marginTop: '36px' }}>
                    <button
                      className="btn-fruity-secondary"
                      style={{ padding: '12px 32px', fontSize: '0.95rem' }}
                      onClick={() => setVisibleRepoCount((prev) => prev + 30)}
                    >
                      Load More Repositories ({filteredGithubRepos.length - visibleRepoCount} remaining)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* REMOTION VIDEO PREVIEW MODAL */}
      {activeVideoProject && <VideoPreviewModal project={activeVideoProject} onClose={() => setActiveVideoProject(null)} />}
    </div>
  );
};
