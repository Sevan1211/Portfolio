import { AppDefinition, AppId } from './types';
import { AboutMeIcon } from '../components/icons/AboutMeIcon';
import { TerminalIcon } from '../components/icons/TerminalIcon';
import { PacmanIcon } from '../components/icons/PacmanIcon';
import { PaintIcon } from '../components/icons/PaintIcon';
import { AboutApp } from '../apps/about/AboutApp';
import { TerminalApp } from '../apps/terminal/TerminalApp';
import { PacmanApp } from '../apps/pacman/PacmanApp';
import { PaintApp } from '../apps/paint/PaintApp';

export const APP_REGISTRY: Record<AppId, AppDefinition> = {
  'about': {
    id: 'about',
    title: 'About Me',
    icon: AboutMeIcon,
    defaultWidth: 2350,
    defaultHeight: 1400,
    defaultX: 450,
    defaultY: 30,
    minWidth: 800,
    minHeight: 600,
    component: AboutApp,
  },
  'terminal': {
    id: 'terminal',
    title: 'Terminal',
    icon: TerminalIcon,
    defaultWidth: 850,
    defaultHeight: 600,
    defaultX: 580,
    defaultY: 220,
    minWidth: 600,
    minHeight: 400,
    component: TerminalApp,
  },
  'pacman': {
    id: 'pacman',
    title: 'Pac-Man',
    icon: PacmanIcon,
    defaultWidth: 1200,
    defaultHeight: 1000,
    defaultX: 200,
    defaultY: 80,
    minWidth: 700,
    minHeight: 500,
    component: PacmanApp,
  },
  'paint': {
    id: 'paint',
    title: 'Paint',
    icon: PaintIcon,
    defaultWidth: 1000,
    defaultHeight: 750,
    defaultX: 350,
    defaultY: 60,
    minWidth: 600,
    minHeight: 450,
    component: PaintApp,
  },
};

export const getApp = (appId: AppId): AppDefinition => {
  return APP_REGISTRY[appId];
};

export const getAllApps = (): AppDefinition[] => {
  return Object.values(APP_REGISTRY);
};

