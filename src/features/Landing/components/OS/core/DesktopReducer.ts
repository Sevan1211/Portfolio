import { createContext } from 'react';
import { DesktopState, DesktopAction, WindowState } from './types';
import { MONITOR_WIDTH, DESKTOP_WORKSPACE_HEIGHT } from './constants';
import { getApp } from './appRegistry';

/** Scale factor applied to default window sizes in fullscreen mode */
const FULLSCREEN_SCALE = 0.55;

export const createInitialState = (fullscreen: boolean): DesktopState => ({
  windows: [],
  activeWindowId: null,
  nextZIndex: 1,
  fullscreen,
});

export const initialState: DesktopState = createInitialState(false);

export function desktopReducer(state: DesktopState, action: DesktopAction): DesktopState {
  switch (action.type) {
    case 'OPEN_APP': {
      const app = getApp(action.appId);
      const scale = state.fullscreen ? FULLSCREEN_SCALE : 1;
      const newWindow: WindowState = {
        id: `${action.appId}-${Date.now()}`,
        appId: action.appId,
        title: app.title,
        x: Math.round(app.defaultX * scale),
        y: Math.round(app.defaultY * scale),
        width: Math.round(app.defaultWidth * scale),
        height: Math.round(app.defaultHeight * scale),
        zIndex: state.nextZIndex,
        isMinimized: false,
        isMaximized: false,
      };

      return {
        ...state,
        windows: [...state.windows, newWindow],
        activeWindowId: newWindow.id,
        nextZIndex: state.nextZIndex + 1,
      };
    }

    case 'CLOSE_WINDOW': {
      return {
        ...state,
        windows: state.windows.filter(w => w.id !== action.windowId),
        activeWindowId: state.activeWindowId === action.windowId 
          ? state.windows[state.windows.length - 2]?.id || null 
          : state.activeWindowId,
      };
    }

    case 'FOCUS_WINDOW': {
      const window = state.windows.find(w => w.id === action.windowId);
      if (!window) {return state;}

      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.windowId
            ? { ...w, zIndex: state.nextZIndex }
            : w
        ),
        activeWindowId: action.windowId,
        nextZIndex: state.nextZIndex + 1,
      };
    }

    case 'MOVE_WINDOW': {
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.windowId
            ? { ...w, x: action.x, y: action.y }
            : w
        ),
      };
    }

    case 'RESIZE_WINDOW': {
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.windowId
            ? { ...w, width: action.width, height: action.height }
            : w
        ),
      };
    }

    case 'MINIMIZE_WINDOW': {
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.windowId
            ? { ...w, isMinimized: !w.isMinimized }
            : w
        ),
      };
    }

    case 'TOGGLE_MAXIMIZE_WINDOW': {
      const window = state.windows.find(w => w.id === action.windowId);
      if (!window) {return state;}

      return {
        ...state,
        windows: state.windows.map(w => {
          if (w.id !== action.windowId) {return w;}

          if (w.isMaximized) {
            // Restore from maximized
            const { previousBounds: _previousBounds, ...rest } = w;
            return {
              ...rest,
              isMaximized: false,
              x: w.previousBounds?.x ?? w.x,
              y: w.previousBounds?.y ?? w.y,
              width: w.previousBounds?.width ?? w.width,
              height: w.previousBounds?.height ?? w.height,
            };
          } else {
            // Maximize — use dynamic bounds if provided, fall back to monitor constants
            const maxWidth = action.bounds?.width ?? MONITOR_WIDTH;
            const maxHeight = action.bounds?.height ?? DESKTOP_WORKSPACE_HEIGHT;
            return {
              ...w,
              isMaximized: true,
              previousBounds: {
                x: w.x,
                y: w.y,
                width: w.width,
                height: w.height,
              },
              x: 0,
              y: 0,
              width: maxWidth,
              height: maxHeight,
            };
          }
        }),
      };
    }

    default:
      return state;
  }
}

export const DesktopStateContext = createContext<DesktopState | undefined>(undefined);
export const DesktopDispatchContext = createContext<React.Dispatch<DesktopAction> | undefined>(undefined);
