import {expect, it} from 'vitest';
import {commandPaletteHeight, commandToken, replaceCommandToken, skillBindingSchema} from '../apps/web/src/composer-commands';

it('finds slash commands at the caret after text without interpreting URLs or paths', () => {
  expect(commandToken('Please explain /', 16)).toEqual({start: 15, end: 16, query: ''});
  expect(commandToken('/model', 4)).toEqual({start: 0, end: 6, query: 'mod'});
  expect(commandToken('x\n/skill:test', 13)).toEqual({start: 2, end: 13, query: 'skill:test'});
  for (const text of ['https://example.test/model', 'C:/model', './model', '/usr/local', '/foo\\bar', 'text/model', '/']) {
    if (text === '/') continue;
    expect(commandToken(text, text.length), text).toBeNull();
  }
  expect(commandToken('/', 1, 0)).toBeNull();
});
it('replaces only the exact command token and preserves surrounding text and caret', () => {
  const text = 'Before /mod after', token = commandToken(text, 11)!;
  expect(replaceCommandToken(text, token)).toEqual({text: 'Before  after', caret: 7});
  expect(() => replaceCommandToken('changed', token)).toThrow();
});
it('admits a bounded Personal selection identity without converting literal text into a skill', () => {
  const ref = {version: 1, scope: {kind: 'personal'}, sourceId: 'personal:test', skillId: 'id', locator: 'a'.repeat(64), revision: 'b'.repeat(64), digest: 'c'.repeat(64), sourceBinding: 'd'.repeat(64)};
  const binding = {id: crypto.randomUUID(), name: 'Test', source: 'Personal', ref};
  expect(skillBindingSchema.parse(binding)).toEqual(binding);
  expect(skillBindingSchema.safeParse({...binding, ref: {...ref, scope: {kind: 'provider', providerId: 'private', scopeId: 'company'}}}).success).toBe(false);
  expect(skillBindingSchema.safeParse('/skill:Test').success).toBe(false);
});

it('sizes the slash palette for every footer block before the cap forces scrolling', () => {
  const base = {loading: false, error: false, skillStatus: false, unavailableSources: 0, nextCursor: false};
  const height = (over: Partial<Parameters<typeof commandPaletteHeight>[0]>) => commandPaletteHeight({...base, options: 3, ...over});
  // Each footer block's allowance lands exactly once: deltas from the bare 3-option palette.
  const bare = height({});
  expect(bare).toBe(3 * 42 + 26 + 6 + 16);
  expect(height({unavailableSources: 2}) - bare).toBe(2 * 17);
  expect(height({unavailableSources: 8}) - height({unavailableSources: 6})).toBe(0); // sources block caps at 76px
  expect(height({nextCursor: true}) - bare).toBe(30);
  expect(height({skillStatus: true}) - bare).toBe(29);
  expect(height({loading: true, skillStatus: true}) - bare).toBe(58); // two distinct status rows
  expect(height({loading: true, error: true}) - bare).toBe(29); // loading||error is one row, not two
  // 0 options still reserves the empty-state status row.
  expect(commandPaletteHeight({...base, options: 0, unavailableSources: 2, nextCursor: true})).toBe(Math.max(110, 26 + 29 + Math.min(76, 2 * 17 + 6) + 30 + 16));
  // Small palettes keep the 110px floor; tall sets cap at 352px and let the list scroll.
  expect(commandPaletteHeight({...base, options: 0})).toBe(110);
  expect(commandPaletteHeight({...base, options: 50, skillStatus: true, unavailableSources: 8, nextCursor: true})).toBe(352);
  // Repro of the reported clip: 3 options + unavailable sources must exceed the old 3*42+44=170px guess.
  expect(height({unavailableSources: 2})).toBeGreaterThan(170);
});
