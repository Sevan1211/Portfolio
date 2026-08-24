import React from 'react';
import { PyStatus } from '../core/types';

interface LoadingOverlayProps {
  status: PyStatus;
  restarting: boolean;
}

/**
 * Win95-styled overlay shown while the Pyodide WASM downloads (or the
 * interpreter respawns after Stop), with the classic segmented-blocks
 * progress marquee.
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  status,
  restarting,
}) => {
  if (status !== 'loading' && status !== 'idle') return null;

  return (
    <div className="py-loading">
      <div className="py-loading__box">
        <div className="py-loading__icon">🐍</div>
        <div className="py-loading__text">
          {restarting ? 'Restarting Python…' : 'Loading Python…'}
        </div>
        <div className="py-loading__bar-track">
          <div className="py-loading__bar-fill" />
        </div>
        <div className="py-loading__hint">
          {restarting
            ? 'Spinning up a fresh interpreter'
            : 'Downloading the interpreter (~10 MB, cached after the first visit)'}
        </div>
      </div>
    </div>
  );
};
