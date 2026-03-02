import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CubicleScene } from './CubicleScene';
import { LoadingScene } from './loading/LoadingScene';
import { RetroOS } from './OS';

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
  const minLoadTimePassed = useRef(false);
  const renderSettled = useRef(false);

  // Canvas refs
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const webglCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Handle model loaded — wait for 2 animation frames to ensure GPU has composited
  useEffect(() => {
    if (modelLoaded && !renderSettled.current) {
      // Double-rAF: first rAF queues the paint, second rAF fires after the paint
      const id1 = requestAnimationFrame(() => {
        const id2 = requestAnimationFrame(() => {
          renderSettled.current = true;
          setSceneReady(true);
        });
        // Store inner ID for cleanup
        innerFrameId.current = id2;
      });
      let innerFrameId = { current: 0 };
      return () => {
        cancelAnimationFrame(id1);
        cancelAnimationFrame(innerFrameId.current);
      };
    }
    return undefined;
  }, [modelLoaded]);

  // Handle loading completion after minimum time and scene is ready
  useEffect(() => {
    const minLoadTime = setTimeout(() => {
      minLoadTimePassed.current = true;
      if (sceneReady) {
        completeLoading();
      }
    }, LOADING_MIN_TIME);

    return () => clearTimeout(minLoadTime);
  }, [sceneReady]);

  useEffect(() => {
    if (sceneReady && minLoadTimePassed.current) {
      completeLoading();
    }
  }, [sceneReady]);

  const completeLoading = () => {
    setLoadingComplete(true);
    // Fade out the 3D loading overlay
    setLoadingOverlayOpacity(0);
    setTimeout(() => {
      setShowLoadingOverlay(false);
    }, FADE_DURATION);
  };

  // Keep ref in sync for use inside event listeners (avoids stale closure)
  useEffect(() => {
    osOverlayVisibleRef.current = osOverlayVisible;
  }, [osOverlayVisible]);

  /** Called by CubicleScene once the zoom-in animation finishes */
  const handleZoomComplete = useCallback(() => {
    setOsOverlayMounted(true);
    // One rAF delay so React can paint the DOM node before we trigger the CSS transition
    requestAnimationFrame(() => setOsOverlayVisible(true));
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
            gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
            onCreated={({ gl }) => {
              // Force-paint the canvas blue RIGHT NOW, before R3F's render loop starts.
              gl.setClearColor(0x1e3a8a, 1);
              gl.clear();

              // Dismiss the page-cover immediately — the loading overlay div (with
              // background:#1e3a8a) is already behind us so there's no visual gap.
              const cover = document.getElementById('page-cover');
              if (cover) cover.style.display = 'none';
            }}
          >
            <color attach="background" args={['#1e3a8a']} />
            <LoadingScene />
          </Canvas>
        </div>
      )}

      {/* Main 3D scene Canvas */}
      <Canvas
        shadows
        dpr={[1, 2]}
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
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.1; // Slightly brighter for better visibility

          // Blue background matching loading scene — transitions to black when scene is ready.
          // Force immediate clear so the canvas is blue from the first pixel, not default black.
          gl.setClearColor(0x1e3a8a, 1);
          gl.clear();

          // Better shadow quality
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap; // Softer, more realistic shadows

          // Set camera rotation immediately in onCreated (before first frame)
          // This prevents 1-2 frames of wrong camera angle
          camera.rotation.order = 'YXZ';
          camera.rotation.set(-0.3, 0.72, 0); // initialPitch, initialYaw, 0

          webglCanvasRef.current = gl.domElement;
        }}
      >
        <EventController isZoomedIn={isZoomedIn} />
        <CubicleScene
          onModelLoaded={() => setModelLoaded(true)}
          loadingComplete={loadingComplete}
          onZoomChange={setIsZoomedIn}
          onZoomComplete={handleZoomComplete}
          zoomOutTrigger={zoomOutTrigger}
        />
      </Canvas>

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
          <RetroOS isZoomedIn={true} fullscreen={true} />
        </div>
      )}
    </div>
  );
};

export default LandingScene;
