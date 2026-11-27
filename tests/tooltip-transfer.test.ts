import { describe, expect, it } from 'vitest';
import { gapTooltipGroup, openedTooltipGroup, pointerOpening, sameTooltipGroup, type TooltipGroup, type TooltipWarmth } from '../packages/ui-shell/tooltip-transfer';

function group(overrides: Partial<TooltipGroup> = {}): TooltipGroup {
  return {
    boundary: {}, ownerKey: 'owner', document: {}, dialog: null, modal: null,
    ...overrides,
  };
}

describe('sameTooltipGroup', () => {
  it('requires the same boundary, key, document, dialog and modal identity', () => {
    const base = group();
    expect(sameTooltipGroup(base, { ...base })).toBe(true);
    for (const overrides of [
      { boundary: {} }, { ownerKey: 'other' }, { document: {} }, { dialog: {} }, { modal: {} },
    ]) expect(sameTooltipGroup(base, group(overrides))).toBe(false);
  });
});

describe('tooltip warmth openings', () => {
  it.each([
    ['pointer-cold', true], ['pointer-warm', true], ['keyboard', false],
  ] as const)('only an actual pointer open warms a group: %s', (kind, expected) => {
    const warm = openedTooltipGroup(group(), kind);
    expect(Boolean(warm)).toBe(expected);
    if (expected) expect(warm).toEqual({ group: expect.any(Object), deadline: null });
  });

  it('does not warm ungrouped openings', () => {
    expect(openedTooltipGroup(null, 'pointer-cold')).toBeNull();
    expect(openedTooltipGroup(null, 'pointer-warm')).toBeNull();
  });

  it.each([
    ['matching open warmth', 1_000, 'pointer-warm'],
    ['null group', null, 'pointer-cold'],
    ['invalid time', Number.NaN, 'pointer-cold'],
    ['infinite time', Number.POSITIVE_INFINITY, 'pointer-cold'],
  ] as const)('classifies %s without mutating state', (_name, now, expected) => {
    const target = group();
    const warm = Object.freeze({ group: target, deadline: null }) as TooltipWarmth;
    expect(pointerOpening(warm, now === null ? null : target, Number(now))).toBe(expected);
    expect(warm).toEqual({ group: target, deadline: null });
  });

  it('keeps direct same-group transfer warm and rejects identity changes', () => {
    const target = group();
    const warm = { group: target, deadline: null };
    expect(pointerOpening(warm, target, 0)).toBe('pointer-warm');
    expect(pointerOpening(warm, group({ ...target, ownerKey: 'peer' }), 0)).toBe('pointer-cold');
    expect(pointerOpening(warm, group({ ...target, boundary: {} }), 0)).toBe('pointer-cold');
  });
});

describe('tooltip group gap grace', () => {
  it('bounds internal whitespace at 299ms warm and 300ms cold', () => {
    const target = group();
    const open = { group: target, deadline: null };
    const gap = gapTooltipGroup(open, 700);
    expect(gap).toEqual({ group: target, deadline: 1_000 });
    expect(pointerOpening(gap, target, 999)).toBe('pointer-warm');
    expect(pointerOpening(gap, target, 1_000)).toBe('pointer-cold');
  });

  it('does not extend an existing grace deadline on repeated gaps', () => {
    const target = group();
    const first = gapTooltipGroup({ group: target, deadline: null }, 700)!;
    const repeated = gapTooltipGroup(first, 900);
    expect(repeated).toEqual(first);
    expect(repeated).not.toBe(first);
    expect(pointerOpening(repeated, target, 999)).toBe('pointer-warm');
    expect(gapTooltipGroup(repeated, 1_000)).toBeNull();
  });

  it('keeps open warmth unexpired until an explicit gap or reset', () => {
    const target = group();
    const open = { group: target, deadline: null };
    expect(pointerOpening(open, target, 100_000)).toBe('pointer-warm');
    expect(gapTooltipGroup(null, 0)).toBeNull();
    expect(gapTooltipGroup(open, Number.NaN)).toBeNull();
    expect(pointerOpening(open, target, Number.NaN)).toBe('pointer-cold');
  });

  it('does not mutate supplied warmth records', () => {
    const target = Object.freeze(group());
    const open = Object.freeze({ group: target, deadline: null }) as TooltipWarmth;
    const gap = gapTooltipGroup(open, 10)!;
    expect(open).toEqual({ group: target, deadline: null });
    expect(gap).not.toBe(open);
    const frozenGap = Object.freeze(gap) as TooltipWarmth;
    const repeated = gapTooltipGroup(frozenGap, 20)!;
    expect(frozenGap.deadline).toBe(310);
    expect(repeated).toEqual({ group: target, deadline: 310 });
  });
});
