import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {build} from 'esbuild';
import {chromium, type Browser, type Page} from '@playwright/test';

const fixture = `
import React from 'react';
import {createRoot} from 'react-dom/client';
import {FileCheckpoints} from './apps/web/src/FileCheckpoints';
import {DEFAULT_PREFERENCES} from './packages/contracts/preferences';
createRoot(document.getElementById('root')).render(<FileCheckpoints preferences={DEFAULT_PREFERENCES} current={<p>current</p>} recorded={<p>recorded</p>} initialSource="History"/>);
`;

describe('FileCheckpoints History empty state (#1742)', () => {
  let browser: Browser, page: Page;
  beforeAll(async () => {
    const script = (await build({stdin: {contents: fixture, resolveDir: process.cwd(), loader: 'tsx'}, loader: {'.css': 'empty'}, bundle: true, write: false, format: 'iife', platform: 'browser', jsx: 'automatic', define: {'process.env.NODE_ENV': '"production"'}})).outputFiles[0]!.text;
    browser = await chromium.launch({headless: true, ...(process.platform === 'win32' ? {channel: 'msedge'} : {})});
    page = await browser.newPage();
    await page.setContent('<div id="root"></div>');
    await page.addScriptTag({content: 'if(!crypto.randomUUID)crypto.randomUUID=()=>"00000000-0000-4000-8000-000000000000";'});
    await page.addScriptTag({content: script});
    await page.locator('.file-checkpoints-empty').waitFor();
  });
  afterAll(async () => { await browser?.close(); }, 45000);

  it('renders centered empty state with exact title and body copy', async () => {
    const empty = page.locator('.file-checkpoints-empty');
    expect(await empty.locator('strong').textContent()).toBe('No checkpoint history');
    expect(await empty.locator('p').textContent()).toBe('Snapshots of this file will appear here once a checkpoint is recorded.');
    expect(await empty.locator('p').evaluate(el => el.className)).not.toContain('file-checkpoints-note');
  });

  it('no-owner branch does not show the old bare note or mount history', async () => {
    expect(await page.locator('p.file-checkpoints-note').count()).toBe(0);
    expect(await page.locator('.file-checkpoints-history').count()).toBe(0);
  });
});
