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

export type GamePhase = 'start' | 'playing' | 'dying' | 'level-complete' | 'game-over' | 'win';

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
}

export interface HighScore {
  score: number;
  level: number;
  date: string;
}
