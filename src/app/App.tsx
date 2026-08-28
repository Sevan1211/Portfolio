import React, { Suspense, useEffect } from "react";
import Landing from "@features/Landing/components/Landing";
import { CONTACT, IDENTITY, PROJECTS } from "@shared/content/portfolio";

// Lazy-load the 404 page - only needed on invalid routes
const NotFound = React.lazy(() =>
  import("@features/NotFound/NotFound").then((m) => ({ default: m.NotFound })),
);

// Lazy-load the OS for the /os full-page route
const RetroOS = React.lazy(() =>
  import("@features/Landing/components/OS").then((m) => ({
    default: m.RetroOS,
  })),
);

const PortfolioOverview: React.FC = () => (
  <section
    id="portfolio-overview"
    className="portfolio-overview"
    tabIndex={-1}
    aria-labelledby="portfolio-overview-title"
  >
    <p className="portfolio-overview__eyebrow">Accessible portfolio overview</p>
    <h1 id="portfolio-overview-title">{IDENTITY.name}</h1>
    <p className="portfolio-overview__role">
      {IDENTITY.title} · {IDENTITY.location}
    </p>
    <p>{IDENTITY.narrative}</p>
    <p>{IDENTITY.availability}</p>
    <nav
      className="portfolio-overview__links"
      aria-label="Primary portfolio links"
    >
      <a href={CONTACT.resumePath}>Resume</a>
      <a href={CONTACT.github}>GitHub</a>
      <a href={CONTACT.linkedin}>LinkedIn</a>
      <a href="/os">Open accessible desktop</a>
    </nav>
    <h2>Selected projects</h2>
    <ul>
      {PROJECTS.map((project) => (
        <li key={project.id}>
          <strong>{project.title}</strong>: {project.subtitle}
        </li>
      ))}
    </ul>
    <p className="portfolio-overview__hint">
      Continue tabbing to use the interactive experience, or open the desktop
      directly to skip the 3D scene.
    </p>
  </section>
);

const App: React.FC = () => {
  const path = window.location.pathname;
  const isOsPage = path === "/os" || path === "/os/";
  const is404 = !isOsPage && path !== "/" && path !== "/index.html";

  // On 404 page, pressing any key redirects home
  useEffect(() => {
    if (!is404) return;
    const goHome = () => {
      window.location.href = "/";
    };
    window.addEventListener("keydown", goHome);
    window.addEventListener("click", goHome);
    // Dismiss page-cover on 404 so it doesn't block the BSOD
    const cover = document.getElementById("page-cover");
    if (cover) cover.style.display = "none";
    return () => {
      window.removeEventListener("keydown", goHome);
      window.removeEventListener("click", goHome);
    };
  }, [is404]);

  // The /os route renders the Retro OS as the whole page - no 3D required.
  useEffect(() => {
    if (!isOsPage) return;
    const cover = document.getElementById("page-cover");
    if (cover) cover.style.display = "none";
  }, [isOsPage]);

  if (isOsPage) {
    return (
      <>
        <a className="skip-link" href="#desktop-content">
          Skip to desktop
        </a>
        <main
          id="desktop-content"
          tabIndex={-1}
          style={{ position: "relative", width: "100%", height: "100vh" }}
        >
          <Suspense fallback={null}>
            <RetroOS isZoomedIn fullscreen standalone />
          </Suspense>
        </main>
      </>
    );
  }

  if (is404) {
    return (
      <main>
        <Suspense fallback={null}>
          <NotFound />
        </Suspense>
      </main>
    );
  }

  return (
    <>
      <a className="skip-link" href="#portfolio-overview">
        Skip 3D scene and view portfolio
      </a>
      <main className="site-main">
        <PortfolioOverview />
        <Landing />
      </main>
    </>
  );
};

export default App;
