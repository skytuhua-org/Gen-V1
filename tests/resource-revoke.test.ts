import {afterEach, expect, it, vi} from 'vitest';
import {mkdtempSync, mkdirSync, rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {Store} from '../packages/storage/store.ts';
import {Service} from '../packages/core/service.ts';
import type {RuntimeAdapter, RuntimeCallbacks, Thread} from '../packages/contracts/index.ts';

const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => { vi.restoreAllMocks(); for (const fn of cleanup.splice(0).reverse()) await fn(); });

async function setup() {
  const dir = mkdtempSync(join(tmpdir(), 'grant-revoke-')), store = new Store(join(dir, 'state'));
  let callbacks!: RuntimeCallbacks; void callbacks;
  const runtime: RuntimeAdapter = {configure: c => { callbacks = c; }, models: async () => [{id: 'test/model', name: 'Test', provider: 'test'}], start: async () => {}, followUp: async () => {}, cancel: async () => {}, compact: async () => {}, history: async () => [], dispose: async () => {}};
  const service = new Service(store, runtime); await service.recover();
  cleanup.push(async () => { await service.dispose(); store.close(); rmSync(dir, {recursive: true, force: true}); });
  const send = (type: string, payload: Record<string, unknown> = {}, threadId: string) => service.command({id: crypto.randomUUID(), type, payload, threadId});
  const thread = async () => (await service.command({id: crypto.randomUUID(), type: 'thread.create', payload: {}})).result as Thread;
  return {dir, store, service, send, thread};
}

it('revokes an existing grant owned by the command thread', async () => {
  const x = await setup(), thread = await x.thread(), path = join(x.dir, 'docs');
  mkdirSync(path);
  const grant = (await x.send('resource.grant', {path, kind: 'file'}, thread.id)).result as {id: string};
  const receipt = (await x.send('resource.revoke', {grantId: grant.id}, thread.id)).result as {revoked: boolean};
  expect(receipt.revoked).toBe(true);
  expect(x.store.get('resource', grant.id)).toBeNull();
});

it('rejects revoke for another thread\'s grant or an unknown id', async () => {
  const x = await setup(), owner = await x.thread(), other = await x.thread(), path = join(x.dir, 'docs');
  mkdirSync(path);
  const grant = (await x.send('resource.grant', {path, kind: 'file'}, owner.id)).result as {id: string};
  await expect(x.send('resource.revoke', {grantId: grant.id}, other.id)).rejects.toMatchObject({code: 'NOT_FOUND'});
  await expect(x.send('resource.revoke', {grantId: 'missing'}, owner.id)).rejects.toMatchObject({code: 'NOT_FOUND'});
  expect(x.store.get('resource', grant.id)).toMatchObject({id: grant.id});
});
