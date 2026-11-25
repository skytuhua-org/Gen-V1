import { afterEach, describe, expect, it, vi } from 'vitest';
import { createPowerKeeper, type PowerActivityRead } from '../apps/desktop/power-keeper.ts';
import type { DesktopPowerState } from '../packages/desktop-contract/index.ts';

function fixture(activity: Partial<PowerActivityRead> = {}) {
  const started = new Set<number>(); let next = 0, throwOnStart = false;
  const api = {
    start: vi.fn((_type: 'prevent-app-suspension') => { if (throwOnStart) throw Error('denied'); const id = ++next; started.add(id); return id; }),
    isStarted: vi.fn((id: number) => started.has(id)),
    stop: vi.fn((id: number) => { started.delete(id); }),
  };
  let value: PowerActivityRead = { tasks: 0, schedules: 0, keepAwakeTasks: false, keepAwakeSchedules: false, ...activity }, failures = 0;
  const read = vi.fn(async () => { if (failures-- > 0) throw Error('read failed'); return value; });
  const changes: DesktopPowerState[] = [];
  const keeper = createPowerKeeper({ api, read, onChange: state => changes.push(state), debounceMs: 10, pollMs: 60_000 });
  return { api, read, changes, keeper, started, set: (nextValue: Partial<PowerActivityRead>) => Object.assign(value, nextValue), fail: (count: number) => { failures = count; }, throwStart: () => { throwOnStart = true; } };
}
afterEach(() => { vi.useRealTimers(); });
async function flush() { await vi.advanceTimersByTimeAsync(20); await Promise.resolve(); await Promise.resolve(); }
describe('desktop power keeper', () => {
  it('holds the blocker only while the enabled preference matches live work', async () => {
    vi.useFakeTimers();
    const f = fixture({ tasks: 2, keepAwakeTasks: true });
    await flush();
    expect(f.api.start).toHaveBeenCalledExactlyOnceWith('prevent-app-suspension');
    expect(f.keeper.state()).toEqual({ state: 'holding', reason: 'tasks' });
    expect(f.changes).toEqual([{ state: 'holding', reason: 'tasks' }]);
    f.set({ tasks: 0 });
    f.keeper.schedule();
    await flush();
    expect(f.api.stop).toHaveBeenCalledTimes(1);
    expect(f.keeper.state()).toEqual({ state: 'off' });
  });
  it('publishes idle when work exists but neither preference is enabled', async () => {
    vi.useFakeTimers();
    const f = fixture({ schedules: 1 });
    await flush();
    expect(f.api.start).not.toHaveBeenCalled();
    expect(f.keeper.state()).toEqual({ state: 'idle' });
  });
  it('holds for schedules only when the schedule preference is on, and reports both reasons', async () => {
    vi.useFakeTimers();
    const f = fixture({ tasks: 1, schedules: 1, keepAwakeTasks: true, keepAwakeSchedules: true });
    await flush();
    expect(f.keeper.state()).toEqual({ state: 'holding', reason: 'both' });
  });
  it.each(['tasks', 'schedules'] as const)('reports only the enabled %s holding reason', async reason => {
    vi.useFakeTimers();
    const f = fixture({ tasks: 1, schedules: 1, keepAwakeTasks: reason === 'tasks', keepAwakeSchedules: reason === 'schedules' });
    await flush();
    expect(f.keeper.state()).toEqual({ state: 'holding', reason });
    expect(f.started.size).toBe(1);
  });
  it.each(['release', 'dispose'] as const)('ignores an activity read that finishes after %s', async action => {
    vi.useFakeTimers();
    const f = fixture({ tasks: 1, keepAwakeTasks: true });
    let finish!: (value: PowerActivityRead) => void;
    f.read.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    await flush();
    f.keeper.schedule();
    f.keeper[action]();
    finish({ tasks: 1, schedules: 0, keepAwakeTasks: true, keepAwakeSchedules: false });
    await flush();
    expect(f.started.size).toBe(0);
    expect(f.keeper.state()).toEqual({ state: 'off' });
    expect(f.changes).toEqual([]);
    expect(f.read).toHaveBeenCalledTimes(1);
    f.keeper.schedule();
    await flush();
    expect(f.keeper.state().state).toBe(action === 'release' ? 'holding' : 'off');
  });
  it('cancels a queued activity read when released', async () => {
    vi.useFakeTimers();
    const f = fixture({ tasks: 1, keepAwakeTasks: true });
    f.keeper.release();
    await flush();
    expect(f.read).not.toHaveBeenCalled();
    expect(f.started.size).toBe(0);
  });
  it('does not publish a stale read failure after release', async () => {
    vi.useFakeTimers();
    const f = fixture();
    f.fail(1);
    await flush();
    let reject!: (error: Error) => void;
    f.read.mockImplementationOnce(() => new Promise((_resolve, fail) => { reject = fail; }));
    f.keeper.schedule();
    await flush();
    f.keeper.release();
    reject(Error('old backend disconnected'));
    await flush();
    expect(f.keeper.state()).toEqual({ state: 'off' });
    expect(f.changes).toEqual([]);
  });
  it('serializes bursts into one in-flight read and applies the latest activity', async () => {
    vi.useFakeTimers();
    let resolveRead!: (value: PowerActivityRead) => void;
    const started = new Set<number>(); let next = 0;
    const api = { start: vi.fn(() => { const id = ++next; started.add(id); return id; }), isStarted: (id: number) => started.has(id), stop: vi.fn((id: number) => { started.delete(id); }) };
    const read = vi.fn(() => new Promise<PowerActivityRead>(resolve => { resolveRead = resolve; }));
    const keeper = createPowerKeeper({ api, read, debounceMs: 5, pollMs: 60_000 });
    keeper.schedule(); keeper.schedule();
    await vi.advanceTimersByTimeAsync(10);
    expect(read).toHaveBeenCalledTimes(1);
    resolveRead({ tasks: 1, schedules: 0, keepAwakeTasks: true, keepAwakeSchedules: false });
    await flush();
    expect(keeper.state()).toEqual({ state: 'holding', reason: 'tasks' });
  });
  it('releases and reports unavailable after two consecutive read failures, then recovers', async () => {
    vi.useFakeTimers();
    const f = fixture({ tasks: 1, keepAwakeTasks: true });
    await flush();
    expect(f.keeper.state().state).toBe('holding');
    f.fail(2);
    f.keeper.schedule();
    await flush();
    expect(f.keeper.state()).toEqual({ state: 'holding', reason: 'tasks' });
    f.keeper.schedule();
    await flush();
    expect(f.api.stop).toHaveBeenCalled();
    expect(f.keeper.state()).toEqual({ state: 'unavailable' });
    f.keeper.schedule();
    await flush();
    expect(f.keeper.state()).toEqual({ state: 'holding', reason: 'tasks' });
  });
  it('reports unavailable and releases when the blocker cannot start', async () => {
    vi.useFakeTimers();
    const f = fixture({ tasks: 1, keepAwakeTasks: true });
    f.throwStart();
    await flush();
    expect(f.keeper.state()).toEqual({ state: 'unavailable' });
  });
  it.each(['false', 'throw'] as const)('releases an unconfirmed native handle when isStarted returns %s', async result => {
    vi.useFakeTimers();
    const f = fixture({ tasks: 1, keepAwakeTasks: true });
    f.api.isStarted.mockImplementation(() => { if (result === 'throw') throw Error('native confirmation failed'); return false; });
    await flush();
    expect(f.keeper.state()).toEqual({ state: 'unavailable' });
    expect(f.started.size).toBe(0);
    expect(f.changes).toEqual([{ state: 'unavailable' }]);
  });
  it('restarts the blocker when the OS reports the handle stopped', async () => {
    vi.useFakeTimers();
    const f = fixture({ tasks: 1, keepAwakeTasks: true });
    await flush();
    const first = [...f.started][0]!;
    f.started.delete(first);
    f.keeper.schedule();
    await flush();
    expect(f.api.start).toHaveBeenCalledTimes(2);
    expect(f.keeper.state().state).toBe('holding');
  });
  it('releases on release() and stops all timers on dispose', async () => {
    vi.useFakeTimers();
    const f = fixture({ tasks: 1, keepAwakeTasks: true });
    await flush();
    f.keeper.release();
    expect(f.api.stop).toHaveBeenCalledTimes(1);
    expect(f.keeper.state()).toEqual({ state: 'off' });
    f.keeper.dispose();
    f.set({ schedules: 1, keepAwakeSchedules: true });
    f.keeper.schedule();
    await flush();
    expect(f.api.start).toHaveBeenCalledTimes(1);
  });
});
