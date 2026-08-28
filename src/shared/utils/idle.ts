export interface IdleTaskDeadline {
  readonly didTimeout: boolean;
  timeRemaining: () => number;
}

interface IdleTaskOptions {
  fallbackDelay?: number;
  timeout?: number;
}

type IdleCallbackWindow = Window & {
  cancelIdleCallback?: (handle: number) => void;
  requestIdleCallback?: (
    callback: (deadline: IdleTaskDeadline) => void,
    options?: { timeout: number },
  ) => number;
};

/**
 * Schedules non-urgent browser work without assuming requestIdleCallback is
 * available. The returned function cancels whichever scheduler was used.
 */
export function scheduleIdleTask(
  task: (deadline: IdleTaskDeadline) => void,
  { fallbackDelay = 16, timeout = 600 }: IdleTaskOptions = {},
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const idleWindow = window as IdleCallbackWindow;
  if (idleWindow.requestIdleCallback) {
    const handle = idleWindow.requestIdleCallback(task, { timeout });
    return () => idleWindow.cancelIdleCallback?.(handle);
  }

  const handle = window.setTimeout(
    () => task({ didTimeout: true, timeRemaining: () => 0 }),
    fallbackDelay,
  );
  return () => window.clearTimeout(handle);
}
