import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Download, Sparkles, Layers, Server, Code2 } from 'lucide-react';
import { MermaidViewer } from './MermaidViewer';

interface VideoPreviewModalProps {
  project: any;
  onClose: () => void;
}

export const VideoPreviewModal: React.FC<VideoPreviewModalProps> = ({ project, onClose }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentScene, setCurrentScene] = useState<number>(1);
  const [progress, setProgress] = useState<number>(0);

  const totalDurationSeconds = 16;

  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          const next = prev + 100 / (totalDurationSeconds * 10);
          const scene = Math.min(Math.floor((next / 100) * 4) + 1, 4);
          setCurrentScene(scene);
          return next;
        });
      }, 100);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleRestart = () => {
    setProgress(0);
    setCurrentScene(1);
    setIsPlaying(true);
  };

  if (!project) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(31, 41, 55, 0.75)',
        backdropFilter: 'blur(12px)',
        zIndex: 1100,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '920px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafaf9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'linear-gradient(135deg, #ff7e5f, #ff6b6b)', padding: '8px', borderRadius: '10px', color: '#ffffff', display: 'flex' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>Remotion Video Generator Preview</h3>
              <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Programmatic React Video Reel for {project.title}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        {/* Video Canvas Stage (16:9 Aspect Ratio) */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: 'linear-gradient(135deg, #090d16 0%, #111827 100%)', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {/* Scene 1: Hero Title */}
          {currentScene === 1 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#ffffff', animation: 'fadeIn 0.5s ease-out' }}>
              <span className="badge badge-peach" style={{ marginBottom: '16px' }}>
                SCENE 1 • OVERVIEW
              </span>
              <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1, marginBottom: '16px' }}>{project.title}</h1>
              <p style={{ fontSize: '1.2rem', color: '#9ca3af', maxWidth: '600px', margin: '0 auto' }}>{project.shortDescription}</p>
            </div>
          )}

          {/* Scene 2: API Endpoints & Routes */}
          {currentScene === 2 && (
            <div style={{ padding: '40px', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <span className="badge badge-sky" style={{ marginBottom: '20px' }}>
                SCENE 2 • API ENDPOINTS
              </span>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '700px' }}>
                {(project.apiEndpoints || []).map((ep: any, idx: number) => (
                  <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '16px 24px', borderRadius: '14px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Server size={20} color="#06b6d4" />
                    <div>
                      <span style={{ fontWeight: 800, color: '#22d3ee', fontSize: '0.85rem' }}>{ep.method}</span>
                      <p style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.1rem' }}>{ep.path}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scene 3: Architecture Topology */}
          {currentScene === 3 && (
            <div style={{ padding: '24px', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <span className="badge badge-lavender" style={{ marginBottom: '12px' }}>
                SCENE 3 • MULTI-TIER TOPOLOGY
              </span>
              <div style={{ width: '90%', maxHeight: '80%' }}>
                {project.architectureDiagram && <MermaidViewer chart={project.architectureDiagram} id={`video-${project.slug}`} />}
              </div>
            </div>
          )}

          {/* Scene 4: Tech Stack Cloud & Outro CTA */}
          {currentScene === 4 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#ffffff' }}>
              <span className="badge badge-mint" style={{ marginBottom: '16px' }}>
                SCENE 4 • TECH STACK & OUTRO
              </span>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '20px' }}>Built with State-of-the-Art Stack</h2>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '600px', margin: '0 auto 24px' }}>
                {Object.values(project.techStackBreakdown || {})
                  .flat()
                  .map((tech: any) => (
                    <span key={tech} className="badge badge-primary" style={{ fontSize: '0.9rem', padding: '8px 16px', background: 'rgba(99,102,241,0.2)' }}>
                      {tech}
                    </span>
                  ))}
              </div>
              <p style={{ color: '#9ca3af', fontSize: '1rem' }}>github.com/{project.repository?.owner || 'Sameer-Bagul'}/{project.slug}</p>
            </div>
          )}
        </div>

        {/* Video Player Controls */}
        <div style={{ padding: '20px 28px', background: '#fafaf9', borderTop: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Progress Bar Scrubber */}
          <div style={{ width: '100%', height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(to right, #ff7e5f, #ff6b6b)', transition: 'width 0.1s linear' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="btn-fruity-primary"
                style={{ padding: '8px 16px' }}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button onClick={handleRestart} className="btn-fruity-secondary" style={{ padding: '8px 14px' }}>
                <RotateCcw size={16} /> Replay
              </button>
              <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>
                Scene {currentScene} / 4
              </span>
            </div>

            <button className="btn-fruity-secondary" onClick={() => alert('Remotion MP4 rendering pipeline triggered for ' + project.title)}>
              <Download size={16} /> Export MP4 Video
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
