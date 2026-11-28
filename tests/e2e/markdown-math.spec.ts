import {expect, type Page} from '@playwright/test';
import {test} from './markdown-math-browser';
import {HOST_URL, test as productionTest} from '../host-fixture';
import {mathTrialDefault, mathTrialReply, serveTaskFixture, serveTaskMathCanvas, taskMathFixture} from './task-interface-fixture';

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

const appSurface = (page: Page) => ({
  reply:page.locator('.conversation-scroll [data-message-id="reply"] .message-content'),
  artifact:page.locator('[data-artifact-id="task-surface"]'),
  user:page.locator('.conversation-scroll [data-message-id="user-literal"] .markdown'),
  canvas:page.locator('.canvas-thread-transcript'),
});

test('actual App main and registered artifact keep canonical copy and excluded consumers literal', async ({page}) => {
  const snapshot = taskMathFixture();
  await serveTaskFixture(page,snapshot);
  const copied: string[] = [];
  await page.exposeFunction('recordFormulaCopy', (text: string) => copied.push(text));
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', {
    value:{writeText:Reflect.get(window,'recordFormulaCopy')},
  }));
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  const {reply,artifact,user} = appSurface(page);
  await expect(reply).toContainText('in this reply.');
  await expect(artifact).toContainText('in this artifact.');
  await expect(user).toHaveText(mathTrialDefault);
  await expect(artifact.locator('.document .markdown')).toHaveText(mathTrialDefault);
  await reply.getByRole('button', {name:'Copy message'}).click();
  expect(copied).toEqual([mathTrialReply]);

  if (process.env.GEN_MATH_CONTROL === '1') {
    await expect(reply.locator('math')).toHaveCount(0);
    await expect(artifact.locator('math')).toHaveCount(0);
    await expect(reply).toContainText(String.raw`\frac{a}{b}`);
    await expect(artifact).toContainText(String.raw`\begin{matrix}`);
  } else {
    await expect(reply.locator('annotation')).toHaveText([String.raw`\frac{a}{b}`, String.raw`\sum_{i=1}^n i`]);
    await expect(artifact.locator('annotation')).toHaveText([String.raw`\begin{matrix}a&b\\c&d\end{matrix}`]);
    await reply.getByText('Formula source', {exact:true}).click();
    await reply.getByRole('button', {name:'Copy formula source'}).click();
    expect(copied[1]).toBe('$$\r\n\\sum_{i=1}^n i\r\n$$');
  }
  if (process.env.GEN_MATH_CAPTURE) await page.screenshot({path:process.env.GEN_MATH_CAPTURE + '-main.png'});
});

test('actual App currency, code, links, a user message and Document load no math assets', async ({page}) => {
  const requests: string[] = [];
  page.on('request', request => { if (/math-renderer|katex/i.test(request.url())) requests.push(request.url()); });
  await serveTaskFixture(page,taskMathFixture({formulas:false}));
  await page.goto('/');
  const {reply,artifact,user} = appSurface(page);
  await expect(reply).toContainText('Price $5 and $10.');
  await expect(reply.locator('code')).toHaveText('$code$');
  await expect(reply.getByRole('link', {name:'Literal $link$'})).toBeVisible();
  await expect(artifact.locator('.document .markdown')).toHaveText(mathTrialDefault);
  await expect(user).toHaveText(mathTrialDefault);
  await expect(page.locator('[data-markdown-math]')).toHaveCount(0);
  expect(requests).toHaveLength(0);
});

test('actual App retained canvas renders assistant formulas and keeps user Markdown literal', async ({page}) => {
  await serveTaskMathCanvas(page,taskMathFixture());
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  const {canvas} = appSurface(page);
  const assistant = canvas.locator('[data-message-id="reply"] .markdown');
  await expect(assistant).toContainText('in this reply.');
  await expect(canvas.locator('[data-message-id="user-literal"] .markdown')).toHaveText(mathTrialDefault);
  if (process.env.GEN_MATH_CONTROL === '1') {
    await expect(assistant.locator('math')).toHaveCount(0);
    await expect(assistant).toContainText(String.raw`\frac{a}{b}`);
  } else {
    await expect(assistant.locator('annotation')).toHaveText([String.raw`\frac{a}{b}`, String.raw`\sum_{i=1}^n i`]);
  }
  if (process.env.GEN_MATH_CAPTURE) await page.screenshot({path:process.env.GEN_MATH_CAPTURE + '-canvas.png'});
});

test('actual App admits a newly closed formula while the run remains active', async ({page}) => {
  const snapshot = taskMathFixture({formulas:false});
  snapshot.threads[0]!.status = 'working';
  snapshot.threads[0]!.runId = 'math-stream';
  const message = snapshot.messages.find(item => item.id === 'reply')!;
  message.runId = 'math-stream';
  message.content = String.raw`Streaming \(x+1`;
  const host = await serveTaskFixture(page,snapshot);
  await page.goto('/');
  const {reply} = appSurface(page);
  await expect(reply.locator('.markdown')).toHaveText(message.content);
  await expect(reply.locator('[data-markdown-math]')).toHaveCount(0);
  message.content += String.raw`\)`;
  await host.publish();
  await expect(reply.locator('annotation')).toHaveText('x+1');
  await expect(page.getByRole('button', {name:'Stop agent', exact:true})).toBeVisible();
});

test('actual App drops delayed work on thread and artifact revisions and preserves surrounding selection', async ({page}) => {
  const snapshot = taskMathFixture();
  const message = snapshot.messages.find(item => item.id === 'reply')!;
  message.content = 'A selectable paragraph.\n\n$old$';
  const artifact = snapshot.artifacts[0]!;
  artifact.spec!.elements.formula!.props.text = '$prior$';
  const host = await serveTaskFixture(page,snapshot);
  let release = () => {};
  const untilReleased = new Promise<void>(done => {release = done;});
  await page.route('**/src/math-renderer.ts*', async route => {
    await untilReleased;
    await route.continue();
  });
  const requested = page.waitForRequest('**/src/math-renderer.ts*');
  await page.goto('/');
  const surfaces = appSurface(page);
  await requested;
  await expect(surfaces.reply.locator('.markdown')).toContainText('$old$');

  snapshot.threads[0]!.epoch++;
  message.content = 'A selectable paragraph.\n\n$new$';
  artifact.revision++;
  artifact.spec!.elements.formula!.props.text = '$current$';
  await host.publish();
  await expect(surfaces.reply.locator('.markdown')).toContainText('$new$');
  await expect(surfaces.artifact.locator('[data-markdown-math]')).toHaveText('$current$');
  await surfaces.reply.locator('.markdown p').first().evaluate(paragraph => {
    paragraph.ownerDocument.getSelection()?.selectAllChildren(paragraph);
  });
  release();
  await expect(surfaces.reply.locator('annotation')).toHaveText('new');
  await expect(surfaces.artifact.locator('annotation')).toHaveText('current');
  expect(await page.evaluate(() => getSelection()?.toString())).toBe('A selectable paragraph.');
});

test('actual App held canvas keeps pending formulas in source until Settings closes', async ({page}) => {
  await serveTaskMathCanvas(page,taskMathFixture());
  let release = () => {};
  const untilReleased = new Promise<void>(done => {release = done;});
  await page.route('**/src/math-renderer.ts*', async route => {
    await untilReleased;
    await route.continue();
  });
  const requested = page.waitForRequest('**/src/math-renderer.ts*');
  await page.goto('/');
  await requested;
  const {canvas} = appSurface(page);
  const assistant = canvas.locator('[data-message-id="reply"] .markdown');
  await page.getByRole('button', {name:'Settings', exact:true}).click();
  await expect(page.getByRole('dialog', {name:'Settings'})).toBeVisible();
  await expect(assistant.locator('[data-markdown-math]')).toHaveCount(0);
  await expect(assistant).toContainText(String.raw`\frac{a}{b}`);
  release();
  await page.getByRole('button', {name:'Close dialog'}).click();
  await expect(assistant.locator('annotation')).toHaveText([String.raw`\frac{a}{b}`, String.raw`\sum_{i=1}^n i`]);
});

const mathAsset = /\/assets\/(?:math-renderer-[^/]+\.(?:js|css)|KaTeX_[^/]+\.(?:woff2?|ttf))$/i;

async function productionRequests(page: Page) {
  const requests: string[] = [];
  const assets: {path: string; status: number}[] = [];
  const external: string[] = [];
  const policyViolations: string[] = [];
  await page.exposeFunction('recordMathPolicyViolation', (directive: string) => policyViolations.push(directive));
  await page.addInitScript(() => document.addEventListener('securitypolicyviolation', event => {
    const report = Reflect.get(window,'recordMathPolicyViolation') as (directive: string) => Promise<void>;
    void report(event.violatedDirective);
  }));
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== HOST_URL) {
      external.push(url.origin);
      return route.abort('blockedbyclient');
    }
    return route.fallback();
  });
  page.on('request', request => {
    const path = new URL(request.url()).pathname;
    if (mathAsset.test(path)) requests.push(path);
  });
  page.on('response', response => {
    const path = new URL(response.url()).pathname;
    if (mathAsset.test(path)) assets.push({path,status:response.status()});
  });
  return {requests,assets,external,policyViolations};
}

productionTest.describe('production math assets', () => {
  for (const view of ['main and artifact', 'retained Canvas'] as const) {
    productionTest(`load local JS, CSS and fonts in the ${view} under the existing CSP`, async ({page,host}, info) => {
      expect(host.snapshot()).toBeDefined();
      const observed = await productionRequests(page);
      if (view === 'retained Canvas') await serveTaskMathCanvas(page,taskMathFixture());
      else await serveTaskFixture(page,taskMathFixture());
      const response = await page.goto(HOST_URL);
      const csp = response?.headers()['content-security-policy'];
      expect(csp).toContain("object-src 'none'");
      const {reply,artifact,canvas} = appSurface(page);
      if (view === 'retained Canvas') {
        await expect(canvas.locator('[data-message-id="reply"] annotation')).toHaveCount(2);
      } else {
        await expect(reply.locator('annotation')).toHaveCount(2);
        await expect(artifact.locator('annotation')).toHaveCount(1);
      }
      const fonts = await page.evaluate(async () => {
        await document.fonts.ready;
        return Array.from(document.fonts)
          .filter(font => font.family.startsWith('KaTeX_') && font.status === 'loaded')
          .map(font => font.family).sort();
      });
      expect(fonts).toContain('KaTeX_Main');
      for (const extension of [/\.js$/, /\.css$/, /\.woff2$/]) {
        expect(observed.assets.some(({path,status}) => extension.test(path) && status === 200)).toBe(true);
      }
      expect(observed.assets.every(({status}) => status === 200)).toBe(true);
      expect(observed.external).toEqual([]);
      expect(observed.policyViolations).toEqual([]);
      await info.attach('production-assets.json', {body:JSON.stringify({view,csp,fonts,...observed},null,2),contentType:'application/json'});
    });
  }

  productionTest('default-off, currency and code issue zero production math requests', async ({page,host}) => {
    expect(host.snapshot()).toBeDefined();
    const observed = await productionRequests(page);
    await serveTaskFixture(page,taskMathFixture({formulas:false}));
    await page.goto(HOST_URL);
    const {reply,artifact,user} = appSurface(page);
    await expect(reply.locator('code')).toHaveText('$code$');
    await expect(artifact.locator('.document .markdown')).toHaveText(mathTrialDefault);
    await expect(user).toHaveText(mathTrialDefault);
    await expect(page.locator('[data-markdown-math]')).toHaveCount(0);
    expect(observed.requests).toEqual([]);
    expect(observed.external).toEqual([]);
  });

  productionTest('a blocked production stylesheet preserves literal source and fails closed', async ({page,host}) => {
    expect(host.snapshot()).toBeDefined();
    await productionRequests(page);
    await page.route('**/assets/math-renderer-*.css', route => route.abort('blockedbyclient'));
    await serveTaskFixture(page,taskMathFixture());
    await page.goto(HOST_URL);
    const {reply} = appSurface(page);
    await expect(reply.getByText('Math display unavailable. Source shown.')).toBeVisible();
    await expect(reply.locator('annotation')).toHaveCount(0);
    await expect(reply).toContainText(String.raw`\frac{a}{b}`);
  });

  for (const mode of ['cold', 'warm'] as const) {
    productionTest(`measure five ${mode} input runs during 64 formulas`, async ({browser,host}, info) => {
      productionTest.skip(process.env.GEN_MATH_MEASURE !== '1','Explicit production timing evidence run.');
      productionTest.setTimeout(120000);
      expect(host.snapshot()).toBeDefined();
      const control = process.env.GEN_MATH_CONTROL === '1';
      const corpus = Array.from({length:64},(_, index) => 'Formula ' + (index + 1) + ' ' +
        String.raw`\(\frac{a_{${index}} + b}{c + 1}\)`).join('\n\n');
      const runs = [];
      for (let repeat = 0; repeat < 5; repeat++) {
        const page = await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
        try {
          const observed = await productionRequests(page);
          const snapshot = taskMathFixture({formulas:false});
          const reply = snapshot.messages.find(message => message.id === 'reply')!;
          if (mode === 'warm') reply.content = String.raw`Warm \(x+1\)`;
          const app = await serveTaskFixture(page,snapshot);
          await page.goto(HOST_URL);
          const surface = appSurface(page).reply;
          await expect(surface).toBeVisible();
          if (mode === 'warm' && !control) {
            await expect(surface.locator('annotation')).toHaveText('x+1');
            await page.evaluate(() => document.fonts.ready.then(() => undefined));
          }
          await page.evaluate(() => {
            const sample = {inputMs:[] as number[], longTasks:[] as number[]};
            Object.defineProperty(window, 'formulaPerformanceSample', {value:sample});
            const observer = new PerformanceObserver(entries => {
              for (const entry of entries.getEntries()) sample.longTasks.push(entry.duration);
            });
            observer.observe({type:'longtask'});
            document.addEventListener('input', event => {
              requestAnimationFrame(() => setTimeout(() => sample.inputMs.push(performance.now() - event.timeStamp),0));
            }, {once:true, capture:true});
          });
          reply.content = corpus;
          await app.publish();
          await expect(surface.locator('.markdown p').last()).toContainText('Formula 64');
          const draft = page.getByRole('textbox',{name:'Message',exact:true});
          await draft.press('a');
          await expect(draft).toHaveValue('a');
          await page.waitForFunction(() => Reflect.get(window,'formulaPerformanceSample').inputMs.length === 1);
          await expect(surface.locator('annotation')).toHaveCount(control ? 0 : 64);
          const timing = await page.evaluate(() => Reflect.get(window,'formulaPerformanceSample') as {inputMs:number[];longTasks:number[]});
          runs.push({repeat:repeat + 1,...timing,mathRequests:observed.requests.length});
        } finally {
          await page.close();
        }
      }
      const result = {mode,control,runs};
      console.log('MATH_TIMING ' + JSON.stringify(result));
      await info.attach('math-timing.json',{body:JSON.stringify(result,null,2),contentType:'application/json'});
    });
  }
});
