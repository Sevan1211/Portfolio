import { useRef } from 'react';
import * as THREE from 'three';

interface CameraConfig {
  rotationSensitivityX: number;
  rotationSensitivityY: number;
  initialYaw: number;
  initialPitch: number;
}

interface DragRotation {
  yaw: number;
  pitch: number;
}

export const useCameraControls = (config: CameraConfig, camera: THREE.Camera | null) => {
  const dragStartRef = useRef({ x: 0, y: 0, startYaw: 0, startPitch: 0 });

  // Smooth interpolation values
  const currentRotationRef = useRef({ yaw: config.initialYaw, pitch: config.initialPitch });
  const targetRotationRef = useRef({ yaw: config.initialYaw, pitch: config.initialPitch });

  const handleDrag = (
    deltaX: number,
    deltaY: number
  ): DragRotation => {
    const newYaw = dragStartRef.current.startYaw +
      (deltaX / window.innerWidth) * Math.PI * config.rotationSensitivityX;
    const newPitch = dragStartRef.current.startPitch -
      (deltaY / window.innerHeight) * Math.PI * config.rotationSensitivityY;

    const clampedPitch = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, newPitch));

    return { yaw: newYaw, pitch: clampedPitch };
  };

  const startDrag = (x: number, y: number, currentRotation: DragRotation) => {
    dragStartRef.current = {
      x,
      y,
      startYaw: currentRotation.yaw,
      startPitch: currentRotation.pitch,
    };
  };

  const applyRotation = (rotation: DragRotation, mousePos: { x: number; y: number }) => {
    if (!camera) {return;}

    // Subtle mouse parallax effect (reduced from 0.05/0.03)
    const hoverYaw = mousePos.x * 0.02;
    const hoverPitch = -mousePos.y * 0.015;

    // Set target rotation
    targetRotationRef.current.yaw = rotation.yaw + hoverYaw;
    targetRotationRef.current.pitch = rotation.pitch + hoverPitch;

    // Smooth lerp to target (0.08 = smooth, higher = snappier)
    const lerpFactor = 0.08;
    currentRotationRef.current.yaw += (targetRotationRef.current.yaw - currentRotationRef.current.yaw) * lerpFactor;
    currentRotationRef.current.pitch += (targetRotationRef.current.pitch - currentRotationRef.current.pitch) * lerpFactor;

    // Apply smoothed rotation
    camera.rotation.order = 'YXZ';
    camera.rotation.y = currentRotationRef.current.yaw;
    camera.rotation.x = currentRotationRef.current.pitch;
    camera.rotation.z = 0;
  };

  const resetRotation = (yaw: number, pitch: number) => {
    currentRotationRef.current = { yaw, pitch };
    targetRotationRef.current = { yaw, pitch };
  };

  return { handleDrag, startDrag, applyRotation, resetRotation };
};

export const useCameraAnimation = () => {
  const fovAnimationProgress = useRef(0);
  const hasStarted = useRef(false);

  const animateFOV = (
    delta: number,
    startFov: number,
    endFov: number,
    duration: number,
    camera: THREE.PerspectiveCamera
  ): boolean => {
    if (fovAnimationProgress.current >= 1) {return false;}

    // On first call, ensure we start from 0 (handles HMR/remount)
    if (!hasStarted.current) {
      hasStarted.current = true;
      fovAnimationProgress.current = 0;
      camera.fov = startFov;
      camera.updateProjectionMatrix();
    }

    fovAnimationProgress.current = Math.min(1, fovAnimationProgress.current + delta / duration);

    const easeProgress = 1 - Math.pow(1 - fovAnimationProgress.current, 3);
    const currentFov = startFov + (endFov - startFov) * easeProgress;

    camera.fov = currentFov;
    camera.updateProjectionMatrix();

    return true;
  };

  const animatePosition = (
    easeProgress: number,
    startPos: { x: number; y: number; z: number },
    endPos: { x: number; y: number; z: number }
  ): { x: number; y: number; z: number } => {
    return {
      x: startPos.x + (endPos.x - startPos.x) * easeProgress,
      y: startPos.y + (endPos.y - startPos.y) * easeProgress,
      z: startPos.z + (endPos.z - startPos.z) * easeProgress,
    };
  };

  return { animateFOV, animatePosition, fovAnimationProgress };
};
