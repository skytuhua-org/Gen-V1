import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {build} from 'esbuild';
import {readFile} from 'node:fs/promises';
import {chromium, type Browser, type Page} from '@playwright/test';

const fixture = `
import React from 'react';
import {createRoot} from 'react-dom/client';
import {AppearanceSettings} from './apps/web/src/AppearanceSettings';
import {DEFAULT_PREFERENCES} from './packages/contracts/preferences';
createRoot(document.getElementById('root')).render(<AppearanceSettings preferences={DEFAULT_PREFERENCES} theme="dark" busy={false} save={async()=>{window.saved=(window.saved??0)+1;return true;}}/>);
`;

describe('font-size input validation', () => {
  let browser: Browser, script: string, css: string;
  beforeAll(async () => {
    script = (await build({stdin:{contents:fixture,resolveDir:process.cwd(),loader:'tsx'},loader:{'.css':'empty'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'}})).outputFiles[0]!.text;
    css = await readFile('apps/web/src/styles.css','utf8') + await readFile('apps/web/src/settings.css','utf8') + await readFile('apps/web/src/appearance-settings.css','utf8');
    browser = await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});
  });
  afterAll(async () => { await browser?.close(); });
  async function open(): Promise<Page> {
    const page = await browser.newPage();
    await page.setContent(`<style>${css}</style><div id="root"></div>`);
    await page.addScriptTag({content: script});
    return page;
  }

  it('keeps typed text, marks the field invalid and shows the range hint', async () => {
    const page = await open();
    const input = page.getByLabel('UI size');
    await input.waitFor();
    const committed = await input.inputValue();
    await input.fill('99');
    await input.blur();
    expect(await input.inputValue()).toBe('99');
    expect(await input.getAttribute('aria-invalid')).toBe('true');
    const hint = page.locator('#appearance-uiFontSize-error');
    expect(await hint.innerText()).toBe('Enter a whole number from 13 to 16.');
    expect(await hint.getAttribute('role')).toBe('alert');
    expect(await input.getAttribute('aria-describedby')).toBe('appearance-uiFontSize-error');
    const styles = await input.evaluate(el => getComputedStyle(el));
    expect(styles.boxShadow).not.toBe('none');
    expect(committed).not.toBe('99');
    await page.close();
  });

  it('clears the invalid state as soon as the entry is valid again', async () => {
    const page = await open();
    const input = page.getByLabel('Chat size');
    await input.waitFor();
    await input.fill('99');
    expect(await page.locator('#appearance-chatFontSize-error').innerText()).toBe('Enter a whole number from 14 to 20.');
    await input.fill('14');
    expect(await input.getAttribute('aria-invalid')).toBeNull();
    expect(await page.locator('#appearance-chatFontSize-error').innerText()).toBe('');
    await page.close();
  });

  it('Escape reverts to the committed value and clears the hint', async () => {
    const page = await open();
    const input = page.getByLabel('Code size');
    await input.waitFor();
    const committed = await input.inputValue();
    await input.fill('99');
    await input.press('Escape');
    expect(await input.inputValue()).toBe(committed);
    expect(await input.getAttribute('aria-invalid')).toBeNull();
    expect(await page.locator('#appearance-codeFontSize-error').innerText()).toBe('');
    await page.close();
  });
});
