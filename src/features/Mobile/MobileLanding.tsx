import React, { useCallback, useEffect, useRef, useState } from "react";
import { LockScreen } from "./components/LockScreen";
import { HomeScreen, type AppId } from "./components/HomeScreen";
import { AppShell } from "./components/AppShell";
import { StatusBar } from "./components/StatusBar";
import { AboutApp } from "./components/apps/AboutApp";
import { ExperienceApp } from "./components/apps/WorkApp";
import { SkillsApp } from "./components/apps/SkillsApp";
import { ProjectsApp } from "./components/apps/ProjectsApp";
import { ContactApp } from "./components/apps/ContactApp";
import { ResumeApp } from "./components/apps/ResumeApp";
import { SnakeApp } from "./components/apps/SnakeApp";
import { NotesApp } from "./components/apps/NotesApp";
import { SettingsApp } from "./components/apps/SettingsApp";
import "./styles/mobile.css";

type Phase = "locked" | "unlocking" | "home";

interface MobilePreferences {
  reduceMotion: boolean;
  simplifiedGraphics: boolean;
  highContrast: boolean;
}

const APP_TITLES: Record<AppId, string> = {
  about: "About Me",
  experience: "Experience",
  skills: "Skills",
  projects: "Projects",
  contact: "Contact",
  resume: "Resume",
  snake: "Snake",
  notes: "Notes",
  settings: "Settings",
};

const APP_IDS = new Set<AppId>(Object.keys(APP_TITLES) as AppId[]);
const DARK_APPS: ReadonlySet<AppId> = new Set(["snake"]);
const UNLOCKED_KEY = "portfolio-mobile-unlocked-v1";
const PREFERENCES_KEY = "portfolio-mobile-preferences-v1";
const HISTORY_MARKER = "portfolioAppFromHome";
const BATTERY_START = 93;
const BATTERY_FLOOR = 7;
const BATTERY_TICK_MS = 40000;
const UNLOCK_MS = 520;

export const MobileLanding: React.FC = () => {
  const systemReduceMotion = useSystemReducedMotion();
  const initialAppRef = useRef<AppId | null>(getAppFromUrl());
  const skipInitialAppAnimation = useRef(initialAppRef.current !== null);
  const [preferences, setPreferences] =
    useState<MobilePreferences>(readPreferences);
  const reduceMotion = systemReduceMotion || preferences.reduceMotion;
  const [phase, setPhase] = useState<Phase>(() =>
    hasSessionUnlock() || initialAppRef.current ? "home" : "locked",
  );
  const [openApp, setOpenApp] = useState<AppId | null>(initialAppRef.current);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [battery, setBattery] = useState(BATTERY_START);

  const unlockTimer = useRef<number | null>(null);
  const focusTimer = useRef<number | null>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);

  // Keep the branded HTML cover visible until this lazy route has actually
  // mounted. It avoids a blank-blue interval and gives the first paint a real
  // DOM content candidate before the interactive phone takes over.
  useEffect(() => {
    const cover = document.getElementById("page-cover");
    if (!cover) return;
    cover.style.opacity = "0";
    const id = window.setTimeout(() => {
      cover.style.display = "none";
    }, 460);
    return () => {
      window.clearTimeout(id);
      cover.style.display = "none";
    };
  }, []);

  useEffect(() => {
    if (initialAppRef.current) rememberSessionUnlock();
    skipInitialAppAnimation.current = false;
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    } catch {
      // Storage can be unavailable in strict privacy modes; settings still work for this visit.
    }
  }, [preferences]);

  /* The battery gag drains while the phone is open and bottoms out at 7%. */
  useEffect(() => {
    const id = window.setInterval(() => {
      setBattery((current) => Math.max(BATTERY_FLOOR, current - 1));
    }, BATTERY_TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  const restoreHomeFocus = useCallback(() => {
    if (focusTimer.current !== null) window.clearTimeout(focusTimer.current);
    focusTimer.current = window.setTimeout(
      () => {
        lastTrigger.current?.focus();
      },
      reduceMotion ? 0 : 360,
    );
  }, [reduceMotion]);

  useEffect(() => {
    const handlePopState = () => {
      const app = getAppFromUrl();
      setPhase("home");
      setOpenApp(app);
      if (!app) restoreHomeFocus();
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [restoreHomeFocus]);

  useEffect(
    () => () => {
      if (unlockTimer.current !== null)
        window.clearTimeout(unlockTimer.current);
      if (focusTimer.current !== null) window.clearTimeout(focusTimer.current);
    },
    [],
  );

  const handleUnlock = useCallback(
    (target?: AppId) => {
      rememberSessionUnlock();
      setPhase((current) => (current === "locked" ? "unlocking" : current));
      if (unlockTimer.current !== null)
        window.clearTimeout(unlockTimer.current);
      unlockTimer.current = window.setTimeout(
        () => {
          setPhase("home");
          if (target) {
            setOrigin({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
            setOpenApp(target);
            writeAppToUrl(target, "replace");
          }
        },
        reduceMotion ? 90 : UNLOCK_MS,
      );
    },
    [reduceMotion],
  );

  const handleOpen = useCallback(
    (
      id: AppId,
      iconCenter: { x: number; y: number },
      trigger: HTMLButtonElement,
    ) => {
      lastTrigger.current = trigger;
      setOrigin(iconCenter);
      setOpenApp(id);
      writeAppToUrl(id, "push");
    },
    [],
  );

  const handleHome = useCallback(() => {
    if (hasHomeHistoryMarker()) {
      window.history.back();
      return;
    }
    writeAppToUrl(null, "replace");
    setOpenApp(null);
    restoreHomeFocus();
  }, [restoreHomeFocus]);

  const handleOpenFromApp = useCallback((id: AppId) => {
    setOrigin({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    setOpenApp(id);
    writeAppToUrl(id, "replace");
  }, []);

  const updatePreference = useCallback((key: keyof MobilePreferences) => {
    setPreferences((current) => ({ ...current, [key]: !current[key] }));
  }, []);

  const statusBar = <StatusBar battery={battery} />;
  const rootClasses = [
    "mobile-landing",
    reduceMotion && "rp-reduce-motion",
    preferences.simplifiedGraphics && "rp-simple-graphics",
    preferences.highContrast && "rp-high-contrast",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClasses}>
      <HomeScreen
        onOpen={handleOpen}
        statusBar={statusBar}
        active={phase === "home" && openApp === null}
      />

      {openApp && (
        <div
          key={openApp}
          className={
            skipInitialAppAnimation.current
              ? "rp-app-motion-layer rp-app-motion-layer--instant"
              : "rp-app-motion-layer"
          }
          style={{ transformOrigin: `${origin.x}px ${origin.y}px` }}
        >
          <AppShell
            title={APP_TITLES[openApp]}
            onHome={handleHome}
            battery={battery}
            dark={DARK_APPS.has(openApp)}
          >
            {renderApp(openApp, handleOpenFromApp, {
              reduceMotion,
              systemReduceMotion,
              simplifiedGraphics: preferences.simplifiedGraphics,
              highContrast: preferences.highContrast,
              onToggleReduceMotion: () => updatePreference("reduceMotion"),
              onToggleSimplifiedGraphics: () =>
                updatePreference("simplifiedGraphics"),
              onToggleHighContrast: () => updatePreference("highContrast"),
            })}
          </AppShell>
        </div>
      )}

      {phase !== "home" && (
        <div
          className={`rp-lock-layer ${phase === "unlocking" ? "rp-lock-layer--away" : ""}`}
        >
          <SimplePhoneBackground />
          <LockScreen onUnlock={handleUnlock} statusBar={statusBar} />
        </div>
      )}
    </div>
  );
};

const SimplePhoneBackground: React.FC = () => (
  <div className="mobile-bg mobile-bg--simple" aria-hidden="true">
    <span>7</span>
  </div>
);

interface SettingsHandlers {
  reduceMotion: boolean;
  systemReduceMotion: boolean;
  simplifiedGraphics: boolean;
  highContrast: boolean;
  onToggleReduceMotion: () => void;
  onToggleSimplifiedGraphics: () => void;
  onToggleHighContrast: () => void;
}

function renderApp(
  id: AppId,
  onOpenApp: (id: AppId) => void,
  settings: SettingsHandlers,
): React.ReactNode {
  switch (id) {
    case "about":
      return <AboutApp onOpenApp={onOpenApp} />;
    case "experience":
      return <ExperienceApp />;
    case "skills":
      return <SkillsApp />;
    case "projects":
      return <ProjectsApp />;
    case "contact":
      return <ContactApp onOpenApp={onOpenApp} />;
    case "resume":
      return <ResumeApp />;
    case "snake":
      return <SnakeApp />;
    case "notes":
      return <NotesApp />;
    case "settings":
      return <SettingsApp {...settings} />;
  }
}

function getAppFromUrl(): AppId | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("app");
  return value && APP_IDS.has(value as AppId) ? (value as AppId) : null;
}

function writeAppToUrl(app: AppId | null, mode: "push" | "replace"): void {
  const url = new URL(window.location.href);
  if (app) url.searchParams.set("app", app);
  else url.searchParams.delete("app");

  const currentState =
    window.history.state && typeof window.history.state === "object"
      ? window.history.state
      : {};
  const state =
    mode === "push"
      ? { ...currentState, [HISTORY_MARKER]: true }
      : currentState;

  if (mode === "push") window.history.pushState(state, "", url);
  else window.history.replaceState(state, "", url);
}

function hasHomeHistoryMarker(): boolean {
  return Boolean(
    window.history.state &&
    typeof window.history.state === "object" &&
    window.history.state[HISTORY_MARKER],
  );
}

function hasSessionUnlock(): boolean {
  try {
    return window.sessionStorage.getItem(UNLOCKED_KEY) === "true";
  } catch {
    return false;
  }
}

function rememberSessionUnlock(): void {
  try {
    window.sessionStorage.setItem(UNLOCKED_KEY, "true");
  } catch {
    // A locked-down browser may reject storage. The current visit still unlocks.
  }
}

function readPreferences(): MobilePreferences {
  const defaults: MobilePreferences = {
    reduceMotion: false,
    simplifiedGraphics: false,
    highContrast: false,
  };
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(PREFERENCES_KEY) ?? "{}",
    ) as Partial<MobilePreferences>;
    return {
      reduceMotion: parsed.reduceMotion === true,
      simplifiedGraphics: parsed.simplifiedGraphics === true,
      highContrast: parsed.highContrast === true,
    };
  } catch {
    return defaults;
  }
}

function useSystemReducedMotion(): boolean {
  const query = "(prefers-reduced-motion: reduce)";
  const [matches, setMatches] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(query).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return matches;
}
