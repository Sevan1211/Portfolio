/**
 * usePyodide – React hook that manages the Pyodide Web Worker lifecycle.
 *
 * Returns the current status, output lines, the Python version, and
 * runCode() / stop() / clearOutput() controls.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { PyOutputLine, PyStatus } from './types';

// Vite handles ?worker imports, creating a proper blob URL worker.
import PyWorker from './pyodideWorker?worker';

/**
 * Backstop for code that never finishes AND the user walks away from.
 * Output streams live, so the Stop button is the primary control; this
 * only catches truly abandoned runaways.
 */
const EXEC_TIMEOUT = 30_000;

export function usePyodide() {
  const [status, setStatus] = useState<PyStatus>('idle');
  const [output, setOutput] = useState<PyOutputLine[]>([]);
  const [version, setVersion] = useState<string | null>(null);
  const [restarting, setRestarting] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusRef = useRef<PyStatus>('idle');
  statusRef.current = status;

  const append = useCallback((line: PyOutputLine) => {
    setOutput((prev) => [...prev, line]);
  }, []);

  const clearExecTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  /**
   * Spawns a worker and wires its message handling. Used for the initial
   * boot and for respawning after Stop / a timed-out runaway, so the two
   * paths can never drift apart.
   */
  const spawnWorker = useCallback(() => {
    clearExecTimeout();
    workerRef.current?.terminate();

    const worker = new PyWorker();
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent) => {
      const msg = e.data;

      switch (msg.type) {
        case 'status':
          setStatus(msg.status as PyStatus);
          if (msg.status === 'ready') {
            setRestarting(false);
            if (msg.version) setVersion(msg.version as string);
            append({
              type: 'info',
              text: `✓ Python ${msg.version ?? '3'} ready.`,
            });
          }
          break;

        case 'stdout':
          append({ type: 'stdout', text: msg.text });
          break;

        case 'stderr':
          append({ type: 'stderr', text: msg.text });
          break;

        case 'result':
          append({ type: 'result', text: msg.text });
          break;

        case 'info':
          append({ type: 'info', text: msg.text });
          break;

        // Package downloads are unbounded in length, so hold the execution
        // timeout until they finish, then start the clock on the code itself.
        case 'packages-start':
          clearExecTimeout();
          break;

        case 'packages-done':
          clearExecTimeout();
          timeoutRef.current = setTimeout(() => {
            append({
              type: 'stderr',
              text: `⚠ Stopped after ${EXEC_TIMEOUT / 1000}s with no end in sight. Restarting Python…`,
            });
            setRestarting(true);
            spawnWorker();
          }, EXEC_TIMEOUT);
          break;

        case 'done':
          clearExecTimeout();
          setStatus('ready');
          if (typeof msg.ms === 'number') {
            append({
              type: 'info',
              text:
                msg.ms < 1000
                  ? `✓ Finished in ${msg.ms} ms`
                  : `✓ Finished in ${(msg.ms / 1000).toFixed(2)} s`,
            });
          }
          break;

        case 'error':
          append({ type: 'stderr', text: msg.text });
          clearExecTimeout();
          setStatus('ready');
          break;
      }
    };

    worker.postMessage({ type: 'init' });
    setStatus('loading');
  }, [append, clearExecTimeout]);

  /* ── Boot worker on mount ───────── */
  useEffect(() => {
    spawnWorker();
    return () => {
      clearExecTimeout();
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [clearExecTimeout, spawnWorker]);

  /* ── Run user code ──────────────── */
  const runCode = useCallback(
    (code: string, stdin: string) => {
      if (!workerRef.current) return;

      if (statusRef.current === 'loading') {
        append({ type: 'info', text: 'Python is still starting up. One moment…' });
        return;
      }
      if (statusRef.current !== 'ready') return;

      if (!code.trim()) {
        append({ type: 'info', text: 'Nothing to run: the editor is empty.' });
        return;
      }

      setStatus('running');
      append({ type: 'info', text: '▸ Running…' });
      workerRef.current.postMessage({ type: 'run', code, stdin });
    },
    [append],
  );

  /* ── Stop a running program ─────── */
  const stop = useCallback(() => {
    if (statusRef.current !== 'running') return;
    append({ type: 'info', text: '■ Stopped. Restarting Python…' });
    setRestarting(true);
    spawnWorker();
  }, [append, spawnWorker]);

  /* ── Clear output ───────────────── */
  const clearOutput = useCallback(() => {
    setOutput([]);
  }, []);

  return { status, output, version, restarting, runCode, stop, clearOutput };
}
