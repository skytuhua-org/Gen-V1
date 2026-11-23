import {expect, test, type Page} from '@playwright/test';
import {resolve} from 'node:path';
import type {ShellSettingsReadModel} from '../../packages/contracts/shell-read-models';
import type {HostCommand} from '../../packages/contracts';

async function setup(page: Page) {
  const model: ShellSettingsReadModel = {sequence: 7, settings: {theme: 'dark', modelId: 'model-one'}, accounts: [], skills: [], skillProposals: [], learning: {supported: true, status: 'idle', lastReview: null}, projects: [], resources: [], resourcePage: {total: 0, nextCursor: null}, counts: {threads: 0, archivedThreads: 0, artifacts: 0, resources: 0, uncertainOperations: 0}};
  const commands: HostCommand[] = [];
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/bootstrap') return route.fulfill({json: {csrfToken: 'fixture'}});
    if (path === '/api/shell/settings') return route.fulfill({json: model});
    if (path === '/api/shell/resources') return route.fulfill({json: {sequence: 7, total: 0, items: [], nextCursor: null}});
    if (path === '/api/shell/archive') return route.fulfill({json: {sequence: 7, total: 0, items: [], nextCursor: null}});
    if (path === '/api/models') return route.fulfill({json: {models: [{id: 'model-one', name: 'First model', provider: 'openai'}]}});
    if (path === '/api/commands') {
      const command = route.request().postDataJSON() as HostCommand; commands.push(command);
      if (command.type === 'settings.update') model.settings = {...model.settings, ...command.payload};
      return route.fulfill({json: {commandId: command.id, seq: ++model.sequence, result: {}}});
    }
    if (path === '/api/environment') return route.fulfill({json: {revision: 0, entries: [], secretStorageAvailable: false}});
    if (path === '/api/workspace') return route.fulfill({json: {projects: [], state: {version: 1, revision: 0, activeCanvasId: 'workspace', canvases: [], profiles: [], disabledKinds: [], integrations: {}}}});
    if (path === '/api/integrations') return route.fulfill({json: {integrations: []}});
    if (path === '/api/account-auth') return route.fulfill({json: {state: 'signed-out', message: 'Synthetic readiness', identity: {availability: 'unavailable'}}});
    return route.fulfill({status: 500, json: {error: {message: 'Unexpected fixture read: ' + path}}});
  });
  const fixture = '/@fs/' + resolve('tests/e2e/settings-fontsize-fixture.tsx').replaceAll('\\', '/');
  await page.route('**/settings-fontsize-fixture', route => route.fulfill({contentType: 'text/html', body: `<html data-theme="dark"><body><div id="root"></div><script type="module">import RefreshRuntime from '/@react-refresh';RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;await import('${encodeURI(fixture)}');</script></body></html>`}));
  await page.goto('/settings-fontsize-fixture');
  const settings = page.getByRole('dialog', {name: 'Settings', exact: true});
  await settings.getByRole('navigation', {name: 'Settings sections'}).getByRole('button', {name: 'Appearance', exact: true}).click();
  return {model, commands, settings};
}

test.describe('font-size input validation (#1729)', () => {
  test('out-of-range text stays in the field with red border and exact hint', async ({page}) => {
    const host = await setup(page);
    const input = host.settings.getByRole('spinbutton', {name: 'UI size', exact: true});
    await input.fill('99'); await input.blur();
    await expect(input).toHaveValue('99');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    const hint = host.settings.getByRole('alert');
    await expect(hint).toHaveText('Enter a whole number from 13 to 16.');
    await expect(input).toHaveAttribute('aria-describedby', /appearance-uiFontSize-error/);
    await expect(host.settings.getByRole('button', {name: 'Apply', exact: true})).toBeEnabled();
  });
  test('typing a valid value clears invalid and commits; Escape reverts', async ({page}) => {
    const host = await setup(page);
    const input = host.settings.getByRole('spinbutton', {name: 'Chat size', exact: true});
    await input.fill('30'); await input.blur();
    await expect(host.settings.getByRole('alert')).toHaveText('Enter a whole number from 14 to 20.');
    await input.fill('16');
    await expect(host.settings.getByRole('alert')).toBeHidden();
    await expect(input).not.toHaveAttribute('aria-invalid', 'true');
    await input.fill('31'); await input.blur();
    await expect(host.settings.getByRole('alert')).toBeVisible();
    await input.press('Escape');
    await expect(input).toHaveValue('16');
    await expect(host.settings.getByRole('alert')).toBeHidden();
  });
  test('invalid text never commits to the draft', async ({page}) => {
    const host = await setup(page);
    const input = host.settings.getByRole('spinbutton', {name: 'Code size', exact: true});
    await input.fill('7'); await input.blur();
    await host.settings.getByRole('button', {name: 'Apply', exact: true}).click();
    await page.waitForTimeout(400);
    for (const command of host.commands.filter(c => c.type === 'settings.update')) {
      expect((command.payload as {preferences?: Record<string, unknown>}).preferences?.codeFontSize).toBeUndefined();
    }
  });
  test('all three fields carry min, max and step attributes', async ({page}) => {
    const host = await setup(page);
    for (const [label, min, max] of [['UI size', '13', '16'], ['Chat size', '14', '20'], ['Code size', '12', '18']] as const) {
      const input = host.settings.getByRole('spinbutton', {name: label, exact: true});
      await expect(input).toHaveAttribute('min', min); await expect(input).toHaveAttribute('max', max); await expect(input).toHaveAttribute('step', '1');
    }
  });
});
