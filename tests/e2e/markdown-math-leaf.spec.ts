import {expect, test, type Page} from '@playwright/test';
import {mkdtemp, rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import react from '@vitejs/plugin-react';
import {createServer, type ViteDevServer} from 'vite';

const fixtureUrl = '/@fs/' + resolve('tests/e2e/markdown-math-leaf.html').replaceAll('\\', '/');
let server: ViteDevServer | undefined;
let cacheDir: string | undefined;
let baseUrl: string;

// Use a private prebundle so a first KaTeX import cannot trigger a Vite reload
// while a test is holding that import or a selection.
test.beforeAll(async () => {
  cacheDir = await mkdtemp(resolve('node_modules/.vite-math-leaf-'));
  server = await createServer({
    configFile:false, root:'apps/web', plugins:[react()], cacheDir,
    optimizeDeps:{include:['katex', 'react', 'react-dom/client', 'react/jsx-dev-runtime', 'lucide-react'], noDiscovery:true},
    server:{host:'127.0.0.1', port:5477},
  });
  await server.listen();
  const address = server.httpServer?.address();
  if (!address || typeof address === 'string') throw new Error('Missing fixture server address');
  baseUrl = 'http://127.0.0.1:' + address.port;
});

test.afterAll(async () => {
  await server?.close();
  if (cacheDir) await rm(cacheDir, {recursive:true, force:true});
});

const island = '[data-source-transformed="true"]';
const leaves = (page: Page) => page.locator('[data-markdown-math]');

test('a cold import leaves original text visible and accepts only the current revision', async ({page}) => {
  let allowImport = () => {};
  const waitForImport = new Promise<void>(done => {allowImport = done;});
  await page.route('**/src/math-renderer.ts*', async route => {
    await waitForImport;
    await route.continue();
  });
  const requested = page.waitForRequest('**/src/math-renderer.ts*');
  await page.goto(baseUrl + fixtureUrl);
  await requested;
  await expect(leaves(page).first()).toHaveText('$x+1$');
  await page.getByRole('button', {name:'Next revision'}).click();
  await expect(leaves(page).first()).toHaveText('$y+2$');
  allowImport();
  await expect(leaves(page).first().locator(island).locator('annotation')).toHaveText('y+2');
  await expect(page.getByText('Math display unavailable. Source shown.')).toBeVisible();
});

test('hidden and inert leaves keep source until the owner becomes eligible', async ({page}) => {
  const moduleRequests: string[] = [];
  page.on('request', request => {
    if (new URL(request.url()).pathname.endsWith('/math-renderer.ts')) moduleRequests.push(request.url());
  });
  await page.goto(baseUrl + fixtureUrl + '?hidden');
  await expect(leaves(page)).toHaveCount(3);
  await page.getByRole('button', {name:'Toggle inert'}).click();
  await page.getByRole('button', {name:'Toggle hidden'}).click();
  await expect(leaves(page).first()).toHaveText('$x+1$');
  await page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));
  await expect(page.locator(island)).toHaveCount(0);
  expect(moduleRequests).toHaveLength(0);
  await page.getByRole('button', {name:'Toggle inert'}).click();
  await expect(page.locator(island)).toHaveCount(3);
  expect(moduleRequests).toHaveLength(1);
  await expect(page.locator('.katex-html')).toHaveCount(3);
  await expect(page.locator('.katex-html[aria-hidden="true"]')).toHaveCount(3);
});

test('selection defers an intersecting leaf and survives rendering elsewhere', async ({page}) => {
  await page.goto(baseUrl + fixtureUrl + '?hidden');
  await expect(leaves(page)).toHaveCount(3);
  await page.evaluate(() => {
    const select = (selector: string) => {
      const node = document.querySelector(selector);
      if (!node) throw new Error('Missing selection node');
      const range = document.createRange();
      range.selectNodeContents(node);
      const selection = document.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    };
    document.querySelector('section')?.removeAttribute('hidden');
    select('.markdown-math-source');
  });
  await expect(leaves(page).nth(1).locator(island)).toHaveCount(1);
  await expect(leaves(page).first().locator(island)).toHaveCount(0);
  expect(await page.evaluate(() => getSelection()?.toString())).toBe('$x+1$');
  await page.evaluate(() => {
    const prose = document.querySelector('#prose');
    if (!prose) throw new Error('Missing prose');
    getSelection()?.selectAllChildren(prose);
  });
  await expect(leaves(page).first().locator(island)).toHaveCount(1);
  expect(await page.evaluate(() => getSelection()?.toString())).toBe('Unrelated selectable prose.');
});

test('an accepted sibling retains its node across revision and source copy preserves CRLF', async ({page}) => {
  const copied: string[] = [];
  await page.exposeFunction('recordFormulaCopy', (text: string) => copied.push(text));
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value:{writeText: Reflect.get(window, 'recordFormulaCopy')},
    });
  });
  await page.goto(baseUrl + fixtureUrl);
  const sibling = leaves(page).nth(1).locator(island);
  await expect(sibling).toHaveCount(1);
  await sibling.evaluate(element => element.setAttribute('data-test-retained', 'true'));
  await expect(page.getByRole('region', {name:'Rendered formula'})).toBeVisible();
  await page.getByText('Formula source', {exact:true}).click();
  await page.getByRole('button', {name:'Copy formula source'}).click();
  expect(copied).toEqual(['$$\r\na^2\r\n$$']);
  await page.getByRole('button', {name:'Next revision'}).click();
  await expect(leaves(page).first().locator(island).locator('annotation')).toHaveText('y+2');
  await expect(sibling).toHaveAttribute('data-test-retained', 'true');
  await expect(page.getByText('Math display unavailable. Source shown.')).toBeVisible();
  await expect(page.getByRole('region', {name:'Rendered formula'})).toHaveCount(0);
});

test('removing an owner while its module loads cannot populate the replacement', async ({page}) => {
  let allowImport = () => {};
  const waitForImport = new Promise<void>(done => {allowImport = done;});
  await page.route('**/src/math-renderer.ts*', async route => {
    await waitForImport;
    await route.continue();
  });
  const requested = page.waitForRequest('**/src/math-renderer.ts*');
  await page.goto(baseUrl + fixtureUrl);
  await requested;
  await page.getByRole('button', {name:'Toggle leaves'}).click();
  await expect(leaves(page)).toHaveCount(0);
  await page.getByRole('button', {name:'Toggle inert'}).click();
  await page.getByRole('button', {name:'Change owner'}).click();
  await page.getByRole('button', {name:'Next revision'}).click();
  await page.getByRole('button', {name:'Toggle leaves'}).click();
  await expect(leaves(page)).toHaveCount(3);
  allowImport();
  await expect(leaves(page).first()).toHaveText('$y+2$');
  await expect(page.locator(island)).toHaveCount(0);
  await page.getByRole('button', {name:'Toggle inert'}).click();
  await expect(leaves(page).first().locator(island).locator('annotation')).toHaveText('y+2');
});

test('each frame accepts at most one leaf', async ({page}) => {
  await page.goto(baseUrl + fixtureUrl + '?hidden');
  await expect(leaves(page)).toHaveCount(3);
  const acceptedPerFrame = await page.evaluate(() => new Promise<number[]>(done => {
    const seen: number[] = [];
    let total = 0;
    function sample() {
      const next = document.querySelectorAll('[data-source-transformed="true"]').length;
      seen.push(next - total);
      total = next;
      if (total === 3) done(seen);
      else requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
    document.querySelector('section')?.removeAttribute('hidden');
  }));
  expect(acceptedPerFrame.filter(Boolean)).toEqual([1, 1, 1]);
});

test('one owner tears down its listener and observer after each of 100 disable cycles', async ({page}) => {
  await page.addInitScript(() => {
    const observers = new Set<MutationObserver>();
    const listeners = new Set<EventListenerOrEventListenerObject>();
    const NativeObserver = window.MutationObserver;
    window.MutationObserver = class extends NativeObserver {
      override observe(target: Node, options?: MutationObserverInit) {
        super.observe(target, options);
        if (options?.attributeFilter?.includes('aria-hidden')) observers.add(this);
      }
      override disconnect() {
        super.disconnect();
        observers.delete(this);
      }
    };
    const add = document.addEventListener.bind(document);
    const remove = document.removeEventListener.bind(document);
    document.addEventListener = (type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean) => {
      add(type, listener, options);
      if (type === 'visibilitychange') listeners.add(listener);
    };
    document.removeEventListener = (type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean) => {
      remove(type, listener, options);
      if (type === 'visibilitychange') listeners.delete(listener);
    };
    Object.defineProperty(window, 'ownerWatchCount', {
      value: () => [observers.size, listeners.size],
    });
  });
  await page.goto(baseUrl + fixtureUrl + '?hidden');
  await expect(leaves(page)).toHaveCount(3);
  const peak = await page.evaluate(async () => {
    const watchCount = (window as Window & {ownerWatchCount?: () => number[]}).ownerWatchCount;
    const toggle = Array.from(document.querySelectorAll('button')).find(button => button.textContent === 'Toggle rendering');
    if (!watchCount || !toggle) throw new Error('Missing lifecycle fixture controls');
    const nextFrame = () => new Promise<void>(done => requestAnimationFrame(() => done()));
    const active = watchCount();
    for (let cycle = 0; cycle < 100; cycle++) {
      toggle.click();
      await nextFrame();
      if (watchCount().some(Boolean)) throw new Error('Owner leaked after disable at cycle ' + cycle);
      toggle.click();
      await nextFrame();
      if (watchCount().join() !== active.join()) throw new Error('Owner grew at cycle ' + cycle);
    }
    return active;
  });
  expect(peak).toEqual([1, 1]);
  await expect(page.locator(island)).toHaveCount(0);
});
