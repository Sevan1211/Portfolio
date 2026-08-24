import React, { useCallback, useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Color,
  Euler,
  Fog,
  Group,
  Matrix4,
  Mesh,
  PerspectiveCamera,
  Quaternion,
  Texture,
  Vector3,
} from "three";
import { OfficeCubicle } from "./OfficeCubicle";
import { useCameraControls } from "../hooks/useCameraControls";
import { QUALITY } from "./deviceTier";

interface CubicleSceneProps {
  /** Camera parked at the intro start behind the opaque veil. */
  roomStaged: boolean;
  /** Veil is lifting; run the descent into the room. */
  roomActive: boolean;
  /** The full-screen OS is covering the canvas; pause all per-frame work. */
  osOverlayOpen: boolean;
  reducedMotion?: boolean;
  enterMonitorTrigger?: number;
  zoomOutTrigger?: number;
  onModelLoaded?: () => void;
  onRoomReady?: () => void;
  onZoomChange?: (isZoomed: boolean) => void;
  onZoomComplete?: () => void;
}

const CAMERA_CONFIG = {
  rotationSensitivityX: 0.5,
  rotationSensitivityY: 0.4,
  initialYaw: 0.72,
  initialPitch: -0.3,
};

const GLOBE_CAMERA_POSITION = new Vector3(0, 0, 8);
// The original intro: a straight glide from high above down to the desk with
// the camera rotation fixed, FOV settling 95 → 75 over 2 s. Kept verbatim -
// only the reveal (the veil fade) around it is new.
const ROOM_START_POSITION = new Vector3(4, 12, -7);
const ROOM_REST_POSITION = new Vector3(0, 7, -10);
const INTRO_DURATION_SECONDS = 2.0;
const INTRO_FOV_START = 95;
const INTRO_FOV_END = 75;
const GLOBE_BACKGROUND = new Color("#1e3a8a");
const ROOM_BACKGROUND = new Color("#000000");
// Zoomed-in framing: how much of the viewport the screen may fill. Kept
// well under 100% so the CRT bezel stays visibly in frame on every aspect
// ratio - the OS should read as embedded in the monitor, not as a floating
// full-page overlay.
const MONITOR_FILL_WIDTH = 0.84;
const MONITOR_FILL_HEIGHT = 0.8;
const ROOM_START_QUATERNION = new Quaternion().setFromEuler(
  new Euler(CAMERA_CONFIG.initialPitch, CAMERA_CONFIG.initialYaw, 0, "YXZ"),
);

const makeLookQuaternion = (position: Vector3, target: Vector3) => {
  const camera = new PerspectiveCamera();
  camera.position.copy(position);
  camera.lookAt(target);
  return camera.quaternion.clone();
};

const GLOBE_CAMERA_QUATERNION = makeLookQuaternion(
  GLOBE_CAMERA_POSITION,
  new Vector3(),
);
const WIDE_MONITOR_VERTICAL_FOV = 46;
const WIDE_MONITOR_ASPECT = 16 / 9;
const MONITOR_HORIZONTAL_FOV =
  2 *
  Math.atan(
    Math.tan((WIDE_MONITOR_VERTICAL_FOV * Math.PI) / 360) * WIDE_MONITOR_ASPECT,
  );

const getMonitorFov = (aspect: number) => {
  const fittedFov =
    (2 *
      Math.atan(Math.tan(MONITOR_HORIZONTAL_FOV / 2) / Math.max(aspect, 0.5)) *
      180) /
    Math.PI;
  return Math.min(64, Math.max(WIDE_MONITOR_VERTICAL_FOV, fittedFov));
};

const smoothStep = (value: number) => value * value * (3 - 2 * value);

export const CubicleScene: React.FC<CubicleSceneProps> = ({
  roomStaged,
  roomActive,
  osOverlayOpen,
  reducedMotion = false,
  enterMonitorTrigger = 0,
  zoomOutTrigger = 0,
  onModelLoaded,
  onRoomReady,
  onZoomChange,
  onZoomComplete,
}) => {
  const { camera: sceneCamera, gl, scene, invalidate, setDpr } = useThree();
  // This canvas is configured with a perspective camera in LandingScene.
  const camera = sceneCamera as PerspectiveCamera;
  const invalidateRef = useRef(invalidate);
  useEffect(() => {
    invalidateRef.current = invalidate;
  }, [invalidate]);
  const roomGroupRef = useRef<Group>(null);
  const [isScreenHovered, setIsScreenHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const isZoomedInRef = useRef(false);
  const roomReadyRef = useRef(false);
  const roomIntroProgressRef = useRef(-1);
  const screenWorldPositionRef = useRef<Vector3 | null>(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });
  const isMouseDownRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const ignoreNextScreenClickRef = useRef(false);
  const activeRoomRef = useRef(roomActive);
  const lastEnterTriggerRef = useRef(enterMonitorTrigger);
  const lastZoomOutTriggerRef = useRef(zoomOutTrigger);
  const roomReadyNotifiedRef = useRef(false);
  const screenMeshRef = useRef<Mesh | null>(null);

  const dragRotationRef = useRef({
    yaw: CAMERA_CONFIG.initialYaw,
    pitch: CAMERA_CONFIG.initialPitch,
  });
  const { handleDrag, startDrag, applyRotation, resetRotation } =
    useCameraControls(CAMERA_CONFIG, camera);
  const handleDragRef = useRef(handleDrag);
  const startDragRef = useRef(startDrag);
  useEffect(() => {
    handleDragRef.current = handleDrag;
    startDragRef.current = startDrag;
  }, [handleDrag, startDrag]);

  const introPositionRef = useRef(new Vector3());
  const roomStagedRef = useRef(false);
  const shadowWarmupFramesRef = useRef(0);
  const shadowFrozenRef = useRef(false);
  const frameSamplesRef = useRef<number[]>([]);
  const dprStepRef = useRef(0);
  /** Latest pointer position, consumed once per rendered frame. */
  const pendingPointerRef = useRef<{ x: number; y: number } | null>(null);
  /** Resolution the scene renders at when the camera is still. */
  const baseDprRef = useRef(QUALITY.maxDpr);
  /** True while the drag renders at reduced resolution. */
  const motionDprActiveRef = useRef(false);
  /** Adaptive step-downs collected mid-motion, applied only once settled. */
  const pendingDprStepRef = useRef(0);
  const setDprRef = useRef(setDpr);
  setDprRef.current = setDpr;

  const monitorZoomProgressRef = useRef(-1);
  const monitorZoomOutProgressRef = useRef(-1);
  const monitorZoomStartPositionRef = useRef(new Vector3());
  const monitorZoomStartQuaternionRef = useRef(new Quaternion());
  const monitorZoomStartFovRef = useRef(75);
  const monitorZoomTargetFovRef = useRef(WIDE_MONITOR_VERTICAL_FOV);
  const monitorZoomTargetPositionRef = useRef(new Vector3());
  const monitorZoomTargetQuaternionRef = useRef(new Quaternion());
  const returnCameraPositionRef = useRef(ROOM_REST_POSITION.clone());
  const returnCameraQuaternionRef = useRef(ROOM_START_QUATERNION.clone());
  const returnCameraFovRef = useRef(75);
  const monitorReadyNotifiedRef = useRef(false);
  const monitorTransitionRef = useRef(false);

  useEffect(() => {
    camera.position.copy(GLOBE_CAMERA_POSITION);
    camera.quaternion.copy(GLOBE_CAMERA_QUATERNION);
    camera.fov = 50;
    camera.updateProjectionMatrix();
    scene.background = GLOBE_BACKGROUND;
    scene.fog = new Fog("#000000", 15, 35);

    return () => {
      scene.fog = null;
      gl.shadowMap.autoUpdate = true;
    };
  }, [camera, gl, scene]);

  // Behind the opaque veil: park the camera at the top of the descent, then
  // force every shader and texture in the room onto the GPU before anything
  // is visible. Without this, each prop compiles its program and uploads its
  // textures the first time it scrolls into view - which lands as a frame
  // hitch mid-drag. Paying it once here is invisible; paying it later isn't.
  useEffect(() => {
    if (!roomStaged || roomStagedRef.current) return;
    roomStagedRef.current = true;
    camera.position.copy(ROOM_START_POSITION);
    camera.quaternion.copy(ROOM_START_QUATERNION);
    camera.fov = INTRO_FOV_START;
    camera.updateProjectionMatrix();
    scene.background = ROOM_BACKGROUND;

    gl.compile(scene, camera);
    const uploaded = new Set<Texture>();
    scene.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      materials.forEach((material) => {
        if (!material) return;
        Object.values(material).forEach((value) => {
          if (!(value instanceof Texture) || uploaded.has(value)) return;
          uploaded.add(value);
          gl.initTexture(value);
        });
      });
    });

    invalidate();
  }, [camera, gl, invalidate, roomStaged, scene]);

  useEffect(() => {
    if (!roomActive || activeRoomRef.current) {
      activeRoomRef.current = roomActive;
      return;
    }

    activeRoomRef.current = true;
    roomIntroProgressRef.current = 0;
    roomReadyRef.current = false;
    roomReadyNotifiedRef.current = false;
    dragRotationRef.current = {
      yaw: CAMERA_CONFIG.initialYaw,
      pitch: CAMERA_CONFIG.initialPitch,
    };
    resetRotation(CAMERA_CONFIG.initialYaw, CAMERA_CONFIG.initialPitch);
    // Demand frameloop: the descent needs a first frame to start itself.
    invalidate();
  }, [invalidate, resetRotation, roomActive]);

  const startMonitorZoom = useCallback(() => {
    const screenMesh = screenMeshRef.current;
    if (
      !roomReadyRef.current ||
      !screenMesh ||
      isZoomedInRef.current ||
      monitorTransitionRef.current
    ) {
      return;
    }

    monitorTransitionRef.current = true;
    isZoomedInRef.current = true;
    setIsZoomedIn(true);
    onZoomChange?.(true);

    monitorZoomStartPositionRef.current.copy(camera.position);
    monitorZoomStartQuaternionRef.current.copy(camera.quaternion);
    monitorZoomStartFovRef.current = camera.fov;
    returnCameraPositionRef.current.copy(camera.position);
    returnCameraQuaternionRef.current.copy(camera.quaternion);
    returnCameraFovRef.current = camera.fov;

    // Perfectly aligned framing: park the camera on the screen plane's own
    // normal with the plane's up axis, at the distance where the screen fills
    // most of the viewport. The DOM then renders as a true axis-aligned
    // rectangle - no keystone, no skew.
    screenMesh.updateWorldMatrix(true, false);
    const screenCenter = new Vector3();
    screenMesh.getWorldPosition(screenCenter);
    const worldQuaternion = new Quaternion();
    screenMesh.getWorldQuaternion(worldQuaternion);

    const normal = new Vector3(0, 0, 1)
      .applyQuaternion(worldQuaternion)
      .normalize();
    const towardCamera = new Vector3().subVectors(
      camera.position,
      screenCenter,
    );
    if (normal.dot(towardCamera) < 0) normal.negate();
    const up = new Vector3(0, 1, 0).applyQuaternion(worldQuaternion).normalize();

    if (!screenMesh.geometry.boundingBox) {
      screenMesh.geometry.computeBoundingBox();
    }
    const bounds = screenMesh.geometry.boundingBox;
    const worldScale = new Vector3();
    screenMesh.getWorldScale(worldScale);
    const screenWidth = bounds
      ? Math.abs((bounds.max.x - bounds.min.x) * worldScale.x)
      : 2.55;
    const screenHeight = bounds
      ? Math.abs((bounds.max.y - bounds.min.y) * worldScale.y)
      : 1.98;

    const fov = getMonitorFov(camera.aspect);
    monitorZoomTargetFovRef.current = fov;
    const tanHalfFov = Math.tan((fov * Math.PI) / 360);
    const distanceForHeight =
      screenHeight / (2 * MONITOR_FILL_HEIGHT * tanHalfFov);
    const distanceForWidth =
      screenWidth / (2 * MONITOR_FILL_WIDTH * tanHalfFov * camera.aspect);
    const distance = Math.max(distanceForHeight, distanceForWidth, 0.6);

    monitorZoomTargetPositionRef.current
      .copy(screenCenter)
      .addScaledVector(normal, distance);
    const lookMatrix = new Matrix4().lookAt(
      monitorZoomTargetPositionRef.current,
      screenCenter,
      up,
    );
    monitorZoomTargetQuaternionRef.current.setFromRotationMatrix(lookMatrix);
    monitorZoomProgressRef.current = 0;
    monitorZoomOutProgressRef.current = -1;
    monitorReadyNotifiedRef.current = false;
    invalidate();
  }, [camera, invalidate, onZoomChange]);

  const leaveMonitor = useCallback(() => {
    if (!isZoomedInRef.current || monitorZoomOutProgressRef.current >= 0) return;

    // The overlay fades out on the DOM side while the camera pulls back, so
    // the two read as one motion.
    monitorTransitionRef.current = true;
    isZoomedInRef.current = false;
    setIsZoomedIn(false);
    onZoomChange?.(false);
    monitorZoomOutProgressRef.current = 0;
    monitorZoomProgressRef.current = -1;
    invalidate();
  }, [invalidate, onZoomChange]);

  useEffect(() => {
    if (enterMonitorTrigger <= lastEnterTriggerRef.current) return;
    lastEnterTriggerRef.current = enterMonitorTrigger;
    startMonitorZoom();
  }, [enterMonitorTrigger, startMonitorZoom]);

  useEffect(() => {
    if (zoomOutTrigger <= lastZoomOutTriggerRef.current) return;
    lastZoomOutTriggerRef.current = zoomOutTrigger;
    leaveMonitor();
  }, [leaveMonitor, zoomOutTrigger]);

  useEffect(() => {
    // Pointer events only record state; all camera work happens inside the
    // render loop. Mice report at up to 1000 Hz - doing anything per event
    // wastes CPU, and driving the camera from a second rAF chain (the old
    // approach) rendered input one frame late and beat against the frame
    // loop. One consumer, one clock: the frame loop reads the freshest
    // pointer at the top of each frame.
    const onMouseMove = (event: MouseEvent) => {
      mousePositionRef.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      };

      if (
        !isMouseDownRef.current ||
        !roomReadyRef.current ||
        isZoomedInRef.current
      )
        return;

      pendingPointerRef.current = { x: event.clientX, y: event.clientY };
    };

    const onMouseDown = (event: MouseEvent) => {
      if (
        !roomReadyRef.current ||
        isZoomedInRef.current ||
        monitorTransitionRef.current
      )
        return;
      isMouseDownRef.current = true;
      hasDraggedRef.current = false;
      pendingPointerRef.current = null;
      dragStartRef.current = { x: event.clientX, y: event.clientY };
      startDragRef.current(
        event.clientX,
        event.clientY,
        dragRotationRef.current,
      );
      // While the button is held the frame loop self-sustains (it keeps
      // invalidating); this first invalidate starts it.
      invalidateRef.current();
    };

    const onMouseUp = () => {
      if (hasDraggedRef.current) {
        ignoreNextScreenClickRef.current = true;
        requestAnimationFrame(() => {
          ignoreNextScreenClickRef.current = false;
        });
      }
      isMouseDownRef.current = false;
      hasDraggedRef.current = false;
      isDraggingRef.current = false;
      pendingPointerRef.current = null;
      setIsDragging(false);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  useEffect(() => {
    document.body.style.cursor = isZoomedIn ? "default" : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [isZoomedIn]);

  const onScreenHover = useCallback((hovered: boolean, position?: Vector3) => {
    setIsScreenHovered(hovered);
    if (position) screenWorldPositionRef.current = position;
  }, []);

  const onScreenReady = useCallback((position: Vector3, mesh?: Mesh) => {
    screenWorldPositionRef.current = position;
    if (mesh) screenMeshRef.current = mesh;
  }, []);

  const onScreenClick = useCallback(() => {
    if (ignoreNextScreenClickRef.current) return;
    startMonitorZoom();
  }, [startMonitorZoom]);

  useFrame((_state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const roomGroup = roomGroupRef.current;
    if (roomGroup) roomGroup.visible = roomStagedRef.current;

    // Runtime safety net for devices the static tier misjudges (core count
    // says nothing about the GPU). Only sampled during continuous motion -
    // the idle loop is deliberately capped at 30fps and would read as a
    // false failure. Steps down at most twice and never back up, so the
    // resolution can't oscillate. Crucially, a step is only RECORDED here;
    // it is applied when the camera settles - resizing the framebuffer in
    // the middle of a drag is itself a visible hitch.
    const inMotion =
      isDraggingRef.current ||
      monitorTransitionRef.current ||
      (roomIntroProgressRef.current >= 0 && roomIntroProgressRef.current < 1);
    if (!inMotion) {
      frameSamplesRef.current.length = 0;
    } else if (
      dprStepRef.current + pendingDprStepRef.current < 2 &&
      rawDelta < 0.1
    ) {
      const samples = frameSamplesRef.current;
      samples.push(rawDelta);
      if (samples.length >= 45) {
        const median = [...samples].sort((a, b) => a - b)[22] ?? 0;
        samples.length = 0;
        if (median > 0.027) {
          pendingDprStepRef.current += 1;
        }
      }
    }

    // Nothing in the room ever moves, so the shadow map only needs to be
    // rendered once. Let a few staged frames draw it, then freeze the pass -
    // full 1024² quality at zero per-frame cost.
    if (roomStagedRef.current && !shadowFrozenRef.current) {
      shadowWarmupFramesRef.current += 1;
      if (shadowWarmupFramesRef.current >= 3) {
        shadowFrozenRef.current = true;
        gl.shadowMap.autoUpdate = false;
      }
    }

    // Before the veil lifts the camera just holds its pose (globe view, or
    // the staged intro start) - no per-frame work needed.
    if (!roomActive) return;

    scene.background = ROOM_BACKGROUND;
    if (roomIntroProgressRef.current >= 0 && roomIntroProgressRef.current < 1) {
      roomIntroProgressRef.current = reducedMotion
        ? 1
        : Math.min(
            1,
            roomIntroProgressRef.current + delta / INTRO_DURATION_SECONDS,
          );
      const introEase = 1 - Math.pow(1 - roomIntroProgressRef.current, 3);

      introPositionRef.current.lerpVectors(
        ROOM_START_POSITION,
        ROOM_REST_POSITION,
        introEase,
      );
      camera.position.copy(introPositionRef.current);
      camera.quaternion.copy(ROOM_START_QUATERNION);
      camera.fov =
        INTRO_FOV_START + (INTRO_FOV_END - INTRO_FOV_START) * introEase;
      camera.updateProjectionMatrix();

      if (roomIntroProgressRef.current >= 1) {
        roomReadyRef.current = true;
        roomReadyNotifiedRef.current = true;
        onRoomReady?.();
      } else {
        invalidate();
      }
      return;
    }

    if (isZoomedInRef.current && monitorZoomProgressRef.current >= 0) {
      monitorZoomProgressRef.current = reducedMotion
        ? 1
        : Math.min(1, monitorZoomProgressRef.current + delta / 0.9);
      const zoomEase = 1 - Math.pow(1 - monitorZoomProgressRef.current, 3);
      camera.position.lerpVectors(
        monitorZoomStartPositionRef.current,
        monitorZoomTargetPositionRef.current,
        zoomEase,
      );
      camera.quaternion.slerpQuaternions(
        monitorZoomStartQuaternionRef.current,
        monitorZoomTargetQuaternionRef.current,
        zoomEase,
      );
      camera.fov =
        monitorZoomStartFovRef.current +
        (monitorZoomTargetFovRef.current - monitorZoomStartFovRef.current) *
          zoomEase;
      camera.updateProjectionMatrix();

      // Hand off to the full-screen OS a touch before the camera settles, so
      // its fade-in overlaps the last of the zoom rather than following it.
      if (
        monitorZoomProgressRef.current >= 0.9 &&
        !monitorReadyNotifiedRef.current
      ) {
        monitorReadyNotifiedRef.current = true;
        onZoomComplete?.();
      }
      if (monitorZoomProgressRef.current >= 1) {
        monitorTransitionRef.current = false;
      } else {
        invalidate();
      }
      return;
    }

    if (!isZoomedInRef.current && monitorZoomOutProgressRef.current >= 0) {
      monitorZoomOutProgressRef.current = reducedMotion
        ? 1
        : Math.min(1, monitorZoomOutProgressRef.current + delta / 0.7);
      const zoomEase = smoothStep(monitorZoomOutProgressRef.current);
      camera.position.lerpVectors(
        monitorZoomTargetPositionRef.current,
        returnCameraPositionRef.current,
        zoomEase,
      );
      camera.quaternion.slerpQuaternions(
        monitorZoomTargetQuaternionRef.current,
        returnCameraQuaternionRef.current,
        zoomEase,
      );
      camera.fov =
        monitorZoomTargetFovRef.current +
        (returnCameraFovRef.current - monitorZoomTargetFovRef.current) *
          zoomEase;
      camera.updateProjectionMatrix();

      if (monitorZoomOutProgressRef.current >= 1) {
        monitorZoomOutProgressRef.current = -1;
        monitorTransitionRef.current = false;
        resetRotation(
          dragRotationRef.current.yaw,
          dragRotationRef.current.pitch,
        );
      } else {
        invalidate();
      }
      return;
    }

    if (!isZoomedInRef.current && roomReadyRef.current) {
      // Consume this frame's pointer input (freshest event wins).
      const pending = pendingPointerRef.current;
      if (pending && isMouseDownRef.current) {
        pendingPointerRef.current = null;
        const deltaX = pending.x - dragStartRef.current.x;
        const deltaY = pending.y - dragStartRef.current.y;
        if (!hasDraggedRef.current && Math.hypot(deltaX, deltaY) > 5) {
          hasDraggedRef.current = true;
          isDraggingRef.current = true;
          setIsDragging(true);
          // Motion resolution: while the camera is being driven, render at
          // ~75% DPR. Fewer pixels guarantee frame-time headroom, and the
          // reduction is invisible while everything is moving. Full
          // resolution comes back the moment the camera settles. Engaging
          // here (not on mousedown) keeps plain clicks resize-free.
          if (!motionDprActiveRef.current) {
            motionDprActiveRef.current = true;
            setDprRef.current(
              Math.max(0.75, Math.round(baseDprRef.current * 0.75 * 100) / 100),
            );
          }
        }
        if (isDraggingRef.current) {
          dragRotationRef.current = handleDragRef.current(deltaX, deltaY);
        }
      }

      const converging = applyRotation(
        dragRotationRef.current,
        mousePositionRef.current,
        delta,
      );

      if (isMouseDownRef.current || converging) {
        // Held or still easing: keep the loop alive at display refresh.
        invalidate();
      } else if (motionDprActiveRef.current) {
        // Camera settled: fold in any adaptive step the drag revealed, then
        // return to full resolution. Both land on a static image, where a
        // resize can't be felt.
        motionDprActiveRef.current = false;
        if (pendingDprStepRef.current > 0) {
          dprStepRef.current += pendingDprStepRef.current;
          pendingDprStepRef.current = 0;
          baseDprRef.current = Math.max(
            1,
            QUALITY.maxDpr - dprStepRef.current * 0.35,
          );
        }
        setDprRef.current(baseDprRef.current);
        invalidate();
      }
    }
  });

  return (
    <>
      <directionalLight
        position={[10, 15, -15]}
        intensity={2.1}
        color="#fff5e6"
        castShadow
        // Renders once (the pass is frozen after warm-up), so a large map
        // and soft filtering are free. normalBias removes the diagonal
        // self-shadowing stripes on surfaces the light grazes.
        shadow-mapSize-width={QUALITY.shadowMapSize}
        shadow-mapSize-height={QUALITY.shadowMapSize}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-camera-far={30}
        shadow-bias={-0.0001}
        shadow-normalBias={0.035}
      />
      <directionalLight
        position={[-8, 8, 10]}
        intensity={0.7}
        color="#b3d9ff"
      />
      <directionalLight
        position={[0, 5, -25]}
        intensity={0.45}
        color="#ffeaa7"
      />
      <ambientLight intensity={0.56} color="#ffffff" />

      <group ref={roomGroupRef} visible={false}>
        <OfficeCubicle
          isScreenHovered={isScreenHovered}
          isDragging={isDragging}
          monitorActive={isZoomedIn}
          osOverlayOpen={osOverlayOpen}
          reducedMotion={reducedMotion}
          onScreenHover={onScreenHover}
          onScreenReady={onScreenReady}
          {...(onModelLoaded ? { onLoaded: onModelLoaded } : {})}
          onScreenClick={onScreenClick}
        />
      </group>
    </>
  );
};
