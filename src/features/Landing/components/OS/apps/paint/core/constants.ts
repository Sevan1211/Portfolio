/**
 * Paint App Constants
 */
import { ToolType } from './types';

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

/** Available stroke widths (the pencil is always 1 px, like real Paint). */
export const BRUSH_SIZES = [1, 2, 4, 8, 12, 16];

export const DEFAULT_FG = '#000000';
export const DEFAULT_BG = '#FFFFFF';

/** Max undo history depth (each step is a full-canvas ImageData). */
export const MAX_UNDO_STEPS = 20;

/** The document keeps a fixed size after mount; these clamp the initial fit. */
export const DOC_MIN_WIDTH = 320;
export const DOC_MAX_WIDTH = 960;
export const DOC_MIN_HEIGHT = 240;
export const DOC_MAX_HEIGHT = 640;

/** Tools whose stroke width is adjustable. */
export const SIZED_TOOLS: ReadonlySet<ToolType> = new Set([
  'brush',
  'spray',
  'eraser',
  'line',
  'rect',
  'roundrect',
  'ellipse',
]);

/** Tools that draw closed shapes and honor the fill mode. */
export const SHAPE_TOOLS: ReadonlySet<ToolType> = new Set([
  'rect',
  'roundrect',
  'ellipse',
]);

/** Tool display metadata: label + the status-bar hint. */
export const TOOL_META: Record<ToolType, { label: string; hint: string }> = {
  pencil: {
    label: 'Pencil',
    hint: '1 px freehand. Right-click draws the background color',
  },
  brush: {
    label: 'Brush',
    hint: 'Round brush. Right-click draws the background color',
  },
  spray: {
    label: 'Airbrush',
    hint: 'Hold the button to build up paint',
  },
  eraser: {
    label: 'Eraser',
    hint: 'Paints with the background color',
  },
  fill: {
    label: 'Fill With Color',
    hint: 'Fills the area under the cursor. Right-click uses the background color',
  },
  picker: {
    label: 'Pick Color',
    hint: 'Left-click sets the foreground, right-click sets the background',
  },
  line: {
    label: 'Line',
    hint: 'Drag to draw. Hold Shift for 45° angles',
  },
  rect: {
    label: 'Rectangle',
    hint: 'Drag to draw. Hold Shift for a square',
  },
  roundrect: {
    label: 'Rounded Rectangle',
    hint: 'Drag to draw. Hold Shift for a square',
  },
  ellipse: {
    label: 'Ellipse',
    hint: 'Drag to draw. Hold Shift for a circle',
  },
};
