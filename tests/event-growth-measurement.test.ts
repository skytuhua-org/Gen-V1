import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { expect, it } from 'vitest';

const execute = promisify(execFile);

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
