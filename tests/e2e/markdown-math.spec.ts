import {expect, type Page} from '@playwright/test';
import {test} from './markdown-math-browser';

const math = (page: Page) => page.locator('.markdown [data-markdown-math]');
const source = (page: Page) => page.getByRole('textbox', {name:'Markdown source'});
const toggleMath = (page: Page) => page.getByRole('button', {name:'Toggle math'}).click();

test('math is off by default and independently follows explicit opt-in and syntactic closure', async ({page, mathFixture}) => {
  const requests: string[] = [];
  page.on('request', request => {
    if (/math-renderer|katex/i.test(request.url())) requests.push(request.url());
  });
  await page.goto(mathFixture + '?markdown');
  await source(page).fill(['Cost $5 and $10, `$x$` [math $x$](https://example.test)', String.raw`and \(a+b`].join('\n'));
  await expect(page.locator('.markdown')).toContainText(String.raw`\(a+b`);
  await expect(math(page)).toHaveCount(0);
  expect(requests).toHaveLength(0);
  await toggleMath(page);
  await expect(math(page)).toHaveCount(0);
  expect(requests).toHaveLength(0);
  await source(page).press('Control+End');
  await page.keyboard.insertText(String.raw`\)`);
  await expect(math(page).locator('annotation')).toHaveText('a+b');
  await expect(page.getByRole('link', {name:'math $x$'})).toHaveCount(1);
  await expect(page.locator('.markdown code')).toHaveText('$x$');
  await toggleMath(page);
  await expect(math(page)).toHaveCount(0);
  await expect(page.locator('.markdown')).toContainText(String.raw`\(a+b\)`);
});

test('closed formulas remain opaque in bold, headings and table cells', async ({page, mathFixture}) => {
  await page.goto(mathFixture + '?markdown');
  await source(page).fill([
    String.raw`# Area \(x\)`,
    '',
    String.raw`**Bold \(a ** b\)** and \(\text{a ** b}\)`,
    '',
    '| Left | Right |',
    '| --- | --- |',
    String.raw`| \(x|y\) | \(x\|y\) |`,
    '| $' + 'a'.repeat(4100) + '|b$ | final |',
  ].join('\n'));
  await toggleMath(page);
  await expect(page.locator('.markdown h1 [data-markdown-math]')).toHaveCount(1);
  await expect(page.locator('.markdown strong [data-markdown-math]')).toHaveCount(1);
  await expect(math(page)).toHaveCount(5);
  await expect(page.locator('.markdown tbody tr')).toHaveCount(2);
  await expect(page.locator('.markdown tbody tr').last().locator('td')).toHaveCount(2);
  await expect(page.locator('.markdown tbody tr').last().locator('td').first()).toContainText('|b$');
  await expect(page.locator('.markdown tbody tr').last().locator('td').last()).toHaveText('final');
});

test('the original document cap applies before work in any block', async ({page, mathFixture}) => {
  await page.goto(mathFixture + '?markdown');
  const requests: string[] = [];
  page.on('request', request => {
    if (/math-renderer|katex/i.test(request.url())) requests.push(request.url());
  });
  await toggleMath(page);
  const prefix = '$a$\n\n- $b$\n\n| cell |\n| --- |\n| $c$ |\n\n';
  const fill = (length: number) => prefix + (('prose row '.repeat(25) + '\n\n').repeat(410)).slice(0, length - prefix.length);
  await source(page).fill(fill(100001));
  await expect(page.locator('.markdown p').first()).toHaveText('$a$');
  await expect(math(page)).toHaveCount(0);
  expect(requests).toHaveLength(0);
  await source(page).fill(fill(100000));
  await expect(math(page)).toHaveCount(3);
  await source(page).fill(fill(99999));
  await expect(math(page)).toHaveCount(3);
});

test('display copy preserves the original CRLF delimiter span', async ({page, mathFixture}) => {
  const copied: string[] = [];
  await page.exposeFunction('recordFormulaCopy', (text: string) => copied.push(text));
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', {
    value:{writeText: Reflect.get(window, 'recordFormulaCopy')},
  }));
  await page.goto(mathFixture + '?markdown');
  await page.getByRole('button', {name:'Set CRLF formula'}).click();
  await toggleMath(page);
  await expect(math(page).locator('annotation')).toHaveText('a^2');
  await page.getByText('Formula source', {exact:true}).click();
  await page.getByRole('button', {name:'Copy formula source'}).click();
  expect(copied).toEqual(['$$\r\na^2\r\n$$']);
});

test('a nested list consumes the shared admission budget in original source order', async ({page, mathFixture}) => {
  await page.goto(mathFixture + '?markdown');
  const earlier = Array.from({length:63}, (_, index) => '$x_' + index + '$').join('\n\n');
  await source(page).fill(earlier + '\n\n- parent $p$\n  - child $c$');
  await toggleMath(page);
  await expect(math(page)).toHaveCount(64);
  await expect(page.locator('.markdown li').first().locator('[data-markdown-math]')).toHaveCount(1);
  await expect(page.locator('.markdown li li')).toHaveText('child $c$');
});

test('changing the supplied owner invalidates pending math without changing the source', async ({page, mathFixture}) => {
  let release = () => {};
  const ready = new Promise<void>(resolve => {release = resolve;});
  await page.route('**/src/math-renderer.ts*', async route => {
    await ready;
    await route.continue();
  });
  await page.goto(mathFixture + '?markdown');
  const request = page.waitForRequest('**/src/math-renderer.ts*');
  await source(page).fill('Keep $z$ here.');
  await toggleMath(page);
  await request;
  await page.getByRole('button', {name:'Change owner'}).click();
  await expect(page.locator('.markdown')).toHaveText('Keep $z$ here.');
  release();
  await expect(math(page).locator('annotation')).toHaveText('z');
  await expect(math(page)).toHaveCount(1);
});
