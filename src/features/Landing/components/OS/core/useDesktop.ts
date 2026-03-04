import { useContext, useCallback } from 'react';
import { DesktopStateContext, DesktopDispatchContext } from './DesktopReducer';
import { AppId } from './types';

export const useDesktopState = () => {
  const context = useContext(DesktopStateContext);
  if (context === undefined) {
    throw new Error('useDesktopState must be used within a DesktopProvider');
  }
  return context;
};

export const useDesktopDispatch = () => {
  const context = useContext(DesktopDispatchContext);
  if (context === undefined) {
    throw new Error('useDesktopDispatch must be used within a DesktopProvider');
  }
  return context;
};

export const useDesktop = () => {
  const state = useDesktopState();
  const dispatch = useDesktopDispatch();

  const openApp = useCallback((appId: AppId) => {
    const existingWindow = state.windows.find(window => window.appId === appId);
    if (existingWindow) {
      dispatch({ type: 'FOCUS_WINDOW', windowId: existingWindow.id });
    } else {
      // Use current viewport dimensions so window sizes adapt to any screen
      dispatch({
        type: 'OPEN_APP',
        appId,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      });
    }
  }, [dispatch, state.windows]);

  const closeWindow = useCallback((windowId: string) => {
    dispatch({ type: 'CLOSE_WINDOW', windowId });
  }, [dispatch]);

  const focusWindow = useCallback((windowId: string) => {
    dispatch({ type: 'FOCUS_WINDOW', windowId });
  }, [dispatch]);

  const moveWindow = useCallback((windowId: string, x: number, y: number) => {
    dispatch({ type: 'MOVE_WINDOW', windowId, x, y });
  }, [dispatch]);

  const resizeWindow = useCallback((windowId: string, width: number, height: number) => {
    dispatch({ type: 'RESIZE_WINDOW', windowId, width, height });
  }, [dispatch]);

  const minimizeWindow = useCallback((windowId: string) => {
    dispatch({ type: 'MINIMIZE_WINDOW', windowId });
  }, [dispatch]);

  const toggleMaximizeWindow = useCallback((windowId: string, bounds?: { width: number; height: number }) => {
    dispatch(bounds
      ? { type: 'TOGGLE_MAXIMIZE_WINDOW', windowId, bounds }
      : { type: 'TOGGLE_MAXIMIZE_WINDOW', windowId }
    );
  }, [dispatch]);

  const clampWindows = useCallback((boundsWidth: number, boundsHeight: number) => {
    dispatch({ type: 'CLAMP_WINDOWS', boundsWidth, boundsHeight });
  }, [dispatch]);

  return {
    ...state,
    openApp,
    closeWindow,
    focusWindow,
    moveWindow,
    resizeWindow,
    minimizeWindow,
    toggleMaximizeWindow,
    clampWindows,
  };
};
