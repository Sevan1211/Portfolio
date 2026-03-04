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
          setStatus('ready');
          break;

        case 'error':
          setOutput((prev) => [
            ...prev,
            { type: 'stderr', text: msg.text },
          ]);
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

  /* ── Run user code ──────────────── */
  const runCode = useCallback((code: string) => {
    if (!workerRef.current || status !== 'ready') return;
    setStatus('running');
    setOutput((prev) => [
      ...prev,
      { type: 'info', text: '▸ Running...' },
    ]);
    workerRef.current.postMessage({ type: 'run', code });
  }, [status]);

  /* ── Clear output ───────────────── */
  const clearOutput = useCallback(() => {
    setOutput([]);
  }, []);

  return { status, output, runCode, clearOutput };
}
