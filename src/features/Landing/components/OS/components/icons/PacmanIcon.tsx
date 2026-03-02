import React from 'react';

interface PacmanIconProps {
  size?: number;
  color?: string;
}

/**
 * Pac-Man Icon — Win95-style game icon
 * Pac-Man character on a dark arcade-blue tile with beveled frame.
 */
export const PacmanIcon: React.FC<PacmanIconProps> = ({
  size = 48,
  color: _color = '#ffffff',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Shadow */}
    <rect x="6" y="8" width="38" height="36" rx="1" fill="#000" opacity="0.18" />

    {/* Outer bevel frame */}
    <rect x="4" y="4" width="40" height="40" rx="3" fill="#C0C0C0" stroke="#000" strokeWidth="1.5" />
    {/* Top-left bevel highlight */}
    <line x1="5" y1="5" x2="43" y2="5" stroke="#DFDFDF" strokeWidth="1" />
    <line x1="5" y1="5" x2="5" y2="43" stroke="#DFDFDF" strokeWidth="1" />
    {/* Bottom-right bevel shadow */}
    <line x1="5" y1="43" x2="43" y2="43" stroke="#808080" strokeWidth="1" />
    <line x1="43" y1="5" x2="43" y2="43" stroke="#808080" strokeWidth="1" />

    {/* Dark arcade background */}
    <rect x="7" y="7" width="34" height="34" rx="1" fill="#10104E" stroke="#404040" strokeWidth="0.8" />

    {/* Pac-Man body */}
    <path
      d="M24 13 A11 11 0 1 1 24 35 A11 11 0 1 1 24 13 Z"
      fill="#FFD800"
    />
    {/* Mouth cutout */}
    <path
      d="M24 24 L37 18 L37 30 Z"
      fill="#10104E"
    />
    {/* Eye */}
    <circle cx="25" cy="18" r="2" fill="#10104E" />

    {/* Pellet dots */}
    <circle cx="38" cy="24" r="1.5" fill="#FFB8A0" opacity="0.8" />
    <circle cx="12" cy="12" r="1.2" fill="#FFB8A0" opacity="0.5" />
    <circle cx="12" cy="36" r="1.2" fill="#FFB8A0" opacity="0.5" />

    {/* Ghost (small accent in corner) */}
    <path
      d="M10 29 Q10 24 14 24 Q18 24 18 29 L17 28 L15.5 29 L14 28 L12.5 29 L11 28 Z"
      fill="#FF4040"
      opacity="0.85"
    />
    <circle cx="12.5" cy="26" r="1" fill="#FFF" />
    <circle cx="15.5" cy="26" r="1" fill="#FFF" />
    <circle cx="13" cy="26.3" r="0.5" fill="#2020A0" />
    <circle cx="16" cy="26.3" r="0.5" fill="#2020A0" />
  </svg>
);
