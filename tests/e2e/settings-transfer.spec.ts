import {expect, test, type Page} from '@playwright/test';
import {resolve} from 'node:path';

const name = 'gen-settings-2026-11-22.json';
const valid = (preferences: object = {sendShortcut: 'mod-enter', showWorkingSection: false}, extra: object = {}) =>
  JSON.stringify({format: 'gen.settings', version: 1, exportedAt: '2026-11-21T18:00:00.000Z', appVersion: '0.6.5', theme: 'dark', preferences, ...extra});
const upload = (page: Page, body: string, file = name) =>
  page.locator('input[type=file]').setInputFiles({name: file, mimeType: 'application/json', buffer: Buffer.from(body)});

async function setup(page: Page) {
  await page.route('**/api/**', route => route.fulfill({status: 500, json: {error: {message: 'Unexpected synthetic fixture request'}}}));
  const fixture = '/@fs/' + resolve('tests/e2e/settings-transfer-fixture.tsx').replaceAll('\\', '/');
  await page.route('**/settings-transfer-fixture', route => route.fulfill({contentType: 'text/html', body: `<html data-theme="dark"><body><div id="root"></div><script type="module">import RefreshRuntime from '/@react-refresh';RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;await import('${encodeURI(fixture)}');</script></body></html>`}));
  await page.goto('/settings-transfer-fixture');
}

test('export downloads a gen-settings file and shows the status line', async ({page}) => {
  await setup(page);
  const download = page.waitForEvent('download');
  await page.getByRole('button', {name: 'Export…'}).click();
  expect((await download).suggestedFilename()).toMatch(/^gen-settings-\d{4}-\d{2}-\d{2}\.json$/);
  await expect(page.getByText('Settings file downloaded.')).toBeVisible();
});

test('import previews, applies one settings.update, and undoes it', async ({page}) => {
  await setup(page);
  await upload(page, valid());
  const modal = page.getByRole('dialog', {name: 'Import settings'});
  await expect(modal).toBeVisible();
  await expect(modal.getByText(/From gen-settings-2026-11-22\.json/)).toBeVisible();
  await expect(modal.getByText('Will change (2)')).toBeVisible();
  await modal.getByRole('button', {name: 'Apply 2 changes'}).click();
  await expect.poll(() => page.evaluate(() => window.commands!.length)).toBe(1);
  expect(await page.evaluate(() => window.commands![0])).toEqual({type: 'settings.update', payload: {preferences: {sendShortcut: 'mod-enter', showWorkingSection: false}}});
  await expect(page.getByTestId('send-shortcut')).toHaveText('mod-enter');
  await expect(page.getByRole('button', {name: 'Undo import'})).toBeVisible();
  await page.getByRole('button', {name: 'Undo import'}).click();
  await expect.poll(() => page.evaluate(() => window.commands!.length)).toBe(2);
  await expect(page.getByTestId('send-shortcut')).toHaveText('enter');
  await expect(page.getByTestId('working-section')).toHaveText('true');
});

test('a newer-version file is rejected with exact copy', async ({page}) => {
  await setup(page);
  await upload(page, valid({}, {version: 2}));
  await expect(page.getByRole('alert')).toHaveText('This file was made by a newer version of Gen. Update Gen to import it.');
  await expect.poll(() => page.evaluate(() => window.commands!.length)).toBe(0);
});

test('keyboard: Escape closes the preview; focus returns to Import', async ({page}) => {
  await setup(page);
  await page.getByRole('button', {name: 'Import…'}).focus();
  await upload(page, valid());
  await expect(page.getByRole('dialog', {name: 'Import settings'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', {name: 'Import…'})).toBeFocused();
});

test('rows animate in without a translate under reduced motion', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await setup(page);
  await upload(page, valid());
  await expect(page.getByRole('dialog', {name: 'Import settings'})).toBeVisible();
  const row = page.locator('.settings-transfer-change').first();
  expect(await row.evaluate(element => getComputedStyle(element).transform)).toBe('none');
});

test('theme change in the file updates the theme payload', async ({page}) => {
  await setup(page);
  await upload(page, valid({sendShortcut: 'mod-enter'}, {theme: 'light'}));
  await page.getByRole('button', {name: 'Apply 2 changes'}).click();
  await expect.poll(() => page.evaluate(() => window.commands!.length)).toBe(1);
  expect(await page.evaluate(() => window.commands![0].payload)).toEqual({theme: 'light', preferences: {sendShortcut: 'mod-enter'}});
  await expect(page.getByTestId('theme')).toHaveText('light');
});
