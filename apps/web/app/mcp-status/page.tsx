'use client';

import React from 'react';
import { Cpu, Server, Terminal, ShieldCheck, CheckCircle2, Zap } from 'lucide-react';

export default function McpStatusPage() {
  const tools = [
    { name: 'analyze_repository', description: 'Runs AST evidence extraction & static code classification on target repo.' },
    { name: 'synthesize_metadata', description: 'Generates non-hallucinated schema metadata using Gemini synthesis.' },
    { name: 'generate_local_tts', description: 'Synthesizes local WAV voiceover audio normalized with FFmpeg loudnorm.' },
    { name: 'build_remotion_video', description: 'Assembles Remotion storyboard script and renders MP4 video file.' },
    { name: 'query_code_rag', description: 'Executes BM25 hybrid vector search over repository source files.' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Cpu size={20} color="#0284c7" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Model Context Protocol Server
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            MCP System Status & Tool Inspector
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '4px' }}>
            Inspect active MCP stdio tools, environment configurations, and AI IDE integration parameters.
          </p>
        </div>

        {/* System Status Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Server size={20} color="#10b981" />
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>MCP Stdio Transport</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#047857' }}>Active & Ready</div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
              Server package: <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>@aftercode/mcp</code>
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <ShieldCheck size={20} color="#0284c7" />
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>Sandboxing Guard</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7' }}>Workspace Restricted</div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
              Sandboxed in <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>workspace/current/</code>
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Zap size={20} color="#8b5cf6" />
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>Tool Declarations</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#6d28d9' }}>5 Registered Tools</div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Exposed to Antigravity AI agent</p>
          </div>
        </div>

        {/* Registered MCP Tools List */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
            Registered Model Context Protocol Tools
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tools.map((t) => (
              <div
                key={t.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Terminal size={18} color="#0284c7" />
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>{t.name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>{t.description}</div>
                  </div>
                </div>

                <span style={{ padding: '4px 12px', borderRadius: '20px', background: '#ecfdf5', color: '#047857', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} color="#10b981" /> Registered
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
