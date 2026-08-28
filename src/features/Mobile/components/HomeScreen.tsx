import React, { useEffect, useRef } from "react";
import { CONTACT } from "@shared/content/portfolio";
import { RetroAppIcon, type RetroIconKind } from "./RetroAppIcon";

export type AppId =
  | "about"
  | "experience"
  | "skills"
  | "projects"
  | "contact"
  | "resume"
  | "snake"
  | "notes"
  | "settings";

interface AppDef {
  id: AppId;
  label: string;
  icon: RetroIconKind;
  gradient: string;
}

interface LinkDef {
  label: string;
  icon: RetroIconKind;
  gradient: string;
  href: string;
  external?: boolean;
}

const GRID_APPS: (AppDef | LinkDef)[] = [
  {
    id: "about",
    label: "About",
    icon: "about",
    gradient: "linear-gradient(180deg, #5d8ff2, #2c5cce)",
  },
  {
    id: "experience",
    label: "Experience",
    icon: "experience",
    gradient: "linear-gradient(180deg, #cf9a4e, #8a5a23)",
  },
  {
    id: "skills",
    label: "Skills",
    icon: "skills",
    gradient: "linear-gradient(180deg, #45b8ac, #24776f)",
  },
  {
    label: "GitHub",
    icon: "github",
    gradient: "linear-gradient(180deg, #596079, #23262f)",
    href: CONTACT.github,
    external: true,
  },
  {
    label: "LinkedIn",
    icon: "linkedin",
    gradient: "linear-gradient(180deg, #4fa8ea, #1b6cb4)",
    href: CONTACT.linkedin,
    external: true,
  },
  {
    id: "notes",
    label: "Notes",
    icon: "notes",
    gradient: "linear-gradient(180deg, #f7d861, #d9a940)",
  },
  {
    id: "snake",
    label: "Snake",
    icon: "snake",
    gradient: "linear-gradient(180deg, #7bd95c, #3d9422)",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "settings",
    gradient: "linear-gradient(180deg, #b3bcc9, #6e7889)",
  },
];

const DOCK_APPS: (AppDef | LinkDef)[] = [
  {
    id: "contact",
    label: "Contact",
    icon: "contact",
    gradient: "linear-gradient(180deg, #7ade6a, #2f9e20)",
  },
  {
    label: "Mail",
    icon: "mail",
    gradient: "linear-gradient(180deg, #6fb6f5, #2470c8)",
    href: `mailto:${CONTACT.email}`,
  },
  {
    id: "resume",
    label: "Resume",
    icon: "resume",
    gradient: "linear-gradient(180deg, #f4f5f7, #c9cdd6)",
  },
  {
    id: "projects",
    label: "Projects",
    icon: "projects",
    gradient: "linear-gradient(180deg, #9d7df2, #6244c6)",
  },
];

interface HomeScreenProps {
  onOpen: (
    id: AppId,
    origin: { x: number; y: number },
    trigger: HTMLButtonElement,
  ) => void;
  /** Status bar element, rendered at the top of the springboard. */
  statusBar?: React.ReactNode;
  active: boolean;
}

/**
 * The springboard. Solid black, glossy icons, and a metal dock shelf that
 * anchors the four primary actions. External links (GitHub, LinkedIn, and
 * Mail) are icons too; everything on this phone is an app.
 */
export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpen,
  statusBar,
  active,
}) => {
  const homeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const home = homeRef.current;
    if (!home) return;
    if (active) home.removeAttribute("inert");
    else home.setAttribute("inert", "");
  }, [active]);

  return (
    <div
      ref={homeRef}
      className={active ? "rp-home" : "rp-home rp-home--inactive"}
      aria-label="Home screen"
      aria-hidden={!active}
    >
      {statusBar}
      <main className="rp-grid" aria-label="Apps">
        {GRID_APPS.map((app) => (
          <SpringboardIcon key={app.label} app={app} onOpen={onOpen} />
        ))}
      </main>
      <nav className="rp-dock" aria-label="Dock">
        {DOCK_APPS.map((app) => (
          <SpringboardIcon key={app.label} app={app} onOpen={onOpen} />
        ))}
      </nav>
    </div>
  );
};

const SpringboardIcon: React.FC<{
  app: AppDef | LinkDef;
  onOpen: HomeScreenProps["onOpen"];
}> = ({ app, onOpen }) => {
  const face = (
    <span className="rp-icon" style={{ background: app.gradient }}>
      <RetroAppIcon kind={app.icon} />
    </span>
  );

  const inner = (
    <>
      {face}
      <span className="rp-applabel">{app.label}</span>
    </>
  );

  if ("href" in app) {
    return (
      <a
        className="rp-app"
        href={app.href}
        target={app.external ? "_blank" : undefined}
        rel={app.external ? "noopener noreferrer" : undefined}
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      type="button"
      className="rp-app"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        onOpen(
          app.id,
          { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
          e.currentTarget,
        );
      }}
    >
      {inner}
    </button>
  );
};
