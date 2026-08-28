/**
 * Pyodide Web Worker
 *
 * Runs the Python interpreter off the main thread so the UI never freezes.
 * Uses dynamic import() since Vite ?worker creates ES-module workers
 * where importScripts() is not available.
 *
 * Output streams: stdout/stderr are wired through pyodide.setStdout/
 * setStderr in batched (per-line) mode, so print() appears live instead
 * of arriving in one lump when the program ends. input() reads lines
 * from a stdin buffer supplied with each run; when it runs out, Python
 * raises EOFError exactly like a real piped process.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx: any = self;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pyodide: any = null;

const PYODIDE_VERSION = "0.27.4";
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

async function initPyodide() {
  ctx.postMessage({ type: "status", status: "loading" });

  try {
    // Dynamic import works in ES-module workers (Vite ?worker)
    const mod = await import(
      /* @vite-ignore */
      `${PYODIDE_CDN}pyodide.mjs`
    );

    pyodide = await mod.loadPyodide({ indexURL: PYODIDE_CDN });

    // Live output: batched mode delivers one callback per line.
    pyodide.setStdout({
      batched: (text: string) => ctx.postMessage({ type: "stdout", text }),
    });
    pyodide.setStderr({
      batched: (text: string) => ctx.postMessage({ type: "stderr", text }),
    });

    const version: string = pyodide.runPython(
      'import sys; ".".join(map(str, sys.version_info[:3]))',
    );

    ctx.postMessage({ type: "status", status: "ready", version });
  } catch (err) {
    ctx.postMessage({ type: "error", text: `Failed to load Python: ${err}` });
  }
}

/** Feed the run's stdin text to Python line by line; null signals EOF. */
function setStdinLines(text: string) {
  const lines = text.length > 0 ? text.split("\n") : [];
  let next = 0;
  pyodide.setStdin({
    stdin: () => (next < lines.length ? `${lines[next++]}\n` : null),
  });
}

/**
 * Strip Pyodide-internal frames from a traceback so users see their own
 * code's trace, not /lib/python…/_pyodide/ plumbing.
 */
function cleanTraceback(message: string): string {
  const lines = message.split("\n");
  const execIndex = lines.findIndex((line) => line.includes('File "<exec>"'));
  if (execIndex > 0) {
    return [
      "Traceback (most recent call last):",
      ...lines.slice(execIndex),
    ].join("\n");
  }
  return message;
}

async function runCode(code: string, stdinText: string) {
  if (!pyodide) {
    ctx.postMessage({ type: "error", text: "Python is not loaded yet." });
    return;
  }

  // Auto-install any importable packages the code asks for (numpy, pandas,
  // matplotlib, …). Downloads can take a while, so bracket them with
  // messages that pause the main thread's execution timeout.
  try {
    ctx.postMessage({ type: "packages-start" });
    await pyodide.loadPackagesFromImports(code, {
      messageCallback: (text: string) => {
        if (/loading/i.test(text)) ctx.postMessage({ type: "info", text });
      },
      errorCallback: () => {
        /* Unavailable packages surface as a normal Python ImportError. */
      },
    });
  } catch {
    /* Fall through - the import itself will raise a clear error. */
  } finally {
    ctx.postMessage({ type: "packages-done" });
  }

  setStdinLines(stdinText);
  const startedAt = performance.now();

  try {
    const result = await pyodide.runPythonAsync(code);
    if (result !== undefined && result !== null) {
      // PyProxy.toString() gives Python's str(); primitives stringify directly.
      let text: string;
      try {
        text = String(result);
      } catch {
        text = "<unprintable result>";
      }
      ctx.postMessage({ type: "result", text });
      if (typeof result === "object" && typeof result.destroy === "function") {
        try {
          result.destroy();
        } catch {
          /* proxy already collected */
        }
      }
    }
  } catch (pyErr: unknown) {
    const message = pyErr instanceof Error ? pyErr.message : String(pyErr);
    ctx.postMessage({ type: "stderr", text: cleanTraceback(message) });
  }

  ctx.postMessage({
    type: "done",
    ms: Math.round(performance.now() - startedAt),
  });
}

ctx.addEventListener("message", (e: MessageEvent) => {
  const { type, code, stdin } = e.data;

  if (type === "init") {
    initPyodide();
  } else if (type === "run") {
    runCode(code, typeof stdin === "string" ? stdin : "");
  }
});
