import {readFileSync} from 'fs';
import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {chromium, type Browser, type Page} from '@playwright/test';

describe('workspace panel .error-text padding (#1743)', () => {
  let browser: Browser, page: Page;
  beforeAll(async () => {
    browser = await chromium.launch({headless: true, ...(process.platform === 'win32' ? {channel: 'msedge'} : {})});
    page = await browser.newPage();
    const css = readFileSync('apps/web/src/styles.css', 'utf8') + readFileSync('apps/web/src/workspace-tools.css', 'utf8');
    await page.setContent('<aside class="workspace-right"><p class="error-text" id="panel-err">Failed.</p><div class="workspace-panel-content"><p class="error-text" id="content-err">Failed.</p><div class="inner"><p class="error-text" id="nested-err">Failed.</p></div></div></aside>');
    await page.addStyleTag({content: css});
  });
  afterAll(async () => { await browser?.close(); }, 45000);

  it('direct children of .workspace-right and .workspace-panel-content get 8px 12px padding', async () => {
    for (const id of ['panel-err', 'content-err']) {
      const style = await page.locator('#' + id).evaluate(el => getComputedStyle(el));
      expect(style.paddingLeft).toBe('12px');
      expect(style.paddingTop).toBe('8px');
      expect(style.lineHeight).toBe('18px'); // 12px font * 1.5
      expect(style.marginLeft).toBe('0px');
    }
  });

  it('nested .error-text inside deeper wrappers is unaffected', async () => {
    const style = await page.locator('#nested-err').evaluate(el => getComputedStyle(el));
    expect(style.paddingLeft).toBe('0px');
  });
});
