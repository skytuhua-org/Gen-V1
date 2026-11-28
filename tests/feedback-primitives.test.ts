import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {build} from 'esbuild';
import {readFile} from 'node:fs/promises';
import {chromium, type Browser, type Page} from '@playwright/test';

const fixture = `
import React from 'react';
import {createRoot} from 'react-dom/client';
import {toast, Toaster} from './packages/ui-shell/Toast';
import {TooltipLayer} from './packages/ui-shell/Tooltip';
import {ErrorState, BusyButton} from './packages/ui-shell/Feedback';

window.toast = toast;
function BusyProbe(){
 const [state,setState] = React.useState('idle');
 return <>
  <button id="probe-busy" onClick={() => setState('busy')}>Start</button>
  <button id="probe-ack" onClick={() => setState('acknowledged')}>Acknowledge</button>
  <button id="probe-idle" onClick={() => setState('idle')}>Reset</button>
  <BusyButton id="probe" busy={state === 'busy'} acknowledged={state === 'acknowledged'}>Send the report</BusyButton>
 </>;
}
function Fixture(){
 return <>
  <Toaster/><TooltipLayer/>
  <button id="tip" title="Save the current draft">Save</button>
  <ErrorState message="The save did not finish. Retry." onRetry={() => {window.retried = true;}} />
  <BusyButton id="busy" busy>Sending</BusyButton>
  <BusyProbe/>
 </>;
}
createRoot(document.getElementById('root')).render(<Fixture/>);
`;

describe('feedback primitives', () => {
  let browser: Browser, script: string, css: string;
  beforeAll(async () => {
    script = (await build({stdin:{contents:fixture,resolveDir:process.cwd(),loader:'tsx'},loader:{'.css':'empty'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'}})).outputFiles[0]!.text;
    css = await readFile('packages/ui-shell/tokens.css','utf8') + await readFile('packages/ui-shell/feedback.css','utf8');
    browser = await chromium.launch({headless:true,...(process.env.GEN_TEST_CHROMIUM_EXECUTABLE?{executablePath:process.env.GEN_TEST_CHROMIUM_EXECUTABLE}:process.platform==='win32'?{channel:'msedge'}:{})});
  });
  afterAll(async () => { await browser?.close(); });
  async function open(): Promise<Page> {
    const page = await browser.newPage();
    await page.setContent(`<style>${css}</style><div id="root"></div>`);
    await page.addScriptTag({content: script});
    return page;
  }

  it('shows, deduplicates, acts on and dismisses toasts', async () => {
    const page = await open();
    await page.evaluate(`window.toast('Draft saved')`);
    const item = page.locator('.ui-toast', {hasText: 'Draft saved'});
    await item.waitFor();
    expect(await item.getAttribute('role')).toBe('status');
    await page.evaluate(`window.toast('Draft saved')`);
    expect(await page.locator('.ui-toast').count()).toBe(1);
    await page.evaluate(`window.toast('Failed', {tone:'error'})`);
    await page.locator('.ui-toast[role="alert"]').waitFor();
    await page.evaluate(`window.toast('With action', {action:{label:'Undo', onClick(){window.acted = true}}})`);
    await page.locator('.ui-toast button', {hasText: 'Undo'}).click();
    expect(await page.evaluate(`Boolean(window.acted)`)).toBe(true);
    await expect.poll(() => page.locator('.ui-toast').count()).toBe(2);
    await page.locator('.ui-toast [aria-label="Dismiss notification"]').first().click();
    await expect.poll(() => page.locator('.ui-toast').count()).toBe(1);
    await page.close();
  });

  it('evicts the oldest toast through the leaving animation, not instantly (#1705)', async () => {
    const page = await open();
    await page.evaluate(`for (const m of ['First','Second','Third']) window.toast(m)`);
    // The evicted item enters `leaving` (data-state=closed) in the same publish, then unmounts on animation end.
    const state = await page.evaluate(`window.toast('Fourth'), new Promise(resolve => setTimeout(() => resolve(document.querySelector('.ui-toast').dataset.state), 0))`);
    expect(state).toBe('closed');
    const first = page.locator('.ui-toast', {hasText: 'First'});
    await first.waitFor({state: 'detached', timeout: 3000});
    await expect.poll(() => page.locator('.ui-toast').count()).toBe(3);
    // Rapid pushes: every evicted item exits through the same path; only the newest three stay open.
    const rest = await page.evaluate<string[]>(`for (const m of ['Five','Six','Seven','Eight']) window.toast(m); new Promise(resolve => setTimeout(() => resolve([...document.querySelectorAll('.ui-toast')].map(n => n.dataset.state + ':' + n.querySelector('span').textContent)), 0))`);
    expect(rest.filter(item => item.startsWith('closed'))).toHaveLength(4);
    await expect.poll(() => page.locator('.ui-toast').count(), {timeout: 4000}).toBe(3);
    const remaining = await page.evaluate(`[...document.querySelectorAll('.ui-toast span')].map(n => n.textContent).join()`);
    expect(remaining).toBe('Six,Seven,Eight');
    await page.close();
  });

  it('expires toasts after their duration', async () => {
    const page = await open();
    await page.evaluate(`window.toast('Short', {durationMs: 60})`);
    const item = page.locator('.ui-toast');
    await item.waitFor();
    await item.waitFor({state: 'detached', timeout: 4000});
    await page.close();
  });

  it('resumes sibling timers after a keyboard-dismissed toast loses focus', async () => {
    const page = await open();
    try {
      await page.clock.install();
      await page.evaluate("window.toast('Focused notification')");
      const first = page.locator('.ui-toast', {hasText:'Focused notification'});
      const dismiss = first.getByRole('button', {name:'Dismiss notification'});
      await dismiss.focus();
      await page.evaluate("window.toast('Short notification', {durationMs:100})");
      const short = page.locator('.ui-toast', {hasText:'Short notification'});
      await short.waitFor();
      // Give the second toast more than its duration while focus is held.
      await page.clock.runFor(500);
      expect(await short.count()).toBe(1);
      await dismiss.press('Enter');
      await first.waitFor({state:'detached'});
      // Per #1921 the removed toast's focus lands on the remaining toast's
      // close button — the stack still holds focus, so the timer stays paused.
      await expect.poll(() => page.evaluate(() => document.activeElement?.className)).toContain('ui-toast-close');
      await page.clock.runFor(500);
      expect(await short.count()).toBe(1);
      // Once focus leaves the stack the sibling timer resumes and expires.
      await page.locator('#tip').focus();
      await page.clock.runFor(1500);
      await short.waitFor({state:'detached', timeout:1000});
    } finally { await page.close(); }
  });

  it('adopts title attributes as tooltips on hover', async () => {
    const page = await open();
    const target = page.locator('#tip');
    await target.hover();
    const tip = page.locator('.ui-tooltip');
    await tip.waitFor();
    expect(await tip.innerText()).toBe('Save the current draft');
    expect(await target.getAttribute('title')).toBe('');
    await page.mouse.move(0, 0);
    await tip.waitFor({state: 'detached', timeout: 3000});
    await page.close();
  });

  it('refreshes a visible tooltip when its hovered button gets a new title', async () => {
    const page = await open();
    try {
      const target = page.locator('#tip');
      await target.hover();
      const tooltip = page.getByRole('tooltip');
      await tooltip.waitFor();
      await target.evaluate(node => node.setAttribute('title', 'A newer draft is available'));
      await expect.poll(() => tooltip.innerText()).toBe('A newer draft is available');
      expect(await target.getAttribute('aria-description')).toBe('A newer draft is available');
      expect(await target.getAttribute('title')).toBe('');
    } finally { await page.close(); }
  });

  it('strips a trailing retry instruction when a retry button is present', async () => {
    const page = await open();
    const error = page.locator('.ui-error');
    await error.waitFor();
    expect(await error.getAttribute('role')).toBe('alert');
    expect(await error.locator('p').innerText()).toBe('The save did not finish.');
    await error.getByRole('button', {name: 'Retry'}).click();
    expect(await page.evaluate(`Boolean(window.retried)`)).toBe(true);
    const busy = page.locator('#busy');
    expect(await busy.getAttribute('aria-busy')).toBe('true');
    expect(await busy.isDisabled()).toBe(true);
    await page.close();
  });

  it('evicts with the opacity-only fade under reduced motion', async () => {
    const page = await open();
    await page.emulateMedia({reducedMotion: 'reduce'});
    for (const m of ['r1', 'r2', 'r3']) await page.evaluate(`window.toast('${m}', {durationMs: 60000})`);
    const fade = await page.evaluate(() => new Promise<{duration: string; transform: string}>((resolve, reject) => {
      // The reduced exit lasts 80 ms. Sample both values on the DOM change, before removal.
      const observer = new MutationObserver(() => {
        const evicted = [...document.querySelectorAll('.ui-toast[data-state="closed"]')]
          .find(element => element.querySelector('span')?.textContent === 'r1');
        if (!evicted) return;
        observer.disconnect();
        clearTimeout(deadline);
        const style = getComputedStyle(evicted);
        resolve({duration: style.animationDuration, transform: style.transform});
      });
      const deadline = setTimeout(() => {
        observer.disconnect();
        reject(new Error('Expected the oldest toast to enter its exit animation'));
      }, 5000);
      observer.observe(document.body, {subtree: true, childList: true, attributeFilter: ['data-state']});
      const fixture = window as unknown as {toast(message: string, options: {durationMs: number}): void};
      fixture.toast('r4', {durationMs: 60000});
    }));
    expect(fade).toEqual({duration: '0.08s', transform: 'none'});
    await expect.poll(() => page.locator('.ui-toast').count()).toBe(3);
    await page.close();
  });

  it('uses brief opacity-only fades under reduced motion', async () => {
    const page = await open();
    await page.emulateMedia({reducedMotion: 'reduce'});
    await page.evaluate(`window.toast('Reduced')`);
    const item = page.locator('.ui-toast');
    await item.waitFor();
    const duration = await item.evaluate(el => getComputedStyle(el).animationDuration);
    expect(duration).toBe('0.08s');
    await page.close();
  });

  // Issue #1921: Escape dismisses the toast holding focus inside the stack.
  it('dismisses the focused toast on Escape and moves focus to the newest remaining toast', async () => {
    const page = await open();
    await page.evaluate(`window.toast('First'); window.toast('Second')`);
    await expect.poll(() => page.locator('.ui-toast').count()).toBe(2);
    // Focus the first toast's close button and press Escape.
    const first = page.locator('.ui-toast', {hasText: 'First'}).locator('.ui-toast-close');
    await first.focus();
    await page.keyboard.press('Escape');
    // Focus must land on the remaining toast's close button, not body.
    await expect.poll(() => page.evaluate(() => document.activeElement?.className)).toContain('ui-toast-close');
    await expect.poll(() => page.locator('.ui-toast:not([data-state="closed"])').count()).toBe(1);
    await page.close();
  });

  it('dismisses the newest toast on Escape when the stack container holds focus', async () => {
    const page = await open();
    await page.evaluate(`window.toast('Older'); window.toast('Newest')`);
    await expect.poll(() => page.locator('.ui-toast').count()).toBe(2);
    await page.locator('.ui-toaster').evaluate(el => el.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true})));
    await expect.poll(() => page.locator('.ui-toast', {hasText: 'Newest'}).count()).toBe(0);
    await expect.poll(() => page.locator('.ui-toast', {hasText: 'Older'}).count()).toBe(1);
    await page.close();
  });

  it('does not dismiss toasts on Escape outside the stack, and registers no global listener', async () => {
    const page = await open();
    // The stack must not add a global keydown listener: count document-level
    // listeners is not directly observable, so assert behavior — Escape with
    // focus outside the stack leaves every toast open.
    await page.evaluate(`window.toast('Stay')`);
    await page.locator('.ui-toast').waitFor();
    await page.locator('#tip').focus();
    await page.keyboard.press('Escape');
    await expect.poll(() => page.locator('.ui-toast:not([data-state="closed"])').count()).toBe(1);
    // Escape on the last focused toast drops focus to body when none remain.
    await page.locator('.ui-toast .ui-toast-close').focus();
    await page.keyboard.press('Escape');
    await expect.poll(() => page.locator('.ui-toast').count()).toBe(0);
    await expect.poll(() => page.evaluate(() => document.activeElement === document.body)).toBe(true);
    await page.close();
  });
  it('keeps a BusyButton label and bounding box stable across busy and acknowledged states', async () => {
    const page = await open();
    const probe = page.locator('#probe');
    await probe.waitFor();
    const measure = async () => {
      const box = await probe.boundingBox();
      return {width: box?.width, height: box?.height, text: await probe.innerText()};
    };
    const idle = await measure();
    await page.locator('#probe-busy').click();
    const busy = await measure();
    await page.locator('#probe-ack').click();
    const acknowledged = await measure();
    expect(busy.text).toBe(idle.text);
    expect(acknowledged.text).toBe(idle.text);
    expect(Math.abs(busy.width! - idle.width!)).toBeLessThanOrEqual(1);
    expect(Math.abs(acknowledged.width! - idle.width!)).toBeLessThanOrEqual(1);
    expect(Math.abs(busy.height! - idle.height!)).toBeLessThanOrEqual(1);
    expect(Math.abs(acknowledged.height! - idle.height!)).toBeLessThanOrEqual(1);
    await page.close();
  });

  it('delays the busy spinner for 150ms and cancels it on settle', async () => {
    const page = await open();
    await page.clock.install({time: new Date(0)});
    await page.clock.pauseAt(new Date(1000));
    const spinner = page.locator('#probe .ui-action-indicator-busy[data-current="true"]');
    const click = (selector: string) => page.locator(selector).evaluate((button: HTMLButtonElement) => button.click());
    await click('#probe-busy');
    await page.clock.runFor(149);
    expect(await spinner.count()).toBe(0);
    await page.clock.runFor(1);
    expect(await spinner.count()).toBe(1);
    await click('#probe-ack');
    await page.clock.runFor(300);
    expect(await spinner.count()).toBe(0);
    expect(await page.locator('#probe .ui-action-indicator-acknowledged[data-current="true"]').count()).toBe(1);
    await click('#probe-idle');
    await click('#probe-busy');
    await page.clock.runFor(100);
    await click('#probe-idle');
    await page.clock.runFor(300);
    expect(await spinner.count()).toBe(0);
    await page.close();
  });

  it('uses opacity-only status motion and disables rotation under reduced or off motion', async () => {
    const page = await open();
    await page.clock.install();
    await page.locator('#probe-busy').click();
    await page.clock.runFor(160);
    const busyLayer = page.locator('#probe .ui-action-indicator-busy');
    const timing = await busyLayer.evaluate(el => ({transition: getComputedStyle(el).transitionDuration, property: getComputedStyle(el).transitionProperty, animation: getComputedStyle(el.querySelector('svg')!).animationName}));
    expect(timing.transition).toBe('0.16s');
    expect(timing.property).toBe('opacity');
    expect(timing.animation).toBe('ui-spin');
    await page.emulateMedia({reducedMotion: 'reduce'});
    const reduced = await busyLayer.evaluate(el => ({transition: getComputedStyle(el).transitionDuration, animation: getComputedStyle(el.querySelector('svg')!).animationName}));
    expect(reduced.transition).toBe('0.08s');
    expect(reduced.animation).toBe('none');
    await page.evaluate(() => { document.documentElement.dataset.motion = 'off'; });
    const off = await busyLayer.evaluate(el => ({transition: getComputedStyle(el).transitionDuration, animation: getComputedStyle(el.querySelector('svg')!).animationName}));
    expect(off.transition).toBe('0s');
    expect(off.animation).toBe('none');
    await page.close();
  });

});
