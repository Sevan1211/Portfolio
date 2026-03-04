/**
 * Python IDE – Type Definitions
 */

export interface PyOutputLine {
  type: 'stdout' | 'stderr' | 'info' | 'result';
  text: string;
}

export type PyStatus = 'idle' | 'loading' | 'ready' | 'running';
