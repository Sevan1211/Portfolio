import React from 'react';

interface StdinPanelProps {
  value: string;
  onChange: (text: string) => void;
}

/**
 * Pre-supplied stdin, judge style: each line answers one input() call.
 * When the lines run out, Python raises EOFError like a real piped
 * process.
 */
export const StdinPanel: React.FC<StdinPanelProps> = ({ value, onChange }) => (
  <div className="py-stdin">
    <div className="py-panel-label">Stdin (one line per input() call)</div>
    <textarea
      className="py-stdin__textarea"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      spellCheck={false}
      autoCapitalize="off"
      autoComplete="off"
      placeholder={'first input\nsecond input'}
      aria-label="Standard input lines"
    />
  </div>
);
