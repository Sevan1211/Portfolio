import React from 'react';
import { useDesktop } from '../core/useDesktop';
import { getAllApps } from '../core/appRegistry';

export const Desktop: React.FC = () => {
  const { openApp, windows } = useDesktop();
  const apps = getAllApps();

  return (
    <div className="desktop">
      <div className="desktop-icons">
        {apps.map((app) => {
          const IconComponent = app.icon;
          const isComponent = typeof IconComponent !== 'string';
          const existingWindow = windows.find(w => w.appId === app.id);

          return (
            <button
              key={app.id}
              className="desktop-icon"
              onClick={() => {
                // Single click restores an already-open (possibly minimized) window
                if (existingWindow) openApp(app.id);
              }}
              onDoubleClick={() => openApp(app.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') openApp(app.id);
              }}
              aria-label={`Open ${app.title}`}
            >
              <div className="desktop-icon__image">
                {isComponent ? (
                  <IconComponent size={48} color="#ffffff" />
                ) : (
                  <span className="desktop-icon__emoji">{IconComponent}</span>
                )}
              </div>
              <span className="desktop-icon__label">{app.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

