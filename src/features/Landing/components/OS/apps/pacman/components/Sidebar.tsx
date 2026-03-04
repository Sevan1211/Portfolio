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
      {/* Score panel */}
      <div className="pm-panel">
        <div className="pm-panel__title">Score</div>
        <div className="pm-panel__inset">
          <span className="pm-score">{String(state.score).padStart(6, '0')}</span>
        </div>
      </div>

      {/* High Score panel */}
      <div className="pm-panel">
        <div className="pm-panel__title">Hi-Score</div>
        <div className="pm-panel__inset">
          <span className="pm-score pm-score--hi">
            {String(Math.max(highScore, state.score)).padStart(6, '0')}
          </span>
        </div>
      </div>

      {/* Level panel */}
      <div className="pm-panel">
        <div className="pm-panel__title">Level</div>
        <div className="pm-panel__inset">
          <div className="pm-level-pips">
            {[1, 2, 3, 4].map(l => (
              <div
                key={l}
                className={`pm-pip ${l <= state.level ? 'pm-pip--filled' : ''} ${l === state.level ? 'pm-pip--current' : ''}`}
              />
            ))}
          </div>
          <span className="pm-level-text">{state.level} / 4</span>
        </div>
      </div>

      {/* Lives panel */}
      <div className="pm-panel">
        <div className="pm-panel__title">Lives</div>
        <div className="pm-panel__inset">
          <div className="pm-lives">
            {Array.from({ length: state.lives }).map((_, i) => (
              <span key={i} className="pm-life">◖</span>
            ))}
            {state.lives === 0 && <span className="pm-life pm-life--none">—</span>}
          </div>
        </div>
      </div>

      {/* Ghost AI panel */}
      <div className="pm-panel">
        <div className="pm-panel__title">Ghost AI</div>
        <div className="pm-panel__inset">
          <span className="pm-ai-label">{ALGORITHM_LABELS[state.algorithm]}</span>
        </div>
      </div>
    </div>
  );
};
