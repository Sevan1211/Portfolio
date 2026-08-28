# Public web baseline

**Audited:** 2026-08-21

**Scope:** public requests, live browser inspection, repository read, the local resume as a factual cross-check, and the existing sevanworks globe implementation as a design reference.
**Not in scope:** Cloudflare dashboard, GitHub hosting settings, origin configuration, deployments, or production writes. A local-only 3D implementation was completed after this public audit; its code and local validation evidence are recorded separately in [3D globe direction](../design/3d-globe-direction.md).

## Local performance update — 2026-08-28

The final local production-preview passes are recorded in [3D globe direction](../design/3d-globe-direction.md). The initial optimization comparison improved desktop Lighthouse from 75 to 97 and mobile from 38 to 97. The complete ship candidate measured **97 desktop / 95 mobile**; its mobile route transferred 243,689 B after removing accidental desktop-3D and animation dependencies. The cubicle asset fell from 2,909,120 B to 1,447,052 B with its inspected scene counts and rendered look preserved. This does **not** replace the dated public baseline below: nothing was deployed, no Cloudflare state was changed, and real-device/live verification remains open.

## Local mobile implementation update — 2026-08-26

**Sources:** code review, local production build, and rendered local browser checks. **Deployment status:** local only; the public site and Cloudflare configuration were not changed or remeasured.

The mobile route now has an intentionally separate product identity: a custom 2007-era “Sevan phone” rather than a reduced copy of the Windows 95 desktop. The desktop cubicle remains the primary experience above the responsive cutoff and is still directly reachable at `/os`; mobile contains no Desktop app or `/os` prompt.

### Approved decisions implemented

- Viewports at or below 1024 px use the phone/tablet layout, including narrow desktop windows. The layout reacts to breakpoint changes instead of making a one-time touch/UA decision.
- The lock screen appears once per tab session. A valid `?app=` deep link bypasses the lock, app launches write shareable URLs, browser Back returns to Home, and the hardware-style Home control restores the launching icon's focus.
- The Home grid is About, Experience, Skills, GitHub, LinkedIn, Notes, Snake, and Settings. The dock is Contact, Mail, Resume, and Projects. All launcher artwork is one code-native icon family; the mobile Desktop app was removed.
- Projects open an internal detail view before any external destination. The initial featured set is p100, PRISM, Threadroot, and CodeLive. Project screenshots were deliberately omitted until real project imagery is approved.
- The same typed `PROJECTS` source now feeds mobile and desktop. p100 and PRISM are labeled private/local; public projects expose only their approved external links.
- Settings now make real changes: Reduce Motion, Simplified Graphics, and High Contrast persist locally. The operating-system reduced-motion preference overrides the site control. The draining battery remains an intentional joke and bottoms out at 7%.
- Mobile and desktop bundles are lazy at the layout boundary. The final lock wallpaper is a lightweight CSS composition rather than a delayed WebGL enhancement, so a mobile-first visit does not request the desktop Three.js stack for a transient background.

### Local acceptance evidence

Updated on 2026-08-28 for the final ship candidate; these rows supersede the earlier tooling-gap notes from the first mobile implementation pass.

| Check                        | Result                                                                                                                                                                                                                                                                      |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript                   | `npm.cmd run type-check` passed.                                                                                                                                                                                                                                            |
| Production build             | `npm.cmd run build` passed: 2,766 modules transformed. MobileLanding emitted as a 28.54 kB JS chunk (8.18 kB gzip). Its dependency map contains no Three.js, React Three Fiber, desktop typeface, or Framer Motion chunk; those remain behind desktop-only lazy boundaries. |
| Rendered layouts             | 320×568 and 390×844 phones, 834×1112 tablet, 1024×768 breakpoint, and 1280×800 desktop were checked. No tested layout had horizontal overflow; the desktop retained one cubicle canvas.                                                                                     |
| Interaction/accessibility    | Keyboard unlock and keyboard Snake start passed; Home is inert while locked or behind an app; apps use named modal-dialog structure; Home/browser Back restore the launcher path; tested interactive targets were at least 44×44 px.                                        |
| App behavior                 | `?app=projects` opened directly, session reload skipped the lock, project list/detail navigation worked, and all three accessibility settings changed and persisted their states.                                                                                           |
| Console                      | The final desktop and 390 px mobile production previews had no browser warnings or errors.                                                                                                                                                                                  |
| Diff/format                  | `git diff --check` passed; all changed supported text files passed targeted Prettier formatting.                                                                                                                                                                            |
| Repository test/lint tooling | `npm.cmd run lint`, `npm.cmd run type-check`, and `npm.cmd test` passed. Vitest is configured to succeed when no test files exist and reported that no tests were found; rendered interaction checks remain part of the release gate.                                       |

This is implementation evidence, not a new public performance score. Run mobile lab/field measurements only after an authorized deployment; preserve the 2026-08-21 PSI numbers below as the live pre-change baseline until then.

## Executive readout

> **Direction update (2026-08-21):** The verified findings below remain the baseline. The earlier recommendation for a conventional recruiter-first entry shell is superseded by the user-approved 3D flow in [3D globe direction](../design/3d-globe-direction.md). The same accessibility, keyboard, no-WebGL, and content-discovery outcomes remain required, but they must not replace the cubicle on capable desktop devices.

> **Local implementation update (2026-08-21):** The new single-canvas land-dot globe → cubicle → physical-monitor flow has passed local visual, keyboard, interaction, type-check, and production-build checks. The scores and public behavior below are still the **pre-deployment live baseline**; remeasure them only after an authorized deployment.

The site is distinctive and technically ambitious, but its strongest recruiter information is hidden behind a full-screen 3D entrance and a click target. On the tested mobile lab device it is not yet fast: PageSpeed Insights returned **47 Performance**, **3.3 s LCP**, **25,080 ms Total Blocking Time**, **20 long tasks**, and a **3,219 KiB** initial payload. The 3D experience should remain, but it needs to become an optional, staged enhancement rather than the prerequisite to find the portfolio.

Agent readiness is also materially limited. [Is Agentic's public scan](https://is-agentic.com/scan/sevanlewispayne.com) returned **14/100** on 2026-08-21. Its headline conclusion is directionally correct: a JavaScript-only shell and some bot blocking leave agents unable to read the actual work. Several API/MCP findings are false positives caused by SPA fallback HTML returning 200 text/html for invented paths, so the right response is not to manufacture APIs or agent protocols for a personal portfolio.

The public network baseline is otherwise sound at the apex: HTTP redirects to HTTPS, IPv4 and IPv6 both serve the site, TLS 1.3 succeeds, HSTS and core security headers are present, and Cloudflare is in front of the site. The missing www DNS record is the clear public-domain gap.

## Evidence summary

| Area                | Verified observation                                                                                                                                                          | Meaning                                                                                                          |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Recruiter path      | The initial live DOM contained one canvas, no headings, and no readable portfolio text after the entrance had loaded. Reaching work requires the cubicle/monitor interaction. | Identity, resume, and projects are too difficult to scan quickly.                                                |
| Mobile performance  | PSI mobile lab: 47 Performance; FCP 3.2 s; LCP 3.3 s; TBT 25,080 ms; CLS 0; Speed Index 10.2 s; 20 long tasks.                                                                | The opening experience blocks a mid-tier mobile device for far too long.                                         |
| Agent access        | Is Agentic: 14/100, essential 1/8. Raw HTML is a React shell; its scan reports WAF/security challenge and bot reachability failures.                                          | Crawlers and text-first agents cannot reliably explain the portfolio.                                            |
| Public hostname     | http apex returns 301 to HTTPS; the HTTPS apex returned 200 over IPv4 and IPv6. www.sevanlewispayne.com does not resolve.                                                     | Apex canonicalization works; typing www fails.                                                                   |
| HTTPS               | Public handshake negotiated TLS 1.3 / AES-256-GCM. The observed edge certificate covered only sevanlewispayne.com and was valid through 2026-09-26.                           | Good current edge transport. Confirm renewal and any future www coverage in Cloudflare before adding a redirect. |
| Cache policy        | Hash-named JS/CSS assets and the GLB all returned Cache-Control: public, max-age=0, must-revalidate.                                                                          | Cloudflare edge cache was a HIT, but repeat visitors still revalidate immutable build assets.                    |
| Content consistency | Desktop, mobile, terminal, and linked resume describe the same employers/projects with different titles, dates, metrics, and featured projects.                               | This is a trust and maintenance risk before any new content is added.                                            |

## 1. Recruiter and content audit

### What is working

- The retro OS / cubicle concept is memorable and clearly bespoke.
- Desktop experience has a resume download, contact, LinkedIn, and GitHub once the user reaches the relevant app.
- The site has substantive work and project detail rather than empty visual polish.
- The mobile layout provides direct GitHub project links, which desktop project cards currently do not.

### Material friction

1. **The portfolio is not immediately legible.** The raw page starts with a root div, a page-cover, and a Canvas. The normal browser DOM after the loading sequence had no H1, headings, or readable portfolio text. A recruiter should never have to discover a 3D monitor just to learn who Sevan is, what roles he wants, or where the resume is.
2. **The entrance imposes a fixed wait.** LandingScene hard-codes a three-second minimum loader and then waits through a fade/settle path. A polished loading scene is valuable; mandatory dead time is not.
3. **Desktop and mobile tell different stories.** For Rasmussen, desktop calls the role "Data Engineering & Analytics Intern" and lists dbt, Snowflake, FieldServio, Fivetran, forecasting, and 15+ dashboards. Mobile calls it "Data Visualization & Automation Intern" and lists 40% reporting efficiency and n8n automation. The linked resume aligns much more closely with mobile.
4. **The project portfolio is not canonical.** Desktop and mobile feature PrepMe, CodeLive, and Elmwood Exteriors. The resume instead features VAERA-DEV. Desktop cards lack the GitHub links exposed on mobile.
5. **Positioning drifts.** Metadata says "Full-Stack Software Developer"; desktop About says "Software Engineer · Data Engineer"; mobile says "Full-Stack Developer." This should become one current, recruiter-facing position statement rather than competing labels.

### Best approach for the next content update

Create one typed data source for experience, projects, skills, external links, role statement, and availability. Render desktop, mobile, terminal, metadata, static/agent text, and the resume-update checklist from that source. The data model should require:

- verified title, employer, location, date range, and 2-4 evidence-backed bullets;
- a single source for each metric and an explicit "omit until verified" option;
- project status, live URL, source URL, ownership, key technical decision, and outcome;
- a featured order designed for 2027 recruiting, not whichever project was newest at the time;
- a required canonical summary that surfaces on first paint.

Before editing claims, reconcile the current resume against the next approved content source. Do not blend the desktop and mobile claims merely to make them longer.

## 2. Agent accessibility

### Verified behavior

[Is Agentic](https://is-agentic.com/) reports that it scores public information an agent can discover, retrieve, understand, and use. Its 2026-08-21 scan found:

- **14/100** overall; essential checks 1/8, recommended checks 1/19.
- No meaningful server-rendered content available without JavaScript; it specifically recommends an H1 and meaningful raw HTML.
- Its observed journey could only assemble a vague "full-stack developer portfolio with 3D interactive elements," rather than access project and experience content.
- It reported blocks for GPTBot, ClaudeBot, ChatGPT-User, PerplexityBot, Google-Extended, and Applebot-Extended.

Public probes add the necessary nuance:

| Request identity  | Observed response | Interpretation                                                                                  |
| ----------------- | ----------------- | ----------------------------------------------------------------------------------------------- |
| Normal browser UA | 200 HTML          | The interactive site is reachable.                                                              |
| ChatGPT-User      | 403 plain text    | A user-driven agent request is blocked from this probe.                                         |
| ClaudeBot         | 403 plain text    | A crawler request is blocked from this probe.                                                   |
| GPTBot            | 200 HTML          | The response is not uniformly blocked by only spoofing the UA, but robots.txt disallows GPTBot. |
| Google-Extended   | 200 HTML          | Same caveat; robots.txt disallows Google-Extended.                                              |

These direct probes do **not** impersonate verified crawler network identity, so they do not prove how each real service is treated. They do prove that the public policy is inconsistent from an agent's perspective and that the current robots.txt explicitly opts out of several major crawlers.

The live robots.txt is Cloudflare-managed at the top and disallows Amazonbot, Applebot-Extended, ClaudeBot, Google-Extended, GPTBot, and others. It allows generic crawling, declares search=yes, ai-train=no, use=reference, and points to the sitemap. This is a product/policy choice, not automatically a bug.

### Important false positives in the score

The scan finds apparent GraphQL, OpenAPI, MCP, agent-card, API-catalog, and other endpoints. Public checks show paths such as /graphql, /ask, /docs, /.well-known/agent-card.json, and /.well-known/mcp/manifest.json all return a 200 HTML app shell with the same small response size. The SPA router then displays its client-side Not Found view. That behavior creates misleading "invalid JSON" signals and makes agents believe integrations might exist.

Do **not** add an OpenAPI spec, OAuth scopes, pricing file, MCP server, A2A card, NLWeb endpoint, or agent-skills index merely to raise this score. This portfolio has no public product API to describe. Instead:

1. Configure the host to return a real HTTP 404 for unknown API-style and well-known routes.
2. Publish only truthful discovery surfaces: a short /llms.txt or /agents.md plus a static recruiter-friendly summary if agent access is desired.
3. Make actual portfolio text available as raw HTML through static/prerendered pages or progressively enhanced first-paint content.
4. Decide, in Cloudflare, whether real-time user-directed agents should be allowed. Keep training crawlers blocked if that is the desired policy.

Cloudflare's current bot controls distinguish AI Search, Agent, and Training activity, and its WAF/AI Crawl Control documentation warns that upstream rules can still block an allowed crawler. Review the dashboard before changing policy: [AI crawler controls](https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots/), [WAF interaction](https://developers.cloudflare.com/ai-crawl-control/configuration/ai-crawl-control-with-waf/), and [verified bots](https://developers.cloudflare.com/bots/concepts/bot/verified-bots/).

### Sitemap and discovery

- /sitemap.xml exists and returns valid XML, so Is Agentic's "No sitemap found" is not a literal public-path failure.
- It lists only the homepage and retains lastmod 2026-03-02. Update the date only when the page has actually changed, and list future static routes individually.
- AGENTS.md at the repository root is instruction for contributors. It does not become a public /agents.md until deliberately copied/generated and deployed.

## 3. Performance and 3D audit

### Live mobile lab baseline

This is one [PageSpeed Insights mobile lab report](https://pagespeed.web.dev/analysis/https-sevanlewispayne-com/7crdcmbyut?form_factor=mobile), captured on 2026-08-21 with an emulated Moto G Power, Slow 4G, Lighthouse 13.4.1. It is not field/CrUX data.

| Metric                   |    Result |  Launch target after the redesign |
| ------------------------ | --------: | --------------------------------: |
| Performance score        |        47 |                        90+ mobile |
| First Contentful Paint   |     3.2 s |                           ≤ 1.8 s |
| Largest Contentful Paint |     3.3 s |                           ≤ 2.5 s |
| Total Blocking Time      | 25,080 ms |                          ≤ 200 ms |
| Cumulative Layout Shift  |         0 |                             ≤ 0.1 |
| Speed Index              |    10.2 s |                           ≤ 3.4 s |
| Long tasks               |        20 |  0 tasks over 500 ms during entry |
| Initial payload          | 3,219 KiB | ≤ 1.5 MiB before optional cubicle |

The desktop PSI request timed out upstream (RPC::DEADLINE_EXCEEDED), so there is no comparable desktop score from this audit. Re-run it after the first implementation stage; do not infer one from the mobile result.

### Live asset evidence

| Initial asset                     | Received size in public probe | Observation                                                             |
| --------------------------------- | ----------------------------: | ----------------------------------------------------------------------- |
| low_poly_90s_office_cubicle.glb   |                   2,909,120 B | Dominates initial network cost and is prefetched before user intent.    |
| Three vendor bundle               |                192,522 B gzip | Needed immediately because all visitors enter the WebGL experience.     |
| All initially observed JS bundles |            about 321 KiB gzip | Reasonable by itself, but costly beside the model and main-thread work. |
| Typeface JSON                     |                 22,138 B gzip | Small; not the primary bottleneck.                                      |

The GLB is low-poly by triangle count (about 4,204 estimated triangles) but has **89 primitives, 72 materials, and 68 embedded textures** totaling about **2.48 MB**. It is therefore texture/material/draw-call heavy rather than triangle-heavy.

### Code-level causes

- The entry mounts a loading Canvas and the main cubicle Canvas concurrently. The main canvas loads/prefetches the 2.9 MB model while the overlay is shown.
- OfficeCubicle also renders a 256×256 offscreen scene every frame for the monitor, including a second copy of the animated 1,200-particle/3D-7 loading scene.
- The loader itself uses a sound instanced-mesh pattern, but it creates 1,200 random shell particles rather than a purposeful globe; frustum culling is disabled for that mesh.
- The cubicle traverses the model, promotes basic materials to PBR materials, enables cast/receive shadows across meshes, configures high anisotropy, and updates materials on first load. That can produce a polished look, but it is a poor fit for the current mobile budget.
- Hash-named assets are edge-cache hits but still send max-age=0, must-revalidate. Long-lived immutable caching is appropriate only after verifying deploy invalidation behavior. Cloudflare documents the browser cache TTL setting, and standard cache guidance supports max-age plus immutable for versioned URLs: [Cloudflare](https://developers.cloudflare.com/cache/how-to/edge-browser-cache-ttl/set-browser-ttl/) and [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control).

### Existing strengths to preserve

- Vite manual chunks and lazy app registry provide a sensible starting point.
- The main Canvas already bounds DPR to 1-1.5 and uses PerformanceMonitor / AdaptiveDpr.
- The particle transforms are precomputed, instances are used, materials are memoized, and GPU resources have cleanup paths.
- The model uses frustum culling and the pointer raycast is rAF-throttled.

## 4. Accessibility and interface audit

PageSpeed returned 100 for automated accessibility, but it explicitly lists several manual checks it cannot establish. The code and behavior identify real manual issues:

- The critical "click monitor to enter" path is a Canvas raycast with no keyboard equivalent or semantic instruction.
- The lock screen's div onClick is not a native control; window controls expose visual titles but no accessible names.
- The portfolio has no first-paint heading structure for screen readers or text-only browsing.
- The mobile selector is calculated once from touch/coarse-pointer/user agent rather than responsive width. At a 390×844 narrow desktop viewport the live page remained a canvas-first desktop route, which risks clipping instead of a responsive layout.
- No prefers-reduced-motion rule was found in this repo even though the entry includes continuous spin, camera motion, transitions, and a game-like interaction. The platform media query exists specifically for users who request less non-essential motion: [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion).
- Images used in content should declare dimensions/aspect ratio to prevent layout shift when the semantic portfolio view becomes visible.

The interface review should follow the project’s design guidance: preserve the retro style, but make primary actions native, focusable, named, and discoverable.

## 5. Public networking and security

### Verified good

- Apex A records: 104.21.79.131, 172.67.145.186; AAAA records: 2606:4700:3034::6815:4f83, 2606:4700:3037::ac43:91ba.
- Cloudflare nameservers: daniella.ns.cloudflare.com, lee.ns.cloudflare.com.
- IPv4 and IPv6 both returned HTTPS 200.
- HTTP apex returned 301 to the HTTPS apex.
- HTTPS response included HSTS with includeSubDomains; preload, CSP, X-Content-Type-Options: nosniff, X-Frame-Options: SAMEORIGIN, Referrer-Policy, and a restrictive Permissions-Policy.
- Response advertises HTTP/3 through alt-svc. The public curl client used HTTP/1.1, so this audit verifies advertisement, not an actual HTTP/3 session.

### Follow up with dashboard access

1. Add a proxied www DNS record and a single 301 redirect to the apex **only if** the user wants www supported. Confirm edge certificate coverage first; do not create redirect loops.
2. Check Cloudflare AI Crawl Control / Managed robots.txt / Bot settings / WAF custom rules as one system. The public robot policy and 403 probes indicate a conflict with the desired agent experience, but not the exact rule.
3. Verify the current short-lived edge certificate auto-renewal and the minimum TLS version. TLS 1.3 is enabled/available per Cloudflare's guidance, but dashboard state is not public proof: [TLS 1.3](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/tls-13/).
4. Locate the source of the live headers. public/\_headers in this repository is only a comment block, while the headers are demonstrably injected at the edge. Document the responsible Cloudflare/GitHub configuration before changing it.
5. Change cache policy only through the known owning layer; preserve HTML revalidation but give hash-named static assets an immutable browser lifetime after a cache-bust test.

## Priority order and acceptance gates

### P0 - make the work understandable without the 3D scene

1. Establish approved canonical content and remove desktop/mobile/resume divergence.
2. Show a semantic, recruiter-first summary with resume, GitHub, LinkedIn, role focus, and top projects on first paint. The 3D scene can remain as an "Explore the studio" enhancer.
3. Publish a truthful static agent/recruiter summary and real 404 behavior; make an explicit Cloudflare policy decision for user-directed agents vs. training crawlers.
4. Decide whether to support www; if yes, add and test canonical DNS/TLS/redirect behavior.

**Gate:** a text-only browser and keyboard-only user can identify Sevan, current target role, three selected projects, experience, resume, and contact without a canvas interaction.

### P1 - rebuild the entrance around the new globe

Implement the design in [3D globe direction](../design/3d-globe-direction.md): one light, land-only dot globe with a floating 7, then defer the cubicle and eliminate the continuous monitor render target.

**Gate:** mobile PSI is 90+ and the pre-interaction route meets the performance budget; reduced-motion and no-WebGL states retain the same recruiter path.

### P2 - optimize the cubicle after the entry route is fast

Compress/prune textures, retain model attribution, reduce shadow/material cost, and activate it after intent. Profile actual draw calls and GPU memory instead of guessing from triangle count.

**Gate:** a mid-tier mobile test can enter/leave the 3D scene smoothly, no console errors are introduced, and the model remains optional.

## Research references

- [Is Agentic methodology and public report](https://is-agentic.com/scan/sevanlewispayne.com)
- [Google Core Web Vitals thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds?hl=en)
- [Three.js InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html)
- [Three.js glTF and texture compression support](https://threejs.org/docs/pages/GLTFLoader.html) and [KTX2Loader](https://threejs.org/docs/pages/KTX2Loader.html)
- [React Three Fiber performance pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls)
- [Drei PerformanceMonitor](https://drei.docs.pmnd.rs/performances/performance-monitor)
