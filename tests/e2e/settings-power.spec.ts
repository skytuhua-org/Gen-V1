import { expect, test } from '@playwright/test';
import { serveTaskFixture, taskFixture } from './task-interface-fixture';
import type { DesktopContext, DesktopPowerState, DesktopState } from '../../packages/desktop-contract';

async function openSettings(page: import('@playwright/test').Page, theme: 'dark' | 'light' = 'dark') {
  const snapshot = taskFixture({ root: 'text', elements: { text: { type: 'Text', props: { text: 'Power settings fixture' } } } });
  snapshot.settings.theme=theme;
  const host = await serveTaskFixture(page, snapshot);
  await page.route('**/api/commands', route => route.fallback());
  await page.route('**/api/workspace', route => route.fulfill({ json: { projects: [], state: { version: 1, revision: 0, activeCanvasId: 'workspace-default', canvases: [{ version: 1, id: 'workspace-default', name: 'Workspace', preset: 'workspace', viewport: { x: 0, y: 0, zoom: 1 }, panels: [], filter: 'active', projectIds: [] }], profiles: [], disabledKinds: [], integrations: {} } } }));
  await page.route('**/api/environment', route => route.fulfill({ json: { revision: 0, entries: [], secretStorageAvailable: false } }));
  await page.goto('/');
  const composer = page.getByRole('textbox', { name: 'Message', exact: true });
  await expect(composer).toBeEnabled();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Settings', exact: true });
  await expect(dialog).toBeVisible();
  return { ...host, dialog, nav: dialog.getByRole('navigation', { name: 'Settings sections' }), search: dialog.getByRole('searchbox', { name: 'Search all settings' }) };
}

test('keep-awake rows stay out of the browser build', async ({ page }) => {
  const { dialog, nav, search } = await openSettings(page);
  await nav.getByRole('button', { name: 'General', exact: true }).click();
  await expect(dialog.locator('[data-setting-id="keep-awake-tasks"]')).toHaveCount(0);
  await expect(dialog.locator('[data-setting-id="keep-awake-schedules"]')).toHaveCount(0);
  await expect(dialog.getByRole('switch', { name: 'Keep the PC awake for tasks' })).toHaveCount(0);
  await search.fill('keep the PC awake');
  await expect(dialog.getByText('No matching settings.')).toBeVisible();
  await search.fill('power');
  await expect(dialog.locator('.settings-result', { hasText: 'Keep the PC awake' })).toHaveCount(0);
});

async function installPowerFixture(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    const context: DesktopContext={windowId:'main',surface:{kind:'main'},windows:[],power:{state:'off'}};
    const listeners=new Set<(state:DesktopState)=>void>();
    (window as unknown as {setPower:(power:DesktopPowerState)=>void}).setPower=power=>{context.power=power;for(const listener of listeners)listener({...context});};
    window.harnessDesktop={getContext:async()=>context,ready:async()=>context,list:async()=>[],reattach:async()=>{},minimize:async()=>{},resetBounds:async()=>{},focus:async()=>{},onState:(listener:(state:DesktopState)=>void)=>{listeners.add(listener);return()=>listeners.delete(listener);},onCloseRequested:()=>()=>{},onWorkspaceChanged:()=>()=>{}} as unknown as NonNullable<Window['harnessDesktop']>;
  });
}

for (const theme of ['dark','light'] as const) test(`desktop power status explains the active hold and disabled schedule control in ${theme}`, async ({page}, info) => {
  await installPowerFixture(page);
  const {dialog,nav}=await openSettings(page,theme);
  await nav.getByRole('button',{name:'General',exact:true}).click();
  const tasks=dialog.locator('[data-setting-id="keep-awake-tasks"]'),schedules=dialog.locator('[data-setting-id="keep-awake-schedules"]');
  const taskSwitch=tasks.getByRole('switch'),scheduleSwitch=schedules.getByRole('switch');
  await taskSwitch.click();
  await expect(taskSwitch).toHaveAttribute('aria-checked','true');
  await page.evaluate(()=>(window as unknown as {setPower:(power:DesktopPowerState)=>void}).setPower({state:'holding',reason:'tasks'}));
  await expect(tasks.getByRole('status')).toContainText('A task run is keeping this PC awake.');
  await expect(tasks).toContainText('Sleep, lid-close and power-button actions follow your system settings.');
  await expect(scheduleSwitch).toBeDisabled();
  await expect(scheduleSwitch).toHaveAccessibleDescription(/Task runs already hold this PC awake/);
  await expect(schedules.getByRole('status')).toHaveCount(0);
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(tasks.locator('.settings-power-dot')).toHaveCSS('animation-name','none');
  await dialog.screenshot({path:info.outputPath(`power-holding-${theme}.png`)});
  await page.evaluate(()=>(window as unknown as {setPower:(power:DesktopPowerState)=>void}).setPower({state:'off'}));
  await expect(scheduleSwitch).toBeEnabled();
  await expect(scheduleSwitch).not.toHaveAccessibleDescription(/Task runs already/);
  await scheduleSwitch.click();
  await expect(scheduleSwitch).toHaveAttribute('aria-checked','true');
  await page.evaluate(()=>(window as unknown as {setPower:(power:DesktopPowerState)=>void}).setPower({state:'unavailable'}));
  await expect(tasks.getByRole('status')).toContainText('Power status is unavailable');
});
