import { expect, test, type Page } from '@playwright/test';
import type { HostCommand, ModelInfo, Thread } from '../../packages/contracts';
import type { ProjectContext, WorkspaceEnvelope } from '../../packages/contracts/workspace';
import { serveTaskFixture, taskFixture } from './task-interface-fixture';

const now = '2026-11-02T00:00:00.000Z';
const projectKey = (id: string) => JSON.stringify(['local', id]);
const model = (name: string, id: string, thinkingLevels?: string[]): ModelInfo => ({ id, provider: 'openai', name, thinkingLevels });
const catalog = [model('Model Alpha', 'openai/alpha', ['low', 'high']), model('Model Beta', 'openai/beta', ['balanced']), model('Model Gamma', 'openai/gamma')];
const freshThread = (id: string, projectId: string, projectName: string): Thread =>
  ({ id, title: `${projectName} conversation`, projectId, projectName, status: 'ready', epoch: 0, runId: null, modelId: null, sessionPath: null, createdAt: now, updatedAt: now });
const projects = [
  { id: 'proj-a', name: 'Web app', authority: { kind: 'local' as const }, rootPath: '/srv/web-app', createdAt: now },
  { id: 'proj-b', name: 'CLI tools', authority: { kind: 'local' as const }, rootPath: '/srv/cli', createdAt: now },
];
const context = (id: string): ProjectContext => ({
  project: projects.find(project => project.id === id)!, machineName: 'fixture', editor: { available: false, label: 'Editor' },
  branch: 'main', head: 'deadbeef', revision: 'r1', changes: { added: 0, removed: 0, files: 0 },
  lineage: [], scripts: [], capabilities: { git: false, terminal: false, pullRequests: false },
});
const envelope: WorkspaceEnvelope = { state: { version: 1, revision: 0, canvases: [{ id: 'workspace', name: 'Workspace', preset: 'workspace', version: 1, panels: [], filter: 'active', projectIds: [], viewport: { x: 0, y: 0, zoom: 1 } }], activeCanvasId: 'workspace', profiles: [], disabledKinds: [], integrations: {} }, projects } as WorkspaceEnvelope;

function fixture(defaults: Record<string, { modelId: string; thinkingLevel: string | null }>, activeId = 'thread-a') {
  const snapshot = taskFixture({ root: 'text', elements: { text: { type: 'Text', props: { text: 'Project defaults fixture' } } } });
  snapshot.artifacts = [];
  snapshot.messages = [];
  snapshot.activeThreadId = activeId;
  snapshot.threads = [
    freshThread('thread-a', 'proj-a', 'Web app'),
    freshThread('thread-b', 'proj-b', 'CLI tools'),
    { ...snapshot.threads[0], id: 'task-thread', title: 'Established task', accountId: 'acct-1', modelId: 'openai/gamma' },
  ];
  snapshot.accounts = [{ id: 'acct-1', providerId: 'openai', label: 'Personal', enabled: true, createdAt: now, updatedAt: now }];
  snapshot.settings = { theme: 'dark', modelId: 'openai/alpha', selectedAccounts: { openai: 'acct-1' }, preferences: { projectModelDefaults: defaults } };
  return snapshot;
}

async function host(page: Page, defaults: Parameters<typeof fixture>[0], activeId?: string) {
  const base = await serveTaskFixture(page, fixture(defaults, activeId));
  const commands: HostCommand[] = [];
  await page.route('**/api/commands', async route => {
    const command = route.request().postDataJSON() as HostCommand;
    commands.push(command);
    return route.fallback();
  });
  await page.route('**/api/models*', route => route.fulfill({ json: { models: catalog } }));
  await page.route('**/api/workspace', route => route.fulfill({ json: envelope }));
  await page.route('**/api/projects/**/context*', route => { const url = new URL(route.request().url()); return route.fulfill({ json: { ...context(url.pathname.split('/')[3]), threadId: url.searchParams.get('threadId') } }); });
  await page.route('**/api/composer-prediction/cancel', route => route.fulfill({ json: { cancelled: true } }));
  return { ...base, commands };
}
const trigger = (page: Page) => page.getByRole('combobox', { name: 'Model', exact: true });
const send = (page: Page) => page.getByRole('button', { name: 'Send message', exact: true });

test('each project applies its own default model and reasoning to new threads', async ({ page }) => {
  await host(page, {
    [projectKey('proj-a')]: { modelId: 'openai/beta', thinkingLevel: 'balanced' },
    [projectKey('proj-b')]: { modelId: 'openai/gamma', thinkingLevel: null },
  });
  await page.goto('/');
  const picker = trigger(page);
  await expect(picker).toContainText('Model Beta');
  await expect(page.locator('.model-picker-project-dot')).toBeVisible();
  await expect(picker).toHaveAttribute('title', /Project default for Web app/);
  await page.getByText('CLI tools conversation').first().click();
  await expect(trigger(page)).toContainText('Model Gamma');
});

test('an explicit pick wins without rewriting the project or global default', async ({ page }) => {
  const h = await host(page, { [projectKey('proj-a')]: { modelId: 'openai/beta', thinkingLevel: 'balanced' } });
  await page.goto('/');
  const picker = trigger(page);
  await expect(picker).toContainText('Model Beta');
  await picker.click();
  await page.getByRole('option', { name: 'Model Gamma', exact: true }).click();
  await expect(trigger(page)).toContainText('Model Gamma');
  await expect(page.locator('.model-picker-project-dot')).toHaveCount(0);
  expect(h.commands.filter(command => command.type === 'settings.update')).toHaveLength(0);
});

test('an unavailable project default blocks send, keeps account selection and offers recovery', async ({ page }) => {
  const h = await host(page, { [projectKey('proj-a')]: { modelId: 'openai/retired', thinkingLevel: null } });
  await page.goto('/');
  const notice = page.getByRole('status').filter({ hasText: 'default model isn' });
  await expect(notice).toBeVisible();
  await expect(trigger(page)).toContainText('Choose a model');
  await expect(send(page)).toBeDisabled();
  expect(h.snapshot.settings.selectedAccounts).toEqual({ openai: 'acct-1' });
  await notice.getByRole('button', { name: 'Choose model', exact: true }).click();
  await expect(page.getByRole('listbox', { name: 'Available models' })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Expand Project overview', exact: true }).click();
  await notice.getByRole('button', { name: 'Edit project defaults', exact: true }).click();
  await expect(page.getByRole('button', { name: /New thread defaults/ })).toHaveAttribute('aria-expanded', 'true');
});

test('an established thread keeps its bound model', async ({ page }) => {
  await host(page, { [projectKey('proj-a')]: { modelId: 'openai/beta', thinkingLevel: 'balanced' } }, 'task-thread');
  await page.goto('/');
  await expect(trigger(page)).toContainText('Model Gamma');
  await expect(page.locator('.model-picker-project-dot')).toHaveCount(0);
});

test('the project card edits a default with the keyboard only', async ({ page }) => {
  const h = await host(page, { [projectKey('proj-a')]: { modelId: 'openai/alpha', thinkingLevel: 'high' } });
  await page.goto('/');
  await page.getByRole('button', { name: 'Expand Project overview', exact: true }).click();
  const row = page.getByRole('button', { name: /New thread defaults/ });
  await row.focus();
  await page.keyboard.press('Enter');
  await expect(row).toHaveAttribute('aria-expanded', 'true');
  const editor = page.locator('.project-model-expansion');
  await expect(editor.getByRole('combobox', { name: 'Model', exact: true })).toHaveText('Model Alpha');
  await editor.getByRole('combobox', { name: 'Reasoning', exact: true }).press('Enter');
  await page.getByRole('option', { name: 'Model default', exact: true }).press('Enter');
  await editor.getByRole('button', { name: 'Save', exact: true }).press('Enter');
  await expect(editor.getByText('Saved')).toBeVisible();
  const write = h.commands.find(command => command.type === 'settings.update')!;
  expect((write.payload.preferences as Record<string, Record<string, unknown>>).projectModelDefaults[projectKey('proj-a')]).toEqual({ modelId: 'openai/alpha', thinkingLevel: null });
});
