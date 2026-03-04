import React from 'react';

interface PythonIconProps {
  size?: number;
  color?: string;
}

/**
 * Python IDE Icon — Win95-style beveled frame with the Python logo
 * rendered as two bold interlocking L-shapes (blue top-left, yellow bottom-right).
 */
export const PythonIcon: React.FC<PythonIconProps> = ({
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

    {/* White inner area */}
    <rect x="7" y="7" width="34" height="34" rx="1" fill="#FFFFFF" stroke="#404040" strokeWidth="0.8" />

    {/* ─── Python logo: two interlocking L-shapes ─── */}

    {/* Blue half (top → left bar) */}
    <path
      d="M16 11 H33 Q35 11 35 13 V18 H23 V28 Q23 30 21 30 H16 Q13 30 13 28 V13 Q13 11 16 11 Z"
      fill="#4B8BBE"
      stroke="#306998"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    {/* Blue eye */}
    <rect x="28" y="13" width="3" height="3" rx="1" fill="#306998" />

    {/* Yellow half (bottom → right bar) */}
    <path
      d="M32 37 H16 Q13 37 13 35 V30 H25 V20 Q25 18 27 18 H32 Q35 18 35 20 V35 Q35 37 32 37 Z"
      fill="#FFD43B"
      stroke="#C9A620"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    {/* Yellow eye */}
    <rect x="17" y="33" width="3" height="3" rx="1" fill="#C9A620" />
  </svg>
);
