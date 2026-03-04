import React, { useRef, useMemo } from 'react';
import { useThree, useFrame, createPortal, ThreeEvent } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import {
  Color, FrontSide, LinearFilter, LinearMipmapLinearFilter, Mesh,
  MeshBasicMaterial, MeshStandardMaterial, NoColorSpace, Object3D,
  PerspectiveCamera, Raycaster, SRGBColorSpace, Scene, Texture,
  Vector2, Vector3, WebGLRenderTarget,
} from 'three';
import { useSafeLayoutEffect } from '../hooks/useSafeLayoutEffect';
import { LoadingScene } from './loading/LoadingScene';

const SCREEN_MESH_NAME = 'Glowing_Screen_Screen_Emission_0';
const CUBICLE_MODEL_PATH = '/models/low_poly_90s_office_cubicle.glb';

interface R3FMesh extends Mesh {
  onPointerOver?: (event: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: (event: ThreeEvent<PointerEvent>) => void;
}

interface OfficeCubicleProps {
  isScreenHovered: boolean;
  isZoomedIn: boolean;
  isDragging?: boolean;
  onScreenHover: (hovered: boolean, screenPosition?: Vector3) => void;
  onLoaded?: () => void;
  onScreenClick?: () => void;
}

export const OfficeCubicle: React.FC<OfficeCubicleProps> = ({ 
  isScreenHovered,
  isZoomedIn,
  isDragging = false,
  onScreenHover, 
  onLoaded,
  onScreenClick,
}) => {
  const { scene } = useGLTF(CUBICLE_MODEL_PATH);
  const { gl, camera } = useThree();
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const screenMeshRef = useRef<Mesh | null>(null);
  const hasNotifiedLoaded = useRef(false);
  const screenPointerEventsDisabledRef = useRef(false);
  const onScreenHoverRef = useRef(onScreenHover);
  const onLoadedRef = useRef(onLoaded);

  // Offscreen scene + camera for the monitor screensaver (spinning 7 + particles)
  const screenScene = useMemo(() => {
    const s = new Scene();
    s.background = new Color('#1e3a8a');
    return s;
  }, []);

  const screenCamera = useMemo(() => {
    const c = new PerspectiveCamera(50, 1, 0.1, 100);
    c.position.set(0, 0, 8);
    return c;
  }, []);

  const renderTarget = useMemo(() => {
    const rt = new WebGLRenderTarget(256, 256);
    rt.texture.colorSpace = SRGBColorSpace;
    return rt;
  }, []);

  // Render the offscreen screensaver scene into the render target each frame.
  // Always render — the 256×256 basic-material pass is negligible, and stopping
  // on `isZoomedIn` freezes the spinning 7 mid-zoom while the monitor is still visible.
  useFrame((state) => {
    state.gl.setRenderTarget(renderTarget);
    state.gl.clear();
    state.gl.render(screenScene, screenCamera);
    state.gl.setRenderTarget(null);
  });

  // Dispose render target on unmount
  React.useEffect(() => {
    return () => { renderTarget.dispose(); };
  }, [renderTarget]);
  
  // Update refs when callbacks change
  React.useEffect(() => {
    onScreenHoverRef.current = onScreenHover;
    onLoadedRef.current = onLoaded;
  }, [onScreenHover, onLoaded]);
  
  useSafeLayoutEffect(() => {
    // Use high anisotropy for sharper textures at oblique angles (nearly free on modern GPUs)
    const maxAnisotropy = Math.min(gl.capabilities.getMaxAnisotropy?.() || 16, 16);
    
    clonedScene.traverse((child: Object3D) => {
      if (!(child instanceof Mesh)) {return;}
      
      const mesh = child as Mesh;

      // Remove specific sticky notes mesh
      if (mesh.name === 'Sticky_Notes_Stick_Notes_0') {
        if (mesh.parent) {
          mesh.parent.remove(mesh);
        }
        return;
      }
      
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.frustumCulled = true; // Enable frustum culling for better performance
      
      const isScreen = mesh.name === SCREEN_MESH_NAME;
      
      if (isScreen) {
        mesh.userData.isScreen = true;
        screenMeshRef.current = mesh;
        
        // Enable raycasting for the screen
        mesh.raycast = Mesh.prototype.raycast.bind(mesh);

        // Use the render target texture (screensaver rendered each frame)
        mesh.material = new MeshBasicMaterial({
          map: renderTarget.texture,
          toneMapped: false,
          side: FrontSide,
        });

        // We handle hover/click with a manual raycaster instead of R3F events
      } else if (mesh.material) {
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((mat) => {
          // Upgrade to MeshStandardMaterial if it's MeshBasicMaterial
          if (mat.type === 'MeshBasicMaterial') {
            const basicMat = mat as MeshBasicMaterial;
            const newMat = new MeshStandardMaterial({
              map: basicMat.map,
              color: basicMat.color,
              transparent: basicMat.transparent,
              opacity: basicMat.opacity,
              side: basicMat.side,
              metalness: 0.1,
              roughness: 0.8,
            });
            
            if (Array.isArray(mesh.material)) {
              const index = mesh.material.indexOf(mat);
              mesh.material[index] = newMat;
            } else {
              mesh.material = newMat;
            }
            mat.dispose();
            mat = newMat;
          }
          
          const standardMat = mat as MeshStandardMaterial;

          // Configure color space textures with trilinear filtering
          [standardMat.map, standardMat.emissiveMap].forEach((tex) => {
            if (tex) {
              tex.colorSpace = SRGBColorSpace;
              tex.anisotropy = maxAnisotropy;
              tex.minFilter = LinearMipmapLinearFilter;
              tex.magFilter = LinearFilter;
              tex.generateMipmaps = true;
            }
          });
          
          // Configure linear space textures with trilinear filtering
          [standardMat.metalnessMap, standardMat.roughnessMap, standardMat.normalMap, standardMat.aoMap, standardMat.alphaMap].forEach((tex) => {
            if (tex) {
              tex.colorSpace = NoColorSpace;
              tex.anisotropy = maxAnisotropy;
              tex.minFilter = LinearMipmapLinearFilter;
              tex.magFilter = LinearFilter;
              tex.generateMipmaps = true;
            }
          });
          
          // AO map requires UV2
          if (standardMat.aoMap && mesh.geometry.attributes.uv && !mesh.geometry.attributes.uv2) {
            mesh.geometry.setAttribute('uv2', mesh.geometry.attributes.uv);
          }
          
          // Handle transparency
          if (standardMat.alphaMap || (standardMat.opacity !== undefined && standardMat.opacity < 1.0)) {
            standardMat.transparent = true;
            standardMat.alphaTest = 0.01;
            standardMat.depthWrite = false;
            mesh.renderOrder = 1;
          }
          
          // FrontSide only — DoubleSide doubles fragment shader work
          standardMat.side = FrontSide;
          standardMat.vertexColors = !!mesh.geometry.attributes.color;
          
          // Better default PBR values
          if (standardMat.metalness === undefined) {standardMat.metalness = 0.1;}
          if (standardMat.roughness === undefined) {standardMat.roughness = 0.7;}
          
          // Enable environment map for reflections
          standardMat.envMapIntensity = 0.6;
          
          standardMat.needsUpdate = true;
        });
      }
    });
    
    if (!hasNotifiedLoaded.current && onLoadedRef.current) {
      hasNotifiedLoaded.current = true;
      onLoadedRef.current();
    }

    return () => {
      // Dispose cloned scene geometries & materials to prevent GPU memory leaks
      clonedScene.traverse((child: Object3D) => {
        if (child instanceof Mesh) {
          child.geometry?.dispose();
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m) => {
            if (m) {
              // Dispose all texture maps
              Object.values(m).forEach((val) => {
                if (val instanceof Texture) val.dispose();
              });
              m.dispose();
            }
          });
        }
      });
    };
  // onLoaded intentionally read via ref — prevents re-running this heavy
  // effect (which disposes + reloads the screen texture) when the parent
  // re-renders with a new callback reference.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clonedScene, gl]);

  // Disable screen mesh pointer events when CSS3D content is visible
  // This prevents glitchy hover behavior when CSS3D element blocks raycasts
  React.useEffect(() => {
    if (!screenMeshRef.current) {return;}
    
    const mesh = screenMeshRef.current;
    const shouldDisable = isZoomedIn;
    
    // Only update if state actually changed
    if (shouldDisable === screenPointerEventsDisabledRef.current) {return;}
    screenPointerEventsDisabledRef.current = shouldDisable;
    
    const r3fMesh = mesh as unknown as R3FMesh;

    if (shouldDisable) {
      // Completely disable all pointer events on the screen mesh
      mesh.raycast = () => {};
      delete r3fMesh.onPointerOver;
      delete r3fMesh.onPointerOut;
      mesh.userData.isScreen = false;
    } else {
      // Re-enable pointer events when not zoomed
      mesh.raycast = Mesh.prototype.raycast.bind(mesh);
      mesh.userData.isScreen = true;
      
      // Re-add pointer handlers
      r3fMesh.onPointerOver = (event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        const worldPosition = new Vector3();
        screenMeshRef.current?.getWorldPosition(worldPosition);
        onScreenHoverRef.current(true, worldPosition);
      };
      
      r3fMesh.onPointerOut = (event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        onScreenHoverRef.current(false);
      };
    }
  }, [isZoomedIn]);

  React.useEffect(() => {
    document.body.style.cursor = isScreenHovered ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [isScreenHovered]);

  // Manual raycasting for hover/click when NOT zoomed in (Task 4: Check isDragging)
  React.useEffect(() => {
    if (!screenMeshRef.current) {return;}

    const raycaster = new Raycaster();
    const pointer = new Vector2();
    let frameRequested = false;
    let hovering = false;
    let rafId = 0;

    const updatePointerFromEvent = (event: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      pointer.set(x, y);
    };

    const runRaycast = () => {
      frameRequested = false;
      if (!camera || !screenMeshRef.current || isZoomedIn) {return;}
      
      // Don't trigger hover if user is dragging
      if (isDragging) {
        if (hovering) {
          hovering = false;
          onScreenHoverRef.current(false);
        }
        return;
      }
      
      raycaster.setFromCamera(pointer, camera);
      
      // Raycast against CSS3D scene to see CSS3D objects
      // Check specific screen mesh
      const intersects = raycaster.intersectObject(screenMeshRef.current, true);

      if (intersects.length > 0) {
        if (!hovering) {
          hovering = true;
          const worldPosition = new Vector3();
          screenMeshRef.current.getWorldPosition(worldPosition);
          onScreenHoverRef.current(true, worldPosition);
        }
      } else {
        if (hovering) {
          hovering = false;
          onScreenHoverRef.current(false);
        }
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isZoomedIn) {return;}
      updatePointerFromEvent(e);
      if (!frameRequested) {
        frameRequested = true;
        rafId = requestAnimationFrame(runRaycast);
      }
    };

    const onClick = (e: MouseEvent) => {
      // Don't trigger click if zoomed in, or if user was dragging
      if (isZoomedIn || isDragging) {
        return;
      }
      updatePointerFromEvent(e);
      raycaster.setFromCamera(pointer, camera);
      if (screenMeshRef.current) {
        const intersects = raycaster.intersectObject(screenMeshRef.current, true);
        if (intersects.length > 0) {
          onScreenClick?.();
        }
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
      cancelAnimationFrame(rafId);
    };
  }, [camera, gl.domElement, isZoomedIn, onScreenClick, isDragging]);

  return (
    <>
      {/* Portal LoadingScene into the offscreen scene for the monitor screensaver */}
      {createPortal(<LoadingScene />, screenScene)}
      <group position={[0, 0, -10]} scale={5.4}>
        <primitive object={clonedScene} />
      </group>
    </>
  );
};

// NOTE: useGLTF.preload is called from CubicleScene.tsx — no duplicate needed here
