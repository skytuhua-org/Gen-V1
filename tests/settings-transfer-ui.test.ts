import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {build} from 'esbuild';
import {chromium, type Browser, type Page} from '@playwright/test';
import type {Dispatch, SetStateAction} from 'react';
import type {UiPreferences} from '../packages/contracts/preferences';

declare global {
  interface Window {
    settingsTransferCalls: {
      export: {serialized: string; filename: string}[];
      persist: Record<string, unknown>[];
      cancel: boolean;
      persistOk?: boolean;
    };
    setSettingsTransferPrefs: Dispatch<SetStateAction<UiPreferences>>;
  }
}

const fixture = `
import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {SettingsTransfer} from './apps/web/src/SettingsTransfer';
import {DesktopProvider} from './apps/web/src/desktop-context';
import {Toaster} from './packages/ui-shell/Toast';
import {DEFAULT_PREFERENCES} from './packages/contracts/preferences';

const calls = {export: [], persist: [], cancel: false};
window.settingsTransferCalls = calls;
const bridge = {
  exportSettings: (serialized, filename) => { calls.export.push({serialized, filename}); return Promise.resolve(calls.cancel ? {status: 'cancelled', admitted: true, filename, bytes: 0, sha256: ''} : {status: 'saved', admitted: true, filename, bytes: serialized.length, sha256: ''}); },
  onState: () => () => {}, onCloseRequested: () => () => {},
};
const persist = async payload => { calls.persist.push(payload); if (calls.persistOk === false) return false; window.applyWrite?.(payload); return true; };

function Fixture() {
  const [prefs, setPrefs] = useState({...DEFAULT_PREFERENCES});
  const [theme, setTheme] = useState('dark');
  window.setSettingsTransferPrefs = setPrefs;
  window.applyWrite = payload => { setPrefs(p => ({...p, ...payload.preferences, keybindings: {...p.keybindings, ...(payload.preferences?.keybindings ?? {})}})); if (payload.theme) setTheme(payload.theme); };
  const body = <SettingsTransfer theme={theme} preferences={prefs} persist={persist}/>;
  return <>{window.desktopMode ? <DesktopProvider bridge={bridge} context={{windowId: 'main-1', surface: {kind: 'main'}, windows: []}}>{body}</DesktopProvider> : body}<Toaster/></>;
}
createRoot(document.getElementById('root')).render(<Fixture/>);
`;

describe('SettingsTransfer', () => {
  let browser: Browser, script: string;
  beforeAll(async () => {
    script = (await build({stdin: {contents: fixture, resolveDir: process.cwd(), loader: 'tsx'}, loader: {'.css': 'empty'}, bundle: true, write: false, format: 'iife', platform: 'browser', jsx: 'automatic', define: {'process.env.NODE_ENV': '"production"'}})).outputFiles[0]!.text;
    browser = await chromium.launch({headless: true, ...(process.platform === 'win32' ? {channel: 'msedge'} : {})});
  });
  afterAll(async () => { await browser?.close(); }, 45000);
  async function open(desktop = true): Promise<Page> {
    const page = await browser.newPage();
    await page.setContent('<div id="root"></div>');
    await page.addScriptTag({content: `window.desktopMode=${desktop};`});
    await page.addScriptTag({content: script});
    return page;
  }
  const file = (body: object | string, name = 'gen-settings-2026-11-22.json') => ({name, mimeType: 'application/json', buffer: Buffer.from(typeof body === 'string' ? body : JSON.stringify(body))});
  const settingsFile = (preferences: object, extra: object = {}) => ({format: 'gen.settings', version: 1, exportedAt: '2026-11-21T18:00:00.000Z', appVersion: '0.6.5', theme: 'dark', preferences, ...extra});

  it('exports through the desktop bridge with the generated filename and shows saved status', async () => {
    const page = await open();
    await page.getByRole('button', {name: 'Export…'}).click();
    await expect.poll(() => page.evaluate(() => window.settingsTransferCalls.export.length)).toBe(1);
    const call = await page.evaluate(() => window.settingsTransferCalls.export[0]);
    expect(call.filename).toMatch(/^gen-settings-\d{4}-\d{2}-\d{2}\.json$/);
    expect(JSON.parse(call.serialized).format).toBe('gen.settings');
    await expect.poll(async()=>page.locator('[role=status]').last().textContent()).toBe('Settings saved to file.');
  });

  it('shows nothing when the native save dialog is cancelled', async () => {
    const page = await open();
    await page.evaluate(() => { window.settingsTransferCalls.cancel = true; });
    await page.getByRole('button', {name: 'Export…'}).click();
    await expect.poll(() => page.evaluate(() => window.settingsTransferCalls.export.length)).toBe(1);
    await new Promise(r=>setTimeout(r,300));expect(await page.locator('[role=status]').count()).toBe(0);
  });

  it('downloads the file in the browser build', async () => {
    const page = await open(false);
    const download = page.waitForEvent('download');
    await page.getByRole('button', {name: 'Export…'}).click();
    expect((await download).suggestedFilename()).toMatch(/^gen-settings-\d{4}-\d{2}-\d{2}\.json$/);
    await expect.poll(async()=>page.getByText('Settings file downloaded.').isVisible()).toBe(true);
  });

  it.each([
    [{format: 'other', version: 1}, 'This file isn\'t a Gen settings file.'],
    [{format: 'gen.settings', version: 2}, 'This file was made by a newer version of Gen. Update Gen to import it.'],
    ['{broken', 'Couldn\'t read this file.'],
  ])('rejects a bad file with exact error copy: %j', async (content, error) => {
    const page = await open();
    await page.locator('input[type=file]').setInputFiles(file(content));
    await expect.poll(async()=>page.getByRole('alert').textContent()).toBe(error);
    expect(await page.evaluate(() => window.settingsTransferCalls.persist.length)).toBe(0);
  });

  it('previews changes, applies them in one write, then undoes via the toast', async () => {
    const page = await open();
    await page.locator('input[type=file]').setInputFiles(file(settingsFile({sendShortcut: 'mod-enter', showWorkingSection: false})));
    await expect.poll(async()=>page.getByRole('dialog').isVisible()).toBe(true);
    await expect.poll(async()=>page.getByText('Will change (2)').isVisible()).toBe(true);
    expect(await page.getByText('Send shortcut').isVisible()).toBe(true);
    expect(await page.getByRole('button', {name: 'Apply 2 changes'}).isVisible()).toBe(true);
    await page.getByRole('button', {name: 'Apply 2 changes'}).click();
    await expect.poll(() => page.evaluate(() => window.settingsTransferCalls.persist.length)).toBe(1);
    expect(await page.evaluate(() => window.settingsTransferCalls.persist[0])).toEqual({preferences: {sendShortcut: 'mod-enter', showWorkingSection: false}});
    await page.getByRole('button', {name: 'Undo', exact: true}).click();
    await expect.poll(() => page.evaluate(() => window.settingsTransferCalls.persist.length)).toBe(2);
    expect(await page.evaluate(() => window.settingsTransferCalls.persist[1])).toEqual({preferences: {sendShortcut: 'enter', showWorkingSection: true}});
    await expect.poll(async()=>page.getByRole('button', {name: 'Undo import'}).count()).toBe(0);
  });

  it('keeps user edits made after the import and reports the kept count', async () => {
    const page = await open();
    await page.locator('input[type=file]').setInputFiles(file(settingsFile({sendShortcut: 'mod-enter', showWorkingSection: false})));
    await page.getByRole('button', {name: 'Apply 2 changes'}).click();
    await expect.poll(() => page.evaluate(() => window.settingsTransferCalls.persist.length)).toBe(1);
    await page.evaluate(() => window.setSettingsTransferPrefs(prefs => ({...prefs, sendShortcut: 'mod-enter-multiline'})));
    await page.getByRole('button', {name: 'Undo import'}).click();
    await expect.poll(() => page.evaluate(() => window.settingsTransferCalls.persist.length)).toBe(2);
    expect(await page.evaluate(() => window.settingsTransferCalls.persist[1])).toEqual({preferences: {showWorkingSection: true}});
    await expect.poll(async()=>page.getByText('Kept 1 setting you changed after importing.').isVisible()).toBe(true);
  });

  it('explains current-shortcut conflicts and applies only the remaining valid changes', async () => {
    const page = await open();
    await page.locator('input[type=file]').setInputFiles(file(settingsFile({showWorkingSection: false, keybindings: {newThread: 'Ctrl+K'}})));
    await expect.poll(async()=>page.getByText('Ignored (1)').isVisible()).toBe(true);
    expect(await page.getByText('Shortcut conflicts with Search', {exact: false}).isVisible()).toBe(true);
    await page.getByRole('button', {name: 'Apply 1 change', exact: true}).click();
    await expect.poll(() => page.evaluate(() => window.settingsTransferCalls.persist.length)).toBe(1);
    expect(await page.evaluate(() => window.settingsTransferCalls.persist[0])).toEqual({preferences: {showWorkingSection: false}});
  });

  it('refreshes a preview when current shortcuts change before confirmation', async () => {
    const page = await open();
    await page.locator('input[type=file]').setInputFiles(file(settingsFile({showWorkingSection: false, keybindings: {newThread: 'Ctrl+Alt+M'}})));
    await expect.poll(async()=>page.getByRole('button', {name: 'Apply 2 changes', exact: true}).isVisible()).toBe(true);
    await page.evaluate(() => window.setSettingsTransferPrefs(prefs => ({...prefs, keybindings: {...prefs.keybindings, search: 'Ctrl+Alt+M'}})));
    await page.getByRole('button', {name: 'Apply 2 changes', exact: true}).click();
    expect(await page.evaluate(() => window.settingsTransferCalls.persist.length)).toBe(0);
    await expect.poll(async()=>page.getByText('Ignored (1)').isVisible()).toBe(true);
    expect(await page.getByRole('alert').textContent()).toBe('Settings changed while this preview was open. Review the updated changes before applying.');
    await page.getByRole('button', {name: 'Apply 1 change', exact: true}).click();
    await expect.poll(() => page.evaluate(() => window.settingsTransferCalls.persist.length)).toBe(1);
    expect(await page.evaluate(() => window.settingsTransferCalls.persist[0])).toEqual({preferences: {showWorkingSection: false}});
  });

  it('keeps current shortcuts when an inverse import would create a new conflict', async () => {
    const page = await open();
    await page.locator('input[type=file]').setInputFiles(file(settingsFile({showWorkingSection: false, keybindings: {search: 'Ctrl+Alt+M'}})));
    await page.getByRole('button', {name: 'Apply 2 changes', exact: true}).click();
    await expect.poll(() => page.evaluate(() => window.settingsTransferCalls.persist.length)).toBe(1);
    await page.evaluate(() => window.setSettingsTransferPrefs(prefs => ({...prefs, keybindings: {...prefs.keybindings, newThread: 'Ctrl+K'}})));
    await page.getByRole('button', {name: 'Undo import', exact: true}).click();
    await expect.poll(() => page.evaluate(() => window.settingsTransferCalls.persist.length)).toBe(2);
    expect(await page.evaluate(() => window.settingsTransferCalls.persist[1])).toEqual({preferences: {showWorkingSection: true}});
    await expect.poll(async()=>page.getByText('Kept 1 shortcut to avoid conflicts with current settings.').isVisible()).toBe(true);
  });

  it('lists ignored entries and shows Close only for a zero-change file', async () => {
    const page = await open();
    await page.locator('input[type=file]').setInputFiles(file(settingsFile({projectColors: {p: '#4F6EFF'}, zzz: 1})));
    await expect.poll(async()=>page.getByText('Your settings already match this file.').isVisible()).toBe(true);
    expect(await page.getByText('Ignored (2)').isVisible()).toBe(true);
    expect(await page.getByText('Unknown setting').isVisible()).toBe(true);
    expect(await page.getByText('Not a portable setting').isVisible()).toBe(true);
    expect(await page.getByRole('button', {name: 'Apply'}).count()).toBe(0);
    await page.getByRole('button', {name: 'Close', exact: true}).click();
    await expect.poll(async()=>page.getByRole('dialog').count()).toBe(0);
  });

  it('keeps the modal open with an inline alert when apply fails', async () => {
    const page = await open();
    await page.locator('input[type=file]').setInputFiles(file(settingsFile({sendShortcut: 'mod-enter'})));
    await page.evaluate(() => { window.settingsTransferCalls.persistOk = false; });
    await page.getByRole('button', {name: 'Apply 1 change'}).click();
    await expect.poll(() => page.evaluate(() => window.settingsTransferCalls.persist.length)).toBe(1);
    await expect.poll(async()=>page.getByRole('dialog').isVisible()).toBe(true);
    await expect.poll(async()=>page.getByRole('alert').textContent()).toBe('Couldn\'t apply the imported settings. Nothing was changed.');
  });

  it('accepts the same file twice', async () => {
    const page = await open();
    const input = file(settingsFile({sendShortcut: 'mod-enter'}));
    await page.locator('input[type=file]').setInputFiles(input);
    await expect.poll(async()=>page.getByRole('dialog').isVisible()).toBe(true);
    await page.getByRole('button', {name: 'Cancel'}).click();
    await page.locator('input[type=file]').setInputFiles(input);
    await expect.poll(async()=>page.getByRole('dialog').isVisible()).toBe(true);
  });
});
