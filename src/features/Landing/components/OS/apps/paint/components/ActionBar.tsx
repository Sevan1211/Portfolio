import React from 'react';

interface ActionBarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onSave: () => void;
}

/** Slim command strip standing in for Paint's menu bar. */
export const ActionBar: React.FC<ActionBarProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  onSave,
}) => (
  <div className="paint-actionbar">
    <button
      type="button"
      className="paint-action-btn"
      onClick={onUndo}
      disabled={!canUndo}
      title="Undo (Ctrl+Z)"
    >
      Undo
    </button>
    <button
      type="button"
      className="paint-action-btn"
      onClick={onRedo}
      disabled={!canRedo}
      title="Redo (Ctrl+Y)"
    >
      Redo
    </button>

    <span className="paint-actionbar__sep" aria-hidden="true" />

    <button
      type="button"
      className="paint-action-btn"
      onClick={onClear}
      title="Clear the canvas to the background color"
    >
      Clear
    </button>

    <button
      type="button"
      className="paint-action-btn paint-action-btn--save"
      onClick={onSave}
      title="Save as PNG (Ctrl+S)"
    >
      Save PNG
    </button>
  </div>
);
