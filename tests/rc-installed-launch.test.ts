import { spawn, type ChildProcess } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { afterEach, expect, it, vi } from 'vitest';
import { installedSession } from '../scripts/rc-review/installed-session.ts';

vi.mock('node:child_process', { spy: true });
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

it('reports a signal-terminated launch without polling its CDP endpoint', async () => {
  // Hosted test jobs set HARNESS_HERMES_PYTHON; this isn't a real-profile launch.
  for (const key of Object.keys(process.env)) if (/^HARNESS_/i.test(key)) vi.stubEnv(key, undefined);
  const child = Object.assign(new EventEmitter(), { exitCode: null as number | null, signalCode: 'SIGTERM' });
  vi.mocked(spawn).mockReturnValueOnce(child as unknown as ChildProcess);
  const fetchProbe = vi.fn(async () => {
    // The numeric exit makes a regression finish on the next poll, instead of
    // spending a minute in the production timeout after an incorrect probe.
    child.exitCode = 1;
    return new Response(null, { status: 503 });
  });
  vi.stubGlobal('fetch', fetchProbe);

  await expect(installedSession('synthetic-launch.exe', async () => { throw Error('Unexpected launch'); }))
    .rejects.toThrow('Installed app exited before CDP.');
  expect(fetchProbe).not.toHaveBeenCalled();
});
