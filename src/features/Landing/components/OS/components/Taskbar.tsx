import React, { useState, useEffect } from 'react';
import { useDesktop } from '../core/useDesktop';
import { getApp } from '../core/appRegistry';
import { StartMenu } from './StartMenu';

export const Taskbar: React.FC = () => {
  const { windows, activeWindowId, focusWindow, minimizeWindow } = useDesktop();
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setClock(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const formattedClock = clock.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleTaskbarItemClick = (windowId: string) => {
    const window = windows.find(w => w.id === windowId);
    if (!window) {return;}

    if (window.isMinimized) {
      minimizeWindow(windowId);
    } else if (windowId === activeWindowId) {
      minimizeWindow(windowId);
    } else {
      focusWindow(windowId);
    }
  };

  return (
    <>
      <div className="taskbar">
        <button
          className={`taskbar-start ${startMenuOpen ? 'active' : ''}`}
          onClick={() => setStartMenuOpen(!startMenuOpen)}
        >
          <span className="start-icon">☰</span>
          <span>Start</span>
        </button>

        <div className="taskbar-items">
          {windows.map((window) => {
            const app = getApp(window.appId);
            const IconComponent = app.icon;
            const isComponent = typeof IconComponent !== 'string';

            return (
              <button
                key={window.id}
                className={`taskbar-item ${
                  window.id === activeWindowId && !window.isMinimized ? 'active' : ''
                }`}
                onClick={() => handleTaskbarItemClick(window.id)}
                title={window.title}
              >
                <span className="taskbar-item__icon">
                  {isComponent ? (
                    <IconComponent size={20} color="#000000" />
                  ) : (
                    IconComponent
                  )}
                </span>
                <span className="taskbar-item__label">{window.title}</span>
              </button>
            );
          })}
        </div>

        <div className="taskbar-clock">{formattedClock}</div>

        <a
          href="https://github.com/Sevan1211/Portfolio"
          target="_blank"
          rel="noopener noreferrer"
          className="taskbar-source"
          title="View source on GitHub"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: 'block' }}
            shapeRendering="crispEdges"
          >
            {/* Disk body */}
            <rect x="2" y="1" width="16" height="18" fill="#3030A0" stroke="#000" strokeWidth="1" />
            {/* Metal slider area (top) */}
            <rect x="5" y="1" width="10" height="7" fill="#C0C0C0" stroke="#808080" strokeWidth="0.5" />
            {/* Slider opening */}
            <rect x="8" y="2" width="3" height="5" fill="#3030A0" />
            {/* Label area (bottom) */}
            <rect x="4" y="11" width="12" height="7" fill="#fff" stroke="#808080" strokeWidth="0.5" />
            {/* Label lines */}
            <line x1="6" y1="13" x2="14" y2="13" stroke="#808080" strokeWidth="0.8" />
            <line x1="6" y1="15" x2="14" y2="15" stroke="#808080" strokeWidth="0.8" />
          </svg>
        </a>
      </div>

      {startMenuOpen && (
        <StartMenu onClose={() => setStartMenuOpen(false)} />
      )}
    </>
  );
};

