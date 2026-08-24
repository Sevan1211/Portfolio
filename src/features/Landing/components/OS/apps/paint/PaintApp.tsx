import React, { useState, useRef, useCallback } from 'react';
import { ToolType, ShapeFillMode } from './core/types';
import { DEFAULT_BG, DEFAULT_FG } from './core/constants';
import { PaintCanvas } from './components/PaintCanvas';
import { ToolBox } from './components/ToolBox';
import { ActionBar } from './components/ActionBar';
import { ColorBar } from './components/ColorBar';
import { StatusBar } from './components/StatusBar';
import './styles/index.css';

/*
 * Paint - MS Paint layout on the shared Win95 design system.
 * Tool box on the left, colors along the bottom, fixed-size document
 * in a scrollable workspace. Left button paints the foreground color,
 * right button the background color.
 */
export const PaintApp: React.FC = () => {
  /* ── State ────────────────────────────────── */
  const [tool, setTool] = useState<ToolType>('pencil');
  const [fgColor, setFgColor] = useState(DEFAULT_FG);
  const [bgColor, setBgColor] = useState(DEFAULT_BG);
  const [brushSize, setBrushSize] = useState(4);
  const [fillMode, setFillMode] = useState<ShapeFillMode>('stroke');
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [docSize, setDocSize] = useState<{ width: number; height: number } | null>(null);
  const [, setHistoryTick] = useState(0); // force re-render on undo/redo

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const undoStack = useRef<ImageData[]>([]);
  const redoStack = useRef<ImageData[]>([]);

  /* ── History helpers ──────────────────────── */
  const triggerHistoryChange = useCallback(() => {
    setHistoryTick((t) => t + 1);
  }, []);

  const handleUndo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || undoStack.current.length === 0) return;
    const ctx = canvas.getContext('2d')!;
    redoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    ctx.putImageData(undoStack.current.pop()!, 0, 0);
    triggerHistoryChange();
  }, [triggerHistoryChange]);

  const handleRedo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || redoStack.current.length === 0) return;
    const ctx = canvas.getContext('2d')!;
    undoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    ctx.putImageData(redoStack.current.pop()!, 0, 0);
    triggerHistoryChange();
  }, [triggerHistoryChange]);

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    undoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    redoStack.current = [];
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    triggerHistoryChange();
  }, [bgColor, triggerHistoryChange]);

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'untitled.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  /* ── Color picker callback ───────────────── */
  const handleColorPicked = useCallback((hex: string, secondary: boolean) => {
    if (secondary) setBgColor(hex);
    else setFgColor(hex);
    setTool('pencil');
  }, []);

  /* ── Keyboard shortcuts ──────────────────── */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
    },
    [handleUndo, handleRedo, handleSave],
  );

  return (
    <div
      className="paint-app app-content w95-ui"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <ActionBar
        canUndo={undoStack.current.length > 0}
        canRedo={redoStack.current.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        onSave={handleSave}
      />

      <div className="paint-body">
        <ToolBox
          activeTool={tool}
          brushSize={brushSize}
          fillMode={fillMode}
          onToolChange={setTool}
          onBrushSizeChange={setBrushSize}
          onFillModeChange={setFillMode}
        />
        <PaintCanvas
          tool={tool}
          fgColor={fgColor}
          bgColor={bgColor}
          brushSize={brushSize}
          fillMode={fillMode}
          onCursorMove={setCursorPos}
          onColorPicked={handleColorPicked}
          onDocSize={setDocSize}
          canvasRef={canvasRef}
          undoStack={undoStack}
          redoStack={redoStack}
          onHistoryChange={triggerHistoryChange}
        />
      </div>

      <ColorBar
        fgColor={fgColor}
        bgColor={bgColor}
        onFgChange={setFgColor}
        onBgChange={setBgColor}
      />

      <StatusBar tool={tool} cursorPos={cursorPos} docSize={docSize} />
    </div>
  );
};
