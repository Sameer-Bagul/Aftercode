'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, CheckCircle2, Loader2, X, ArrowRight, ShieldCheck, FileCode, Terminal } from 'lucide-react';

export interface AnalysisStep {
  number: number;
  label: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
}

interface AnalysisModalProps {
  isOpen: boolean;
  repoName: string;
  slug: string;
  status: 'running' | 'completed' | 'error';
  errorMessage?: string | null;
  onClose: () => void;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({
  isOpen,
  repoName,
  slug,
  status,
  errorMessage,
  onClose,
}) => {
  if (!isOpen) return null;

  const steps: AnalysisStep[] = [
    {
      number: 1,
      label: 'Workspace Sandbox & Shallow Clone',
      description: 'Preparing sandboxed directory and executing shallow git clone into memory',
      status: status === 'running' ? 'completed' : status === 'completed' ? 'completed' : 'pending',
    },
    {
      number: 2,
      label: 'Complexity & Structural AST Scanning',
      description: 'Scanning directory trees up to depth 10 for source files, manifests, and configs',
      status: status === 'running' ? 'completed' : status === 'completed' ? 'completed' : 'pending',
    },
    {
      number: 3,
      label: 'Route & Package Manifest Evidence',
      description: 'Extracting ground-truth package dependencies, framework routes, and API endpoints',
      status: status === 'running' ? 'completed' : status === 'completed' ? 'completed' : 'pending',
    },
    {
      number: 4,
      label: 'Ephemeral Hybrid RAG Indexing',
      description: 'Chunking source code and populating BM25 sparse search & TF-IDF term vectors',
      status: status === 'running' ? 'completed' : status === 'completed' ? 'completed' : 'pending',
    },
    {
      number: 5,
      label: 'Gemini SDK Multi-Pass Synthesis',
      description: 'Invoking Google GenAI SDK (@google/genai) for deep architectural prompt synthesis',
      status: status === 'running' ? 'running' : status === 'completed' ? 'completed' : 'pending',
    },
    {
      number: 6,
      label: 'AJV Schema & Zero-Fabrication Rules',
      description: 'Enforcing JSON schema validation and zero-hallucination business rule checks',
      status: status === 'completed' ? 'completed' : 'pending',
    },
    {
      number: 7,
      label: 'Writing Metadata & Video Script',
      description: `Saving output payload to output/metadata/${slug}.json`,
      status: status === 'completed' ? 'completed' : 'pending',
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '680px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                background: '#0f172a',
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                AST Code Analysis: {repoName}
              </h3>
              <span style={{ fontSize: '0.775rem', color: '#64748b', fontWeight: 600 }}>
                Autonomous Code Evidence Extraction & Gemini AI RAG Pipeline
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', maxHeight: '60vh', overflowY: 'auto' }}>
          {status === 'error' ? (
            <div
              style={{
                padding: '16px',
                borderRadius: '10px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                fontSize: '0.9rem',
              }}
            >
              <h4 style={{ margin: '0 0 6px 0', fontWeight: 700 }}>Analysis Failed</h4>
              <p style={{ margin: 0 }}>{errorMessage || 'Failed to complete repository analysis.'}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {steps.map((step) => {
                const isCurrent = step.status === 'running';
                const isDone = step.status === 'completed';

                return (
                  <div
                    key={step.number}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: isCurrent ? '#f0f9ff' : isDone ? '#f8fafc' : '#ffffff',
                      border: isCurrent ? '1px solid #bae6fd' : '1px solid #f1f5f9',
                    }}
                  >
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: isDone ? '#10b981' : isCurrent ? '#0284c7' : '#e2e8f0',
                        color: isDone || isCurrent ? '#ffffff' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    >
                      {isDone ? <CheckCircle2 size={16} /> : isCurrent ? <Loader2 size={15} className="spin" /> : step.number}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                          Step {step.number}/7: {step.label}
                        </h4>
                        {isCurrent && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              background: '#0284c7',
                              color: '#ffffff',
                              padding: '2px 8px',
                              borderRadius: '12px',
                            }}
                          >
                            Processing...
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '3px 0 0 0', fontSize: '0.775rem', color: '#64748b', lineHeight: 1.4 }}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Real-Time Terminal Output Log Box */}
          <div
            style={{
              marginTop: '20px',
              background: '#0f172a',
              borderRadius: '10px',
              padding: '14px',
              color: '#e2e8f0',
              fontFamily: 'monospace',
              fontSize: '0.775rem',
              lineHeight: 1.6,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', marginBottom: '8px' }}>
              <Terminal size={14} /> Execution Status Console Log
            </div>
            <div style={{ color: '#10b981' }}>
              {status === 'running' && `🚀 [Process] Analyzing AST evidence for repository '${repoName}'...`}
              {status === 'completed' && `🎉 [Complete] Metadata payload & video script saved to output/metadata/${slug}.json`}
              {status === 'error' && `❌ [Error] ${errorMessage}`}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #e2e8f0',
            background: '#ffffff',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            {status === 'completed' ? 'Close' : 'Cancel'}
          </button>

          {status === 'completed' && (
            <Link
              href={`/project/${slug}`}
              onClick={onClose}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                background: '#0f172a',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.85rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              View Generated Workspace <ArrowRight size={15} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
