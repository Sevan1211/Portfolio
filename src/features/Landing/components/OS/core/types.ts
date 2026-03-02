/**
 * Window Manager Type Definitions
 */

export type AppId = 'about' | 'terminal' | 'pacman' | 'paint';

export interface AppDefinition {
  id: AppId;
  title: string;
  icon: React.ComponentType<{ size?: number; color?: string }> | string;
  defaultWidth: number;
  defaultHeight: number;
  defaultX: number;
  defaultY: number;
  minWidth: number;
  minHeight: number;
  component: React.ComponentType;
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
  | { type: 'OPEN_APP'; appId: AppId }
  | { type: 'CLOSE_WINDOW'; windowId: string }
  | { type: 'FOCUS_WINDOW'; windowId: string }
  | { type: 'MOVE_WINDOW'; windowId: string; x: number; y: number }
  | { type: 'RESIZE_WINDOW'; windowId: string; width: number; height: number }
  | { type: 'MINIMIZE_WINDOW'; windowId: string }
  | { type: 'TOGGLE_MAXIMIZE_WINDOW'; windowId: string; bounds?: { width: number; height: number } };

