import { afterEach, expect, it } from 'vitest';
import { mkdtemp, mkdir, writeFile, realpath, lstat, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { randomUUID } from 'node:crypto';
import { Store } from '../packages/storage/store.ts';
import { Service } from '../packages/core/service.ts';
import type { RuntimeAdapter, ResourceGrant, Thread } from '../packages/contracts/index.ts';

const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => { for (const cleanup of cleanups.splice(0)) await cleanup(); });
it('revokes a grant, returns the remaining list and rejects foreign or unknown grants', async () => {
  const root = await mkdtemp(join(tmpdir(), 'harness-revoke-')), store = new Store(root);
  const runtime: RuntimeAdapter = { configure() {}, models: async () => [], start: async () => {}, followUp: async () => {}, cancel: async () => {}, compact: async () => {}, history: async () => [], dispose: async () => {} };
  const service = new Service(store, runtime);
  cleanups.push(async () => { await service.dispose(); store.close(); if (await realpath(root) !== resolve(root) || !resolve(root).startsWith(await realpath(tmpdir()) + sep) || (await lstat(root)).isSymbolicLink()) throw Error('Unsafe fixture cleanup'); await rm(root, { recursive: true, force: true }); });
  const thread = (await service.command({ id: randomUUID(), type: 'thread.create', payload: {} })).result as Thread;
  const other = (await service.command({ id: randomUUID(), type: 'thread.create', payload: {} })).result as Thread;
  await mkdir(join(root, 'files')); const fileA = join(root, 'files', 'a.txt'), fileB = join(root, 'files', 'b.txt');
  await writeFile(fileA, 'A'); await writeFile(fileB, 'B');
  const grantA = (await service.command({ id: randomUUID(), type: 'resource.grant', threadId: thread.id, payload: { kind: 'file', path: fileA, writable: false } })).result as ResourceGrant;
  const grantB = (await service.command({ id: randomUUID(), type: 'resource.grant', threadId: thread.id, payload: { kind: 'file', path: fileB, writable: false } })).result as ResourceGrant;
  const grantOther = (await service.command({ id: randomUUID(), type: 'resource.grant', threadId: other.id, payload: { kind: 'file', path: fileA, writable: false } })).result as ResourceGrant;
  const remaining = (await service.command({ id: randomUUID(), type: 'resource.revoke', threadId: thread.id, payload: { grantId: grantA.id } })).result as ResourceGrant[];
  expect(remaining.map(grant => grant.id)).toEqual([grantB.id]);
  await expect(service.command({ id: randomUUID(), type: 'resource.revoke', threadId: thread.id, payload: { grantId: grantOther.id } })).rejects.toMatchObject({ code: 'NOT_FOUND' });
  await expect(service.command({ id: randomUUID(), type: 'resource.revoke', threadId: thread.id, payload: { grantId: 'missing-grant' } })).rejects.toMatchObject({ code: 'NOT_FOUND' });
});
