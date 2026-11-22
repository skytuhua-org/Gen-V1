import {test, expect, type Page} from '@playwright/test';
import {mkdirSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {serveTaskFixture, taskFixture} from './task-interface-fixture';
import type {Thread} from '../../packages/contracts';

const outDir = join(process.env.GEN_BROWSER_OUTPUT_DIR ?? join(tmpdir(), 'wo-1598-thread-switching'), 'evidence');
const now = '2026-11-21T00:00:00.000Z';
const extra = (id: string, title: string, presentation?: Thread['presentation']): Thread =>
  ({id, title, projectName: 'Switching fixture', status: 'ready', epoch: 0, runId: null, modelId: 'test/model', sessionPath: 'fixture', createdAt: now, updatedAt: now, presentation});

const switcher = (page: Page) => page.locator('.thread-switcher-dialog');
const activeRow = (page: Page) => page.locator('.sidebar-thread-row.active');
const highlighted = (page: Page) => switcher(page).locator('.thread-switcher-row[data-active]');

async function fixture(page: Page) {
  await page.emulateMedia({reducedMotion: 'no-preference'});
  const snapshot = taskFixture({root: 'text', elements: {text: {type: 'Text', props: {text: 'Thread switching fixture'}}}});
  snapshot.settings = {theme: 'dark', modelId: 'test/model', preferences: {}};
  snapshot.threads.push(
    extra('bravo', 'Bravo thread'),
    extra('charlie', 'Charlie thread', {unread: true}),
    extra('delta', 'Delta thread'),
  );
  const served = await serveTaskFixture(page, snapshot);
  await page.route('**/api/shell/navigation?*', route => route.fulfill({json: {
    sequence: 1, total: snapshot.threads.length, items: snapshot.threads, nextCursor: null, order: 'created-desc',
    stats: {pinned: 0, working: 0, waiting: 0, settled: 0, minOrder: 0, maxOrder: 0},
  }}));
  await page.route('**/api/plugins', route => route.fulfill({json: {plugins: []}}));
  await page.goto('/');
  await expect(page.getByRole('button', {name: /Bravo thread/}).first()).toBeVisible();
  return served;
}

test('Ctrl+Tab opens the switcher, repeats cycle, release commits', async ({page}) => {
  await fixture(page);
  await expect(activeRow(page)).toContainText('Source-bound task fixture');
  await page.keyboard.down('Control');
  await page.keyboard.press('Tab');
  await expect(switcher(page)).toBeVisible();
  await expect(highlighted(page)).toContainText('Bravo thread');
  await page.keyboard.press('Tab');
  await expect(highlighted(page)).toContainText('Charlie thread');
  await switcher(page).screenshot({path: join(outDir, 'switcher-preview-dark.png')});
  await page.keyboard.up('Control');
  await expect(switcher(page)).toHaveCount(0);
  await expect(activeRow(page)).toContainText('Charlie thread');
});

test('Ctrl+Shift+Tab cycles backward and Escape cancels without switching', async ({page}) => {
  await fixture(page);
  await page.keyboard.down('Control');
  await page.keyboard.down('Shift');
  await page.keyboard.press('Tab');
  await expect(switcher(page)).toBeVisible();
  await expect(highlighted(page)).toContainText('Delta thread');
  await page.keyboard.press('Escape');
  await page.keyboard.up('Shift');
  await page.keyboard.up('Control');
  await expect(switcher(page)).toHaveCount(0);
  await expect(activeRow(page)).toContainText('Source-bound task fixture');
});

test('Ctrl+2 opens the second visible sidebar row directly', async ({page}) => {
  await fixture(page);
  // Sidebar rows order by updatedAt desc: bravo, charlie, delta, then the fixture thread.
  await page.keyboard.press('Control+2');
  await expect(activeRow(page)).toContainText('Charlie thread');
});

test('Alt+Shift+U opens the next unread thread', async ({page}) => {
  await fixture(page);
  await page.keyboard.press('Alt+Shift+U');
  await expect(activeRow(page)).toContainText('Charlie thread');
});

test('Enter inside the preview commits the highlighted thread', async ({page}) => {
  await fixture(page);
  await page.keyboard.down('Control');
  await page.keyboard.press('Tab');
  await expect(switcher(page)).toBeVisible();
  await page.keyboard.press('Enter');
  await page.keyboard.up('Control');
  await expect(switcher(page)).toHaveCount(0);
  await expect(activeRow(page)).toContainText('Bravo thread');
});

test('arrow keys move the preview highlight', async ({page}) => {
  await fixture(page);
  await page.keyboard.down('Control');
  await page.keyboard.press('Tab');
  await expect(highlighted(page)).toContainText('Bravo thread');
  await page.keyboard.press('ArrowDown');
  await expect(highlighted(page)).toContainText('Charlie thread');
  await page.keyboard.press('ArrowUp');
  await expect(highlighted(page)).toContainText('Bravo thread');
  await page.keyboard.up('Control');
  await expect(activeRow(page)).toContainText('Bravo thread');
});

test('switcher evidence in light theme and reduced motion', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  const snapshot = taskFixture({root: 'text', elements: {text: {type: 'Text', props: {text: 'Thread switching fixture'}}}});
  snapshot.settings = {theme: 'light', modelId: 'test/model', preferences: {}};
  snapshot.threads.push(extra('bravo', 'Bravo thread'), extra('charlie', 'Charlie thread', {unread: true}));
  await serveTaskFixture(page, snapshot);
  await page.route('**/api/shell/navigation?*', route => route.fulfill({json: {
    sequence: 1, total: snapshot.threads.length, items: snapshot.threads, nextCursor: null, order: 'created-desc',
    stats: {pinned: 0, working: 0, waiting: 0, settled: 0, minOrder: 0, maxOrder: 0},
  }}));
  await page.route('**/api/plugins', route => route.fulfill({json: {plugins: []}}));
  await page.goto('/');
  await expect(page.getByRole('button', {name: /Bravo thread/}).first()).toBeVisible();
  mkdirSync(outDir, {recursive: true});
  await page.keyboard.down('Control');
  await page.keyboard.press('Tab');
  await expect(switcher(page)).toBeVisible();
  await switcher(page).screenshot({path: join(outDir, 'switcher-preview-light-reduced.png')});
  await page.keyboard.up('Control');
});

test.beforeAll(() => mkdirSync(outDir, {recursive: true}));
test.afterAll(() => writeFileSync(join(outDir, 'meta.json'), JSON.stringify({head: process.env.GITHUB_SHA ?? 'local', suite: 'thread-switching'}, null, 2)));
