import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text3D, Center } from '@react-three/drei';
import { BoxGeometry, Color, Group, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, Object3D } from 'three';

const PARTICLE_COUNT = 1200;
const PARTICLE_COLOR = new Color('#ffffff');
const PARTICLE_SIZE = 0.03;

// Frames to render with the "7" visible before firing onReady.
// This gives the GPU time to present the frame before the page-cover goes away.
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
 * This runs once at module load — zero cost at render time.
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
    const theta = (2 * Math.PI) * (i / PARTICLE_COUNT) + r3 * Math.PI * 2;

    dummy.position.setFromSphericalCoords(distance, phi, theta);
    dummy.updateMatrix();
    mat.copy(dummy.matrix);
    mat.toArray(matrices, i * 16);
  }

  return matrices;
})();

export const LoadingScene: React.FC<{ onReady?: () => void }> = ({ onReady }) => {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<InstancedMesh>(null);
  const textRef = useRef<Mesh>(null);
  const readyFired = useRef(false);
  const visibleFrames = useRef(0);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  // Apply precomputed matrices to InstancedMesh once on mount
  const geometry = useMemo(() => new BoxGeometry(PARTICLE_SIZE, PARTICLE_SIZE, PARTICLE_SIZE), []);
  const material = useMemo(() => new MeshBasicMaterial({ color: PARTICLE_COLOR }), []);

  // Dispose GPU resources on unmount
  React.useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }

    if (readyFired.current) return;

    const group = groupRef.current;
    if (!group) return;

    // Phase 1: wait for Text3D font to load and produce geometry
    if (!group.visible) {
      const geo = textRef.current?.geometry;
      if (geo?.attributes?.position && geo.attributes.position.count > 0) {
        // Geometry exists — make visible. R3F will render it THIS frame.
        group.visible = true;
      }
      return;
    }

    // Phase 2: group is visible; count frames the GPU has actually rendered it
    visibleFrames.current++;
    if (visibleFrames.current >= VISIBLE_SETTLE_FRAMES) {
      readyFired.current = true;
      // Fire onReady — the caller uses double-rAF to guarantee browser paint
      onReadyRef.current?.();
    }
  });

  // Apply all instance transforms in one shot
  React.useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const mat = new Matrix4();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      mat.fromArray(particleMatrices, i * 16);
      mesh.setMatrixAt(i, mat);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <>
      <ambientLight intensity={0.6} />
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
            <meshBasicMaterial color="#ffffff" />
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
