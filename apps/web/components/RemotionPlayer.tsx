'use client';

import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2 } from 'lucide-react';

interface RemotionScene {
  sceneNumber: number;
  name: string;
  heading: string;
  subheading: string;
  narration?: string;
  durationFrames?: number;
  bgGradient?: string;
  badges?: string[];
}

interface RemotionPlayerProps {
  scenes: RemotionScene[];
  activeSceneIndex: number;
  onSceneChange: (index: number) => void;
  projectTitle?: string;
}

export function RemotionPlayer({
  scenes,
  activeSceneIndex,
  onSceneChange,
  projectTitle = 'Project Video Breakdown'
}: RemotionPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const currentScene = scenes[activeSceneIndex] || scenes[0];

  const handleNext = () => {
    if (activeSceneIndex < scenes.length - 1) {
      onSceneChange(activeSceneIndex + 1);
    } else {
      onSceneChange(0);
    }
  };

  const handlePrev = () => {
    if (activeSceneIndex > 0) {
      onSceneChange(activeSceneIndex - 1);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  if (!currentScene) return null;

  return (
    <div style={{ background: '#0f172a', borderRadius: '16px', overflow: 'hidden', border: '1px solid #1e293b', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
      {/* Video Viewport Stage */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          background: currentScene.bgGradient || 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '48px 32px',
          color: '#ffffff',
          transition: 'background 0.5s ease',
          userSelect: 'none',
        }}
      >
        {/* Upper Badge / Scene Marker */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(8px)',
            padding: '6px 14px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#38bdf8',
          }}
        >
          <span>SCENE {currentScene.sceneNumber} OF {scenes.length}</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>•</span>
          <span style={{ color: '#ffffff' }}>{currentScene.name}</span>
        </div>

        {/* Scene Canvas Content */}
        <div style={{ textAlign: 'center', maxWidth: '800px' }}>
          <h2
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
              marginBottom: '12px',
              textShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            }}
          >
            {currentScene.heading}
          </h2>
          <p
            style={{
              fontSize: '1.15rem',
              color: 'rgba(255, 255, 255, 0.85)',
              fontWeight: 500,
              lineHeight: 1.5,
              maxWidth: '640px',
              margin: '0 auto',
            }}
          >
            {currentScene.subheading}
          </p>

          {/* Badges / Tech Tags */}
          {currentScene.badges && currentScene.badges.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
              {currentScene.badges.map((badge, i) => (
                <span
                  key={i}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(4px)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Narration Overlay */}
        {currentScene.narration && (
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              right: '20px',
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(10px)',
              padding: '12px 20px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <Volume2 size={18} color="#0284c7" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '0.875rem', color: '#e2e8f0', margin: 0, fontWeight: 500 }}>
              &quot;{currentScene.narration}&quot;
            </p>
          </div>
        )}
      </div>

      {/* Video Control Bar */}
      <div style={{ padding: '16px 24px', background: '#0f172a', borderTop: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handlePrev}
            disabled={activeSceneIndex === 0}
            style={{
              background: 'none',
              border: 'none',
              color: activeSceneIndex === 0 ? '#475569' : '#cbd5e1',
              cursor: activeSceneIndex === 0 ? 'not-allowed' : 'pointer',
              padding: '4px',
            }}
          >
            <SkipBack size={20} />
          </button>

          <button
            onClick={togglePlay}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: '#0284c7',
              border: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
          </button>

          <button
            onClick={handleNext}
            disabled={activeSceneIndex === scenes.length - 1}
            style={{
              background: 'none',
              border: 'none',
              color: activeSceneIndex === scenes.length - 1 ? '#475569' : '#cbd5e1',
              cursor: activeSceneIndex === scenes.length - 1 ? 'not-allowed' : 'pointer',
              padding: '4px',
            }}
          >
            <SkipForward size={20} />
          </button>

          <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, marginLeft: '8px' }}>
            Scene {activeSceneIndex + 1} of {scenes.length}
          </span>
        </div>

        {/* Timeline Scrubber Markers */}
        <div style={{ flex: 1, margin: '0 24px', display: 'flex', gap: '4px', alignItems: 'center' }}>
          {scenes.map((s, idx) => (
            <div
              key={idx}
              onClick={() => onSceneChange(idx)}
              style={{
                flex: 1,
                height: '6px',
                borderRadius: '3px',
                background: idx === activeSceneIndex ? '#0284c7' : idx < activeSceneIndex ? '#0369a1' : '#334155',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title={`Scene ${s.sceneNumber}: ${s.name}`}
            />
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Maximize2 size={18} color="#94a3b8" style={{ cursor: 'pointer' }} />
        </div>
      </div>
    </div>
  );
}
