'use client';

import React from 'react';

export interface RemotionSmartFrameProps {
  assetUrl: string;
  assetType?: 'image' | 'svg' | 'diagram' | 'icon';
  fitStrategy?: 'contain_blurred' | 'cover_cinematic' | 'svg_responsive' | 'smart_card';
  title?: string;
  width?: number | string;
  height?: number | string;
}

/**
 * RemotionSmartFrame
 * Smart frame component ensuring visual assets of ANY size or aspect ratio
 * fit perfectly inside 1920x1080 Remotion video compositions without stretching or black bars.
 */
export const RemotionSmartFrame: React.FC<RemotionSmartFrameProps> = ({
  assetUrl,
  assetType = 'image',
  fitStrategy = 'contain_blurred',
  title,
  width = '100%',
  height = '100%',
}) => {
  // Strategy 1: Vector / SVG responsive viewport
  if (assetType === 'svg' || fitStrategy === 'svg_responsive') {
    return (
      <div
        style={{
          width,
          height,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '24px',
          boxSizing: 'border-box',
        }}
      >
        <img
          src={assetUrl}
          alt={title || 'SVG Asset'}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.2))',
          }}
        />
      </div>
    );
  }

  // Strategy 2: Small Tech Icon Smart Card Wrapper
  if (assetType === 'icon' || fitStrategy === 'smart_card') {
    return (
      <div
        style={{
          width,
          height,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            border: '2px solid #e2e8f0',
            borderRadius: '24px',
            padding: '28px 40px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          }}
        >
          <img src={assetUrl} alt={title || 'Icon'} style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
          {title && <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{title}</span>}
        </div>
      </div>
    );
  }

  // Strategy 3: Cinematic Cover (Full Bleed Wallpaper)
  if (fitStrategy === 'cover_cinematic') {
    return (
      <div style={{ width, height, overflow: 'hidden', position: 'relative' }}>
        <img
          src={assetUrl}
          alt={title || 'Cinematic Asset'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
    );
  }

  // Strategy 4: Default Contain with Dynamic Blurred Backdrop (For UI Screenshots & Vertical Images)
  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#0f172a',
      }}
    >
      {/* Blurred Background Image fill */}
      <img
        src={assetUrl}
        alt="Backdrop Blur"
        style={{
          position: 'absolute',
          top: -20,
          left: -20,
          width: 'calc(100% + 40px)',
          height: 'calc(100% + 40px)',
          objectFit: 'cover',
          filter: 'blur(40px) brightness(0.45)',
          transform: 'scale(1.1)',
        }}
      />

      {/* Main Crisp Foreground Image */}
      <div
        style={{
          position: 'relative',
          maxWidth: '85%',
          maxHeight: '85%',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.15)',
        }}
      >
        <img
          src={assetUrl}
          alt={title || 'Normalized Asset'}
          style={{
            display: 'block',
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
        />
      </div>
    </div>
  );
};
