import React from 'react';
import { AppDefinition, AppId } from './types';
import { AboutMeIcon } from '../components/icons/AboutMeIcon';
import { TerminalIcon } from '../components/icons/TerminalIcon';
import { PacmanIcon } from '../components/icons/PacmanIcon';
import { PaintIcon } from '../components/icons/PaintIcon';
import { PythonIcon } from '../components/icons/PythonIcon';

// Lazy-load all app components — they are only rendered when the user opens
// the corresponding window, so there is no reason to include them in the
// initial bundle.  This shaves hundreds of KB off the critical path
// (xterm for Terminal, game engine for Pac-Man, canvas logic for Paint, etc.).
const AboutApp    = React.lazy(() => import('../apps/about/AboutApp').then(m => ({ default: m.AboutApp })));
const TerminalApp = React.lazy(() => import('../apps/terminal/TerminalApp').then(m => ({ default: m.TerminalApp })));
const PacmanApp   = React.lazy(() => import('../apps/pacman/PacmanApp').then(m => ({ default: m.PacmanApp })));
const PaintApp    = React.lazy(() => import('../apps/paint/PaintApp').then(m => ({ default: m.PaintApp })));
const PythonApp   = React.lazy(() => import('../apps/python/PythonApp').then(m => ({ default: m.PythonApp })));

export const APP_REGISTRY: Record<AppId, AppDefinition> = {
  'about': {
    id: 'about',
    title: 'About Me',
    icon: AboutMeIcon,
    defaultWidthRatio: 0.85,
    defaultHeightRatio: 0.88,
    defaultXRatio: 0.06,
    defaultYRatio: 0.02,
    minWidth: 620,
    minHeight: 450,
    component: AboutApp,
  },
  'terminal': {
    id: 'terminal',
    title: 'Terminal',
    icon: TerminalIcon,
    defaultWidthRatio: 0.55,
    defaultHeightRatio: 0.55,
    defaultXRatio: 0.22,
    defaultYRatio: 0.18,
    minWidth: 400,
    minHeight: 280,
    component: TerminalApp,
  },
  'pacman': {
    id: 'pacman',
    title: 'Pac-Man',
    icon: PacmanIcon,
    defaultWidthRatio: 0.70,
    defaultHeightRatio: 0.80,
    defaultXRatio: 0.10,
    defaultYRatio: 0.05,
    minWidth: 500,
    minHeight: 400,
    component: PacmanApp,
  },
  'paint': {
    id: 'paint',
    title: 'Paint',
    icon: PaintIcon,
    defaultWidthRatio: 0.65,
    defaultHeightRatio: 0.70,
    defaultXRatio: 0.12,
    defaultYRatio: 0.04,
    minWidth: 450,
    minHeight: 350,
    component: PaintApp,
  },
  'python': {
    id: 'python',
    title: 'Python IDE',
    icon: PythonIcon,
    defaultWidthRatio: 0.60,
    defaultHeightRatio: 0.72,
    defaultXRatio: 0.15,
    defaultYRatio: 0.06,
    minWidth: 460,
    minHeight: 360,
    component: PythonApp,
  },
};

export const getApp = (appId: AppId): AppDefinition => {
  return APP_REGISTRY[appId];
};

export const getAllApps = (): AppDefinition[] => {
  return Object.values(APP_REGISTRY);
};

