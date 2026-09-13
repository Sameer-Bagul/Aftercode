import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface MermaidViewerProps {
  chart: string;
  id?: string;
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({ chart, id = 'mermaid-chart' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [zoom, setZoom] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'Inter, sans-serif',
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
      },
    });

    const renderChart = async () => {
      try {
        setError(null);
        const uniqueId = `mermaid-${id}-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(uniqueId, chart);
        setSvgContent(svg);
      } catch (err) {
        console.error('Mermaid Render Error:', err);
        setError('Failed to render diagram topology.');
      }
    };

    if (chart) {
      renderChart();
    }
  }, [chart, id]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.5));
  const handleResetZoom = () => setZoom(1);

  if (error) {
    return (
      <div style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#f87171' }}>
        <p>{error}</p>
        <pre style={{ marginTop: '12px', fontSize: '0.8rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>{chart}</pre>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', overflow: 'hidden' }}>
      {/* Zoom Controls */}
      <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px', zIndex: 10, background: 'rgba(17, 24, 39, 0.85)', padding: '6px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
        <button onClick={handleZoomOut} title="Zoom Out" style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px', display: 'flex' }}>
          <ZoomOut size={18} />
        </button>
        <button onClick={handleResetZoom} title="Reset Zoom" style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px', display: 'flex' }}>
          <RotateCcw size={18} />
        </button>
        <button onClick={handleZoomIn} title="Zoom In" style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px', display: 'flex' }}>
          <ZoomIn size={18} />
        </button>
      </div>

      {/* Rendered SVG Diagram */}
      <div
        ref={containerRef}
        style={{
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '320px',
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          transition: 'transform 0.2s ease-out',
        }}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
};
