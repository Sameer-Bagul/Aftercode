'use client';

import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { GsapRemotionAnimator } from '@aftercode/engine';

interface GsapRemotionSceneProps {
  title: string;
  subheading: string;
  badges: string[];
  bgGradient: string;
}

export const GsapRemotionScene: React.FC<GsapRemotionSceneProps> = ({
  title,
  subheading,
  badges,
  bgGradient,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // GSAP-inspired card animation styles calculated from frame count
  const titleStyle = GsapRemotionAnimator.getCardStyle(frame, 0, 20);
  const subtitleStyle = GsapRemotionAnimator.getCardStyle(frame, 10, 20);
  const badgesStyle = GsapRemotionAnimator.getCardStyle(frame, 20, 20);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: bgGradient || 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px',
        color: '#ffffff',
        fontFamily: 'system-ui, sans-serif',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Title Card with GSAP elastic entrance */}
      <div style={{ ...titleStyle, textAlign: 'center', marginBottom: '16px' }}>
        <h1
          style={{
            fontSize: '3.5rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            margin: 0,
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          {title}
        </h1>
      </div>

      {/* Subheading Card */}
      <div style={{ ...subtitleStyle, textAlign: 'center', maxWidth: '800px', marginBottom: '36px' }}>
        <p
          style={{
            fontSize: '1.4rem',
            color: '#cbd5e1',
            margin: 0,
            lineHeight: 1.5,
            fontWeight: 500,
          }}
        >
          {subheading}
        </p>
      </div>

      {/* Badges Container */}
      <div
        style={{
          ...badgesStyle,
          display: 'flex',
          gap: '14px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {badges.map((badge, idx) => (
          <div
            key={idx}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              padding: '10px 22px',
              borderRadius: '999px',
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
          >
            ⚡ {badge}
          </div>
        ))}
      </div>
    </div>
  );
};
