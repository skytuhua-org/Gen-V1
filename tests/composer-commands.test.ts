import {expect, it} from 'vitest';
import {builtinOptions, commandToken, replaceCommandToken, skillBindingSchema} from '../apps/web/src/composer-commands';

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
  expect(replaceCommandToken(text, token)).toEqual({text: 'Before after', caret: 7});
  expect(() => replaceCommandToken('changed', token)).toThrow();
});
it('collapses exactly one doubled literal space when a mid-sentence token is replaced (#2306)', () => {
  const mid = commandToken('hi /mo there', 6)!;
  expect(replaceCommandToken('hi /mo there', mid)).toEqual({text: 'hi there', caret: 3});
  const atStart = commandToken('/mo there', 3)!;
  expect(replaceCommandToken('/mo there', atStart)).toEqual({text: 'there', caret: 0});
  const atEnd = commandToken('hi /mo', 6)!;
  expect(replaceCommandToken('hi /mo', atEnd)).toEqual({text: 'hi ', caret: 3});
  const whole = commandToken('/mo', 3)!;
  expect(replaceCommandToken('/mo', whole)).toEqual({text: '', caret: 0});
});
it('never collapses tab or newline neighbors and never deletes more than one space (#2306)', () => {
  const tabTail = {start: 3, end: 6, query: 'mo'};
  expect(replaceCommandToken('hi /mo\tthere', tabTail)).toEqual({text: 'hi \tthere', caret: 3});
  const newlineHead = {start: 3, end: 6, query: 'mo'};
  expect(replaceCommandToken('hi\n/mo there', newlineHead)).toEqual({text: 'hi\n there', caret: 3});
  const twoSpaces = {start: 4, end: 7, query: 'mo'};
  expect(replaceCommandToken('hi  /mo  there', twoSpaces)).toEqual({text: 'hi   there', caret: 4});
});
it('hides the active mode command while keeping /model and query filtering', () => {
  expect(builtinOptions('', 'build').map(item => item.id)).toEqual(['model', 'plan']);
  expect(builtinOptions('', 'plan').map(item => item.id)).toEqual(['model', 'default']);
  expect(builtinOptions('def', 'build')).toEqual([]);
  expect(builtinOptions('plan', 'plan')).toEqual([]);
  expect(builtinOptions('mod', 'build').map(item => item.id)).toEqual(['model']);
  expect(builtinOptions('').map(item => item.id)).toEqual(['model', 'plan', 'default']);
});
it('admits a bounded Personal selection identity without converting literal text into a skill', () => {
  const ref = {version: 1, scope: {kind: 'personal'}, sourceId: 'personal:test', skillId: 'id', locator: 'a'.repeat(64), revision: 'b'.repeat(64), digest: 'c'.repeat(64), sourceBinding: 'd'.repeat(64)};
  const binding = {id: crypto.randomUUID(), name: 'Test', source: 'Personal', ref};
  expect(skillBindingSchema.parse(binding)).toEqual(binding);
  expect(skillBindingSchema.safeParse({...binding, ref: {...ref, scope: {kind: 'provider', providerId: 'private', scopeId: 'company'}}}).success).toBe(false);
  expect(skillBindingSchema.safeParse('/skill:Test').success).toBe(false);
});
