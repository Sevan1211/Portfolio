/* ══════════════════════════════════════
   Pac-Man – Canvas Renderer
   ══════════════════════════════════════
   Draws the maze, Pac-Man, ghosts, and
   dots onto an HTML5 <canvas>.
*/

import {
  GameState, Tile, Direction, GhostState,
} from '../core/types';
import { TILE_SIZE, COLORS, FRIGHTENED_DURATION } from '../core/constants';

const TWO_PI = Math.PI * 2;
const HALF_TILE = TILE_SIZE / 2;

/* ── Direction → rotation angle ────── */
const DIR_ANGLE: Record<Direction, number> = {
  right: 0,
  down: Math.PI / 2,
  left: Math.PI,
  up: -Math.PI / 2,
};

/* ── Draw the full frame ───────────── */
export function renderFrame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
): void {
  const { maze, mazeWidth, mazeHeight } = state;
  const w = mazeWidth * TILE_SIZE;
  const h = mazeHeight * TILE_SIZE;

  // Clear
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, w, h);

  // Maze
  drawMaze(ctx, maze, mazeWidth, mazeHeight);

  if (state.phase === 'dying') {
    // Draw dying Pac-Man animation
    drawPacmanDying(ctx, state);
    return;
  }

  if (state.phase === 'level-complete') {
    // Flash maze walls
    drawPacman(ctx, state);
    return;
  }

  // Dots & pellets
  drawDots(ctx, maze, mazeWidth, mazeHeight, state.frameCount);

  // Ghosts (draw all, including those waiting in the house)
  for (const ghost of state.ghosts) {
    drawGhost(ctx, ghost, state.frameCount);
  }

  // Pac-Man
  drawPacman(ctx, state);
}

/* ── Maze walls ────────────────────── */
function drawMaze(
  ctx: CanvasRenderingContext2D,
  maze: Tile[][],
  width: number,
  height: number,
): void {
  ctx.strokeStyle = COLORS.wallStroke;
  ctx.lineWidth = 2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (maze[y]![x] === Tile.WALL) {
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        // Fill
        ctx.fillStyle = COLORS.wall;
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

        // Draw edges only where adjacent to non-wall
        drawWallEdges(ctx, maze, x, y, px, py, width, height);
      }
    }
  }
}

function drawWallEdges(
  ctx: CanvasRenderingContext2D,
  maze: Tile[][],
  x: number, y: number,
  px: number, py: number,
  width: number, height: number,
): void {
  const isWall = (cx: number, cy: number) => {
    if (cx < 0 || cx >= width || cy < 0 || cy >= height) return true;
    return maze[cy]![cx] === Tile.WALL;
  };

  ctx.beginPath();
  // Top edge
  if (!isWall(x, y - 1)) {
    ctx.moveTo(px, py + 1);
    ctx.lineTo(px + TILE_SIZE, py + 1);
  }
  // Bottom edge
  if (!isWall(x, y + 1)) {
    ctx.moveTo(px, py + TILE_SIZE - 1);
    ctx.lineTo(px + TILE_SIZE, py + TILE_SIZE - 1);
  }
  // Left edge
  if (!isWall(x - 1, y)) {
    ctx.moveTo(px + 1, py);
    ctx.lineTo(px + 1, py + TILE_SIZE);
  }
  // Right edge
  if (!isWall(x + 1, y)) {
    ctx.moveTo(px + TILE_SIZE - 1, py);
    ctx.lineTo(px + TILE_SIZE - 1, py + TILE_SIZE);
  }
  ctx.stroke();
}

/* ── Dots & Power Pellets ──────────── */
function drawDots(
  ctx: CanvasRenderingContext2D,
  maze: Tile[][],
  width: number,
  height: number,
  frame: number,
): void {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = maze[y]![x];
      const cx = x * TILE_SIZE + HALF_TILE;
      const cy = y * TILE_SIZE + HALF_TILE;

      if (tile === Tile.DOT) {
        ctx.fillStyle = COLORS.dot;
        ctx.beginPath();
        ctx.arc(cx, cy, 2.5, 0, TWO_PI);
        ctx.fill();
      } else if (tile === Tile.POWER_PELLET) {
        // Pulsing power pellet
        const pulse = Math.sin(frame * 0.1) * 0.3 + 0.7;
        ctx.fillStyle = COLORS.powerPellet;
        ctx.globalAlpha = pulse;
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, TWO_PI);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }
}

/* ── Pac-Man ───────────────────────── */
function drawPacman(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { pacman } = state;
  const cx = pacman.pixelPos.x;
  const cy = pacman.pixelPos.y;
  const radius = TILE_SIZE * 0.45;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(DIR_ANGLE[pacman.direction]);

  const mouthAngle = pacman.mouthOpen ? 0.25 * Math.PI : 0.05 * Math.PI;

  ctx.fillStyle = COLORS.pacman;
  ctx.beginPath();
  ctx.arc(0, 0, radius, mouthAngle, TWO_PI - mouthAngle);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawPacmanDying(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { pacman, dyingTimer } = state;
  const cx = pacman.pixelPos.x;
  const cy = pacman.pixelPos.y;
  const radius = TILE_SIZE * 0.45;

  // Shrinking animation
  const progress = 1 - dyingTimer / 90;
  const angle = progress * Math.PI;

  ctx.fillStyle = COLORS.pacman;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, angle, TWO_PI - angle);
  ctx.lineTo(cx, cy);
  ctx.closePath();
  ctx.fill();
}

/* ── Ghosts ────────────────────────── */
const GHOST_COLORS: Record<string, string> = {
  blinky: COLORS.ghostBlinky,
  pinky: COLORS.ghostPinky,
  inky: COLORS.ghostInky,
  clyde: COLORS.ghostClyde,
};

function drawGhost(
  ctx: CanvasRenderingContext2D,
  ghost: GhostState,
  frame: number,
): void {
  const cx = ghost.pixelPos.x;
  const cy = ghost.pixelPos.y;
  const r = TILE_SIZE * 0.45;

  const isFrightened = ghost.mode === 'frightened';
  const isFlashing = isFrightened && ghost.frightenedTimer < FRIGHTENED_DURATION * 0.3;

  // Body color
  if (isFrightened) {
    ctx.fillStyle = isFlashing && Math.floor(frame / 10) % 2 === 0
      ? '#FFFFFF'
      : COLORS.ghostFrightened;
  } else {
    ctx.fillStyle = GHOST_COLORS[ghost.name] ?? COLORS.ghostBlinky;
  }

  // Ghost body shape
  ctx.beginPath();
  ctx.arc(cx, cy - r * 0.15, r, Math.PI, 0, false);

  // Bottom with wavy skirt
  const bottom = cy + r * 0.85;
  const waveOffset = (frame % 20) < 10 ? 0 : 1;
  const segments = 4;
  const segW = (r * 2) / segments;

  ctx.lineTo(cx + r, bottom);
  for (let i = segments - 1; i >= 0; i--) {
    const sx = cx - r + segW * i + segW / 2;
    const sy = bottom - ((i + waveOffset) % 2 === 0 ? r * 0.3 : 0);
    ctx.lineTo(sx, sy);
  }
  ctx.lineTo(cx - r, bottom);
  ctx.closePath();
  ctx.fill();

  // Eyes
  if (isFrightened) {
    drawFrightenedFace(ctx, cx, cy, r);
  } else {
    drawGhostEyes(ctx, cx, cy, r, ghost.direction);
  }
}

function drawGhostEyes(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  direction: Direction,
): void {
  const eyeR = r * 0.25;
  const pupilR = r * 0.13;
  const eyeY = cy - r * 0.15;

  // Pupil offset based on direction
  const offsetMap: Record<Direction, { x: number; y: number }> = {
    up:    { x: 0, y: -pupilR * 0.6 },
    down:  { x: 0, y:  pupilR * 0.6 },
    left:  { x: -pupilR * 0.6, y: 0 },
    right: { x:  pupilR * 0.6, y: 0 },
  };
  const offset = offsetMap[direction];

  for (const side of [-1, 1]) {
    const ex = cx + side * r * 0.3;

    // White
    ctx.fillStyle = COLORS.ghostEyes;
    ctx.beginPath();
    ctx.arc(ex, eyeY, eyeR, 0, TWO_PI);
    ctx.fill();

    // Pupil
    ctx.fillStyle = COLORS.ghostPupil;
    ctx.beginPath();
    ctx.arc(ex + offset.x, eyeY + offset.y, pupilR, 0, TWO_PI);
    ctx.fill();
  }
}

function drawFrightenedFace(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
): void {
  ctx.fillStyle = COLORS.ghostFrightenedFace;
  const eyeY = cy - r * 0.15;
  const eyeR = r * 0.12;

  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(cx + side * r * 0.25, eyeY, eyeR, 0, TWO_PI);
    ctx.fill();
  }

  // Squiggly mouth
  ctx.strokeStyle = COLORS.ghostFrightenedFace;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  const mouthY = cy + r * 0.2;
  ctx.moveTo(cx - r * 0.35, mouthY);
  for (let i = 0; i < 4; i++) {
    const mx = cx - r * 0.35 + (r * 0.7 / 4) * (i + 0.5);
    const my = mouthY + (i % 2 === 0 ? -2 : 2);
    ctx.lineTo(mx, my);
  }
  ctx.lineTo(cx + r * 0.35, mouthY);
  ctx.stroke();
}
