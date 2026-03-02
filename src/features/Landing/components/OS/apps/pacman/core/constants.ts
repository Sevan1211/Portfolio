/* ══════════════════════════════════════
   Pac-Man – Game Constants
   ══════════════════════════════════════ */

/** Tile size in pixels (each maze cell) */
export const TILE_SIZE = 20;

/** Game tick rate – ms per frame */
export const TICK_RATE = 1000 / 60;

/** Movement speed (pixels per frame) */
export const PACMAN_SPEED = 2;
export const GHOST_SPEED_BASE = 1.6;
export const GHOST_SPEED_FRIGHTENED = 1.0;

/** Points */
export const SCORE_DOT = 10;
export const SCORE_POWER_PELLET = 50;
export const SCORE_GHOST = 200;

/** Frightened mode duration in frames (≈6 seconds at 60fps) */
export const FRIGHTENED_DURATION = 360;

/** Scatter/chase mode durations (frames) */
export const SCATTER_DURATION = 180; // 3s  (brief regroup)
export const CHASE_DURATION = 1500; // 25s (long pursuit)

/** Dying animation duration (frames) */
export const DYING_DURATION = 90;

/** Level-complete pause duration (frames) */
export const LEVEL_COMPLETE_DURATION = 120;

/** Ghost release timers (frames) – stagger ghost exits from the house */
export const GHOST_RELEASE_DELAYS: Record<string, number> = {
  blinky: 0,
  pinky: 120,   // 2s
  inky: 300,    // 5s
  clyde: 480,   // 8s
};

/** Colors */
export const COLORS = {
  background: '#000000',
  wall: '#2121DE',
  wallStroke: '#5555FF',
  dot: '#FFCC99',
  powerPellet: '#FFCC99',
  pacman: '#FFFF00',
  pacmanMouth: '#000000',
  ghostBlinky: '#FF0000',
  ghostPinky: '#FFB8FF',
  ghostInky: '#00FFFF',
  ghostClyde: '#FFB852',
  ghostFrightened: '#2121DE',
  ghostFrightenedFace: '#FFFFFF',
  ghostEyes: '#FFFFFF',
  ghostPupil: '#2121DE',
  text: '#FFFFFF',
  textHighlight: '#FFFF00',
  sidebar: '#1a1a2e',
  sidebarBorder: '#333366',
} as const;

/** Level-to-algorithm mapping */
export const LEVEL_ALGORITHMS = ['dfs', 'bfs', 'astar', 'astar-predictive'] as const;

/** Ghost speed multiplier per level */
export const LEVEL_SPEED_MULTIPLIER = [1.0, 1.05, 1.1, 1.2] as const;
