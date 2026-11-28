import {expect, type Page} from '@playwright/test';
import {test} from './markdown-math-browser';

const island = '[data-source-transformed="true"]';
const leaves = (page: Page) => page.locator('[data-markdown-math]');

test('a cold import leaves original text visible and accepts only the current revision', async ({page, mathFixture}) => {
  let allowImport = () => {};
  const waitForImport = new Promise<void>(done => {allowImport = done;});
  await page.route('**/src/math-renderer.ts*', async route => {
    await waitForImport;
    await route.continue();
  });
  const requested = page.waitForRequest('**/src/math-renderer.ts*');
  await page.goto(mathFixture);
  await requested;
  await expect(leaves(page).first()).toHaveText('$x+1$');
  await page.getByRole('button', {name:'Next revision'}).click();
  await expect(leaves(page).first()).toHaveText('$y+2$');
  allowImport();
  await expect(leaves(page).first().locator(island).locator('annotation')).toHaveText('y+2');
  await expect(page.getByText('Math display unavailable. Source shown.')).toBeVisible();
});

test('hidden and inert leaves keep source until the owner becomes eligible', async ({page, mathFixture}) => {
  const moduleRequests: string[] = [];
  page.on('request', request => {
    if (new URL(request.url()).pathname.endsWith('/math-renderer.ts')) moduleRequests.push(request.url());
  });
  await page.goto(mathFixture + '?hidden');
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

test('selection defers an intersecting leaf and survives rendering elsewhere', async ({page, mathFixture}) => {
  await page.goto(mathFixture + '?hidden');
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

test('an accepted sibling retains its node across revision and source copy preserves CRLF', async ({page, mathFixture}) => {
  const copied: string[] = [];
  await page.exposeFunction('recordFormulaCopy', (text: string) => copied.push(text));
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value:{writeText: Reflect.get(window, 'recordFormulaCopy')},
    });
  });
  await page.goto(mathFixture);
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

test('removing an owner while its module loads cannot populate the replacement', async ({page, mathFixture}) => {
  let allowImport = () => {};
  const waitForImport = new Promise<void>(done => {allowImport = done;});
  await page.route('**/src/math-renderer.ts*', async route => {
    await waitForImport;
    await route.continue();
  });
  const requested = page.waitForRequest('**/src/math-renderer.ts*');
  await page.goto(mathFixture);
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

test('each frame accepts at most one leaf', async ({page, mathFixture}) => {
  await page.goto(mathFixture + '?hidden');
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

test('one owner tears down its listener and observer after each of 100 disable cycles', async ({page, mathFixture}) => {
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
  await page.goto(mathFixture + '?hidden');
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
