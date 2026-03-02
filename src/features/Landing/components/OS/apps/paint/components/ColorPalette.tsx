import React from 'react';
import { COLOR_PALETTE } from '../core/constants';

interface ColorPaletteProps {
  activeColor: string;
  onColorChange: (color: string) => void;
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  activeColor,
  onColorChange,
}) => (
  <div className="paint-palette">
    {/* Current color preview */}
    <div className="paint-palette__preview">
      <div
        className="paint-palette__current"
        style={{ background: activeColor }}
        title={activeColor}
      />
    </div>

    {/* Color grid */}
    <div className="paint-palette__grid">
      {COLOR_PALETTE.map((hex) => (
        <button
          key={hex}
          className={`paint-palette__swatch${activeColor === hex ? ' paint-palette__swatch--active' : ''}`}
          style={{ background: hex }}
          title={hex}
          onClick={() => onColorChange(hex)}
        />
      ))}
    </div>
  </div>
);
