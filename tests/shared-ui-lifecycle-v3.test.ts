import { afterEach, expect, it, vi } from 'vitest';

const setup = vi.hoisted(() => ({
  effects: [] as (() => void | (() => void))[],
  layouts: [] as (() => void | (() => void))[],
  setters: [] as ReturnType<typeof vi.fn>[],
  refs: [] as { current: unknown }[],
  stateOverride: [] as unknown[],
  handle: undefined as undefined | { keyDown(event: unknown): boolean },
}));
vi.mock('react', () => ({
  useEffect: (effect: () => void | (() => void)) => setup.effects.push(effect),
  useLayoutEffect: (effect: () => void | (() => void)) => setup.layouts.push(effect),
  useImperativeHandle: (_ref: unknown, create: () => unknown) => { setup.handle = create() as never; },
  useId: () => 'x',
  useRef: (current: unknown) => { const ref = { current }; setup.refs.push(ref); return ref; },
  useState: (value: unknown) => { const setter = vi.fn(); setup.setters.push(setter); return [setup.stateOverride.length ? setup.stateOverride.shift() : value, setter]; },
}));
vi.mock('react/jsx-runtime', () => ({ jsx: () => null, jsxs: () => null, Fragment: '' }));
vi.mock('lucide-react', () => ({ Check: () => null, ChevronDown: () => null, Bot: () => null, LoaderCircle: () => null, Search: () => null, X: () => null, Info: () => null, CheckCircle2: () => null, AlertCircle: () => null, File: () => null, Lock: () => null }));
vi.mock('../packages/ui-shell/Popover', () => ({ Popover: () => null }));
vi.mock('../packages/ui-shell/list-navigation', () => ({ isComposing: () => false, useListNavigation: () => ({ reset() {}, edge: () => 0, focus() {}, type() {}, onKeyDown() {}, onFocus() {}, rows: { current: [] } }) }));
vi.mock('../apps/web/src/skill-catalog-api', () => ({ getSkillCatalog: vi.fn(), mergeSkillCatalogPages: vi.fn() }));
vi.mock('../packages/ui-shell/Feedback', () => ({ ErrorState: () => null }));

import { TooltipLayer } from '../packages/ui-shell/Tooltip';
import { Select } from '../packages/ui-shell/Select';
import { ComposerCommands } from '../apps/web/src/ComposerCommands';

const cleanups: (() => void)[] = [];
afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup();
  setup.effects.length = 0; setup.layouts.length = 0; setup.setters.length = 0; setup.refs.length = 0; setup.stateOverride.length = 0; setup.handle = undefined;
  vi.useRealTimers(); vi.unstubAllGlobals();
});

// --- Tooltip: a caller changing `data-tooltip` on the shown control must update it ---

class Anchor {
  isConnected = true;
  textContent = '';
  private attributes = new Map<string, string>();
  closest() { return this; }
  matches() { return true; }
  hasAttribute(key: string) { return this.attributes.has(key); }
  getAttribute(key: string) { return this.attributes.get(key) ?? null; }
  setAttribute(key: string, value: string) { this.attributes.set(key, value); }
  removeAttribute(key: string) { this.attributes.delete(key); }
}

function mountTooltip() {
  vi.useFakeTimers();
  const listeners = new Map<string, (value: unknown) => void>();
  let mutation!: (records: unknown[]) => void;
  vi.stubGlobal('Element', Anchor);
  vi.stubGlobal('MutationObserver', class {
    constructor(callback: (records: unknown[]) => void) { mutation = callback; }
    observe() {} disconnect() {}
  });
  vi.stubGlobal('window', { addEventListener() {}, removeEventListener() {} });
  vi.stubGlobal('document', {
    documentElement: {},
    addEventListener: (name: string, fn: (event: unknown) => void) => listeners.set(name, fn),
    removeEventListener() {},
  });
  vi.stubGlobal('getComputedStyle', () => ({ getPropertyValue: () => '350' }));
  TooltipLayer();
  const cleanup = setup.effects[0]();
  if (cleanup) cleanups.push(cleanup);
  return { listeners, mutation };
}

it('refreshes the visible tooltip when the caller updates data-tooltip', () => {
  const { listeners, mutation } = mountTooltip();
  const target = new Anchor();
  target.setAttribute('data-tooltip', 'Original hint');
  listeners.get('pointerover')!({ pointerType: 'mouse', target });
  vi.advanceTimersByTime(350);
  const setShown = setup.setters[0]!;
  expect(setShown).toHaveBeenLastCalledWith(expect.objectContaining({ text: 'Original hint' }));
  target.setAttribute('data-tooltip', 'Updated hint');
  mutation([{ type: 'attributes', attributeName: 'data-tooltip', target }]);
  expect(setShown).toHaveBeenLastCalledWith(expect.objectContaining({ text: 'Updated hint', leaving: false }));
});

it('keeps the adopted-title suppression marker after a data-tooltip mutation', () => {
  const { listeners, mutation } = mountTooltip();
  const target = new Anchor();
  target.textContent = '  ';
  target.setAttribute('title', 'Saved hint');
  listeners.get('pointerover')!({ pointerType: 'mouse', target });
  vi.advanceTimersByTime(350);
  target.setAttribute('data-tooltip', 'Renamed hint');
  mutation([{ type: 'attributes', attributeName: 'data-tooltip', target }]);
  // The later adopt-driven title="" write must still be recognized as ours,
  // not as a caller removing the source title.
  target.setAttribute('title', '');
  mutation([{ type: 'attributes', attributeName: 'title', target }]);
  expect(target.hasAttribute('data-tooltip-adopted')).toBe(true);
});

// --- Select: a reset listener must follow late or changed form association ---

it('handles form reset when the form associates after mount', async () => {
  const listeners = new Map<string, ((event: unknown) => void)[]>();
  const add = (name: string, fn: (event: unknown) => void) => listeners.set(name, [...(listeners.get(name) ?? []), fn]);
  vi.stubGlobal('document', { addEventListener: add, removeEventListener() {} });
  vi.stubGlobal('MutationObserver', class { observe() {} disconnect() {} });
  const microtasks: (() => void)[] = [];
  vi.stubGlobal('queueMicrotask', (fn: () => void) => microtasks.push(fn));

  const native = { options: [] as { value: string; defaultSelected: boolean }[], value: '', form: null as unknown, matches: () => false, addEventListener: add, removeEventListener() {} };
  const onValueChange = vi.fn();
  Select({ value: 'b', onValueChange, options: [{ value: '', label: 'None' }, { value: 'a', label: 'A' }, { value: 'b', label: 'B' }], 'aria-label': 'Pick', name: 'n', form: 'f' });
  // refs: anchor, content, native, initial, change
  setup.refs[2]!.current = native;
  for (const layout of setup.layouts) { const cleanup = layout(); if (cleanup) cleanups.push(cleanup); }
  for (const effect of setup.effects) { const cleanup = effect(); if (cleanup) cleanups.push(cleanup); }

  // The <form id="f"> mounts after the select: association changes without a prop change.
  const form = { addEventListener: add, removeEventListener() {} };
  native.form = form;
  const resets = listeners.get('reset') ?? [];
  for (const reset of resets) reset({ target: form, defaultPrevented: false });
  for (const task of microtasks) task();
  await Promise.resolve();
  expect(onValueChange).toHaveBeenCalledWith('b');
});

// --- ComposerCommands: Enter with the palette open but no active command dismisses it ---

it('consumes Enter and dismisses the palette when no command is active', () => {
  const input = { current: { setAttribute() {}, removeAttribute() {}, selectionStart: 2, selectionEnd: 2, ownerDocument: { activeElement: null, getElementById: () => null } } };
  // position is the first useState: caret inside "/zz", focused so the token
  // opens the palette; "/zz" matches no builtin so `selected` is undefined.
  setup.stateOverride = [{ caret: 3, end: 3, focused: true, composing: false }];
  ComposerCommands({ input: input as never, draft: '/zz', onDraft: () => {}, onModel: () => {}, onMode: () => {} });
  const event = { key: 'Enter', preventDefault: vi.fn(), isComposing: false };
  const handled = setup.handle!.keyDown(event);
  expect(handled).toBe(true);
  expect(event.preventDefault).toHaveBeenCalledOnce();
  expect(setup.setters[1]).toHaveBeenCalled();

  const tab = { key: 'Tab', preventDefault: vi.fn(), isComposing: false };
  expect(setup.handle!.keyDown(tab)).toBe(false);
  expect(tab.preventDefault).not.toHaveBeenCalled();
});
