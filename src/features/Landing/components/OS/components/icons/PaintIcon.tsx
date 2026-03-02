import React from 'react';

interface PaintIconProps {
  size?: number;
  color?: string;
}

/**
 * Paint Icon — Win95-style MS Paint
 * Palette with brush, beveled frame to match the icon set.
 */
export const PaintIcon: React.FC<PaintIconProps> = ({
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

    {/* Canvas/paper background */}
    <rect x="7" y="7" width="34" height="34" rx="1" fill="#FFFFFF" stroke="#404040" strokeWidth="0.8" />

    {/* Paint palette */}
    <ellipse cx="21" cy="28" rx="12" ry="10" fill="#F0E0B0" stroke="#000" strokeWidth="1" />
    {/* Thumb hole */}
    <ellipse cx="17" cy="32" rx="3" ry="2.5" fill="#C0C0C0" stroke="#808080" strokeWidth="0.6" />
    {/* Paint blobs on palette */}
    <circle cx="16" cy="22" r="3" fill="#FF0000" stroke="#800000" strokeWidth="0.5" />
    <circle cx="22" cy="20" r="2.5" fill="#FFD800" stroke="#808000" strokeWidth="0.5" />
    <circle cx="28" cy="22" r="2.5" fill="#0000FF" stroke="#000080" strokeWidth="0.5" />
    <circle cx="30" cy="28" r="2.2" fill="#00A000" stroke="#005000" strokeWidth="0.5" />

    {/* Paintbrush */}
    {/* Handle */}
    <rect
      x="30"
      y="6"
      width="4"
      height="18"
      rx="1.5"
      fill="#B08040"
      stroke="#000"
      strokeWidth="0.8"
      transform="rotate(25 32 15)"
    />
    {/* Ferrule (metal band) */}
    <rect
      x="30"
      y="22"
      width="4.5"
      height="4"
      rx="0.5"
      fill="#A0A0A0"
      stroke="#606060"
      strokeWidth="0.5"
      transform="rotate(25 32 24)"
    />
    {/* Bristles */}
    <path
      d="M28 28 Q30 32 28 35 Q32 33 34 35 Q32 31 34 28 Z"
      fill="#E04040"
      stroke="#800000"
      strokeWidth="0.5"
    />
  </svg>
);
