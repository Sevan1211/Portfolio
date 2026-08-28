import React from "react";
import { PyStatus } from "../core/types";
import { executionLimitLabel, outputLimitLabel } from "../core/executionLimits";

interface PyStatusBarProps {
  status: PyStatus;
  version: string | null;
  cursor: { line: number; col: number };
}

const STATUS_LABEL: Record<PyStatus, string> = {
  idle: "Starting…",
  loading: "Loading Python…",
  ready: "Ready",
  running: "Running…",
  error: "Unavailable",
};

/** Win95 status bar: interpreter state, version, caret position. */
export const PyStatusBar: React.FC<PyStatusBarProps> = ({
  status,
  version,
  cursor,
}) => (
  <div className="py-status">
    <span className="py-status__seg py-status__seg--state">
      <span className={`py-status__dot py-status__dot--${status}`} />
      {STATUS_LABEL[status]}
    </span>
    <span className="py-status__seg">
      {version ? `Python ${version} · Pyodide` : "Pyodide"}
    </span>
    <span
      className="py-status__seg py-status__seg--limits"
      title="Each run has a time limit and a bounded output console"
    >
      {executionLimitLabel} · {outputLimitLabel}
    </span>
    <span className="py-status__seg py-status__seg--cursor">
      Ln {cursor.line}, Col {cursor.col}
    </span>
  </div>
);
