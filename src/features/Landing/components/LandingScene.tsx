import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { AdaptiveDpr, AdaptiveEvents, PerformanceMonitor } from '@react-three/drei';
import { ACESFilmicToneMapping, PCFShadowMap, SRGBColorSpace } from 'three';
import { CubicleScene } from './CubicleScene';
import { LoadingScene } from './loading/LoadingScene';

// Lazy-load the RetroOS — it mounts only after the zoom-in animation completes,
// so the chunk download is fully hidden behind the user interaction delay.
const RetroOS = React.lazy(() =>
  import('./OS').then(m => ({ default: m.RetroOS }))
);

// Component to dynamically control R3F event system
interface EventManager {
  enabled: boolean;
}

const EventController: React.FC<{ isZoomedIn: boolean }> = ({ isZoomedIn }) => {
  const { events } = useThree();

  useEffect(() => {
    if (events && 'enabled' in events) {
      (events as unknown as EventManager).enabled = !isZoomedIn;
    }
  }, [isZoomedIn, events]);

  return null;
};

const LOADING_MIN_TIME = 3000;
const FADE_DURATION = 750;
const SETTLE_FRAMES = 15; // ~250ms at 60fps — allows GPU to finish shader compilation

const LandingScene: React.FC = () => {
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  // Full-screen OS overlay state
  const [osOverlayMounted, setOsOverlayMounted] = useState(false);
  const [osOverlayVisible, setOsOverlayVisible] = useState(false);
  const [zoomOutTrigger, setZoomOutTrigger] = useState(0);
  const osOverlayVisibleRef = useRef(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(true);
  const [loadingOverlayOpacity, setLoadingOverlayOpacity] = useState(1);
  const [showScreenHint, setShowScreenHint] = useState(false);
  const minLoadTimePassed = useRef(false);
  const renderSettled = useRef(false);

  // Dismiss the page-cover once the loading scene has actually rendered.
  // Double-rAF guarantees the browser has composited at least one frame
  // with the visible "7" before the cover disappears.
  const handleLoadingReady = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const cover = document.getElementById('page-cover');
        if (cover) cover.style.display = 'none';
      });
    });
  }, []);

  // Canvas refs
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const webglCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Wait for enough animation frames after the model becomes visible (warm-up)
  // so the GPU has time to compile all material/shadow shaders.
  // The loading overlay stays fully opaque during this period.
  useEffect(() => {
    if (modelLoaded && !renderSettled.current) {
      let frameCount = 0;
      let rafId = 0;

      const tick = () => {
        frameCount++;
        if (frameCount >= SETTLE_FRAMES) {
          renderSettled.current = true;
          setSceneReady(true);
        } else {
          rafId = requestAnimationFrame(tick);
        }
      };

      rafId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafId);
    }
    return undefined;
  }, [modelLoaded]);

  // Minimum loading time — runs once on mount. Fires completeLoading when
  // the timer expires if the scene has already settled; otherwise the
  // sceneReady effect below will fire it.
  useEffect(() => {
    const minLoadTime = setTimeout(() => {
      minLoadTimePassed.current = true;
      if (renderSettled.current) {
        completeLoading();
      }
    }, LOADING_MIN_TIME);

    return () => clearTimeout(minLoadTime);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally mount-only — completeLoading uses refs and stable setters

  useEffect(() => {
    if (sceneReady && minLoadTimePassed.current) {
      completeLoading();
    }
  }, [sceneReady]);

  const loadingCompletedRef = useRef(false);
  const hintTimerRef = useRef(0);

  const completeLoading = () => {
    if (loadingCompletedRef.current) return;
    loadingCompletedRef.current = true;
    setLoadingComplete(true);
    // Fade out the 3D loading overlay
    setLoadingOverlayOpacity(0);
    setTimeout(() => {
      setShowLoadingOverlay(false);
    }, FADE_DURATION);
    // Show "click the screen" hint after the scene fades in
    hintTimerRef.current = window.setTimeout(() => {
      setShowScreenHint(true);
      // Auto-hide after 5 seconds
      hintTimerRef.current = window.setTimeout(() => setShowScreenHint(false), 5000);
    }, 2000);
  };

  // Cleanup hint timers
  useEffect(() => {
    return () => clearTimeout(hintTimerRef.current);
  }, []);

  // Hide hint when user zooms in
  useEffect(() => {
    if (isZoomedIn) setShowScreenHint(false);
  }, [isZoomedIn]);

  // Keep ref in sync for use inside event listeners (avoids stale closure)
  useEffect(() => {
    osOverlayVisibleRef.current = osOverlayVisible;
  }, [osOverlayVisible]);

  /** Called by CubicleScene once the zoom-in animation finishes */
  const zoomCompleteRafRef = useRef(0);
  const handleZoomComplete = useCallback(() => {
    setOsOverlayMounted(true);
    // One rAF delay so React can paint the DOM node before we trigger the CSS transition
    zoomCompleteRafRef.current = requestAnimationFrame(() => setOsOverlayVisible(true));
  }, []);

  // Cleanup rAF on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(zoomCompleteRafRef.current);
  }, []);

  /** Called when the user presses Escape while the full-screen OS is open */
  const handleExitOS = useCallback(() => {
    setOsOverlayVisible(false);
    // Trigger zoom-out in the 3D scene simultaneously
    setZoomOutTrigger((n) => n + 1);
    // Unmount the overlay after the CSS fade-out finishes
    setTimeout(() => setOsOverlayMounted(false), 200);
  }, []);

  // Global Escape key — only active while the full-screen OS overlay is visible
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && osOverlayVisibleRef.current) {
        handleExitOS();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleExitOS]);

  return (
    <div className="landing-canvas" ref={canvasContainerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* 3D Loading overlay — same React tree, no racing */}
      {showLoadingOverlay && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 100,
            opacity: loadingOverlayOpacity,
            transition: `opacity ${FADE_DURATION / 1000}s ease-out`,
            pointerEvents: 'none',
            background: '#1e3a8a',
          }}
        >
          <Canvas
            camera={{ position: [0, 0, 8], fov: 50 }}
            style={{ width: '100%', height: '100%' }}
            dpr={1}
            gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
            onCreated={({ gl }) => {
              // Force-paint the canvas blue RIGHT NOW, before R3F's render loop starts.
              gl.setClearColor(0x1e3a8a, 1);
              gl.clear();
            }}
          >
            <color attach="background" args={['#1e3a8a']} />
            <LoadingScene onReady={handleLoadingReady} />
          </Canvas>
        </div>
      )}

      {/* Main 3D scene Canvas */}
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: false, // Opaque — prevents background bleed-through during load
          powerPreference: 'high-performance',
        }}
        camera={{
          position: [4, 12, -7], // Match CAMERA_POSITION.start for smooth initial view
          fov: 95,
          near: 0.5,
          far: 200
        }}
        onCreated={({ gl, camera }) => {
          // Enhanced color and tone mapping
          gl.outputColorSpace = SRGBColorSpace;
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.1; // Slightly brighter for better visibility

          // Blue background matching loading scene — transitions to black when scene is ready.
          // Force immediate clear so the canvas is blue from the first pixel, not default black.
          gl.setClearColor(0x1e3a8a, 1);
          gl.clear();

          // Better shadow quality
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = PCFShadowMap; // Faster than PCFSoftShadowMap

          // Set camera rotation immediately in onCreated (before first frame)
          // This prevents 1-2 frames of wrong camera angle
          camera.rotation.order = 'YXZ';
          camera.rotation.set(-0.3, 0.72, 0); // initialPitch, initialYaw, 0

          webglCanvasRef.current = gl.domElement;
        }}
      >
        {/* Auto-scale DPR and throttle events when FPS drops */}
        <PerformanceMonitor>
          <AdaptiveDpr pixelated />
        </PerformanceMonitor>
        <AdaptiveEvents />
        <EventController isZoomedIn={isZoomedIn} />
        <CubicleScene
          onModelLoaded={() => setModelLoaded(true)}
          loadingComplete={loadingComplete}
          warmUp={modelLoaded}
          onZoomChange={setIsZoomedIn}
          onZoomComplete={handleZoomComplete}
          zoomOutTrigger={zoomOutTrigger}
        />
      </Canvas>

      {/* "Click the screen" hint for first-time visitors */}
      {showScreenHint && (
        <div className="screen-hint" aria-live="polite">
          Click the monitor to enter
        </div>
      )}

      {/* Full-screen OS overlay — mounts after zoom-in completes, fades in/out */}
      {osOverlayMounted && (
        <div
          className="os-fullscreen-overlay"
          style={{
            opacity: osOverlayVisible ? 1 : 0,
            pointerEvents: osOverlayVisible ? 'auto' : 'none',
            transition: osOverlayVisible
              ? 'opacity 0.25s ease'
              : 'opacity 0.15s ease',
          }}
        >
          <React.Suspense fallback={<div style={{ width: '100%', height: '100%', background: '#1e3a8a' }} />}>
            <RetroOS isZoomedIn={true} fullscreen={true} />
          </React.Suspense>
        </div>
      )}
    </div>
  );
};

export default LandingScene;
