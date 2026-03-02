import React from 'react';

interface TerminalIconProps {
  size?: number;
  color?: string;
}

/**
 * Terminal Icon — Win95-style MS-DOS Prompt
 * Black screen with C:\> text in a beveled gray window frame.
 */
export const TerminalIcon: React.FC<TerminalIconProps> = ({
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
    <rect x="6" y="8" width="38" height="34" rx="1" fill="#000" opacity="0.18" />

    {/* Monitor outer frame – bevel */}
    <rect x="4" y="6" width="40" height="32" rx="2" fill="#C0C0C0" stroke="#000" strokeWidth="1.5" />
    {/* Top-left bevel highlight */}
    <line x1="5" y1="7" x2="43" y2="7" stroke="#DFDFDF" strokeWidth="1" />
    <line x1="5" y1="7" x2="5" y2="37" stroke="#DFDFDF" strokeWidth="1" />
    {/* Bottom-right bevel shadow */}
    <line x1="5" y1="37" x2="43" y2="37" stroke="#808080" strokeWidth="1" />
    <line x1="43" y1="7" x2="43" y2="37" stroke="#808080" strokeWidth="1" />

    {/* Screen area (inset) */}
    <rect x="8" y="10" width="32" height="24" rx="1" fill="#000010" stroke="#404040" strokeWidth="1" />

    {/* Prompt text "C:\>" */}
    <text
      x="11"
      y="22"
      fontFamily="'Courier New', monospace"
      fontSize="9"
      fontWeight="bold"
      fill="#C0C0C0"
    >
      C:\&gt;
    </text>

    {/* Blinking cursor */}
    <rect x="33" y="16" width="4" height="8" fill="#C0C0C0" opacity="0.9" />

    {/* Monitor stand */}
    <rect x="18" y="38" width="12" height="3" rx="0.5" fill="#A0A0A0" stroke="#000" strokeWidth="0.8" />
    <rect x="14" y="41" width="20" height="2" rx="1" fill="#808080" stroke="#000" strokeWidth="0.8" />
  </svg>
);

