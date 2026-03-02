/* ══════════════════════════════════════
   Pac-Man – Maze Layouts (4 levels)
   ══════════════════════════════════════
   Legend:
     0 = EMPTY, 1 = WALL, 2 = DOT,
     3 = POWER_PELLET, 4 = GHOST_HOUSE
   Each maze is 28 columns × 31 rows (classic dimensions).
*/

import { Tile } from './types';

const W = Tile.WALL;
const D = Tile.DOT;
const P = Tile.POWER_PELLET;
const E = Tile.EMPTY;
const G = Tile.GHOST_HOUSE;

/* ── helpers ───────────────────────── */
const parseMaze = (rows: number[][]): Tile[][] =>
  rows.map(r => [...r] as Tile[]);

/* ═══════════════════════════════════
   Level 1 – Classic layout (simple)
   ═══════════════════════════════════ */
const LEVEL_1_RAW: number[][] = [
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
  [W,D,D,D,D,D,D,D,D,D,D,D,D,W,W,D,D,D,D,D,D,D,D,D,D,D,D,W],
  [W,D,W,W,W,W,D,W,W,W,W,W,D,W,W,D,W,W,W,W,W,D,W,W,W,W,D,W],
  [W,P,W,W,W,W,D,W,W,W,W,W,D,W,W,D,W,W,W,W,W,D,W,W,W,W,P,W],
  [W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W],
  [W,D,W,W,W,W,D,W,W,D,W,W,W,W,W,W,W,W,D,W,W,D,W,W,W,W,D,W],
  [W,D,D,D,D,D,D,W,W,D,D,D,D,W,W,D,D,D,D,W,W,D,D,D,D,D,D,W],
  [W,W,W,W,W,W,D,W,W,W,W,W,E,W,W,E,W,W,W,W,W,D,W,W,W,W,W,W],
  [E,E,E,E,E,W,D,W,W,E,E,E,E,E,E,E,E,E,E,W,W,D,W,E,E,E,E,E],
  [W,W,W,W,W,W,D,W,W,E,W,W,W,G,G,W,W,W,E,W,W,D,W,W,W,W,W,W],
  [E,E,E,E,E,E,D,E,E,E,W,G,G,G,G,G,G,W,E,E,E,D,E,E,E,E,E,E],
  [W,W,W,W,W,W,D,W,W,E,W,G,G,G,G,G,G,W,E,W,W,D,W,W,W,W,W,W],
  [E,E,E,E,E,W,D,W,W,E,W,W,W,W,W,W,W,W,E,W,W,D,W,E,E,E,E,E],
  [W,W,W,W,W,W,D,W,W,E,E,E,E,E,E,E,E,E,E,W,W,D,W,W,W,W,W,W],
  [W,D,D,D,D,D,D,D,D,D,D,D,D,W,W,D,D,D,D,D,D,D,D,D,D,D,D,W],
  [W,D,W,W,W,W,D,W,W,W,W,W,D,W,W,D,W,W,W,W,W,D,W,W,W,W,D,W],
  [W,P,D,D,W,W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W,W,D,D,P,W],
  [W,W,W,D,W,W,D,W,W,D,W,W,W,W,W,W,W,W,D,W,W,D,W,W,D,W,W,W],
  [W,D,D,D,D,D,D,W,W,D,D,D,D,W,W,D,D,D,D,W,W,D,D,D,D,D,D,W],
  [W,D,W,W,W,W,W,W,W,W,W,W,D,W,W,D,W,W,W,W,W,W,W,W,W,W,D,W],
  [W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W],
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
];

/* ═══════════════════════════════════
   Level 2 – More corridors
   ═══════════════════════════════════ */
const LEVEL_2_RAW: number[][] = [
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
  [W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W],
  [W,D,W,W,W,D,W,W,W,W,D,W,W,W,W,W,W,D,W,W,W,W,D,W,W,W,D,W],
  [W,P,W,W,W,D,D,D,D,D,D,D,D,W,W,D,D,D,D,D,D,D,D,W,W,W,P,W],
  [W,D,W,W,W,D,W,W,D,W,W,W,D,W,W,D,W,W,W,D,W,W,D,W,W,W,D,W],
  [W,D,D,D,D,D,W,W,D,D,D,D,D,D,D,D,D,D,D,D,W,W,D,D,D,D,D,W],
  [W,D,W,W,W,D,W,W,W,W,W,D,W,W,W,W,D,W,W,W,W,W,D,W,W,W,D,W],
  [W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W],
  [W,W,W,D,W,W,D,W,W,E,W,W,W,E,E,W,W,W,E,W,W,D,W,W,D,W,W,W],
  [E,E,E,D,D,D,D,W,W,E,W,W,W,G,G,W,W,W,E,W,W,D,D,D,D,E,E,E],
  [W,W,W,D,W,W,D,E,E,E,W,G,G,G,G,G,G,W,E,E,E,D,W,W,D,W,W,W],
  [W,D,D,D,D,D,D,W,W,E,W,G,G,G,G,G,G,W,E,W,W,D,D,D,D,D,D,W],
  [W,D,W,W,W,W,D,W,W,E,W,W,W,W,W,W,W,W,E,W,W,D,W,W,W,W,D,W],
  [W,D,D,D,D,D,D,D,D,E,E,E,E,E,E,E,E,E,E,D,D,D,D,D,D,D,D,W],
  [W,D,W,W,W,D,W,D,W,W,W,W,D,W,W,D,W,W,W,W,D,W,D,W,W,W,D,W],
  [W,P,D,D,D,D,W,D,D,D,D,D,D,W,W,D,D,D,D,D,D,W,D,D,D,D,P,W],
  [W,W,W,W,W,D,W,D,W,W,W,W,D,W,W,D,W,W,W,W,D,W,D,W,W,W,W,W],
  [W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W],
  [W,D,W,W,W,W,W,W,D,W,W,W,W,W,W,W,W,W,W,D,W,W,W,W,W,W,D,W],
  [W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W],
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
];

/* ═══════════════════════════════════
   Level 3 – Open arenas
   ═══════════════════════════════════ */
const LEVEL_3_RAW: number[][] = [
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
  [W,D,D,D,D,D,D,D,D,D,D,D,D,W,W,D,D,D,D,D,D,D,D,D,D,D,D,W],
  [W,D,W,W,D,W,W,W,W,W,W,W,D,D,D,D,W,W,W,W,W,W,D,W,W,D,D,W],
  [W,P,W,W,D,D,D,D,D,D,D,D,D,W,W,D,D,D,D,D,D,D,D,W,W,D,P,W],
  [W,D,D,D,D,W,D,W,W,D,W,W,D,W,W,D,W,W,D,W,W,D,W,D,D,D,D,W],
  [W,D,W,W,D,W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W,D,W,W,D,W],
  [W,D,D,D,D,W,D,W,W,D,W,D,W,W,W,W,D,W,D,W,W,D,W,D,D,D,D,W],
  [W,W,W,D,D,D,D,W,W,D,W,D,D,D,D,D,D,W,D,W,W,D,D,D,D,W,W,W],
  [E,E,E,D,W,W,D,D,D,D,D,D,W,E,E,W,D,D,D,D,D,D,W,W,D,E,E,E],
  [W,W,W,D,W,W,D,W,W,E,W,W,W,G,G,W,W,W,E,W,W,D,W,W,D,W,W,W],
  [E,E,E,D,D,D,D,E,E,E,W,G,G,G,G,G,G,W,E,E,E,D,D,D,D,E,E,E],
  [W,W,W,D,W,W,D,W,W,E,W,G,G,G,G,G,G,W,E,W,W,D,W,W,D,W,W,W],
  [E,E,E,D,W,W,D,W,W,E,W,W,W,W,W,W,W,W,E,W,W,D,W,W,D,E,E,E],
  [W,W,W,D,D,D,D,D,D,E,E,E,E,E,E,E,E,E,E,D,D,D,D,D,D,W,W,W],
  [W,D,D,D,W,W,D,W,D,D,D,W,D,W,W,D,W,D,D,D,W,D,W,W,D,D,D,W],
  [W,D,W,D,D,D,D,W,D,W,D,D,D,D,D,D,D,D,W,D,W,D,D,D,D,W,D,W],
  [W,P,W,D,W,W,D,D,D,W,W,W,D,W,W,D,W,W,W,D,D,D,W,W,D,W,P,W],
  [W,D,D,D,D,D,D,W,D,D,D,D,D,W,W,D,D,D,D,D,W,D,D,D,D,D,D,W],
  [W,D,W,W,W,W,D,W,W,W,W,W,D,D,D,D,W,W,W,W,W,D,W,W,W,W,D,W],
  [W,D,D,D,D,D,D,D,D,D,D,D,D,W,W,D,D,D,D,D,D,D,D,D,D,D,D,W],
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
];

/* ═══════════════════════════════════
   Level 4 – Tight, tricky maze
   ═══════════════════════════════════ */
const LEVEL_4_RAW: number[][] = [
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
  [W,D,D,D,D,W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W,D,D,D,D,W],
  [W,D,W,W,D,W,D,W,W,W,D,W,W,W,W,W,W,D,W,W,W,D,W,D,W,W,D,W],
  [W,P,W,W,D,D,D,W,D,D,D,D,D,W,W,D,D,D,D,D,W,D,D,D,W,W,P,W],
  [W,D,D,D,D,W,D,W,D,W,W,W,D,D,D,D,W,W,W,D,W,D,W,D,D,D,D,W],
  [W,W,W,D,D,W,D,D,D,D,D,W,D,W,W,D,W,D,D,D,D,D,W,D,D,W,W,W],
  [W,D,D,D,W,W,W,W,D,W,D,D,D,W,W,D,D,D,W,D,W,W,W,W,D,D,D,W],
  [W,D,W,D,D,D,D,D,D,W,W,W,D,D,D,D,W,W,W,D,D,D,D,D,D,W,D,W],
  [W,D,W,W,W,D,W,W,D,D,D,D,D,E,E,D,D,D,D,D,W,W,D,W,W,W,D,W],
  [W,D,D,D,D,D,W,W,W,E,W,W,W,G,G,W,W,W,E,W,W,W,D,D,D,D,D,W],
  [E,E,W,W,D,D,D,E,E,E,W,G,G,G,G,G,G,W,E,E,E,D,D,D,W,W,E,E],
  [W,D,D,D,D,W,D,W,W,E,W,G,G,G,G,G,G,W,E,W,W,D,W,D,D,D,D,W],
  [W,D,W,W,D,W,D,W,W,E,W,W,W,W,W,W,W,W,E,W,W,D,W,D,W,W,D,W],
  [W,D,D,D,D,D,D,D,D,E,E,E,E,E,E,E,E,E,E,D,D,D,D,D,D,D,D,W],
  [W,D,W,D,W,W,W,D,W,W,D,W,D,W,W,D,W,D,W,W,D,W,W,W,D,W,D,W],
  [W,P,W,D,D,D,D,D,D,D,D,W,D,D,D,D,W,D,D,D,D,D,D,D,D,W,P,W],
  [W,D,W,D,W,D,W,W,D,W,D,D,D,W,W,D,D,D,W,D,W,W,D,W,D,W,D,W],
  [W,D,D,D,W,D,D,D,D,W,W,W,D,W,W,D,W,W,W,D,D,D,D,W,D,D,D,W],
  [W,D,W,W,W,W,W,D,D,D,D,D,D,D,D,D,D,D,D,D,D,W,W,W,W,W,D,W],
  [W,D,D,D,D,D,D,D,W,W,W,D,D,W,W,D,D,W,W,W,D,D,D,D,D,D,D,W],
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
];

/** Return a deep copy of the maze for the given level (1-indexed) */
export function getMaze(level: number): Tile[][] {
  switch (level) {
    case 1:  return parseMaze(LEVEL_1_RAW);
    case 2:  return parseMaze(LEVEL_2_RAW);
    case 3:  return parseMaze(LEVEL_3_RAW);
    case 4:  return parseMaze(LEVEL_4_RAW);
    default: return parseMaze(LEVEL_1_RAW);
  }
}

/** Get the maze dimensions (cols × rows) for a level */
export function getMazeDimensions(level: number): { width: number; height: number } {
  const maze = getMaze(level);
  return { width: maze[0]?.length ?? 28, height: maze.length };
}

/** Find Pac-Man's starting position (bottom-center area) */
export function getPacmanStart(level: number): { x: number; y: number } {
  // Always start in the bottom center area
  const dims = getMazeDimensions(level);
  const maze = getMaze(level);
  const centerX = Math.floor(dims.width / 2);

  // Search downward from center for a DOT or EMPTY tile
  for (let y = dims.height - 3; y >= dims.height / 2; y--) {
    for (let dx = 0; dx < 5; dx++) {
      for (const x of [centerX + dx, centerX - dx]) {
        if (x >= 0 && x < dims.width) {
          const tile = maze[y]?.[x];
          if (tile === Tile.DOT || tile === Tile.EMPTY || tile === Tile.POWER_PELLET) {
            return { x, y };
          }
        }
      }
    }
  }
  return { x: 14, y: 17 }; // fallback
}

/** Find the ghost house entrance position */
export function getGhostHousePositions(level: number): {
  house: { x: number; y: number }[];
  entrance: { x: number; y: number };
} {
  const maze = getMaze(level);
  const width = maze[0]?.length ?? 28;
  const height = maze.length;
  const house: { x: number; y: number }[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < (maze[y]?.length ?? 0); x++) {
      if (maze[y]![x] === Tile.GHOST_HOUSE) {
        house.push({ x, y });
      }
    }
  }

  // Default fallback
  let entrance = { x: Math.floor(width / 2), y: Math.floor(height / 2) };

  if (house.length > 0) {
    // Ideal entrance is directly above the top-center of the ghost house
    const minY = Math.min(...house.map(p => p.y));
    const xs = house.filter(p => p.y === minY).map(p => p.x);
    const centerX = Math.floor((Math.min(...xs) + Math.max(...xs)) / 2);
    const idealY = minY - 1;

    // Search outward from the ideal position for the nearest walkable tile
    let bestDist = Infinity;
    const searchRadius = 10;
    for (let dy = -1; dy <= searchRadius; dy++) {
      for (let dx = -searchRadius; dx <= searchRadius; dx++) {
        const sx = centerX + dx;
        const sy = idealY + dy;
        if (sy < 0 || sy >= height || sx < 0 || sx >= width) continue;
        const tile = maze[sy]?.[sx];
        if (tile !== undefined && tile !== Tile.WALL && tile !== Tile.GHOST_HOUSE) {
          // Manhattan distance weighted: prefer directly above, penalise distance from center
          const dist = Math.abs(dx) + Math.abs(dy) * 2;
          if (dist < bestDist) {
            bestDist = dist;
            entrance = { x: sx, y: sy };
          }
        }
      }
    }
  }

  return { house, entrance };
}

/** Count how many dots + power pellets are in a maze */
export function countDots(maze: Tile[][]): number {
  let count = 0;
  for (const row of maze) {
    for (const tile of row) {
      if (tile === Tile.DOT || tile === Tile.POWER_PELLET) count++;
    }
  }
  return count;
}
