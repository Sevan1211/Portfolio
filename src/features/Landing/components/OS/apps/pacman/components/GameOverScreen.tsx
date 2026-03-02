import React from 'react';

interface GameOverScreenProps {
  score: number;
  level: number;
  onRestart: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, level, onRestart }) => (
  <div className="pm-overlay">
    <div className="pm-overlay__box">
      <h1 className="pm-title pm-title--gameover">GAME OVER</h1>

      <div className="pm-final-score">
        <span className="pm-final-score__label">SCORE</span>
        <span className="pm-final-score__value">
          {String(score).padStart(6, '0')}
        </span>
        <span className="pm-final-score__label">REACHED LEVEL {level}</span>
      </div>

      <button className="pm-start-btn" onClick={onRestart}>
        TRY AGAIN
      </button>
    </div>
  </div>
);
