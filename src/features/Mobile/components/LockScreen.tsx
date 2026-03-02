import React, { useRef, useCallback, useEffect, useState } from 'react';

interface LockScreenProps {
  onUnlock: () => void;
}

/**
 * Old-iPhone-style lock screen.
 *  – Large clock & date
 *  – "Swipe up to unlock" prompt with bounce animation
 *  – Touch/mouse swipe-up gesture triggers unlock
 */
export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [time, setTime] = useState(getTime());
  const [dateStr, setDateStr] = useState(getDate());
  const startYRef = useRef<number | null>(null);
  const screenRef = useRef<HTMLDivElement>(null);

  /* ── Clock ── */
  useEffect(() => {
    const id = setInterval(() => {
      setTime(getTime());
      setDateStr(getDate());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  /* ── Swipe detection (touch) ── */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) startYRef.current = touch.clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (startYRef.current === null) return;
      const touch = e.changedTouches[0];
      if (!touch) return;
      const delta = startYRef.current - touch.clientY;
      if (delta > 60) onUnlock(); // swiped up 60 px+
      startYRef.current = null;
    },
    [onUnlock],
  );

  /* ── Fallback: mouse drag for desktop preview (won't appear on desktop, but just in case) ── */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    startYRef.current = e.clientY;
  }, []);

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (startYRef.current === null) return;
      const delta = startYRef.current - e.clientY;
      if (delta > 60) onUnlock();
      startYRef.current = null;
    },
    [onUnlock],
  );

  /* ── Also allow tap/click as a fallback ── */
  const handleClick = useCallback(() => {
    onUnlock();
  }, [onUnlock]);

  return (
    <div
      ref={screenRef}
      className="lock-screen"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* Clock */}
      <div className="lock-clock">
        <div className="lock-time">{time}</div>
        <div className="lock-date">{dateStr}</div>
      </div>

      {/* Swipe prompt */}
      <div className="lock-prompt" onClick={handleClick}>
        <div className="lock-chevron">
          <ChevronUp />
        </div>
        <span>swipe up to unlock</span>
      </div>
    </div>
  );
};

/* ── Helpers ── */
function getTime(): string {
  const now = new Date();
  return now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function getDate(): string {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

const ChevronUp: React.FC = () => (
  <svg width="24" height="14" viewBox="0 0 24 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 12 12 4 20 12" />
  </svg>
);
