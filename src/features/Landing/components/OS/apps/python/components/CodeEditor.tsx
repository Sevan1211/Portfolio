import React, { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { highlightPython } from '../core/highlighter';

interface CodeEditorProps {
  value: string;
  onChange: (code: string) => void;
  onRun: () => void;
  disabled: boolean;
}

/**
 * Code editor with syntax highlighting.
 *
 * Uses the "overlay" technique: a transparent <textarea> sits on top of a
 * <pre> that renders highlighted HTML underneath. Both share identical
 * font metrics so the characters align perfectly.
 */
export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  onRun,
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

  /* Handle tab key for indentation + Ctrl+Enter to run */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onRun();
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        const ta = e.currentTarget;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const newVal = value.substring(0, start) + '    ' + value.substring(end);
        onChange(newVal);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 4;
        });
      }
    },
    [value, onChange, onRun],
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

      {/* Code area wrapper — highlight underneath, textarea on top */}
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
          disabled={disabled}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          placeholder="# Write Python code here..."
        />
      </div>
    </div>
  );
};
