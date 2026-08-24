import React from 'react';

interface ResumeIconProps {
  size?: number;
  color?: string;
}

/**
 * Resume Icon - a document with a folded corner and an Adobe-red PDF tab.
 */
export const ResumeIcon: React.FC<ResumeIconProps> = ({
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
    <path d="M12 6 H32 L40 14 V44 H12 Z" fill="#000" opacity="0.18" />

    {/* Page */}
    <path
      d="M10 4 H30 L38 12 V42 H10 Z"
      fill="#FFFFFF"
      stroke="#000"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Folded corner */}
    <path
      d="M30 4 L38 12 H30 Z"
      fill="#D0D0D8"
      stroke="#000"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />

    {/* Text lines */}
    <line x1="14" y1="18" x2="30" y2="18" stroke="#5A5A6A" strokeWidth="1.6" />
    <line x1="14" y1="22" x2="34" y2="22" stroke="#9A9AA8" strokeWidth="1.4" />
    <line x1="14" y1="26" x2="34" y2="26" stroke="#9A9AA8" strokeWidth="1.4" />
    <line x1="14" y1="30" x2="26" y2="30" stroke="#9A9AA8" strokeWidth="1.4" />

    {/* PDF tab */}
    <rect x="12" y="33" width="21" height="9" rx="1" fill="#C8202A" stroke="#000" strokeWidth="1" />
    <text
      x="22.5"
      y="40"
      textAnchor="middle"
      fontFamily="'MS Sans Serif', 'Segoe UI', sans-serif"
      fontSize="7"
      fontWeight="bold"
      fill="#FFFFFF"
    >
      PDF
    </text>
  </svg>
);
