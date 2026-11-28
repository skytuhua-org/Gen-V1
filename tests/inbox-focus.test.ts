import { describe, expect, it } from 'vitest';
import { resolveInboxFocusId } from '../apps/web/src/inbox-focus';

describe('resolveInboxFocusId', () => {
  it.each([
    ['surviving following row', 'b', ['a', 'b', 'c', 'd'], ['a', 'c', 'd'], 'c'],
    ['first surviving following row before preceding fallback', 'b', ['a', 'b', 'c', 'd'], ['a', 'd'], 'd'],
    ['nearest preceding row when no following row survives', 'b', ['a', 'b', 'c', 'd'], ['a'], 'a'],
    ['first current row when no neighbor survives', 'b', ['a', 'b', 'c', 'd'], ['x'], 'x'],
    ['null when no current row is eligible', 'b', ['a', 'b'], [], null],
    ['same requested row first', 'b', ['a', 'b', 'c'], ['c', 'b', 'a'], 'b'],
    ['first current row when requested is absent from prior order', 'missing', ['a', 'b'], ['x', 'a'], 'x'],
    ['first current row when requested is undefined', undefined, ['a'], ['x'], 'x'],
  ] as const)('returns %s', (_name, requested, prior, current, expected) => {
    expect(resolveInboxFocusId(requested, prior, current)).toBe(expected);
  });

  it('uses saved-neighbor precedence instead of replacement array position', () => {
    expect(resolveInboxFocusId('b', ['a', 'b', 'c', 'd'], ['d', 'c'])).toBe('c');
    expect(resolveInboxFocusId('c', ['a', 'b', 'c', 'd'], ['d', 'b'])).toBe('d');
  });

  it('uses first occurrence for duplicate prior IDs and preserves immutable inputs', () => {
    const prior = Object.freeze(['x', 'b', 'y', 'b', 'z']);
    const current = Object.freeze(['y', 'z']);
    const before = [...prior];
    expect(resolveInboxFocusId('b', prior, current)).toBe('y');
    expect(prior).toEqual(before);
    expect(current).toEqual(['y', 'z']);
  });

  it('never returns rows omitted as ineligible by the caller', () => {
    expect(resolveInboxFocusId('b', ['a', 'b', 'c'], [])).toBeNull();
    expect(resolveInboxFocusId('b', ['a', 'b', 'c'], ['foreign'])).toBe('foreign');
  });
});
