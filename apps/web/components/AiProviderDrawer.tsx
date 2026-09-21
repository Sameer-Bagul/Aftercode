'use client';

import React, { useState, useEffect } from 'react';
import { X, Cpu, Key, CheckCircle, AlertCircle, Eye, EyeOff, Zap, Sliders, RefreshCw, Star } from 'lucide-react';

export interface ProviderItem {
  id: string;
  name: string;
  enabled: boolean;
  hasKey: boolean;
  isPrimary: boolean;
  model: string;
  availableModels: string[];
  keyEnv: string;
  modelEnv: string;
}

interface AiProviderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProvidersUpdated?: () => void;
}

export function AiProviderDrawer({ isOpen, onClose, onProvidersUpdated }: AiProviderDrawerProps) {
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [primaryId, setPrimaryId] = useState<string>('groq');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [inputKeys, setInputKeys] = useState<{ [id: string]: string }>({});
  const [selectedModels, setSelectedModels] = useState<{ [id: string]: string }>({});
  const [showKeys, setShowKeys] = useState<{ [id: string]: boolean }>({});

  const [savingId, setSavingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ [id: string]: { ok: boolean; msg: string } }>({});

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/ai/providers');
      const data = await res.json();
      if (data.success) {
        setProviders(data.providers);
        if (data.primaryProvider) setPrimaryId(data.primaryProvider);
        const modelMap: { [id: string]: string } = {};
        data.providers.forEach((p: ProviderItem) => {
          modelMap[p.id] = p.model;
        });
        setSelectedModels(modelMap);
      } else {
        setError(data.error || 'Failed to load AI providers');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching provider status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProviders();
    }
  }, [isOpen]);

  const handleSetPrimaryProvider = async (providerId: string) => {
    try {
      setSettingPrimaryId(providerId);
      const res = await fetch('/api/ai/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_primary_provider',
          providerId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPrimaryId(providerId);
        await fetchProviders();
        if (onProvidersUpdated) onProvidersUpdated();
      } else {
        alert(`Error setting primary provider: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Failed to set primary provider: ${err.message}`);
    } finally {
      setSettingPrimaryId(null);
    }
  };

  const handleSaveCredentials = async (providerId: string) => {
    try {
      setSavingId(providerId);
      const key = inputKeys[providerId];
      const model = selectedModels[providerId];

      const res = await fetch('/api/ai/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_credentials',
          providerId,
          apiKey: key || undefined,
          model,
          isPrimary: primaryId === providerId,
        }),
      });

      let data: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(res.ok ? text : `Server Error (HTTP ${res.status}): Please restart dev server.`);
      }

      if (data.success) {
        setInputKeys((prev) => ({ ...prev, [providerId]: '' }));
        await fetchProviders();
        if (onProvidersUpdated) onProvidersUpdated();
        setTestResult((prev) => ({
          ...prev,
          [providerId]: { ok: true, msg: 'Settings saved successfully!' },
        }));
      } else {
        setTestResult((prev) => ({
          ...prev,
          [providerId]: { ok: false, msg: data.error || 'Failed to save settings.' },
        }));
      }
    } catch (err: any) {
      setTestResult((prev) => ({
        ...prev,
        [providerId]: { ok: false, msg: err.message },
      }));
    } finally {
      setSavingId(null);
    }
  };

  const handleTestConnection = async (providerId: string) => {
    try {
      setTestingId(providerId);
      const key = inputKeys[providerId];
      const model = selectedModels[providerId];

      const res = await fetch('/api/ai/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_connection',
          providerId,
          apiKey: key || undefined,
          model,
        }),
      });

      let data: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(res.ok ? text : `Server Error (HTTP ${res.status}): Please restart dev server.`);
      }

      if (data.success) {
        setTestResult((prev) => ({
          ...prev,
          [providerId]: {
            ok: true,
            msg: `Connected! ${data.latencyMs ? `(${data.latencyMs}ms latency)` : ''}`,
          },
        }));
      } else {
        setTestResult((prev) => ({
          ...prev,
          [providerId]: { ok: false, msg: data.error || 'Connection test failed' },
        }));
      }
    } catch (err: any) {
      setTestResult((prev) => ({
        ...prev,
        [providerId]: { ok: false, msg: err.message },
      }));
    } finally {
      setTestingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'stretch',
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInFromEdge {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      {/* Drawer Panel */}
      <div
        style={{
          position: 'relative',
          width: '500px',
          maxWidth: '90vw',
          height: '100%',
          backgroundColor: '#ffffff',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid #e2e8f0',
          animation: 'slideInFromEdge 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 10000,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #f1f5f9',
            backgroundColor: '#fafafa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#fff7ed',
                border: '1px solid #ffedd5',
                color: '#ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Cpu size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                AI Provider Hub
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                Configure active provider, API keys & models
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Active Provider Selector Banner */}
          <div
            style={{
              padding: '16px',
              borderRadius: '14px',
              backgroundColor: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <label
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Star size={15} fill="#f59e0b" color="#f59e0b" /> Exclusive Active AI Provider
            </label>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
              Select which AI provider engine is strictly used for repository synthesis:
            </p>
            <select
              value={primaryId}
              onChange={(e) => handleSetPrimaryProvider(e.target.value)}
              disabled={Boolean(settingPrimaryId)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#0f172a',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="groq">⚡ Groq AI (Ultra-Fast 12ms Inference)</option>
              <option value="gemini">🤖 Google Gemini AI</option>
              <option value="openrouter">🌐 OpenRouter AI</option>
              <option value="openai">🟢 OpenAI (GPT-4o)</option>
            </select>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
              <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
              <div>Scanning available AI providers...</div>
            </div>
          ) : error ? (
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fee2e2',
                color: '#991b1b',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={16} /> {error}
            </div>
          ) : (
            providers.map((p) => {
              const isSelectedPrimary = primaryId === p.id;

              const getBadgeColor = () => {
                if (p.id === 'groq') return { bg: '#fff7ed', border: '#ffedd5', color: '#ea580c' };
                if (p.id === 'gemini') return { bg: '#ecfeff', border: '#cffafe', color: '#0891b2' };
                if (p.id === 'openrouter') return { bg: '#faf5ff', border: '#f3e8ff', color: '#7e22ce' };
                return { bg: '#ecfdf5', border: '#d1fae5', color: '#047857' };
              };

              const badge = getBadgeColor();

              return (
                <div
                  key={p.id}
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    backgroundColor: '#ffffff',
                    border: isSelectedPrimary ? '2px solid #ea580c' : '1px solid #e2e8f0',
                    boxShadow: isSelectedPrimary ? '0 4px 16px rgba(234, 88, 12, 0.12)' : '0 4px 12px rgba(0, 0, 0, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  {/* Title Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          backgroundColor: badge.bg,
                          border: `1px solid ${badge.border}`,
                          color: badge.color,
                        }}
                      >
                        {p.name}
                      </span>
                      {isSelectedPrimary && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            color: '#ea580c',
                            backgroundColor: '#fff7ed',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            border: '1px solid #ffedd5',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <Star size={11} fill="#ea580c" /> Active Engine
                        </span>
                      )}
                    </div>

                    {!isSelectedPrimary && (
                      <button
                        onClick={() => handleSetPrimaryProvider(p.id)}
                        disabled={Boolean(settingPrimaryId)}
                        style={{
                          fontSize: '0.725rem',
                          fontWeight: 700,
                          color: '#475569',
                          backgroundColor: '#f8fafc',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          cursor: 'pointer',
                        }}
                      >
                        Use This Provider
                      </button>
                    )}
                  </div>

                  {/* Model Selector */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Sliders size={12} /> Active Model
                    </label>
                    <select
                      value={selectedModels[p.id] || p.model}
                      onChange={(e) => setSelectedModels((prev) => ({ ...prev, [p.id]: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.825rem',
                        fontFamily: 'monospace',
                        color: '#0f172a',
                        outline: 'none',
                      }}
                    >
                      {p.availableModels.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* API Key Input */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Key size={12} /> API Key ({p.keyEnv})
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showKeys[p.id] ? 'text' : 'password'}
                        placeholder={p.hasKey ? '•••••••••••••••• (Configured)' : 'Enter API Key...'}
                        value={inputKeys[p.id] || ''}
                        onChange={(e) => setInputKeys((prev) => ({ ...prev, [p.id]: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '9px 36px 9px 12px',
                          borderRadius: '10px',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.825rem',
                          color: '#0f172a',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeys((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                        }}
                      >
                        {showKeys[p.id] ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => handleTestConnection(p.id)}
                      disabled={testingId === p.id}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#475569',
                        fontSize: '0.775rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        opacity: testingId === p.id ? 0.6 : 1,
                      }}
                    >
                      {testingId === p.id ? 'Testing...' : '⚡ Test Connection'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveCredentials(p.id)}
                      disabled={savingId === p.id}
                      style={{
                        padding: '7px 16px',
                        borderRadius: '8px',
                        backgroundColor: '#0f172a',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '0.775rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        opacity: savingId === p.id ? 0.6 : 1,
                      }}
                    >
                      {savingId === p.id ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>

                  {/* Test Diagnostic Result */}
                  {testResult[p.id] && (
                    <div
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: testResult[p.id].ok ? '#ecfdf5' : '#fef2f2',
                        border: `1px solid ${testResult[p.id].ok ? '#d1fae5' : '#fee2e2'}`,
                        color: testResult[p.id].ok ? '#047857' : '#991b1b',
                      }}
                    >
                      {testResult[p.id].ok ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                      <span>{testResult[p.id].msg}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '10px',
              backgroundColor: '#ea580c',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(234, 88, 12, 0.25)',
            }}
          >
            Done & Save Hub State
          </button>
        </div>
      </div>
    </div>
  );
}
