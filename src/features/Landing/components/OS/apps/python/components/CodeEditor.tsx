import React, { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { highlightPython } from '../core/highlighter';

interface CodeEditorProps {
  value: string;
  onChange: (code: string) => void;
  onRun: () => void;
  onCursorChange?: (line: number, col: number) => void;
  disabled: boolean;
}

const INDENT = '    ';

/**
 * Code editor with syntax highlighting.
 *
 * Uses the "overlay" technique: a transparent <textarea> sits on top of a
 * <pre> that renders highlighted HTML underneath. Both share identical
 * font metrics so the characters align perfectly.
 *
 * Editing niceties: Enter auto-indents (an extra level after a trailing
 * colon), Tab indents, Shift+Tab dedents, and multi-line selections
 * indent/dedent as a block. Single-caret edits go through execCommand so
 * the browser's native undo stack survives.
 */
export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  onRun,
  onCursorChange,
  disabled,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState(1);

  /* Keep line count in sync */
  useEffect(() => {
    setLineCount(value.split('\n').length);
  }, [value]);

  /* Highlighted HTML (memoised – only re-tokenises when value changes) */
  const highlightedHtml = useMemo(() => highlightPython(value), [value]);

  /* Sync scroll between textarea → highlight + gutter */
  const handleScroll = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (highlightRef.current) {
      highlightRef.current.scrollTop = ta.scrollTop;
      highlightRef.current.scrollLeft = ta.scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = ta.scrollTop;
    }
  }, []);

  /* Report caret position as Ln/Col for the status bar */
  const reportCursor = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta || !onCursorChange) return;
    const before = ta.value.slice(0, ta.selectionStart);
    const line = before.split('\n').length;
    const col = before.length - before.lastIndexOf('\n');
    onCursorChange(line, col);
  }, [onCursorChange]);

  useEffect(() => {
    reportCursor();
  }, [value, reportCursor]);

  /**
   * Insert text at the caret via execCommand so native undo keeps working.
   * Falls back to a manual splice if the command is unavailable.
   */
  const insertAtCaret = useCallback(
    (text: string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      ta.focus();
      const ok = document.execCommand('insertText', false, text);
      if (!ok) {
        const start = ta.selectionStart;
        const next = ta.value.slice(0, start) + text + ta.value.slice(ta.selectionEnd);
        onChange(next);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + text.length;
        });
      }
    },
    [onChange],
  );

  /** Indent or dedent every line touched by the selection. */
  const shiftBlock = useCallback(
    (dedent: boolean) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const { selectionStart, selectionEnd } = ta;
      const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
      const block = value.slice(lineStart, selectionEnd);
      const shifted = block
        .split('\n')
        .map((line) =>
          dedent
            ? line.replace(/^ {1,4}/, '')
            : line.length > 0
              ? INDENT + line
              : line,
        )
        .join('\n');

      onChange(value.slice(0, lineStart) + shifted + value.slice(selectionEnd));
      const delta = shifted.length - block.length;
      requestAnimationFrame(() => {
        ta.selectionStart = lineStart;
        ta.selectionEnd = selectionEnd + delta;
      });
    },
    [value, onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const ta = e.currentTarget;

      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onRun();
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const before = value.slice(0, ta.selectionStart);
        const currentLine = before.slice(before.lastIndexOf('\n') + 1);
        const indent = /^[ \t]*/.exec(currentLine)?.[0] ?? '';
        const extra = currentLine.trimEnd().endsWith(':') ? INDENT : '';
        insertAtCaret(`\n${indent}${extra}`);
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        const hasMultilineSelection =
          ta.selectionStart !== ta.selectionEnd &&
          value.slice(ta.selectionStart, ta.selectionEnd).includes('\n');

        if (e.shiftKey || hasMultilineSelection) {
          shiftBlock(e.shiftKey);
        } else {
          insertAtCaret(INDENT);
        }
      }
    },
    [value, onRun, insertAtCaret, shiftBlock],
  );

  return (
    <div className="py-editor">
      {/* Line numbers gutter */}
      <div className="py-editor__gutter" ref={gutterRef}>
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i + 1} className="py-editor__linenum">
            {i + 1}
          </div>
        ))}
      </div>

      {/* Code area wrapper - highlight underneath, textarea on top */}
      <div className="py-editor__code">
        <pre
          ref={highlightRef}
          className="py-editor__highlight"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
        <textarea
          ref={textareaRef}
          className="py-editor__textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          onSelect={reportCursor}
          onClick={reportCursor}
          disabled={disabled}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          placeholder="# Write Python code here..."
          aria-label="Python code editor"
        />
      </div>
    </div>
  );
};
