import React, { useState, useRef, useCallback } from 'react';
import { ToolType } from './core/types';
import { DEFAULT_BG } from './core/constants';
import { PaintCanvas } from './components/PaintCanvas';
import { Toolbar } from './components/Toolbar';
import { ColorPalette } from './components/ColorPalette';
import { StatusBar } from './components/StatusBar';
import './styles/index.css';

export const PaintApp: React.FC = () => {
  /* ── State ────────────────────────────────── */
  const [tool, setTool] = useState<ToolType>('pencil');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(4);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
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
    // Save current state for redo
    redoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    const prev = undoStack.current.pop()!;
    ctx.putImageData(prev, 0, 0);
    triggerHistoryChange();
  }, [triggerHistoryChange]);

  const handleRedo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || redoStack.current.length === 0) return;
    const ctx = canvas.getContext('2d')!;
    undoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    const next = redoStack.current.pop()!;
    ctx.putImageData(next, 0, 0);
    triggerHistoryChange();
  }, [triggerHistoryChange]);

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    undoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    redoStack.current = [];
    ctx.fillStyle = DEFAULT_BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    triggerHistoryChange();
  }, [triggerHistoryChange]);

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'painting.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  /* ── Color picker callback ───────────────── */
  const handleColorPicked = useCallback((hex: string) => {
    setColor(hex);
    setTool('pencil'); // switch back to pencil after picking
  }, []);

  /* ── Keyboard shortcuts ──────────────────── */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    },
    [handleUndo, handleRedo, handleSave],
  );

  const canvasSize = {
    width: canvasRef.current?.width ?? 0,
    height: canvasRef.current?.height ?? 0,
  };

  return (
    <div
      className="paint-app app-content"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <Toolbar
        activeTool={tool}
        brushSize={brushSize}
        onToolChange={setTool}
        onBrushSizeChange={setBrushSize}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        onSave={handleSave}
        canUndo={undoStack.current.length > 0}
        canRedo={redoStack.current.length > 0}
      />

      <div className="paint-body">
        <ColorPalette activeColor={color} onColorChange={setColor} />
        <PaintCanvas
          tool={tool}
          color={color}
          brushSize={brushSize}
          onCursorMove={setCursorPos}
          onColorPicked={handleColorPicked}
          canvasRef={canvasRef}
          undoStack={undoStack}
          redoStack={redoStack}
          onHistoryChange={triggerHistoryChange}
        />
      </div>

      <StatusBar tool={tool} cursorPos={cursorPos} canvasSize={canvasSize} />
    </div>
  );
};
