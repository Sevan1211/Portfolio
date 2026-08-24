import React, { useEffect, useRef } from 'react';
import { useDesktop } from '../core/useDesktop';
import { getAllApps } from '../core/appRegistry';
import { AppId } from '../core/types';
import { CONTACT, IDENTITY } from '@shared/content/portfolio';

interface StartMenuProps {
  onClose: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({ onClose }) => {
  const { openApp, standalone } = useDesktop();
  const apps = getAllApps();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
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

  const handleShutDown = () => {
    onClose();
    if (standalone) {
      // The /os page has no scene behind it - Shut Down returns to the 3D site.
      window.location.href = '/';
      return;
    }
    // Decoupled from the 3D scene: LandingScene listens for this and runs the
    // same leave-the-monitor path as Escape.
    window.dispatchEvent(new CustomEvent('retro-os:leave'));
  };

  return (
    <div ref={menuRef} className="start-menu">
      <div className="start-menu__header">
        <span className="start-menu__title">{IDENTITY.name}</span>
        <span className="start-menu__subtitle">{IDENTITY.title}</span>
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
              type="button"
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

        <div className="start-menu__divider" />

        <a
          className="start-menu__item start-menu__item--link"
          href={CONTACT.resumePath}
          download
          onClick={onClose}
        >
          <span className="start-menu__glyph">▤</span>
          <div className="start-menu__text">
            <div className="start-menu__name">Download Resume</div>
          </div>
        </a>

        <a
          className="start-menu__item start-menu__item--link"
          href={CONTACT.github}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
        >
          <span className="start-menu__glyph">◈</span>
          <div className="start-menu__text">
            <div className="start-menu__name">GitHub</div>
          </div>
        </a>

        <a
          className="start-menu__item start-menu__item--link"
          href={CONTACT.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
        >
          <span className="start-menu__glyph">▣</span>
          <div className="start-menu__text">
            <div className="start-menu__name">LinkedIn</div>
          </div>
        </a>

        <div className="start-menu__divider" />
        <button
          className="start-menu__item start-menu__item--shutdown"
          onClick={handleShutDown}
          type="button"
        >
          <span className="start-menu__glyph">⏻</span>
          <div className="start-menu__text">
            <div className="start-menu__name">Shut Down…</div>
          </div>
        </button>
      </div>
    </div>
  );
};
