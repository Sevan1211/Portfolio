import React, { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Center, Text3D } from "@react-three/drei";
import {
  BackSide,
  BoxGeometry,
  Color,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
} from "three";

// ── Faithful port of the original star-shell loader ──
// 1,200 tiny white cubes in a spherical shell around a centered "7"; the whole
// group (7 included) rotates together. Same seeded distribution, sizes, and
// speed as the shipped original - only the plumbing changed: it now lives in
// the shared canvas and fades out under the transition veil instead of
// unmounting its own overlay canvas.
const PARTICLE_COUNT = 1200;
const PARTICLE_COLOR = new Color("#ffffff");
const PARTICLE_SIZE = 0.03;
const FIELD_BLUE = "#1e3a8a";

// Frames to render with the "7" visible before firing onReady.
// This gives the GPU time to present the frame before the page-cover fades.
const VISIBLE_SETTLE_FRAMES = 3;

// Seeded random for deterministic particle positions
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const DEG2RAD = Math.PI / 180;
const PHI_MIN = 10 * DEG2RAD;
const PHI_MAX = 170 * DEG2RAD;

/**
 * Precompute all particle transforms into a single Float32Array.
 * This runs once at module load - zero cost at render time.
 */
const particleMatrices = (() => {
  const dummy = new Object3D();
  const matrices = new Float32Array(PARTICLE_COUNT * 16);
  const mat = new Matrix4();

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const r1 = seededRandom(i);
    const r2 = seededRandom(i + 1000);
    const r3 = seededRandom(i + 2000);

    const distance = 2.2 + (3.0 - 2.2) * r1;
    const phi = PHI_MIN + (PHI_MAX - PHI_MIN) * r2;
    const theta = 2 * Math.PI * (i / PARTICLE_COUNT) + r3 * Math.PI * 2;

    dummy.position.setFromSphericalCoords(distance, phi, theta);
    dummy.updateMatrix();
    mat.copy(dummy.matrix);
    mat.toArray(matrices, i * 16);
  }

  return matrices;
})();

interface LoadingSceneProps {
  /** 0 = fully visible; 1 = fully departed (veil is opaque). */
  transitionProgress?: number;
  transitionProgressRef?: MutableRefObject<number>;
  reducedMotion?: boolean;
  /**
   * Caps how often this scene asks for new frames. The monitor screensaver
   * runs at a retro cadence instead of driving the whole canvas at display
   * refresh; the entry loader leaves this unset for full smoothness.
   */
  idleFps?: number;
  onReady?: () => void;
}

export const LoadingScene: React.FC<LoadingSceneProps> = ({
  transitionProgress = 0,
  transitionProgressRef,
  reducedMotion = false,
  idleFps,
  onReady,
}) => {
  const { invalidate } = useThree();
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<InstancedMesh>(null);
  const textRef = useRef<Mesh>(null);
  const textMaterialRef = useRef<MeshBasicMaterial>(null);
  const readyFired = useRef(false);
  const visibleFrames = useRef(0);
  const throttleTimerRef = useRef(0);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(
    () => () => window.clearTimeout(throttleTimerRef.current),
    [],
  );

  const requestFrame = () => {
    if (!idleFps) {
      invalidate();
      return;
    }
    // Schedule the next frame at the capped cadence; interactions elsewhere
    // can still render faster, this only guarantees the floor.
    if (throttleTimerRef.current) return;
    throttleTimerRef.current = window.setTimeout(() => {
      throttleTimerRef.current = 0;
      invalidate();
    }, 1000 / idleFps);
  };

  const geometry = useMemo(
    () => new BoxGeometry(PARTICLE_SIZE, PARTICLE_SIZE, PARTICLE_SIZE),
    [],
  );
  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        color: PARTICLE_COLOR,
        transparent: true,
      }),
    [],
  );
  // Backdrop sphere instead of scene.background: it skips tone mapping, so
  // the rendered field is the exact same #1e3a8a as the DOM page cover and
  // the transition veil - the fades read as one continuous color.
  const backdropMaterial = useMemo(() => {
    const backdrop = new MeshBasicMaterial({
      color: FIELD_BLUE,
      side: BackSide,
      toneMapped: false,
    });
    backdrop.fog = false;
    return backdrop;
  }, []);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
      backdropMaterial.dispose();
    },
    [backdropMaterial, geometry, material],
  );

  // Apply all instance transforms in one shot
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const mat = new Matrix4();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      mat.fromArray(particleMatrices, i * 16);
      mesh.setMatrixAt(i, mat);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame((_state, delta) => {
    const currentTransitionProgress =
      transitionProgressRef?.current ?? transitionProgress;
    const group = groupRef.current;

    if (group) {
      if (!reducedMotion && group.visible) {
        group.rotation.y += delta * 0.3;
      }
      // Departure: a gentle push outward while the veil covers the fade.
      const eased =
        currentTransitionProgress *
        currentTransitionProgress *
        (3 - 2 * currentTransitionProgress);
      group.scale.setScalar(1 + eased * 0.15);
    }

    const opacity = Math.max(0, 1 - currentTransitionProgress * 1.6);
    material.opacity = opacity;
    if (textMaterialRef.current) textMaterialRef.current.opacity = opacity;

    if (!reducedMotion && currentTransitionProgress < 1) requestFrame();

    if (readyFired.current || currentTransitionProgress > 0.02) return;
    invalidate();

    if (!group) return;

    // Phase 1: wait for Text3D font to load and produce geometry
    if (!group.visible) {
      const geo = textRef.current?.geometry;
      if (geo?.attributes?.position && geo.attributes.position.count > 0) {
        // Geometry exists - make visible. R3F will render it THIS frame.
        group.visible = true;
      }
      return;
    }

    // Phase 2: group is visible; count frames the GPU has actually rendered it
    visibleFrames.current++;
    if (visibleFrames.current >= VISIBLE_SETTLE_FRAMES) {
      readyFired.current = true;
      // Fire onReady - the caller uses double-rAF to guarantee browser paint
      onReadyRef.current?.();
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <mesh>
        <sphereGeometry args={[40, 16, 12]} />
        <primitive object={backdropMaterial} attach="material" />
      </mesh>
      <group ref={groupRef} visible={false}>
        <Center>
          <Text3D
            ref={textRef}
            font="/fonts/helvetiker_regular.typeface.json"
            size={1.7}
            height={0.2}
            curveSegments={6}
          >
            7
            <meshBasicMaterial
              ref={textMaterialRef}
              color="#ffffff"
              transparent
            />
          </Text3D>
        </Center>
        <instancedMesh
          ref={meshRef}
          args={[geometry, material, PARTICLE_COUNT]}
          frustumCulled={false}
        />
      </group>
    </>
  );
};
