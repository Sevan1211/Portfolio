import React, { useRef, useEffect } from 'react';
import monitorShadowTexture from '@shared/assets/images/landing/shadow-compressed.png';
import monitorSmudgesTexture from '@shared/assets/images/landing/smudges.jpg';
import { DesktopProvider } from './core/DesktopProvider';
import { useDesktopState, useDesktop } from './core/useDesktop';
import { Desktop } from './components/Desktop';
import { WindowFrame } from './components/WindowFrame';
import { Taskbar } from './components/Taskbar';
import './styles/index.css';

interface RetroOSProps {
  isZoomedIn: boolean;
  /** When true the OS fills the viewport as a regular full-screen page */
  fullscreen?: boolean;
}

const OSDesktop: React.FC = () => {
  const { windows, activeWindowId, fullscreen } = useDesktopState();
  const { clampWindows } = useDesktop();
  const workspaceRef = useRef<HTMLDivElement>(null);

  // When the browser/container resizes, clamp all windows to stay in bounds
  const clampWindowsRef = useRef(clampWindows);
  clampWindowsRef.current = clampWindows;

  useEffect(() => {
    const el = workspaceRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          clampWindowsRef.current(width, height);
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`retro-os${fullscreen ? ' retro-os--fullscreen' : ''}`}>
      <div className="retro-os-workspace" ref={workspaceRef}>
        <Desktop />

        {windows.map((desktopWindow) => (
          <WindowFrame
            key={desktopWindow.id}
            windowState={desktopWindow}
            isActive={desktopWindow.id === activeWindowId}
          />
        ))}
      </div>

      <Taskbar />
    </div>
  );
};

const DefaultAppLauncher: React.FC<{ isZoomedIn: boolean }> = ({ isZoomedIn }) => {
  const { openApp } = useDesktop();
  const hasOpenedRef = React.useRef(false);

  React.useEffect(() => {
    if (isZoomedIn && !hasOpenedRef.current) {
      openApp('about');
      hasOpenedRef.current = true;
    }
  }, [isZoomedIn, openApp]);

  return null;
};

export const RetroOS: React.FC<RetroOSProps> = React.memo(({ isZoomedIn, fullscreen = false }) => {
  return (
    <div
      style={{
        width: fullscreen ? '100%' : '1446px',
        height: fullscreen ? '100%' : '1600px',
        position: 'relative',
        background: fullscreen ? 'transparent' : '#1e3a8a',
        overflow: 'hidden',
        borderRadius: fullscreen ? '0' : '4px',
        boxSizing: 'border-box',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        perspective: '1000px',
        ...(fullscreen ? {} : { containIntrinsicSize: '1446px 1600px' }),
      }}
    >
      {/* Monitor overlays (blue background, bezel, smudges) are only needed in CSS-3D mode */}
      {!fullscreen && (
        <>
          {/* Static blue screen background (replaces old video) */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)',
              opacity: isZoomedIn ? 0 : 1,
              transition: 'opacity 0.2s ease-out',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          {/* Monitor bezel/shadow */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `url(${monitorShadowTexture})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              opacity: isZoomedIn ? 0 : 0.85,
              transition: 'opacity 1s ease-out',
              mixBlendMode: 'multiply',
              pointerEvents: 'none',
              zIndex: 9,
            }}
          />

          {/* Monitor smudges */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `url(${monitorSmudgesTexture})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: isZoomedIn ? 0.1 : 0.03,
              mixBlendMode: 'soft-light',
              filter: 'brightness(1.35) contrast(1.15)',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          />
        </>
      )}

      {/* The OS itself */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: isZoomedIn || fullscreen ? 1 : 0,
          pointerEvents: isZoomedIn || fullscreen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease-out',
          zIndex: 4,
        }}
      >
        <DesktopProvider fullscreen={fullscreen}>
          <DefaultAppLauncher isZoomedIn={isZoomedIn || fullscreen} />
          <OSDesktop />
        </DesktopProvider>
      </div>
    </div>
  );
});

RetroOS.displayName = 'RetroOS';
