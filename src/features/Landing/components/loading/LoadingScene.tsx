import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';

const PARTICLE_COUNT = 2000;
const PARTICLE_COLOR = new THREE.Color('#ffffff');
const PARTICLE_SIZE = 0.03;

// Seeded random for deterministic particle positions
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const DEG2RAD = Math.PI / 180;
const PHI_MIN = 10 * DEG2RAD;
const PHI_MAX = 170 * DEG2RAD;

/**
 * Precompute all 2000 particle transforms into a single Float32Array.
 * This runs once at module load — zero cost at render time.
 */
const particleMatrices = (() => {
  const dummy = new THREE.Object3D();
  const matrices = new Float32Array(PARTICLE_COUNT * 16);
  const mat = new THREE.Matrix4();

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

export const LoadingScene: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Apply precomputed matrices to InstancedMesh once on mount
  const geometry = useMemo(() => new THREE.BoxGeometry(PARTICLE_SIZE, PARTICLE_SIZE, PARTICLE_SIZE), []);
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: PARTICLE_COLOR }), []);

  // Set instance matrices on first render
  useMemo(() => {
    // This will be applied via ref in the effect below
  }, []);

  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  // Apply all instance transforms in one shot
  React.useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const mat = new THREE.Matrix4();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      mat.fromArray(particleMatrices, i * 16);
      mesh.setMatrixAt(i, mat);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <>
      <ambientLight intensity={0.6} />
      <group ref={groupRef}>
        <Center>
          <Text3D
            font="/fonts/helvetiker_regular.typeface.json"
            size={1.7}
            height={0.2}
            curveSegments={12}
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
