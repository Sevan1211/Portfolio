import React, { useEffect, useRef } from "react";
import { DesktopProvider } from "./core/DesktopProvider";
import { useDesktopState, useDesktop } from "./core/useDesktop";
import { Desktop } from "./components/Desktop";
import { WindowFrame } from "./components/WindowFrame";
import { Taskbar } from "./components/Taskbar";
import "./styles/index.css";

interface RetroOSProps {
  isZoomedIn: boolean;
  /** Scales the UI for a full-viewport render instead of the CSS3D monitor. */
  fullscreen?: boolean;
  /** The /os route: no 3D scene behind the OS, so exits behave differently. */
  standalone?: boolean;
}

const OSDesktop: React.FC = () => {
  const { windows, activeWindowId, fullscreen } = useDesktopState();
  const { clampWindows } = useDesktop();
  const workspaceRef = useRef<HTMLDivElement>(null);
  const clampWindowsRef = useRef(clampWindows);
  clampWindowsRef.current = clampWindows;

  useEffect(() => {
    const element = workspaceRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          clampWindowsRef.current(width, height);
        }
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`retro-os${fullscreen ? " retro-os--fullscreen" : " retro-os--monitor"}`}
    >
      <div className="retro-os-workspace" ref={workspaceRef}>
        <Desktop />
        {windows.map((desktopWindow) => (
          <WindowFrame
            key={desktopWindow.id}
            windowState={desktopWindow}
            isActive={desktopWindow.id === activeWindowId}
          />
        ))}
      </div>
      <Taskbar />
    </div>
  );
};

const DefaultAppLauncher: React.FC<{ isZoomedIn: boolean }> = ({
  isZoomedIn,
}) => {
  const { openApp } = useDesktop();
  const hasOpenedRef = useRef(false);

  useEffect(() => {
    if (isZoomedIn && !hasOpenedRef.current) {
      openApp("about");
      hasOpenedRef.current = true;
    }
  }, [isZoomedIn, openApp]);

  return null;
};

export const RetroOS: React.FC<RetroOSProps> = React.memo(
  ({ isZoomedIn, fullscreen = false, standalone = false }) => (
    <DesktopProvider fullscreen={fullscreen} standalone={standalone}>
      <DefaultAppLauncher isZoomedIn={isZoomedIn || fullscreen} />
      <OSDesktop />
    </DesktopProvider>
  ),
);

RetroOS.displayName = "RetroOS";
