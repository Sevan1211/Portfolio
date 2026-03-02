import React from 'react';

interface AboutMeIconProps {
  size?: number;
  color?: string;
}

/**
 * About Me Icon — Win95-style "My Profile" folder/document
 * Matches the retro desktop icon aesthetic.
 */
export const AboutMeIcon: React.FC<AboutMeIconProps> = ({
  size = 48,
  color: _color = '#ffffff',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    {/* Shadow */}
    <rect x="6" y="10" width="36" height="32" rx="1" fill="#000" opacity="0.18" />

    {/* Folder back */}
    <path
      d="M4 12 H18 L22 8 H42 V38 H4 Z"
      fill="#C09030"
      stroke="#000"
      strokeWidth="1.5"
    />
    {/* Folder front face */}
    <path
      d="M4 16 H42 V38 H4 Z"
      fill="#FFC860"
      stroke="#000"
      strokeWidth="1.5"
    />
    {/* Bevel highlight top */}
    <line x1="5" y1="17" x2="41" y2="17" stroke="#FFE8A0" strokeWidth="1" />
    {/* Bevel shadow bottom */}
    <line x1="5" y1="37" x2="41" y2="37" stroke="#A07020" strokeWidth="1" />

    {/* Person silhouette */}
    {/* Head */}
    <circle cx="23" cy="22" r="4" fill="#2060C0" stroke="#000" strokeWidth="1" />
    {/* Body */}
    <path
      d="M15 35 Q15 28 23 28 Q31 28 31 35"
      fill="#2060C0"
      stroke="#000"
      strokeWidth="1"
    />
    {/* Tie / accent */}
    <path d="M23 28 L21 33 L23 31 L25 33 Z" fill="#E04040" />
  </svg>
);
