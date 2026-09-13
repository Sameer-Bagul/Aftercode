import React, { useState, useMemo } from 'react';
import { Search, Zap, Layers, Server, Code2, Sparkles, Filter, ChevronRight, Github } from 'lucide-react';
import projectsData from './data/projects.json';
import { ProjectModal } from './components/ProjectModal';

export const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  const categories = ['All', 'AI/ML', 'Fullstack', 'DevOps', 'Frontend', 'Backend'];

  // Filtered project list based on search query & category selection
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

  // Aggregate Catalog Statistics
  const stats = useMemo(() => {
    const total = projectsData.length;
    const portfolioWorthy = projectsData.filter((p: any) => p.isFeatured || p.classification?.type === 'portfolio-worthy').length;
    const allTech = new Set(projectsData.flatMap((p: any) => (p.techStackBreakdown ? Object.values(p.techStackBreakdown).flat() : [])));
    const totalEndpoints = projectsData.reduce((acc: number, p: any) => acc + (p.apiEndpoints || []).length, 0);

    return {
      total,
      portfolioWorthy,
      totalTech: allTech.size,
      totalEndpoints,
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* GLASSMORPHISM HEADER */}
      <header className="header-glass" style={{ padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={22} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, background: 'linear-gradient(to right, #ffffff, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Aftercode
            </h1>
            <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 600, letterSpacing: '0.05em' }}>PORTFOLIO INTELLIGENCE CMS</span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div style={{ position: 'relative', width: '380px' }}>
          <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search projects, stack (React, FastAPI), or routes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 16px 10px 42px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '0.875rem',
              outline: 'none',
              transition: 'all 0.2s',
            }}
          />
        </div>

        <a
          href="https://github.com/Sameer-Bagul"
          target="_blank"
          rel="noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '12px', color: '#f3f4f6', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}
        >
          <Github size={18} /> GitHub Profile
        </a>
      </header>

      {/* HERO & STATS BANNER */}
      <section style={{ padding: '48px 40px 24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <div className="badge badge-primary" style={{ marginBottom: '12px' }}>
              <Sparkles size={14} /> Autonomous Developer Engine
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f9fafb', lineHeight: 1.2 }}>
              Developer Portfolio & System Topologies
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '1.05rem', marginTop: '8px', maxWidth: '650px' }}>
              Automated AST evidence extraction, multi-tier Mermaid architecture diagrams, and schema-validated metadata compiled directly from code repositories.
            </p>
          </div>

          {/* Statistics Grid */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {[
              { label: 'Discovered Projects', value: stats.total, icon: Layers, color: '#818cf8' },
              { label: 'Portfolio Worthy', value: stats.portfolioWorthy, icon: Sparkles, color: '#34d399' },
              { label: 'Tech Stack Tokens', value: stats.totalTech, icon: Code2, color: '#a855f7' },
              { label: 'Extracted Endpoints', value: stats.totalEndpoints, icon: Server, color: '#22d3ee' },
            ].map((st, idx) => {
              const Icon = st.icon;
              return (
                <div key={idx} style={{ background: 'rgba(17, 24, 39, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '16px 20px', minWidth: '150px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    <Icon size={16} color={st.color} /> {st.label}
                  </div>

                  <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', display: 'block', marginTop: '4px' }}>{st.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CATEGORY FILTER PILLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '36px', overflowX: 'auto', paddingBottom: '8px' }}>
          <Filter size={16} color="#9ca3af" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 18px',
                borderRadius: '9999px',
                border: '1px solid',
                borderColor: selectedCategory === cat ? '#6366f1' : 'rgba(255, 255, 255, 0.08)',
                background: selectedCategory === cat ? '#6366f1' : 'rgba(255, 255, 255, 0.03)',
                color: selectedCategory === cat ? '#ffffff' : '#9ca3af',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* PROJECT GALLERY GRID */}
      <main style={{ padding: '0 40px 64px', maxWidth: '1400px', margin: '0 auto', width: '100%', flex: 1 }}>
        {filteredProjects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 20px', color: '#9ca3af' }}>
            <p style={{ fontSize: '1.1rem' }}>No projects match your current query or category selection.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
            {filteredProjects.map((project: any) => {
              const frontendTech = project.techStackBreakdown?.frontend || [];
              const backendTech = project.techStackBreakdown?.backend || [];
              const aiTech = project.techStackBreakdown?.aiMl || [];
              const allBadges = Array.from(new Set([...frontendTech, ...backendTech, ...aiTech])).slice(0, 4);

              return (
                <div
                  key={project._id || project.slug}
                  className="card-glass"
                  style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
                  onClick={() => setSelectedProject(project)}
                >
                  <div>
                    {/* Header Pill & Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span className="badge badge-primary">{project.category || 'Engineering'}</span>
                      <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} /> {project.status || 'Active'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>{project.title}</h3>
                    <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {project.shortDescription || project.description}
                    </p>
                  </div>

                  {/* Tech Stack Badges & CTA Footer */}
                  <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                      {allBadges.map((b: string) => (
                        <span key={b} className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                          {b}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#818cf8', fontWeight: 600, fontSize: '0.875rem' }}>
                      <span>Inspect Topology</span>
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '24px 40px', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem', background: '#090d16' }}>
        <p>Aftercode Portfolio CMS Engine © 2026 Sameer Bagul. Open-Source Developer Intelligence.</p>
      </footer>

      {/* DETAILED PROJECT MODAL DRAWER */}
      {selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </div>
  );
};
