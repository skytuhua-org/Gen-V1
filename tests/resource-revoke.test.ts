import { afterEach, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { Store } from '../packages/storage/store.ts';
import { Service } from '../packages/core/service.ts';
import type { Message, RuntimeAdapter, StartRun, Thread, ResourceGrant } from '../packages/contracts/index.ts';

const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => { for (const fn of cleanup.splice(0).reverse()) await fn(); });

async function setup() {
  const dir = mkdtempSync(join(tmpdir(), 'harness-revoke-'));
  const store = new Store(join(dir, 'state'));
  const starts:StartRun[]=[];
  const runtime: RuntimeAdapter = { configure: () => {}, models: async () => [{ id: 'test/model', name: 'Test', provider: 'test' }], start: async input => { starts.push(input); }, followUp: async input => { starts.push(input); }, cancel: async () => {}, compact: async () => {}, history: async () => [], dispose: async () => {} };
  const service = new Service(store, runtime); await service.recover();
  cleanup.push(async () => { await service.dispose(); store.close(); rmSync(dir, { recursive: true, force: true }); });
  const thread = (await service.command({ id: crypto.randomUUID(), type: 'thread.create', payload: {} })).result as Thread;
  const send = (type: string, payload: Record<string, unknown> = {}, threadId = thread.id) => service.command({ id: crypto.randomUUID(), type, payload, threadId });
  return { dir, store, service, thread, send, starts };
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

it('consumes only the exact accepted attachment IDs and records the sent names once', async () => {
  const x = await setup();
  const first = (await x.send('resource.upload',{name:'first.txt',base64:'YQ=='})).result as ResourceGrant;
  const second = (await x.send('resource.upload',{name:'second.txt',base64:'Yg=='})).result as ResourceGrant;
  const other = (await x.service.command({id:crypto.randomUUID(),type:'thread.create',payload:{}})).result as Thread;
  const foreign = (await x.send('resource.upload',{name:'foreign.txt',base64:'Yw=='},other.id)).result as ResourceGrant;
  const payload = {content:'Send the first file',modelId:'test/model',attachmentIds:[first.id]};
  await expect(x.send('message.send',{...payload,attachmentIds:[first.id,foreign.id]})).rejects.toMatchObject({code:'CAPABILITY_DENIED'});
  expect(x.store.all<Message>('message',x.thread.id)).toHaveLength(0);
  await expect(x.send('message.send',{...payload,modelId:'unavailable/model'})).rejects.toMatchObject({code:'MODEL_UNAVAILABLE'});
  expect(x.store.get<ResourceGrant>('resource',first.id)).toEqual(first);
  const command = {id:crypto.randomUUID(),type:'message.send',payload,threadId:x.thread.id};
  const receipt = await x.service.command(command);
  expect(await x.service.command(command)).toEqual(receipt);
  const sent=x.store.all<Message>('message',x.thread.id);
  expect(sent).toHaveLength(1);
  expect(sent[0]).toMatchObject({role:'user',attachments:[{id:first.id,label:'first.txt',writable:false}]});
  expect(x.store.get('resource',first.id)).toMatchObject({draftAttachmentConsumedBy:sent[0].id,path:first.path});
  expect(x.store.get('resource',second.id)).toEqual(second);
  await expect.poll(()=>x.starts[0]?.resources.map(grant=>grant.id)).toEqual([first.id]);
  await expect(x.send('message.send',payload)).rejects.toMatchObject({code:'CAPABILITY_DENIED'});
});
