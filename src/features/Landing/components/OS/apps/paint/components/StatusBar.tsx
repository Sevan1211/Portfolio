import React from 'react';
import { TOOL_META } from '../core/constants';
import { ToolType } from '../core/types';

interface StatusBarProps {
  tool: ToolType;
  cursorPos: { x: number; y: number } | null;
  docSize: { width: number; height: number } | null;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  tool,
  cursorPos,
  docSize,
}) => (
  <div className="paint-status">
    <span className="paint-status__hint">{TOOL_META[tool].hint}</span>
    <span className="paint-status__pos">
      {cursorPos ? `${cursorPos.x}, ${cursorPos.y}` : ''}
    </span>
    <span className="paint-status__size">
      {docSize ? `${docSize.width} × ${docSize.height}px` : ''}
    </span>
  </div>
);
