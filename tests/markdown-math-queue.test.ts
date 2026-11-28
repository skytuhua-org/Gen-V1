import { describe, expect, it } from 'vitest';
import {
  createMathRenderQueue,
  MATH_RENDER_QUEUE_LIMITS,
  type MathRenderJob,
  type MathRenderResult,
} from '../apps/web/src/math-render-queue.ts';

/** Deterministic frame driver: callbacks queue up and run only when stepped. */
function driver() {
  let nextId = 1;
  const queued = new Map<number, () => void>();
  return {
    scheduler: {
      request: (cb: () => void) => {
        const id = nextId++;
        queued.set(id, cb);
        return id;
      },
      cancel: (id: number) => {
        queued.delete(id);
      },
    },
    step(frames = 1) {
      for (let i = 0; i < frames; i++) {
        const batch = [...queued.values()];
        queued.clear();
        for (const cb of batch) cb();
        if (queued.size === 0 && batch.length === 0) break;
      }
    },
    get pendingFrames() {
      return queued.size;
    },
  };
}

interface JobSpec {
  ownerKey?: string;
  sourceRevision?: number;
  leafKey?: string;
  elements?: number;
  result?: MathRenderResult;
  current?: boolean;
  eligible?: boolean;
  throwOnRender?: boolean;
}

function makeJob(spec: JobSpec, spies: {
  renders: string[];
  commits: string[];
  fails: [string, string][];
}) {
  const leafKey = spec.leafKey ?? 'leaf';
  const job: MathRenderJob = {
    ownerKey: spec.ownerKey ?? 'owner',
    sourceRevision: spec.sourceRevision ?? 1,
    leafKey,
    raw: '$x$',
    mode: 'inline',
    tex: 'x',
    isCurrent: () => spec.current !== false,
    eligible: () => spec.eligible !== false,
    render: () => {
      spies.renders.push(leafKey);
      if (spec.throwOnRender) throw new Error('engine exploded');
      return spec.result ?? { kind: 'rendered', elements: spec.elements ?? 4 };
    },
    commit: () => {
      spies.commits.push(leafKey);
    },
    fail: (reason) => {
      spies.fails.push([leafKey, reason]);
    },
  };
  return job;
}

function harness() {
  const spies = { renders: [] as string[], commits: [] as string[], fails: [] as [string, string][] };
  const drive = driver();
  const queue = createMathRenderQueue('owner', 1, drive.scheduler);
  return { spies, drive, queue };
}

describe('math render queue scheduling', () => {
  it('renders at most one job per frame in insertion order', () => {
    const { spies, drive, queue } = harness();
    queue.enqueue(makeJob({ leafKey: 'a' }, spies));
    queue.enqueue(makeJob({ leafKey: 'b' }, spies));
    queue.enqueue(makeJob({ leafKey: 'c' }, spies));
    expect(drive.pendingFrames).toBe(1);
    drive.step();
    expect(spies.renders).toEqual(['a']);
    expect(spies.commits).toEqual(['a']);
    drive.step();
    expect(spies.renders).toEqual(['a', 'b']);
    drive.step();
    expect(spies.renders).toEqual(['a', 'b', 'c']);
    expect(drive.pendingFrames).toBe(0);
  });

  it('skips ineligible jobs without polling and re-arms on resume', () => {
    const { spies, drive, queue } = harness();
    const gate = { open: false };
    const job = makeJob({ leafKey: 'blocked' }, spies);
    job.eligible = () => gate.open;
    queue.enqueue(job);
    drive.step(5);
    expect(spies.renders).toEqual([]);
    expect(drive.pendingFrames).toBe(0); // no busy polling once all deferred
    drive.step(3);
    expect(spies.renders).toEqual([]);
    gate.open = true;
    queue.resume();
    expect(drive.pendingFrames).toBe(1);
    drive.step();
    expect(spies.renders).toEqual(['blocked']);
  });

  it('renders a later eligible job while an earlier one is deferred', () => {
    const { spies, drive, queue } = harness();
    const gate = { open: false };
    const blocked = makeJob({ leafKey: 'first' }, spies);
    blocked.eligible = () => gate.open;
    queue.enqueue(blocked);
    queue.enqueue(makeJob({ leafKey: 'second' }, spies));
    drive.step();
    expect(spies.renders).toEqual(['second']);
  });
});

describe('owner, revision and token identity', () => {
  it('rejects jobs of a foreign owner even when callbacks report true', () => {
    const { spies, drive, queue } = harness();
    queue.enqueue(makeJob({ leafKey: 'alien', ownerKey: 'other' }, spies));
    drive.step(3);
    expect(spies.renders).toEqual([]);
    expect(spies.commits).toEqual([]);
    expect(spies.fails).toEqual([]);
  });

  it('invalidate drops pending work but keeps accepted counts for the budget', () => {
    const { spies, drive, queue } = harness();
    queue.enqueue(makeJob({ leafKey: 'kept', elements: 2048 }, spies));
    drive.step();
    expect(spies.commits).toEqual(['kept']);
    queue.enqueue(makeJob({ leafKey: 'dropped' }, spies));
    queue.invalidate('owner', 2);
    drive.step(2);
    expect(spies.renders).toEqual(['kept']); // dropped never rendered
    // Revision-2 work sees the remaining budget including retained siblings:
    // exactly three more cap-sized jobs fit, a one-element probe does not.
    for (const leafKey of ['next-a', 'next-b', 'next-c']) {
      queue.enqueue(makeJob({ leafKey, sourceRevision: 2, elements: 2048 }, spies));
    }
    drive.step(3);
    expect(spies.commits).toEqual(['kept', 'next-a', 'next-b', 'next-c']);
    const over = makeJob({ leafKey: 'over', sourceRevision: 2, elements: 1 }, spies);
    queue.enqueue(over);
    drive.step(2);
    expect(spies.fails).toEqual([['over', 'budget']]);
    expect(spies.commits).not.toContain('over');
  });

  it('mismatched revision is rejected even when callbacks lie', () => {
    const { spies, drive, queue } = harness();
    queue.enqueue(makeJob({ leafKey: 'stale-rev', sourceRevision: 99 }, spies));
    drive.step(2);
    expect(spies.renders).toEqual([]);
  });

  it('an old handle cannot release a same-leafKey replacement', () => {
    const { spies, drive, queue } = harness();
    const first = queue.enqueue(makeJob({ leafKey: 'leaf', elements: 100 }, spies));
    drive.step();
    const second = queue.enqueue(makeJob({ leafKey: 'leaf', elements: 200 }, spies));
    drive.step();
    expect(spies.commits).toEqual(['leaf', 'leaf']);
    first.release(); // releases only the first token's 100
    second.release(); // releases only the second token's 200
    // If the old handle had released the replacement's token instead, 100
    // elements would still be stuck and the fourth cap-sized filler could
    // not commit.
    for (const leafKey of ['fill-a', 'fill-b', 'fill-c', 'fill-d']) {
      queue.enqueue(makeJob({ leafKey, elements: 2048 }, spies));
    }
    drive.step(4);
    expect(spies.commits).toEqual(['leaf', 'leaf', 'fill-a', 'fill-b', 'fill-c', 'fill-d']);
  });
});

describe('node budget enforcement', () => {
  it('admits exactly the per-result bound and rejects one element over', () => {
    const { spies, drive, queue } = harness();
    queue.enqueue(makeJob({ leafKey: 'max', elements: MATH_RENDER_QUEUE_LIMITS.maxPerResult }, spies));
    queue.enqueue(makeJob({ leafKey: 'over', elements: MATH_RENDER_QUEUE_LIMITS.maxPerResult + 1 }, spies));
    drive.step(2);
    expect(spies.commits).toEqual(['max']);
    expect(spies.fails).toEqual([['over', 'budget']]);
  });

  it.each([
    ['fractional', 3.5],
    ['negative', -1],
    ['nonfinite', Infinity],
    ['nan', NaN],
  ])('rejects %s element counts before commit', (_label, elements) => {
    const { spies, drive, queue } = harness();
    queue.enqueue(makeJob({ leafKey: 'bad', elements }, spies));
    drive.step();
    expect(spies.commits).toEqual([]);
    expect(spies.fails).toEqual([['bad', 'budget']]);
  });

  it('enforces the aggregate remaining budget across accepted siblings', () => {
    const { spies, drive, queue } = harness();
    queue.enqueue(makeJob({ leafKey: 'a', elements: 2048 }, spies));
    queue.enqueue(makeJob({ leafKey: 'b', elements: 2048 }, spies));
    queue.enqueue(makeJob({ leafKey: 'c', elements: 2048 }, spies));
    queue.enqueue(makeJob({ leafKey: 'd', elements: 2047 }, spies));
    drive.step(4);
    expect(spies.commits).toEqual(['a', 'b', 'c', 'd']);
    queue.enqueue(makeJob({ leafKey: 'e', elements: 2 }, spies));
    drive.step();
    expect(spies.fails).toEqual([['e', 'budget']]);
    queue.enqueue(makeJob({ leafKey: 'f', elements: 1 }, spies));
    drive.step();
    expect(spies.commits).toContain('f');
  });

  it('failed results never consume accepted budget', () => {
    const { spies, drive, queue } = harness();
    queue.enqueue(makeJob({ leafKey: 'parse-fail', result: { kind: 'source', reason: 'parse' } }, spies));
    drive.step();
    expect(spies.fails).toEqual([['parse-fail', 'parse']]);
    for (const leafKey of ['fill-a', 'fill-b', 'fill-c', 'fill-d']) {
      queue.enqueue(makeJob({ leafKey, elements: 2048 }, spies));
    }
    drive.step(4);
    expect(spies.commits).toEqual(['fill-a', 'fill-b', 'fill-c', 'fill-d']);
  });
});

describe('failure and cancellation paths', () => {
  it('a throwing render becomes an engine failure for that job only', () => {
    const { spies, drive, queue } = harness();
    queue.enqueue(makeJob({ leafKey: 'boom', throwOnRender: true }, spies));
    queue.enqueue(makeJob({ leafKey: 'sibling' }, spies));
    drive.step(2);
    expect(spies.fails).toEqual([['boom', 'engine']]);
    expect(spies.commits).toEqual(['sibling']);
  });

  it('a throwing commit does not consume budget or clear siblings', () => {
    const spies = { renders: [] as string[], commits: [] as string[], fails: [] as [string, string][] };
    const drive = driver();
    const queue = createMathRenderQueue('owner', 1, drive.scheduler);
    const job = makeJob({ leafKey: 'commit-throws', elements: 2048 }, spies);
    job.commit = () => {
      throw new Error('leaf commit exploded');
    };
    queue.enqueue(job);
    drive.step();
    expect(spies.fails).toEqual([['commit-throws', 'engine']]);
    queue.enqueue(makeJob({ leafKey: 'after', elements: 2048 }, spies));
    drive.step();
    expect(spies.commits).toEqual(['after']);
  });

  it('a throwing fail callback cannot clear sibling state', () => {
    const spies = { renders: [] as string[], commits: [] as string[], fails: [] as [string, string][] };
    const drive = driver();
    const queue = createMathRenderQueue('owner', 1, drive.scheduler);
    const bad = makeJob({ leafKey: 'bad-fail', result: { kind: 'source', reason: 'parse' } }, spies);
    bad.fail = () => {
      throw new Error('fail handler exploded');
    };
    queue.enqueue(bad);
    queue.enqueue(makeJob({ leafKey: 'sibling' }, spies));
    expect(() => drive.step(2)).not.toThrow();
    expect(spies.commits).toEqual(['sibling']);
  });

  it('cancel removes only its own pending job; duplicate cancel is safe', () => {
    const { spies, drive, queue } = harness();
    const handle = queue.enqueue(makeJob({ leafKey: 'cancelled' }, spies));
    queue.enqueue(makeJob({ leafKey: 'survivor' }, spies));
    handle.cancel();
    handle.cancel();
    drive.step(2);
    expect(spies.renders).toEqual(['survivor']);
  });

  it('queue overflow never commits and does not starve admitted work', () => {
    const { spies, drive, queue } = harness();
    for (let i = 0; i < MATH_RENDER_QUEUE_LIMITS.maxPendingJobs; i++) {
      queue.enqueue(makeJob({ leafKey: 'job-' + i }, spies));
    }
    queue.enqueue(makeJob({ leafKey: 'overflow' }, spies));
    drive.step(1);
    expect(spies.renders).toEqual(['job-0']);
    expect(spies.fails).toContainEqual(['overflow', 'budget']);
    drive.step(MATH_RENDER_QUEUE_LIMITS.maxPendingJobs + 2);
    expect(spies.commits).not.toContain('overflow');
    expect(spies.commits).toHaveLength(MATH_RENDER_QUEUE_LIMITS.maxPendingJobs);
  });

  it('dispose permanently cancels; resume and enqueue after dispose are inert', () => {
    const { spies, drive, queue } = harness();
    queue.enqueue(makeJob({ leafKey: 'a' }, spies));
    queue.dispose();
    drive.step(3);
    expect(spies.renders).toEqual([]);
    queue.resume();
    queue.enqueue(makeJob({ leafKey: 'b' }, spies));
    drive.step(2);
    expect(spies.renders).toEqual([]);
    expect(drive.pendingFrames).toBe(0);
  });
});

describe('long-run accounting hygiene', () => {
  it('returns handles, jobs and budget to zero across 100 cycles', () => {
    const { spies, drive, queue } = harness();
    for (let cycle = 0; cycle < 100; cycle++) {
      const handle = queue.enqueue(makeJob({ leafKey: 'cycle-' + cycle, elements: 2048 }, spies));
      drive.step();
      handle.release();
    }
    expect(spies.commits).toHaveLength(100);
    // Full budget is available again after every release.
    for (const leafKey of ['final-a', 'final-b', 'final-c', 'final-d']) {
      queue.enqueue(makeJob({ leafKey, elements: 2048 }, spies));
    }
    drive.step(4);
    expect(spies.commits).toEqual(expect.arrayContaining(['final-a', 'final-b', 'final-c', 'final-d']));
  });

  it('release is idempotent and cannot double-free the budget', () => {
    const { spies, drive, queue } = harness();
    const handle = queue.enqueue(makeJob({ leafKey: 'x', elements: 100 }, spies));
    drive.step();
    handle.release();
    handle.release();
    // The budget is exactly full again: four cap-sized jobs commit and a
    // one-element probe beyond the aggregate does not.
    for (const leafKey of ['y-a', 'y-b', 'y-c', 'y-d']) {
      queue.enqueue(makeJob({ leafKey, elements: 2048 }, spies));
    }
    drive.step(4);
    expect(spies.commits).toEqual(['x', 'y-a', 'y-b', 'y-c', 'y-d']);
    queue.enqueue(makeJob({ leafKey: 'z', elements: 1 }, spies));
    drive.step();
    expect(spies.fails).toEqual([['z', 'budget']]);
  });
});
