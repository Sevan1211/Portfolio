import React from 'react';
import { isHighScore } from '../core/scores';

interface WinScreenProps {
  score: number;
  onRestart: () => void;
}

export const WinScreen: React.FC<WinScreenProps> = ({ score, onRestart }) => {
  const newHigh = isHighScore(score);

  return (
    <div className="pm-overlay">
      <div className="pm-overlay__box">
        <h1 className="pm-title pm-title--win">YOU WIN!</h1>
        <p className="pm-subtitle">All 4 levels cleared!</p>

        <div className="pm-final-score">
          <span className="pm-final-score__label">FINAL SCORE</span>
          <span className="pm-final-score__value">
            {String(score).padStart(6, '0')}
          </span>
          {newHigh && <span className="pm-final-score__badge">★ NEW HIGH SCORE ★</span>}
        </div>

        <button className="pm-start-btn" onClick={onRestart}>
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
};
