import {expect, it, describe, beforeAll, afterAll} from 'vitest';
import {matchesShortcut} from '../apps/web/src/shell-layout';
import {build} from 'esbuild';
import {chromium, type Browser, type Page} from '@playwright/test';

const key = {key:'+', ctrlKey:true, metaKey:false, shiftKey:true, altKey:false};
it('matches a literal plus shortcut as recorded by Settings, including Shift on US keyboards', () => {
  expect(matchesShortcut(key, 'Ctrl+Shift++')).toBe(true);
  expect(matchesShortcut({...key, key:'='}, 'Ctrl+Shift++')).toBe(false);
  expect(matchesShortcut({...key, ctrlKey:false, shiftKey:false}, '+')).toBe(true);
});
it('requires both requested modifiers while preserving existing Ctrl cross-platform aliases', () => {
  const press = {...key, key:'K', shiftKey:false};
  expect(matchesShortcut(press, 'Ctrl+Meta+K')).toBe(false);
  expect(matchesShortcut({...press, ctrlKey:false, metaKey:true}, 'Ctrl+Meta+K')).toBe(false);
  expect(matchesShortcut({...press, metaKey:true}, 'Ctrl+Meta+K')).toBe(true);
  expect(matchesShortcut({...press, ctrlKey:false, metaKey:true}, 'Ctrl+K')).toBe(true);
  expect(matchesShortcut({...press, metaKey:true}, 'Ctrl+K')).toBe(false);
  expect(matchesShortcut({...press, metaKey:true}, 'Meta+K')).toBe(false);
});

describe('editable-target guard (#1704 T01)', () => {
  let browser: Browser, page: Page;
  beforeAll(async () => {
    const script = (await build({stdin: {contents: `
      import {matchesShortcut, editableShortcutTarget} from './apps/web/src/shell-layout';
      window.guard = {matchesShortcut, editableShortcutTarget};
    `, resolveDir: process.cwd(), loader: 'ts'}, bundle: true, write: false, format: 'iife', platform: 'browser'})).outputFiles[0]!.text;
    browser = await chromium.launch({headless: true, ...(process.platform === 'win32' ? {channel: 'msedge'} : {})});
    page = await browser.newPage();
    await page.setContent('<div id="root"><textarea id="t"></textarea><div id="ce" contenteditable="true"></div><button id="b">x</button><input id="i"/><select id="s"></select><div class="xterm-host"><span id="x"></span></div></div>');
    await page.addScriptTag({content: script});
  });
  afterAll(async () => { await browser?.close(); }, 45000);
  const blocked = (selector: string, event: object) => page.evaluate(([sel, ev]) => {
    const target = document.querySelector(sel);
    return window.guard.editableShortcutTarget(target) && !(ev.ctrlKey || ev.metaKey || ev.altKey);
  }, [selector, event] as const);
  const bare = {key: 'k', ctrlKey: false, metaKey: false, shiftKey: false, altKey: false};

  it.each(['#t', '#ce', '#i', '#s', '#x'])('a bare key inside %s is swallowed by the guard', async selector => {
    expect(await blocked(selector, bare)).toBe(true);
  });
  it('a bare key on a non-editable target is not blocked', async () => {
    expect(await blocked('#b', bare)).toBe(false);
  });
  it('a modifier chord still matches inside a textarea', async () => {
    const ctrl = {...bare, ctrlKey: true};
    expect(await blocked('#t', ctrl)).toBe(false);
    expect(await page.evaluate(() => window.guard.matchesShortcut({key: 'K', ctrlKey: true, metaKey: false, shiftKey: false, altKey: false}, 'Ctrl+K'))).toBe(true);
  });
  it('shift alone still counts as a bare key inside editable targets', async () => {
    expect(await blocked('#t', {...bare, shiftKey: true, key: 'K'})).toBe(true);
  });
});
