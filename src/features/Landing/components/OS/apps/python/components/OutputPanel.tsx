import React, { useEffect, useRef } from "react";
import { PyOutputLine } from "../core/types";

interface OutputPanelProps {
  lines: PyOutputLine[];
}

/**
 * Output console panel – shows stdout, stderr, and info messages
 * in a sunken Win95-style panel.
 */
export const OutputPanel: React.FC<OutputPanelProps> = ({ lines }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  /* Auto-scroll to bottom on new output */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  return (
    <div className="py-output">
      <div className="py-panel-label">Output</div>
      <div
        className="py-output__content"
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        aria-atomic="false"
      >
        {lines.length === 0 && (
          <div className="py-output__empty">
            No output yet. Press Run (Ctrl+Enter).
          </div>
        )}
        {lines.map((line, i) => (
          <div
            key={i}
            className={`py-output__line py-output__line--${line.type}`}
          >
            {line.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
