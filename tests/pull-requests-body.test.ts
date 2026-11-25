import { afterAll, beforeAll, expect, it } from 'vitest';
import { build } from 'esbuild';
import { chromium, expect as browserExpect, type Browser, type Page } from '@playwright/test';
import { createServer, type Server } from 'node:http';
import { resolve } from 'node:path';

// Issue #1949: the Pull request and Linked pull requests surfaces must state
// their own purpose and show distinct empty-state copy.
const entry = `import { createRoot } from 'react-dom/client';
import { PullRequestsBody } from './apps/web/src/WorkspaceSurfaceBody';
const linked = new URLSearchParams(location.search).get('linked') === '1';
createRoot(document.getElementById('root')!).render(
  <PullRequestsBody base="/api" query={new URLSearchParams()} active journalKey="t:1" linked={linked} timeFormat="24h" />);
`;

let browser: Browser, server: Server, port: number;
beforeAll(async () => {
  const bundle = await build({ stdin: { contents: entry, resolveDir: resolve('.'), loader: 'tsx' }, bundle: true, write: false, outfile: 'fixture.js', format: 'iife', platform: 'browser', jsx: 'automatic', jsxImportSource: 'react', loader: { '.woff': 'dataurl', '.woff2': 'dataurl', '.ttf': 'dataurl' }, define: { 'process.env.NODE_ENV': '"production"' } });
  const javascript = bundle.outputFiles.find(file => file.path.endsWith('.js'))!.text;
  const css = bundle.outputFiles.find(file => file.path.endsWith('.css'))?.text ?? '';
  server = createServer((request, response) => {
    if (request.url === '/fixture.js') { response.setHeader('content-type', 'text/javascript'); response.end(javascript); }
    else if (request.url === '/fixture.css') { response.setHeader('content-type', 'text/css'); response.end(css); }
    else { response.setHeader('content-type', 'text/html'); response.end('<div id="root"></div><link rel="stylesheet" href="/fixture.css"><script src="/fixture.js"></script>'); }
  });
  await new Promise<void>(accept => server.listen(0, '127.0.0.1', accept));
  port = (server.address() as { port: number }).port;
  browser = await chromium.launch({ headless: true, ...(process.env.GEN_TEST_CHROMIUM_EXECUTABLE ? { executablePath: process.env.GEN_TEST_CHROMIUM_EXECUTABLE } : {}) });
}, 60_000);
afterAll(async () => { await browser?.close(); server?.close(); });

async function mount(linked: boolean, items: { number: number; title: string; url: string; state: string }[]): Promise<Page> {
  const page = await browser.newPage();
  await page.route('**/api/**', route => route.fulfill({ contentType: 'application/json', body: '{}' }));
  await page.route('**/api/bootstrap**', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ csrfToken: 'test' }) }));
  await page.route('**/api/pull-requests**', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ repo: 'owner/repo', items }) }));
  await page.route('**/api/git**', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ gitWrite: true, head: 'abc', revision: 1, branch: 'main', files: [] }) }));
  await page.goto(`http://127.0.0.1:${port}/?linked=${linked ? 1 : 0}`);
  return page;
}

it('states each surface\'s own purpose above the toolbar notices', async () => {
  const unlinked = await mount(false, []);
  await browserExpect(unlinked.locator('.panel-note').first()).toHaveText('All open pull requests in this project’s repository.');
  await unlinked.close();
  const linked = await mount(true, []);
  await browserExpect(linked.locator('.panel-note').first()).toHaveText('Pull requests linked to this conversation for review.');
  await linked.close();
});

it('shows distinct empty-state copy instead of an empty list', async () => {
  const unlinked = await mount(false, []);
  await expect.poll(async () => unlinked.locator('.live-change-list').count(), { timeout: 10000 }).toBe(0);
  await browserExpect(unlinked.getByText('No open pull requests.')).toBeVisible();
  await unlinked.close();
  const linked = await mount(true, []);
  await expect.poll(async () => linked.locator('.live-change-list').count(), { timeout: 10000 }).toBe(0);
  await browserExpect(linked.getByText('No pull requests are linked to this conversation yet. Link one below.')).toBeVisible();
  await linked.close();
});

it('still renders the list when pull requests exist', async () => {
  const page = await mount(false, [{ number: 7, title: 'Add the thing', url: 'https://example.test/pr/7', state: 'OPEN' }]);
  await browserExpect(page.locator('.live-change-list li').first()).toContainText('#7 Add the thing');
  await page.close();
});
