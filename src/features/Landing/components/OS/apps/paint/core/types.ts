/**
 * Paint App Type Definitions
 */

export type ToolType =
  | 'pencil'
  | 'brush'
  | 'eraser'
  | 'line'
  | 'rect'
  | 'ellipse'
  | 'fill'
  | 'picker';

export interface Point {
  x: number;
  y: number;
}

export interface PaintState {
  tool: ToolType;
  color: string;
  brushSize: number;
  isDrawing: boolean;
  lastPoint: Point | null;
}
