// Test-only spec for #1272 (parent #1235 task T06): the composer "Create PR"
// chip opens the publish review sheet when the host draft probe succeeds and
// keeps the legacy prompt insert otherwise. Route mocks stand in for the
// #1291 publish routes; no real host or git is involved.
import { test, expect, type Page, type Route } from '@playwright/test';
import { resolve } from 'node:path';
import { serveTaskFixture, taskFixture } from './task-interface-fixture';
import { quiescent } from './settle';

const HEAD = 'a'.repeat(40), REVISION = 'c'.repeat(64);
const DRAFT = {
  version: 1,
  projectId: 'project-one',
  threadId: 'thread-one',
  branch: 'gen/review',
  head: HEAD,
  revision: REVISION,
  base: 'main',
  files: [
    { path: 'src/one.ts', added: 10, removed: 2, untracked: false },
    { path: 'src/two.ts', added: null, removed: null, untracked: true },
    { path: 'src/three.ts', added: 3, removed: 1, untracked: false },
  ],
  commitMessage: 'Review publish',
  title: 'Review publish',
  body: 'Generated PR body',
};

function operation(request: Record<string, unknown>) {
  const step = { state: 'confirmed', at: '2026-11-21T00:00:00.000Z' };
  return {
    id: request.id,
    owner: { projectId: 'project-one', threadId: 'thread-one' },
    createdAt: '2026-11-21T00:00:00.000Z',
    request,
    steps: { commit: step, push: step, pr: step, link: step },
    result: { url: 'https://github.com/fixture/project/pull/12', number: 12, head: 'b'.repeat(40), repo: 'fixture/project' },
  };
}

async function fixture(page: Page, draftResponse: (route: Route) => void | Promise<void>) {
  const path = encodeURI('/@fs/' + resolve('tests/e2e/publish-thread-fixture.tsx').replaceAll('\\', '/'));
  let execute: (route: Route) => void | Promise<void> = (route) =>
    route.fulfill({ status: 404, json: { error: { code: 'HTTP_ERROR', message: 'Publish route not configured for this test.' } } });
  const api = {
    setExecute(handler: (route: Route) => void | Promise<void>) { execute = handler; },
  };
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/api/bootstrap') return route.fulfill({ json: { csrfToken: 'fixture' } });
    if (url.pathname === '/api/projects/project-one/publish/draft') return draftResponse(route);
    if (url.pathname === '/api/projects/project-one/publish') return execute(route);
    return route.fulfill({ status: 404, json: { error: { message: 'Unconfigured fixture request' } } });
  });
  await page.route('**/publish-thread-fixture?*', (route) =>
    route.fulfill({ contentType: 'text/html', body: `<html data-theme="dark"><body><div id="root"></div><script type="module">import RefreshRuntime from '/@react-refresh';RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;await import('${path}');</script></body></html>` }));
  await page.goto('/publish-thread-fixture?1');
  await expect(page.getByRole('button', { name: 'Create PR', exact: true })).toBeEnabled();
  return api;
}

const draftOk = (route: Route) => route.fulfill({ json: DRAFT });
const dialog = (page: Page) => page.getByRole('dialog', { name: 'Review before publishing' });

test('chip opens the review sheet when the draft probe succeeds', async ({ page }) => {
  await fixture(page, draftOk);
  await page.getByRole('button', { name: 'Create PR', exact: true }).click();
  const sheet = dialog(page);
  await expect(sheet).toBeVisible();
  await expect(sheet.locator('.publish-review-branch')).toContainText('gen/review → origin');
  await expect(sheet.getByRole('checkbox', { name: 'Include src/one.ts' })).toBeChecked();
  await expect(sheet.getByText('+10')).toBeVisible();
  await expect(sheet.getByRole('textbox', { name: 'Commit message' })).toHaveValue('Review publish');
  await expect(sheet.getByRole('textbox', { name: 'Pull request title' })).toHaveValue('Review publish');
  await expect(sheet.getByRole('textbox', { name: 'Pull request body' })).toHaveValue('Generated PR body');
  await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toHaveValue('');
});

test('chip inserts the legacy prompt when the flag is off', async ({ page }) => {
  await fixture(page, (route) => route.fulfill({ status: 403, json: { error: { code: 'CAPABILITY_DENIED', message: 'Workspace publishing is disabled.' } } }));
  await page.getByRole('button', { name: 'Create PR', exact: true }).click();
  await expect(dialog(page)).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toHaveValue('Create a pull request for the current changes.');
});

test('excluding a file blocks approval until the whole draft is selected', async ({ page }) => {
  const api = await fixture(page, draftOk);
  const posted: Record<string, unknown>[] = [];
  api.setExecute(async (route) => {
    posted.push(route.request().postDataJSON());
    await route.fulfill({ json: operation(posted[0]) });
  });
  await page.getByRole('button', { name: 'Create PR', exact: true }).click();
  const sheet = dialog(page);
  await expect(sheet).toBeVisible();
  const row = sheet.getByRole('checkbox', { name: 'Include src/two.ts' });
  await row.uncheck();
  await expect(sheet.getByText('2 of 3 selected')).toBeVisible();
  const approve = sheet.getByRole('button', { name: 'Commit, push and open draft PR' });
  await expect(approve).toBeDisabled({ timeout: 2000 });
  await expect(sheet.getByText('Select all changed files to publish this working copy.')).toBeVisible();
  expect(posted).toHaveLength(0);
  await row.check();
  await approve.click();
  await expect(sheet.locator('.publish-review-done')).toContainText('Opened pull request #12');
  expect(posted[0]).toMatchObject({
    threadId: 'thread-one',
    head: HEAD,
    revision: REVISION,
    selectedPaths: ['src/one.ts', 'src/two.ts', 'src/three.ts'],
    commitMessage: 'Review publish',
    title: 'Review publish',
    base: 'main',
  });
});

test('auth-required draft shows GitHub sign-in inside the sheet', async ({ page }) => {
  await fixture(page, (route) => route.fulfill({ status: 400, json: { error: { code: 'GITHUB_AUTH_REQUIRED', message: 'Sign in to GitHub for this Gen V1 profile.' } } }));
  await page.getByRole('button', { name: 'Create PR', exact: true }).click();
  const sheet = dialog(page);
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole('button', { name: 'Sign in to GitHub' })).toBeVisible();
});

test('keyboard-only approval submits the publish request', async ({ page }) => {
  const api = await fixture(page, draftOk);
  const posted: Record<string, unknown>[] = [];
  api.setExecute(async (route) => {
    posted.push(route.request().postDataJSON());
    await route.fulfill({ json: operation(posted[0]) });
  });
  await page.getByRole('button', { name: 'Create PR', exact: true }).click();
  const sheet = dialog(page);
  await expect(sheet).toBeVisible();
  const approve = sheet.getByRole('button', { name: 'Commit, push and open draft PR' });
  await approve.focus();
  await page.keyboard.press('Enter');
  await expect(sheet.locator('.publish-review-steps')).toContainText('Done');
  expect(posted[0]?.id).toBeTruthy();
});

test('revision conflict asks for re-review with the fresh draft', async ({ page }) => {
  let calls = 0;
  const api = await fixture(page, (route) => {
    calls += 1;
    return route.fulfill({ json: { ...DRAFT, head: calls === 1 ? HEAD : 'd'.repeat(40) } });
  });
  api.setExecute(async (route) => {
    await route.fulfill({ status: 400, json: { error: { code: 'REVISION_CHANGED', message: 'The reviewed working copy changed. Refresh before publishing.' } } });
  });
  await page.getByRole('button', { name: 'Create PR', exact: true }).click();
  const sheet = dialog(page);
  await expect(sheet).toBeVisible();
  await sheet.getByRole('button', { name: 'Commit, push and open draft PR' }).click();
  await expect(sheet.getByRole('alert')).toContainText('The working copy changed');
  await expect(sheet.getByRole('button', { name: 'Commit, push and open draft PR' })).toBeDisabled();
  await sheet.getByRole('button', { name: 'Reload draft', exact: true }).click();
  await expect(sheet.getByRole('button', { name: 'Commit, push and open draft PR' })).toBeEnabled();
});

function incomplete(request: Record<string, unknown>, state: 'not-started' | 'not-applied' | 'uncertain' | 'confirmed') {
  const value = operation(request);
  return { ...value, result: undefined, steps: { commit: { state }, push: { state: 'not-started' }, pr: { state: 'not-started' }, link: { state: 'not-started' } } };
}

test('failed review reload exposes a retry that can recover', async ({ page }) => {
  let drafts = 0, publishes = 0;
  const api = await fixture(page, (route) => {
    drafts++;
    return drafts === 2 ? route.fulfill({ status: 503, json: { error: { code: 'HTTP_ERROR', message: 'Synthetic draft read failure' } } }) : draftOk(route);
  });
  api.setExecute(async (route) => {
    publishes++;
    await route.fulfill({ status: 400, json: { error: { code: 'REVISION_CHANGED', message: 'The reviewed working copy changed.' } } });
  });
  await page.getByRole('button', { name: 'Create PR', exact: true }).click();
  const sheet = dialog(page);
  await sheet.getByRole('button', { name: 'Commit, push and open draft PR' }).click();
  await sheet.getByRole('button', { name: 'Reload draft', exact: true }).click();
  await expect(sheet.getByText('The publish review could not be loaded. Try again.')).toBeVisible();
  await expect(sheet.getByText('Loading the publish review…')).toHaveCount(0);
  await sheet.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(sheet.getByRole('textbox', { name: 'Commit message' })).toBeVisible();
  await expect(sheet.getByRole('button', { name: 'Commit, push and open draft PR' })).toBeEnabled();
  expect(publishes).toBe(1);
});

test('a definite pre-admission revision rejection restores an approvable review after reload', async ({ page }) => {
  let publishes = 0;
  const api = await fixture(page, draftOk);
  api.setExecute(async (route) => {
    publishes++;
    await route.fulfill({ status: 400, json: { error: { code: 'REVISION_CHANGED', message: 'The reviewed working copy changed.' } } });
  });
  await page.getByRole('button', { name: 'Create PR', exact: true }).click();
  const sheet = dialog(page);
  await sheet.getByRole('button', { name: 'Commit, push and open draft PR' }).click();
  await sheet.getByRole('button', { name: 'Reload draft', exact: true }).click();
  await expect(sheet.getByRole('textbox', { name: 'Commit message' })).toBeVisible();
  await expect(sheet.getByRole('region', { name: 'Publish result' })).toHaveCount(0);
  await expect(sheet.getByRole('button', { name: 'Commit, push and open draft PR' })).toBeEnabled();
  expect(publishes).toBe(1);
});

for (const state of ['not-started', 'not-applied', 'uncertain', 'confirmed'] as const) test(`an incomplete ${state} operation cannot restart publication with a fresh request`, async ({ page }) => {
  let publishes = 0;
  const api = await fixture(page, draftOk);
  api.setExecute(async (route) => { publishes++; await route.fulfill({ json: incomplete(route.request().postDataJSON(), state) }); });
  await page.getByRole('button', { name: 'Create PR', exact: true }).click();
  const sheet = dialog(page);
  await sheet.getByRole('button', { name: 'Commit, push and open draft PR' }).click();
  await expect(sheet.getByRole('region', { name: 'Publish result' })).toBeVisible();
  await expect(sheet.getByRole('button', { name: 'Retry', exact: true })).toHaveCount(0);
  await expect(sheet.getByRole('button', { name: 'Commit, push and open draft PR' })).toHaveCount(0);
  expect(publishes).toBe(1);
});

test('revision changes preserve edited inputs until explicit re-review', async ({ page }) => {
  let drafts = 0;
  const api = await fixture(page, (route) => { drafts++; return route.fulfill({ json: { ...DRAFT, head: drafts === 1 ? HEAD : 'd'.repeat(40), commitMessage: drafts === 1 ? DRAFT.commitMessage : 'Fresh review' } }); });
  api.setExecute((route) => route.fulfill({ status: 400, json: { error: { code: 'REVISION_CHANGED', message: 'The reviewed working copy changed.' } } }));
  await page.getByRole('button', { name: 'Create PR', exact: true }).click();
  const sheet = dialog(page), message = sheet.getByRole('textbox', { name: 'Commit message' });
  await message.fill('Keep my edited message');
  const approve = sheet.getByRole('button', { name: 'Commit, push and open draft PR' });
  await approve.click();
  await expect(sheet.getByRole('alert')).toContainText('The working copy changed');
  await expect(message).toHaveValue('Keep my edited message');
  await expect(approve).toBeDisabled();expect(drafts).toBe(1);
  await sheet.getByRole('button', { name: 'Reload draft', exact: true }).click();
  await expect(message).toHaveValue('Fresh review');await expect(approve).toBeEnabled();expect(drafts).toBe(2);
});

for (const field of ['projectId', 'threadId'] as const) test(`a draft for another ${field} cannot open a review`, async ({ page }) => {
  await fixture(page, (route) => route.fulfill({ json: { ...DRAFT, [field]: 'other-owner' } }));
  await page.getByRole('button', { name: 'Create PR', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toHaveValue('Create a pull request for the current changes.');
  await expect(dialog(page)).toHaveCount(0);
});

for (const outcome of ['transport loss', 'malformed response', 'malformed rejection', '401 without a valid receipt', 'different owner', 'different operation ID', 'different echoed request'] as const) {
  test(`an uncertain Publish POST stays blocked after reopening: ${outcome}`, async ({ page }) => {
    const api = await fixture(page, draftOk);
    let publishes = 0;
    api.setExecute((route) => {
      publishes++;
      const value = operation(route.request().postDataJSON());
      switch (outcome) {
        case 'transport loss': return route.abort('failed');
        case 'malformed response': return route.fulfill({ json: { unexpected: true } });
        case 'malformed rejection': return route.fulfill({ status: 400, json: { error: { code: 'REVISION_CHANGED' } } });
        case '401 without a valid receipt': return route.fulfill({ status: 401, body: 'Missing receipt' });
        case 'different owner': return route.fulfill({ json: { ...value, owner: { ...value.owner, threadId: 'other-thread' } } });
        case 'different operation ID': return route.fulfill({ json: { ...value, id: 'other-operation' } });
        case 'different echoed request': return route.fulfill({ json: { ...value, request: { ...value.request, title: 'Other approved title' } } });
      }
    });
    const chip = page.getByRole('button', { name: 'Create PR', exact: true });
    await chip.click();
    const sheet = dialog(page);
    await sheet.getByRole('button', { name: 'Commit, push and open draft PR' }).click();
    const warning = sheet.getByText('The publish outcome could not be confirmed.', { exact: false });
    await expect(warning).toBeVisible({ timeout: 2000 });
    await expect(sheet.getByRole('link', { name: 'View on GitHub' })).toHaveCount(0);
    await expect(sheet.getByRole('button', { name: 'Commit, push and open draft PR' })).toHaveCount(0);
    await sheet.getByRole('button', { name: 'Close', exact: true }).click();
    await chip.click();
    await expect(warning).toBeVisible();
    await expect(sheet.getByRole('button', { name: 'Commit, push and open draft PR' })).toHaveCount(0);
    expect(publishes).toBe(1);
  });
}

test('an in-flight Publish remains owner-scoped when the composer changes thread', async ({ page }) => {
  const api = await fixture(page, (route) => {
    const threadId = new URL(route.request().url()).searchParams.get('threadId');
    return route.fulfill({ json: { ...DRAFT, threadId } });
  });
  let markSubmitted!: () => void, settle!: () => void;
  const submitted = new Promise<void>((resolve) => { markSubmitted = resolve; });
  const settleResponse = new Promise<void>((resolve) => { settle = resolve; });
  let publishes = 0;
  api.setExecute(async (route) => {
    publishes++;
    markSubmitted();
    await settleResponse;
    await route.abort('failed');
  });

  const chip = page.getByRole('button', { name: 'Create PR', exact: true });
  const switchThread = page.getByRole('button', { name: 'Switch fixture thread' });
  const sheet = dialog(page);
  const approve = sheet.getByRole('button', { name: 'Commit, push and open draft PR' });
  const warning = sheet.getByRole('alert').filter({ hasText: 'The publish outcome could not be confirmed.' });

  try {
    await chip.click();
    await approve.click();
    await submitted;
    await sheet.getByRole('button', { name: 'Cancel' }).click();
    await switchThread.click();
    await chip.click();
    await expect(approve).toBeEnabled();
    await sheet.getByRole('button', { name: 'Cancel' }).click();
    await switchThread.click();
    await chip.click();
    await expect(warning).toBeVisible();
    await expect(approve).toHaveCount(0);
    expect(publishes).toBe(1);
  } finally {
    settle();
  }
});

test('a delayed Publish probe cannot insert a prompt after the same thread changes project', async ({ page }) => {
  const snapshot = taskFixture({ root: 'text', elements: { text: { type: 'Text', props: { text: 'Synthetic task' } } } });
  const thread = snapshot.threads[0];
  thread.projectId = 'project-one';
  thread.projectName = 'Original project';
  snapshot.artifacts = [];
  const host = await serveTaskFixture(page, snapshot);
  await page.route('**/api/plugins', route => route.fulfill({ json: { plugins: [] } }));
  let markProbed!: () => void, release!: () => void;
  const probed = new Promise<void>(resolve => { markProbed = resolve; });
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/projects/project-one/publish/draft?**', async route => {
    markProbed();
    await held;
    await route.fulfill({ status: 403, json: { error: { code: 'CAPABILITY_DENIED', message: 'Fixture rejects the old owner.' } } });
  });
  try {
    await page.goto('/');
    const message = page.getByRole('textbox', { name: 'Message', exact: true });
    await expect(message).toBeEnabled({ timeout: 15000 });
    await page.getByRole('button', { name: 'Create PR', exact: true }).click();
    await probed;
    thread.projectId = 'project-two';
    thread.projectName = 'Replacement project';
    await host.publish();
    await expect(page.getByRole('button', { name: 'Select project' })).toHaveAttribute('title', 'Select project · Replacement project');
    const response = page.waitForResponse(url => new URL(url.url()).pathname === '/api/projects/project-one/publish/draft');
    release();
    await (await response).finished();
    const samples = await quiescent(page, 350, () => message.inputValue());
    expect(samples).toEqual(['""']);
    await expect(dialog(page)).toHaveCount(0);
  } finally {
    release();
  }
});
