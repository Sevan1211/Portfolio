import React, { useEffect } from 'react';
import Landing from '@features/Landing/components/Landing';
import { NotFound } from '@features/NotFound/NotFound';

const App: React.FC = () => {
  const path = window.location.pathname;
  const is404 = path !== '/' && path !== '/index.html';

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

  if (is404) return <NotFound />;

  return <Landing />;
};

export default App;
