/**
 * Pure owner-scoped math render queue (MTH08, PARALLEL-RENDERERS-R1).
 *
 * Enforces one expression render per frame, a finite node budget and
 * cancellation-safe ownership independently of React and KaTeX. The queue
 * never inspects the DOM, holds no source cache, imports no engine, retries
 * nothing and shares no macro state: owners capture their targets in the
 * job closures they hand over.
 *
 * Accounting rules:
 * - at most MAX_PENDING_JOBS jobs are admitted to the pending queue;
 * - one synchronous render callback per animation-frame callback;
 * - accepted elements are bounded per result (MAX_PER_RESULT) and in
 *   aggregate (MAX_TOTAL_ELEMENTS); failed or stale work never consumes
 *   accepted budget;
 * - accepted counts are keyed by job token, never by leafKey, so an old
 *   handle cannot release a same-key replacement;
 * - invalidate() swaps the active owner/revision and drops pending work,
 *   but accepted token counts survive until their handles release them.
 */

export const MATH_RENDER_QUEUE_LIMITS = {
  maxPendingJobs: 64,
  maxTotalElements: 8192,
  maxPerResult: 2048,
} as const;

export type MathRenderResult =
  | { kind: 'rendered'; elements: number }
  | { kind: 'source'; reason: 'parse' | 'budget' | 'engine' };

export interface MathRenderJob {
  ownerKey: string;
  sourceRevision: number;
  leafKey: string;
  raw: string;
  mode: 'inline' | 'display';
  tex: string;
  isCurrent: () => boolean;
  eligible: () => boolean;
  render: (remainingNodes: number) => MathRenderResult;
  commit: () => void;
  fail: (reason: 'parse' | 'budget' | 'engine') => void;
}

export interface MathRenderHandle {
  cancel: () => void;
  release: () => void;
}

export interface MathRenderQueue {
  enqueue: (job: MathRenderJob) => MathRenderHandle;
  invalidate: (ownerKey: string, sourceRevision: number) => void;
  resume: () => void;
  dispose: () => void;
}

export interface MathRenderScheduler {
  request: (cb: () => void) => number;
  cancel: (id: number) => void;
}

interface PendingJob {
  token: number;
  job: MathRenderJob;
}

function defaultScheduler(): MathRenderScheduler {
  return {
    request: (cb) => requestAnimationFrame(cb),
    cancel: (id) => cancelAnimationFrame(id),
  };
}

export function createMathRenderQueue(
  ownerKey: string,
  sourceRevision: number,
  schedule?: MathRenderScheduler,
): MathRenderQueue {
  const scheduler = schedule ?? defaultScheduler();
  let activeOwner = ownerKey;
  let activeRevision = sourceRevision;
  let disposed = false;
  let frameId: number | null = null;
  let tokenCounter = 0;
  const pending: PendingJob[] = [];
  // token -> accepted element count. Survives invalidate() until release().
  const accepted = new Map<number, number>();

  const acceptedTotal = () => {
    let total = 0;
    for (const count of accepted.values()) total += count;
    return total;
  };

  const matchesOwner = (job: MathRenderJob) =>
    job.ownerKey === activeOwner && job.sourceRevision === activeRevision;

  const safeCurrent = (job: MathRenderJob) => {
    try {
      return job.isCurrent() === true;
    } catch {
      return false;
    }
  };

  const safeEligible = (job: MathRenderJob) => {
    try {
      return job.eligible() === true;
    } catch {
      return false;
    }
  };

  const failSafe = (job: MathRenderJob, reason: 'parse' | 'budget' | 'engine') => {
    try {
      job.fail(reason);
    } catch {
      // A throwing leaf must not clear sibling or newer-owner state.
    }
  };

  const removePending = (entry: PendingJob) => {
    const index = pending.indexOf(entry);
    if (index !== -1) pending.splice(index, 1);
  };

  const hasWork = () => pending.length > 0;

  function scheduleIfWork() {
    if (disposed || frameId !== null || !hasWork()) return;
    frameId = scheduler.request(frame);
  }

  function cancelFrame() {
    if (frameId !== null) {
      scheduler.cancel(frameId);
      frameId = null;
    }
  }

  function frame() {
    frameId = null;
    if (disposed) return;
    // Scan in source insertion order; temporarily ineligible jobs are
    // deferred without busy polling. Exactly one render callback per frame:
    // after processing one job, re-arm and return.
    for (const entry of [...pending]) {
      if (disposed) return;
      const { job } = entry;
      // Reject mismatched owner/revision even if the callbacks incorrectly
      // report current/eligible.
      if (!matchesOwner(job) || !safeCurrent(job) || !safeEligible(job)) continue;
      const remaining = MATH_RENDER_QUEUE_LIMITS.maxTotalElements - acceptedTotal();
      let result: MathRenderResult;
      try {
        result = job.render(remaining);
      } catch {
        // Exceptions become a fixed engine failure for that still-current job.
        removePending(entry);
        if (matchesOwner(job) && safeCurrent(job)) failSafe(job, 'engine');
        scheduleIfWork();
        return;
      }
      removePending(entry);
      if (result.kind === 'source') {
        if (matchesOwner(job) && safeCurrent(job)) failSafe(job, result.reason);
        scheduleIfWork();
        return;
      }
      const elements = result.elements;
      const valid =
        Number.isInteger(elements) &&
        elements >= 0 &&
        elements <= MATH_RENDER_QUEUE_LIMITS.maxPerResult &&
        elements <= remaining;
      if (!valid) {
        if (matchesOwner(job) && safeCurrent(job)) failSafe(job, 'budget');
        scheduleIfWork();
        return;
      }
      // Recheck identity, currency and eligibility before committing; work
      // gone stale in between neither commits nor fails and consumes nothing.
      if (matchesOwner(job) && safeCurrent(job) && safeEligible(job)) {
        try {
          job.commit();
          accepted.set(entry.token, elements);
        } catch {
          if (matchesOwner(job) && safeCurrent(job)) failSafe(job, 'engine');
        }
      }
      scheduleIfWork();
      return;
    }
    // Every remaining job was deferred: stop scheduling. resume(), enqueue()
    // and invalidate() re-arm the driver after owner state changes.
  }

  return {
    enqueue(job: MathRenderJob): MathRenderHandle {
      const token = ++tokenCounter;
      if (disposed) {
        return { cancel: () => {}, release: () => {} };
      }
      const entry: PendingJob = { token, job };
      if (!matchesOwner(job)) {
        // Foreign owner/revision jobs are dead on arrival: never admitted,
        // never rendered, no callback.
        return {
          cancel: () => {},
          release: () => {
            accepted.delete(token);
          },
        };
      }
      if (pending.length >= MATH_RENDER_QUEUE_LIMITS.maxPendingJobs) {
        // Overflow is never admitted and can never commit, but the leaf must
        // not hang: deliver one bounded budget failure through the scheduler,
        // not synchronously inside the caller's enqueue stack.
        scheduler.request(() => {
          if (!disposed && matchesOwner(job) && safeCurrent(job)) failSafe(job, 'budget');
        });
        return {
          cancel: () => {},
          release: () => {
            accepted.delete(token);
          },
        };
      }
      pending.push(entry);
      scheduleIfWork();
      return {
        cancel: () => {
          removePending(entry);
        },
        release: () => {
          accepted.delete(token);
        },
      };
    },
    invalidate(nextOwner: string, nextRevision: number): void {
      if (disposed) return;
      cancelFrame();
      pending.length = 0;
      activeOwner = nextOwner;
      activeRevision = nextRevision;
    },
    resume(): void {
      if (disposed) return;
      scheduleIfWork();
    },
    dispose(): void {
      if (disposed) return;
      disposed = true;
      cancelFrame();
      pending.length = 0;
      accepted.clear();
    },
  };
}
