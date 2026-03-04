import React, { Suspense, useRef, useCallback, useEffect } from 'react';
import { WindowState } from '../core/types';
import { useDesktop } from '../core/useDesktop';
import { getApp } from '../core/appRegistry';
import { MONITOR_WIDTH, DESKTOP_WORKSPACE_HEIGHT } from '../core/constants';

interface WindowFrameProps {
  windowState: WindowState;
  isActive: boolean;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ windowState, isActive }) => {
  const {
    closeWindow,
    focusWindow,
    moveWindow,
    resizeWindow,
    minimizeWindow,
    toggleMaximizeWindow,
  } = useDesktop();

  const windowRef = useRef<HTMLDivElement>(null);
  const windowStateRef = useRef(windowState);
  windowStateRef.current = windowState;

  const dragStateRef = useRef<{
    isDragging: boolean;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  const resizeStateRef = useRef<{
    isResizing: boolean;
    direction: string;
    startX: number;
    startY: number;
    initialWidth: number;
    initialHeight: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  const app = getApp(windowState.appId);
  const AppComponent = app.component;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) {return;} // Only left click
    focusWindow(windowState.id);
  }, [focusWindow, windowState.id]);

  const handleTitleBarMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) {return;}
    e.stopPropagation();
    
    if (windowState.isMaximized) {return;} // Don't drag when maximized

    dragStateRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      initialX: windowState.x,
      initialY: windowState.y,
    };
  }, [windowState.x, windowState.y, windowState.isMaximized]);

  const handleResizeMouseDown = useCallback((direction: string) => (e: React.MouseEvent) => {
    if (e.button !== 0) {return;}
    e.stopPropagation();
    
    if (windowState.isMaximized) {return;} // Don't resize when maximized

    resizeStateRef.current = {
      isResizing: true,
      direction,
      startX: e.clientX,
      startY: e.clientY,
      initialWidth: windowState.width,
      initialHeight: windowState.height,
      initialX: windowState.x,
      initialY: windowState.y,
    };
  }, [windowState.width, windowState.height, windowState.x, windowState.y, windowState.isMaximized]);

  // Stable refs for dispatch actions so the effect never re-attaches
  const moveWindowRef = useRef(moveWindow);
  const resizeWindowRef = useRef(resizeWindow);
  moveWindowRef.current = moveWindow;
  resizeWindowRef.current = resizeWindow;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragStateRef.current?.isDragging) {
        const deltaX = e.clientX - dragStateRef.current.startX;
        const deltaY = e.clientY - dragStateRef.current.startY;
        
        const workspace = windowRef.current?.parentElement;
        const boundsWidth = workspace?.clientWidth ?? MONITOR_WIDTH;
        const boundsHeight = workspace?.clientHeight ?? DESKTOP_WORKSPACE_HEIGHT;
        const ws = windowStateRef.current;

        const newX = Math.max(
          0,
          Math.min(boundsWidth - ws.width, dragStateRef.current.initialX + deltaX)
        );
        const newY = Math.max(
          0,
          Math.min(
            boundsHeight - ws.height,
            dragStateRef.current.initialY + deltaY
          )
        );
        
        moveWindowRef.current(ws.id, newX, newY);
      }

      if (resizeStateRef.current?.isResizing) {
        const state = resizeStateRef.current;
        const deltaX = e.clientX - state.startX;
        const deltaY = e.clientY - state.startY;

        let newWidth = state.initialWidth;
        let newHeight = state.initialHeight;
        let newX = state.initialX;
        let newY = state.initialY;

        if (state.direction.includes('e')) {
          newWidth = Math.max(app.minWidth, state.initialWidth + deltaX);
        }
        if (state.direction.includes('w')) {
          newWidth = Math.max(app.minWidth, state.initialWidth - deltaX);
          if (newWidth > app.minWidth) {
            newX = state.initialX + deltaX;
          }
        }
        if (state.direction.includes('s')) {
          newHeight = Math.max(app.minHeight, state.initialHeight + deltaY);
        }
        if (state.direction.includes('n')) {
          newHeight = Math.max(app.minHeight, state.initialHeight - deltaY);
          if (newHeight > app.minHeight) {
            newY = state.initialY + deltaY;
          }
        }

        // Prevent dragging past left/top boundaries
        if (newX < 0) {
          newWidth += newX;
          newX = 0;
          if (newWidth < app.minWidth) {
            newWidth = app.minWidth;
          }
        }

        if (newY < 0) {
          newHeight += newY;
          newY = 0;
          if (newHeight < app.minHeight) {
            newHeight = app.minHeight;
          }
        }

        // Clamp to screen bounds
        const workspace = windowRef.current?.parentElement;
        const boundsWidth = workspace?.clientWidth ?? MONITOR_WIDTH;
        const boundsHeight = workspace?.clientHeight ?? DESKTOP_WORKSPACE_HEIGHT;
        newWidth = Math.min(newWidth, boundsWidth - newX);
        newHeight = Math.min(newHeight, boundsHeight - newY);

        const ws = windowStateRef.current;
        resizeWindowRef.current(ws.id, newWidth, newHeight);
        if (newX !== ws.x || newY !== ws.y) {
          moveWindowRef.current(ws.id, newX, newY);
        }
      }
    };

    const handleMouseUp = () => {
      dragStateRef.current = null;
      resizeStateRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [app.minWidth, app.minHeight]); // Stable — window state read via refs

  const style: React.CSSProperties = {
    position: 'absolute',
    left: windowState.x,
    top: windowState.y,
    width: windowState.width,
    height: windowState.height,
    zIndex: windowState.zIndex,
    display: windowState.isMinimized ? 'none' : 'flex',
  };

  return (
    <div
      ref={windowRef}
      className={`window-frame ${isActive ? 'window-active' : ''}`}
      style={style}
      onMouseDown={handleMouseDown}
    >
      <div className="window-titlebar" onMouseDown={handleTitleBarMouseDown}>
        <div className="window-titlebar__icon">
          {typeof app.icon !== 'string' ? (
            <app.icon size={18} color="#ffffff" />
          ) : (
            <span>{app.icon}</span>
          )}
        </div>
        <div className="window-title">{windowState.title}</div>
        <div className="window-controls">
          <button
            className="window-btn window-btn--minimize"
            onClick={(e) => {
              e.stopPropagation();
              minimizeWindow(windowState.id);
            }}
            title="Minimize"
          >
            _
          </button>
          <button
            className="window-btn window-btn--maximize"
            onClick={(e) => {
              e.stopPropagation();
              const workspace = windowRef.current?.parentElement;
              const bounds = workspace
                ? { width: workspace.clientWidth, height: workspace.clientHeight }
                : undefined;
              toggleMaximizeWindow(windowState.id, bounds);
            }}
            title="Maximize"
          >
            {windowState.isMaximized ? '❐' : '□'}
          </button>
          <button
            className="window-btn window-btn--close"
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(windowState.id);
            }}
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      <div className="window-content">
        <Suspense fallback={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#999', fontFamily: 'var(--font-mono)', fontSize: '14px' }}>
            Loading…
          </div>
        }>
          <AppComponent />
        </Suspense>
      </div>

      {/* Resize handles */}
      {!windowState.isMaximized && (
        <>
          <div className="resize-handle resize-n" onMouseDown={handleResizeMouseDown('n')} />
          <div className="resize-handle resize-s" onMouseDown={handleResizeMouseDown('s')} />
          <div className="resize-handle resize-e" onMouseDown={handleResizeMouseDown('e')} />
          <div className="resize-handle resize-w" onMouseDown={handleResizeMouseDown('w')} />
          <div className="resize-handle resize-ne" onMouseDown={handleResizeMouseDown('ne')} />
          <div className="resize-handle resize-nw" onMouseDown={handleResizeMouseDown('nw')} />
          <div className="resize-handle resize-se" onMouseDown={handleResizeMouseDown('se')} />
          <div className="resize-handle resize-sw" onMouseDown={handleResizeMouseDown('sw')} />
        </>
      )}
    </div>
  );
};

