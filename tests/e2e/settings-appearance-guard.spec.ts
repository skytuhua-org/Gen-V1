import {expect, test, type Page} from '@playwright/test';
import {resolve} from 'node:path';
import type {ShellSettingsReadModel, ThreadNavigationRow} from '../../packages/contracts/shell-read-models';
import type {HostCommand} from '../../packages/contracts';

const thread = (id: string): ThreadNavigationRow => ({id, title: 'Archived ' + id, status: 'ready', projectName: 'Synthetic project', runId: null, createdAt: '2026-11-06', updatedAt: '2026-11-06'});
async function setup(page: Page) {
  const model: ShellSettingsReadModel = {sequence: 7, settings: {theme: 'dark', modelId: 'model-one'}, accounts: [], skills: [], skillProposals: [], learning: {supported: true, status: 'idle', lastReview: null}, projects: [{id: 'project', name: 'Synthetic project'}], resources: [], resourcePage: {total: 0, nextCursor: null}, counts: {threads: 2, archivedThreads: 1, artifacts: 0, resources: 0, uncertainOperations: 0}};
  const commands: HostCommand[] = [];
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url()), path = url.pathname;
    if (path === '/api/bootstrap') return route.fulfill({json: {csrfToken: 'fixture'}});
    if (path === '/api/shell/settings') return route.fulfill({json: model});
    if (path === '/api/shell/resources') return route.fulfill({json: {sequence: 7, total: 0, items: [], nextCursor: null}});
    if (path === '/api/shell/archive') return route.fulfill({json: {sequence: 7, total: 1, items: [thread('a1')], nextCursor: null}});
    if (path === '/api/models') return route.fulfill({json: {models: [{id: 'model-one', name: 'First model', provider: 'openai'}]}});
    if (path === '/api/commands') {
      const command = route.request().postDataJSON() as HostCommand; commands.push(command);
      if (command.type === 'settings.update') model.settings = {...model.settings, ...command.payload};
      return route.fulfill({json: {commandId: command.id, seq: ++model.sequence, result: {}}});
    }
    if (path === '/api/environment') return route.fulfill({json: {revision: 0, entries: [], secretStorageAvailable: false}});
    if (path === '/api/workspace') return route.fulfill({json: {projects: [], state: {version: 1, revision: 0, activeCanvasId: 'workspace', canvases: [{id: 'workspace', name: 'Workspace', preset: 'workspace', version: 1, panels: [], filter: 'active', projectIds: [], viewport: {x: 0, y: 0, zoom: 1}}], profiles: [], disabledKinds: [], integrations: {}}}});
    if (path === '/api/integrations') return route.fulfill({json: {integrations: []}});
    if (path === '/api/account-auth') return route.fulfill({json: {state: 'signed-out', message: 'Synthetic readiness', identity: {availability: 'unavailable'}}});
    return route.fulfill({status: 500, json: {error: {message: 'Unexpected fixture read: ' + path}}});
  });
  const fixture = '/@fs/' + resolve('tests/e2e/settings-appearance-guard-fixture.tsx').replaceAll('\\', '/');
  await page.route('**/settings-appearance-guard-fixture', route => route.fulfill({contentType: 'text/html', body: `<html data-theme="dark"><body><div id="root"></div><script type="module">import RefreshRuntime from '/@react-refresh';RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;await import('${encodeURI(fixture)}');</script></body></html>`}));
  await page.goto('/settings-appearance-guard-fixture');
  const settings = page.getByRole('dialog', {name: 'Settings', exact: true});
  const confirm = page.getByRole('dialog', {name: 'Discard appearance changes?', exact: true});
  const nav = settings.getByRole('navigation', {name: 'Settings sections'});
  const makeDirty = async () => {
    await nav.getByRole('button', {name: 'Appearance', exact: true}).click();
    await settings.getByRole('switch', {name: 'Code line wrap', exact: true}).click();
    await expect(settings.getByText('Unsaved changes', {exact: false})).toBeVisible();
  };
  return {model, commands, settings, confirm, nav, makeDirty};
}

test.describe('appearance leave guard (#1728)', () => {
  test('section switch with unsaved edits asks instead of discarding; Keep editing stays', async ({page}) => {
    const host = await setup(page); await host.makeDirty();
    await host.nav.getByRole('button', {name: 'General', exact: true}).click();
    await expect(host.confirm).toBeVisible();
    await expect(host.settings.getByRole('heading', {level: 1, name: 'Appearance', exact: true})).toBeVisible();
    await expect(host.confirm.getByRole('button', {name: 'Keep editing', exact: true})).toBeFocused();
    const copyStyle = await host.confirm.locator('.discard-appearance-copy').evaluate(element => {const style = getComputedStyle(element); return {color: style.color, lineHeight: style.lineHeight, maxWidth: style.maxWidth, padding: style.padding};});
    expect(copyStyle).toMatchObject({color: 'rgb(160, 160, 160)', lineHeight: '19.5px', padding: '12px 16px'});
    expect(copyStyle.maxWidth).not.toBe('none');
    expect(await host.confirm.locator('.discard-appearance-actions').evaluate(element => getComputedStyle(element).padding)).toBe('0px 16px 16px');
    await host.confirm.getByRole('button', {name: 'Keep editing', exact: true}).click();
    await expect(host.confirm).toBeHidden();
    await expect(host.settings.getByRole('heading', {level: 1, name: 'Appearance', exact: true})).toBeVisible();
    await expect(host.settings.getByText('Unsaved changes', {exact: false})).toBeVisible();
  });
  test('Discard changes leaves the section and clears the draft', async ({page}) => {
    const host = await setup(page); await host.makeDirty();
    await host.nav.getByRole('button', {name: 'General', exact: true}).click();
    await host.confirm.getByRole('button', {name: 'Discard changes', exact: true}).click();
    await expect(host.confirm).toBeHidden();
    await expect(host.settings.getByRole('heading', {level: 1, name: 'General', exact: true})).toBeVisible();
    expect(host.commands.some(command => command.type === 'settings.update')).toBe(false);
    await host.nav.getByRole('button', {name: 'Appearance', exact: true}).click();
    await expect(host.settings.getByText('Unsaved changes', {exact: false})).toBeHidden();
  });
  test('Apply changes saves then navigates', async ({page}) => {
    const host = await setup(page); await host.makeDirty();
    await host.nav.getByRole('button', {name: 'General', exact: true}).click();
    await host.confirm.getByRole('button', {name: 'Apply changes', exact: true}).click();
    await expect(host.confirm).toBeHidden();
    await expect.poll(() => host.commands.some(command => command.type === 'settings.update' && (command.payload.preferences as {wordWrap?: boolean} | undefined)?.wordWrap === false)).toBe(true);
    await expect(host.settings.getByRole('heading', {level: 1, name: 'General', exact: true})).toBeVisible();
  });
  test('search-result navigation is guarded without losing the draft', async ({page}) => {
    const host = await setup(page); await host.makeDirty();
    await host.settings.getByRole('searchbox', {name: 'Search all settings', exact: true}).fill('Default model');
    await host.settings.getByRole('button', {name: /^Default model/}).click();
    await expect(host.confirm).toBeVisible();
    await host.confirm.getByRole('button', {name: 'Keep editing', exact: true}).click();
    await expect(host.confirm).toBeHidden();
    await expect(host.settings.getByRole('heading', {level: 1, name: 'Appearance', exact: true})).toBeVisible();
    await expect(host.settings.getByText('Unsaved changes', {exact: false})).toBeVisible();
  });
  test('Escape and backdrop on the confirm dialog keep editing', async ({page}) => {
    const host = await setup(page); await host.makeDirty();
    await host.nav.getByRole('button', {name: 'General', exact: true}).click();
    await expect(host.confirm).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(host.confirm).toBeHidden();
    await expect(host.settings.getByRole('heading', {level: 1, name: 'Appearance', exact: true})).toBeVisible();
    await host.nav.getByRole('button', {name: 'General', exact: true}).click();
    await expect(host.confirm).toBeVisible();
    await page.mouse.click(20, 20);
    await expect(host.confirm).toBeHidden();
    await expect(host.settings.getByRole('heading', {level: 1, name: 'Appearance', exact: true})).toBeVisible();
    await expect(host.settings.getByText('Unsaved changes', {exact: false})).toBeVisible();
  });
  test('closing Settings with unsaved edits asks; Discard closes the dialog', async ({page}) => {
    const host = await setup(page); await host.makeDirty();
    await page.keyboard.press('Escape');
    await expect(host.settings).toBeVisible();
    await expect(host.confirm).toBeVisible();
    await host.confirm.getByRole('button', {name: 'Discard changes', exact: true}).click();
    await expect(host.confirm).toBeHidden();
    await expect(host.settings).toBeHidden();
  });
  test('clean Appearance navigates and closes without asking', async ({page}) => {
    const host = await setup(page);
    await host.nav.getByRole('button', {name: 'Appearance', exact: true}).click();
    await host.nav.getByRole('button', {name: 'General', exact: true}).click();
    await expect(host.confirm).toBeHidden();
    await expect(host.settings.getByRole('heading', {level: 1, name: 'General', exact: true})).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(host.settings).toBeHidden();
  });
});
