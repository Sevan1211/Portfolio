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
