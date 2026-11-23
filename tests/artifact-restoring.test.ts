import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {readFile} from 'node:fs/promises';
import {chromium, type Browser} from '@playwright/test';

/** While an artifact is pending its body must never paint an empty region. */
describe('artifact-restoring placeholder', () => {
  let browser: Browser, css: string;
  beforeAll(async () => {
    css = await readFile('apps/web/src/styles.css', 'utf8');
    browser = await chromium.launch({headless: true, ...(process.platform === 'win32' ? {channel: 'msedge'} : {})});
  });
  afterAll(async () => { await browser?.close(); });

  it('reserves a visible region while artifact content is pending', async () => {
    const page = await browser.newPage();
    await page.setContent(`<style>${css}</style><div class="artifact artifact-frame-card"><div class="artifact-body" aria-busy="true"><div class="artifact-restoring"><p role="status">Restoring Signed PDF…</p></div></div></div>`);
    const restoring = page.locator('.artifact-restoring');
    const styles = await restoring.evaluate(el => getComputedStyle(el));
    expect(styles.display).toBe('flex');
    expect(styles.minHeight).toBe('160px');
    expect(await page.locator('.artifact-restoring [role="status"]').innerText()).toBe('Restoring Signed PDF…');
    const box = await restoring.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(160);
    await page.close();
  });

  it('reserves a taller region inside the canvas frame', async () => {
    const page = await browser.newPage();
    await page.setContent(`<style>${css}</style><div class="artifact artifact-frame-canvas"><div class="artifact-body" aria-busy="true"><div class="artifact-restoring"><p role="status">Restoring</p></div></div></div>`);
    expect((await page.locator('.artifact-restoring').evaluate(el => getComputedStyle(el))).minHeight).toBe('200px');
    await page.close();
  });
});
