/**
 * RetroIcons — Win95-style monochrome SVG icons
 *
 * Simple, pixel-ish, low-detail icons that match the retro OS aesthetic.
 * All icons accept `size` (default 18) and `className` props.
 */
import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

/* ── About / Person ────────────────── */
export const RetroUser: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <circle cx="8" cy="4" r="3" />
    <path d="M2 14 Q2 9 8 9 Q14 9 14 14 Z" />
  </svg>
);

/* ── Code / Angle brackets ─────────── */
export const RetroCode: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="5,2 1,8 5,14" />
    <polyline points="11,2 15,8 11,14" />
    <line x1="9" y1="1" x2="7" y2="15" />
  </svg>
);

/* ── Layers / Stack ────────────────── */
export const RetroLayers: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
    <polygon points="8,1 15,5 8,9 1,5" />
    <polyline points="1,8 8,12 15,8" />
    <polyline points="1,11 8,15 15,11" />
  </svg>
);

/* ── Brain / Gear ──────────────────── */
export const RetroGear: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <path d="M7 0h2v2.1a5.5 5.5 0 011.8.7L12.2 1.4l1.4 1.4-1.4 1.4a5.5 5.5 0 01.7 1.8H15v2h-2.1a5.5 5.5 0 01-.7 1.8l1.4 1.4-1.4 1.4-1.4-1.4a5.5 5.5 0 01-1.8.7V15H7v-2.1a5.5 5.5 0 01-1.8-.7L3.8 13.6 2.4 12.2l1.4-1.4A5.5 5.5 0 013.1 9H1V7h2.1a5.5 5.5 0 01.7-1.8L2.4 3.8 3.8 2.4l1.4 1.4A5.5 5.5 0 017 3.1V0zM8 5.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" />
  </svg>
);

/* ── Award / Star badge ────────────── */
export const RetroAward: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <polygon points="8,0 10,5.5 16,6 11.5,10 13,16 8,12.5 3,16 4.5,10 0,6 6,5.5" />
  </svg>
);

/* ── Building / Office ─────────────── */
export const RetroBuilding: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <rect x="2" y="1" width="12" height="15" rx="0.5" />
    <rect x="4" y="3" width="2" height="2" fill="#c0c0c0" rx="0.2" />
    <rect x="7" y="3" width="2" height="2" fill="#c0c0c0" rx="0.2" />
    <rect x="10" y="3" width="2" height="2" fill="#c0c0c0" rx="0.2" />
    <rect x="4" y="7" width="2" height="2" fill="#c0c0c0" rx="0.2" />
    <rect x="7" y="7" width="2" height="2" fill="#c0c0c0" rx="0.2" />
    <rect x="10" y="7" width="2" height="2" fill="#c0c0c0" rx="0.2" />
    <rect x="6" y="11" width="4" height="5" fill="#c0c0c0" rx="0.2" />
  </svg>
);

/* ── Calendar ──────────────────────── */
export const RetroCalendar: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <rect x="1" y="3" width="14" height="12" rx="1" />
    <rect x="1" y="3" width="14" height="4" rx="1" />
    <rect x="4" y="1" width="1.5" height="3" rx="0.5" />
    <rect x="10.5" y="1" width="1.5" height="3" rx="0.5" />
    <rect x="3" y="9" width="2" height="1.5" fill="#c0c0c0" />
    <rect x="7" y="9" width="2" height="1.5" fill="#c0c0c0" />
    <rect x="11" y="9" width="2" height="1.5" fill="#c0c0c0" />
    <rect x="3" y="12" width="2" height="1.5" fill="#c0c0c0" />
    <rect x="7" y="12" width="2" height="1.5" fill="#c0c0c0" />
  </svg>
);

/* ── Map pin ───────────────────────── */
export const RetroPin: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 0C5 0 3 2.5 3 5.5 3 9.5 8 16 8 16s5-6.5 5-10.5C13 2.5 11 0 8 0z" />
    <circle cx="8" cy="5.5" r="2" fill="#c0c0c0" />
  </svg>
);

/* ── Mail / Envelope ───────────────── */
export const RetroMail: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <rect x="1" y="3" width="14" height="10" rx="1" />
    <path d="M1 3 L8 9 L15 3" fill="none" stroke="#c0c0c0" strokeWidth="1.5" />
  </svg>
);

/* ── Globe ─────────────────────────── */
export const RetroGlobe: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
    <circle cx="8" cy="8" r="7" />
    <ellipse cx="8" cy="8" rx="3" ry="7" />
    <line x1="1" y1="8" x2="15" y2="8" />
    <line x1="3" y1="4" x2="13" y2="4" />
    <line x1="3" y1="12" x2="13" y2="12" />
  </svg>
);

/* ── Briefcase / Projects ──────────── */
export const RetroBriefcase: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <rect x="1" y="5" width="14" height="10" rx="1" />
    <path d="M5 5V3a1 1 0 011-1h4a1 1 0 011 1v2" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <rect x="1" y="8" width="14" height="2" opacity="0.3" />
  </svg>
);

/* ── Keyboard ──────────────────────── */
export const RetroKeyboard: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <rect x="0" y="3" width="16" height="10" rx="1" />
    <rect x="2" y="5" width="2" height="1.5" fill="#c0c0c0" rx="0.2" />
    <rect x="5" y="5" width="2" height="1.5" fill="#c0c0c0" rx="0.2" />
    <rect x="8" y="5" width="2" height="1.5" fill="#c0c0c0" rx="0.2" />
    <rect x="11" y="5" width="3" height="1.5" fill="#c0c0c0" rx="0.2" />
    <rect x="2" y="7.5" width="2" height="1.5" fill="#c0c0c0" rx="0.2" />
    <rect x="5" y="7.5" width="2" height="1.5" fill="#c0c0c0" rx="0.2" />
    <rect x="8" y="7.5" width="2" height="1.5" fill="#c0c0c0" rx="0.2" />
    <rect x="11" y="7.5" width="3" height="1.5" fill="#c0c0c0" rx="0.2" />
    <rect x="4" y="10" width="8" height="1.5" fill="#c0c0c0" rx="0.2" />
  </svg>
);

/* ── Sparkle / Star small ──────────── */
export const RetroSparkle: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <polygon points="8,0 9.5,6 16,8 9.5,10 8,16 6.5,10 0,8 6.5,6" />
  </svg>
);

/* ═══════════════════════════════════════
   Paint toolbar icons – monochrome
   ═══════════════════════════════════════ */

export const RetroPencil: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <path d="M12.5.5l3 3L5 14H2v-3L12.5.5z" />
    <line x1="10" y1="3" x2="13" y2="6" stroke="#c0c0c0" strokeWidth="0.8" />
  </svg>
);

export const RetroBrush: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <rect x="6" y="0" width="4" height="8" rx="1" />
    <rect x="5.5" y="7" width="5" height="2" rx="0.3" opacity="0.6" />
    <path d="M5 9 Q4 13 5 16 H11 Q12 13 11 9 Z" />
  </svg>
);

export const RetroEraser: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <path d="M4 14 L0 10 L9 1 L15 7 L8 14 Z" />
    <path d="M4 14 L0 10 L4.5 5.5 L10.5 11.5 L8 14 Z" opacity="0.5" />
    <line x1="3" y1="15.5" x2="14" y2="15.5" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

export const RetroLine: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="2" y1="14" x2="14" y2="2" />
  </svg>
);

export const RetroRect: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="1" y="3" width="14" height="10" />
  </svg>
);

export const RetroEllipse: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <ellipse cx="8" cy="8" rx="7" ry="5" />
  </svg>
);

export const RetroFill: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <path d="M3 9 L7 1 L11 9 Z" />
    <path d="M2 10 Q2 15 7 15 Q12 15 12 10 Z" opacity="0.7" />
    <line x1="7" y1="1" x2="7" y2="9" stroke="currentColor" strokeWidth="0.8" />
  </svg>
);

export const RetroPicker: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <path d="M13 0 L15 2 L8 9 L6 10 L7 8 Z" />
    <path d="M5 11 L3 16 L4 12 Z" opacity="0.6" />
    <circle cx="14" cy="1" r="1.5" fill="none" stroke="currentColor" strokeWidth="0.8" />
  </svg>
);

/* GitHub octocat-style icon */
export const RetroGitHub: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
      0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
      -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66
      .07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15
      -.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27
      .68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12
      .51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48
      0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

/* LinkedIn "in" logo icon */
export const RetroLinkedIn: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <rect x="0" y="0" width="16" height="16" rx="2" />
    <rect x="2" y="6" width="2.5" height="8" fill="#e6e6ea" />
    <circle cx="3.25" cy="3.5" r="1.5" fill="#e6e6ea" />
    <path d="M6.5 6h2.4v1.1h.03c.33-.63 1.15-1.3 2.37-1.3 2.53 0 3 1.67 3 3.83V14h-2.5v-3.86
      c0-.92-.02-2.1-1.28-2.1-1.28 0-1.48 1-1.48 2.04V14H6.5V6z" fill="#e6e6ea" />
  </svg>
);

/* Document / file icon for resume download */
export const RetroDocument: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <path d="M3 0 h7 l4 4 v11 a1 1 0 01-1 1 H3 a1 1 0 01-1-1 V1 a1 1 0 011-1z" />
    <path d="M10 0 v4 h4" fill="#808080" />
    <rect x="4" y="6" width="8" height="1" fill="#e6e6ea" />
    <rect x="4" y="8.5" width="6" height="1" fill="#e6e6ea" />
    <rect x="4" y="11" width="7" height="1" fill="#e6e6ea" />
  </svg>
);
