/**
 * usePyodide – React hook that manages the Pyodide Web Worker lifecycle.
 *
 * Returns the current status, output lines, and a runCode() function.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { PyOutputLine, PyStatus } from './types';

// Vite handles ?worker imports, creating a proper blob URL worker.
import PyWorker from './pyodideWorker?worker';

export function usePyodide() {
  const [status, setStatus] = useState<PyStatus>('idle');
  const [output, setOutput] = useState<PyOutputLine[]>([]);
  const workerRef = useRef<Worker | null>(null);

  /* ── Boot worker on mount ───────── */
  useEffect(() => {
    const worker = new PyWorker();
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent) => {
      const msg = e.data;

      switch (msg.type) {
        case 'status':
          setStatus(msg.status as PyStatus);
          if (msg.status === 'ready') {
            setOutput((prev) => [
              ...prev,
              { type: 'info', text: '✓ Python 3 ready.' },
            ]);
          }
          break;

        case 'stdout':
          setOutput((prev) => [
            ...prev,
            { type: 'stdout', text: msg.text },
          ]);
          break;

        case 'stderr':
          setOutput((prev) => [
            ...prev,
            { type: 'stderr', text: msg.text },
          ]);
          break;

        case 'result':
          setOutput((prev) => [
            ...prev,
            { type: 'result', text: msg.text },
          ]);
          break;

        case 'done':
          if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
          setStatus('ready');
          break;

        case 'error':
          setOutput((prev) => [
            ...prev,
            { type: 'stderr', text: msg.text },
          ]);
          if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
          setStatus('ready');
          break;
      }
    };

    // Start loading Pyodide immediately
    worker.postMessage({ type: 'init' });
    setStatus('loading');

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  /* ── Timeout guard ────────────── */
  const EXEC_TIMEOUT = 10_000; // 10 seconds
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearExecTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  /** Terminate the current worker and spin up a fresh one. */
  const respawnWorker = useCallback(() => {
    clearExecTimeout();
    workerRef.current?.terminate();
    workerRef.current = null;

    const worker = new PyWorker();
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent) => {
      const msg = e.data;
      switch (msg.type) {
        case 'status':
          setStatus(msg.status as PyStatus);
          if (msg.status === 'ready') {
            setOutput((prev) => [
              ...prev,
              { type: 'info', text: '✓ Python 3 ready.' },
            ]);
          }
          break;
        case 'stdout':
          setOutput((prev) => [...prev, { type: 'stdout', text: msg.text }]);
          break;
        case 'stderr':
          setOutput((prev) => [...prev, { type: 'stderr', text: msg.text }]);
          break;
        case 'result':
          setOutput((prev) => [...prev, { type: 'result', text: msg.text }]);
          break;
        case 'done':
          clearExecTimeout();
          setStatus('ready');
          break;
        case 'error':
          setOutput((prev) => [...prev, { type: 'stderr', text: msg.text }]);
          clearExecTimeout();
          setStatus('ready');
          break;
      }
    };

    worker.postMessage({ type: 'init' });
    setStatus('loading');
  }, [clearExecTimeout]);

  /* ── Run user code ──────────────── */
  const runCode = useCallback((code: string) => {
    if (!workerRef.current || status !== 'ready') return;
    setStatus('running');
    setOutput((prev) => [
      ...prev,
      { type: 'info', text: '▸ Running...' },
    ]);

    // Start timeout — if code doesn't finish in 10s, kill and respawn
    clearExecTimeout();
    timeoutRef.current = setTimeout(() => {
      setOutput((prev) => [
        ...prev,
        { type: 'stderr', text: '⚠ Execution timed out after 10 seconds (possible infinite loop). Restarting interpreter...' },
      ]);
      respawnWorker();
    }, EXEC_TIMEOUT);

    workerRef.current.postMessage({ type: 'run', code });
  }, [status, clearExecTimeout, respawnWorker]);

  /* ── Clear output ───────────────── */
  const clearOutput = useCallback(() => {
    setOutput([]);
  }, []);

  return { status, output, runCode, clearOutput };
}
