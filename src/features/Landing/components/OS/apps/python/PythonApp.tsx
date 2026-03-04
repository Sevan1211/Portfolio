import React, { useState, useCallback } from 'react';
import { usePyodide } from './core/usePyodide';
import { Toolbar } from './components/Toolbar';
import { CodeEditor } from './components/CodeEditor';
import { OutputPanel } from './components/OutputPanel';
import { LoadingOverlay } from './components/LoadingOverlay';
import './styles/index.css';

const DEFAULT_CODE = '';

export const PythonApp: React.FC = () => {
  const { status, output, runCode, clearOutput } = usePyodide();
  const [code, setCode] = useState(DEFAULT_CODE);

  const handleRun = useCallback(() => {
    runCode(code);
  }, [runCode, code]);

  return (
    <div className="app-content py-app">
      <LoadingOverlay status={status} />
      <Toolbar
        status={status}
        onRun={handleRun}
        onClear={clearOutput}
      />
      <div className="py-layout">
        <CodeEditor
          value={code}
          onChange={setCode}
          onRun={handleRun}
          disabled={status === 'running'}
        />
        <OutputPanel lines={output} />
      </div>
    </div>
  );
};
