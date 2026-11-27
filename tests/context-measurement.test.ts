import { execFile } from 'node:child_process';
import { copyFile, mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { expect, it } from 'vitest';

const execute = promisify(execFile);
const script = resolve('scripts/measure-context-efficiency.ts');
const loader = pathToFileURL(resolve('node_modules/tsx/dist/loader.mjs')).href;
const receiver = resolve('dist/widget-runtime/receiver.js');
const baseline = 'dist/desktop-release-0.2.0/win-unpacked/resources/host/dist/web';
async function fixture() {
  const directory = await mkdtemp(join(tmpdir(), 'harness-measure-cli-'));
  await mkdir(join(directory, 'dist/widget-runtime'), { recursive: true });
  await copyFile(receiver, join(directory, 'dist/widget-runtime/receiver.js'));
  for (const root of [baseline, 'dist/web']) {
    await mkdir(join(directory, root, 'assets'), { recursive: true });
    await writeFile(join(directory, root, 'assets/index-a-stale.js'), '// stale');
    await writeFile(join(directory, root, 'assets/index-z-current.js'), root === baseline ? 'baseline'.repeat(20) : 'current'.repeat(10));
    await writeFile(join(directory, root, 'index.html'), '<script type="module" crossorigin src="/assets/index-z-current.js"></script>');
  }
  await mkdir(join(directory, 'docs/evidence/t3-centered-workspace-20261031'), { recursive: true });
  await writeFile(join(directory, 'docs/evidence/t3-centered-workspace-20261031/efficiency.json'), 'preserved historical receipt');
  return directory;
}
async function cleanup(directory: string) {
  if (dirname(directory) !== resolve(tmpdir()) || !basename(directory).startsWith('harness-measure-cli-')) throw new Error('Refusing cleanup outside the owned fixture.');
  await rm(directory, { recursive: true, force: true });
}
const run = (directory: string, output?: string) => execute(process.execPath, ['--import', loader, script, ...(output ? [output] : [])], { cwd: directory, encoding: 'utf8', timeout: 60_000 });

it('measures the HTML-referenced entry rather than a retained older bundle', async () => {
  const directory = await fixture();
  try {
    const { stdout } = await run(directory);
    const result = JSON.parse(stdout);
    expect(result.bundle.before).toMatchObject({ filename: 'index-z-current.js', bytes: 160 });
    expect(result.bundle.after).toMatchObject({ filename: 'index-z-current.js', bytes: 70 });
  } finally { await cleanup(directory); }
});

it.each(['open', 'close'])('removes only owned measurement scratch on Store %s failure', async phase => {
  const directory = await fixture(), output = join(directory, 'failed-output'), scratch = join(directory, 'scratch');
  try {
    await mkdir(scratch);
    await writeFile(join(scratch, 'keep'), 'not owned by the CLI');
    const store = pathToFileURL(resolve('packages/storage/store.ts')).href;
    const stub = phase === 'open' ? 'export class Store { constructor() { throw Error("injected Store open failure"); } }'
      : `import { Store as RealStore } from ${JSON.stringify(store)}; export class Store extends RealStore { close() { super.close(); throw Error("injected Store close failure"); } }`;
    const source = `
      import { registerHooks } from 'node:module';
      const script = ${JSON.stringify(pathToFileURL(script).href)};
      registerHooks({ resolve(specifier, context, next) {
        if (context.parentURL === script && specifier === '../packages/storage/store.ts') {
          return { shortCircuit: true, url: 'data:text/javascript,' + encodeURIComponent(${JSON.stringify(stub)}) };
        }
        return next(specifier, context);
      } });
      process.argv.splice(1, 0, script);
      await import(script);
    `;
    await expect(execute(process.execPath, ['--import', loader, '--input-type=module', '--eval', source, '--', output], {
      cwd: directory, encoding: 'utf8', timeout: 15_000, env: { ...process.env, TMPDIR: scratch, TEMP: scratch, TMP: scratch },
    })).rejects.toMatchObject({ code: 1, stdout: '', stderr: expect.stringContaining('injected Store ' + phase + ' failure') });
    expect((await readdir(scratch)).filter(name => name.startsWith('harness-context-measure-'))).toEqual([]);
    expect(await readFile(join(scratch, 'keep'), 'utf8')).toBe('not owned by the CLI');
    await expect(readFile(join(output, 'efficiency.json'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
  } finally { await cleanup(directory); }
}, 20_000);

it('writes a new requested receipt without replacing historical or existing output', async () => {
  const directory = await fixture(), output = join(directory, 'fresh-output');
  try {
    await run(directory, output);
    expect(await readFile(join(directory, 'docs/evidence/t3-centered-workspace-20261031/efficiency.json'), 'utf8')).toBe('preserved historical receipt');
    const path = join(output, 'efficiency.json'), first = await readFile(path, 'utf8');
    expect(JSON.parse(first).bundle.after.filename).toBe('index-z-current.js');
    await expect(run(directory, output)).rejects.toThrow();
    expect(await readFile(path, 'utf8')).toBe(first);
  } finally { await cleanup(directory); }
});
