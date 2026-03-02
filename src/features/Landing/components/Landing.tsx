import React, { useEffect } from 'react';
import '../style/landing.css';
import LandingScene from './LandingScene';
import { MobileLanding } from '../../Mobile/MobileLanding';
import { useIsMobile } from '@shared/hooks/useIsMobile';

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
    return <MobileLanding />;
  }

  return (
    <div className="landing-page">
      <LandingScene />
    </div>
  );
};

export default Landing;
