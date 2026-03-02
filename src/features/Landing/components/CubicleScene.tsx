import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useThree, useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { OfficeCubicle } from './OfficeCubicle';
import { useCameraControls, useCameraAnimation } from '../hooks/useCameraControls';

// Preload the cubicle model
const CUBICLE_MODEL_PATH = '/models/low_poly_90s_office_cubicle.glb';
useGLTF.preload(CUBICLE_MODEL_PATH);

interface CubicleSceneProps {
    onModelLoaded?: () => void;
    loadingComplete?: boolean;
    onZoomChange?: (isZoomed: boolean) => void;
    /** Called once the zoom-in animation reaches completion */
    onZoomComplete?: () => void;
    /** Increment this counter to trigger a zoom-out from outside the canvas */
    zoomOutTrigger?: number;
}

const CAMERA_CONFIG = {
    rotationSensitivityX: .5,
    rotationSensitivityY: .4,
    initialYaw: 0.72,
    initialPitch: -0.3,
    zoomDistance: -8.0,
    zoomHeight: 0.0,
    zoomOffsetX: .8,
    zoomOffsetY: 0.0,
    zoomOffsetZ: 8.75,
    lookAtOffsetX: 0.0,
    lookAtOffsetY: 0.0,
    lookAtOffsetZ: 0.0,
};

const FOV_CONFIG = {
    start: 95,
    end: 75,
    duration: 2.0,
};

const CAMERA_POSITION = {
    start: { x: 4, y: 12, z: -7 },
    end: { x: 0, y: 7, z: -10 },
};

export const CubicleScene: React.FC<CubicleSceneProps> = ({
    onModelLoaded,
    loadingComplete = false,
    onZoomChange,
    onZoomComplete,
    zoomOutTrigger,
}) => {
    const sceneRef = useRef<THREE.Group>(null);
    const [isScreenHovered, setIsScreenHovered] = useState(false);
    const [isZoomedIn, setIsZoomedIn] = useState(false);
    const screenWorldPosition = useRef<THREE.Vector3 | null>(null);

    const baseCameraPos = useRef({ ...CAMERA_POSITION.start });
    const initialCameraSet = useRef(false);

    const { camera, scene, gl } = useThree();
    // Use refs for values that change on every mouse move to avoid triggering
    // React re-renders 60+ times/sec, which causes CSS3D DOM thrashing & glitching.
    const mousePosRef = useRef({ x: 0, y: 0 });
    const isDraggingRef = useRef(false);
    const [isDragging, setIsDragging] = useState(false);
    const dragRotationRef = useRef({
        yaw: CAMERA_CONFIG.initialYaw,
        pitch: CAMERA_CONFIG.initialPitch
    });

    const targetCameraPos = useRef({ ...CAMERA_POSITION.start });
    const currentCameraPos = useRef({ ...CAMERA_POSITION.start });
    const dragStartRef = useRef({ x: 0, y: 0 });
    const isMouseDownRef = useRef(false);
    const hasDraggedRef = useRef(false);

    // Store camera state at start of zoom transition
    const zoomStartPosition = useRef<THREE.Vector3>(new THREE.Vector3());
    const zoomStartQuaternion = useRef<THREE.Quaternion>(new THREE.Quaternion());
    const zoomTargetQuaternion = useRef<THREE.Quaternion>(new THREE.Quaternion());
    const zoomProgress = useRef(0);
    const isTransitioning = useRef(false);  // Prevent rapid clicking issues

    // Zoom out animation state
    const zoomOutProgress = useRef(0);
    const zoomOutStartPosition = useRef<THREE.Vector3>(new THREE.Vector3());
    const zoomOutStartQuaternion = useRef<THREE.Quaternion>(new THREE.Quaternion());
    const zoomOutTargetPosition = useRef<THREE.Vector3>(new THREE.Vector3());
    const zoomOutTargetQuaternion = useRef<THREE.Quaternion>(new THREE.Quaternion());
    const zoomOutTargetYaw = useRef(0);
    const zoomOutTargetPitch = useRef(0);

    const { handleDrag, startDrag, applyRotation, resetRotation } = useCameraControls(CAMERA_CONFIG, camera);
    const { animateFOV, animatePosition, fovAnimationProgress } = useCameraAnimation();

    // Initialize camera and background
    // Start with blue to match loading scene, switch to black when loading completes
    useEffect(() => {
        if (scene && gl && camera) {
            if (loadingComplete) {
                scene.background = new THREE.Color(0x000000);
                gl.setClearColor(0x000000, 1);
            } else {
                scene.background = new THREE.Color(0x1e3a8a);
                gl.setClearColor(0x1e3a8a, 1);
            }
            
            // Initialize camera position and sync refs on mount
            if (!initialCameraSet.current) {
                initialCameraSet.current = true;
                camera.position.set(CAMERA_POSITION.start.x, CAMERA_POSITION.start.y, CAMERA_POSITION.start.z);
                
                // Use Euler rotation consistently (matches applyRotation in useCameraControls)
                camera.rotation.order = 'YXZ';
                camera.rotation.set(CAMERA_CONFIG.initialPitch, CAMERA_CONFIG.initialYaw, 0);
                
                // Sync all position refs
                baseCameraPos.current = { ...CAMERA_POSITION.start };
                targetCameraPos.current = { ...CAMERA_POSITION.start };
                currentCameraPos.current = { ...CAMERA_POSITION.start };
            }
        }
    }, [scene, gl, camera, loadingComplete]);

    const isZoomedInRef = useRef(false);

    /**
     * Performs the actual zoom-out animation.
     * Separated from handleBackgroundClick so the external Escape trigger
     * can call it directly, bypassing the isTransitioning guard that may
     * still be active from the zoom-in setTimeout.
     */
    const performZoomOut = useCallback(() => {
            isTransitioning.current = true;
            isZoomedInRef.current = false; // Immediate update for useFrame

            // Capture camera state immediately
            const capturedPosition = camera.position.clone();
            const capturedQuaternion = camera.quaternion.clone();
            capturedQuaternion.normalize();

            // Store captured state for zoom out animation
            zoomOutStartPosition.current.copy(capturedPosition);
            zoomOutStartQuaternion.current.copy(capturedQuaternion);

            // Calculate target position for zoom out (back to normal view)
            const targetPos = new THREE.Vector3(
                baseCameraPos.current.x,
                baseCameraPos.current.y,
                baseCameraPos.current.z
            );
            zoomOutTargetPosition.current.copy(targetPos);

            // Calculate target rotation for zoom out
            // We animate to the base rotation (dragRotation) WITH parallax
            // This ensures a consistent target. The controls will smooth in the parallax when they take over.
            const mp = mousePosRef.current;
            const dr = dragRotationRef.current;
            const hoverYaw = mp.x * 0.02;
            const hoverPitch = -mp.y * 0.015;

            const targetYaw = dr.yaw + hoverYaw;
            const targetPitch = dr.pitch + hoverPitch;

            // Store for control sync
            zoomOutTargetYaw.current = targetYaw;
            zoomOutTargetPitch.current = targetPitch;

            const euler = new THREE.Euler(targetPitch, targetYaw, 0, 'YXZ');
            const tempQuaternion = new THREE.Quaternion();
            tempQuaternion.setFromEuler(euler);
            tempQuaternion.normalize();
            zoomOutTargetQuaternion.current.copy(tempQuaternion);

            // Initialize animation state
            zoomOutProgress.current = 0.001;
            zoomCompletedRef.current = false;
            zoomProgress.current = 0;

            targetCameraPos.current = { ...baseCameraPos.current };

            // Update React state
            setIsZoomedIn(false);
            onZoomChange?.(false);

            setTimeout(() => {
                isTransitioning.current = false;
            }, 1000);
    }, [onZoomChange, camera]);

    // Handle background click - triggers zoom out
    const handleBackgroundClick = useCallback(() => {
        if (isZoomedInRef.current && !isTransitioning.current) {
            performZoomOut();
        }
    }, [performZoomOut]);

    // Stable refs for camera control functions so the event listener effect
    // never needs to re-attach (handleDrag/startDrag are recreated each render).
    const handleDragRef = useRef(handleDrag);
    const startDragRef = useRef(startDrag);
    useEffect(() => {
        handleDragRef.current = handleDrag;
        startDragRef.current = startDrag;
    });

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            const x = (event.clientX / window.innerWidth) * 2 - 1;
            const y = -(event.clientY / window.innerHeight) * 2 + 1;
            mousePosRef.current = { x, y };

            // Check if mouse is down and has moved enough to be considered a drag
            if (isMouseDownRef.current && !hasDraggedRef.current) {
                const deltaX = event.clientX - dragStartRef.current.x;
                const deltaY = event.clientY - dragStartRef.current.y;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

                // Only consider it a drag if moved more than 5 pixels
                if (distance > 5) {
                    hasDraggedRef.current = true;
                    isDraggingRef.current = true;
                    setIsDragging(true);
                }
            }

            if (isDraggingRef.current) {
                const deltaX = event.clientX - dragStartRef.current.x;
                const deltaY = event.clientY - dragStartRef.current.y;
                dragRotationRef.current = handleDragRef.current(deltaX, deltaY);
            }
        };

        const handleMouseDown = (event: MouseEvent) => {
            // Don't allow dragging when zoomed in or transitioning
            if (!isZoomedInRef.current && !isTransitioning.current) {
                isMouseDownRef.current = true;
                hasDraggedRef.current = false;
                dragStartRef.current = { x: event.clientX, y: event.clientY };
                startDragRef.current(event.clientX, event.clientY, dragRotationRef.current);
            }
        };

        const handleMouseUp = () => {
            isMouseDownRef.current = false;
            hasDraggedRef.current = false;
            isDraggingRef.current = false;
            setIsDragging(false);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Stable — all values read via refs, never re-attaches

    // Change cursor when zoomed in to indicate no dragging
    useEffect(() => {
        document.body.style.cursor = isZoomedIn ? 'default' : 'auto';
        return () => { document.body.style.cursor = 'auto'; };
    }, [isZoomedIn]);

    // Stable ref so the zoomOutTrigger effect below never has a stale closure
    const handleBackgroundClickRef = useRef(handleBackgroundClick);
    const performZoomOutRef = useRef(performZoomOut);
    useEffect(() => {
        handleBackgroundClickRef.current = handleBackgroundClick;
        performZoomOutRef.current = performZoomOut;
    }, [handleBackgroundClick, performZoomOut]);

    // External zoom-out trigger — incremented by LandingScene when user presses Escape in full-screen OS.
    // Calls performZoomOut directly to bypass the isTransitioning guard that may still be
    // active from the zoom-in's 1000ms setTimeout, preventing the camera snap-back bug.
    useEffect(() => {
        if (zoomOutTrigger && zoomOutTrigger > 0) {
            // Force-clear transitioning state so the animation can proceed
            isTransitioning.current = false;
            performZoomOutRef.current();
        }
    }, [zoomOutTrigger]);

    // Removed useEffect - rotation now applied in useFrame for smooth 60fps updates

    useEffect(() => {
        dragRotationRef.current = {
            yaw: CAMERA_CONFIG.initialYaw,
            pitch: CAMERA_CONFIG.initialPitch
        };
    }, []);

    // Track zoom completion to know when desktop should be interactive
    const zoomCompletedRef = useRef(false);

    useEffect(() => {
        if (!isZoomedIn) {
            zoomCompletedRef.current = false;
            zoomProgress.current = 0;
        }
    }, [isZoomedIn]);

    // Handle screen click - triggers zoom in
    const handleScreenClick = useCallback(() => {
        if (!isZoomedInRef.current && !isDraggingRef.current && !isTransitioning.current && screenWorldPosition.current) {
            // Trigger zoom in on click (not on hover)
            isTransitioning.current = true;
            isZoomedInRef.current = true; // Immediate update
            const screenPos = screenWorldPosition.current;

            // Capture current camera state immediately
            zoomStartPosition.current.copy(camera.position);
            zoomStartQuaternion.current.copy(camera.quaternion);

            // Calculate target position
            const targetPos = new THREE.Vector3(
                screenPos.x + CAMERA_CONFIG.zoomOffsetX,
                screenPos.y + CAMERA_CONFIG.zoomHeight + CAMERA_CONFIG.zoomOffsetY,
                screenPos.z + CAMERA_CONFIG.zoomDistance + CAMERA_CONFIG.zoomOffsetZ
            );

            // Calculate target rotation (look at screen)
            const tempCamera = camera.clone();
            tempCamera.position.set(
                targetPos.x,
                targetPos.y,
                targetPos.z
            );
            tempCamera.lookAt(
                screenPos.x + CAMERA_CONFIG.lookAtOffsetX,
                screenPos.y + CAMERA_CONFIG.lookAtOffsetY,
                screenPos.z + CAMERA_CONFIG.lookAtOffsetZ
            );
            zoomTargetQuaternion.current.copy(tempCamera.quaternion);

            targetCameraPos.current = {
                x: targetPos.x,
                y: targetPos.y,
                z: targetPos.z
            };

            zoomProgress.current = 0;
            zoomOutProgress.current = -1;

            setIsZoomedIn(true);
            zoomCompletedRef.current = false;
            onZoomChange?.(true);

            // Reset transition flag after animation
            setTimeout(() => {
                isTransitioning.current = false;
            }, 1000);
        }
    }, [camera, onZoomChange]);

    useFrame((_, delta) => {
        // While loading, keep camera at exact start position - no movement or rotation
        if (!loadingComplete) {
            camera.position.set(CAMERA_POSITION.start.x, CAMERA_POSITION.start.y, CAMERA_POSITION.start.z);
            // Keep rotation locked at initial values too
            camera.rotation.order = 'YXZ';
            camera.rotation.set(CAMERA_CONFIG.initialPitch, CAMERA_CONFIG.initialYaw, 0);
            return;
        }

        // Manage fog — attach/detach based on loading (fog doesn't respect group visibility)
        if (!scene.fog) {
            scene.fog = new THREE.Fog('#000000', 15, 35);
        }

        // Apply smooth rotation ONLY when not zoomed in AND not animating zoom out
        // This prevents fighting between the controls and the animation
        if (!isZoomedInRef.current && camera && zoomOutProgress.current <= 0) {
            applyRotation(dragRotationRef.current, mousePosRef.current);
        }

        if (loadingComplete && camera instanceof THREE.PerspectiveCamera) {
            const isAnimating = animateFOV(
                delta,
                FOV_CONFIG.start,
                FOV_CONFIG.end,
                FOV_CONFIG.duration,
                camera
            );

            if (isAnimating) {
                const easeProgress = 1 - Math.pow(1 - fovAnimationProgress.current, 3);
                baseCameraPos.current = animatePosition(
                    easeProgress,
                    CAMERA_POSITION.start,
                    CAMERA_POSITION.end
                );

                if (!isScreenHovered) {
                    targetCameraPos.current = { ...baseCameraPos.current };
                }
            }
        }

        // Smooth zoom transition
        if (isZoomedInRef.current && zoomProgress.current < 1) {
            // Zoom IN animation — matched to zoom-out speed for consistency
            zoomProgress.current = Math.min(zoomProgress.current + delta * 0.8, 1);
            const easeProgress = 1 - Math.pow(1 - zoomProgress.current, 3); // Ease out cubic

            // Interpolate position
            camera.position.lerpVectors(
                zoomStartPosition.current,
                new THREE.Vector3(
                    targetCameraPos.current.x,
                    targetCameraPos.current.y,
                    targetCameraPos.current.z
                ),
                easeProgress
            );

            // Interpolate rotation (slerp for smooth rotation)
            camera.quaternion.slerpQuaternions(
                zoomStartQuaternion.current,
                zoomTargetQuaternion.current,
                easeProgress
            );

            currentCameraPos.current.x = camera.position.x;
            currentCameraPos.current.y = camera.position.y;
            currentCameraPos.current.z = camera.position.z;

            // Trigger overlay near the end of zoom so it fades in as camera settles
            if (zoomProgress.current >= 0.8 && !zoomCompletedRef.current) {
                zoomCompletedRef.current = true;
                onZoomComplete?.();
            }
        } else if (!isZoomedInRef.current && zoomOutProgress.current < 1 && zoomOutProgress.current > 0) {
            // Zoom OUT animation — ease-in-out so camera barely moves while overlay fades
            zoomOutProgress.current = Math.min(zoomOutProgress.current + delta * 0.8, 1);

            // Ease-in-out cubic: slow start → fast middle → slow end
            // This keeps the camera nearly still while the overlay fades out,
            // then the user sees the full sweep back to the original position.
            const t = zoomOutProgress.current;
            const easeProgress = t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;

            // Interpolate position back to normal view using eased progress
            camera.position.lerpVectors(
                zoomOutStartPosition.current,
                zoomOutTargetPosition.current,
                easeProgress
            );

            // Interpolate rotation back to normal view with smooth slerp using eased progress
            camera.quaternion.slerpQuaternions(
                zoomOutStartQuaternion.current,
                zoomOutTargetQuaternion.current,
                easeProgress
            );

            currentCameraPos.current.x = camera.position.x;
            currentCameraPos.current.y = camera.position.y;
            currentCameraPos.current.z = camera.position.z;

            // When zoom out completes, ensure final state is exact
            if (zoomOutProgress.current >= 1) {
                zoomOutProgress.current = -1; // Mark as completed
                // Snap to exact target position and rotation to prevent drift
                camera.position.copy(zoomOutTargetPosition.current);
                camera.quaternion.copy(zoomOutTargetQuaternion.current);
                currentCameraPos.current.x = camera.position.x;
                currentCameraPos.current.y = camera.position.y;
                currentCameraPos.current.z = camera.position.z;

                // Sync the controls with the current rotation
                resetRotation(zoomOutTargetYaw.current, zoomOutTargetPitch.current);
            }
        } else if (!isZoomedInRef.current) {
            // Normal camera movement when not zoomed
            const lerpFactor = 5 * delta;
            currentCameraPos.current.x += (targetCameraPos.current.x - currentCameraPos.current.x) * lerpFactor;
            currentCameraPos.current.y += (targetCameraPos.current.y - currentCameraPos.current.y) * lerpFactor;
            currentCameraPos.current.z += (targetCameraPos.current.z - currentCameraPos.current.z) * lerpFactor;

            camera.position.set(
                currentCameraPos.current.x,
                currentCameraPos.current.y,
                currentCameraPos.current.z
            );
        }
    });

    return (
        <>
            {/* Lights always present — they don't render without visible geometry */}
            {/* Main directional light (key light) - warm overhead */}
            <directionalLight
                position={[10, 15, -15]}
                intensity={2.2}
                color="#fff5e6"
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-camera-left={-20}
                shadow-camera-right={20}
                shadow-camera-top={20}
                shadow-camera-bottom={-20}
                shadow-camera-far={40}
                shadow-bias={-0.0001}
            />

            {/* Fill light - soft blue from opposite side */}
            <directionalLight
                position={[-8, 8, 10]}
                intensity={0.8}
                color="#b3d9ff"
            />

            {/* Rim light - subtle highlight from behind */}
            <directionalLight
                position={[0, 5, -25]}
                intensity={0.5}
                color="#ffeaa7"
            />

            {/* Ambient light - subtle base illumination */}
            <ambientLight intensity={0.4} color="#ffffff" />

            {/* Hemisphere light for natural gradient lighting */}
            <hemisphereLight
                intensity={0.6}
                color="#ffffff"
                groundColor="#000000"
                position={[0, 50, 0]}
            />

            {/* Scene content hidden until loading complete — fog managed in useFrame */}
            <group visible={loadingComplete}>
                <group
                    onClick={(e: ThreeEvent<MouseEvent>) => {
                        // Only handle background clicks when zoomed in
                        // Don't interfere with screen clicks when zoomed out
                        if (isZoomedIn) {
                            // Check if we clicked on the screen mesh specifically
                            const isScreenClick = e.object?.userData?.isScreen === true;

                            if (!isScreenClick) {
                                // Clicked on background/other objects while zoomed in - zoom out
                                e.stopPropagation();
                                handleBackgroundClick();
                            }
                        }
                        // When not zoomed in, let screen clicks pass through to OfficeCubicle
                    }}
                >
                    <group ref={sceneRef}>
                        <OfficeCubicle
                            isScreenHovered={isScreenHovered}
                            isZoomedIn={isZoomedIn}
                            isDragging={isDragging}
                            onScreenHover={useCallback((hovered: boolean, screenPosition?: THREE.Vector3) => {
                                setIsScreenHovered(hovered);
                                if (hovered && screenPosition) {
                                    screenWorldPosition.current = screenPosition;
                                }
                            }, [])}
                            onScreenClick={handleScreenClick}
                            {...(onModelLoaded ? { onLoaded: onModelLoaded } : {})}
                        />
                    </group>
                </group>
            </group>
        </>
    );
};
