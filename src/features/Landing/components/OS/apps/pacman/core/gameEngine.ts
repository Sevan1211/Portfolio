/* ══════════════════════════════════════
   Pac-Man – Game Engine
   ══════════════════════════════════════
   Pure-function game state transitions.
   No React — just data in, data out.
*/

import {
  GameState, PacmanState, GhostState, GhostName,
  Direction, Position, Tile, GhostAlgorithm,
} from './types';
import {
  TILE_SIZE, PACMAN_SPEED, GHOST_SPEED_BASE, GHOST_SPEED_FRIGHTENED,
  SCORE_DOT, SCORE_POWER_PELLET, SCORE_GHOST,
  FRIGHTENED_DURATION, SCATTER_DURATION, CHASE_DURATION,
  DYING_DURATION, LEVEL_COMPLETE_DURATION,
  LEVEL_ALGORITHMS, LEVEL_SPEED_MULTIPLIER,
  GHOST_RELEASE_DELAYS,
} from './constants';
import {
  getMaze, getMazeDimensions, getPacmanStart,
  getGhostHousePositions, countDots,
} from './maze';
import { getGhostDirection } from './pathfinding';

/* ── Direction helpers ─────────────── */
const DIR_VEC: Record<Direction, Position> = {
  up:    { x:  0, y: -1 },
  down:  { x:  0, y:  1 },
  left:  { x: -1, y:  0 },
  right: { x:  1, y:  0 },
};

const OPPOSITE_DIR: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

const LEFT_TURN: Record<Direction, Direction> = {
  up: 'left',
  down: 'right',
  left: 'down',
  right: 'up',
};

const RIGHT_TURN: Record<Direction, Direction> = {
  up: 'right',
  down: 'left',
  left: 'up',
  right: 'down',
};

/* ── Scatter targets (corners) ─────── */
/** Find a walkable tile nearest to a corner position */
function findWalkableNearCorner(
  maze: Tile[][], targetX: number, targetY: number, width: number, height: number,
): Position {
  let best: Position = { x: targetX, y: targetY };
  let bestDist = Infinity;
  // Search a region around the corner
  for (let y = Math.max(0, targetY - 4); y <= Math.min(height - 1, targetY + 4); y++) {
    for (let x = Math.max(0, targetX - 4); x <= Math.min(width - 1, targetX + 4); x++) {
      const tile = maze[y]?.[x];
      if (tile !== undefined && tile !== Tile.WALL && tile !== Tile.GHOST_HOUSE) {
        const dist = Math.abs(x - targetX) + Math.abs(y - targetY);
        if (dist < bestDist) {
          bestDist = dist;
          best = { x, y };
        }
      }
    }
  }
  return best;
}

function getScatterTargets(
  maze: Tile[][], width: number, height: number,
): Record<GhostName, Position> {
  return {
    blinky: findWalkableNearCorner(maze, width - 3, 0, width, height),
    pinky:  findWalkableNearCorner(maze, 2, 0, width, height),
    inky:   findWalkableNearCorner(maze, width - 1, height - 1, width, height),
    clyde:  findWalkableNearCorner(maze, 0, height - 1, width, height),
  };
}

const GHOST_ORDER: GhostName[] = ['blinky', 'pinky', 'inky', 'clyde'];
const GHOST_RESPAWN_DELAY = 180;

function getGhostHomeSlot(
  house: Position[],
  entrance: Position,
  name: GhostName,
): Position {
  const idx = GHOST_ORDER.indexOf(name);
  return house[idx] ?? house[0] ?? entrance;
}

/* ── Initialize a fresh level ─────── */
export function initLevel(level: number, score: number, lives: number): GameState {
  const maze = getMaze(level);
  const dims = getMazeDimensions(level);
  const pacStart = getPacmanStart(level);
  const ghostInfo = getGhostHousePositions(level);
  const algorithm = LEVEL_ALGORITHMS[level - 1] ?? 'random';

  const scatterTargets = getScatterTargets(maze, dims.width, dims.height);
  const ghosts: GhostState[] = GHOST_ORDER.map(name => {
    const housePos = getGhostHomeSlot(ghostInfo.house, ghostInfo.entrance, name);
    return {
      name,
      pos: { ...housePos },
      pixelPos: {
        x: housePos.x * TILE_SIZE + TILE_SIZE / 2,
        y: housePos.y * TILE_SIZE + TILE_SIZE / 2,
      },
      direction: 'up' as Direction,
      mode: 'scatter' as const,
      frightenedTimer: 0,
      scatterTarget: scatterTargets[name],
      isInHouse: true,
      releaseTimer: GHOST_RELEASE_DELAYS[name] ?? 120,
    };
  });

  const pacman: PacmanState = {
    pos: { ...pacStart },
    pixelPos: {
      x: pacStart.x * TILE_SIZE + TILE_SIZE / 2,
      y: pacStart.y * TILE_SIZE + TILE_SIZE / 2,
    },
    direction: 'left',
    nextDirection: null,
    mouthOpen: true,
    mouthTimer: 0,
  };

  return {
    phase: 'playing',
    level,
    score,
    lives,
    maze,
    mazeWidth: dims.width,
    mazeHeight: dims.height,
    pacman,
    ghosts,
    dotsRemaining: countDots(maze),
    algorithm: algorithm as GhostAlgorithm,
    frameCount: 0,
    dyingTimer: 0,
    levelCompleteTimer: 0,
  };
}

export function initGame(): GameState {
  return { ...initLevel(1, 0, 3), phase: 'start' };
}

/* ── Tile check helpers ────────────── */
function isWalkable(maze: Tile[][], x: number, y: number, width: number): boolean {
  // Tunnel wrapping
  if (x < 0 || x >= width) return true;
  if (y < 0 || y >= maze.length) return false;
  const tile = maze[y]?.[x];
  return tile !== undefined && tile !== Tile.WALL && tile !== Tile.GHOST_HOUSE;
}

function canMove(maze: Tile[][], pos: Position, dir: Direction, width: number): boolean {
  const vec = DIR_VEC[dir];
  let nx = pos.x + vec.x;
  const ny = pos.y + vec.y;
  if (nx < 0) nx = width - 1;
  else if (nx >= width) nx = 0;
  return isWalkable(maze, nx, ny, width);
}

/* ── Single game frame ─────────────── */
export function tick(state: GameState, inputDir: Direction | null): GameState {
  if (state.phase !== 'playing') {
    // Handle timers for non-playing phases
    if (state.phase === 'dying') {
      if (state.dyingTimer <= 0) {
        if (state.lives <= 0) {
          return { ...state, phase: 'game-over' };
        }
        // Respawn
        return initLevel(state.level, state.score, state.lives);
      }
      return { ...state, dyingTimer: state.dyingTimer - 1 };
    }
    if (state.phase === 'level-complete') {
      if (state.levelCompleteTimer <= 0) {
        if (state.level >= 4) {
          return { ...state, phase: 'win' };
        }
        return initLevel(state.level + 1, state.score, state.lives);
      }
      return { ...state, levelCompleteTimer: state.levelCompleteTimer - 1 };
    }
    return state;
  }

  let s = { ...state, frameCount: state.frameCount + 1 };

  // ── 1. Process Pac-Man input ────
  s = updatePacmanDirection(s, inputDir);

  // ── 2. Move Pac-Man ─────────────
  s = movePacman(s);

  // ── 3. Eat dots / pellets ───────
  s = eatDots(s);

  // ── 4. Check level complete ─────
  if (s.dotsRemaining <= 0) {
    return { ...s, phase: 'level-complete', levelCompleteTimer: LEVEL_COMPLETE_DURATION };
  }

  // ── 5. Update ghost modes ───────
  s = updateGhostModes(s);

  // ── 6. Move ghosts ─────────────
  s = moveGhosts(s);

  // ── 7. Check collisions ────────
  s = checkCollisions(s);

  // ── 8. Animate mouth ───────────
  s = animateMouth(s);

  return s;
}

/* ── Sub-systems ───────────────────── */

function updatePacmanDirection(s: GameState, inputDir: Direction | null): GameState {
  const pac = { ...s.pacman };
  if (inputDir) {
    // 180° reversal is always allowed immediately (even between tiles)
    if (inputDir === OPPOSITE_DIR[pac.direction]) {
      pac.direction = inputDir;
      pac.nextDirection = null;
    } else {
      // Queue all other directions for tile-center evaluation
      pac.nextDirection = inputDir;
    }
  }
  return { ...s, pacman: pac };
}

function movePacman(s: GameState): GameState {
  const pac = { ...s.pacman };

  // Current tile center in pixels
  const centerX = pac.pos.x * TILE_SIZE + TILE_SIZE / 2;
  const centerY = pac.pos.y * TILE_SIZE + TILE_SIZE / 2;

  // Check if at tile center BEFORE moving.
  // Threshold must be < PACMAN_SPEED to avoid snap→move→re-snap oscillation
  // caused by floating-point imprecision (see ghost movement for full explanation).
  const pacThreshold = PACMAN_SPEED * 0.75;
  const atCenter = Math.abs(pac.pixelPos.x - centerX) < pacThreshold
                && Math.abs(pac.pixelPos.y - centerY) < pacThreshold;

  if (atCenter) {
    // Snap to exact tile center
    pac.pixelPos = { x: centerX, y: centerY };

    // Try queued direction change at tile center
    if (pac.nextDirection && canMove(s.maze, pac.pos, pac.nextDirection, s.mazeWidth)) {
      pac.direction = pac.nextDirection;
      pac.nextDirection = null;
    }

    // Check if we can continue in current direction
    if (!canMove(s.maze, pac.pos, pac.direction, s.mazeWidth)) {
      // Can't move — stay at center
      return { ...s, pacman: pac };
    }
  }

  // Move pixel position in current direction
  const vec = DIR_VEC[pac.direction];
  let px = pac.pixelPos.x + vec.x * PACMAN_SPEED;
  let py = pac.pixelPos.y + vec.y * PACMAN_SPEED;

  // Tunnel pixel wrapping
  const totalWidth = s.mazeWidth * TILE_SIZE;
  if (px < 0) px += totalWidth;
  else if (px >= totalWidth) px -= totalWidth;

  // Determine which grid tile the new pixel position falls in
  let newGridX = Math.floor(px / TILE_SIZE);
  const newGridY = Math.floor(py / TILE_SIZE);

  // Handle grid wrapping for tunnels
  if (newGridX < 0) newGridX = s.mazeWidth - 1;
  else if (newGridX >= s.mazeWidth) newGridX = 0;

  // If we've crossed into a new tile, validate it
  if (newGridX !== pac.pos.x || newGridY !== pac.pos.y) {
    if (newGridY >= 0 && newGridY < s.mazeHeight
        && isWalkable(s.maze, newGridX, newGridY, s.mazeWidth)) {
      pac.pos = { x: newGridX, y: newGridY };
    } else {
      // Hit a wall — snap back to current tile center
      px = centerX;
      py = centerY;
    }
  }

  pac.pixelPos = { x: px, y: py };
  return { ...s, pacman: pac };
}

function eatDots(s: GameState): GameState {
  const { x, y } = s.pacman.pos;
  const tile = s.maze[y]?.[x];

  if (tile === Tile.DOT) {
    const newMaze = s.maze.map(r => [...r]);
    newMaze[y]![x] = Tile.EMPTY;
    return {
      ...s,
      maze: newMaze,
      score: s.score + SCORE_DOT,
      dotsRemaining: s.dotsRemaining - 1,
    };
  }

  if (tile === Tile.POWER_PELLET) {
    const newMaze = s.maze.map(r => [...r]);
    newMaze[y]![x] = Tile.EMPTY;
    // Frighten all ghosts
    const ghosts = s.ghosts.map(g => ({
      ...g,
      mode: (g.isInHouse ? g.mode : 'frightened') as GhostState['mode'],
      frightenedTimer: g.isInHouse ? g.frightenedTimer : FRIGHTENED_DURATION,
    }));
    return {
      ...s,
      maze: newMaze,
      score: s.score + SCORE_POWER_PELLET,
      dotsRemaining: s.dotsRemaining - 1,
      ghosts,
    };
  }

  return s;
}

/**
 * Per-ghost scatter/chase cycle offsets (in frames).
 * Small stagger so ghosts transition scatter↔chase at slightly different
 * times (keeps them independent) but ALL spend most of the time chasing.
 */
const GHOST_MODE_OFFSETS: Record<GhostName, number> = {
  blinky: 0,
  pinky:  60,   // 1s stagger
  inky:   120,  // 2s stagger
  clyde:  180,  // 3s stagger
};

function updateGhostModes(s: GameState): GameState {
  const cyclePeriod = SCATTER_DURATION + CHASE_DURATION;

  const ghosts = s.ghosts.map(g => {
    const ghost = { ...g };

    // Per-ghost mode cycle so they don't all scatter/chase in sync
    const offset = GHOST_MODE_OFFSETS[ghost.name] ?? 0;
    const cyclePos = (s.frameCount + offset) % cyclePeriod;
    const baseMode = cyclePos < SCATTER_DURATION ? 'scatter' : 'chase';

    // Release from house
    if (ghost.isInHouse) {
      ghost.releaseTimer--;
      if (ghost.releaseTimer <= 0) {
        const entrance = getGhostHousePositions(s.level).entrance;
        ghost.isInHouse = false;
        ghost.pos = { ...entrance };
        ghost.pixelPos = {
          x: entrance.x * TILE_SIZE + TILE_SIZE / 2,
          y: entrance.y * TILE_SIZE + TILE_SIZE / 2,
        };
        // Each ghost gets a unique initial direction so they separate immediately
        const releaseDirections: Record<GhostName, Direction> = {
          blinky: 'left',
          pinky:  'right',
          inky:   'left',
          clyde:  'right',
        };
        ghost.direction = releaseDirections[ghost.name] ?? 'left';
      }
      return ghost;
    }

    // Frightened countdown
    if (ghost.mode === 'frightened') {
      ghost.frightenedTimer--;
      if (ghost.frightenedTimer <= 0) {
        ghost.mode = baseMode;
      }
      return ghost;
    }

    ghost.mode = baseMode;
    return ghost;
  });

  return { ...s, ghosts };
}

/** Check if a ghost can walk on a tile */
function isGhostWalkable(maze: Tile[][], x: number, y: number, width: number, height: number): boolean {
  if (x < 0 || x >= width) return true; // tunnel
  if (y < 0 || y >= height) return false;
  const tile = maze[y]?.[x];
  return tile !== undefined && tile !== Tile.WALL && tile !== Tile.GHOST_HOUSE;
}

/** Check if a ghost can move in a given direction from a grid position */
function canGhostMove(maze: Tile[][], pos: Position, dir: Direction, width: number, height: number): boolean {
  const vec = DIR_VEC[dir];
  let nx = pos.x + vec.x;
  const ny = pos.y + vec.y;
  if (nx < 0) nx = width - 1;
  else if (nx >= width) nx = 0;
  return isGhostWalkable(maze, nx, ny, width, height);
}

function getValidGhostDirections(
  maze: Tile[][],
  pos: Position,
  width: number,
  height: number,
): Direction[] {
  const dirs: Direction[] = ['up', 'left', 'down', 'right'];
  return dirs.filter(d => canGhostMove(maze, pos, d, width, height));
}

function moveGhosts(s: GameState): GameState {
  const levelIdx = Math.min(s.level - 1, LEVEL_SPEED_MULTIPLIER.length - 1);
  const speedMult = LEVEL_SPEED_MULTIPLIER[levelIdx] ?? 1;

  const ghosts = s.ghosts.map(g => {
    if (g.isInHouse) return g;

    const ghost = { ...g };
    const speed = (ghost.mode === 'frightened' ? GHOST_SPEED_FRIGHTENED : GHOST_SPEED_BASE) * speedMult;

    // Current tile center in pixels
    const centerX = ghost.pos.x * TILE_SIZE + TILE_SIZE / 2;
    const centerY = ghost.pos.y * TILE_SIZE + TILE_SIZE / 2;

    // Threshold must be LESS than speed to prevent a snap→move→re-snap loop
    // caused by floating-point: (center ± speed) can appear < speed from center.
    // Using speed * 0.75 guarantees: catches closest approach (~speed/2 at most)
    // but after snap-to-center + one move of `speed`, |diff| = speed > threshold.
    const threshold = speed * 0.75;
    const atCenter = Math.abs(ghost.pixelPos.x - centerX) < threshold
                  && Math.abs(ghost.pixelPos.y - centerY) < threshold;

    if (atCenter) {
      // Snap to exact tile center
      ghost.pixelPos = { x: centerX, y: centerY };
      const prevDir = ghost.direction;

      const validDirs = getValidGhostDirections(s.maze, ghost.pos, s.mazeWidth, s.mazeHeight);
      if (validDirs.length === 0) {
        return ghost;
      }

      // Pick next direction via pathfinding
      const chosenDir = getGhostDirection(s.algorithm, ghost, s.pacman, s.ghosts, s.maze);

      // Validate the chosen direction actually leads to a walkable tile
      if (validDirs.includes(chosenDir)) {
        ghost.direction = chosenDir;
      } else {
        // Pathfinding returned an invalid direction — pick a stable fallback order:
        // forward, left, right, reverse (reduces axis-locked oscillation)
        const fallbackDirs: Direction[] = [ghost.direction, LEFT_TURN[ghost.direction], RIGHT_TURN[ghost.direction], OPPOSITE_DIR[ghost.direction]];
        const valid = fallbackDirs.find(d => validDirs.includes(d));
        if (valid) ghost.direction = valid;
        else ghost.direction = validDirs[0]!;
      }

      // If we have options, avoid reversing to reduce local up/down loops.
      if (validDirs.length > 1 && ghost.direction === OPPOSITE_DIR[prevDir]) {
        const nonReverse = validDirs.find(d => d !== OPPOSITE_DIR[prevDir]);
        if (nonReverse) ghost.direction = nonReverse;
      }
    }

    // Check if we can actually move in the current direction
    // (prevents initial direction from pushing ghost into a wall)
    if (!canGhostMove(s.maze, ghost.pos, ghost.direction, s.mazeWidth, s.mazeHeight)) {
      // Don't move — wait for next center evaluation
      ghost.pixelPos = { x: centerX, y: centerY };
      return ghost;
    }

    // Move in current direction
    const vec = DIR_VEC[ghost.direction];
    let px = ghost.pixelPos.x + vec.x * speed;
    let py = ghost.pixelPos.y + vec.y * speed;

    // Tunnel wrapping
    const totalWidth = s.mazeWidth * TILE_SIZE;
    if (px < 0) px += totalWidth;
    else if (px >= totalWidth) px -= totalWidth;

    // Calculate new grid position
    let newGridX = Math.floor(px / TILE_SIZE);
    const newGridY = Math.floor(py / TILE_SIZE);

    if (newGridX < 0) newGridX = s.mazeWidth - 1;
    else if (newGridX >= s.mazeWidth) newGridX = 0;

    // Validate tile when grid position changes
    if (newGridX !== ghost.pos.x || newGridY !== ghost.pos.y) {
      if (isGhostWalkable(s.maze, newGridX, newGridY, s.mazeWidth, s.mazeHeight)) {
        ghost.pos = { x: newGridX, y: newGridY };
      } else {
        // Snap back to current tile center
        px = centerX;
        py = centerY;
      }
    }

    ghost.pixelPos = { x: px, y: py };
    return ghost;
  });

  return { ...s, ghosts };
}

function checkCollisions(s: GameState): GameState {
  const pac = s.pacman;
  const ghostHomeInfo = getGhostHousePositions(s.level);

  for (let i = 0; i < s.ghosts.length; i++) {
    const ghost = s.ghosts[i]!;
    if (ghost.isInHouse) continue;

    // Pixel-distance collision (within ~half a tile)
    const dx = pac.pixelPos.x - ghost.pixelPos.x;
    const dy = pac.pixelPos.y - ghost.pixelPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < TILE_SIZE * 0.8) {
      if (ghost.mode === 'frightened') {
        // Eat ghost — respawn inside the ghost house
        // Stay in house until at least the frightened period ends
        const respawnPos = getGhostHomeSlot(ghostHomeInfo.house, ghostHomeInfo.entrance, ghost.name);
        const newGhosts = [...s.ghosts];
        newGhosts[i] = {
          ...ghost,
          mode: 'chase',
          isInHouse: true,
          releaseTimer: Math.max(GHOST_RESPAWN_DELAY, ghost.frightenedTimer),
          pos: { ...respawnPos },
          pixelPos: {
            x: respawnPos.x * TILE_SIZE + TILE_SIZE / 2,
            y: respawnPos.y * TILE_SIZE + TILE_SIZE / 2,
          },
          direction: 'up',
          frightenedTimer: 0,
        };
        return { ...s, ghosts: newGhosts, score: s.score + SCORE_GHOST };
      } else {
        // Pac-Man dies
        return {
          ...s,
          phase: 'dying',
          lives: s.lives - 1,
          dyingTimer: DYING_DURATION,
        };
      }
    }
  }

  return s;
}

function animateMouth(s: GameState): GameState {
  const pac = { ...s.pacman };
  pac.mouthTimer++;
  if (pac.mouthTimer >= 8) {
    pac.mouthOpen = !pac.mouthOpen;
    pac.mouthTimer = 0;
  }
  return { ...s, pacman: pac };
}
