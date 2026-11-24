import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {build} from 'esbuild';
import {chromium, type Browser, type Page} from '@playwright/test';

const fixture = `
import React, {useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {ComposerCommands} from './apps/web/src/ComposerCommands';

const catalog = () => ({scope: {kind: 'personal'}, sources: [{id: 's1', kind: 'bundled', label: 'Bundled', availability: {status: 'available'}}], skills: [], inventoryRevision: 'e'.repeat(64), nextCursor: null});
window.fetch = (input) => {
 const url = typeof input === 'string' ? input : input.url;
 if (url.startsWith('/api/bootstrap')) return Promise.resolve(new Response(JSON.stringify({csrfToken: 'test-csrf'}), {status: 200, headers: {'Content-Type': 'application/json'}}));
 if (url.startsWith('/api/skill-catalog')) return Promise.resolve(new Response(JSON.stringify(catalog()), {status: 200, headers: {'Content-Type': 'application/json'}}));
 return Promise.resolve(new Response('null', {status: 404}));
};
function Fixture() {
 const input = useRef(null), commands = useRef(null), [draft, setDraft] = useState('');
 window.type = (value) => flushSync(() => {
  const element = input.current;
  element.focus(); element.value = value; element.setSelectionRange(value.length, value.length);
  element.dispatchEvent(new Event('input', {bubbles: true}));
  setDraft(value);
 });
 return <><textarea ref={input} aria-label="Message" onKeyDown={event => commands.current?.keyDown(event)}/>
  <ComposerCommands ref={commands} input={input} draft={draft} onDraft={setDraft} onModel={() => {}} onMode={() => {}}/></>;
}
createRoot(document.getElementById('root')).render(<Fixture/>);
`;

type HarnessWindow = Window & {type(value: string): void};

describe('slash-command palette combobox semantics', () => {
  let browser: Browser, script: string;
  beforeAll(async () => {
    script = (await build({stdin: {contents: fixture, resolveDir: process.cwd(), loader: 'tsx'}, loader: {'.css': 'empty'}, bundle: true, write: false, format: 'iife', platform: 'browser', jsx: 'automatic', define: {'process.env.NODE_ENV': '"production"'}})).outputFiles[0]!.text;
    browser = await chromium.launch({headless: true, ...(process.platform === 'win32' ? {channel: 'msedge'} : {})});
  });
  afterAll(async () => {await browser?.close();});

  async function open(): Promise<Page> {
    const page = await browser.newPage();
    await page.setContent('<div id="root"></div>');
    await page.addScriptTag({content: script});
    return page;
  }
  const textarea = (page: Page) => page.locator('textarea[aria-label="Message"]');

  it('wires combobox aria while the palette is open and strips it on Escape', async () => {
    const page = await open();
    await page.evaluate(() => (window as unknown as HarnessWindow).type('/mod'));
    const box = textarea(page);
    await page.locator('.composer-command-option').first().waitFor({state: 'visible'});
    expect(await box.getAttribute('role')).toBe('combobox');
    expect(await box.getAttribute('aria-expanded')).toBe('true');
    expect(await box.getAttribute('aria-haspopup')).toBe('listbox');
    expect(await box.getAttribute('aria-controls')).toBeTruthy();
    expect(await box.getAttribute('aria-autocomplete')).toBe('list');
    expect(await box.getAttribute('aria-activedescendant')).toBeTruthy();
    await box.press('Escape');
    await page.locator('.composer-command-list').waitFor({state: 'detached'});
    expect(await box.getAttribute('role')).toBeNull();
    expect(await box.getAttribute('aria-haspopup')).toBeNull();
    expect(await box.getAttribute('aria-expanded')).toBe('false');
    expect(await box.getAttribute('aria-controls')).toBeNull();
    expect(await box.getAttribute('aria-autocomplete')).toBeNull();
    expect(await box.getAttribute('aria-activedescendant')).toBeNull();
    await page.close();
  });
  it('reports aria-expanded=false before the palette ever opens', async () => {
    const page = await open();
    expect(await textarea(page).getAttribute('aria-expanded')).toBe('false');
    await page.close();
  });
  it('documents Tab in the hint', async () => {
    const page = await open();
    await page.evaluate(() => (window as unknown as HarnessWindow).type('/mod'));
    await page.locator('.composer-command-option').first().waitFor({state: 'visible'});
    expect(await page.locator('.composer-command-hint').innerText()).toBe('↑ ↓ Navigate · Enter/Tab Select · Esc Close');
    await page.close();
  });
});
