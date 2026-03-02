import React from 'react';
import {
  RetroPencil,
  RetroBrush,
  RetroEraser,
  RetroLine,
  RetroRect,
  RetroEllipse,
  RetroFill,
  RetroPicker,
} from '../../../components/icons/RetroIcons';
import { ToolType } from '../core/types';
import { BRUSH_SIZES, TOOL_META } from '../core/constants';

interface ToolbarProps {
  activeTool: ToolType;
  brushSize: number;
  onToolChange: (tool: ToolType) => void;
  onBrushSizeChange: (size: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onSave: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const TOOL_ICONS: Record<ToolType, React.ReactNode> = {
  pencil:  <RetroPencil size={18} />,
  brush:   <RetroBrush size={18} />,
  eraser:  <RetroEraser size={18} />,
  line:    <RetroLine size={18} />,
  rect:    <RetroRect size={18} />,
  ellipse: <RetroEllipse size={18} />,
  fill:    <RetroFill size={18} />,
  picker:  <RetroPicker size={18} />,
};

const TOOLS: ToolType[] = [
  'pencil', 'brush', 'eraser', 'line',
  'rect', 'ellipse', 'fill', 'picker',
];

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  brushSize,
  onToolChange,
  onBrushSizeChange,
  onUndo,
  onRedo,
  onClear,
  onSave,
  canUndo,
  canRedo,
}) => (
  <div className="paint-toolbar">
    {/* ── Tool buttons ── */}
    <div className="paint-toolbar__section">
      <span className="paint-toolbar__label">Tools</span>
      <div className="paint-toolbar__tools">
        {TOOLS.map((t) => (
          <button
            key={t}
            className={`paint-toolbar__btn${activeTool === t ? ' paint-toolbar__btn--active' : ''}`}
            title={TOOL_META[t]?.label ?? t}
            onClick={() => onToolChange(t)}
          >
            {TOOL_ICONS[t]}
          </button>
        ))}
      </div>
    </div>

    {/* ── Brush size ── */}
    <div className="paint-toolbar__section">
      <span className="paint-toolbar__label">Size</span>
      <div className="paint-toolbar__sizes">
        {BRUSH_SIZES.map((s) => (
          <button
            key={s}
            className={`paint-toolbar__size-btn${brushSize === s ? ' paint-toolbar__size-btn--active' : ''}`}
            title={`${s}px`}
            onClick={() => onBrushSizeChange(s)}
          >
            <span
              className="paint-toolbar__size-dot"
              style={{ width: Math.min(s + 2, 16), height: Math.min(s + 2, 16) }}
            />
          </button>
        ))}
      </div>
    </div>

    {/* ── Actions ── */}
    <div className="paint-toolbar__section">
      <span className="paint-toolbar__label">Actions</span>
      <div className="paint-toolbar__actions">
        <button
          className="paint-toolbar__action-btn"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          Undo
        </button>
        <button
          className="paint-toolbar__action-btn"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          Redo
        </button>
        <button
          className="paint-toolbar__action-btn"
          onClick={onClear}
          title="Clear canvas"
        >
          Clear
        </button>
        <button
          className="paint-toolbar__action-btn paint-toolbar__action-btn--save"
          onClick={onSave}
          title="Save as PNG"
        >
          Save
        </button>
      </div>
    </div>
  </div>
);
