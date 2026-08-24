# Portfolio Agent Guide

## Scope and intent

This is Sevan Lewis-Payne's portfolio: a Vite, React, TypeScript, React Three Fiber, and Three.js site. Preserve the retro desktop / playful 3D identity while making the recruiter path, accessibility, and first-load performance unmistakably strong.

Read [docs/README.md](docs/README.md) before material portfolio, hosting, or 3D work. The current public baseline and proposed globe direction are living documents, not historical notes.

## Content discipline

- Treat experience, projects, skills, dates, metrics, links, role titles, and resume claims as factual content. Do not invent or normalize conflicting claims without confirmation.
- Keep one canonical portfolio-content source for desktop, mobile, terminal, metadata, agent-facing text, and any resume refresh. Do not copy/paste a new version into each surface.
- Recruiters must be able to reach an identity statement, role focus, resume, LinkedIn, GitHub, experience, and projects without completing a 3D interaction.

## 3D and performance

- The cubicle is the primary desktop experience. Preserve a keyboard and no-WebGL route to portfolio content, but do not replace the scene with a conventional landing page unless the user explicitly asks.
- Render the loading globe and cubicle handoff in one WebGL canvas. Do not use concurrent WebGL canvases or an always-running offscreen scene for the monitor.
- Reuse geometry and materials, instance repeated elements, use bounded DPR, pause or reduce motion when appropriate, and dispose resources on unmount.
- Measure before and after. Do not claim a 3D optimization is complete without mobile lab evidence and a visual regression check.
- Keep model attribution and license obligations intact when modifying or replacing assets.

## Accessibility and motion

- Use semantic controls for interactive UI. Every click path needs a keyboard path and an accessible name.
- Honor prefers-reduced-motion; never make spinning, zooming, or a drag gesture the only route to core content.
- Test narrow viewport layouts as layouts, not only as touch-device detection.

## Hosting and deployment

- Do not alter Cloudflare, DNS, WAF, GitHub Pages/Actions, or production settings without explicit user authorization.
- A public HTTP result is evidence of behavior, not proof of the dashboard configuration that caused it.
- Preserve the HTTPS apex canonical URL. Any future www change must be tested for DNS, certificate coverage, redirect behavior, and canonical metadata together.

## Validation

- Use npm.cmd on Windows when dependencies are installed. Run the relevant type check, lint, test, and production build before handoff; note that the build writes dist/ and analyzer output.
- Run git diff --check, inspect the changed paths, and validate desktop, narrow/mobile, keyboard, reduced-motion, and live-network behavior that the change touches.
- Update the relevant living document in docs/ with a date, evidence, decisions, and acceptance results when a material finding or implementation changes.
