import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {build} from 'esbuild';
import {chromium, type Browser, type Page} from '@playwright/test';
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

const paletteFixture = `
import React, {useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ComposerCommands, type ComposerCommandsHandle} from './apps/web/src/ComposerCommands';

const catalog = {scope:{kind:'personal'},sources:[],skills:[],inventoryRevision:'a'.repeat(64),nextCursor:null};
window.fetch = (input: RequestInfo | URL) => Promise.resolve(new Response(JSON.stringify(
  String(input).startsWith('/api/bootstrap') ? {csrfToken:'fixture'} : catalog
), {status:200, headers:{'Content-Type':'application/json'}}));

function Fixture(){
  const input = useRef<HTMLTextAreaElement>(null), handle = useRef<ComposerCommandsHandle>(null);
  const [draft, setDraft] = useState('');
  return <>
    <textarea id="ta" ref={input} value={draft}
      onChange={event => setDraft(event.target.value)}
      onKeyDown={event => handle.current?.keyDown(event)}/>
    <ComposerCommands ref={handle} input={input} draft={draft} threadId="t1" projectId="p1"
      onDraft={setDraft} onModel={async()=>{}} onMode={async()=>{}}/>
  </>;
}
createRoot(document.getElementById('root')).render(<Fixture/>);
`;

describe('slash-command palette', () => {
  let browser: Browser, script: string;
  beforeAll(async () => {
    script = (await build({stdin:{contents:paletteFixture,resolveDir:process.cwd(),loader:'tsx'},loader:{'.css':'empty'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'}})).outputFiles[0]!.text;
    browser = await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});
  });
  afterAll(async () => { await browser?.close(); });
  async function openPage(): Promise<Page> {
    const page = await browser.newPage();
    await page.setContent('<div id="root"></div>');
    await page.addScriptTag({content: script});
    return page;
  }
  const palette = (page: Page) => page.locator('.composer-command-popover[data-state="open"]');

  it('keeps the palette dismissed while editing the token after Escape', async () => {
    const page = await openPage();
    try {
      const area = page.locator('#ta');
      await area.click();
      await area.pressSequentially('/');
      await palette(page).waitFor();
      await area.press('Escape');
      await palette(page).waitFor({state:'detached'});
      await area.pressSequentially('x');
      await expect.poll(async () => await palette(page).count(), {timeout:1000}).toBe(0);
    } finally { await page.close(); }
  });

  it('reopens for the next slash token after the dismissed one is deleted', async () => {
    const page = await openPage();
    try {
      const area = page.locator('#ta');
      await area.click();
      await area.pressSequentially('/');
      await palette(page).waitFor();
      await area.press('Escape');
      await area.press('Backspace');
      await area.pressSequentially('/');
      await palette(page).waitFor();
    } finally { await page.close(); }
  });

  it('stays closed when the dismissed token regains focus', async () => {
    const page = await openPage();
    try {
      const area = page.locator('#ta');
      await area.click();
      await area.pressSequentially('hello /mod');
      await palette(page).waitFor();
      await area.press('Escape');
      await palette(page).waitFor({state:'detached'});
      await page.locator('body').click();
      await area.click();
      await expect.poll(async () => await palette(page).count(), {timeout:1000}).toBe(0);
    } finally { await page.close(); }
  });

  it('stays closed when the dismissed token is edited through a selection', async () => {
    const page = await openPage();
    try {
      const area = page.locator('#ta');
      await area.click();
      await area.pressSequentially('hello /mod');
      await palette(page).waitFor();
      await area.press('Escape');
      await palette(page).waitFor({state:'detached'});
      await area.evaluate(element => {(element as HTMLTextAreaElement).setSelectionRange(7, 9); element.dispatchEvent(new Event('select'));});
      await area.pressSequentially('x');
      await expect.poll(async () => await palette(page).count(), {timeout:1000}).toBe(0);
    } finally { await page.close(); }
  });

  it('reopens on refocus after an outside click without Escape', async () => {
    const page = await openPage();
    try {
      const area = page.locator('#ta');
      await area.click();
      await area.pressSequentially('/mod');
      await palette(page).waitFor();
      await page.locator('body').click();
      await palette(page).waitFor({state:'detached'});
      await area.click();
      await palette(page).waitFor();
    } finally { await page.close(); }
  });

  it('reopens when the token is deleted and retyped after an outside dismiss without blur', async () => {
    const page = await openPage();
    try {
      const area = page.locator('#ta');
      await area.click();
      await area.pressSequentially('hello /mod');
      await palette(page).waitFor();
      await page.evaluate(() => document.body.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true})));
      await palette(page).waitFor({state:'detached'});
      for (let i = 0; i < 4; i++) await area.press('Backspace');
      await area.pressSequentially('/');
      await palette(page).waitFor();
    } finally { await page.close(); }
  });

  it('forgets an outside dismissal after editing and restoring the same query', async () => {
    const page = await openPage();
    try {
      const area = page.locator('#ta');
      await area.fill('/mod');
      await palette(page).waitFor();
      await page.evaluate(() => document.body.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true})));
      await palette(page).waitFor({state: 'detached'});
      await area.pressSequentially('x');
      await palette(page).waitFor();
      await area.press('Backspace');
      expect(await area.inputValue()).toBe('/mod');
      await expect.poll(() => palette(page).count(), {timeout: 1000}).toBe(1);
    } finally { await page.close(); }
  });

  it('resets Escape dismissal when selection navigation leaves and returns to the token', async () => {
    const page = await openPage();
    try {
      const area = page.locator('#ta');
      await area.fill('hello /mod');
      await palette(page).waitFor();
      await area.press('Escape');
      await palette(page).waitFor({state: 'detached'});
      await area.press('Shift+ArrowLeft');
      await area.press('Home');
      await area.press('End');
      expect(await area.inputValue()).toBe('hello /mod');
      await expect.poll(() => palette(page).count(), {timeout: 1000}).toBe(1);
    } finally { await page.close(); }
  });

  it('captures selection exits before React batches the native listener updates', async () => {
    const page = await openPage();
    try {
      const area = page.locator('#ta');
      await area.fill('hello /mod');
      await palette(page).waitFor();
      await area.press('Escape');
      await palette(page).waitFor({state: 'detached'});
      await area.evaluate(element => {
        const input = element as HTMLTextAreaElement;
        input.setSelectionRange(9, 10); input.dispatchEvent(new Event('select'));
        input.setSelectionRange(0, 0); input.dispatchEvent(new Event('select'));
        input.setSelectionRange(10, 10); input.dispatchEvent(new Event('select'));
      });
      expect(await area.inputValue()).toBe('hello /mod');
      await expect.poll(() => palette(page).count(), {timeout: 1000}).toBe(1);
    } finally { await page.close(); }
  });
});
