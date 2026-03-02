import React, { useRef, useEffect, useCallback } from 'react';
import { ToolType, Point } from '../core/types';
import { DEFAULT_BG, MAX_UNDO_STEPS, TOOL_META } from '../core/constants';
import { floodFill } from '../core/floodFill';

interface PaintCanvasProps {
  tool: ToolType;
  color: string;
  brushSize: number;
  onCursorMove: (pos: { x: number; y: number } | null) => void;
  onColorPicked: (hex: string) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  undoStack: React.MutableRefObject<ImageData[]>;
  redoStack: React.MutableRefObject<ImageData[]>;
  onHistoryChange: () => void;
}

/**
 * The main drawing surface. Handles all pointer events
 * and delegates to the correct drawing routine per tool.
 */
export const PaintCanvas: React.FC<PaintCanvasProps> = ({
  tool,
  color,
  brushSize,
  onCursorMove,
  onColorPicked,
  canvasRef,
  undoStack,
  redoStack,
  onHistoryChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<Point | null>(null);
  const previewRef = useRef<HTMLCanvasElement | null>(null);
  const snapshotRef = useRef<ImageData | null>(null);

  /* ── Resize canvas to fill container ──────────── */
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ro = new ResizeObserver(() => {
      const { width, height } = container.getBoundingClientRect();
      const w = Math.floor(width);
      const h = Math.floor(height);
      if (canvas.width === w && canvas.height === h) return;

      // Save current drawing
      const ctx = canvas.getContext('2d')!;
      const existing = ctx.getImageData(0, 0, canvas.width, canvas.height);

      canvas.width = w;
      canvas.height = h;

      // Restore with white background
      ctx.fillStyle = DEFAULT_BG;
      ctx.fillRect(0, 0, w, h);
      ctx.putImageData(existing, 0, 0);

      // Setup preview overlay
      if (previewRef.current) {
        previewRef.current.width = w;
        previewRef.current.height = h;
      }
    });

    ro.observe(container);
    return () => ro.disconnect();
  }, [canvasRef]);

  /* ── Initial white fill ──────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = DEFAULT_BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [canvasRef]);

  /* ── Helper: get canvas-relative coords ──────── */
  const getCanvasPoint = useCallback(
    (e: React.PointerEvent): Point => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * canvas.width,
        y: ((e.clientY - rect.top) / rect.height) * canvas.height,
      };
    },
    [canvasRef],
  );

  /* ── Save snapshot for undo ──────────────────── */
  const pushUndo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStack.current.push(snap);
    if (undoStack.current.length > MAX_UNDO_STEPS) {
      undoStack.current.shift();
    }
    redoStack.current = [];
    onHistoryChange();
  }, [canvasRef, undoStack, redoStack, onHistoryChange]);

  /* ── Drawing helpers ─────────────────────────── */
  const drawDot = useCallback(
    (ctx: CanvasRenderingContext2D, p: Point) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    },
    [brushSize],
  );

  const drawLineSeg = useCallback(
    (ctx: CanvasRenderingContext2D, from: Point, to: Point) => {
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    },
    [],
  );

  /* ── Shape preview on overlay canvas ─────────── */
  const drawShapePreview = useCallback(
    (start: Point, end: Point) => {
      const preview = previewRef.current;
      if (!preview) return;
      const pCtx = preview.getContext('2d')!;
      pCtx.clearRect(0, 0, preview.width, preview.height);
      pCtx.strokeStyle = color;
      pCtx.lineWidth = brushSize;
      pCtx.lineCap = 'round';

      if (tool === 'line') {
        pCtx.beginPath();
        pCtx.moveTo(start.x, start.y);
        pCtx.lineTo(end.x, end.y);
        pCtx.stroke();
      } else if (tool === 'rect') {
        const x = Math.min(start.x, end.x);
        const y = Math.min(start.y, end.y);
        const w = Math.abs(end.x - start.x);
        const h = Math.abs(end.y - start.y);
        pCtx.strokeRect(x, y, w, h);
      } else if (tool === 'ellipse') {
        const cx = (start.x + end.x) / 2;
        const cy = (start.y + end.y) / 2;
        const rx = Math.abs(end.x - start.x) / 2;
        const ry = Math.abs(end.y - start.y) / 2;
        pCtx.beginPath();
        pCtx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        pCtx.stroke();
      }
    },
    [tool, color, brushSize],
  );

  const commitShapeToCanvas = useCallback(
    (start: Point, end: Point) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d')!;
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';

      if (tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      } else if (tool === 'rect') {
        const x = Math.min(start.x, end.x);
        const y = Math.min(start.y, end.y);
        const w = Math.abs(end.x - start.x);
        const h = Math.abs(end.y - start.y);
        ctx.strokeRect(x, y, w, h);
      } else if (tool === 'ellipse') {
        const cx = (start.x + end.x) / 2;
        const cy = (start.y + end.y) / 2;
        const rx = Math.abs(end.x - start.x) / 2;
        const ry = Math.abs(end.y - start.y) / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Clear preview
      const preview = previewRef.current;
      if (preview) {
        preview.getContext('2d')!.clearRect(0, 0, preview.width, preview.height);
      }
    },
    [canvasRef, tool, color, brushSize],
  );

  /* ── Pointer handlers ────────────────────────── */
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d')!;
      const pt = getCanvasPoint(e);

      // Color picker – pick and return immediately
      if (tool === 'picker') {
        const pixel = ctx.getImageData(Math.round(pt.x), Math.round(pt.y), 1, 1).data;
        const hex =
          '#' +
          [pixel[0], pixel[1], pixel[2]]
            .map((c) => (c ?? 0).toString(16).padStart(2, '0'))
            .join('');
        onColorPicked(hex);
        return;
      }

      // Fill bucket
      if (tool === 'fill') {
        pushUndo();
        floodFill(ctx, pt.x, pt.y, color);
        return;
      }

      pushUndo();
      drawingRef.current = true;
      lastPointRef.current = pt;
      snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Freehand tools – draw initial dot
      if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
        ctx.fillStyle = tool === 'eraser' ? DEFAULT_BG : color;
        ctx.strokeStyle = tool === 'eraser' ? DEFAULT_BG : color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        drawDot(ctx, pt);
      }

      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [canvasRef, tool, color, brushSize, getCanvasPoint, pushUndo, drawDot, onColorPicked],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const pt = getCanvasPoint(e);
      onCursorMove({ x: Math.round(pt.x), y: Math.round(pt.y) });

      if (!drawingRef.current || !lastPointRef.current) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d')!;

      if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
        ctx.fillStyle = tool === 'eraser' ? DEFAULT_BG : color;
        ctx.strokeStyle = tool === 'eraser' ? DEFAULT_BG : color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        drawLineSeg(ctx, lastPointRef.current, pt);
        drawDot(ctx, pt);
        lastPointRef.current = pt;
      } else if (tool === 'line' || tool === 'rect' || tool === 'ellipse') {
        drawShapePreview(lastPointRef.current, pt);
      }
    },
    [canvasRef, tool, color, brushSize, getCanvasPoint, onCursorMove, drawDot, drawLineSeg, drawShapePreview],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!drawingRef.current) return;
      drawingRef.current = false;

      if (
        (tool === 'line' || tool === 'rect' || tool === 'ellipse') &&
        lastPointRef.current
      ) {
        const pt = getCanvasPoint(e);
        commitShapeToCanvas(lastPointRef.current, pt);
      }

      lastPointRef.current = null;
      snapshotRef.current = null;
    },
    [tool, getCanvasPoint, commitShapeToCanvas],
  );

  const handlePointerLeave = useCallback(() => {
    onCursorMove(null);
  }, [onCursorMove]);

  const cursor = TOOL_META[tool]?.cursor ?? 'crosshair';

  return (
    <div
      ref={containerRef}
      className="paint-canvas-container"
      style={{ cursor }}
    >
      <canvas ref={canvasRef} className="paint-canvas" />
      <canvas ref={previewRef} className="paint-canvas paint-canvas--preview" />
      {/* Transparent interaction layer on top */}
      <div
        className="paint-canvas-interaction"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        style={{ cursor }}
      />
    </div>
  );
};
