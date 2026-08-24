import React from 'react';
import {
  RetroPencil,
  RetroBrush,
  RetroSpray,
  RetroEraser,
  RetroFill,
  RetroPicker,
  RetroLine,
  RetroRect,
  RetroRoundRect,
  RetroEllipse,
} from '../../../components/icons/RetroIcons';
import { ToolType, ShapeFillMode } from '../core/types';
import { BRUSH_SIZES, SHAPE_TOOLS, SIZED_TOOLS, TOOL_META } from '../core/constants';

interface ToolBoxProps {
  activeTool: ToolType;
  brushSize: number;
  fillMode: ShapeFillMode;
  onToolChange: (tool: ToolType) => void;
  onBrushSizeChange: (size: number) => void;
  onFillModeChange: (mode: ShapeFillMode) => void;
}

/** Classic MS Paint order: freehand row by row, then shapes. */
const TOOLS: ToolType[] = [
  'pencil', 'brush',
  'spray', 'eraser',
  'fill', 'picker',
  'line', 'rect',
  'roundrect', 'ellipse',
];

const TOOL_ICONS: Record<ToolType, React.ReactNode> = {
  pencil: <RetroPencil size={16} />,
  brush: <RetroBrush size={16} />,
  spray: <RetroSpray size={16} />,
  eraser: <RetroEraser size={16} />,
  fill: <RetroFill size={16} />,
  picker: <RetroPicker size={16} />,
  line: <RetroLine size={16} />,
  rect: <RetroRect size={16} />,
  roundrect: <RetroRoundRect size={16} />,
  ellipse: <RetroEllipse size={16} />,
};

const FILL_MODES: { mode: ShapeFillMode; title: string }[] = [
  { mode: 'stroke', title: 'Outline only' },
  { mode: 'both', title: 'Outline with background fill' },
  { mode: 'fill', title: 'Solid foreground' },
];

/**
 * The left-hand tool box: a 2-column tool grid over the options well,
 * exactly where MS Paint kept them. The options well shows stroke
 * widths for sized tools and fill modes for shape tools.
 */
export const ToolBox: React.FC<ToolBoxProps> = ({
  activeTool,
  brushSize,
  fillMode,
  onToolChange,
  onBrushSizeChange,
  onFillModeChange,
}) => {
  const showSizes = SIZED_TOOLS.has(activeTool);
  const showFillModes = SHAPE_TOOLS.has(activeTool);

  return (
    <div className="paint-toolbox">
      <div className="paint-toolbox__grid" role="toolbar" aria-label="Tools">
        {TOOLS.map((t) => (
          <button
            key={t}
            type="button"
            className={`paint-tool-btn${activeTool === t ? ' paint-tool-btn--active' : ''}`}
            title={TOOL_META[t].label}
            aria-label={TOOL_META[t].label}
            aria-pressed={activeTool === t}
            onClick={() => onToolChange(t)}
          >
            {TOOL_ICONS[t]}
          </button>
        ))}
      </div>

      {/* Options well - contents follow the active tool */}
      <div className="paint-options">
        {showSizes && (
          <div className="paint-options__sizes">
            {BRUSH_SIZES.map((s) => (
              <button
                key={s}
                type="button"
                className={`paint-size-btn${brushSize === s ? ' paint-size-btn--active' : ''}`}
                title={`${s} px`}
                aria-pressed={brushSize === s}
                onClick={() => onBrushSizeChange(s)}
              >
                <span
                  className="paint-size-bar"
                  style={{ height: Math.min(s, 10) }}
                />
              </button>
            ))}
          </div>
        )}

        {showFillModes && (
          <div className="paint-options__fills">
            {FILL_MODES.map(({ mode, title }) => (
              <button
                key={mode}
                type="button"
                className={`paint-fill-btn${fillMode === mode ? ' paint-fill-btn--active' : ''}`}
                title={title}
                aria-pressed={fillMode === mode}
                onClick={() => onFillModeChange(mode)}
              >
                <span className={`paint-fill-glyph paint-fill-glyph--${mode}`} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
