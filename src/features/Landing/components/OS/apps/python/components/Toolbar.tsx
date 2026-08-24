import React from 'react';
import { PyStatus } from '../core/types';
import { EXAMPLES } from '../core/examples';

interface ToolbarProps {
  status: PyStatus;
  stdinOpen: boolean;
  onRun: () => void;
  onStop: () => void;
  onClear: () => void;
  onToggleStdin: () => void;
  onLoadExample: (id: string) => void;
}

/**
 * Command strip: Run / Stop / Clear, the examples picker, and the
 * Stdin panel toggle.
 */
export const Toolbar: React.FC<ToolbarProps> = ({
  status,
  stdinOpen,
  onRun,
  onStop,
  onClear,
  onToggleStdin,
  onLoadExample,
}) => (
  <div className="py-toolbar">
    <button
      type="button"
      className="py-btn py-btn--run"
      disabled={status !== 'ready'}
      onClick={onRun}
      title="Run (Ctrl+Enter)"
    >
      ▶ Run
    </button>
    <button
      type="button"
      className="py-btn"
      disabled={status !== 'running'}
      onClick={onStop}
      title="Stop the running program"
    >
      ■ Stop
    </button>
    <button
      type="button"
      className="py-btn"
      onClick={onClear}
      title="Clear the output panel"
    >
      Clear
    </button>

    <span className="py-toolbar__sep" aria-hidden="true" />

    <label className="py-toolbar__examples">
      Examples
      <select
        className="py-select"
        value=""
        onChange={(e) => {
          if (e.target.value) onLoadExample(e.target.value);
        }}
        aria-label="Load an example program"
      >
        <option value="" disabled>
          Load…
        </option>
        {EXAMPLES.map((example) => (
          <option key={example.id} value={example.id}>
            {example.label}
          </option>
        ))}
      </select>
    </label>

    <button
      type="button"
      className={`py-btn${stdinOpen ? ' py-btn--pressed' : ''}`}
      onClick={onToggleStdin}
      aria-pressed={stdinOpen}
      title="Show the stdin panel; input() reads from it line by line"
    >
      Stdin
    </button>
  </div>
);
