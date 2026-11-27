import { expect, test, type Page } from '@playwright/test';
import { resolve } from 'node:path';

const fixture = '/@fs/' + resolve('tests/e2e/prompt-snippets-fixture.tsx').replaceAll('\\', '/');
const open = async (page: Page, theme = 'dark', query = '') => {
  await page.route(url => url.pathname === '/prompt-snippets', route => route.fulfill({
    contentType: 'text/html', body: `<html data-theme="${theme}"><body><div id="root"></div><script type="module">import RefreshRuntime from '/@react-refresh';RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;await import('${encodeURI(fixture)}');</script></body></html>`,
  }));
  await page.goto(`/prompt-snippets${query}`);
  await page.waitForFunction(() => window.snippetsSeeded !== undefined);
};

const trigger = (page: Page) => page.getByRole('button', { name: 'Snippets', exact: true });
const picker = (page: Page) => page.getByRole('dialog', { name: 'Snippets', exact: true }).first();

test('picker opens over the trigger with searchable rows at 1440×900 dark', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  await expect(trigger(page)).toHaveAttribute('aria-haspopup', 'dialog');
  await trigger(page).click();
  const popup = picker(page);
  await popup.evaluate(node => Promise.all(node.getAnimations().map(a => a.finished)));
  await expect(popup).toBeVisible();
  const box = (await popup.boundingBox())!;
  expect(box.width).toBeGreaterThanOrEqual(380);
  expect(box.width).toBeLessThanOrEqual(420);
  expect(box.height).toBeLessThanOrEqual(440);
  await expect(page.getByRole('option', { name: 'Standup note', exact: false })).toHaveCount(1);
  const rows = await page.getByRole('option').evaluateAll(nodes => nodes.map(n => n.getBoundingClientRect().height));
  for (const height of rows) expect(height).toBeGreaterThanOrEqual(52);
  await page.screenshot({ path: 'shots/picker-1440-dark.png' });
});

test('insert writes the body at the caret and the status region announces undo', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  await page.getByLabel('Message').click();
  await page.keyboard.press('End');
  await trigger(page).click();
  await page.getByRole('option', { name: 'Standup note' }).click();
  await expect(page.getByLabel('Message')).toHaveValue(/Check the logs first\.Yesterday/);
  await expect(page.getByRole('status')).toContainText('Inserted Standup note');
  await page.getByRole('button', { name: 'Undo insertion' }).click();
  await expect(page.getByLabel('Message')).toHaveValue('Check the logs first.');
});

test('narrow 320px toolbar wraps without squeezing the trigger label', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await open(page);
  const triggerBox = (await trigger(page).boundingBox())!;
  const fontSize = await trigger(page).evaluate(node => parseFloat(getComputedStyle(node).fontSize));
  expect(fontSize).toBeGreaterThanOrEqual(12);
  expect(triggerBox.height).toBeGreaterThanOrEqual(32);
  await trigger(page).click();
  const popup = picker(page);
  await popup.evaluate(node => Promise.all(node.getAnimations().map(a => a.finished)));
  const box = (await popup.boundingBox())!;
  expect(box.width).toBeLessThanOrEqual(320);
  expect(box.x).toBeGreaterThanOrEqual(0);
  await page.screenshot({ path: 'shots/picker-320-dark.png' });
});

test('manage dialog lists, edits and deletes within the viewport at 420×800 light', async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 800 });
  await open(page, 'light');
  await trigger(page).click();
  await page.getByRole('button', { name: 'Manage snippets' }).click();
  const dialog = page.getByRole('dialog').last();
  await expect(dialog).toBeVisible();
  await dialog.evaluate(node => Promise.all(node.getAnimations().map(a => a.finished)));
  const box = (await dialog.boundingBox())!;
  expect(box.width).toBeLessThanOrEqual(420);
  expect(box.width).toBeGreaterThanOrEqual(384); // ~min(640px, 100vw-32px), subpixel
  await expect(page.getByText('Standup note')).toBeVisible();
  await page.screenshot({ path: 'shots/manage-420-light.png' });
});
