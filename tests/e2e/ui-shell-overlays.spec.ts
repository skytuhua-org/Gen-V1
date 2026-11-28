import { expect, test } from '@playwright/test';
import { resolve } from 'node:path';

const fixture = '/@fs/' + resolve('tests/e2e/ui-shell-overlays-fixture.tsx').replaceAll('\\', '/');
test.beforeEach(async ({ page }) => {
  await page.route(url => url.pathname === '/ui-shell-overlays', route => route.fulfill({
    contentType: 'text/html', body: `<html data-theme="dark" data-native-titlebar="true"><body><div id="root"></div><script type="module">import RefreshRuntime from '/@react-refresh';RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;await import('${encodeURI(fixture)}');</script></body></html>`,
  }));
  await page.goto('/ui-shell-overlays');
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

test('caller improvements to tooltip name and description survive title retirement',async({page})=>{
  await page.goto('/ui-shell-overlays?tooltip');
  await expect(page.getByRole('button',{name:'Tooltip anchor'})).toBeVisible();
  await page.evaluate(()=>{
    for(const kind of ['name','description'] as const){
      const control=document.createElement('button');
      control.id='tooltip-'+kind;
      control.type='button';
      control.title='Initial delegated help';
      control.style.cssText='position:fixed;top:220px;width:100px;height:30px;left:'+(kind==='name'?100:250)+'px';
      if(kind==='description')control.textContent='Named action';
      document.body.appendChild(control);
    }
  });
  for(const [kind,attribute] of [['name','aria-label'],['description','aria-description']] as const){
    const control=page.locator('#tooltip-'+kind);
    await control.hover();
    await expect(page.getByRole('tooltip')).toHaveText('Initial delegated help');
    await expect(control).toHaveAttribute(attribute,'Initial delegated help');
    await control.evaluate((node,attributeName)=>{
      node.setAttribute(attributeName,'Caller retained value');
      node.setAttribute('title','Refreshed delegated help');
    },attribute);
    await expect(page.getByRole('tooltip')).toHaveText('Refreshed delegated help');
    await expect(control).toHaveAttribute(attribute,'Caller retained value');
    await control.evaluate(node=>node.removeAttribute('title'));
    await expect(page.getByRole('tooltip')).toHaveCount(0);
    await expect(control).toHaveAttribute(attribute,'Caller retained value');
  }
});

test('retiring a tooltip drops its own fallback and preserves caller naming references',async({page})=>{
  await page.goto('/ui-shell-overlays?tooltip');
  await expect(page.getByRole('button',{name:'Tooltip anchor'})).toBeVisible();
  await page.evaluate(()=>{
    const label=document.createElement('span');
    label.id='caller-tooltip-label';
    label.textContent='Caller reference';
    document.body.appendChild(label);
    for(const [index,kind] of ['generated','same','references'].entries()){
      const button=document.createElement('button');
      button.id='tooltip-'+kind;
      button.type='button';
      button.title='Adopted label';
      button.style.cssText='position:fixed;top:220px;width:100px;height:30px;left:'+(100+150*index)+'px';
      document.body.appendChild(button);
    }
  });
  for(const kind of ['generated','same','references']){
    const control=page.locator('#tooltip-'+kind);
    await control.hover();
    await expect(page.getByRole('tooltip')).toHaveText('Adopted label');
    await expect(control).toHaveAttribute('aria-label','Adopted label');
    await control.evaluate((node,mode)=>{
      if(mode==='same')node.setAttribute('aria-label','Adopted label');
      if(mode==='references'){
        node.setAttribute('aria-labelledby','caller-tooltip-label');
        node.setAttribute('aria-describedby','caller-tooltip-label');
      }
      node.removeAttribute('title');
    },kind);
    await expect(page.getByRole('tooltip')).toHaveCount(0);
    if(kind==='same')await expect(control).toHaveAttribute('aria-label','Adopted label');
    else await expect(control).not.toHaveAttribute('aria-label',/./);
    if(kind==='references'){
      await expect(control).toHaveAttribute('aria-labelledby','caller-tooltip-label');
      await expect(control).toHaveAttribute('aria-describedby','caller-tooltip-label');
    }
  }
});

test('open tooltip transfers directly to a peer before the next paint without motion',async({page})=>{
  await page.goto('/ui-shell-overlays?warm-tooltip');
  const alpha=page.getByRole('button',{name:'Alpha'}),beta=page.getByRole('button',{name:'Beta'});
  await alpha.hover();
  const bubble=page.getByRole('tooltip');
  await expect(bubble).toHaveText('Help for Alpha');
  const prior=await bubble.elementHandle();
  const box=await beta.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x+box!.width/2,box!.y+box!.height/2);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  expect(await bubble.textContent({timeout:1000})).toBe('Help for Beta');
  await expect(bubble).toHaveAttribute('data-opening','pointer-warm');
  expect(await bubble.evaluate((node,old)=>node===old,prior)).toBe(true);
  expect(await bubble.evaluate(node=>node.getAnimations().length)).toBe(0);
  const tooltipBounds=await bubble.boundingBox();
  expect(Math.abs(tooltipBounds!.x+tooltipBounds!.width/2-(box!.x+box!.width/2))).toBeLessThan(3);
});

test('tooltip dwell and internal gap honor their exact clock boundaries',async({page})=>{
  await page.goto('/ui-shell-overlays?warm-tooltip');
  const button=(name:string)=>page.getByRole('button',{name,exact:true});
  const bubble=page.getByRole('tooltip');
  const over=async(name:string)=>{await button(name).dispatchEvent('pointerover',{pointerType:'mouse'});};
  await expect(button('Alpha')).toBeVisible();
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now()+100));
  await over('Alpha');
  await page.clock.runFor(349);
  await expect(bubble).toHaveCount(0);
  await page.clock.runFor(1);
  await expect(bubble).toHaveText('Help for Alpha');
  await page.getByTestId('tooltip-gap').dispatchEvent('pointerover',{pointerType:'mouse'});
  await expect(bubble).toHaveCount(0);
  await page.clock.runFor(299);
  await over('Beta');
  await expect(bubble).toHaveText('Help for Beta');
  await expect(bubble).toHaveAttribute('data-opening','pointer-warm');
  await page.getByTestId('tooltip-gap').dispatchEvent('pointerover',{pointerType:'mouse'});
  await page.clock.runFor(300);
  await over('Gamma');
  await expect(bubble).toHaveCount(0);
  await page.clock.runFor(350);
  await expect(bubble).toHaveText('Help for Gamma');
  await expect(bubble).toHaveAttribute('data-opening','pointer-cold');
  await over('Delta');
  await expect(bubble).toHaveCount(0);
  await page.clock.runFor(350);
  await expect(bubble).toHaveText('Help for Delta');
  await expect(bubble).toHaveAttribute('data-opening','pointer-cold');
});

test('Escape, owner loss and held pointer activity discard tooltip warmth',async({page})=>{
  await page.goto('/ui-shell-overlays?warm-tooltip');
  const alpha=page.getByRole('button',{name:'Alpha'}),beta=page.getByRole('button',{name:'Beta'});
  const bubble=page.getByRole('tooltip');
  await alpha.hover();
  await expect(bubble).toHaveText('Help for Alpha');
  await page.keyboard.press('Escape');
  await expect(bubble).toHaveCount(0);
  await alpha.locator('span').hover();
  await page.waitForTimeout(400);
  await expect(bubble).toHaveCount(0);
  await beta.hover();
  await expect(bubble).toHaveText('Help for Beta');
  await expect(bubble).toHaveAttribute('data-opening','pointer-cold');
  await page.getByTestId('tooltip-group-one').evaluate(node=>node.setAttribute('data-tooltip-group','replacement'));
  await expect(bubble).toHaveCount(0);
  await beta.dispatchEvent('pointerover',{pointerType:'mouse',buttons:1});
  await page.waitForTimeout(400);
  await expect(bubble).toHaveCount(0);
  // Move the real pointer off the group so removal cannot reveal a neighbor beneath it.
  await page.mouse.move(25,25);
  await beta.dispatchEvent('pointerover',{pointerType:'mouse'});
  await beta.evaluate(node=>node.remove());
  await page.waitForTimeout(400);
  await expect(bubble).toHaveCount(0);
});

test('keyboard tooltip has a 100 ms dwell and does not leave peers warm',async({page})=>{
  await page.goto('/ui-shell-overlays?warm-tooltip');
  const alpha=page.getByRole('button',{name:'Alpha'}),beta=page.getByRole('button',{name:'Beta'});
  const bubble=page.getByRole('tooltip');
  await expect(alpha).toBeVisible();
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now()+100));
  await page.keyboard.press('Tab');
  await expect(alpha).toBeFocused();
  await page.clock.runFor(99);
  await expect(bubble).toHaveCount(0);
  await page.clock.runFor(1);
  await expect(bubble).toHaveText('Help for Alpha');
  await expect(bubble).toHaveAttribute('data-opening','keyboard');
  await beta.dispatchEvent('pointerover',{pointerType:'mouse'});
  await expect(bubble).toHaveCount(0);
  await page.clock.runFor(350);
  await expect(bubble).toHaveText('Help for Beta');
  await expect(bubble).toHaveAttribute('data-opening','pointer-cold');
});
