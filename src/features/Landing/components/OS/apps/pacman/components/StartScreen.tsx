import React from 'react';
import { getHighScores } from '../core/scores';

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const scores = getHighScores();

  return (
    <div className="pm-overlay">
      <div className="pm-overlay__box">
        {/* Title */}
        <h1 className="pm-title">PAC-MAN</h1>
        <p className="pm-subtitle">Ghost AI Challenge</p>

        {/* Level preview */}
        <div className="pm-level-preview">
          <div className="pm-level-preview__item">
            <span className="pm-level-preview__num">1</span>
            <span className="pm-level-preview__algo">Random Walk</span>
          </div>
          <div className="pm-level-preview__item">
            <span className="pm-level-preview__num">2</span>
            <span className="pm-level-preview__algo">BFS</span>
          </div>
          <div className="pm-level-preview__item">
            <span className="pm-level-preview__num">3</span>
            <span className="pm-level-preview__algo">A* Search</span>
          </div>
          <div className="pm-level-preview__item">
            <span className="pm-level-preview__num">4</span>
            <span className="pm-level-preview__algo">A* Predictive</span>
          </div>
        </div>

        {/* Controls */}
        <div className="pm-controls-info">
          <p>Arrow Keys or WASD to move</p>
        </div>

        {/* Start button */}
        <button className="pm-start-btn" onClick={onStart}>
          PRESS START
        </button>

        {/* High scores */}
        {scores.length > 0 && (
          <div className="pm-high-scores">
            <h3>HIGH SCORES</h3>
            <div className="pm-high-scores__list">
              {scores.slice(0, 5).map((s, i) => (
                <div key={i} className="pm-high-scores__row">
                  <span className="pm-high-scores__rank">{i + 1}.</span>
                  <span className="pm-high-scores__score">
                    {String(s.score).padStart(6, '0')}
                  </span>
                  <span className="pm-high-scores__level">LVL {s.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
