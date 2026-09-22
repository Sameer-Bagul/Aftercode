'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BarChart3, Cpu, Github, Sparkles } from 'lucide-react';
import { AiProviderDrawer } from './AiProviderDrawer';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const navItemStyle = (path: string) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '0.85rem',
    color: isActive(path) ? '#0f172a' : '#64748b',
    backgroundColor: isActive(path) ? '#f1f5f9' : 'transparent',
    transition: 'all 0.15s ease-in-out',
  });

  return (
    <>
      <header
        style={{
          padding: '12px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          {/* SaaS Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div
              style={{
                background: '#0f172a',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1rem',
              }}
            >
              A
            </div>
            <div>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                Aftercode
              </h1>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, display: 'block' }}>
                Repository & Video Intelligence
              </span>
            </div>
          </Link>

          {/* Clean Global Nav Links */}
          <nav style={{ display: 'flex', gap: '4px' }}>
            <Link href="/" style={navItemStyle('/')}>
              <LayoutDashboard size={15} /> Repositories
            </Link>
            <Link href="/analytics" style={navItemStyle('/analytics')}>
              <BarChart3 size={15} /> Analytics
            </Link>
            <Link href="/mcp-status" style={navItemStyle('/mcp-status')}>
              <Cpu size={15} /> System Status
            </Link>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* AI Provider Hub Drawer Trigger */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              background: '#fff7ed',
              border: '1px solid #ffedd5',
              color: '#ea580c',
              fontSize: '0.825rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease-in-out',
            }}
          >
            <Sparkles size={15} className="text-orange-500 fill-orange-500" /> AI Provider Hub
          </button>

          <a
            href="https://github.com/Sameer-Bagul"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontSize: '0.825rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <Github size={16} /> GitHub Profile
          </a>
        </div>
      </header>

      {/* Slide-over Settings Drawer */}
      <AiProviderDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
};
