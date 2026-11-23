import { test, expect, type Page } from '@playwright/test';
import { resolve } from 'node:path';

const fixture = '/@fs/' + resolve('tests/e2e/changes-remote-sync-fixture.tsx').replaceAll('\\', '/');

const head = 'a'.repeat(40), revision = 'b'.repeat(64);
const sync = (over: Record<string, unknown> = {}) => ({
  branch: 'main', head, revision,
  remote: { name: 'origin', repo: 'owner/repo' },
  upstream: { ref: 'refs/remotes/origin/main', short: 'origin/main', oid: 'c'.repeat(40) },
  ahead: 0, behind: 0, state: 'up-to-date', lastFetchedAt: '2026-11-23T12:00:00+00:00', blockers: [] as string[],
  ...over,
});

type Routed = { syncs: ReturnType<typeof sync>[]; posts: { type: string; payload: unknown }[]; gets: number };
async function serve(page: Page, options: { syncs?: ReturnType<typeof sync>[]; actionStatus?: number; actionError?: { code: string; message: string; details?: unknown } } = {}): Promise<Routed> {
  const routed: Routed = { syncs: options.syncs ?? [sync()], posts: [], gets: 0 };
  await page.route(url => url.pathname === '/changes-remote-sync', route => route.fulfill({
    contentType: 'text/html', body: `<html data-theme="dark" data-native-titlebar="true"><body><div id="root"></div><script type="module">import RefreshRuntime from '/@react-refresh';RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;await import('${encodeURI(fixture)}');</script></body></html>`,
  }));
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url());
    if (url.pathname === '/api/bootstrap') return route.fulfill({ json: { csrfToken: 'synthetic-csrf' } });
    if (url.pathname === '/api/projects/project-a/git/sync') { routed.gets++; return route.fulfill({ json: routed.syncs[Math.min(routed.gets - 1, routed.syncs.length - 1)] }); }
    if (url.pathname === '/api/projects/project-a/actions') {
      const body = route.request().postDataJSON() as { id: string; type: string; payload: unknown };
      expect(route.request().headers()['x-harness-csrf']).toBe('synthetic-csrf');
      routed.posts.push({ type: body.type, payload: body.payload });
      if (options.actionStatus && options.actionStatus >= 400) return route.fulfill({ status: options.actionStatus, json: { error: options.actionError } });
      return route.fulfill({ json: { commandId: body.id, eventSeq: 50, result: { accepted: true } } });
    }
    return route.abort();
  });
  return routed;
}

const chip = (page: Page) => page.locator('.remote-sync-chip');
const fetchBtn = (page: Page) => page.getByRole('button', { name: /^Fetch/, exact: true });
const pullBtn = (page: Page) => page.getByRole('button', { name: /^Pull/, exact: true });

test('behind chip renders the remote count and pull stays enabled', async ({ page }) => {
  await serve(page, { syncs: [sync({ state: 'behind', behind: 2 })] });
  await page.goto('/changes-remote-sync');
  await expect(chip(page)).toContainText('2');
  await expect(pullBtn(page)).toHaveText(/^Pull 2/);
  await expect(pullBtn(page)).toBeEnabled();
});

test('chip states render per state table', async ({ page }) => {
  for (const [state, over, label] of [
    ['up-to-date', {}, 'Up to date'],
    ['ahead', { ahead: 3 }, '3'],
    ['diverged', { ahead: 1, behind: 4 }, '4'],
    ['no-upstream', { upstream: null, blockers: ['NO_UPSTREAM'] }, 'Not on remote'],
    ['detached', { branch: null, upstream: null, blockers: ['DETACHED'] }, 'Detached'],
  ] as const) {
    await page.unrouteAll(); await serve(page, { syncs: [sync({ state, ...over })] });
    await page.goto('/changes-remote-sync');
    await expect(chip(page)).toContainText(label);
    await expect(chip(page)).toHaveAttribute('data-state', state);
  }
});

test('no remote hides the actions and reports No GitHub remote', async ({ page }) => {
  await serve(page, { syncs: [sync({ state: 'no-remote', remote: null, upstream: null, blockers: ['NO_REMOTE'] })] });
  await page.goto('/changes-remote-sync');
  await expect(chip(page)).toContainText('No GitHub remote');
  await expect(fetchBtn(page)).toHaveCount(0);
  await expect(pullBtn(page)).toHaveCount(0);
});

test('legacy read-only working copy hides the whole group', async ({ page }) => {
  await serve(page, { syncs: [sync({ blockers: ['READ_ONLY'] })] });
  await page.goto('/changes-remote-sync');
  await expect(page.locator('.remote-sync')).toHaveCount(0);
});

test('fetch posts an action, refreshes the chip and announces new commits', async ({ page }) => {
  const routed = await serve(page, { syncs: [sync(), sync({ state: 'behind', behind: 2 })] });
  await page.goto('/changes-remote-sync');
  await expect(chip(page)).toContainText('Up to date');
  await fetchBtn(page).click();
  await expect.poll(() => routed.posts.length).toBe(1);
  expect(routed.posts[0]).toMatchObject({ type: 'fetch', payload: { revision, expectedHead: head } });
  await expect(chip(page)).toHaveAttribute('data-state', 'behind');
  await expect(page.getByRole('status').filter({ hasText: 'Fetched origin. 2 new commits on origin/main.' })).toBeVisible();
  await expect(page.getByTestId('changed-count')).toHaveText('1');
});

test('pull posts expectedHead and shows the success toast', async ({ page }) => {
  const routed = await serve(page, { syncs: [sync({ state: 'behind', behind: 2 }), sync()] });
  await page.goto('/changes-remote-sync');
  await pullBtn(page).click();
  await expect.poll(() => routed.posts.length).toBe(1);
  expect(routed.posts[0]).toMatchObject({ type: 'pull', payload: { revision, expectedHead: head } });
  await expect(page.getByRole('status').filter({ hasText: 'Pulled 2 commits from origin/main.' })).toBeVisible();
  await expect(chip(page)).toContainText('Up to date');
});

test('opening the panel, focusing and a finished turn never fetch', async ({ page }) => {
  const routed = await serve(page);
  await page.goto('/changes-remote-sync');
  await expect(chip(page)).toContainText('Up to date');
  await page.locator('main').click();
  await page.getByLabel('Preserved draft').focus();
  await page.waitForTimeout(300);
  expect(routed.posts).toEqual([]);
  expect(routed.gets).toBe(1);
});

test('toolbar refresh reloads the local sync read', async ({ page }) => {
  const routed = await serve(page);
  await page.goto('/changes-remote-sync');
  await expect(chip(page)).toContainText('Up to date');
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect.poll(() => routed.gets).toBe(2);
});

test('pull is disabled with a reason for every blocker', async ({ page }) => {
  for (const [blockers, reason] of [
    [['UP_TO_DATE'], 'Already up to date.'],
    [['DIVERGED'], 'Diverged — ask the agent or rebase.'],
    [['NO_UPSTREAM'], 'This branch is not on origin yet.'],
    [['DIRTY_OVERLAP'], 'Commit or discard changes'],
  ] as const) {
    await page.unrouteAll(); await serve(page, { syncs: [sync({ state: 'behind', behind: 1, blockers: [...blockers] })] });
    await page.goto('/changes-remote-sync');
    await expect(pullBtn(page)).toBeDisabled();
    expect(await pullBtn(page).getAttribute('title')).toContain(reason);
  }
});

test('auth failure surfaces the sign-in control', async ({ page }) => {
  await serve(page, { actionStatus: 403, actionError: { code: 'GITHUB_AUTH_REQUIRED', message: 'Sign in required.' } });
  await page.goto('/changes-remote-sync');
  await fetchBtn(page).click();
  await expect(page.locator('.remote-sync-error')).toContainText('Sign in to GitHub to fetch from this repository.');
  await expect(page.locator('.remote-sync-error')).toContainText('GitHub');
});

test('blocked pull explains the refusal without a toast', async ({ page }) => {
  await serve(page, { syncs: [sync({ state: 'behind', behind: 2 })], actionStatus: 400, actionError: { code: 'PULL_BLOCKED', message: 'Refused.', details: { blockers: ['DIRTY_OVERLAP'] } } });
  await page.goto('/changes-remote-sync');
  await pullBtn(page).click();
  await expect(page.locator('.remote-sync-error')).toContainText('Commit or discard changes');
});

test('keyboard-only reach: tab to Fetch and activate', async ({ page }) => {
  const routed = await serve(page);
  await page.goto('/changes-remote-sync');
  await expect(chip(page)).toContainText('Up to date');
  for (let i = 0; i < 12; i++) { await page.keyboard.press('Tab'); if (await fetchBtn(page).evaluate(node => node === document.activeElement)) break; }
  await expect(fetchBtn(page)).toBeFocused();
  await page.keyboard.press('Enter');
  await expect.poll(() => routed.posts.length).toBe(1);
  expect(routed.posts[0].type).toBe('fetch');
});

test('narrow container collapses button labels to icons', async ({ page }) => {
  await serve(page);
  await page.setViewportSize({ width: 300, height: 768 });
  await page.goto('/changes-remote-sync');
  await expect(chip(page)).toBeVisible();
  await expect(page.locator('.remote-sync-btn .remote-sync-label').first()).toBeHidden();
  await expect(fetchBtn(page)).toBeVisible();
});
