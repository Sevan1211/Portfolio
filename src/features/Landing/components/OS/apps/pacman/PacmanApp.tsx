import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GameState, Direction } from './core/types';
import { initGame, initLevel, tick, togglePause } from './core/gameEngine';
import { saveScore } from './core/scores';
import { TICK_RATE } from './core/constants';
import { GameCanvas } from './components/GameCanvas';
import { Sidebar } from './components/Sidebar';
import { StartScreen } from './components/StartScreen';
import { WinScreen } from './components/WinScreen';
import { GameOverScreen } from './components/GameOverScreen';
import './styles/index.css';

const KEY_MAP: Record<string, Direction> = {
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

export const PacmanApp: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(initGame);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<Direction | null>(null);
  const loopRef = useRef<number | null>(null);
  const savedRef = useRef(false);

  /* ── Game loop ──────────────────── */
  const gameLoop = useCallback(() => {
    setGameState(prev => {
      const next = tick(prev, inputRef.current);
      // Clear input after consumption (allow holding for continuous movement)
      return next;
    });
    loopRef.current = window.setTimeout(gameLoop, TICK_RATE);
  }, []);

  const startLoop = useCallback(() => {
    if (loopRef.current) return;
    gameLoop();
  }, [gameLoop]);

  const stopLoop = useCallback(() => {
    if (loopRef.current) {
      clearTimeout(loopRef.current);
      loopRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopLoop();
  }, [stopLoop]);

  /* ── Input: scoped to the app, like a real Win95 program ── */
  const focusGame = useCallback(() => {
    containerRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    focusGame();
  }, [focusGame]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const dir = KEY_MAP[e.key];
    if (dir) {
      e.preventDefault();
      inputRef.current = dir;
      return;
    }
    if (e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      setGameState(togglePause);
    }
  }, []);

  /* Focus leaving the app (another window, the titlebar) pauses the game
     instead of letting it play on unseen. */
  const handleBlur = useCallback((e: React.FocusEvent) => {
    if (containerRef.current?.contains(e.relatedTarget as Node)) return;
    setGameState(prev =>
      prev.phase === 'playing' ? { ...prev, phase: 'paused' } : prev,
    );
  }, []);

  /* A hidden browser tab must not keep eating lives either. */
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        setGameState(prev =>
          prev.phase === 'playing' ? { ...prev, phase: 'paused' } : prev,
        );
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  /* ── Handle start ───────────────── */
  const handleStart = useCallback(() => {
    savedRef.current = false;
    const state = initLevel(1, 0, 3);
    setGameState(state);
    startLoop();
    focusGame();
  }, [startLoop, focusGame]);

  /* ── Handle restart ─────────────── */
  const handleRestart = useCallback(() => {
    stopLoop();
    savedRef.current = false;
    const state = initGame();
    setGameState(state);
    focusGame();
  }, [stopLoop, focusGame]);

  /* ── Save score on game end ─────── */
  useEffect(() => {
    if (
      (gameState.phase === 'win' || gameState.phase === 'game-over') &&
      !savedRef.current &&
      gameState.score > 0
    ) {
      savedRef.current = true;
      saveScore(gameState.score, gameState.level);
      stopLoop();
    }
  }, [gameState.phase, gameState.score, gameState.level, stopLoop]);

  /* ── Render ─────────────────────── */
  return (
    <div
      ref={containerRef}
      className="app-content pm-app w95-ui"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onPointerDown={focusGame}
    >
      {gameState.phase === 'start' && (
        <StartScreen onStart={handleStart} />
      )}

      {gameState.phase === 'win' && (
        <WinScreen score={gameState.score} onRestart={handleRestart} />
      )}

      {gameState.phase === 'game-over' && (
        <GameOverScreen
          score={gameState.score}
          level={gameState.level}
          onRestart={handleRestart}
        />
      )}

      <div className="pm-layout">
        <div className="pm-game-area">
          <GameCanvas state={gameState} />
        </div>
        <Sidebar state={gameState} />
      </div>
    </div>
  );
};
