/**
 * Paint App Type Definitions
 */

export type ToolType =
  | 'pencil'
  | 'brush'
  | 'spray'
  | 'eraser'
  | 'fill'
  | 'picker'
  | 'line'
  | 'rect'
  | 'roundrect'
  | 'ellipse';

/** How closed shapes are painted: outline, outline + background fill, or solid. */
export type ShapeFillMode = 'stroke' | 'both' | 'fill';

export interface Point {
  x: number;
  y: number;
}
