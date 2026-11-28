import { test, expect, type Page } from '@playwright/test';
import type { HostCommand, ModelInfo } from '../../packages/contracts';
import { serveTaskFixture, taskFixture } from './task-interface-fixture';

const now = '2026-11-01T00:00:00.000Z';
const project = { id: 'proj-alpha', name: 'Alpha', authority: { kind: 'local' as const }, createdAt: now };
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
async function host(page: Page, snapshot = fixture('test/model')) {
  const base = await serveTaskFixture(page, snapshot);
  await page.route('**/api/workspace', route => route.fulfill({ json: { projects: [project], state: { version: 1, revision: 0, activeCanvasId: 'workspace', canvases: [{ id: 'workspace', name: 'Workspace', preset: 'workspace', version: 1, panels: [], filter: 'active', projectIds: [project.id], viewport: { x: 0, y: 0, zoom: 1 } }], profiles: [], disabledKinds: [], integrations: {} } } }));
  await page.route('**/api/models*', route => route.fulfill({ json: { models: catalog } }));
  await page.route('**/api/projects/*/context*', route => route.fulfill({ json: { project: { ...project, rootPath: '/alpha' }, capabilities: { git: false, terminal: false }, editor: { available: false, label: '' }, lineage: [], changes: { files: null, added: null, removed: null }, scripts: [], machineName: 'fixture', revision: 0, threadId: 'task-thread' } }));
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
