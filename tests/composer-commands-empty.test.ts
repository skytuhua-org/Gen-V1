import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {build} from 'esbuild';
import {chromium, type Browser, type Page} from '@playwright/test';

const fixture = `
import React, {useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {ComposerCommands} from './apps/web/src/ComposerCommands';

const catalog = (sources) => ({scope: {kind: 'personal'}, sources, skills: [], inventoryRevision: 'e'.repeat(64), nextCursor: null});
const unavailable = {id: 's1', kind: 'bundled', label: 'Bundled', availability: {status: 'unavailable', reason: 'denied'}};
window.fetch = (input) => {
 const url = typeof input === 'string' ? input : input.url;
 if (url.startsWith('/api/bootstrap')) return Promise.resolve(new Response(JSON.stringify({csrfToken: 'test-csrf'}), {status: 200, headers: {'Content-Type': 'application/json'}}));
 if (url.startsWith('/api/skill-catalog')) {
  if (window.catalogMode === 'error') return Promise.resolve(new Response(JSON.stringify({error: {code: 'UNAVAILABLE', message: 'The catalog failed.'}}), {status: 503, headers: {'Content-Type': 'application/json'}}));
  return Promise.resolve(new Response(JSON.stringify(catalog(window.catalogMode === 'empty' ? [] : [unavailable])), {status: 200, headers: {'Content-Type': 'application/json'}}));
 }
 return Promise.resolve(new Response('null', {status: 404}));
};
function Fixture() {
 const input = useRef(null), commands = useRef(null), [draft, setDraft] = useState('');
 window.keyResults = [];
 window.type = (value) => flushSync(() => {
  const element = input.current;
  element.focus(); element.value = value; element.setSelectionRange(value.length, value.length);
  element.dispatchEvent(new Event('input', {bubbles: true}));
  setDraft(value);
 });
 return <><textarea ref={input} aria-label="Message" onKeyDown={event => window.keyResults.push(commands.current?.keyDown(event))}/><ComposerCommands ref={commands} input={input} draft={draft} onDraft={setDraft} onModel={() => {}} onMode={() => {}}/></>;
}
createRoot(document.getElementById('root')).render(<Fixture/>);
`;

type HarnessWindow = Window & {catalogMode: string; keyResults: boolean[]; type(value: string): void};

describe('slash-command palette empty state', () => {
  let browser: Browser, script: string;
  beforeAll(async () => {
    script = (await build({stdin: {contents: fixture, resolveDir: process.cwd(), loader: 'tsx'}, loader: {'.css': 'empty'}, bundle: true, write: false, format: 'iife', platform: 'browser', jsx: 'automatic', define: {'process.env.NODE_ENV': '"production"'}})).outputFiles[0]!.text;
    browser = await chromium.launch({headless: true, ...(process.platform === 'win32' ? {channel: 'msedge'} : {})});
  });
  afterAll(async () => {await browser?.close();});

  async function type(mode: string, draft: string): Promise<Page> {
    const page = await browser.newPage();
    await page.setContent('<div id="root"></div>');
    await page.addScriptTag({content: script});
    await page.evaluate(([m, d]) => {const w = window as unknown as HarnessWindow; w.catalogMode = m; w.type(d);}, [mode, draft]);
    return page;
  }

  it('shows "No commands or skills found" alongside the unavailable-source rows', async () => {
    const page = await type('unavailable', '/xyz');
    await page.getByText('No commands or skills found').waitFor({state: 'visible'});
    expect(await page.getByText('Bundled').isVisible()).toBe(true);
    expect(await page.getByText('No access').isVisible()).toBe(true);
    await page.close();
  });
  it('shows "No commands or skills found" when the catalog returns no sources', async () => {
    const page = await type('empty', '/xyz');
    await page.getByText('No commands or skills found').waitFor({state: 'visible'});
    await page.close();
  });
  it('keeps the empty state hidden while a command option matches', async () => {
    const page = await type('unavailable', '/mod');
    await page.locator('.composer-command-option', {hasText: '/model'}).waitFor({state: 'visible'});
    expect(await page.getByText('No commands or skills found').count()).toBe(0);
    await page.close();
  });

  it('consumes Enter with no selectable command, closes the palette, and preserves the draft', async () => {
    const page = await type('empty', '/xyz');
    await page.getByText('No commands or skills found').waitFor({state: 'visible'});
    const box = page.locator('textarea[aria-label="Message"]');
    await box.press('Enter');
    await page.getByText('No commands or skills found').waitFor({state: 'hidden'});
    expect(await box.inputValue()).toBe('/xyz');
    expect(await page.evaluate(() => document.querySelector('textarea')!.selectionStart)).toBe(4);
    expect(await page.evaluate(() => (window as unknown as HarnessWindow).keyResults)).toEqual([true]);
    await box.press('Enter');
    expect(await page.evaluate(() => (window as unknown as HarnessWindow).keyResults)).toEqual([true, false]);
    await page.close();
  });

  it('prefers the error state over the empty state', async () => {
    const page = await type('error', '/xyz');
    await page.getByText('The catalog failed.').waitFor({state: 'visible'});
    expect(await page.getByText('No commands or skills found').count()).toBe(0);
    await page.close();
  });
});
