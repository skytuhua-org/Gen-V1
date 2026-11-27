import { expect, test } from '@playwright/test';
import { resolve } from 'node:path';

const fixture = '/@fs/' + resolve('tests/e2e/ui-shell-overlays-fixture.tsx').replaceAll('\\', '/');
test.beforeEach(async ({ page }) => {
  await page.route(url => url.pathname === '/ui-shell-overlays', route => route.fulfill({
    contentType: 'text/html', body: `<html data-theme="dark" data-native-titlebar="true"><body><div id="root"></div><script type="module">import RefreshRuntime from '/@react-refresh';RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;await import('${encodeURI(fixture)}');</script></body></html>`,
  }));
  await page.goto('/ui-shell-overlays');
});

test('the top native modal owns the shared toaster and Escape dismisses only its focused toast',async({page})=>{
 await page.goto('/ui-shell-overlays?modal-toast');
 const open=page.getByRole('button',{name:'Open notification dialog',exact:true});
 await open.click();
 const outer=page.getByRole('dialog',{name:'Notification dialog',exact:true});
 const notifications=(owner:typeof outer)=>owner.getByRole('region',{name:'Notifications',exact:true});
 const notify=outer.getByRole('button',{name:'Notify from dialog',exact:true});
 await notify.click();
 await expect(notifications(outer).getByRole('alert')).toContainText('Notification from dialog');
 await page.keyboard.press('Tab');
 await expect(notifications(outer).getByRole('button',{name:'Notification action',exact:true})).toBeFocused();
 await page.keyboard.press('Tab');
 const outerDismiss=notifications(outer).getByRole('button',{name:'Dismiss notification',exact:true});
 await expect(outerDismiss).toBeFocused();
 await page.keyboard.press('Tab');
 await expect(outer.getByRole('button',{name:'Close dialog',exact:true})).toBeFocused();
 await page.keyboard.press('Shift+Tab');
 await expect(outerDismiss).toBeFocused();
 await outer.getByRole('button',{name:'Open nested notification dialog',exact:true}).click();
 const inner=page.getByRole('dialog',{name:'Nested notification dialog',exact:true});
 await expect(notifications(inner).getByRole('alert')).toContainText('Notification from dialog');
 const notifyInner=inner.getByRole('button',{name:'Notify from nested dialog',exact:true});
 await notifyInner.click();
 const alert=notifications(inner).getByRole('alert').filter({hasText:'Notification from nested dialog'});
 await expect(alert).toBeInViewport();
 await alert.getByRole('button',{name:'Dismiss notification',exact:true}).focus();
 await page.keyboard.press('Escape');
 await expect(alert).toHaveCount(0);await expect(inner).toBeVisible();
 await notifyInner.focus();
 await page.keyboard.press('Escape');
 await expect(notifications(inner).getByRole('alert')).toHaveCount(0);
 await expect(notifications(outer).getByRole('alert')).toHaveCount(1);
 await outer.getByRole('button',{name:'Close dialog',exact:true}).click();
 await expect(page.getByRole('dialog')).toHaveCount(0);
 await expect(page.getByRole('region',{name:'Notifications',exact:true}).getByRole('alert')).toContainText('Notification from dialog');
});

test('a timed notification keeps its remaining lifetime when a modal opens',async({page})=>{
 await page.goto('/ui-shell-overlays?modal-toast');
 await page.clock.install();
 await page.getByRole('button',{name:'Show timed notification',exact:true}).click();
 const notice=page.getByRole('status').filter({hasText:'Timed notification'});
 await expect(notice).toBeVisible();
 await page.clock.runFor(700);
 await page.getByRole('button',{name:'Open notification dialog',exact:true}).click();
 await expect(page.getByRole('dialog').getByRole('status')).toHaveText('Timed notification');
 await page.clock.runFor(600);
 await expect(notice).toHaveCount(0);
});

test('notification error stays until dismissed and success keeps the ordinary timeout',async({page})=>{
  await page.goto('/ui-shell-overlays?toast');
  await page.clock.install();
  const notices=page.getByRole('region',{name:'Notifications',exact:true});
  await page.getByRole('button',{name:'Show error',exact:true}).click();
  await page.getByRole('button',{name:'Show success',exact:true}).click();
  await expect(notices.getByRole('status')).toContainText('Saved locally');
  await page.clock.runFor(10_000);
  await expect(notices.getByRole('status')).toHaveCount(0);
  const error=notices.getByRole('alert');
  await expect(error).toContainText('Upload failed');
  await error.getByRole('button',{name:'Dismiss notification'}).click();
  await expect(error).toHaveCount(0);
});

test('keyboard focus pauses a custom notification for its remaining time',async({page})=>{
  await page.goto('/ui-shell-overlays?toast');
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now()+100));
  const trigger=page.getByRole('button',{name:'Show short notice',exact:true});
  await trigger.click();
  const notice=page.getByRole('region',{name:'Notifications',exact:true}).getByRole('status');
  const dismiss=notice.getByRole('button',{name:'Dismiss notification'});
  await page.keyboard.press('Tab');
  await expect(dismiss).toBeFocused();
  await page.clock.runFor(10_000);
  await expect(notice).toContainText('Short notice');
  await trigger.focus();
  await page.clock.runFor(299);
  await expect(notice).toHaveAttribute('data-state','open');
  await page.clock.runFor(2);
  await expect(notice).toHaveCount(0);
});

test('a model popup belongs to its native modal and keeps selection, draft and Escape usable', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Model', exact: true }).click();
  const popup = page.locator('.model-picker-popover');
  expect(await popup.evaluate(node => Boolean(node.closest('dialog[open]')))).toBe(true);
  await expect(page.getByRole('searchbox', { name: 'Search models' })).toBeFocused();
  await page.getByRole('option', { name: 'Model B', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'Model', exact: true })).toContainText('Model B');
  await expect(page.getByRole('textbox', { name: 'Preserved draft' })).toHaveValue('Keep this draft');
  await page.getByRole('combobox', { name: 'Model', exact: true }).click();
  await page.getByRole('searchbox', { name: 'Search models' }).press('Escape');
  await expect(page.getByRole('combobox', { name: 'Model', exact: true })).toBeFocused();
  await expect(page.getByRole('dialog', { name: 'Fixture settings' })).toBeVisible();
});

for(const zoom of [1.25,1.5])test(`modal-owned model popup remains inside viewport at CSS zoom ${zoom}`,async({page})=>{
  await page.evaluate(zoom=>{document.documentElement.style.zoom=String(zoom);},zoom);
  await page.getByRole('combobox',{name:'Model',exact:true}).click();
  const popup=page.locator('.model-picker-popover');await expect(popup).toBeVisible();
  const bounds=await popup.evaluate(node=>{const r=node.getBoundingClientRect();return{left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:innerWidth,height:innerHeight};});
  expect(bounds.left).toBeGreaterThanOrEqual(0);expect(bounds.top).toBeGreaterThanOrEqual(42);expect(bounds.right).toBeLessThanOrEqual(bounds.width+1);expect(bounds.bottom).toBeLessThanOrEqual(bounds.height+1);
  expect(await popup.evaluate(node=>Boolean(node.closest('dialog[open]')))).toBe(true);
});

test('blocking dialog backdrops blur the background without blurring their content', async ({ page }) => {
  const styles = await page.getByRole('dialog').evaluate(dialog => ({
    backdrop: getComputedStyle(dialog, '::backdrop').backdropFilter,
    content: getComputedStyle(dialog).filter,
  }));
  expect(styles.backdrop).toBe('blur(6px)');
  expect(styles.content).toBe('none');
});

test('composition Escape and Enter neither close the popup nor select a model', async ({ page }) => {
  const trigger = page.getByRole('combobox', { name: 'Model', exact: true });
  await trigger.click();
  const search = page.getByRole('searchbox', { name: 'Search models' });
  await search.press('ArrowDown');
  await search.dispatchEvent('keydown', { key: 'Escape', isComposing: true });
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await search.dispatchEvent('keydown', { key: 'Enter', isComposing: true });
  await expect(trigger).toContainText('Model A');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
});

test('legacy composition Escape keeps the model popup and owning dialog open', async ({ page }) => {
  const trigger = page.getByRole('combobox', { name: 'Model', exact: true });
  await trigger.click();
  await page.getByRole('searchbox', { name: 'Search models' }).dispatchEvent('keydown', { key: 'Escape', keyCode: 229 });
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('dialog', { name: 'Fixture settings' })).toBeVisible();
});

test('first opening a long catalog reveals the committed selected model', async ({ page }) => {
  await page.goto('/ui-shell-overlays?large=1');
  await page.getByRole('combobox', { name: 'Model', exact: true }).click();
  const result = await page.getByRole('option', { name: 'Catalog model 99', exact: true }).evaluate(option => {
    const bounds = option.getBoundingClientRect();
    const list = option.closest('[role="listbox"]')!.getBoundingClientRect();
    return { top: bounds.top, bottom: bounds.bottom, listTop: list.top, listBottom: list.bottom };
  });
  expect(result.top).toBeGreaterThanOrEqual(result.listTop);
  expect(result.bottom).toBeLessThanOrEqual(result.listBottom);
});

test('Escape closes a popup before its surrounding ARIA modal region', async ({ page }) => {
  await page.goto('/ui-shell-overlays?aria=1');
  const trigger = page.getByRole('combobox', { name: 'Model', exact: true });
  await trigger.click();
  await page.getByRole('searchbox', { name: 'Search models' }).press('Escape');
  await expect(page.getByRole('dialog', { name: 'Fixture settings' })).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).toBeFocused();
});

test('a disabled control drops focus to body but the modal pulls it back inside', async ({ page }) => {
  await page.goto('/ui-shell-overlays?retention=modal');
  const dialog = page.getByRole('dialog', { name: 'Retention dialog' });
  const disable = dialog.getByRole('button', { name: 'Disable me', exact: true });
  await disable.focus();
  await disable.click();
  await expect(disable).toBeDisabled();
  await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).not.toBe('BODY');
  expect(await page.evaluate(() => document.querySelector('dialog[open]')?.contains(document.activeElement))).toBe(true);
});

test('a popover keeps focus inside when its focused action disables', async ({ page }) => {
  await page.goto('/ui-shell-overlays?retention=popover');
  const popup = page.locator('.ui-popover');
  await expect(popup).toBeVisible();
  const disable = popup.getByRole('button', { name: 'Disable popup action', exact: true });
  await disable.focus();
  await disable.click();
  await expect(disable).toBeDisabled();
  await expect(popup).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).not.toBe('BODY');
  expect(await popup.evaluate(node => node.contains(document.activeElement))).toBe(true);
});

test('a popover still dismisses when focus moves to a control outside it', async ({ page }) => {
  await page.goto('/ui-shell-overlays?retention=popover');
  await expect(page.locator('.ui-popover')).toBeVisible();
  await page.getByRole('button', { name: 'Background control', exact: true }).focus();
  await expect(page.locator('.ui-popover')).toHaveCount(0);
});

for (const scenario of [
  { name: 'narrow light', viewport: { width: 390, height: 420 }, theme: 'light' },
  { name: 'short dark', viewport: { width: 280, height: 240 }, theme: 'dark' },
]) {
  test.describe(scenario.name, () => {
    test.use({ viewport: scenario.viewport, contextOptions: { reducedMotion: 'reduce' } });
    test('popup fits its first visible frame below native caption controls', async ({ page }, testInfo) => {
      await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, scenario.theme);
      await page.getByRole('combobox', { name: 'Model', exact: true }).click();
      const popup = page.locator('.model-picker-popover');
      const bounds = await popup.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBeGreaterThanOrEqual(8);
      expect(bounds!.y).toBeGreaterThanOrEqual(50);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(scenario.viewport.width - 8);
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(scenario.viewport.height - 8);
      await expect(page.getByRole('searchbox', { name: 'Search models' })).toBeFocused();
      await page.screenshot({ path: testInfo.outputPath('modal-popup.png') });
    });
  });
}

test('overlay focus recovery skips controls hidden by CSS visibility', async ({ page }) => {
  const path = '/@fs/' + resolve('packages/ui-shell/focus-retention.ts').replaceAll('\\', '/');
  const focused = await page.evaluate(async path => {
    const { refocusWithin } = await import(path);
    const root = document.createElement('div');
    root.tabIndex = -1;
    root.innerHTML = '<div style="visibility:hidden"><button>Hidden action</button></div><button>Visible action</button>';
    const dialog = document.querySelector('dialog[open]');
    if (dialog instanceof HTMLDialogElement) dialog.close();
    document.body.append(root);
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    refocusWithin(root);
    return document.activeElement === root.lastElementChild;
  }, path);
  expect(focused).toBe(true);
});

test('a tall tooltip stays visible in a short viewport when neither side fits', async ({ page }) => {
  await page.setViewportSize({ width: 250, height: 210 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/ui-shell-overlays?tooltip');
  await page.getByRole('button', { name: 'Tooltip anchor', exact: true }).hover();
  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toBeVisible();
  await expect.poll(async () => {
    const box = await tooltip.boundingBox();
    return Boolean(box && box.y >= 7 && box.y + box.height <= 203);
  }).toBe(true);
});
