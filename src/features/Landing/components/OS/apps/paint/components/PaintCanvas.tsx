import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ToolType, ShapeFillMode, Point } from '../core/types';
import {
  DEFAULT_BG,
  MAX_UNDO_STEPS,
  DOC_MIN_WIDTH,
  DOC_MAX_WIDTH,
  DOC_MIN_HEIGHT,
  DOC_MAX_HEIGHT,
} from '../core/constants';
import { floodFill } from '../core/floodFill';

interface PaintCanvasProps {
  tool: ToolType;
  fgColor: string;
  bgColor: string;
  brushSize: number;
  fillMode: ShapeFillMode;
  onCursorMove: (pos: Point | null) => void;
  onColorPicked: (hex: string, secondary: boolean) => void;
  onDocSize: (size: { width: number; height: number }) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  undoStack: React.MutableRefObject<ImageData[]>;
  redoStack: React.MutableRefObject<ImageData[]>;
  onHistoryChange: () => void;
}

/**
 * The drawing surface: a fixed-size document inside a scrollable gray
 * workspace, like real MS Paint. The document size is measured once on
 * mount and never changes afterwards, so window resizes scroll instead
 * of destroying artwork - and every undo snapshot stays valid.
 */
export const PaintCanvas: React.FC<PaintCanvasProps> = ({
  tool,
  fgColor,
  bgColor,
  brushSize,
  fillMode,
  onCursorMove,
  onColorPicked,
  onDocSize,
  canvasRef,
  undoStack,
  redoStack,
  onHistoryChange,
}) => {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLCanvasElement | null>(null);
  const [doc, setDoc] = useState<{ width: number; height: number } | null>(null);

  const drawingRef = useRef(false);
  const startPointRef = useRef<Point | null>(null);
  const lastPointRef = useRef<Point | null>(null);
  const drawColorRef = useRef(fgColor);
  const shiftRef = useRef(false);
  const sprayTimerRef = useRef(0);

  /* ── Fit the document to the workspace once, then freeze it ── */
  useEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace || doc) return;
    const clamp = (v: number, lo: number, hi: number) =>
      Math.max(lo, Math.min(hi, Math.floor(v)));
    setDoc({
      width: clamp(workspace.clientWidth - 24, DOC_MIN_WIDTH, DOC_MAX_WIDTH),
      height: clamp(workspace.clientHeight - 24, DOC_MIN_HEIGHT, DOC_MAX_HEIGHT),
    });
  }, [doc]);

  /* ── Initialize the document: white fill, read-friendly context ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !doc) return;
    // Opting into frequent reads up front (picker, fill, undo snapshots).
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.fillStyle = DEFAULT_BG;
    ctx.fillRect(0, 0, doc.width, doc.height);
    onDocSize(doc);
  }, [canvasRef, doc, onDocSize]);

  /* ── Stop any airbrush timer on unmount ── */
  useEffect(() => () => window.clearInterval(sprayTimerRef.current), []);

  const getPoint = useCallback(
    (e: React.PointerEvent): Point => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      return {
        x: Math.max(0, Math.min(canvas.width - 1, e.clientX - rect.left)),
        y: Math.max(0, Math.min(canvas.height - 1, e.clientY - rect.top)),
      };
    },
    [canvasRef],
  );

  const pushUndo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    undoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (undoStack.current.length > MAX_UNDO_STEPS) undoStack.current.shift();
    redoStack.current = [];
    onHistoryChange();
  }, [canvasRef, undoStack, redoStack, onHistoryChange]);

  /* ── Freehand stamps ─────────────────────────── */

  /** Square eraser stamp, interpolated along the stroke - blocky like real Paint. */
  const eraseSeg = useCallback(
    (ctx: CanvasRenderingContext2D, from: Point, to: Point, size: number) => {
      ctx.fillStyle = bgColor;
      const dist = Math.hypot(to.x - from.x, to.y - from.y);
      const steps = Math.max(1, Math.ceil(dist));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = from.x + (to.x - from.x) * t;
        const y = from.y + (to.y - from.y) * t;
        ctx.fillRect(Math.round(x - size / 2), Math.round(y - size / 2), size, size);
      }
    },
    [bgColor],
  );

  const strokeSeg = useCallback(
    (ctx: CanvasRenderingContext2D, from: Point, to: Point, color: string, width: number) => {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      // A 1 px line on an integer coordinate straddles two pixel rows and
      // anti-aliases to gray; the half-pixel offset keeps the pencil crisp.
      const nudge = width === 1 ? 0.5 : 0;
      ctx.beginPath();
      ctx.moveTo(Math.round(from.x) + nudge, Math.round(from.y) + nudge);
      ctx.lineTo(Math.round(to.x) + nudge, Math.round(to.y) + nudge);
      ctx.stroke();
    },
    [],
  );

  const sprayAt = useCallback(
    (ctx: CanvasRenderingContext2D, p: Point, color: string, size: number) => {
      ctx.fillStyle = color;
      const radius = size * 1.6 + 4;
      const dots = Math.max(7, size * 2);
      for (let i = 0; i < dots; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * radius;
        ctx.fillRect(
          Math.round(p.x + Math.cos(angle) * r),
          Math.round(p.y + Math.sin(angle) * r),
          1,
          1,
        );
      }
    },
    [],
  );

  /* ── Shape geometry (Shift constrains) ───────── */
  const constrainEnd = useCallback(
    (start: Point, end: Point, shift: boolean): Point => {
      if (!shift) return end;
      if (tool === 'line') {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const angle = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * (Math.PI / 4);
        const len = Math.hypot(dx, dy);
        return { x: start.x + Math.cos(angle) * len, y: start.y + Math.sin(angle) * len };
      }
      const side = Math.max(Math.abs(end.x - start.x), Math.abs(end.y - start.y));
      return {
        x: start.x + Math.sign(end.x - start.x || 1) * side,
        y: start.y + Math.sign(end.y - start.y || 1) * side,
      };
    },
    [tool],
  );

  const paintShape = useCallback(
    (ctx: CanvasRenderingContext2D, start: Point, rawEnd: Point, shift: boolean) => {
      const end = constrainEnd(start, rawEnd, shift);
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = drawColorRef.current;
      // MS Paint semantics: "both" fills with the background color under a
      // foreground outline; "fill" is solid foreground.
      ctx.fillStyle = fillMode === 'both' ? bgColor : drawColorRef.current;

      if (tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        return;
      }

      const x = Math.min(start.x, end.x);
      const y = Math.min(start.y, end.y);
      const w = Math.abs(end.x - start.x);
      const h = Math.abs(end.y - start.y);

      ctx.beginPath();
      if (tool === 'rect') {
        ctx.rect(x, y, w, h);
      } else if (tool === 'roundrect') {
        const r = Math.min(14, w / 2, h / 2);
        ctx.roundRect(x, y, w, h, r);
      } else {
        ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      }
      if (fillMode !== 'stroke') ctx.fill();
      if (fillMode !== 'fill') ctx.stroke();
    },
    [tool, brushSize, fillMode, bgColor, constrainEnd],
  );

  const drawShapePreview = useCallback(
    (start: Point, end: Point, shift: boolean) => {
      const preview = previewRef.current;
      if (!preview) return;
      const pCtx = preview.getContext('2d')!;
      pCtx.clearRect(0, 0, preview.width, preview.height);
      paintShape(pCtx, start, end, shift);
    },
    [paintShape],
  );

  /* ── Pointer handlers ────────────────────────── */
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas || (e.button !== 0 && e.button !== 2)) return;
      const ctx = canvas.getContext('2d')!;
      const pt = getPoint(e);
      const secondary = e.button === 2;
      drawColorRef.current = secondary ? bgColor : fgColor;
      shiftRef.current = e.shiftKey;

      if (tool === 'picker') {
        const px = ctx.getImageData(Math.round(pt.x), Math.round(pt.y), 1, 1).data;
        const hex =
          '#' +
          [px[0], px[1], px[2]]
            .map((c) => (c ?? 0).toString(16).padStart(2, '0'))
            .join('');
        onColorPicked(hex, secondary);
        return;
      }

      if (tool === 'fill') {
        pushUndo();
        floodFill(ctx, pt.x, pt.y, drawColorRef.current);
        return;
      }

      pushUndo();
      drawingRef.current = true;
      startPointRef.current = pt;
      lastPointRef.current = pt;

      if (tool === 'pencil' || tool === 'brush') {
        const width = tool === 'pencil' ? 1 : brushSize;
        strokeSeg(ctx, pt, pt, drawColorRef.current, width);
      } else if (tool === 'eraser') {
        eraseSeg(ctx, pt, pt, Math.max(4, brushSize));
      } else if (tool === 'spray') {
        sprayAt(ctx, pt, drawColorRef.current, brushSize);
        window.clearInterval(sprayTimerRef.current);
        sprayTimerRef.current = window.setInterval(() => {
          const c = canvasRef.current;
          if (c && lastPointRef.current) {
            sprayAt(c.getContext('2d')!, lastPointRef.current, drawColorRef.current, brushSize);
          }
        }, 40);
      }

      // Keeps the stroke alive when the pointer leaves the window. Some
      // browsers throw for pointers they no longer track - losing capture
      // is acceptable, losing the stroke is not.
      try {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        /* stroke continues uncaptured */
      }
    },
    [canvasRef, tool, fgColor, bgColor, brushSize, getPoint, pushUndo, strokeSeg, eraseSeg, sprayAt, onColorPicked],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const pt = getPoint(e);
      onCursorMove({ x: Math.round(pt.x), y: Math.round(pt.y) });
      shiftRef.current = e.shiftKey;

      if (!drawingRef.current || !lastPointRef.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d')!;

      if (tool === 'pencil' || tool === 'brush') {
        const width = tool === 'pencil' ? 1 : brushSize;
        strokeSeg(ctx, lastPointRef.current, pt, drawColorRef.current, width);
        lastPointRef.current = pt;
      } else if (tool === 'eraser') {
        eraseSeg(ctx, lastPointRef.current, pt, Math.max(4, brushSize));
        lastPointRef.current = pt;
      } else if (tool === 'spray') {
        sprayAt(ctx, pt, drawColorRef.current, brushSize);
        lastPointRef.current = pt;
      } else if (startPointRef.current) {
        drawShapePreview(startPointRef.current, pt, e.shiftKey);
        lastPointRef.current = pt;
      }
    },
    [canvasRef, tool, brushSize, getPoint, onCursorMove, strokeSeg, eraseSeg, sprayAt, drawShapePreview],
  );

  const finishStroke = useCallback(
    (endPoint: Point | null) => {
      if (!drawingRef.current) return;
      drawingRef.current = false;
      window.clearInterval(sprayTimerRef.current);

      const canvas = canvasRef.current;
      const start = startPointRef.current;
      const end = endPoint ?? lastPointRef.current;
      const isShape =
        tool === 'line' || tool === 'rect' || tool === 'roundrect' || tool === 'ellipse';

      if (canvas && isShape && start && end) {
        paintShape(canvas.getContext('2d')!, start, end, shiftRef.current);
        const preview = previewRef.current;
        if (preview) {
          preview.getContext('2d')!.clearRect(0, 0, preview.width, preview.height);
        }
      }

      startPointRef.current = null;
      lastPointRef.current = null;
    },
    [canvasRef, tool, paintShape],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => finishStroke(getPoint(e)),
    [finishStroke, getPoint],
  );

  // Pointer capture keeps strokes alive outside the window; cancel is the
  // only true abort (e.g. the OS stole the pointer mid-stroke).
  const handlePointerCancel = useCallback(() => finishStroke(null), [finishStroke]);

  const handleLeave = useCallback(() => onCursorMove(null), [onCursorMove]);

  return (
    <div className="paint-workspace w95-scroll" ref={workspaceRef}>
      {doc && (
        <div
          className="paint-doc"
          style={{ width: doc.width, height: doc.height }}
        >
          <canvas
            ref={canvasRef}
            className="paint-canvas"
            width={doc.width}
            height={doc.height}
          />
          <canvas
            ref={previewRef}
            className="paint-canvas paint-canvas--preview"
            width={doc.width}
            height={doc.height}
          />
          <div
            className="paint-canvas-interaction"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onPointerLeave={handleLeave}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      )}
    </div>
  );
};
