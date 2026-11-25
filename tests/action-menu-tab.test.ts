import { afterAll, beforeAll, it } from 'vitest';
import { build } from 'esbuild';
import { chromium, expect as browserExpect, type Browser } from '@playwright/test';
import { resolve } from 'node:path';

// Issue #1948: an open ActionMenu must not survive focus leaving it — Tab and
// Shift+Tab close the popup and focus continues in the natural tab order.
const entry = `import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import { ActionMenu } from './packages/ui-shell/ActionMenu';
function App() {
  const [open, setOpen] = useState(false);
  const items = [
    { id: 'alpha', label: 'Alpha', onSelect: () => { document.getElementById('picked')!.textContent = 'alpha'; } },
    { id: 'beta', label: 'Beta', onSelect: () => { document.getElementById('picked')!.textContent = 'beta'; } },
  ];
  return <>
    <button id="before">Before</button>
    <ActionMenu label="Add surface" open={open} onOpenChange={setOpen} items={items} />
    <button id="after">After</button>
    <div id="picked"></div>
  </>;
}
createRoot(document.getElementById('root')!).render(<App />);
`;

let browser: Browser, javascript: string, css: string;
beforeAll(async () => {
  const bundle = await build({ stdin: { contents: entry, resolveDir: resolve('.'), loader: 'tsx' }, bundle: true, write: false, outfile: 'fixture.js', format: 'iife', platform: 'browser', jsx: 'automatic', jsxImportSource: 'react', define: { 'process.env.NODE_ENV': '"production"' } });
  javascript = bundle.outputFiles.find(file => file.path.endsWith('.js'))!.text;
  css = bundle.outputFiles.find(file => file.path.endsWith('.css'))?.text ?? '';
  browser = await chromium.launch({ headless: true, ...(process.env.GEN_TEST_CHROMIUM_EXECUTABLE ? { executablePath: process.env.GEN_TEST_CHROMIUM_EXECUTABLE } : {}) });
}, 30_000);
afterAll(async () => { await browser?.close(); });

async function mount() {
  const page = await browser.newPage();
  await page.setContent('<div id="root"></div>');
  await page.addStyleTag({ content: css });
  await page.addScriptTag({ content: javascript });
  const trigger = page.getByRole('button', { name: 'Add surface' });
  await trigger.click();
  await page.getByRole('menu').waitFor();
  return { page, trigger };
}

it('closes the open menu on Tab and focus continues to the next control', async () => {
  const { page, trigger } = await mount();
  await browserExpect(trigger).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Tab');
  await browserExpect(trigger).toHaveAttribute('aria-expanded', 'false');
  await browserExpect(page.getByRole('menu')).toHaveCount(0);
  await browserExpect(page.locator('#after')).toBeFocused();
  await page.close();
});

it('closes the open menu on Shift+Tab and focus moves to the previous control', async () => {
  const { page, trigger } = await mount();
  await page.keyboard.press('Shift+Tab');
  await browserExpect(trigger).toHaveAttribute('aria-expanded', 'false');
  await browserExpect(page.getByRole('menu')).toHaveCount(0);
  await browserExpect(page.locator('#before')).toBeFocused();
  await page.close();
});

it('keeps arrow navigation, Escape dismissal and Enter selection working', async () => {
  const { page, trigger } = await mount();
  const alpha = page.getByRole('menuitem', { name: 'Alpha' });
  await browserExpect(alpha).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await browserExpect(page.getByRole('menuitem', { name: 'Beta' })).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await browserExpect(alpha).toBeFocused();
  await page.keyboard.press('Escape');
  await browserExpect(page.getByRole('menu')).toHaveCount(0);
  await trigger.click();
  await page.getByRole('menu').waitFor();
  await page.keyboard.press('Enter');
  await browserExpect(page.locator('#picked')).toHaveText('alpha');
  await browserExpect(trigger).toHaveAttribute('aria-expanded', 'false');
  await page.close();
});
