import {afterEach, beforeEach, expect, it, vi} from 'vitest';

vi.mock('react', () => ({
  useSyncExternalStore: (_subscribe: unknown, getSnapshot: () => unknown) => getSnapshot(),
}));

const timeoutMessage = 'The inbox is not responding. Try again.';
const bootstrap = () => Response.json({csrfToken: 'fixture'});
const snapshot = (sequence: number) => Response.json({items: [], unread: 0, sequence});

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it('releases a timed-out read and uses a fresh request for an explicit retry', async () => {
  const signals: (AbortSignal | null | undefined)[] = [];
  const fetch = vi.fn((path: string, init?: RequestInit) => {
    if (path === '/api/bootstrap') return Promise.resolve(bootstrap());
    if (path === '/api/attention') return Promise.resolve(snapshot(1));
    signals.push(init?.signal);
    return signals.length === 1 ? new Promise<Response>(() => {}) : Promise.resolve(Response.json({}));
  });
  vi.stubGlobal('fetch', fetch);
  const {useAttention} = await import('../apps/web/src/useAttention');
  const attention = useAttention(false);
  let error: string | undefined;
  const attempt = attention.markRead('fixture-item').catch(cause => { error = cause.message; });
  await vi.advanceTimersByTimeAsync(14_999);
  expect(signals).toHaveLength(1);
  expect(error).toBeUndefined();
  await vi.advanceTimersByTimeAsync(1);
  expect(error).toBe(timeoutMessage);
  expect(signals[0]?.aborted).toBe(true);
  await attempt;
  await expect(attention.markRead('fixture-item')).resolves.toBeUndefined();
  expect(signals).toHaveLength(2);
  expect(signals[1]?.aborted).toBe(false);
  expect(vi.getTimerCount()).toBe(0);
});

it('reports a stalled snapshot, permits refresh, and ignores a late old response', async () => {
  let release!: (response: Response) => void;
  const held = new Promise<Response>(resolve => { release = resolve; });
  const signals: (AbortSignal | null | undefined)[] = [];
  vi.stubGlobal('fetch', vi.fn((path: string, init?: RequestInit) => {
    if (path === '/api/bootstrap') return Promise.resolve(bootstrap());
    signals.push(init?.signal);
    return signals.length === 1 ? held : Promise.resolve(snapshot(2));
  }));
  const {useAttention} = await import('../apps/web/src/useAttention');
  const attention = useAttention(false);
  const first = attention.refresh();
  await vi.advanceTimersByTimeAsync(15_000);
  expect(useAttention(false).error).toBe(timeoutMessage);
  expect(signals[0]?.aborted).toBe(true);
  await expect(first).resolves.toBe(timeoutMessage);
  await expect(attention.refresh()).resolves.toBeUndefined();
  release(snapshot(1));
  await vi.advanceTimersByTimeAsync(0);
  expect(useAttention(false)).toMatchObject({sequence: 2, loaded: true, error: ''});
  expect(vi.getTimerCount()).toBe(0);
});
