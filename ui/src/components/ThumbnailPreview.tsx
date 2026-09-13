import React from 'react';
import { Sparkles, Layers, Cpu, Github, ExternalLink } from 'lucide-react';

interface ThumbnailPreviewProps {
  project: any;
}

export const ThumbnailPreview: React.FC<ThumbnailPreviewProps> = ({ project }) => {
  if (!project) return null;

  const frontendTech = project.techStackBreakdown?.frontend || [];
  const backendTech = project.techStackBreakdown?.backend || [];
  const aiTech = project.techStackBreakdown?.aiMl || [];
  const allBadges = Array.from(new Set([...frontendTech, ...backendTech, ...aiTech])).slice(0, 5);

  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '16/9',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, #ffffff 0%, #fff5f2 100%)',
        border: '1px solid rgba(255, 126, 95, 0.25)',
        padding: '36px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px -15px rgba(255, 126, 95, 0.15)',
      }}
    >
      {/* Fruity Background Accents */}
      <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '220px', height: '220px', background: 'radial-gradient(circle, rgba(255,126,95,0.2) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-80px', left: '-40px', width: '260px', height: '260px', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      {/* Header Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: 'linear-gradient(135deg, #ff7e5f, #ff6b6b)', padding: '8px', borderRadius: '10px', color: '#ffffff', display: 'flex' }}>
            <Sparkles size={18} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1f2937', letterSpacing: '0.05em' }}>AFTERCODE SHOWCASE</span>
        </div>
        <span className="badge badge-peach">{project.category || 'Engineering'}</span>
      </div>

      {/* Title & Short Description */}
      <div style={{ zIndex: 2, margin: '20px 0' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#111827', lineHeight: 1.15, letterSpacing: '-0.03em' }}>{project.title}</h2>
        <p style={{ color: '#4b5563', fontSize: '1.05rem', marginTop: '10px', maxWidth: '85%', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {project.shortDescription || project.description}
        </p>
      </div>

      {/* Footer Badges & Subgraph Node Count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 126, 95, 0.15)', paddingTop: '18px', zIndex: 2 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {allBadges.map((b: string) => (
            <span key={b} className="badge badge-mint" style={{ fontSize: '0.75rem', background: '#ffffff', border: '1px solid #d1d5db', color: '#374151' }}>
              {b}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#e0533c', fontWeight: 700, fontSize: '0.85rem' }}>
          <Layers size={16} /> 5-Tier Subgraph Architecture
        </div>
      </div>
    </div>
  );
};
