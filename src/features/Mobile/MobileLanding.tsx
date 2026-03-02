import React, { useState, useCallback } from 'react';
import { PhoneBackground } from './components/PhoneBackground';
import { LockScreen } from './components/LockScreen';
import { MobileAboutApp } from './components/MobileAboutApp';
import './styles/mobile.css';

/**
 * MobileLanding
 *
 * State machine:
 *   "locked"   → Lock screen (swipe up to unlock)
 *   "unlocked" → About Me app (auto-opened)
 *
 * The 3D spinning-7 + stars background is always rendered behind both states.
 */
export const MobileLanding: React.FC = () => {
  const [state, setState] = useState<'locked' | 'unlocked'>('locked');

  const handleUnlock = useCallback(() => {
    setState('unlocked');
  }, []);

  return (
    <div className="mobile-landing">
      {/* 3D background — always visible */}
      <PhoneBackground />

      {/* Lock screen */}
      {state === 'locked' && <LockScreen onUnlock={handleUnlock} />}

      {/* About app — slides up when unlocked */}
      <div className={`mobile-app-container ${state === 'unlocked' ? 'mobile-app-container--open' : ''}`}>
        {state === 'unlocked' && <MobileAboutApp />}
      </div>
    </div>
  );
};
