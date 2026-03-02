import React, { useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';

/* ── Particles (matches LoadingScene) ── */
const PARTICLE_COUNT = 1200;
const PARTICLE_COLOR = new THREE.Color('#ffffff');
const PARTICLE_SIZE = 0.03;

const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const DEG2RAD = Math.PI / 180;
const PHI_MIN = 10 * DEG2RAD;
const PHI_MAX = 170 * DEG2RAD;

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

/* ── Inner scene ── */
const Spinning7: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const geometry = useMemo(
    () => new THREE.BoxGeometry(PARTICLE_SIZE, PARTICLE_SIZE, PARTICLE_SIZE),
    [],
  );
  const material = useMemo(
    () => new THREE.MeshBasicMaterial({ color: PARTICLE_COLOR }),
    [],
  );

  // Dispose GPU resources on unmount
  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const mat = new THREE.Matrix4();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      mat.fromArray(particleMatrices, i * 16);
      mesh.setMatrixAt(i, mat);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <group ref={groupRef}>
        <Center>
          <Text3D
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

/* ── Canvas wrapper — used as a background layer ── */
export const PhoneBackground: React.FC = () => (
  <div className="mobile-bg">
    <Canvas
      camera={{ position: [0, 0, 8], fov: 50 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'default' }}
      dpr={[1, 1.5]}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#1e3a8a']} />
      <Spinning7 />
    </Canvas>
  </div>
);
