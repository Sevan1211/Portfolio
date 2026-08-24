import React, { Suspense, useEffect } from 'react';
import Landing from '@features/Landing/components/Landing';

// Lazy-load the 404 page - only needed on invalid routes
const NotFound = React.lazy(() =>
  import('@features/NotFound/NotFound').then(m => ({ default: m.NotFound }))
);

// Lazy-load the OS for the /os full-page route
const RetroOS = React.lazy(() =>
  import('@features/Landing/components/OS').then(m => ({ default: m.RetroOS }))
);

const App: React.FC = () => {
  const path = window.location.pathname;
  const isOsPage = path === '/os' || path === '/os/';
  const is404 = !isOsPage && path !== '/' && path !== '/index.html';

  // On 404 page, pressing any key redirects home
  useEffect(() => {
    if (!is404) return;
    const goHome = () => { window.location.href = '/'; };
    window.addEventListener('keydown', goHome);
    window.addEventListener('click', goHome);
    // Dismiss page-cover on 404 so it doesn't block the BSOD
    const cover = document.getElementById('page-cover');
    if (cover) cover.style.display = 'none';
    return () => {
      window.removeEventListener('keydown', goHome);
      window.removeEventListener('click', goHome);
    };
  }, [is404]);

  // The /os route renders the Retro OS as the whole page - no 3D required.
  useEffect(() => {
    if (!isOsPage) return;
    const cover = document.getElementById('page-cover');
    if (cover) cover.style.display = 'none';
  }, [isOsPage]);

  if (isOsPage) {
    return (
      <main style={{ position: 'relative', width: '100%', height: '100vh' }}>
        <Suspense fallback={null}>
          <RetroOS isZoomedIn fullscreen standalone />
        </Suspense>
      </main>
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

  return <main><Landing /></main>;
};

export default App;
