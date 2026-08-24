import React, { useRef, useEffect } from 'react';
import { GameState } from '../core/types';
import { TILE_SIZE } from '../core/constants';
import { renderFrame } from '../core/renderer';

interface GameCanvasProps {
  state: GameState;
}

/** Pure render surface - input is handled by the app container. */
export const GameCanvas: React.FC<GameCanvasProps> = ({ state }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const width = state.mazeWidth * TILE_SIZE;
  const height = state.mazeHeight * TILE_SIZE;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    renderFrame(ctx, state);
  }, [state]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="pm-canvas"
      aria-label="Pac-Man maze"
    />
  );
};
