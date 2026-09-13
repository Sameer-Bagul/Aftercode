import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, LayoutDashboard, BarChart3, Github, Key, CheckCircle2 } from 'lucide-react';
import { PATVerificationModal } from './PATVerificationModal';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [showPATModal, setShowPATModal] = useState<boolean>(false);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <header className="header-glass" style={{ padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{ background: 'linear-gradient(135deg, #ff7e5f, #ff6b6b)', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
              <Zap size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827' }}>Aftercode</h1>
              <span style={{ fontSize: '0.75rem', color: '#e0533c', fontWeight: 700, letterSpacing: '0.05em' }}>PORTFOLIO INTELLIGENCE CMS</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', gap: '8px' }}>
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: isActive('/') ? '#ffffff' : '#4b5563',
                background: isActive('/') ? 'linear-gradient(135deg, #ff7e5f, #ff6b6b)' : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              <LayoutDashboard size={16} /> Dashboard Catalog
            </Link>
            <Link
              to="/analytics"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: isActive('/analytics') ? '#ffffff' : '#4b5563',
                background: isActive('/analytics') ? 'linear-gradient(135deg, #ff7e5f, #ff6b6b)' : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              <BarChart3 size={16} /> Analytics
            </Link>
          </nav>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* PAT Token Status Button */}
          <button
            onClick={() => setShowPATModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#047857',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <CheckCircle2 size={14} color="#10b981" /> PAT Verified (4,994/5k)
          </button>

          <a
            href="https://github.com/Sameer-Bagul"
            target="_blank"
            rel="noreferrer"
            className="btn-fruity-secondary"
            style={{ textDecoration: 'none' }}
          >
            <Github size={18} /> GitHub Profile
          </a>
        </div>
      </header>

      {/* PAT Modal */}
      {showPATModal && <PATVerificationModal onClose={() => setShowPATModal(false)} />}
    </>
  );
};
