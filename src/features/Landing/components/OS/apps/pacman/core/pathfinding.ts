/* ══════════════════════════════════════
   Pac-Man – Pathfinding Algorithms
   ══════════════════════════════════════
  Level 1 → DFS
   Level 2 → BFS
   Level 3 → A*
   Level 4 → A* + Predictive targeting
*/

import { Position, Direction, Tile, GhostState, PacmanState, GhostAlgorithm } from './types';
import { GHOST_MISTAKE_RATE } from './constants';

/* ── Direction helpers ─────────────── */
const DIRECTION_VECTORS: Record<Direction, Position> = {
  up:    { x:  0, y: -1 },
  down:  { x:  0, y:  1 },
  left:  { x: -1, y:  0 },
  right: { x:  1, y:  0 },
};

const OPPOSITE: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

const ALL_DIRECTIONS: Direction[] = ['up', 'down', 'left', 'right'];

/**
 * Per-ghost direction exploration priority.
 * Controls the order algorithms try directions, so ghosts naturally
 * diverge at intersections even with similar targets.
 */
const GHOST_DIR_PREFERENCES: Record<string, Direction[]> = {
  blinky: ['up', 'left', 'down', 'right'],     // aggressive: favours up & left
  pinky:  ['down', 'right', 'up', 'left'],     // ambusher: favours down & right
  inky:   ['right', 'up', 'left', 'down'],     // flanker: favours right & up
  clyde:  ['left', 'down', 'right', 'up'],     // fickle: favours left & down
};

/** Module-scoped direction order — set per-ghost before each pathfinding call */
let _dirOrder: Direction[] = ALL_DIRECTIONS;

/** Check if a tile is walkable */
function isWalkable(maze: Tile[][], x: number, y: number): boolean {
  if (y < 0 || y >= maze.length) return false;
  const row = maze[y];
  if (!row || x < 0 || x >= row.length) {
    // Allow wrapping through tunnel (off-screen empty tiles)
    return true;
  }
  const tile = row[x]!;
  return tile !== Tile.WALL;
}

/** Get valid neighboring positions a ghost can move to */
function getNeighbors(
  maze: Tile[][],
  pos: Position,
  currentDir: Direction,
  allowReverse: boolean = false,
): { pos: Position; dir: Direction }[] {
  const results: { pos: Position; dir: Direction }[] = [];
  const width = maze[0]?.length ?? 28;

  for (const dir of _dirOrder) {
    // Ghosts can't reverse direction (unless frightened)
    if (!allowReverse && dir === OPPOSITE[currentDir]) continue;

    const vec = DIRECTION_VECTORS[dir];
    let nx = pos.x + vec.x;
    const ny = pos.y + vec.y;

    // Handle tunnel wrapping
    if (nx < 0) nx = width - 1;
    else if (nx >= width) nx = 0;

    if (isWalkable(maze, nx, ny)) {
      // Don't enter ghost house from outside
      const tile = maze[ny]?.[nx];
      if (tile === Tile.GHOST_HOUSE) continue;

      results.push({ pos: { x: nx, y: ny }, dir });
    }
  }

  return results;
}

/** Manhattan distance heuristic */
function manhattan(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/**
 * When a ghost reaches its target tile, keep moving instead of stopping.
 * Prefer continuing forward, else any non-reverse turn, else reverse.
 */
function pickContinueDirection(
  maze: Tile[][],
  pos: Position,
  currentDir: Direction,
): Direction {
  const nonReverse = getNeighbors(maze, pos, currentDir, false);
  const forward = nonReverse.find(n => n.dir === currentDir);
  if (forward) return forward.dir;
  if (nonReverse.length > 0) return nonReverse[0]!.dir;

  const withReverse = getNeighbors(maze, pos, currentDir, true);
  if (withReverse.length > 0) return withReverse[0]!.dir;

  return currentDir;
}

/**
 * Heuristic fallback when search can't find a full path.
 * Pick the neighboring tile that best reduces distance to the target.
 */
function pickBestNeighborTowardTarget(
  maze: Tile[][],
  pos: Position,
  target: Position,
  currentDir: Direction,
): Direction {
  const nonReverse = getNeighbors(maze, pos, currentDir, false);
  const candidates = nonReverse.length > 0
    ? nonReverse
    : getNeighbors(maze, pos, currentDir, true);

  if (candidates.length === 0) return currentDir;

  let best = candidates[0]!;
  let bestScore = manhattan(best.pos, target) + (best.dir === currentDir ? -0.25 : 0);

  for (let i = 1; i < candidates.length; i++) {
    const c = candidates[i]!;
    const score = manhattan(c.pos, target) + (c.dir === currentDir ? -0.25 : 0);
    if (score < bestScore) {
      best = c;
      bestScore = score;
    }
  }

  return best.dir;
}

/* ── Algorithm 1: Random Walk ──────── */
function randomWalk(
  maze: Tile[][],
  ghost: GhostState,
): Direction {
  // Normal mode: prefer non-reverse moves but occasionally allow reverse
  // to prevent long deterministic loops in simple corridors.
  const allowReverse = ghost.mode === 'frightened' || Math.random() < 0.18;
  const neighbors = getNeighbors(maze, ghost.pos, ghost.direction, allowReverse);

  if (neighbors.length === 0) {
    // No valid non-reverse direction — allow reverse as fallback
    const withReverse = getNeighbors(maze, ghost.pos, ghost.direction, true);
    return withReverse[0]?.dir ?? ghost.direction;
  }
  if (neighbors.length === 1) return neighbors[0]!.dir;

  // Pick a random valid direction
  const idx = Math.floor(Math.random() * neighbors.length);
  return neighbors[idx]!.dir;
}

/* ── Algorithm 2: BFS ──────────────── */
function dfs(
  maze: Tile[][],
  start: Position,
  target: Position,
  currentDir: Direction,
): Direction {
  const width = maze[0]?.length ?? 28;
  const key = (p: Position) => p.y * width + p.x;

  // If already at target, continue moving (don't stall)
  if (start.x === target.x && start.y === target.y) {
    return pickContinueDirection(maze, start, currentDir);
  }

  const startNeighbors = getNeighbors(maze, start, currentDir);
  if (startNeighbors.length === 0) {
    return pickBestNeighborTowardTarget(maze, start, target, currentDir);
  }

  const visited = new Set<number>();
  visited.add(key(start));

  const stack: Array<{ pos: Position; firstDir: Direction }> = [];
  for (const n of startNeighbors) {
    visited.add(key(n.pos));
    stack.push({ pos: n.pos, firstDir: n.dir });
  }

  while (stack.length > 0) {
    const current = stack.pop()!;

    if (current.pos.x === target.x && current.pos.y === target.y) {
      return current.firstDir;
    }

    // Prefer moves that get closer to target first.
    const neighbors = getNeighbors(maze, current.pos, currentDir, true)
      .sort((a, b) => manhattan(a.pos, target) - manhattan(b.pos, target));

    // Push in reverse sorted order so closest is processed first (LIFO)
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const n = neighbors[i]!;
      const nk = key(n.pos);
      if (!visited.has(nk)) {
        visited.add(nk);
        stack.push({ pos: n.pos, firstDir: current.firstDir });
      }
    }
  }

  return pickBestNeighborTowardTarget(maze, start, target, currentDir);
}

function bfs(
  maze: Tile[][],
  start: Position,
  target: Position,
  currentDir: Direction,
): Direction {
  const width = maze[0]?.length ?? 28;
  const height = maze.length;
  const key = (p: Position) => p.y * width + p.x;

  // If already at target, continue moving (don't stop at corners)
  if (start.x === target.x && start.y === target.y) {
    return pickContinueDirection(maze, start, currentDir);
  }

  const visited = new Set<number>();
  visited.add(key(start));

  // BFS queue: [position, first direction taken]
  const queue: { pos: Position; dir: Direction; firstDir: Direction }[] = [];

  // Seed with immediate neighbors
  const neighbors = getNeighbors(maze, start, currentDir);
  for (const n of neighbors) {
    if (!visited.has(key(n.pos))) {
      visited.add(key(n.pos));
      queue.push({ pos: n.pos, dir: n.dir, firstDir: n.dir });
    }
  }

  let head = 0;
  while (head < queue.length) {
    const current = queue[head]!;
    head++;

    if (current.pos.x === target.x && current.pos.y === target.y) {
      return current.firstDir;
    }

    // Expand — BFS doesn't restrict direction at expansion
    for (const dir of _dirOrder) {
      const vec = DIRECTION_VECTORS[dir];
      let nx = current.pos.x + vec.x;
      const ny = current.pos.y + vec.y;

      if (nx < 0) nx = width - 1;
      else if (nx >= width) nx = 0;

      if (ny >= 0 && ny < height && isWalkable(maze, nx, ny)) {
        const tile = maze[ny]?.[nx];
        if (tile === Tile.GHOST_HOUSE) continue;

        const np = { x: nx, y: ny };
        if (!visited.has(key(np))) {
          visited.add(key(np));
          queue.push({ pos: np, dir, firstDir: current.firstDir });
        }
      }
    }
  }

  // Fallback — choose best local move toward target
  return pickBestNeighborTowardTarget(maze, start, target, currentDir);
}

/* ── Algorithm 3: A* Search ────────── */
function astar(
  maze: Tile[][],
  start: Position,
  target: Position,
  currentDir: Direction,
): Direction {
  const width = maze[0]?.length ?? 28;
  const height = maze.length;
  const key = (p: Position) => p.y * width + p.x;

  if (start.x === target.x && start.y === target.y) {
    return pickContinueDirection(maze, start, currentDir);
  }

  // Open set as a simple sorted array (small mazes, no need for a heap)
  interface Node {
    pos: Position;
    dir: Direction;
    firstDir: Direction;
    g: number;
    f: number;
  }

  const gScores = new Map<number, number>();
  gScores.set(key(start), 0);

  const open: Node[] = [];
  const closed = new Set<number>();

  // Seed with neighbors
  const neighbors = getNeighbors(maze, start, currentDir);
  for (const n of neighbors) {
    const g = 1;
    const f = g + manhattan(n.pos, target);
    gScores.set(key(n.pos), g);
    open.push({ pos: n.pos, dir: n.dir, firstDir: n.dir, g, f });
  }

  while (open.length > 0) {
    // Find node with lowest f
    let bestIdx = 0;
    for (let i = 1; i < open.length; i++) {
      if (open[i]!.f < open[bestIdx]!.f) bestIdx = i;
    }
    const current = open.splice(bestIdx, 1)[0]!;

    if (current.pos.x === target.x && current.pos.y === target.y) {
      return current.firstDir;
    }

    closed.add(key(current.pos));

    for (const dir of _dirOrder) {
      const vec = DIRECTION_VECTORS[dir];
      let nx = current.pos.x + vec.x;
      const ny = current.pos.y + vec.y;

      if (nx < 0) nx = width - 1;
      else if (nx >= width) nx = 0;

      if (ny < 0 || ny >= height) continue;
      if (!isWalkable(maze, nx, ny)) continue;
      const tile = maze[ny]?.[nx];
      if (tile === Tile.GHOST_HOUSE) continue;

      const np = { x: nx, y: ny };
      const nk = key(np);

      if (closed.has(nk)) continue;

      const tentativeG = current.g + 1;
      const existingG = gScores.get(nk);

      if (existingG === undefined || tentativeG < existingG) {
        gScores.set(nk, tentativeG);
        const f = tentativeG + manhattan(np, target);
        // Check if already in open set
        const existing = open.find(n => key(n.pos) === nk);
        if (existing) {
          existing.g = tentativeG;
          existing.f = f;
          existing.firstDir = current.firstDir;
        } else {
          open.push({ pos: np, dir, firstDir: current.firstDir, g: tentativeG, f });
        }
      }
    }
  }

  // Fallback — choose best local move toward target
  return pickBestNeighborTowardTarget(maze, start, target, currentDir);
}

/* ── Ghost Personality Targeting ────── */
/**
 * Each ghost gets a unique chase target based on classic Pac-Man personalities.
 * Used by ALL algorithms so ghosts spread out instead of clumping.
 *   Blinky (red)   → direct chaser, targets Pac-Man's current tile
 *   Pinky  (pink)  → ambusher, targets 4 tiles ahead of Pac-Man
 *   Inky   (cyan)  → flanker, uses Blinky's position to create pincer moves
 *   Clyde  (orange) → fickle, chases when far but scatters when close
 */
function getPersonalityTarget(
  ghost: GhostState,
  pacman: PacmanState,
  blinkyPos: Position,
  maze: Tile[][],
): Position {
  const width = maze[0]?.length ?? 28;
  const height = maze.length;

  const clamp = (p: Position): Position => ({
    x: Math.max(0, Math.min(width - 1, p.x)),
    y: Math.max(0, Math.min(height - 1, p.y)),
  });

  const pacDir = DIRECTION_VECTORS[pacman.direction];

  switch (ghost.name) {
    case 'blinky':
      // Red — targets Pac-Man's current tile directly
      return pacman.pos;

    case 'pinky': {
      // Pink — targets 4 tiles ahead of Pac-Man
      return clamp({
        x: pacman.pos.x + pacDir.x * 4,
        y: pacman.pos.y + pacDir.y * 4,
      });
    }

    case 'inky': {
      // Cyan — complex: 2 tiles ahead of Pac-Man, then double the vector from Blinky
      const ahead = {
        x: pacman.pos.x + pacDir.x * 2,
        y: pacman.pos.y + pacDir.y * 2,
      };
      return clamp({
        x: ahead.x + (ahead.x - blinkyPos.x),
        y: ahead.y + (ahead.y - blinkyPos.y),
      });
    }

    case 'clyde': {
      // Orange — chases when far, flanks from behind when close
      const dist = manhattan(ghost.pos, pacman.pos);
      if (dist > 4) return pacman.pos;
      // When close, target behind Pac-Man to cut off escape
      const behind = {
        x: pacman.pos.x - pacDir.x * 3,
        y: pacman.pos.y - pacDir.y * 3,
      };
      return clamp(behind);
    }

    default:
      return pacman.pos;
  }
}

/* ── Main dispatch ─────────────────── */
export function getGhostDirection(
  algorithm: GhostAlgorithm,
  ghost: GhostState,
  pacman: PacmanState,
  ghosts: GhostState[],
  maze: Tile[][],
): Direction {
  // Set direction exploration order for this ghost's personality
  _dirOrder = GHOST_DIR_PREFERENCES[ghost.name] ?? ALL_DIRECTIONS;

  // Frightened mode → random for all algorithms
  if (ghost.mode === 'frightened') {
    return randomWalk(maze, ghost);
  }

  // Scatter mode → head toward scatter corner, but use a target that's
  // between the ghost's corner and Pac-Man so they don't just circle in
  // a far-away corner forever. This keeps scatter brief and purposeful.
  if (ghost.mode === 'scatter') {
    // Blend: 60% toward scatter corner, 40% toward Pac-Man
    const blended: Position = {
      x: Math.round(ghost.scatterTarget.x * 0.6 + pacman.pos.x * 0.4),
      y: Math.round(ghost.scatterTarget.y * 0.6 + pacman.pos.y * 0.4),
    };
    const width = maze[0]?.length ?? 28;
    const height = maze.length;
    const clamped: Position = {
      x: Math.max(0, Math.min(width - 1, blended.x)),
      y: Math.max(0, Math.min(height - 1, blended.y)),
    };
    switch (algorithm) {
      case 'dfs':
        return dfs(maze, ghost.pos, clamped, ghost.direction);

      case 'random':
        return randomWalk(maze, ghost);

      case 'bfs':
        return bfs(maze, ghost.pos, clamped, ghost.direction);

      case 'astar':
      case 'astar-predictive':
        return astar(maze, ghost.pos, clamped, ghost.direction);

      default:
        return randomWalk(maze, ghost);
    }
  }

  // Chase mode
  // Occasionally make a "mistake" so ghosts aren't perfectly optimal.
  // This scales by level: DFS ghosts blunder often, A* predictive never does.
  const mistakeRate = GHOST_MISTAKE_RATE[algorithm] ?? 0;
  if (mistakeRate > 0 && Math.random() < mistakeRate) {
    return randomWalk(maze, ghost);
  }

  switch (algorithm) {
    case 'dfs': {
      const blinkyD = ghosts.find(g => g.name === 'blinky');
      const targetD = getPersonalityTarget(ghost, pacman, blinkyD?.pos ?? pacman.pos, maze);
      return dfs(maze, ghost.pos, targetD, ghost.direction);
    }

    case 'random':
      return randomWalk(maze, ghost);

    case 'bfs': {
      const blinkyB = ghosts.find(g => g.name === 'blinky');
      const targetB = getPersonalityTarget(ghost, pacman, blinkyB?.pos ?? pacman.pos, maze);
      return bfs(maze, ghost.pos, targetB, ghost.direction);
    }

    case 'astar': {
      const blinkyA = ghosts.find(g => g.name === 'blinky');
      const targetA = getPersonalityTarget(ghost, pacman, blinkyA?.pos ?? pacman.pos, maze);
      return astar(maze, ghost.pos, targetA, ghost.direction);
    }

    case 'astar-predictive': {
      const blinky = ghosts.find(g => g.name === 'blinky');
      const target = getPersonalityTarget(
        ghost,
        pacman,
        blinky?.pos ?? pacman.pos,
        maze,
      );
      return astar(maze, ghost.pos, target, ghost.direction);
    }

    default:
      return randomWalk(maze, ghost);
  }
}
