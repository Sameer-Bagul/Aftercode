'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidViewerProps {
  chart: string;
  id?: string;
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({ chart, id = 'mermaid-chart' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderError, setRenderError] = useState<boolean>(false);

  const cleanupMermaidErrorDivs = () => {
    if (typeof document === 'undefined') return;
    const elements = document.querySelectorAll('div[id^="dmermaid"], div.mermaid, svg[id^="dmermaid"]');
    elements.forEach((el) => {
      if (el.parentElement === document.body) {
        el.remove();
      }
    });
  };

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      securityLevel: 'loose',
      fontFamily: 'Inter, sans-serif',
    });

    const renderChart = async () => {
      if (!containerRef.current || !chart) return;

      try {
        setRenderError(false);
        cleanupMermaidErrorDivs();

        containerRef.current.innerHTML = '';
        const cleanChart = chart.replace(/[\r\n]+/g, '\n').trim();

        if (!cleanChart) {
          setRenderError(true);
          return;
        }

        // Validate syntax with mermaid.parse before rendering
        try {
          const valid = await mermaid.parse(cleanChart, { suppressErrors: true });
          if (valid === false) {
            setRenderError(true);
            cleanupMermaidErrorDivs();
            return;
          }
        } catch {
          setRenderError(true);
          cleanupMermaidErrorDivs();
          return;
        }

        const uniqueId = `mermaid_${id.replace(/[^a-zA-Z0-9]/g, '_')}_${Math.random().toString(36).substring(2, 7)}`;
        const { svg } = await mermaid.render(uniqueId, cleanChart);
        
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.warn('⚠️ [MermaidViewer] Render error:', err);
        setRenderError(true);
        cleanupMermaidErrorDivs();
      }
    };

    renderChart();

    return () => {
      cleanupMermaidErrorDivs();
    };
  }, [chart, id]);

  if (renderError) {
    return (
      <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px', fontWeight: 600 }}>System Diagram Source:</p>
        <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '14px', borderRadius: '8px', fontSize: '0.825rem', overflowX: 'auto', margin: 0 }}>
          {chart}
        </pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        overflowX: 'auto',
        display: 'flex',
        justifyContent: 'center',
        padding: '16px 0',
      }}
    />
  );
};
