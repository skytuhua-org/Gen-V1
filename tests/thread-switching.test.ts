import {describe, expect, it} from 'vitest';
import type {Thread} from '../packages/contracts';
import {MRU_CAP, mruPush, mruVisible, nextUnreadId, nextUnreadInOrder, sidebarDigitTarget, sidebarRowIds, type SidebarRowContext} from '../apps/web/src/thread-switching';

const thread = (id: string, presentation?: Thread['presentation'], status?: Thread['status'], runId?: string): Thread =>
  ({id, title: id, projectName: null, createdAt: '2026-01-01', updatedAt: '2026-01-01', status: status ?? 'ready', epoch: 0, runId: runId ?? null, modelId: null, sessionPath: null, presentation});

const ctx = (over: Partial<SidebarRowContext> = {}): SidebarRowContext => ({
  filter: 'all', projectGrouping: false, projectOrder: 'recent', showWorkingSection: true, folded: {}, showAllSettled: false, ...over,
});

describe('sidebar row projection', () => {
  const pinned = thread('pin1', {pinned: true});
  const working = thread('work1', undefined, 'working');
  const running = thread('run1', undefined, 'ready', 'run-x');
  const flat1 = thread('flat1'), flat2 = thread('flat2');
  const settled = Array.from({length: 8}, (_, i) => thread(`set${i + 1}`, {settled: true}));
  const all = [flat2, pinned, settled[7]!, working, flat1, settled[0]!, running, ...settled.slice(1, 7)];

  it('orders pinned -> working -> flat -> settled and caps settled at six', () => {
    expect(sidebarRowIds(all, ctx())).toEqual(['pin1', 'work1', 'run1', 'flat2', 'flat1', 'set8', 'set1', 'set2', 'set3', 'set4', 'set5']);
  });
  it('drops folded sections but keeps the flat list', () => {
    expect(sidebarRowIds(all, ctx({folded: {pinned: true, working: true, settled: true}}))).toEqual(['flat2', 'flat1']);
  });
  it('shows all settled when expanded and honors the working-section toggle', () => {
    const ids = sidebarRowIds(all, ctx({showAllSettled: true, showWorkingSection: false}));
    expect(ids.filter(id => id.startsWith('set'))).toHaveLength(8);
    // Section off: working rows merge back into the flat list, like ShellSidebar.
    expect(ids).toContain('work1');
    expect(ids).toContain('run1');
    expect(ids[0]).toBe('pin1');
  });
  it('filters rows by the sidebar filter state', () => {
    expect(sidebarRowIds(all, ctx({filter: 'working'}))).toEqual(['work1', 'run1']);
    expect(sidebarRowIds(all, ctx({filter: 'waiting'}))).toEqual([]);
  });
  it('targets the Nth visible row for Ctrl+1..9 and nothing past the end', () => {
    expect(sidebarDigitTarget(all, ctx(), 1)).toBe('pin1');
    expect(sidebarDigitTarget(all, ctx(), 5)).toBe('flat1');
    expect(sidebarDigitTarget(all, ctx(), 9)).toBe('set3');
    expect(sidebarDigitTarget(all, ctx(), 0)).toBeNull();
    expect(sidebarDigitTarget([flat1], ctx(), 2)).toBeNull();
  });
});

describe('next unread', () => {
  const a = thread('a'), b = thread('b', {unread: true}), c = thread('c', {unread: true});
  it('returns the first unread after the active row, wrapping once', () => {
    expect(nextUnreadId([a, b, c], ctx(), 'a')).toBe('b');
    expect(nextUnreadId([a, b, c], ctx(), 'b')).toBe('c');
    expect(nextUnreadId([a, b, c], ctx(), 'c')).toBe('b');
  });
  it('skips the active row itself and reports none when only it is unread', () => {
    const alone = thread('a', {unread: true});
    expect(nextUnreadId([alone, thread('b')], ctx(), 'a')).toBeNull();
    expect(nextUnreadId([a, thread('b')], ctx(), 'a')).toBeNull();
  });
  it('works on a projected order list too', () => {
    expect(nextUnreadInOrder(['a', 'b', 'c'], [a, b, c], 'a')).toBe('b');
    expect(nextUnreadInOrder(['a', 'b', 'c'], [a, b, c], 'c')).toBe('b');
    expect(nextUnreadInOrder([], [a, b, c], null)).toBeNull();
  });
});

describe('MRU', () => {
  it('pushes to the front, dedups and caps at 32', () => {
    let mru: string[] = [];
    for (let i = 0; i < 40; i += 1) mru = mruPush(mru, `t${i}`);
    expect(mru).toHaveLength(MRU_CAP);
    expect(mru[0]).toBe('t39');
    mru = mruPush(mru, 't5');
    expect(mru[0]).toBe('t5');
    expect(mru.filter(id => id === 't5')).toHaveLength(1);
    expect(mru).toHaveLength(MRU_CAP);
  });
  it('trims the MRU order to visible sidebar rows', () => {
    expect(mruVisible(['a', 'gone', 'b'], ['b', 'a', 'c'])).toEqual(['a', 'b']);
  });
});
