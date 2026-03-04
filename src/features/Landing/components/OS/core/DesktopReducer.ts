import { createContext } from 'react';
import { DesktopState, DesktopAction, WindowState } from './types';
import { MONITOR_WIDTH, DESKTOP_WORKSPACE_HEIGHT } from './constants';
import { getApp } from './appRegistry';

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
      const vw = action.viewportWidth;
      const vh = action.viewportHeight;

      // Compute size from proportional ratios, clamped between minSize and viewport
      const width  = Math.round(Math.max(app.minWidth,  Math.min(vw, vw * app.defaultWidthRatio)));
      const height = Math.round(Math.max(app.minHeight, Math.min(vh, vh * app.defaultHeightRatio)));

      // Compute position, ensuring the window stays fully within the viewport
      const x = Math.round(Math.min(app.defaultXRatio * vw, Math.max(0, vw - width)));
      const y = Math.round(Math.min(app.defaultYRatio * vh, Math.max(0, vh - height)));

      const newWindow: WindowState = {
        id: `${action.appId}-${Date.now()}`,
        appId: action.appId,
        title: app.title,
        x,
        y,
        width,
        height,
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
      const remaining = state.windows.filter(w => w.id !== action.windowId);
      // Focus the topmost remaining window by z-index
      const topWindow = remaining.length > 0
        ? remaining.reduce((top, w) => (w.zIndex > top.zIndex ? w : top))
        : null;
      return {
        ...state,
        windows: remaining,
        activeWindowId: state.activeWindowId === action.windowId
          ? topWindow?.id ?? null
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
            ? { ...w, zIndex: state.nextZIndex, isMinimized: false }
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

    case 'CLAMP_WINDOWS': {
      const { boundsWidth, boundsHeight } = action;
      const updated = state.windows.map(w => {
        // Maximized windows snap to new bounds
        if (w.isMaximized) {
          return { ...w, x: 0, y: 0, width: boundsWidth, height: boundsHeight };
        }

        const app = getApp(w.appId);
        let { x, y, width, height } = w;

        // Shrink window if it's larger than new viewport
        if (width > boundsWidth) width = Math.max(app.minWidth, boundsWidth);
        if (height > boundsHeight) height = Math.max(app.minHeight, boundsHeight);

        // Push window back into view
        if (x + width > boundsWidth) x = Math.max(0, boundsWidth - width);
        if (y + height > boundsHeight) y = Math.max(0, boundsHeight - height);

        if (x === w.x && y === w.y && width === w.width && height === w.height) {
          return w; // no change — preserve reference
        }
        return { ...w, x, y, width, height };
      });

      // Skip state update if nothing changed
      if (updated.every((w, i) => w === state.windows[i])) return state;
      return { ...state, windows: updated };
    }

    default:
      return state;
  }
}

export const DesktopStateContext = createContext<DesktopState | undefined>(undefined);
export const DesktopDispatchContext = createContext<React.Dispatch<DesktopAction> | undefined>(undefined);
