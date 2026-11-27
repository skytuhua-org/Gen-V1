import { afterEach, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { Store } from '../packages/storage/store.ts';
import { Service } from '../packages/core/service.ts';
import type { RuntimeAdapter, Thread, ResourceGrant } from '../packages/contracts/index.ts';

const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => { for (const fn of cleanup.splice(0).reverse()) await fn(); });

async function setup() {
  const dir = mkdtempSync(join(tmpdir(), 'harness-revoke-'));
  const store = new Store(join(dir, 'state'));
  const runtime: RuntimeAdapter = { configure: () => {}, models: async () => [{ id: 'test/model', name: 'Test', provider: 'test' }], start: async () => {}, followUp: async () => {}, cancel: async () => {}, compact: async () => {}, history: async () => [], dispose: async () => {} };
  const service = new Service(store, runtime); await service.recover();
  cleanup.push(async () => { await service.dispose(); store.close(); rmSync(dir, { recursive: true, force: true }); });
  const thread = (await service.command({ id: crypto.randomUUID(), type: 'thread.create', payload: {} })).result as Thread;
  const send = (type: string, payload: Record<string, unknown> = {}, threadId = thread.id) => service.command({ id: crypto.randomUUID(), type, payload, threadId });
  return { dir, store, service, thread, send };
}

it('revokes a granted resource and removes it from the thread', async () => {
  const x = await setup(), file = join(x.dir, 'doc.txt');
  writeFileSync(file, 'fixture');
  const grant = (await x.send('resource.grant', { path: file, kind: 'file' })).result as ResourceGrant;
  expect(x.store.all<ResourceGrant>('resource', x.thread.id)).toHaveLength(1);
  const receipt = await x.send('resource.revoke', { resourceId: grant.id });
  expect(receipt.result).toEqual({ removed: grant.id });
  expect(x.store.all<ResourceGrant>('resource', x.thread.id)).toHaveLength(0);
});

it('rejects revoking a grant owned by another thread or an unknown id', async () => {
  const x = await setup(), file = join(x.dir, 'doc.txt');
  writeFileSync(file, 'fixture');
  const grant = (await x.send('resource.grant', { path: file, kind: 'file' })).result as ResourceGrant;
  const other = (await x.service.command({ id: crypto.randomUUID(), type: 'thread.create', payload: {} })).result as Thread;
  await expect(x.send('resource.revoke', { resourceId: grant.id }, other.id)).rejects.toMatchObject({ code: 'CAPABILITY_DENIED' });
  await expect(x.send('resource.revoke', { resourceId: crypto.randomUUID() })).rejects.toMatchObject({ code: 'CAPABILITY_DENIED' });
  expect(x.store.all<ResourceGrant>('resource', x.thread.id)).toHaveLength(1);
});

it('removes a generated attachment from the composer while preserving its artifact grant', async () => {
  const x = await setup();
  x.store.internal('fixture.artifact', x.thread.id, () => {
    x.store.put('artifact', 'signature-source', x.thread.id, {
      id: 'signature-source', threadId: x.thread.id, title: 'Component catalog', lifecycle: 'active',
    });
  });
  const other = (await x.service.command({ id: crypto.randomUUID(), type: 'thread.create', payload: {} })).result as Thread;
  const upload = {name:'signature.png', base64:'YQ==', attachmentArtifactId:'signature-source'};
  await expect(x.send('resource.upload', upload, other.id)).rejects.toMatchObject({code:'CAPABILITY_DENIED'});
  const generated = (await x.send('resource.upload', upload)).result as ResourceGrant;
  expect(generated).toMatchObject({composerAttachment:{artifactId:'signature-source', title:'Component catalog'}});
  const manual = (await x.send('resource.upload', {name:'signature.png', base64:'Yg=='})).result as ResourceGrant;
  expect(manual).not.toHaveProperty('composerAttachment');
  await expect(x.send('resource.remove-composer-attachment', {resourceId:generated.id}, other.id)).rejects.toMatchObject({code:'CAPABILITY_DENIED'});
  await expect(x.send('resource.remove-composer-attachment', {resourceId:manual.id})).rejects.toMatchObject({code:'CAPABILITY_DENIED'});
  const detach = {id:crypto.randomUUID(), type:'resource.remove-composer-attachment', threadId:x.thread.id, payload:{resourceId:generated.id}};
  const receipt = await x.service.command(detach);
  expect(await x.service.command(detach)).toEqual(receipt);
  expect(x.store.get('resource', generated.id)).toMatchObject({path:generated.path, composerAttachment:{hidden:true}});
  expect(x.store.get('resource', manual.id)).toEqual(manual);
});
