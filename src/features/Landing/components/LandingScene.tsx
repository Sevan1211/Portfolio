import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ACESFilmicToneMapping, PCFSoftShadowMap, SRGBColorSpace } from "three";
import { CubicleScene } from "./CubicleScene";
import { LoadingScene } from "./loading/LoadingScene";
import { QUALITY } from "./deviceTier";

interface EventManager {
  enabled: boolean;
}

const EventController: React.FC<{ monitorActive: boolean }> = ({
  monitorActive,
}) => {
  const { events } = useThree();

  useEffect(() => {
    if (!events || !("enabled" in events)) return;
    const manager = events as unknown as EventManager;
    manager.enabled = !monitorActive;
    return () => {
      manager.enabled = true;
    };
  }, [events, monitorActive]);

  return null;
};

// Entry choreography: the globe departs while a blue veil fades in over it,
// the room is staged (camera placed, shaders warmed) behind the opaque veil,
// then the veil lifts as the camera glides down into the cubicle. One color,
// no hard cuts.
const DEPARTURE_DURATION_SECONDS = 0.72;
const VEIL_HOLD_MS = 80;
/** Keep in sync with the .os-overlay transition in landing.css. */
const OS_FADE_MS = 260;

// Only downloaded when a visitor actually opens the computer.
const RetroOS = React.lazy(() =>
  import("./OS").then((module) => ({ default: module.RetroOS })),
);

const usePrefersReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return reducedMotion;
};

const DepartureDirector: React.FC<{
  active: boolean;
  reducedMotion: boolean;
  progressRef: MutableRefObject<number>;
  onComplete: () => void;
}> = ({ active, reducedMotion, progressRef, onComplete }) => {
  const { invalidate } = useThree();
  const completedRef = useRef(false);

  useEffect(() => {
    if (!active) return;
    progressRef.current = 0;
    completedRef.current = false;
    invalidate();
  }, [active, invalidate, progressRef]);

  useFrame((_state, delta) => {
    if (!active || completedRef.current) return;
    progressRef.current = reducedMotion
      ? 1
      : Math.min(
          1,
          progressRef.current +
            Math.min(delta, 0.1) / DEPARTURE_DURATION_SECONDS,
        );
    if (progressRef.current < 1) invalidate();
    if (progressRef.current >= 1) {
      completedRef.current = true;
      onComplete();
    }
  });

  return null;
};

const LandingScene: React.FC = () => {
  const [globePresented, setGlobePresented] = useState(false);
  const [scenePrepared, setScenePrepared] = useState(false);
  const [departureStarted, setDepartureStarted] = useState(false);
  const [roomStaged, setRoomStaged] = useState(false);
  const [roomActive, setRoomActive] = useState(false);
  const [roomReady, setRoomReady] = useState(false);
  const [monitorActive, setMonitorActive] = useState(false);
  const [enterMonitorTrigger, setEnterMonitorTrigger] = useState(0);
  const [zoomOutTrigger, setZoomOutTrigger] = useState(0);
  /** OS overlay is in the tree (kept mounted through the fade-out). */
  const [osMounted, setOsMounted] = useState(false);
  /** OS overlay is faded in. */
  const [osVisible, setOsVisible] = useState(false);
  const osUnmountTimerRef = useRef(0);
  const departureProgressRef = useRef(0);
  const pageCoverHiddenRef = useRef(false);
  const reducedMotion = usePrefersReducedMotion();

  const handleGlobeReady = useCallback(() => {
    if (pageCoverHiddenRef.current) return;
    pageCoverHiddenRef.current = true;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const pageCover = document.getElementById("page-cover");
        if (pageCover) {
          // The cover and the rendered field share the same blue, so this
          // fade reads as the globe surfacing rather than a curtain lifting.
          pageCover.style.opacity = "0";
          window.setTimeout(() => {
            pageCover.style.display = "none";
          }, 520);
        }
        setGlobePresented(true);
      });
    });
  }, []);

  useEffect(() => {
    if (globePresented && scenePrepared && !departureStarted) {
      setDepartureStarted(true);
    }
  }, [departureStarted, globePresented, scenePrepared]);

  // Once the veil is opaque the room gets staged; after a short hold the
  // veil lifts while the descent begins.
  useEffect(() => {
    if (!roomStaged) return;
    const hold = window.setTimeout(
      () => setRoomActive(true),
      reducedMotion ? 60 : VEIL_HOLD_MS,
    );
    return () => window.clearTimeout(hold);
  }, [reducedMotion, roomStaged]);

  // Leaving fades the overlay out while the camera pulls back, then unmounts
  // the OS once the fade has finished.
  const leaveMonitor = useCallback(() => {
    setOsVisible(false);
    setZoomOutTrigger((current) => current + 1);
    window.clearTimeout(osUnmountTimerRef.current);
    osUnmountTimerRef.current = window.setTimeout(
      () => setOsMounted(false),
      OS_FADE_MS,
    );
  }, []);

  // The camera reaches the screen → mount the OS, then flip it visible on the
  // next frame so the CSS transition actually runs.
  const handleZoomComplete = useCallback(() => {
    setMonitorActive(true);
    setOsMounted(true);
    window.clearTimeout(osUnmountTimerRef.current);
    requestAnimationFrame(() => setOsVisible(true));
  }, []);

  useEffect(() => () => window.clearTimeout(osUnmountTimerRef.current), []);

  useEffect(() => {
    if (!monitorActive) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        leaveMonitor();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [leaveMonitor, monitorActive]);

  // The OS's Start > Shut Down dispatches this rather than threading a
  // callback down through the 3D scene into the portalled DOM.
  useEffect(() => {
    if (!monitorActive) return;
    const onLeaveRequest = () => leaveMonitor();
    window.addEventListener("retro-os:leave", onLeaveRequest);
    return () => window.removeEventListener("retro-os:leave", onLeaveRequest);
  }, [leaveMonitor, monitorActive]);

  const enterMonitor = useCallback(() => {
    setEnterMonitorTrigger((current) => current + 1);
  }, []);

  const veilClass = !departureStarted
    ? "scene-veil"
    : roomActive
      ? "scene-veil scene-veil--out"
      : "scene-veil scene-veil--in";

  return (
    <div className="landing-canvas">
      <Canvas
        shadows
        frameloop="demand"
        // Capability-tiered instead of drei's adaptive pair: the idle loop is
        // deliberately throttled to ~30fps, which PerformanceMonitor would
        // misread as struggling and permanently blur the scene. Capable
        // machines get the full cap (the OS text is DOM and renders at native
        // resolution regardless of canvas DPR).
        dpr={[1, QUALITY.maxDpr]}
        gl={{
          antialias: QUALITY.antialias,
          alpha: false,
          powerPreference: "high-performance",
        }}
        camera={{ position: [0, 0, 8], fov: 50, near: 0.5, far: 200 }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = SRGBColorSpace;
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.08;
          gl.shadowMap.enabled = true;
          // Soft filtering hides depth-quantization banding; affordable
          // because the shadow pass renders once and is then frozen.
          gl.shadowMap.type = PCFSoftShadowMap;
          gl.setClearColor("#1e3a8a", 1);
          gl.clear();
        }}
      >
        <EventController monitorActive={monitorActive} />
        {!roomStaged && (
          <LoadingScene
            transitionProgressRef={departureProgressRef}
            reducedMotion={reducedMotion}
            onReady={handleGlobeReady}
          />
        )}
        <DepartureDirector
          active={departureStarted}
          reducedMotion={reducedMotion}
          progressRef={departureProgressRef}
          onComplete={() => setRoomStaged(true)}
        />
        {globePresented && (
          <Suspense fallback={null}>
            <CubicleScene
              roomStaged={roomStaged}
              roomActive={roomActive}
              osOverlayOpen={osVisible}
              reducedMotion={reducedMotion}
              enterMonitorTrigger={enterMonitorTrigger}
              zoomOutTrigger={zoomOutTrigger}
              onPrepared={() => setScenePrepared(true)}
              onRoomReady={() => setRoomReady(true)}
              onZoomChange={setMonitorActive}
              onZoomComplete={handleZoomComplete}
            />
          </Suspense>
        )}
      </Canvas>

      <div className={veilClass} aria-hidden="true" />

      {/* Full-screen Retro OS. The camera stays parked at the monitor behind
          it, so leaving fades this out onto the exact frame it covered. */}
      {osMounted && (
        <div className={`os-overlay${osVisible ? " os-overlay--visible" : ""}`}>
          <Suspense fallback={null}>
            <RetroOS isZoomedIn fullscreen />
          </Suspense>
        </div>
      )}

      {/* Keyboard-only path into the computer: visually hidden until focused,
          so the scene stays clean while staying accessible. */}
      {roomReady && !monitorActive && (
        <button
          className="scene-entry-a11y"
          type="button"
          onClick={enterMonitor}
        >
          Open the computer
        </button>
      )}
    </div>
  );
};

export default LandingScene;
