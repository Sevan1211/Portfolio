import React from "react";

export type RetroIconKind =
  | "about"
  | "experience"
  | "skills"
  | "projects"
  | "contact"
  | "mail"
  | "resume"
  | "snake"
  | "notes"
  | "settings"
  | "github"
  | "linkedin";

interface RetroAppIconProps {
  kind: RetroIconKind;
}

/**
 * One deliberately small, code-native icon family for the phone. The chunky
 * strokes and simple geometry read like first-generation app artwork without
 * borrowing a real iPhone asset set.
 */
export const RetroAppIcon: React.FC<RetroAppIconProps> = ({ kind }) => (
  <svg
    className={`rp-icon-glyph rp-icon-glyph--${kind}`}
    viewBox="0 0 48 48"
    aria-hidden="true"
    focusable="false"
  >
    {renderGlyph(kind)}
  </svg>
);

function renderGlyph(kind: RetroIconKind): React.ReactNode {
  switch (kind) {
    case "about":
      return (
        <>
          <circle cx="24" cy="16" r="8" />
          <path d="M10 40c1.4-9.3 6.1-14 14-14s12.6 4.7 14 14" />
        </>
      );
    case "experience":
      return (
        <>
          <path d="M17 14v-3.5c0-2 1.5-3.5 3.5-3.5h7c2 0 3.5 1.5 3.5 3.5V14" />
          <rect x="7" y="14" width="34" height="25" rx="3" />
          <path d="M7 24h34M20 22v5h8v-5" />
        </>
      );
    case "skills":
      return (
        <>
          <path d="M8 14h20M8 24h32M8 34h25" />
          <circle cx="33" cy="14" r="4" />
          <circle cx="18" cy="24" r="4" />
          <circle cx="37" cy="34" r="4" />
        </>
      );
    case "projects":
      return (
        <>
          <path d="M6 14h14l4 4h18v20H6z" />
          <path d="M6 19h36" />
          <path d="M18 27h12M18 33h8" />
        </>
      );
    case "contact":
      return (
        <path d="M15 7c2 0 5 8 5 10s-4 3-4 5 8 10 10 10 3-4 5-4 10 3 10 5c0 4-5 6-8 6C19 42 6 29 6 15c0-3 4-8 9-8z" />
      );
    case "mail":
      return (
        <>
          <rect x="5" y="10" width="38" height="28" rx="3" />
          <path d="m7 13 17 14 17-14M7 36l12-13M41 36 29 23" />
        </>
      );
    case "resume":
      return (
        <>
          <path d="M11 5h19l8 8v30H11z" />
          <path d="M30 5v9h8M17 23h15M17 29h15M17 35h11" />
        </>
      );
    case "snake":
      return (
        <>
          <path d="M9 11h19c9 0 9 12 0 12h-9c-9 0-9 13 0 13h20" />
          <circle cx="35" cy="11" r="5" />
          <circle className="rp-icon-eye" cx="36.5" cy="9.5" r="1.2" />
        </>
      );
    case "notes":
      return (
        <>
          <path d="M10 6h28v36H10z" />
          <path d="M16 16h16M16 23h16M16 30h12" />
        </>
      );
    case "settings":
      return (
        <>
          <circle cx="24" cy="24" r="8" />
          <path d="M24 5v7M24 36v7M5 24h7M36 24h7M10.5 10.5l5 5M32.5 32.5l5 5M37.5 10.5l-5 5M15.5 32.5l-5 5" />
        </>
      );
    case "github":
      return (
        <>
          <circle cx="24" cy="24" r="16" />
          <path d="M17 35v-5c-5 1-7-2-8-5M31 35v-6c0-4-2-5-2-5 2-1 4-3 4-7 0-2-1-4-2-5-3-1-5 1-7 1s-4-2-7-1c-1 1-2 3-2 5 0 4 2 6 4 7 0 0-2 1-2 5v6" />
        </>
      );
    case "linkedin":
      return (
        <>
          <rect x="7" y="7" width="34" height="34" rx="3" />
          <circle cx="15" cy="16" r="2" className="rp-icon-fill" />
          <path d="M13 22v12M22 34V22M22 27c1-3 4-5 7-4 3 1 4 3 4 7v4" />
        </>
      );
  }
}
