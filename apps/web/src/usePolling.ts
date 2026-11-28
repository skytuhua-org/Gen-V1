import {useEffect, useRef} from 'react';

/** Shared polling driver for panels that refresh on a fixed timer. Pauses
 * while the document is hidden, runs once immediately when the document
 * becomes visible again, and backs off (doubling the interval, capped at
 * 60 s) after consecutive task failures. Task rejections are counted and
 * surfaced through `onError` when provided — panels keep their existing
 * silent or error-state UI. */

const MAX_BACKOFF_MS = 60_000;

export interface Polling {
  /** Cancels any pending run and stops listening for visibility changes. */
  stop: () => void;
}

export interface PollingTaskState {
  /** True once the owning polling lifecycle has been disposed. */
  readonly disposed: boolean;
}

export function createPolling(task: (state: PollingTaskState) => unknown, intervalMs: number, onError?: (cause: unknown) => void): Polling {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let failures = 0;
  let running = false;
  let stopped = false;
  const taskState = { disposed: false };
  const clearPending = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  };
  const schedule = (delay: number) => {
    if (!stopped && document.visibilityState !== 'hidden') timer = setTimeout(fire, delay);
  };
  const fire = () => {
    timer = null;
    if (stopped || running || document.visibilityState === 'hidden') return;
    running = true;
    void Promise.resolve().then(() => task(taskState))
      .then(() => { failures = 0; })
      .catch(cause => { failures += 1; if (!taskState.disposed) onError?.(cause); })
      .finally(() => { running = false; schedule(Math.min(intervalMs * 2 ** failures, MAX_BACKOFF_MS)); });
  };
  const visible = () => {
    clearPending();
    if (document.visibilityState === 'visible') { failures = 0; fire(); }
  };
  document.addEventListener('visibilitychange', visible);
  schedule(0);
  return {
    stop() {
      stopped = true;
      taskState.disposed = true;
      clearPending();
      document.removeEventListener('visibilitychange', visible);
    },
  };
}


export function useDisposal(): PollingTaskState {
  const state = useRef({ disposed: false });
  useEffect(() => {
    state.current.disposed = false;
    return () => { state.current.disposed = true; };
  }, []);
  return state.current;
}

export function usePolling(task: (state: PollingTaskState) => unknown, intervalMs: number, onError?: (cause: unknown) => void) {
  useEffect(() => createPolling(task, intervalMs, onError).stop, [task, intervalMs, onError]);
}
