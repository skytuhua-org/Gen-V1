import { test, expect, type Page } from '@playwright/test';
import type { HostCommand, ModelInfo } from '../../packages/contracts';
import { serveTaskFixture, taskFixture } from './task-interface-fixture';

const now = '2026-11-01T00:00:00.000Z';
const project = { id: 'proj-alpha', name: 'Alpha', authority: { kind: 'local' as const }, rootPath: '/alpha', createdAt: now };
const defaultKey = JSON.stringify(['local', project.id]);
const catalog: ModelInfo[] = [
  { id: 'test/model', provider: 'test', name: 'Fixture' },
  { id: 'test/other', provider: 'test', name: 'Other' },
];
function fixture(defaultModel: string | null, threadModel: string | null = null) {
  const snapshot = taskFixture({ root: 'text', elements: { text: { type: 'Text', props: { text: 'Defaults fixture' } } } });
  snapshot.artifacts = []; snapshot.messages = [];
  snapshot.threads[0] = { ...snapshot.threads[0], title: 'Project task', projectId: project.id, projectName: project.name, modelId: threadModel, sessionPath: null };
  snapshot.settings = { theme: 'dark', modelId: 'test/model', preferences: defaultModel === null ? {} : { projectModelDefaults: { [defaultKey]: { modelId: defaultModel, thinkingLevel: null } } } };
  return snapshot;
}
async function host(page: Page, snapshot = fixture('test/model'), options: { canvas?: boolean } = {}) {
  const base = await serveTaskFixture(page, snapshot);
  const panels = options.canvas ? [{ id: 'canvas-thread', kind: 'thread', binding: { authority: { kind: 'local' }, threadId: 'task-thread', projectId: project.id }, canvasId: 'workspace', placement: 'canvas', visible: true, collapsed: false, bounds: { x: 24, y: 24, width: 620, height: 620 }, order: 0, alwaysOnTop: false }] : [];
  await page.route('**/api/workspace', route => route.fulfill({ json: { projects: [project], state: { version: 1, revision: 0, activeCanvasId: 'workspace', canvases: [{ id: 'workspace', name: 'Workspace', preset: 'workspace', version: 1, panels, filter: 'active', projectIds: [project.id], viewport: { x: 0, y: 0, zoom: 1 } }], profiles: [], disabledKinds: [], integrations: {} } } }));
  await page.route('**/api/models*', route => route.fulfill({ json: { models: catalog } }));
  await page.route('**/api/projects/*/context*', route => route.fulfill({ json: { project: { ...project, rootPath: '/alpha' }, capabilities: { git: false, terminal: false, pullRequests: false }, branch: null, head: null, editor: { available: false, label: '' }, lineage: [], changes: { files: null, added: null, removed: null }, scripts: [], machineName: 'fixture', revision: 0, threadId: 'task-thread' } }));
  return base;
}
const picker = (page: Page) => page.getByRole('combobox', { name: 'Model', exact: true });

test('a project default resolves the composer model and shows the provenance dot', async ({ page }) => {
  await host(page);
  await page.goto('/');
  await expect(picker(page)).toHaveAttribute('title', 'Project default for Alpha');
  await expect(picker(page).locator('.model-picker-project-dot')).toBeVisible();
  await picker(page).click();
  await expect(page.locator('.model-picker-scope')).toHaveText('Project default · applies to this thread only when changed.');
});

test('an unavailable project default asks for a pick and keeps Send disabled', async ({ page }) => {
  await host(page, fixture('gone/model'));
  await page.goto('/');
  const notice = page.locator('.composer-model-notice');
  await expect(notice).toContainText("Alpha's default model isn't available with your selected accounts. Choose a model to send.");
  await expect(notice.getByRole('button', { name: 'Choose model', exact: true })).toBeVisible();
  await expect(notice.getByRole('button', { name: 'Edit project defaults', exact: true })).toBeVisible();
  await expect(picker(page)).toContainText('Choose a model');
  await expect(page.getByRole('button', { name: 'Send message' })).toBeDisabled();
});

test('a pick under a project default stays thread-local and skips the global default write', async ({ page }) => {
  const base = await host(page);
  await page.goto('/');
  await picker(page).click();
  await page.getByRole('listbox', { name: 'Available models', exact: true }).getByRole('option', { name: 'Other', exact: true }).click();
  await expect(picker(page)).toContainText('Other');
  await expect.poll(() => (base.commands as HostCommand[]).filter(command => command.type === 'settings.update' && 'modelId' in command.payload).length).toBe(0);
});

test('a thread without a project default keeps writing the global default on pick', async ({ page }) => {
  const base = await host(page, fixture(null));
  await page.goto('/');
  await expect(picker(page).locator('.model-picker-project-dot')).toHaveCount(0);
  await picker(page).click();
  await page.getByRole('listbox', { name: 'Available models', exact: true }).getByRole('option', { name: 'Other', exact: true }).click();
  await expect.poll(() => (base.commands as HostCommand[]).filter(command => command.type === 'settings.update' && 'modelId' in command.payload).length).toBe(1);
});

test('start new task carries the requested model through project selection', async ({ page }) => {
  const base = await host(page);
  await page.route('**/api/commands', async route => {
    const command = route.request().postDataJSON() as HostCommand;
    if (command.type !== 'thread.create') return route.fallback();
    base.commands.push(command);
    base.snapshot.seq++;
    const selectedProject = command.payload.projectId === project.id ? project : null;
    const thread = { ...base.snapshot.threads[0], id: `created-thread-${base.snapshot.seq}`, title: 'New thread', projectId: selectedProject?.id, projectName: selectedProject?.name ?? null, modelId: null, sessionPath: null, runId: null, epoch: 0, createdAt: now, updatedAt: now };
    base.snapshot.threads.push(thread);
    base.snapshot.activeThreadId = thread.id;
    return route.fulfill({ json: { commandId: command.id, seq: base.snapshot.seq, result: thread } });
  });
  await page.goto('/');
  await picker(page).click();
  await page.getByRole('listbox', { name: 'Available models', exact: true }).getByRole('option', { name: 'Other', exact: true }).click();
  await page.getByRole('button', { name: 'Start new task with Other', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Select project', exact: true });
  await dialog.getByRole('option', { name: 'No project', exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(picker(page)).toContainText('Other');
  expect((base.commands as HostCommand[]).some(command => command.type === 'thread.create')).toBe(true);
  expect((base.commands as HostCommand[]).filter(command => command.type === 'settings.update' && 'modelId' in command.payload)).toHaveLength(0);
});

test('a canvas composer follows a changed project default before first send', async ({ page }) => {
  const base = await host(page, fixture('test/model'), { canvas: true });
  await page.addInitScript(() => localStorage.setItem('harness:workspace-mode:v3', 'retained-canvas'));
  await page.goto('/');
  const canvasPicker = page.locator('[data-panel-id="canvas-thread"]').getByRole('combobox', { name: 'Model', exact: true });
  await expect(canvasPicker).toContainText('Fixture');
  base.snapshot.settings.preferences = { ...base.snapshot.settings.preferences, projectModelDefaults: { [defaultKey]: { modelId: 'test/other', thinkingLevel: null } } };
  await base.publish();
  await expect(canvasPicker).toContainText('Other');
});

test('the project default editor uses the unbound new-task catalog', async ({ page }) => {
  const otherProvider = { id: 'other/model', provider: 'other', name: 'Other provider' };
  await host(page, fixture(null, 'test/model'));
  await page.route('**/api/models*', route => {
    const threadId = new URL(route.request().url()).searchParams.get('threadId');
    return route.fulfill({ json: { models: threadId ? catalog.filter(model => model.provider === 'test') : [...catalog, otherProvider] } });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Expand Project overview', exact: true }).click();
  await expect(page.locator('.project-context-card')).toBeVisible();
  await page.locator('.project-context-card').getByRole('button', { name: /New thread defaults/ }).click();
  const select = page.getByRole('combobox', { name: 'Project default model', exact: true });
  await expect(select).toBeEnabled();
  await select.click();
  await expect(page.getByRole('option', { name: 'Other provider', exact: true })).toBeVisible();
});
