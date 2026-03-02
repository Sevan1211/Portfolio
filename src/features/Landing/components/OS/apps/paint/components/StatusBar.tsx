import React from 'react';
import { TOOL_META } from '../core/constants';
import { ToolType } from '../core/types';

interface StatusBarProps {
  tool: ToolType;
  cursorPos: { x: number; y: number } | null;
  canvasSize: { width: number; height: number };
}

export const StatusBar: React.FC<StatusBarProps> = ({
  tool,
  cursorPos,
  canvasSize,
}) => (
  <div className="paint-status">
    <span className="paint-status__tool">
      {TOOL_META[tool]?.label ?? tool}
    </span>
    <span className="paint-status__pos">
      {cursorPos
        ? `${cursorPos.x}, ${cursorPos.y}px`
        : '—'}
    </span>
    <span className="paint-status__size">
      {canvasSize.width} × {canvasSize.height}px
    </span>
  </div>
);
