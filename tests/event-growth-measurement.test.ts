import { execFile } from 'node:child_process';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { expect, it } from 'vitest';

const execute = promisify(execFile);

it('closes the owned SQLite store before cleaning up a failed measurement', async () => {
  const scratch = await mkdtemp(join(tmpdir(), 'event-growth-test-'));
  try {
    const source = `
      import { existsSync } from 'node:fs';
      import { join } from 'node:path';
      import { Store } from './packages/storage/store.ts';
      const close = Store.prototype.close;
      Store.prototype.close = function () {
        if (existsSync(join(this.dataDir, 'harness.sqlite'))) process.stderr.write('owned SQLite closed\\n');
        return close.call(this);
      };
      Store.prototype.snapshot = () => { throw Error('injected measurement failure'); };
      process.argv.splice(1, 0, 'scripts/measure-event-growth.ts');
      await import('./scripts/measure-event-growth.ts');
    `;
    await expect(execute(process.execPath, [
      '--import', 'tsx', '--input-type=module', '--eval', source, '--', '12',
    ], { encoding: 'utf8', timeout: 15_000, windowsHide: true, env: { ...process.env, TMPDIR: scratch, TEMP: scratch, TMP: scratch } })).rejects.toMatchObject({
      code: 1, stdout: '', stderr: expect.stringMatching(/owned SQLite closed[\s\S]*injected measurement failure/),
    });
    expect((await readdir(scratch)).filter(name => name.startsWith('gen-growth-'))).toEqual([]);
  } finally { await rm(scratch, { recursive: true, force: true }); }
}, 20_000);

it('measures the compacted event database after vacuumed pages are checkpointed', async () => {
  const { stdout } = await execute(process.execPath, [
    '--import', 'tsx', 'scripts/measure-event-growth.ts', '10000', '--sweep=1000',
  ], { encoding: 'utf8', timeout: 20_000, windowsHide: true });
  const result = JSON.parse(stdout) as {
    counts: { events: number }; bytes: number;
    swept: { counts: { events: number }; bytes: number };
  };
  expect(result.counts.events).toBe(10_000);
  expect(result.swept.counts.events).toBe(1001); // kept events plus sweep audit event
  expect(result.swept.bytes).toBeGreaterThan(0);
  expect(result.swept.bytes).toBeLessThan(result.bytes);
}, 25_000);

it.each([
  [['7', 'typo'], /invalid event count/i],
  [['7', '--swep=2'], /unknown option/i],
  [['7', '--sweep=2', '--sweep=3'], /only be specified once/i],
])('rejects invalid benchmark arguments %j before emitting any evidence', async (args, message) => {
  await expect(execute(process.execPath, [
    '--import', 'tsx', 'scripts/measure-event-growth.ts', ...args,
  ], { encoding: 'utf8', timeout: 15_000, windowsHide: true })).rejects.toMatchObject({
    code: 1, stdout: '', stderr: expect.stringMatching(message),
  });
}, 20_000);

it('preserves the order of multiple valid sizes and one sweep option', async () => {
  const { stdout } = await execute(process.execPath, [
    '--import', 'tsx', 'scripts/measure-event-growth.ts', '9', '--sweep=3', '7',
  ], { encoding: 'utf8', timeout: 15_000, windowsHide: true });
  const results = stdout.trim().split(/\r?\n/).map(line => JSON.parse(line));
  expect(results.map(result => result.counts.events)).toEqual([9, 7]);
  expect(results.map(result => result.swept.counts.events)).toEqual([4, 4]);
}, 20_000);
