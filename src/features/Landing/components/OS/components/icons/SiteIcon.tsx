import React from 'react';

interface SiteIconProps {
  size?: number;
  color?: string;
}

/**
 * About This Site Icon - a wireframe cube over a beveled help card.
 */
export const SiteIcon: React.FC<SiteIconProps> = ({
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
    <rect x="7" y="8" width="35" height="34" rx="1" fill="#000" opacity="0.18" />

    {/* Card */}
    <rect x="5" y="6" width="36" height="34" rx="1.5" fill="#DCDCE8" stroke="#000" strokeWidth="1.5" />
    <line x1="6" y1="7" x2="40" y2="7" stroke="#FFF" strokeWidth="1" />
    <line x1="6" y1="7" x2="6" y2="39" stroke="#FFF" strokeWidth="1" />
    <line x1="6" y1="39" x2="40" y2="39" stroke="#8A8A98" strokeWidth="1" />
    <line x1="40" y1="7" x2="40" y2="39" stroke="#8A8A98" strokeWidth="1" />

    {/* Title bar */}
    <rect x="7" y="8" width="32" height="6" fill="#000080" />

    {/* Wireframe cube */}
    <g stroke="#1A1A6A" strokeWidth="1.4" strokeLinejoin="round" fill="none">
      <path d="M23 18 L32 22 L32 31 L23 35 L14 31 L14 22 Z" fill="#AFC4F0" fillOpacity="0.55" />
      <path d="M14 22 L23 26 L32 22" />
      <path d="M23 26 L23 35" />
    </g>
  </svg>
);
