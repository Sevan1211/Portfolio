# 3D globe direction

**Decision date:** 2026-08-21

**Status:** user-approved direction; local implementation and visual QA complete; production/mobile-lab performance verification remains open
**Reference:** C:\Users\Sevan\iCloudDrive\Documents\sevanworks is a visual/system reference only. Reuse the design language and engineering ideas, not its orange palette, exact geometry, source code, or interaction effects.

## Revised direction — authoritative for the next build

**Source:** user decision, repository code inspection, GLB inspection, and current official Three.js / React Three Fiber / Drei research on 2026-08-21.

The desktop experience remains one continuous 3D flow:

    land-only dot globe + floating 7
                  ↓
       smooth reveal into the existing cubicle
                  ↓
        roam / look around the cubicle
                  ↓

click monitor → camera eases close to its physical screen
↓
fully interactive Retro OS stays on that screen

### Non-negotiables

- Keep the cubicle and its current free-look character. Make it richer over time; do not replace it with a conventional split-screen hero.
- Replace only the random star-shell loader with the blue/white land-dot globe and centered 7.
- Use **one** R3F Canvas for globe, cubicle, and the handoff. The current two-Canvas loader plus main scene cannot look like a single world and wastes GPU/browser work.
- Render the Retro OS as real, focusable DOM projected onto the monitor using Drei `<Html transform>`, not as a full-screen page and not as a texture/video.
- Keep the camera locked at a readable monitor distance while the OS is active. Escape and a visible named “Leave computer” control return to room navigation.
- Apply the CRT treatment as a low-opacity, non-interactive screen overlay (scanlines/noise/subtle pixel grid). Never blur or filter the OS container itself; text and controls must remain crisp and usable.

## Implementation update — 2026-08-22 (later): runtime performance pass

**Source:** local implementation; frame pacing verified by mechanism (the embedded test pane cannot measure real fps — the open mobile-lab gates below still apply).

- Idle roaming no longer renders at display refresh: the screensaver — the only continuously animating element — paces the demand loop at ~30 fps via a throttled invalidate (`idleFps` on `LoadingScene`). Interactions (drag, parallax, camera transitions) still invalidate at full rate, and the OS-active state remains demand-idle as before. On 120–144 Hz machines this cuts idle GPU/CPU work 4–5×.
- The shadow pass is frozen after three staged warm-up frames (`gl.shadowMap.autoUpdate = false`): nothing in the room moves, so the 1024² map renders once instead of every frame.
- Replaced `PerformanceMonitor`/`AdaptiveDpr`/`AdaptiveEvents` with a flat `dpr [1, 1.75]` cap. Rationale: those helpers infer health from frame rate, and the deliberate 30 fps idle cadence would read as permanent decline and blur the scene. The OS text is DOM and renders at native resolution regardless of canvas DPR.
- The Terminator wall poster's artwork is replaced at runtime by a generated "WANTED — DEAD OR ALIVE" bounty poster of the user (`wantedPoster.ts`): aged parchment, pixelated sepia portrait from the existing About photo, bounty $3,000,000,000-, "wanted for: shipping on Fridays". A One Piece-style homage with zero licensed artwork (the user asked for a Luffy poster; actual Luffy art was declined for copyright, consistent with the TV-content decision). The mesh's material/lighting are kept — only the base color map is swapped (this mesh's UVs sample with flipY=true, verified visually).
- The mug's baked steam card is replaced by an animated plume (`coffeeSteam.ts`): seven billboard puffs with a generated radial-gradient texture rise, sway, expand, and dissolve on a staggered loop, calibrated from the original steam mesh's world bounds. It updates only on frames the idle loop already produces (no extra invalidation) and pauses automatically while the OS is open; under reduced motion the original static card is kept instead.
- Shadow-quality fix on top of the frozen pass: the diagonal banding on desk/carpet was shadow acne. Now PCFSoft filtering, 2048² map, bias −0.0001 + normalBias 0.035 — visually verified smooth; all one-time cost since the pass renders once. The "LOADING…" ticker was removed at the user's request (the veil transition covers readiness).
- Remaining levers (unchanged, tracked above): GLB texture compression/pruning (~2.9 MB network + decode), and the mobile-route measurement gates.

### Runtime performance pass 2 — drag smoothness and low-tier devices (2026-08-23)

Reported symptom: hitching while dragging around the room. Three causes, all fixed without touching content or reducing quality on capable hardware.

1. **Lazy shader/texture compilation (the actual hitch).** With 72 materials and 68 textures, each prop compiled its program and uploaded its textures the first time it entered view — i.e. mid-drag. Staging now calls `gl.compile(scene, camera)` plus `gl.initTexture` for every unique texture while the veil is still opaque, so the cost is paid once, invisibly.
2. **`invalidate()` per mousemove event.** R3F queues frames (capped at 60), so a high-polling mouse flooded the queue and kept the renderer busy after the drag ended. Pointer input is now coalesced into one rAF-batched update per frame.
3. **Screensaver double-render during drag.** The offscreen 256² pass ran on every main-scene frame; while dragging at display refresh that doubled the render work at the worst moment. It now holds its own ~30 fps cadence independent of the main loop.

**Device tiering** (`deviceTier.ts`): tier resolved once from `hardwareConcurrency`/`deviceMemory` — low (≤4 cores or ≤4 GB): DPR 1, no MSAA, 4× aniso, 1024² shadows; medium: DPR 1.5, MSAA, 8×, 2048²; high (≥8 cores and ≥8 GB): DPR 1.75, MSAA, 16×, 2048². Capable machines are unchanged from before this pass.

**Runtime safety net:** core count says nothing about the GPU, so `CubicleScene` samples real frame time *only during continuous motion* (drag/transitions — the idle loop is deliberately capped at 30 fps and would read as a false failure) and steps DPR down at most twice, never back up, so resolution cannot oscillate.

Verified locally: type check, production build, fresh-load drag test with zero runtime errors; tier resolution confirmed live (24 cores/32 GB → high → canvas DPR 1.75, no runtime downgrade).

## Implementation update — 2026-08-22: interaction polish

**Source:** user feedback on the local build; local browser verification.

- Leaving the monitor is now two clean phases: the CRT power-off collapse plays while the camera is still locked, then the DOM unmounts and the camera pulls back (moving drei Html mid-collapse was the reported glitch). Clicking anywhere outside the monitor DOM also leaves; Escape still works.
- The visible "Open the computer" and "Leave computer" controls are removed for a clean look. Keyboard access is preserved by a visually hidden entry button that appears only on `:focus-visible` (the AGENTS.md keyboard-path requirement still holds).
- Graphics: 16× anisotropy + trilinear mipmapped filtering applied to every cubicle texture (restores what the pre-Codex build did), shadow map 512→1024, DPR cap 1.5→2 with the existing PerformanceMonitor/AdaptiveDpr scaling down on weak devices.
- New `/os` route renders the Retro OS as a full browser page (the existing fullscreen CSS mode); a retro "open in new tab" taskbar button links to it from the monitor OS and hides in fullscreen mode.
- Fixed a pre-existing bug this exposed: `openApp` sized windows from `window.inner*` (the browser viewport) instead of the OS workspace, so narrow browsers opened min-size windows over the desktop icons. Windows now measure `.retro-os-workspace`.
- The OS overlay is no longer hand-calibrated: its Html scale and position are derived from `Glowing_Screen_Screen_Emission_0`'s geometry bounding box (drei `<Html transform>` lays out 400/distanceFactor CSS px per local unit; distanceFactor is pinned at 10), min-fitted with a 1% inset so it can never exceed the mesh. The screen mesh's phosphor texture is multiplied to black while the OS DOM is mounted so nothing can rim around it; it restores to the screensaver on leave.
- Embedded-look guards: the OS DOM mounts only once the zoom camera has fully settled (progress ≥ 0.995 — a moving camera would draw the DOM over the bezel at oblique angles), and the zoom framing fills at most 84% width / 80% height of the viewport so the CRT bezel always stays in frame.
- The TV picture is fitted from geometry, not guesswork: the mesh contains an inset glass quad (recessed 0.058 units behind the front face; 85.3% × 64.1% of the face, centre +12.3% above the midline). The picture plane uses those measured fractions and sits behind the front rim so the bezel occludes it at oblique angles.
- CRT character pass: the TV composes half-res content through blur/desaturation plus scanlines, noise flecks, a rolling tracking band, vignette, and an overall dim; the monitor screensaver renders through a scanline quad in the offscreen pass with the idle tube dimmed (`#c9ced6` multiply); the Retro OS overlay gained an RGB aperture grille, deeper corner falloff, and a subtle flicker (animation disabled under reduced motion; the OS DOM itself stays unfiltered for readability).
- The Panasonic TV now plays procedural "programming" (`tvChannels.ts`): SMPTE-style bars with a SEVAN TV / CH 07 ident, a bouncing 7 logo, a drifting NO SIGNAL card, and static bursts between channels. All original content drawn to a 320×240 canvas at ~11 fps riding the screensaver's frame loop (paused while the OS is open; single static frame under reduced motion). The picture plane is fitted to the TV mesh's front face from its geometry box. **Decision: no licensed media (anime/sports) on the site — copyright.** If real footage is ever wanted, use CC-licensed material with attribution or the user's own project demo reels.

## Implementation update — 2026-08-21 (evening): veil transition + globe restyle

**Source:** local code and browser evidence (Claude Code session). No deployment changes.

- **User decision (supersedes the land-dot globe direction):** the loader visual is the original star-shell — a faithful port of the committed `LoadingScene` (1,200 seeded white cubes, shell radius 2.2–3.0, φ 10–170°, rotation 0.3 rad/s, the unbeveled white 7 centered inside the same rotating group) on the `#1e3a8a` field, now via a tone-mapping-exempt backdrop sphere so the rendered blue exactly matches the DOM page cover and transition veil. A "LOADING…" DOM ticker was added. The land-node data module and generator remain in the repo but are currently unused.
- Replaced the in-scene camera-flight handoff with a veil choreography: globe departs (0.72 s scale/fade) under a `#1e3a8a` veil → room staged and warmed behind the opaque veil (camera parked at intro start, one invalidated frame) → 150 ms hold → veil lifts (0.85 s) while a 1.8 s quadratic-bezier descent (control point pulled behind the desk) glides to the rest pose, FOV 80→75. This removed the globe/room interpenetration frames, the corner-wall full-frame gray frames, and the 50→95→75 FOV swing of the previous handoff.
- Added CRT power-on (scaleY expand + flash burn-off on monitor DOM mount) and power-off (collapse-to-line, then unmount after 300 ms) so entering/leaving the computer reads as the machine switching, not the DOM popping. Reduced-motion variants are opacity-only.
- About app tabs now crossfade (0.2 s in / 0.12 s out, keyed `AnimatePresence`) and reset scroll per tab; entry controls fade in; drag smoothing is frame-rate-independent; terminal banner types in line-by-line in phosphor green.
- Fixed in review: `roomActive` flip now calls `invalidate()` — without it the demand frameloop never started the descent.
- **User corrections (same day):** the intro was restored to the original's exact motion — straight lerp (4,12,−7)→(0,7,−10), FOV 95→75, 2.0 s cubic-out, camera rotation fixed (the bezier arc and 80→75 FOV read as wonky). The idle monitor screensaver is back via the original mechanism (the loading scene portaled into an offscreen scene, rendered to a 256×256 SRGB target on the screen mesh); it pauses while the OS DOM is mounted and resumes on leave. The zoomed-in pose is now derived from the screen mesh itself — camera on the plane's world normal with the plane's up axis, distance fitted so the screen fills ≤90% width / ≤94% height — giving a perfectly axis-aligned, fully readable OS (this supersedes the audit's open "zoom framing" question). Note: reviving the screensaver means the canvas renders continuously while roaming; the demand loop still idles once the OS is open.
- Verified locally: type check, production build, full entry/zoom/leave/tab/terminal flows in the embedded browser (frame-state sampling; real-device smoothness still pending the open mobile-lab gates).

## Implementation update — 2026-08-21

**Source:** local code and browser evidence. No production deployment, Cloudflare, DNS, or GitHub configuration was changed.

### Shipped locally

- Replaced the random 1,200-particle shell with a blue globe built from **3,840** deterministic, land-only instanced dots. `scripts/generate-land-nodes.mjs` reads `world-atlas/land-110m.json` at development time and writes the compact browser data module; no map lookup or point generation runs for visitors.
- Kept globe, cubicle, and transition in one R3F Canvas. The old loading Canvas, full-screen OS overlay, and 256×256 per-frame monitor render target are gone.
- Deferred cubicle mounting until the globe has visibly painted; then wait for the GLB and the brief art-directed minimum before the handoff begins. This protects the first visible globe frame without returning to a separate rendering context.
- Replaced the random monitor screensaver path with a static low-cost blue screen while roaming. Once the camera is close, a lazy-loaded `<Html transform>` portal mounts the real React Retro OS directly on `Glowing_Screen_Screen_Emission_0`.
- Calibrated the monitor DOM to the model’s actual opening (1280×992 CSS layout, 1.29:1) and added a subtle non-interactive scanline/glass layer. The OS itself receives normal pointer and keyboard events.
- Added native “Open the computer” and “Leave computer · Esc” controls, Escape return, labelled window controls, and a reduced-motion path that disables globe rotation and makes non-essential camera handoffs immediate.
- Switched the R3F Canvas to demand-driven rendering. It explicitly invalidates only while the globe spins, the handoff/camera is moving, or the visitor moves the room camera; the loader unmounts once the cubicle is active.

### Local acceptance evidence

| Check              | Result        | Evidence                                                                                                                                              |
| ------------------ | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Globe visual       | Pass          | Browser screenshot: blue sea is empty; white dots describe land; white 7 is visible in front of the globe.                                            |
| One-canvas handoff | Pass          | Browser inspection from globe through cubicle showed no loading-overlay canvas or fullscreen OS replacement.                                          |
| Physical monitor   | Pass          | Browser screenshot showed the cubicle’s CRT bezel and surrounding room while the Retro OS occupied its screen.                                        |
| OS interaction     | Pass          | Native “Experience” tab activated and exposed its section in the transformed monitor DOM.                                                             |
| Exit path          | Pass          | Both Escape and clicking the physical screen/semantic entry control were checked; Escape returned to the roam state and restored the entry control.   |
| Narrow layout      | Pass (visual) | Browser screenshot at 390×844 kept the cubicle and named native entry control visible.                                                                |
| Console            | Pass          | Browser console contained no warning or error entries during the tested flow.                                                                         |
| Type check         | Pass          | `npm.cmd run type-check` completed successfully.                                                                                                      |
| Production build   | Pass          | `npm.cmd run build` completed successfully on 2026-08-21.                                                                                             |
| Lint               | Not runnable  | The existing `npm.cmd run lint` script cannot find an ESLint configuration. This is a repository tooling issue, not treated as a passing lint result. |

### Current build evidence

- Final production build: 1,088 modules transformed in 5.75 seconds locally.
- `three-vendor` is 741.26 kB minified / 193.93 kB gzip; the cubicle GLB is 2,909,120 B. Those are the next highest-value performance targets, and they need before/after device measurements rather than speculative compression changes.
- The new land-node payload is generated source rather than a runtime dependency. `world-atlas`, `d3-geo`, and `topojson-client` are development dependencies used only by the generator.

### Open verification gates

1. Record Chrome performance traces and renderer draw-call/texture/frame-time data on a representative desktop and mid-tier phone.
2. Run a fresh live mobile PageSpeed/CrUX-aligned audit after deployment; do not claim the original 90+ PSI goal until measured.
3. Profile a separately saved GLB optimization candidate (texture pruning/resizing, then KTX2 and Meshopt independently) while preserving the NobleCrow CC-BY attribution and checking visual regression.
4. Implement and validate the separate recruiter/no-WebGL route and canonical content work from the public baseline. The native scene-entry control is a keyboard route into the 3D experience; it is not a substitute for that full fallback.

### What the repository proves today

- The model already has a dedicated screen mesh: `Glowing_Screen_Screen_Emission_0`. Its untransformed plane is **2.5503 × 1.9781** units — approximately **1.29:1**, landscape. The current non-fullscreen Retro OS instead has a fixed **1446 × 1600** layout, so it must receive a monitor-specific layout/calibration rather than be scaled down unchanged.
- `LandingScene.tsx` mounts separate loading and cubicle canvases; `OfficeCubicle.tsx` continuously renders a second LoadingScene into a 256×256 render target; and the fullscreen DOM overlay replaces the monitor after zoom. All three are deliberately replaced by the architecture below.

### Chosen monitor architecture

| Option                                                                   | Decision              | Why                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------ | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Drei `<Html transform>` attached to the named screen mesh                | **Use**               | It keeps Retro OS as real DOM: accessible buttons, text selection, normal React state, keyboard input, and the illusion that it lives inside the monitor. Use its recommended parent-downscale/child-upscale technique to mitigate transform softness. |
| Current per-frame `WebGLRenderTarget` / `createPortal(<LoadingScene />)` | **Remove for the OS** | Appropriate only for passive 3D imagery. It cannot host the existing DOM OS without rasterizing it and losing normal DOM interaction.                                                                                                                  |
| Full-screen Retro OS overlay                                             | **Replace**           | It breaks the physical-monitor illusion the user wants.                                                                                                                                                                                                |
| Hand-managed CSS3DRenderer                                               | **Do not add**        | Drei Html supplies the required DOM-to-3D transform without a second renderer and duplicate camera-sync layer.                                                                                                                                         |

Implementation detail: create a small monitor-anchor component that reads the named mesh after GLB load, derives its world position/quaternion and visible bounds, and mounts the DOM screen on a calibrated plane just in front of it. Keep the outer DOM wrapper at the exact monitor aspect; make the Retro OS responsive within that wrapper. Do not guess screen coordinates from the viewport.

### Current-tool decision on the pasted recommendation

| Recommendation                | Decision for this portfolio                                                                                                                                                                                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React + R3F + Drei + Three.js | **Yes — already the right base.** Retain it and simplify the scene architecture first.                                                                                                                                                                              |
| Next.js rewrite               | **No, not in this phase.** Next.js does not make the GLB or Canvas faster. It may later help with server-rendered recruiter/agent content, but that is a separate content/discovery decision, not a prerequisite for this 3D redesign.                              |
| `gltfjsx`                     | **Conditional.** Use it as an inspection/type-safety tool if future interactions need many named cubicle objects. Do not automatically turn an 89-mesh asset into a large generated component when one small model adapter and the existing screen name are enough. |
| Zustand                       | **Conditional.** Start with a small explicit scene-state reducer (`boot → globe → reveal → roam → approach-monitor → monitor-active`). Introduce a store only when 3D and DOM need to share state across several independent trees.                                 |
| GSAP / Theatre.js             | **Later, only if art direction needs an authored timeline.** The current camera can be made smooth with delta-based, interruptible R3F animation; do not add a timeline dependency merely for a single transition.                                                  |
| KTX2 + Meshopt                | **Yes, after inspecting and profiling an optimized candidate.** The cubicle is texture/material-heavy, so texture work is more important than its modest geometry count.                                                                                            |
| WebGPU + TSL                  | **Research spike later, not the core migration.** Use it only for a distinctive optional effect after the WebGL version meets visual/performance goals.                                                                                                             |
| Physics / Rapier              | **Not yet.** Camera movement, named-object interaction, and monitor state add more value before collision physics.                                                                                                                                                  |

### Rendering and performance plan

1. Establish one scene state machine and one canvas. The globe appears immediately; once its first visible frame is painted, begin model loading/warm-up behind it. Replace the fixed 3-second timer with readiness plus a very short art-directed transition.
2. Keep the globe lightweight: one static instanced land-dot mesh, a modest 7, no ocean particles, no post-processing, and no second WebGL context.
3. Make the cubicle reveal occur in the same scene graph. Fade/scale/position the globe out while the room material/fog/camera treatment reveal; never cross-fade two canvases.
4. Remove the 256×256 per-frame monitor render target. While roaming, the monitor can show a static low-cost boot/idle surface. Mount the DOM OS only during the monitor approach; keep it mounted while active instead of recreating it.
5. Keep the renderer on WebGL 2 for the first production-quality implementation. Upgrade the coordinated React/R3F/Three stack only after a compatibility spike: the installed app uses React 18 + R3F 8 + Three r160, while modern R3F 9/WebGPU support requires a React 19-compatible migration.
6. After the architecture is stable, inspect a copy of the GLB, preserve its CC-BY attribution, then test texture downscaling/pruning, KTX2/Basis texture compression, and Meshopt geometry compression one variable at a time. Reject any candidate that harms the room's intended look or makes decoding slower on target phones.
7. Use a demand-driven frame loop whenever the scene is idle; invalidate during camera motion, pointer drag, globe motion, and monitor transitions. Keep continuous rendering only while an actual animation is active.
8. Add quality tiers based on real capability and reduced-motion preference. Low-tier/reduced-motion devices get a static or minimally animated globe, capped DPR, no idle animation, and a normal DOM portfolio route.

### Required interaction and visual checks

- The monitor DOM must receive pointer, keyboard, tab, copy/select, scrolling, app-window drag, and text-input events exactly like the current full-screen OS.
- The scene controls must yield while the monitor is active; Escape and the named exit control must restore room controls and focus predictably.
- CRT decoration uses `pointer-events: none`, explicit `opacity`/`transform` transitions only, and a `prefers-reduced-motion` off state.
- Provide a semantic keyboard path to enter the computer; Canvas raycast alone is not sufficient.
- Measure initial bytes, model decode, shader warm-up, draw calls, texture count/GPU memory, frame time, and long tasks on desktop and a mid-tier mobile device before/after each stage.

## The visual brief

Replace the random "4D star" shell in the loading scene with a retro-futuristic globe:

- **Continents:** white pixel-like dots form only land masses; the sea remains intentionally empty.
- **Centerpiece:** a floating, subtly dimensional white 7 sits inside the globe.
- **Palette:** portfolio blue remains the field color (#1e3a8a family); white is the signal color; use near-black/navy only for depth, outline, or contrast. Do not inherit SevanWorks' orange/brown color system.
- **Movement:** very slow auto-rotation, small mouse/touch parallax only if it helps, and a calm handoff to the rest of the portfolio. It should feel deliberate and retro, not like a generic particle simulation.
- **Character:** dots may have small deterministic size/lift variation, but never appear in the ocean. No noisy star field, no random cosmic volume, no copied hover-trail motif.

The globe should be the recognizable opening mark, not a loading curtain that blocks reading the site.

## What to borrow from the SevanWorks reference

The reference globe has a strong reusable system:

| Reference idea                                                                | Adopt for Portfolio? | Portfolio adaptation                                                                                                                                                   |
| ----------------------------------------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Offline land mask from world-atlas land-110m.json plus d3-geo / geoContains   | Yes                  | Generate data at build time so no geographic lookup runs in the browser.                                                                                               |
| Fibonacci-like candidate distribution, then retain only land points           | Yes                  | Produces an even country-dot field with truly empty water.                                                                                                             |
| Packed node data and two quality tiers                                        | Yes                  | Keep compact/full payloads small; start with fewer nodes than the reference.                                                                                           |
| One InstancedMesh and static instance matrices                                | Yes                  | Essential: one geometry/material/draw path for dots. [Three.js documents instancing as a draw-call reduction tool.](https://threejs.org/docs/pages/InstancedMesh.html) |
| DPR cap, device tiering, reduced-motion handling, disposal                    | Yes                  | Make these non-negotiable in the Portfolio version.                                                                                                                    |
| Brown/orange scene, dense hover shader, trails, rings, spotlight choreography | No                   | Those are SevanWorks-specific and add cost/visual overlap without serving the desired blue/white identity.                                                             |
| 9,370 full / 4,271 compact land nodes                                         | Maybe                | Begin at roughly 2,000-4,000 compact and 4,000-6,000 full after visual profiling. The Portfolio loader needs readability, not geographic density.                      |

The reference itself uses raw Three.js 0.173; this portfolio uses React Three Fiber and Three.js 0.160. Port the architecture deliberately rather than copy/pasting components across versions.

## Earlier audit staging option (superseded)

> Retained as audit context only. Do not implement this staging order; use the revised direction above.

    semantic recruiter shell (instant)
            |
            +-- visible identity / resume / work links
            |
            +-- small land-only globe enhancement (one Canvas)
                       |
                       +-- user chooses "Explore 3D studio"
                                  |
                                  +-- fetch + mount cubicle scene on intent

### Why this order

The current entry performs three expensive visuals together: loading Canvas, cubicle Canvas, and a per-frame monitor render target. That is exactly the wrong order for a 3.2 MiB mobile entry route. The globe should be the only 3D work during first paint. The cubicle should not compete for network, shader compilation, CPU, or GPU until the visitor has chosen the richer experience.

The "loading" state can still be beautiful:

1. Render the semantic shell and blue field immediately.
2. Show the globe as soon as its one instanced mesh and 7 are ready.
3. Start the cubicle only after an explicit "Explore 3D" action, or conservatively during idle time on a proven capable connection.
4. Use a still/cheap monitor texture in the cubicle, not a second live LoadingScene portal rendered every frame.

Do not preserve the existing three-second minimum wait. A short transition may be art direction; fixed unproductive delay is not.

## Globe implementation plan

### Data pipeline

At development/build time only:

1. Read a known world land topology such as world-atlas/land-110m.json.
2. Generate evenly distributed sphere candidates.
3. Convert candidate normal to latitude/longitude and retain it only when it is land.
4. Apply deterministic dropout and a latitude floor to maintain visual spacing.
5. Pack normal, lift, scale, and optional brightness into a compact typed representation.
6. Commit the generated data and its generator together. Do not generate on the visitor's device.

The exact map resolution is a visual input, not a claim of political/cartographic authority. Keep country borders implicit: points show land shapes, not a precise geopolitical map.

### Rendering

- Use one small box/rect/prism geometry and one unlit white material for all dots.
- Write transforms once, set instance matrix usage to static, compute a bounding sphere, and leave normal frustum culling on.
- Create the 7 from the existing local typeface or a prebuilt geometry. Keep bevel/segment count low; it is a focal object, not a mesh benchmark.
- Use an opaque blue background. A very faint low-poly atmosphere shell is optional only if it does not make the sea look populated.
- Stay within one or two draw calls for the globe itself. No post-processing on the entry route.
- Rotate at a rate that feels alive but supports scanning (for example 0.02-0.05 rad/s, subject to visual QA). Pause when the page is hidden.

### Quality tiers

| Capability                      |                       Dots |      DPR | Motion                                              |
| ------------------------------- | -------------------------: | -------: | --------------------------------------------------- |
| Reduced motion / low capability | 0-2,000 or static fallback |      1.0 | Static globe or one very slow non-looping reveal    |
| Typical mobile                  |                2,000-4,000 | 1.0-1.25 | 30 fps cap, no hover shader                         |
| Desktop / capable GPU           |                4,000-6,000 |  max 1.5 | 60 fps only while visible; optional gentle parallax |

Use a real capability/fallback policy, not desktop viewport width alone. The existing useIsMobile behavior should not decide the entire responsive route from a one-time touch/UA check.

## Cubicle optimization plan

The existing cubicle model is not geometry-heavy, but it contains 89 primitives, 72 materials, 68 embedded textures, and about 2.48 MB of image data. Optimize it after the one-canvas entry route is stable:

1. **Measure first.** Capture renderer draw calls, triangles, texture count, shader compilation, and GPU memory on mobile and desktop before changing it.
2. **Prioritize textures.** Resize/prune unused images and test KTX2/Basis texture compression. Three.js supports KTX2 through KTX2Loader; use it only after confirming decoder overhead and visual quality on target devices.
3. **Treat mesh compression as secondary.** With about 4,204 triangles, Draco/Meshopt may help transport a little, but textures and material state are more likely to matter.
4. **Keep original materials where possible.** Do not automatically upgrade every MeshBasicMaterial to a PBR material. Use PBR only for visibly important surfaces.
5. **Set a shadow budget.** Only the few meshes that need a shadow should cast/receive one. Avoid high-cost shadows for tiny props.
6. **Remove the continuous render target.** A 256×256 offscreen screen saver is extra GPU work on every main frame. Replace it with a static render, update at a low capped cadence only while visible, or use a simple texture.
7. **Preserve attribution.** The current GLB metadata identifies the source as NobleCrow on Sketchfab under CC-BY-4.0. Before optimizing or re-exporting it, add/retain an appropriate public attribution record.

## Accessibility and fallback

- The same portfolio content must work with JavaScript delayed, WebGL unavailable, keyboard-only navigation, and reduced motion.
- Do not make globe drag or cubicle click the only route to content. Offer a normal semantic link/button to enter the work.
- Respect prefers-reduced-motion: no auto-rotation, camera zoom, or particle animation unless the user explicitly starts it.
- Announce only meaningful state changes; avoid narrating decorative canvas motion to assistive technology.

## Earlier audit implementation sequence (superseded)

> Retained only for historical reasoning. The revised sequence is the authoritative implementation order.

1. **Content shell first.** Add the canonical visible summary and validate keyboard/no-JS behavior.
2. **Globe spike.** Build the isolated blue/white globe with generated land-only data; compare visually to the desired brief before touching the cubicle.
3. **Performance gate.** Run mobile PSI, a local performance trace, and renderer.info checks. Confirm no concurrent canvas or offscreen continuous pass remains during entry.
4. **Cubicle-on-intent.** Lazy-load and profile model compression/material/shadow changes.
5. **Accessibility gate.** Test 390px width, keyboard-only, reduced motion, screen reader landmarks, and a non-WebGL fallback.
6. **Live gate.** Confirm cache policy, deployment, no console errors, desktop/mobile visual QA, and a fresh agent-access scan.

The implementation is complete only when it both looks like the intended globe and meets the performance budget in [the public baseline](../audits/public-web-baseline.md), not when the scene merely renders.

## Current research references

- [Drei Html](https://drei.docs.pmnd.rs/misc/html) — transformed DOM, occlusion, and its documented transform-mode sharpness mitigation.
- [React Three Fiber Canvas](https://r3f.docs.pmnd.rs/api/canvas), [performance pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls), and [scaling performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance) — one-canvas configuration, demand rendering, invalidation, and mount/re-render guidance.
- [Three.js WebGPURenderer](https://threejs.org/manual/en/webgpurenderer) and [MDN WebGPU](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API) — WebGPU capability, WebGL 2 fallback, and current browser-support limits.
- [Three.js GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html) and [glTF Transform CLI](https://gltf-transform.dev/cli) — KTX2/Basis, Meshopt, inspection, and targeted asset optimization.
