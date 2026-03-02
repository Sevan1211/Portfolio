/**
 * Paint App Constants
 */

/** Classic MS Paint 28-color palette */
export const COLOR_PALETTE = [
  // Row 1 – dark colors
  '#000000', '#808080', '#800000', '#808000',
  '#008000', '#008080', '#000080', '#800080',
  '#808040', '#004040', '#0080FF', '#004080',
  '#4000FF', '#804000',
  // Row 2 – light colors
  '#FFFFFF', '#C0C0C0', '#FF0000', '#FFFF00',
  '#00FF00', '#00FFFF', '#0000FF', '#FF00FF',
  '#FFFF80', '#00FF80', '#80FFFF', '#8080FF',
  '#FF0080', '#FF8040',
];

/** Available brush sizes per tool */
export const BRUSH_SIZES = [1, 2, 4, 6, 8, 12, 16];

/** Default canvas fill */
export const DEFAULT_BG = '#FFFFFF';

/** Max undo history depth */
export const MAX_UNDO_STEPS = 30;

/** Tool display metadata */
export const TOOL_META: Record<string, { label: string; cursor: string }> = {
  pencil:  { label: 'Pencil',      cursor: 'crosshair' },
  brush:   { label: 'Brush',       cursor: 'crosshair' },
  eraser:  { label: 'Eraser',      cursor: 'crosshair' },
  line:    { label: 'Line',        cursor: 'crosshair' },
  rect:    { label: 'Rectangle',   cursor: 'crosshair' },
  ellipse: { label: 'Ellipse',     cursor: 'crosshair' },
  fill:    { label: 'Fill Bucket', cursor: 'crosshair' },
  picker:  { label: 'Color Picker',cursor: 'crosshair' },
};
