import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {readFile} from 'node:fs/promises';
import {chromium, type Browser, type Page} from '@playwright/test';

/** The failed-preview source link must render as a styled secondary action, not a bare UA link. */
describe('error-action link', () => {
  let browser: Browser, css: string;
  beforeAll(async () => {
    css = await readFile('apps/web/src/styles.css', 'utf8');
    browser = await chromium.launch({headless: true, ...(process.platform === 'win32' ? {channel: 'msedge'} : {})});
  });
  afterAll(async () => { await browser?.close(); });
  async function open(): Promise<Page> {
    const page = await browser.newPage();
    await page.setContent(`<style>${css}</style><div class="document-preview-failure"><button type="button">Retry preview</button><a class="error-action" href="https://example.invalid/signed.pdf" target="_blank" rel="noopener noreferrer"><svg aria-hidden="true" width="14" height="14"></svg>Open source PDF</a></div>`);
    return page;
  }

  it('keeps link semantics and hides its icon from assistive tech', async () => {
    const page = await open();
    const action = page.locator('.error-action');
    await action.waitFor();
    expect(await action.getAttribute('href')).toBe('https://example.invalid/signed.pdf');
    expect(await action.getAttribute('target')).toBe('_blank');
    expect(await action.getAttribute('rel')).toBe('noopener noreferrer');
    expect(await action.locator('svg').getAttribute('aria-hidden')).toBe('true');
    await page.close();
  });

  it('renders as a bordered secondary action with no underline', async () => {
    const page = await open();
    const styles = await page.locator('.error-action').evaluate(el => getComputedStyle(el));
    expect(styles.display).toBe('inline-flex');
    expect(styles.borderRadius).toBe('8px');
    expect(styles.borderWidth).toBe('1px');
    expect(styles.textDecorationLine).toBe('none');
    expect(styles.height).toBe('32px');
    expect(styles.marginLeft).toBe('8px');
    expect(styles.color).not.toBe('rgb(0, 0, 238)');
    await page.close();
  });

  it('shows a focus ring and no underline on hover', async () => {
    const page = await open();
    const action = page.locator('.error-action');
    await action.waitFor();
    await action.focus();
    expect((await action.evaluate(el => getComputedStyle(el))).outlineWidth).toBe('2px');
    await action.hover();
    const hovered = await action.evaluate(el => getComputedStyle(el));
    expect(hovered.textDecorationLine).toBe('none');
    await page.close();
  });
});
