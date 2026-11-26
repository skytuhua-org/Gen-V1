import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {build} from 'esbuild';
import {chromium, type Browser, type Page} from '@playwright/test';

const fixture = `
import React, {useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {ComposerCommands} from './apps/web/src/ComposerCommands';

const ref = (id) => ({version: 1, scope: {kind: 'personal'}, sourceId: 'personal:test', skillId: id, locator: 'a'.repeat(64), revision: 'b'.repeat(64), digest: 'c'.repeat(64), sourceBinding: 'd'.repeat(64)});
const skill = (index) => ({id: 'skill-' + index, sourceId: 'personal:test', name: 'Procedure ' + String(index).padStart(2, '0'), description: 'Step', files: 1, availability: {status: 'available'}, ref: ref('skill-' + index)});
window.calls = [];
window.fetch = (input) => {
 const url = typeof input === 'string' ? input : input.url;
 if (url.startsWith('/api/bootstrap')) return Promise.resolve(new Response(JSON.stringify({csrfToken: 'test-csrf'}), {status: 200, headers: {'Content-Type': 'application/json'}}));
 if (url.startsWith('/api/skill-catalog')) {
  window.calls.push(url);
  const second = url.includes('cursor=more'), skills = second ? [12, 13, 14].map(skill) : Array.from({length: 12}, (_, index) => skill(index));
  return Promise.resolve(new Response(JSON.stringify({scope: {kind: 'personal'}, sources: [{id: 'personal:test', kind: 'personal', label: 'Personal', availability: {status: 'available'}}], skills, inventoryRevision: 'e'.repeat(64), nextCursor: second ? null : 'more'}), {status: 200, headers: {'Content-Type': 'application/json'}}));
 }
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

type HarnessWindow = {type(value: string): void; calls: string[]};

describe('slash-command palette list navigation keys', () => {
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
    await page.evaluate(() => (window as unknown as HarnessWindow).type('/'));
    await page.locator('.composer-command-option').nth(14).waitFor({state: 'visible'});
    return page;
  }
  async function active(page: Page, suffix: string): Promise<void> {
    await page.waitForFunction(expected => document.querySelector('textarea')?.getAttribute('aria-activedescendant')?.endsWith(expected) ?? false, suffix);
  }

  it('Home selects the first selectable option and End the last, fetching the next page at the bottom', async () => {
    const page = await open();
    const box = page.locator('textarea[aria-label="Message"]');
    await active(page, '-model');
    await box.press('End');
    await active(page, '-default');
    await box.press('Home');
    await active(page, '-model');
    await box.press('End');
    await active(page, '-default');
    await page.waitForFunction(() => (window as unknown as HarnessWindow).calls.some(url => url.includes('cursor=more')));
    await page.close();
  });
  it('PageDown and PageUp move by the rendered page size without wrapping', async () => {
    const page = await open();
    const box = page.locator('textarea[aria-label="Message"]');
    await box.press('Home');
    const rows = await page.evaluate(() => Math.max(1, Math.floor((document.querySelector('.composer-command-list')?.clientHeight ?? 168) / 42)));
    const index = Math.min(2, rows);
    await box.press('PageDown');
    await active(page, '-' + ['model', 'plan', 'default'][index]!);
    await box.press('PageUp');
    await active(page, '-model');
    await box.press('PageUp');
    await active(page, '-model');
    await page.close();
  });
  it('Shift+End is left to the textarea and does not move the palette selection', async () => {
    const page = await open();
    const box = page.locator('textarea[aria-label="Message"]');
    await box.press('Home');
    await active(page, '-model');
    await box.press('Shift+End');
    await page.waitForTimeout(100);
    await active(page, '-model');
    expect(await page.evaluate(() => document.querySelector('textarea')!.selectionStart)).toBe(1);
    await page.close();
  });
});
