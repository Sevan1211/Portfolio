import React, { useRef, useEffect, useCallback } from 'react';
import { GameState, Direction } from '../core/types';
import { TILE_SIZE } from '../core/constants';
import { renderFrame } from '../core/renderer';

interface GameCanvasProps {
  state: GameState;
  onInput: (dir: Direction) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ state, onInput }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const width = state.mazeWidth * TILE_SIZE;
  const height = state.mazeHeight * TILE_SIZE;

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    renderFrame(ctx, state);
  }, [state]);

  // Keyboard input
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't intercept when user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const keyMap: Record<string, Direction> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        W: 'up',
        s: 'down',
        S: 'down',
        a: 'left',
        A: 'left',
        d: 'right',
        D: 'right',
      };

      const dir = keyMap[e.key];
      if (dir) {
        e.preventDefault();
        onInput(dir);
      }
    },
    [onInput],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="pm-canvas"
      tabIndex={0}
    />
  );
};
