import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GameState, Direction } from './core/types';
import { initGame, initLevel, tick } from './core/gameEngine';
import { saveScore } from './core/scores';
import { TICK_RATE } from './core/constants';
import { GameCanvas } from './components/GameCanvas';
import { Sidebar } from './components/Sidebar';
import { StartScreen } from './components/StartScreen';
import { WinScreen } from './components/WinScreen';
import { GameOverScreen } from './components/GameOverScreen';
import './styles/index.css';

export const PacmanApp: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(initGame);
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

  /* ── Handle input ───────────────── */
  const handleInput = useCallback((dir: Direction) => {
    inputRef.current = dir;
  }, []);

  /* ── Handle start ───────────────── */
  const handleStart = useCallback(() => {
    savedRef.current = false;
    const state = initLevel(1, 0, 3);
    setGameState(state);
    startLoop();
  }, [startLoop]);

  /* ── Handle restart ─────────────── */
  const handleRestart = useCallback(() => {
    stopLoop();
    savedRef.current = false;
    const state = initGame();
    setGameState(state);
  }, [stopLoop]);

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
    <div className="app-content pm-app">
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
          <GameCanvas state={gameState} onInput={handleInput} />
        </div>
        <Sidebar state={gameState} />
      </div>
    </div>
  );
};
