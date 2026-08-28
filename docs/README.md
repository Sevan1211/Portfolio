# Portfolio working docs

These are the small set of living documents for improving this portfolio. They record evidence and decisions so future changes remain consistent instead of re-auditing the same problems.

| Document                                             | Use it for                                                                                             |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [Public web baseline](audits/public-web-baseline.md) | Current live behavior, agent access, network, recruiter-path, accessibility, and performance findings. |
| [3D globe direction](design/3d-globe-direction.md)   | The approved visual direction and engineering plan for the new opening globe.                          |

## Update convention

- Add the date and source of new evidence: **live**, **code**, **reference**, or **research**.
- Separate verified behavior from a proposed fix. Never turn a hypothesis into a fact because it sounds plausible.
- Keep this folder intentionally small. Extend one of the two documents when the topic belongs there; add a third only when it cannot.
- Do not place secrets, Cloudflare exports, API keys, personal contact data, or raw analytics in these docs.

## Current decision record

**2026-08-21 - public-only baseline.** Cloudflare configuration, DNS, GitHub settings, and production deployment were not changed. The repository-level [AGENTS.md](../AGENTS.md) is a project guide, not a deployed `/agents.md` file.

**2026-08-21 - revised 3D direction.** The user approved a continuous loading-globe → cubicle flow and a fully interactive Retro OS projected onto the physical monitor. The prior static recruiter-shell proposal is superseded as the desktop visual direction; its accessibility and content-discovery requirements remain separate acceptance work. See [3D globe direction](design/3d-globe-direction.md).

**2026-08-21 (late) - loader visual decision.** The user reviewed the land-dot globe against the live site and chose to keep the original star-shell loader (white particle cloud + centered 7 on `#1e3a8a`). It is ported faithfully into the single-canvas veil-transition architecture; the land-dot globe brief below is superseded as the loader visual, though its engineering practices (instancing, deterministic data, quality tiers) still apply.

**2026-08-21 - local 3D implementation.** The approved one-canvas globe → cubicle → physical-monitor flow is implemented and locally browser-checked. The implementation and outstanding live/mobile-performance measurement work are recorded in [3D globe direction](design/3d-globe-direction.md). Nothing has been deployed.

**2026-08-26 - local mobile implementation.** The approved 2007-era phone/tablet experience is implemented with a once-per-tab lock, responsive 1024 px cutoff, app deep links and Back behavior, functional accessibility settings, canonical featured projects, and no mobile Desktop app. Local acceptance evidence and remaining test/lint infrastructure gaps are recorded in [Public web baseline](audits/public-web-baseline.md). Nothing has been deployed.

**2026-08-28 - local 3D performance acceptance.** The desktop entry now uses a readiness-driven handoff, parallel shader preparation, sliced texture uploads, demand-based camera updates, stable quality tiers, and a visually checked WebP cubicle asset that is 50.3% smaller. Same-machine production Lighthouse comparisons improved desktop Performance 75→97 and mobile Performance 38→97; details and limitations are in [3D globe direction](design/3d-globe-direction.md). Nothing has been deployed.

**2026-08-28 - local ship-readiness pass.** The mobile apps received a final narrow-screen, semantic-control, keyboard, high-contrast, and route-level bundle cleanup; the desktop About This Site app now documents the final direct-CRT, single-canvas, responsive architecture and local acceptance evidence. The complete local candidate measured 97 desktop / 95 mobile Lighthouse, with mobile transfer reduced to 243,689 B in that production-preview session. Final repository checks are recorded in [Public web baseline](audits/public-web-baseline.md). Nothing has been deployed.

**2026-08-28 - post-release UI correction.** The user confirmed the prior candidate landed live and supplied a production screenshot of a duplicate oversized DOM “7” flashing before the actual WebGL loader. A local hotfix removes that duplicate mark, the mobile Reduce Motion control and dock reflections, stabilizes and enlarges Snake input, and replaces the monitor’s repeated scan bars with a fitted static CRT-glass treatment. The operating-system reduced-motion preference remains honored automatically. Built-preview evidence is recorded in the two living documents; this hotfix itself has not been deployed.

**2026-08-28 - local Python IDE stability pass.** The Python worker now enforces separate boot, package-setup, execution-time, and output limits. High-output and infinite programs terminate with judge-style verdicts before starting a clean interpreter, and stdout reaches React in bounded batches. The example picker retains its selected label, includes a blank workspace, and marks edited programs as custom code. About This Site no longer presents local build metrics as visitor content. Automated and built-preview evidence is recorded in [Public web baseline](audits/public-web-baseline.md); these changes have not been deployed.
