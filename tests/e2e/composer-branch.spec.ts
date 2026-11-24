import { test, expect, type Page, type Route } from '@playwright/test';
import { resolve } from 'node:path';

const now = Date.now();
const entry = (name: string, head: string, extra: Record<string, unknown> = {}) => ({
  name, head: (head + '0'.repeat(40)).slice(0, 40), subject: 'Fixture commit', committedAt: new Date(now - 86400_000).toISOString(), upstream: null, current: false, occupiedBy: null, ...extra,
});
const revision = 'a'.repeat(64);
const list = (overrides: Record<string, unknown> = {}) => ({
  current: 'main', head: 'b'.repeat(40), revision, detached: false,
  dirty: { tracked: 0, untracked: 0 }, canSwitch: true, reason: null,
  local: [entry('main', 'b', { current: true }), entry('feature/x', 'c'), entry('occupied', 'd', { occupiedBy: 'other' })],
  remote: [entry('origin/upstream-only', 'e')],
  truncated: false, ...overrides,
});
async function mount(page: Page, branches: ReturnType<typeof list> = list(), actions?: (route: Route, body: { type?: string; payload?: Record<string, unknown> }, served: ReturnType<typeof list>) => void) {
  const path = encodeURI('/@fs/' + resolve('tests/e2e/composer-branch-fixture.tsx').replaceAll('\\', '/'));
  const served = JSON.parse(JSON.stringify(branches)) as ReturnType<typeof list>;
  const switchTo = (name: string, source: string) => {
    const short = source === 'remote' ? name.slice(name.indexOf('/') + 1) : name;
    if (!served.local.some(e => e.name === short)) served.local.push(entry(short, 'f'));
    served.current = short;
    for (const e of served.local) e.current = e.name === short;
    served.dirty = { tracked: 0, untracked: 0 };
  };
  await page.route('**/api/bootstrap*', route => route.fulfill({ json: { csrfToken: 'fixture-token' } }));
  await page.route('**/api/projects/*/branches*', route => route.fulfill({ json: served }));
  await page.route('**/api/projects/*/actions', route => {
    const body = JSON.parse(route.request().postData() ?? '{}');
    if (actions) return actions(route, body, served);
    const name = body.payload?.branch ?? body.payload?.name;
    if (body.type === 'switch-branch' || body.type === 'create-branch') switchTo(String(name), String(body.payload?.source ?? 'local'));
    route.fulfill({ json: { commandId: body.id ?? 'c', result: {} } });
  });
  await page.route('**/composer-branch-fixture?*', route => route.fulfill({ contentType: 'text/html', body: `<html data-theme="dark"><body><div id="root"></div><script type="module">import RefreshRuntime from '/@react-refresh';RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;await import('${path}');</script></body></html>` }));
  await page.goto('/composer-branch-fixture?mount=1');
}
const chip = (page: Page) => page.getByRole('combobox', { name: /^Branch:/ });


test('chip stays clickable after a failed branch load and retries', async ({ page }) => {
  const path = encodeURI('/@fs/' + resolve('tests/e2e/composer-branch-fixture.tsx').replaceAll('\\', '/'));
  let failed = true;
  await page.route('**/api/bootstrap*', route => route.fulfill({ json: { csrfToken: 'fixture-token' } }));
  await page.route('**/api/projects/*/branches*', route => {
    if (failed) return route.fulfill({ status: 500, json: { code: 'HTTP_ERROR', message: 'boom' } });
    route.fulfill({ json: list() });
  });
  await page.route('**/composer-branch-fixture?*', route => route.fulfill({ contentType: 'text/html', body: `<html data-theme="dark"><body><div id="root"></div><script type="module">import RefreshRuntime from '/@react-refresh';RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;await import('${path}');</script></body></html>` }));
  await page.goto('/composer-branch-fixture?mount=1');
  const trigger = chip(page);
  await expect(trigger).toBeVisible();
  await trigger.click();
  const box = page.getByRole('dialog', { name: 'Branches' });
  await expect(box.getByRole('button', { name: 'Check branch' })).toBeVisible();
  failed = false;
  await box.getByRole('button', { name: 'Check branch' }).click();
  await expect(box.getByRole('listbox').getByRole('option')).toHaveCount(4);
});

test('chip lists current-first local and remote branches and switches cleanly', async ({ page }) => {
  await mount(page);
  const trigger = chip(page);
  await expect(trigger).toContainText('main');
  await trigger.click();
  const options = page.getByRole('listbox', { name: 'Branches' }).getByRole('option');
  await expect(options).toHaveCount(4);
  await expect(options.first()).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('option', { name: /occupied/ })).toContainText('In use by another thread');
  await page.getByRole('option', { name: /feature\/x/ }).click();
  await expect(trigger).toContainText('feature/x');
});

test('search filters rows and Escape restores focus', async ({ page }) => {
  await mount(page);
  const trigger = chip(page);
  await trigger.click();
  const search = page.getByRole('searchbox', { name: 'Search branches' });
  await search.fill('upstream');
  await expect(page.getByRole('option')).toHaveCount(1);
  await search.fill('zzz');
  await expect(page.getByRole('listbox', { name: 'Branches' }).getByRole('status')).toContainText('No branches match "zzz".');
  await search.press('Escape');
  await expect(trigger).toBeFocused();
});

test('dirty working copy requires Bring changes before switching', async ({ page }) => {
  let sent: Record<string, unknown> | undefined;
  await mount(page, list({ dirty: { tracked: 1, untracked: 0 } }), (route, body, served) => {
    sent = body.payload;
    const name = String(body.payload?.branch ?? body.payload?.name ?? '');
    if (body.type === 'switch-branch' || body.type === 'create-branch') {
      const short = body.payload?.source === 'remote' ? name.slice(name.indexOf('/') + 1) : name;
      served.current = short;
      if (!served.local.some(e => e.name === short)) served.local.push(entry(short, 'f'));
      for (const e of served.local) e.current = e.name === short;
      served.dirty = { tracked: 0, untracked: 0 };
    }
    route.fulfill({ json: { commandId: 'c', result: {} } });
  });
  const trigger = chip(page);
  await trigger.click();
  await page.getByRole('option', { name: /feature\/x/ }).click();
  await expect(page.getByRole('alertdialog', { name: 'Uncommitted changes' })).toBeVisible();
  await page.getByRole('button', { name: 'Bring changes' }).click();
  await expect(trigger).toContainText('feature/x');
  expect(sent).toMatchObject({ branch: 'feature/x', source: 'local', bringChanges: true, expectedHead: 'b'.repeat(40), revision });
});

test('remote pick tracks the remote branch', async ({ page }) => {
  let sent: Record<string, unknown> | undefined;
  await mount(page, list(), (route, body, served) => {
    sent = body.payload;
    const name = String(body.payload?.branch ?? body.payload?.name ?? '');
    if (body.type === 'switch-branch' || body.type === 'create-branch') {
      const short = body.payload?.source === 'remote' ? name.slice(name.indexOf('/') + 1) : name;
      served.current = short;
      if (!served.local.some(e => e.name === short)) served.local.push(entry(short, 'f'));
      for (const e of served.local) e.current = e.name === short;
      served.dirty = { tracked: 0, untracked: 0 };
    }
    route.fulfill({ json: { commandId: 'c', result: {} } });
  });
  await chip(page).click();
  await page.getByRole('option', { name: /origin\/upstream-only/ }).click();
  expect(sent).toMatchObject({ branch: 'origin/upstream-only', source: 'remote' });
});

test('conflict refusal surfaces the error with an Open Changes action', async ({ page }) => {
  await mount(page, list(), (route) => route.fulfill({ status: 409, json: { state: 'not-applied', error: { code: 'BRANCH_CONFLICT', message: 'feature/x conflicts with local changes.', details: { operationId: 'o', state: 'not-applied' } } } }));
  await chip(page).click();
  await page.getByRole('option', { name: /feature\/x/ }).click();
  const alert = page.getByRole('alert');
  await expect(alert).toContainText('conflicts with local changes');
  await alert.getByRole('button', { name: 'Open Changes' }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { composerBranchFixture: { calls: string[] } }).composerBranchFixture.calls)).toContain('changes');
});

test('create-branch row expands, validates names, and posts create-branch', async ({ page }) => {
  let sent: Record<string, unknown> | undefined;
  await mount(page, list(), (route, body, served) => {
    sent = body.payload;
    const name = String(body.payload?.branch ?? body.payload?.name ?? '');
    if (body.type === 'switch-branch' || body.type === 'create-branch') {
      const short = body.payload?.source === 'remote' ? name.slice(name.indexOf('/') + 1) : name;
      served.current = short;
      if (!served.local.some(e => e.name === short)) served.local.push(entry(short, 'f'));
      for (const e of served.local) e.current = e.name === short;
      served.dirty = { tracked: 0, untracked: 0 };
    }
    route.fulfill({ json: { commandId: 'c', result: {} } });
  });
  const trigger = chip(page);
  await trigger.click();
  await page.getByRole('button', { name: 'Create branch from here' }).click();
  const input = page.getByRole('textbox', { name: 'New branch name' });
  const create = page.getByRole('button', { name: 'Create', exact: true });
  await expect(create).toBeDisabled();
  await input.fill('bad name');
  await expect(create).toBeDisabled();
  await input.fill('feature/new');
  await create.click();
  await expect(trigger).toContainText('feature/new');
  expect(sent).toMatchObject({ name: 'feature/new', revision });
});
