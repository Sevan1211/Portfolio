import React from 'react';
import { COLOR_PALETTE } from '../core/constants';

interface ColorBarProps {
  fgColor: string;
  bgColor: string;
  onFgChange: (color: string) => void;
  onBgChange: (color: string) => void;
}

/**
 * The bottom color bar, MS Paint style: the overlapping foreground /
 * background indicator on the left, then the 28-swatch grid.
 * Left-click sets the foreground; right-click sets the background.
 */
export const ColorBar: React.FC<ColorBarProps> = ({
  fgColor,
  bgColor,
  onFgChange,
  onBgChange,
}) => (
  <div className="paint-colorbar">
    <div
      className="paint-colorbar__pair"
      title={`Foreground ${fgColor} · Background ${bgColor}`}
    >
      <span
        className="paint-colorbar__swatch paint-colorbar__swatch--bg"
        style={{ background: bgColor }}
      />
      <span
        className="paint-colorbar__swatch paint-colorbar__swatch--fg"
        style={{ background: fgColor }}
      />
    </div>

    <div
      className="paint-colorbar__grid"
      role="listbox"
      aria-label="Colors: left-click for foreground, right-click for background"
    >
      {COLOR_PALETTE.map((hex) => (
        <button
          key={hex}
          type="button"
          className={`paint-swatch${fgColor === hex ? ' paint-swatch--fg' : ''}${
            bgColor === hex ? ' paint-swatch--bg' : ''
          }`}
          style={{ background: hex }}
          title={`${hex} (left: foreground, right: background)`}
          onClick={() => onFgChange(hex)}
          onContextMenu={(e) => {
            e.preventDefault();
            onBgChange(hex);
          }}
        />
      ))}
    </div>
  </div>
);
