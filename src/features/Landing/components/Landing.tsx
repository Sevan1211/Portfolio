import React, { Suspense, useEffect } from 'react';
import '../style/landing.css';
import LandingScene from './LandingScene';
import { useIsMobile } from '@shared/hooks/useIsMobile';

// Lazy-load mobile path — desktop users never download this code
const MobileLanding = React.lazy(() =>
  import('../../Mobile/MobileLanding').then(m => ({ default: m.MobileLanding }))
);

const Landing: React.FC = () => {
  const isMobile = useIsMobile();

  // Prevent scrolling on the landing page (3D scene should fill viewport)
  useEffect(() => {
    // Save original overflow values
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    
    // Set overflow hidden for landing page
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    
    // Restore original overflow when component unmounts
    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
    };
  }, []);

  // On mobile, immediately dismiss the page-cover that the desktop loading
  // scene would normally remove. Without this the blue curtain sits at
  // z-index 99999 and hides the entire mobile UI.
  useEffect(() => {
    if (isMobile) {
      const cover = document.getElementById('page-cover');
      if (cover) cover.style.display = 'none';
    }
  }, [isMobile]);

  if (isMobile) {
    return (
      <Suspense fallback={<div style={{ width: '100%', height: '100%', background: '#1e3a8a' }} />}>
        <MobileLanding />
      </Suspense>
    );
  }

  return (
    <div className="landing-page">
      <LandingScene />
    </div>
  );
};

export default Landing;
