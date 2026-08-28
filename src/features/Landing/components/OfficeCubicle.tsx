import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  Box3,
  CanvasTexture,
  FrontSide,
  Group,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  Object3D,
  PlaneGeometry,
  Raycaster,
  RepeatWrapping,
  SRGBColorSpace,
  Texture,
  Vector2,
  Vector3,
} from "three";
import type { Material } from "three";
import { useSafeLayoutEffect } from "../hooks/useSafeLayoutEffect";
import { LoadingScene } from "./loading/LoadingScene";
import { createTvProgram } from "./tvChannels";
import type { TvProgram } from "./tvChannels";
import { createSteamSystem } from "./coffeeSteam";
import type { SteamSystem } from "./coffeeSteam";
import { createWantedPosterTexture } from "./wantedPoster";
import { QUALITY } from "./deviceTier";
import portraitUrl from "@shared/assets/images/OS/picofme.jpeg";

const SCREEN_MESH_NAME = "Glowing_Screen_Screen_Emission_0";
// The Panasonic TV is a single mesh (no separate screen sub-mesh), so its
// picture is a thin canvas-textured plane fitted to the front face below.
const TV_MESH_PREFIX = "Panasonic_VHS_TV";
// Measured from the mesh geometry: the glass is an inset quad recessed
// 0.058 local units behind the 2×2 front face - 85.3% of face width, 64.1%
// of face height, its centre 12.3% of the face height above the midline
// (the strip below it is the cabinet/VCR section, not screen).
const TV_SCREEN_WIDTH_FRACTION = 0.845;
const TV_SCREEN_HEIGHT_FRACTION = 0.63;
const TV_SCREEN_VERTICAL_SHIFT = 0.123;
// Sit the picture just in front of the recessed glass but behind the front
// rim, so the bezel occludes it at oblique angles like a real inset tube.
const TV_SCREEN_DEPTH_INSET_FRACTION = 0.026;
// Roughly where the roaming camera rests - used to pick which side of the
// TV counts as "front".
const ROOM_INTERIOR_POINT = new Vector3(0, 7, -10);
// The model's baked steam card above the coffee mug; replaced by an animated
// plume unless the visitor prefers reduced motion.
const STEAM_MESH_NAME = "Steam_Steam_0";
// The wall poster whose artwork we replace with our generated wanted poster.
const POSTER_MESH_NAME = "Terminator_Poster_Terminator_Poster_0";
export const CUBICLE_MODEL_PATH = "/models/low_poly_90s_office_cubicle.glb";
const SCREENSAVER_FPS = 24;

interface OfficeCubicleProps {
  isScreenHovered: boolean;
  isDragging?: boolean;
  /** Disables monitor raycasts while the camera is approaching or focused. */
  monitorActive: boolean;
  /**
   * True once the full-screen OS has covered the canvas. The 3D scene is
   * completely hidden at that point, so all per-frame work pauses.
   */
  osOverlayOpen: boolean;
  reducedMotion?: boolean;
  onScreenHover: (hovered: boolean, screenPosition?: Vector3) => void;
  onScreenReady?: ((screenPosition: Vector3, mesh?: Mesh) => void) | undefined;
  onLoaded?: (() => void) | undefined;
  onScreenClick?: (() => void) | undefined;
}

/**
 * The GLB and monitor screensaver stay in the main scene. The screensaver is
 * mounted directly into the physical CRT mesh; the interactive OS opens as a
 * full-screen DOM overlay once the camera has finished zooming in.
 */
export const OfficeCubicle: React.FC<OfficeCubicleProps> = ({
  isScreenHovered,
  isDragging = false,
  monitorActive,
  osOverlayOpen,
  reducedMotion = false,
  onScreenHover,
  onScreenReady,
  onLoaded,
  onScreenClick,
}) => {
  const { gl, camera, invalidate } = useThree();
  // The model has no Draco geometry, so avoid the unused decoder request.
  const { scene } = useGLTF(CUBICLE_MODEL_PATH, false, true);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const [screenMesh, setScreenMesh] = useState<Mesh | null>(null);
  const onScreenHoverRef = useRef(onScreenHover);
  const onLoadedRef = useRef(onLoaded);
  const onScreenClickRef = useRef(onScreenClick);
  const onScreenReadyRef = useRef(onScreenReady);
  const hasNotifiedLoaded = useRef(false);
  const osOverlayOpenRef = useRef(osOverlayOpen);
  osOverlayOpenRef.current = osOverlayOpen;
  const tvStateRef = useRef<{
    program: TvProgram;
    texture: CanvasTexture;
    lastUpdateMs: number;
  } | null>(null);
  const steamSystemRef = useRef<SteamSystem | null>(null);
  const steamAnchorRef = useRef<Group>(null);
  // Scanlines now sit directly on the physical monitor. The screensaver is
  // also part of the room scene, eliminating the old second WebGL pass.
  const scanTexture = useMemo(() => {
    const pattern = document.createElement("canvas");
    pattern.width = 2;
    pattern.height = 4;
    const patternContext = pattern.getContext("2d");
    if (patternContext) {
      patternContext.clearRect(0, 0, 2, 4);
      patternContext.fillStyle = "#000";
      patternContext.fillRect(0, 0, 2, 1);
    }
    const texture = new CanvasTexture(pattern);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(1, 64);
    texture.magFilter = NearestFilter;
    return texture;
  }, []);
  useEffect(() => () => scanTexture.dispose(), [scanTexture]);

  const screenDisplay = useMemo(() => {
    if (!screenMesh) return null;
    const geometry = screenMesh.geometry;
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    const bounds = geometry.boundingBox;
    if (!bounds) return null;

    const center = new Vector3()
      .addVectors(bounds.min, bounds.max)
      .multiplyScalar(0.5);
    const size = new Vector3().subVectors(bounds.max, bounds.min);
    // LoadingScene's shell is six units across. Fill 80% of the CRT height,
    // matching the former 4:3 render-target composition.
    const scale = (size.y * 0.8) / 6;
    return { center, size, scale };
  }, [screenMesh]);

  // Decorative systems ride the room's existing frames. The monitor itself
  // is now regular scene geometry, so dragging never pays for a second render.
  useFrame((state, delta) => {
    // The full-screen OS hides the canvas entirely - nothing here is visible,
    // so skip all of it.
    if (osOverlayOpenRef.current) return;
    const nowMs = performance.now();

    // Steam rides the same frames as the screensaver - no extra invalidation.
    steamSystemRef.current?.update(
      state.clock.elapsedTime,
      Math.min(delta, 0.1),
    );

    // TV programming keeps its retro ~11fps cadence during both idle and drag.
    const tvState = tvStateRef.current;
    if (tvState && nowMs - tvState.lastUpdateMs >= 90) {
      tvState.lastUpdateMs = nowMs;
      if (tvState.program.draw(nowMs)) tvState.texture.needsUpdate = true;
    }
  });

  useEffect(() => {
    onScreenHoverRef.current = onScreenHover;
    onLoadedRef.current = onLoaded;
    onScreenClickRef.current = onScreenClick;
    onScreenReadyRef.current = onScreenReady;
  }, [onLoaded, onScreenClick, onScreenHover, onScreenReady]);

  useSafeLayoutEffect(() => {
    let foundScreen: Mesh | null = null;
    let foundTv: Mesh | null = null;
    let foundSteam: Mesh | null = null;
    let foundPoster: Mesh | null = null;
    let cancelled = false;
    let posterTexture: CanvasTexture | null = null;
    const screenMaterial = new MeshBasicMaterial({
      color: "#182f74",
      side: FrontSide,
      toneMapped: false,
    });

    // Anisotropic filtering + trilinear mipmaps sharpen every texture at the
    // oblique angles this room is mostly seen from. Capped by device tier so
    // weak GPUs aren't paying full 16× sampling on every surface.
    const maxAnisotropy = Math.min(
      gl.capabilities.getMaxAnisotropy?.() ?? 8,
      QUALITY.anisotropy,
    );
    const configuredTextures = new Set<Texture>();

    clonedScene.traverse((child: Object3D) => {
      if (!(child instanceof Mesh)) return;

      if (child.name === "Sticky_Notes_Stick_Notes_0") {
        child.parent?.remove(child);
        return;
      }

      child.frustumCulled = true;
      child.castShadow = child.name !== SCREEN_MESH_NAME;
      child.receiveShadow = true;

      if (!foundTv && child.name.startsWith(TV_MESH_PREFIX)) {
        foundTv = child;
      }

      if (!foundSteam && child.name === STEAM_MESH_NAME) {
        foundSteam = child;
      }

      if (!foundPoster && child.name === POSTER_MESH_NAME) {
        foundPoster = child;
      }

      if (child.name === SCREEN_MESH_NAME) {
        child.material = screenMaterial;
        child.userData.isScreen = true;
        foundScreen = child;
      } else if (child.material) {
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];
        materials.forEach((material: Material) => {
          Object.values(material).forEach((value) => {
            if (value instanceof Texture) {
              if (configuredTextures.has(value)) return;
              configuredTextures.add(value);
              value.anisotropy = maxAnisotropy;
              value.minFilter = LinearMipmapLinearFilter;
              value.magFilter = LinearFilter;
              value.generateMipmaps = true;
              value.needsUpdate = true;
            }
          });
        });
      }
    });

    const resolvedScreen = foundScreen as Mesh | null;
    setScreenMesh(resolvedScreen);
    if (resolvedScreen) {
      resolvedScreen.updateWorldMatrix(true, false);
      const screenPosition = new Vector3();
      resolvedScreen.getWorldPosition(screenPosition);
      onScreenReadyRef.current?.(screenPosition, resolvedScreen);
    }

    // ── TV picture: a thin canvas-textured plane fitted to the front face
    // of the Panasonic mesh in its own local space. Fully procedural, so
    // there is nothing to license and nothing extra to download.
    let tvPlane: Mesh | null = null;
    const resolvedTv = foundTv as Mesh | null;
    if (resolvedTv) {
      const tvGeometry = resolvedTv.geometry;
      if (!tvGeometry.boundingBox) tvGeometry.computeBoundingBox();
      const tvBounds = tvGeometry.boundingBox;
      if (tvBounds) {
        const size = new Vector3().subVectors(tvBounds.max, tvBounds.min);
        const center = new Vector3()
          .addVectors(tvBounds.min, tvBounds.max)
          .multiplyScalar(0.5);

        // The screen plane is perpendicular to the box's thinnest axis; of
        // the remaining two, the TV is wider than it is tall.
        const axes: Array<"x" | "y" | "z"> = ["x", "y", "z"];
        const depthAxis = axes.reduce((a, b) => (size[a] <= size[b] ? a : b));
        const faceAxes = axes
          .filter((axis) => axis !== depthAxis)
          .sort((a, b) => size[b] - size[a]);
        const widthAxis = faceAxes[0] ?? "x";
        const heightAxis = faceAxes[1] ?? "y";

        // Pick the face that points into the room.
        resolvedTv.updateWorldMatrix(true, false);
        const epsilon = size[depthAxis] * 0.06;
        const frontProbe = center.clone();
        frontProbe[depthAxis] = tvBounds.max[depthAxis] + epsilon;
        const backProbe = center.clone();
        backProbe[depthAxis] = tvBounds.min[depthAxis] - epsilon;
        const frontWorld = resolvedTv.localToWorld(frontProbe.clone());
        const backWorld = resolvedTv.localToWorld(backProbe.clone());
        const facingPositive =
          frontWorld.distanceToSquared(ROOM_INTERIOR_POINT) <=
          backWorld.distanceToSquared(ROOM_INTERIOR_POINT);

        const program = createTvProgram(reducedMotion);
        const tvTexture = new CanvasTexture(program.canvas);
        tvTexture.colorSpace = SRGBColorSpace;
        program.draw(performance.now());
        tvTexture.needsUpdate = true;

        tvPlane = new Mesh(
          new PlaneGeometry(1, 1),
          new MeshBasicMaterial({
            map: tvTexture,
            toneMapped: false,
            side: FrontSide,
          }),
        );
        tvPlane.castShadow = false;
        tvPlane.receiveShadow = false;
        tvPlane.scale.set(
          size[widthAxis] * TV_SCREEN_WIDTH_FRACTION,
          size[heightAxis] * TV_SCREEN_HEIGHT_FRACTION,
          1,
        );

        if (depthAxis === "z") {
          if (!facingPositive) tvPlane.rotation.y = Math.PI;
        } else if (depthAxis === "x") {
          tvPlane.rotation.y = facingPositive ? Math.PI / 2 : -Math.PI / 2;
        } else {
          tvPlane.rotation.x = facingPositive ? -Math.PI / 2 : Math.PI / 2;
        }
        // This mesh's face axes land the canvas sideways; roll it upright
        // about its own normal.
        tvPlane.rotateZ(Math.PI / 2);

        const depthInset = size[depthAxis] * TV_SCREEN_DEPTH_INSET_FRACTION;
        const planePosition = center.clone();
        planePosition[depthAxis] = facingPositive
          ? tvBounds.max[depthAxis] - depthInset
          : tvBounds.min[depthAxis] + depthInset;
        planePosition[heightAxis] +=
          size[heightAxis] * TV_SCREEN_VERTICAL_SHIFT;
        tvPlane.position.copy(planePosition);

        resolvedTv.add(tvPlane);
        tvStateRef.current = {
          program,
          texture: tvTexture,
          lastUpdateMs: 0,
        };
      }
    }

    // ── Coffee steam: swap the baked steam card for a live plume of soft
    // billboard puffs rising from the mug (kept static under reduced motion).
    const resolvedSteam = foundSteam as Mesh | null;
    if (resolvedSteam && !reducedMotion) {
      clonedScene.updateWorldMatrix(true, true);
      const steamBounds = new Box3().setFromObject(resolvedSteam);
      const rimOrigin = new Vector3(
        (steamBounds.min.x + steamBounds.max.x) / 2,
        steamBounds.min.y,
        (steamBounds.min.z + steamBounds.max.z) / 2,
      );
      const plumeHeight = (steamBounds.max.y - steamBounds.min.y) * 1.3;
      const system = createSteamSystem(rimOrigin, plumeHeight);
      steamAnchorRef.current?.add(system.group);
      steamSystemRef.current = system;
      resolvedSteam.visible = false;
    }

    // ── Wanted poster: swap the Terminator poster's artwork for our
    // generated bounty poster (original art, same mesh and lighting).
    const resolvedPoster = foundPoster as Mesh | null;
    if (resolvedPoster) {
      createWantedPosterTexture(portraitUrl)
        .then((generated) => {
          if (cancelled) {
            generated.dispose();
            return;
          }
          posterTexture = generated;
          posterTexture.anisotropy = maxAnisotropy;
          posterTexture.minFilter = LinearMipmapLinearFilter;
          posterTexture.magFilter = LinearFilter;
          posterTexture.generateMipmaps = true;
          const materials = Array.isArray(resolvedPoster.material)
            ? resolvedPoster.material
            : [resolvedPoster.material];
          materials.forEach((material) => {
            const textured = material as MeshBasicMaterial;
            textured.map = posterTexture;
            textured.needsUpdate = true;
          });
          invalidate();
        })
        .catch(() => {
          // Photo failed to load - keep the original poster.
        });
    }

    if (!hasNotifiedLoaded.current && onLoadedRef.current) {
      hasNotifiedLoaded.current = true;
      onLoadedRef.current();
    }

    return () => {
      if (tvPlane) {
        tvPlane.parent?.remove(tvPlane);
        tvPlane.geometry.dispose();
        const tvMaterial = tvPlane.material as MeshBasicMaterial;
        tvMaterial.map?.dispose();
        tvMaterial.dispose();
        tvStateRef.current = null;
      }
      if (steamSystemRef.current) {
        steamAnchorRef.current?.remove(steamSystemRef.current.group);
        steamSystemRef.current.dispose();
        steamSystemRef.current = null;
      }
      if (resolvedSteam) resolvedSteam.visible = true;
      cancelled = true;
      posterTexture?.dispose();
      screenMaterial.dispose();
    };
  }, [clonedScene, gl, reducedMotion]);

  useEffect(() => {
    document.body.style.cursor =
      isScreenHovered && !monitorActive ? "pointer" : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [isScreenHovered, monitorActive]);

  useEffect(() => {
    if (!screenMesh) return;

    const raycaster = new Raycaster();
    const pointer = new Vector2();
    let frameRequested = false;
    let hovering = false;
    let rafId = 0;

    const updatePointerFromEvent = (event: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
    };

    const clearHover = () => {
      if (!hovering) return;
      hovering = false;
      onScreenHoverRef.current(false);
    };

    const runRaycast = () => {
      frameRequested = false;
      if (monitorActive || isDragging) {
        clearHover();
        return;
      }

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObject(screenMesh, true);
      if (intersects.length > 0) {
        if (!hovering) {
          hovering = true;
          const worldPosition = new Vector3();
          screenMesh.getWorldPosition(worldPosition);
          onScreenHoverRef.current(true, worldPosition);
        }
      } else {
        clearHover();
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      // No hover work during a drag: no getBoundingClientRect per event, no
      // raycasts competing with the render loop.
      if (monitorActive || isDragging) return;
      updatePointerFromEvent(event);
      if (!frameRequested) {
        frameRequested = true;
        rafId = requestAnimationFrame(runRaycast);
      }
    };

    const onClick = (event: MouseEvent) => {
      if (monitorActive || isDragging) return;
      updatePointerFromEvent(event);
      raycaster.setFromCamera(pointer, camera);
      if (raycaster.intersectObject(screenMesh, true).length > 0) {
        onScreenClickRef.current?.();
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
      cancelAnimationFrame(rafId);
    };
  }, [camera, gl.domElement, isDragging, monitorActive, screenMesh]);

  return (
    <>
      {/* The screensaver lives directly on the CRT mesh. It remains animated
          during camera input without a second scene render or render target. */}
      {!osOverlayOpen &&
        screenMesh &&
        screenDisplay &&
        createPortal(
          <>
            <group
              position={[
                screenDisplay.center.x,
                screenDisplay.center.y,
                screenDisplay.center.z + 0.04,
              ]}
              scale={[screenDisplay.scale, screenDisplay.scale, 0.01]}
            >
              <LoadingScene
                reducedMotion={reducedMotion}
                idleFps={SCREENSAVER_FPS}
                includeBackdrop={false}
                foregroundColor="#c9ced6"
              />
            </group>
            <mesh
              position={[
                screenDisplay.center.x,
                screenDisplay.center.y,
                screenDisplay.center.z + 0.08,
              ]}
              renderOrder={20}
            >
              <planeGeometry
                args={[screenDisplay.size.x, screenDisplay.size.y]}
              />
              <meshBasicMaterial
                map={scanTexture}
                transparent
                opacity={0.32}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          </>,
          screenMesh,
        )}
      <group position={[0, 0, -10]} scale={5.4}>
        <primitive object={clonedScene} />
      </group>
      {/* World-space anchor for the coffee-steam plume */}
      <group ref={steamAnchorRef} />
    </>
  );
};
