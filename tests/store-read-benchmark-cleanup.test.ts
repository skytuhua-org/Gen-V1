import * as fs from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it, vi } from 'vitest';

vi.mock('node:fs/promises', async original => ({ ...await original<typeof import('node:fs/promises')>() }));

it.each(['seed', 'measure'] as const)('closes and removes the owned fixture after a %s failure', async phase => {
  vi.resetModules();
  const { Store } = await import('../packages/storage/store.ts');
  const parent = await fs.mkdtemp(join(tmpdir(), 'store-read-bench-test-'));
  const original = fs.mkdtemp;
  const fixture = vi.spyOn(fs, 'mkdtemp').mockImplementation(() => original(join(parent, 'owned-')));
  const close = vi.spyOn(Store.prototype, 'close');
  const failure = new Error('Synthetic benchmark ' + phase + ' failed.');
  const inject = phase === 'seed'
    ? vi.spyOn(Store.prototype, 'internal').mockImplementationOnce(() => { throw failure; })
    : vi.spyOn(Store.prototype, 'snapshot').mockImplementationOnce(() => { throw failure; });
  try {
    await expect(import('../scripts/store-read-benchmark.ts')).rejects.toBe(failure);
    expect(fixture).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();
    expect(await fs.readdir(parent)).toEqual([]);
  } finally {
    const unclosed = close.mock.calls.length ? undefined : inject.mock.instances[0];
    inject.mockRestore(); close.mockRestore(); fixture.mockRestore();
    if (unclosed instanceof Store) unclosed.close();
    await fs.rm(parent, { recursive: true, force: true });
  }
});
