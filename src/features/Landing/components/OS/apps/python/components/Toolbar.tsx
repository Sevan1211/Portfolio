import React from 'react';
import { PyStatus } from '../core/types';

interface ToolbarProps {
  status: PyStatus;
  onRun: () => void;
  onClear: () => void;
}

/**
 * Win95-style toolbar with Run and Clear buttons + status indicator.
 */
export const Toolbar: React.FC<ToolbarProps> = ({ status, onRun, onClear }) => {
  const canRun = status === 'ready';

  const statusLabel: Record<PyStatus, string> = {
    idle: 'Starting...',
    loading: 'Loading Python...',
    ready: 'Ready',
    running: 'Running...',
  };

  return (
    <div className="py-toolbar">
      <button
        className="py-toolbar__btn"
        disabled={!canRun}
        onClick={onRun}
        title="Run (Ctrl+Enter)"
      >
        ▶ Run
      </button>
      <button
        className="py-toolbar__btn"
        onClick={onClear}
        title="Clear output"
      >
        ✕ Clear
      </button>

      <div className="py-toolbar__spacer" />

      <div className="py-toolbar__status">
        <span
          className={`py-toolbar__dot py-toolbar__dot--${status}`}
        />
        {statusLabel[status]}
      </div>
    </div>
  );
};
