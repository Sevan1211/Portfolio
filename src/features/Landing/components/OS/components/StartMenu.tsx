import React, { useEffect, useRef } from 'react';
import { useDesktop } from '../core/useDesktop';
import { getAllApps } from '../core/appRegistry';
import { AppId } from '../core/types';

interface StartMenuProps {
  onClose: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({ onClose }) => {
  const { openApp } = useDesktop();
  const apps = getAllApps();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        // Check if click is on start button
        const target = e.target as HTMLElement;
        if (!target.closest('.taskbar-start')) {
          onClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleAppClick = (appId: AppId) => {
    openApp(appId);
    onClose();
  };

  return (
    <div ref={menuRef} className="start-menu">
      <div className="start-menu__header">
        <span className="start-menu__title">Vaera OS</span>
        <span className="start-menu__subtitle">v1.0.0</span>
      </div>
      <div className="start-menu__items">
        {apps.map((app) => {
          const IconComponent = app.icon;
          const isComponent = typeof IconComponent !== 'string';

          return (
            <button
              key={app.id}
              className="start-menu__item"
              onClick={() => handleAppClick(app.id)}
            >
              <div className="start-menu__icon">
                {isComponent ? (
                  <IconComponent size={32} color="#ffffff" />
                ) : (
                  <span className="start-menu__emoji">{IconComponent}</span>
                )}
              </div>
              <div className="start-menu__text">
                <div className="start-menu__name">{app.title}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

