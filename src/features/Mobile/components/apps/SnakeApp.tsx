import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";

const COLS = 15;
const CELL = 16;
const SIZE = COLS * CELL;
const TICK_MS = 140;

type Dir = "up" | "down" | "left" | "right";
type Phase = "ready" | "running" | "over";

const OPPOSITE: Record<Dir, Dir> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};
const DELTA: Record<Dir, [number, number]> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

const HS_KEY = "rp-snake-highscore";

function readHighScore(): number {
  try {
    return Number(window.localStorage.getItem(HS_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeHighScore(score: number): void {
  try {
    window.localStorage.setItem(HS_KEY, String(score));
  } catch {
    /* private mode; the score just lives fast and dies young */
  }
}

/**
 * Snake on a green LCD, the phone-native cousin of the desktop Pac-Man.
 * Swipe on the screen, use the on-screen keys, or arrow keys on a keyboard.
 */
export const SnakeApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snakeRef = useRef<[number, number][]>([]);
  const dirRef = useRef<Dir>("right");
  const queueRef = useRef<Dir[]>([]);
  const foodRef = useRef<[number, number]>([10, 7]);
  const touchStart = useRef<[number, number] | null>(null);

  const [phase, setPhase] = useState<Phase>("ready");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(readHighScore);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#9bbc0f";
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = "#0f380f";
    for (const [x, y] of snakeRef.current) {
      ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
    }
    if (snakeRef.current.length > 0) {
      const [fx, fy] = foodRef.current;
      ctx.fillRect(fx * CELL + 3, fy * CELL + 3, CELL - 6, CELL - 6);
      ctx.strokeStyle = "#0f380f";
      ctx.strokeRect(fx * CELL + 1.5, fy * CELL + 1.5, CELL - 3, CELL - 3);
    }
  }, []);

  const placeFood = useCallback(() => {
    const taken = new Set(snakeRef.current.map(([x, y]) => `${x},${y}`));
    let x = 0;
    let y = 0;
    do {
      x = Math.floor(Math.random() * COLS);
      y = Math.floor(Math.random() * COLS);
    } while (taken.has(`${x},${y}`));
    foodRef.current = [x, y];
  }, []);

  const start = useCallback(() => {
    snakeRef.current = [
      [4, 7],
      [3, 7],
      [2, 7],
    ];
    dirRef.current = "right";
    queueRef.current = [];
    setScore(0);
    placeFood();
    setPhase("running");
  }, [placeFood]);

  const turn = useCallback((dir: Dir) => {
    const last =
      queueRef.current[queueRef.current.length - 1] ?? dirRef.current;
    if (dir !== last && dir !== OPPOSITE[last]) {
      queueRef.current.push(dir);
    }
  }, []);

  useEffect(() => {
    if (phase !== "running") {
      draw();
      return;
    }
    const id = setInterval(() => {
      const next = queueRef.current.shift();
      if (next) dirRef.current = next;
      const [dx, dy] = DELTA[dirRef.current];
      const head = snakeRef.current[0];
      if (!head) return;
      const [hx, hy] = head;
      const nx = hx + dx;
      const ny = hy + dy;

      const hitWall = nx < 0 || ny < 0 || nx >= COLS || ny >= COLS;
      const hitSelf = snakeRef.current.some(([x, y]) => x === nx && y === ny);
      if (hitWall || hitSelf) {
        setPhase("over");
        setScore((s) => {
          if (s > readHighScore()) {
            writeHighScore(s);
            setHighScore(s);
          }
          return s;
        });
        return;
      }

      snakeRef.current.unshift([nx, ny]);
      const [fx, fy] = foodRef.current;
      if (nx === fx && ny === fy) {
        setScore((s) => s + 10);
        placeFood();
      } else {
        snakeRef.current.pop();
      }
      draw();
    }, TICK_MS);
    return () => clearInterval(id);
  }, [phase, draw, placeFood]);

  useEffect(() => {
    draw();
    if (phase === "running") return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "rgba(15, 56, 15, 0.82)";
    ctx.fillRect(0, SIZE / 2 - 34, SIZE, 68);
    ctx.fillStyle = "#9bbc0f";
    ctx.font = 'bold 15px "Courier New", monospace';
    ctx.textAlign = "center";
    ctx.fillText(
      phase === "ready" ? "SNAKE" : "GAME OVER",
      SIZE / 2,
      SIZE / 2 - 8,
    );
    ctx.font = '12px "Courier New", monospace';
    ctx.fillText("tap screen to play", SIZE / 2, SIZE / 2 + 14);
  }, [phase, draw]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      };
      const dir = map[e.key];
      if (!dir) return;
      e.preventDefault();
      turn(dir);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [turn]);

  const onPointerDown = (e: React.PointerEvent) => {
    touchStart.current = [e.clientX, e.clientY];
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const startPt = touchStart.current;
    touchStart.current = null;
    if (phase !== "running") return;
    if (!startPt) return;
    const dx = e.clientX - startPt[0];
    const dy = e.clientY - startPt[1];
    if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      turn(dx > 0 ? "right" : "left");
    } else {
      turn(dy > 0 ? "down" : "up");
    }
  };

  return (
    <div className="rp-snake">
      <div className="rp-snake-scores">
        <span>Score {score}</span>
        <span>Best {highScore}</span>
      </div>
      <button
        type="button"
        className="rp-snake-screen"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onClick={() => {
          if (phase !== "running") start();
        }}
        onKeyDown={(event) => {
          if (
            phase !== "running" &&
            (event.key === "Enter" || event.key === " ")
          ) {
            event.preventDefault();
            start();
          }
        }}
        aria-label={
          phase === "running"
            ? "Snake game screen. Swipe to steer."
            : "Start Snake game"
        }
      >
        <canvas ref={canvasRef} width={SIZE} height={SIZE} aria-hidden="true" />
      </button>
      <p className="rp-snake-hint">Swipe the screen or use the keys</p>
      <div className="rp-dpad">
        <span />
        <button
          type="button"
          className="rp-dkey"
          aria-label="Up"
          onClick={() => turn("up")}
        >
          <ArrowUp size={20} aria-hidden="true" />
        </button>
        <span />
        <button
          type="button"
          className="rp-dkey"
          aria-label="Left"
          onClick={() => turn("left")}
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="rp-dkey"
          aria-label="Down"
          onClick={() => turn("down")}
        >
          <ArrowDown size={20} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="rp-dkey"
          aria-label="Right"
          onClick={() => turn("right")}
        >
          <ArrowRight size={20} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
