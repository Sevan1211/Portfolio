import React from 'react';
import { GameState, ALGORITHM_LABELS } from '../core/types';
import { getTopScore } from '../core/scores';

interface SidebarProps {
  state: GameState;
}

export const Sidebar: React.FC<SidebarProps> = ({ state }) => {
  const highScore = getTopScore();

  return (
    <div className="pm-sidebar">
      {/* Score */}
      <div className="pm-sidebar__section">
        <div className="pm-sidebar__label">SCORE</div>
        <div className="pm-sidebar__value pm-sidebar__value--score">
          {String(state.score).padStart(6, '0')}
        </div>
      </div>

      {/* High Score */}
      <div className="pm-sidebar__section">
        <div className="pm-sidebar__label">HIGH SCORE</div>
        <div className="pm-sidebar__value pm-sidebar__value--high">
          {String(Math.max(highScore, state.score)).padStart(6, '0')}
        </div>
      </div>

      {/* Level */}
      <div className="pm-sidebar__section">
        <div className="pm-sidebar__label">LEVEL</div>
        <div className="pm-sidebar__value">{state.level} / 4</div>
      </div>

      {/* Lives */}
      <div className="pm-sidebar__section">
        <div className="pm-sidebar__label">LIVES</div>
        <div className="pm-sidebar__lives">
          {Array.from({ length: state.lives }).map((_, i) => (
            <span key={i} className="pm-sidebar__life">
              {/* Pac-Man icon */}
              <svg width="18" height="18" viewBox="0 0 20 20">
                <path
                  d="M10 0 A10 10 0 1 1 10 20 A10 10 0 1 1 10 0 Z"
                  fill="#FFFF00"
                />
                <path
                  d="M10 10 L20 4 L20 16 Z"
                  fill="#000"
                />
              </svg>
            </span>
          ))}
        </div>
      </div>

      {/* Ghost AI */}
      <div className="pm-sidebar__section">
        <div className="pm-sidebar__label">GHOST AI</div>
        <div className="pm-sidebar__value pm-sidebar__value--ai">
          {ALGORITHM_LABELS[state.algorithm]}
        </div>
      </div>

      {/* Level indicator dots */}
      <div className="pm-sidebar__section">
        <div className="pm-sidebar__label">PROGRESS</div>
        <div className="pm-sidebar__levels">
          {[1, 2, 3, 4].map(l => (
            <div
              key={l}
              className={`pm-sidebar__level-dot ${l <= state.level ? 'active' : ''} ${l === state.level ? 'current' : ''}`}
            >
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
