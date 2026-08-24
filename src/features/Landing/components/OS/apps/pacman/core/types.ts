/* ══════════════════════════════════════
   Pac-Man – Type Definitions
   ══════════════════════════════════════ */

/** Cell types that make up a maze grid */
// NOTE: Must be a regular enum (not const enum) for esbuild/isolatedModules compatibility
export enum Tile {
  EMPTY = 0,
  WALL = 1,
  DOT = 2,
  POWER_PELLET = 3,
  GHOST_HOUSE = 4,
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Position {
  x: number; // grid column
  y: number; // grid row
}

export interface PixelPosition {
  x: number; // pixel x
  y: number; // pixel y
}

/** Ghost AI algorithms – one per level */
export type GhostAlgorithm = 'dfs' | 'random' | 'bfs' | 'astar' | 'astar-predictive';

export const ALGORITHM_LABELS: Record<GhostAlgorithm, string> = {
  dfs: 'Depth-First Search',
  random: 'Random Walk',
  bfs: 'Breadth-First Search',
  astar: 'A* Search',
  'astar-predictive': 'A* + Predictive',
};

/** Shown in-game so it is clear the ghosts run real search, not scripted paths. */
export const ALGORITHM_DESCRIPTIONS: Record<GhostAlgorithm, string> = {
  dfs: 'Dives down one branch of the maze at a time. Commits hard, corners badly.',
  random: 'Picks a legal direction at random. No search at all.',
  bfs: 'Explores every tile at distance N before N+1. Always finds the shortest route.',
  astar: 'Shortest path, guided by a distance heuristic so it searches far fewer tiles.',
  'astar-predictive':
    'A*, but it targets where you are heading instead of where you are.',
};

/** Ghost personality names */
export type GhostName = 'blinky' | 'pinky' | 'inky' | 'clyde';

export type GhostMode = 'chase' | 'scatter' | 'frightened';

export interface GhostState {
  name: GhostName;
  pos: Position;
  pixelPos: PixelPosition;
  direction: Direction;
  mode: GhostMode;
  frightenedTimer: number;
  scatterTarget: Position;
  isInHouse: boolean;
  releaseTimer: number;
}

export interface PacmanState {
  pos: Position;
  pixelPos: PixelPosition;
  direction: Direction;
  nextDirection: Direction | null;
  mouthOpen: boolean;
  mouthTimer: number;
}

export type GamePhase =
  | 'start'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'dying'
  | 'level-complete'
  | 'game-over'
  | 'win';

export interface GameState {
  phase: GamePhase;
  level: number; // 1-4
  score: number;
  lives: number;
  maze: Tile[][];
  mazeWidth: number;
  mazeHeight: number;
  pacman: PacmanState;
  ghosts: GhostState[];
  dotsRemaining: number;
  algorithm: GhostAlgorithm;
  frameCount: number;
  dyingTimer: number;
  levelCompleteTimer: number;
  /** READY! countdown before control is handed over. */
  readyTimer: number;
  /** Ghosts eaten on the current power pellet - doubles the reward each time. */
  ghostChain: number;
}

export interface HighScore {
  score: number;
  level: number;
  date: string;
}
