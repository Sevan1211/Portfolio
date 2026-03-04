import React from 'react';
import { PyStatus } from '../core/types';

interface LoadingOverlayProps {
  status: PyStatus;
}

/**
 * Retro-styled loading overlay shown while Pyodide WASM downloads.
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ status }) => {
  if (status !== 'loading' && status !== 'idle') return null;

  return (
    <div className="py-loading">
      <div className="py-loading__box">
        <div className="py-loading__icon">🐍</div>
        <div className="py-loading__text">Loading Python...</div>
        <div className="py-loading__bar-track">
          <div className="py-loading__bar-fill" />
        </div>
        <div className="py-loading__hint">
          Downloading interpreter (~10 MB)
        </div>
      </div>
    </div>
  );
};
