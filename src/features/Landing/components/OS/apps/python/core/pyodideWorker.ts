/**
 * Pyodide Web Worker
 *
 * Runs the Python interpreter off the main thread so the UI never freezes.
 * Uses dynamic import() since Vite ?worker creates ES-module workers
 * where importScripts() is not available.
 */

/* eslint-disable no-restricted-globals */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx: any = self;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pyodide: any = null;

const PYODIDE_VERSION = '0.27.4';
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

async function initPyodide() {
  ctx.postMessage({ type: 'status', status: 'loading' });

  try {
    // Dynamic import works in ES-module workers (Vite ?worker)
    const mod = await import(
      /* @vite-ignore */
      `${PYODIDE_CDN}pyodide.mjs`
    );

    pyodide = await mod.loadPyodide({
      indexURL: PYODIDE_CDN,
    });

    ctx.postMessage({ type: 'status', status: 'ready' });
  } catch (err) {
    ctx.postMessage({ type: 'error', text: `Failed to load Python: ${err}` });
  }
}

async function runCode(code: string) {
  if (!pyodide) {
    ctx.postMessage({ type: 'error', text: 'Python is not loaded yet.' });
    return;
  }

  try {
    // Set up stdout/stderr capture via Python's io module
    pyodide.runPython(`
import sys, io
__stdout_capture = io.StringIO()
__stderr_capture = io.StringIO()
sys.stdout = __stdout_capture
sys.stderr = __stderr_capture
`);

    // Execute user code
    let result;
    try {
      result = await pyodide.runPythonAsync(code);
    } catch (pyErr: unknown) {
      // Python exception – capture what's in stderr, then add the traceback
      const stderr: string = pyodide.runPython('__stderr_capture.getvalue()');
      const stdout: string = pyodide.runPython('__stdout_capture.getvalue()');

      // Restore streams
      pyodide.runPython(`sys.stdout = sys.__stdout__\nsys.stderr = sys.__stderr__`);

      if (stdout) ctx.postMessage({ type: 'stdout', text: stdout });
      if (stderr) ctx.postMessage({ type: 'stderr', text: stderr });

      const msg = pyErr instanceof Error ? pyErr.message : String(pyErr);
      ctx.postMessage({ type: 'stderr', text: msg });
      ctx.postMessage({ type: 'done' });
      return;
    }

    // Capture buffered output
    const stdout: string = pyodide.runPython('__stdout_capture.getvalue()');
    const stderr: string = pyodide.runPython('__stderr_capture.getvalue()');

    // Restore streams
    pyodide.runPython(`sys.stdout = sys.__stdout__\nsys.stderr = sys.__stderr__`);

    if (stdout) ctx.postMessage({ type: 'stdout', text: stdout });
    if (stderr) ctx.postMessage({ type: 'stderr', text: stderr });
    if (result !== undefined && result !== null) {
      ctx.postMessage({ type: 'result', text: String(result) });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    ctx.postMessage({ type: 'stderr', text: msg });
  }

  ctx.postMessage({ type: 'done' });
}

ctx.addEventListener('message', (e: MessageEvent) => {
  const { type, code } = e.data;

  if (type === 'init') {
    initPyodide();
  } else if (type === 'run') {
    runCode(code);
  }
});
