/**
 * Window Manager Type Definitions
 */

export type AppId = 'about' | 'terminal' | 'pacman' | 'paint' | 'python';

export interface AppDefinition {
  id: AppId;
  title: string;
  icon: React.ComponentType<{ size?: number; color?: string }> | string;
  /** Proportion of viewport width (0–1) for default window width */
  defaultWidthRatio: number;
  /** Proportion of viewport height (0–1) for default window height */
  defaultHeightRatio: number;
  /** Proportion of viewport width (0–1) for default X position */
  defaultXRatio: number;
  /** Proportion of viewport height (0–1) for default Y position */
  defaultYRatio: number;
  minWidth: number;
  minHeight: number;
  component: React.ComponentType | React.LazyExoticComponent<React.ComponentType>;
}

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  previousBounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface DesktopState {
  windows: WindowState[];
  activeWindowId: string | null;
  nextZIndex: number;
  fullscreen: boolean;
}

export type DesktopAction =
  | { type: 'OPEN_APP'; appId: AppId; viewportWidth: number; viewportHeight: number }
  | { type: 'CLOSE_WINDOW'; windowId: string }
  | { type: 'FOCUS_WINDOW'; windowId: string }
  | { type: 'MOVE_WINDOW'; windowId: string; x: number; y: number }
  | { type: 'RESIZE_WINDOW'; windowId: string; width: number; height: number }
  | { type: 'MINIMIZE_WINDOW'; windowId: string }
  | { type: 'TOGGLE_MAXIMIZE_WINDOW'; windowId: string; bounds?: { width: number; height: number } }
  | { type: 'CLAMP_WINDOWS'; boundsWidth: number; boundsHeight: number };

