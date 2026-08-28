import React from "react";
import { useGLTF } from "@react-three/drei";

interface ModelRetryBoundaryProps {
  modelPath: string;
  children: React.ReactNode;
}

interface ModelRetryBoundaryState {
  failed: boolean;
  attempt: number;
}

/**
 * A transient 503 or network blip on the model download must never strand
 * the site on its loading screen. When anything below throws (useGLTF
 * rejects by suspending into an error), this boundary clears drei's cached
 * promise for the model and remounts the subtree after an exponential
 * backoff, retrying until the room loads. While waiting, rendering null
 * simply keeps the loading globe on screen.
 */
export class ModelRetryBoundary extends React.Component<
  ModelRetryBoundaryProps,
  ModelRetryBoundaryState
> {
  override state: ModelRetryBoundaryState = { failed: false, attempt: 0 };
  private retryTimer = 0;

  static getDerivedStateFromError(): Partial<ModelRetryBoundaryState> {
    return { failed: true };
  }

  override componentDidCatch(error: unknown): void {
    console.warn("3D scene failed to load, retrying…", error);
    useGLTF.clear(this.props.modelPath);
    const delay = Math.min(5000, 1000 * 2 ** this.state.attempt);
    window.clearTimeout(this.retryTimer);
    this.retryTimer = window.setTimeout(() => {
      this.setState((previous) => ({
        failed: false,
        attempt: previous.attempt + 1,
      }));
    }, delay);
  }

  override componentWillUnmount(): void {
    window.clearTimeout(this.retryTimer);
  }

  override render(): React.ReactNode {
    if (this.state.failed) return null;
    // Remount everything on each attempt so useGLTF re-fetches.
    return (
      <React.Fragment key={this.state.attempt}>
        {this.props.children}
      </React.Fragment>
    );
  }
}
