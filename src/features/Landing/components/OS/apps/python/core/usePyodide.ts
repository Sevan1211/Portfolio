/**
 * usePyodide – React hook that manages the Pyodide Web Worker lifecycle.
 *
 * Returns the current status, output lines, the Python version, and
 * runCode() / stop() / clearOutput() controls.
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { PyOutputLine, PyStatus } from "./types";
import {
  EXECUTION_TIME_LIMIT_MS,
  OUTPUT_CHARACTER_LIMIT,
  PACKAGE_SETUP_LIMIT_MS,
  PYODIDE_BOOT_LIMIT_MS,
  executionLimitLabel,
} from "./executionLimits";

// Vite handles ?worker imports, creating a proper blob URL worker.
import PyWorker from "./pyodideWorker?worker";

const MAX_CONSOLE_ENTRIES = 400;

export function usePyodide() {
  const [status, setStatus] = useState<PyStatus>("idle");
  const [output, setOutput] = useState<PyOutputLine[]>([]);
  const [version, setVersion] = useState<string | null>(null);
  const [restarting, setRestarting] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusRef = useRef<PyStatus>("idle");
  statusRef.current = status;

  const append = useCallback((line: PyOutputLine) => {
    setOutput((prev) => [...prev.slice(-(MAX_CONSOLE_ENTRIES - 1)), line]);
  }, []);

  const clearWatchdog = useCallback(() => {
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
    clearWatchdog();
    workerRef.current?.terminate();

    const worker = new PyWorker();
    workerRef.current = worker;

    const restartAfterVerdict = (line: PyOutputLine) => {
      if (workerRef.current !== worker) return;
      append(line);
      setRestarting(true);
      spawnWorker();
    };

    const armWatchdog = (ms: number, onExpired: () => void) => {
      clearWatchdog();
      timeoutRef.current = setTimeout(onExpired, ms);
    };

    worker.onmessage = (e: MessageEvent) => {
      if (workerRef.current !== worker) return;
      const msg = e.data;

      switch (msg.type) {
        case "status":
          setStatus(msg.status as PyStatus);
          if (msg.status === "ready") {
            clearWatchdog();
            setRestarting(false);
            if (msg.version) setVersion(msg.version as string);
            append({
              type: "info",
              text: `✓ Python ${msg.version ?? "3"} ready.`,
            });
          }
          break;

        case "stdout":
          append({ type: "stdout", text: msg.text });
          break;

        case "stderr":
          append({ type: "stderr", text: msg.text });
          break;

        case "result":
          append({ type: "result", text: msg.text });
          break;

        case "info":
          append({ type: "info", text: msg.text });
          break;

        case "output-limit":
          restartAfterVerdict({
            type: "stderr",
            text: `Output Limit Exceeded — stopped after ${OUTPUT_CHARACTER_LIMIT.toLocaleString()} characters to keep this page responsive.`,
          });
          break;

        // Package setup gets a separate, longer deadline. The short judge
        // clock starts only after imported packages are ready.
        case "packages-start":
          armWatchdog(PACKAGE_SETUP_LIMIT_MS, () => {
            restartAfterVerdict({
              type: "stderr",
              text: "Environment Setup Timed Out — Python is restarting. Check your connection, then run the code again.",
            });
          });
          break;

        case "packages-done":
          armWatchdog(EXECUTION_TIME_LIMIT_MS, () => {
            restartAfterVerdict({
              type: "stderr",
              text: `Time Limit Exceeded — execution stopped after ${executionLimitLabel}. Python is restarting.`,
            });
          });
          break;

        case "done":
          clearWatchdog();
          setStatus("ready");
          if (typeof msg.ms === "number") {
            append({
              type: "info",
              text:
                msg.ms < 1000
                  ? `✓ Finished in ${msg.ms} ms`
                  : `✓ Finished in ${(msg.ms / 1000).toFixed(2)} s`,
            });
          }
          break;

        case "fatal":
          append({ type: "stderr", text: msg.text });
          clearWatchdog();
          setRestarting(false);
          setStatus("error");
          break;
      }
    };

    worker.onerror = () => {
      restartAfterVerdict({
        type: "stderr",
        text: "The Python worker stopped unexpectedly. A clean interpreter is starting now.",
      });
    };

    worker.postMessage({ type: "init" });
    setStatus("loading");
    armWatchdog(PYODIDE_BOOT_LIMIT_MS, () => {
      if (workerRef.current !== worker) return;
      worker.terminate();
      workerRef.current = null;
      append({
        type: "stderr",
        text: "Python took too long to start. Close and reopen the Python IDE to retry.",
      });
      setRestarting(false);
      setStatus("error");
    });
  }, [append, clearWatchdog]);

  /* ── Boot worker on mount ───────── */
  useEffect(() => {
    spawnWorker();
    return () => {
      clearWatchdog();
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [clearWatchdog, spawnWorker]);

  /* ── Run user code ──────────────── */
  const runCode = useCallback(
    (code: string, stdin: string) => {
      if (!workerRef.current) return;

      if (statusRef.current === "loading") {
        append({
          type: "info",
          text: "Python is still starting up. One moment…",
        });
        return;
      }
      if (statusRef.current !== "ready") return;

      if (!code.trim()) {
        append({ type: "info", text: "Nothing to run: the editor is empty." });
        return;
      }

      setStatus("running");
      append({
        type: "info",
        text: `▸ Running with a ${executionLimitLabel} limit…`,
      });
      clearWatchdog();
      timeoutRef.current = setTimeout(() => {
        if (statusRef.current !== "running") return;
        append({
          type: "stderr",
          text: "Python did not begin environment setup. The interpreter is restarting.",
        });
        setRestarting(true);
        spawnWorker();
      }, PACKAGE_SETUP_LIMIT_MS);
      workerRef.current.postMessage({ type: "run", code, stdin });
    },
    [append, clearWatchdog, spawnWorker],
  );

  /* ── Stop a running program ─────── */
  const stop = useCallback(() => {
    if (statusRef.current !== "running") return;
    append({ type: "info", text: "■ Stopped. Restarting Python…" });
    setRestarting(true);
    spawnWorker();
  }, [append, spawnWorker]);

  /* ── Clear output ───────────────── */
  const clearOutput = useCallback(() => {
    setOutput([]);
  }, []);

  return { status, output, version, restarting, runCode, stop, clearOutput };
}
