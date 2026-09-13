import React, { useMemo } from 'react';
import { BarChart2, Code2, Server, Sparkles, Layers, ShieldCheck, Cpu } from 'lucide-react';
import projectsData from '../data/projects.json';

export const AnalyticsPage: React.FC = () => {
  const analytics = useMemo(() => {
    const totalProjects = projectsData.length;
    const techCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    let totalEndpoints = 0;
    let portfolioWorthyCount = 0;

    (projectsData as any[]).forEach((p) => {
      if (p.isFeatured || p.classification?.type === 'portfolio-worthy') {
        portfolioWorthyCount++;
      }

      const cat = p.category || 'Engineering';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

      const techStack = p.techStackBreakdown || {};
      const allTech = Array.from(
        new Set([
          ...(techStack.frontend || []),
          ...(techStack.backend || []),
          ...(techStack.aiMl || []),
          ...(techStack.database || []),
          ...(techStack.devops || []),
        ])
      );

      allTech.forEach((t) => {
        const name = String(t);
        techCounts[name] = (techCounts[name] || 0) + 1;
      });

      totalEndpoints += (p.apiEndpoints || []).length;
    });

    const sortedTech = Object.entries(techCounts).sort((a, b) => b[1] - a[1]);

    return {
      totalProjects,
      portfolioWorthyCount,
      totalEndpoints,
      uniqueTechCount: Object.keys(techCounts).length,
      categoryCounts,
      topTech: sortedTech,
    };
  }, []);

  return (
    <div style={{ padding: '36px 40px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* HEADER BANNER */}
      <div style={{ marginBottom: '32px' }}>
        <div className="badge badge-lavender" style={{ marginBottom: '12px' }}>
          <BarChart2 size={14} /> Ecosystem Insights & AST Metrics
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
          Portfolio Analytics & Codebase Intelligence
        </h1>
        <p style={{ color: '#4b5563', fontSize: '1rem', marginTop: '6px' }}>
          Real-time aggregated breakdown of languages, frameworks, API endpoints, and structural taxonomy.
        </p>
      </div>

      {/* TOP SUMMARY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        {[
          { label: 'Analyzed Repositories', val: analytics.totalProjects, icon: Layers, color: '#ff7e5f' },
          { label: 'Portfolio Worthy', val: analytics.portfolioWorthyCount, icon: Sparkles, color: '#10b981' },
          { label: 'Unique Technologies', val: analytics.uniqueTechCount, icon: Code2, color: '#8b5cf6' },
          { label: 'Extracted API Routes', val: analytics.totalEndpoints, icon: Server, color: '#06b6d4' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="card-glass" style={{ padding: '20px 24px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                <Icon size={16} color={item.color} /> {item.label}
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', marginTop: '8px' }}>
                {item.val}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', flexWrap: 'wrap' }}>
        {/* TECH STACK DISTRIBUTION */}
        <div className="card-glass" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Cpu size={20} color="#8b5cf6" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>Framework & Library Frequency</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {analytics.topTech.map(([tech, count]) => {
              const percentage = Math.round((count / analytics.totalProjects) * 100);
              return (
                <div key={tech}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    <span>{tech}</span>
                    <span style={{ color: '#6b7280' }}>{count} repos ({percentage}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #8b5cf6, #ff7e5f)',
                        borderRadius: '4px',
                        transition: 'width 0.4s ease-in-out',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DOMAIN CLASSIFICATION & QUALITY METRICS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div className="card-glass" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Layers size={20} color="#ff7e5f" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>Domain Taxonomy</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(analytics.categoryCounts).map(([cat, count]) => (
                <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#fafaf9', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
                  <span style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>{cat}</span>
                  <span className="badge badge-peach">{count} Projects</span>
                </div>
              ))}
            </div>
          </div>

          {/* VERIFICATION & GUARANTEES */}
          <div className="card-glass" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <ShieldCheck size={20} color="#10b981" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>AST Verification Rules</h2>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', color: '#4b5563', fontSize: '0.9rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                <span>Zero hallucination guarantee — Tech claims verified strictly via package manifests.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                <span>Deterministic Mermaid topologies generated directly from AST imports.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                <span>Automated media production pipeline powered by Playwright + Remotion.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
