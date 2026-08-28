import React, { useState, useCallback, useEffect, useRef } from "react";
import { usePyodide } from "./core/usePyodide";
import { CUSTOM_EXAMPLE_ID, EXAMPLES, DEFAULT_EXAMPLE } from "./core/examples";
import { Toolbar } from "./components/Toolbar";
import { CodeEditor } from "./components/CodeEditor";
import { StdinPanel } from "./components/StdinPanel";
import { OutputPanel } from "./components/OutputPanel";
import { PyStatusBar } from "./components/PyStatusBar";
import { LoadingOverlay } from "./components/LoadingOverlay";
import "./styles/index.css";

/** Work survives closing the window (and the whole site). */
const STORAGE_KEY = "portfolio.python.code";

const loadSavedCode = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_EXAMPLE.code;
  } catch {
    return DEFAULT_EXAMPLE.code;
  }
};

/**
 * Python IDE - real CPython (Pyodide) in a Web Worker, with live-streaming
 * output, a judge-style stdin panel, an examples menu, and an editor that
 * auto-indents. The default program is the ASCII Mandelbrot render.
 */
export const PythonApp: React.FC = () => {
  const { status, output, version, restarting, runCode, stop, clearOutput } =
    usePyodide();
  const [initialEditor] = useState(() => {
    const initialCode = loadSavedCode();
    const matchingExample = EXAMPLES.find(
      (example) => example.code === initialCode,
    );
    return {
      code: initialCode,
      exampleId: matchingExample?.id ?? CUSTOM_EXAMPLE_ID,
    };
  });
  const [code, setCode] = useState(initialEditor.code);
  const [selectedExampleId, setSelectedExampleId] = useState(
    initialEditor.exampleId,
  );
  const [stdin, setStdin] = useState("");
  const [stdinOpen, setStdinOpen] = useState(false);
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const saveTimerRef = useRef(0);

  /* Debounced persistence */
  useEffect(() => {
    window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, code);
      } catch {
        /* storage full or blocked - the session still works */
      }
    }, 400);
    return () => window.clearTimeout(saveTimerRef.current);
  }, [code]);

  const handleRun = useCallback(() => {
    runCode(code, stdin);
  }, [runCode, code, stdin]);

  const handleCursorChange = useCallback((line: number, col: number) => {
    setCursor({ line, col });
  }, []);

  const handleCodeChange = useCallback((nextCode: string) => {
    setCode(nextCode);
    const matchingExample = EXAMPLES.find(
      (example) => example.code === nextCode,
    );
    setSelectedExampleId(matchingExample?.id ?? CUSTOM_EXAMPLE_ID);
  }, []);

  const handleLoadExample = useCallback(
    (id: string) => {
      const example = EXAMPLES.find((ex) => ex.id === id);
      if (!example) return;
      setSelectedExampleId(example.id);
      setCode(example.code);
      setStdin(example.stdin ?? "");
      setStdinOpen(example.stdin !== undefined);
      clearOutput();
    },
    [clearOutput],
  );

  return (
    <div className="app-content py-app w95-ui">
      <LoadingOverlay status={status} restarting={restarting} />
      <Toolbar
        status={status}
        stdinOpen={stdinOpen}
        selectedExampleId={selectedExampleId}
        onRun={handleRun}
        onStop={stop}
        onClear={clearOutput}
        onToggleStdin={() => setStdinOpen((open) => !open)}
        onLoadExample={handleLoadExample}
      />
      <div className="py-layout">
        <CodeEditor
          value={code}
          onChange={handleCodeChange}
          onRun={handleRun}
          onCursorChange={handleCursorChange}
          disabled={status === "running"}
        />
        {stdinOpen && <StdinPanel value={stdin} onChange={setStdin} />}
        <OutputPanel lines={output} />
      </div>
      <PyStatusBar status={status} version={version} cursor={cursor} />
    </div>
  );
};
