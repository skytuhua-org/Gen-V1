import { afterEach, expect, it, vi } from 'vitest';
import { lstat, mkdir, mkdtemp, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Store } from '../packages/storage/store.ts';
import { Service } from '../packages/core/service.ts';
import type { RuntimeAdapter } from '../packages/contracts/index.ts';
import { unavailableIdentity, type AccountAuthStatus } from '../packages/contracts/authentication.ts';
import { EditPreviewRegistry } from '../packages/core/edit-preview.ts';
import * as accountAuth from '../packages/runtime/account-auth.ts';
import { buildServer } from '../apps/server/server.ts';
import { RequestRateLimit } from '../apps/server/request-rate-limit.ts';

const readFixtureAsset = vi.hoisted(() => vi.fn<(path: string) => void>());

vi.mock('node:fs/promises', async (load) => {
  const fs = await load<typeof import('node:fs/promises')>();
  return { ...fs, readFile: async (path: Parameters<typeof fs.readFile>[0], options?: Parameters<typeof fs.readFile>[1]) => {
    const key = String(path).replaceAll('\\', '/');
    if (key.endsWith('/dist/web/index.html')) {
      readFixtureAsset('static');
      return Buffer.from('<!doctype html><title>fixture</title>');
    }
    if (key.endsWith('/dist/plugin-runtime/runtime.js')) {
      readFixtureAsset('plugin');
      return Buffer.from('/* plug-in fixture */');
    }
    if (key.endsWith('/dist/widget-runtime/worker.js')) {
      readFixtureAsset('widget');
      return Buffer.from('/* worker fixture */');
    }
    return fs.readFile(path, options);
  } };
});

const close: (() => Promise<void>)[] = [];
afterEach(async()=>{for(const action of close.splice(0))await action();vi.restoreAllMocks();vi.unstubAllEnvs();readFixtureAsset.mockClear();});

async function fixture() {
  const dir = await mkdtemp(join(tmpdir(), 'request-rate-limit-'));
  const store = new Store(dir);
  const runtime: RuntimeAdapter = { configure:()=>{}, models:async()=>[], invalidateModels:vi.fn(async()=>{}), start:async()=>{}, followUp:async()=>{}, cancel:async()=>{}, compact:async()=>{}, dispose:async()=>{}, history:async()=>[] };
  const service = new Service(store, runtime), app = await buildServer(service,{port:4317,dev:false});
  close.push(async()=>{await app.close();await service.dispose();store.close();await rm(dir,{recursive:true,force:true});});
  const session = async () => {
    const host='127.0.0.1:4317', response=await app.inject({url:'/api/bootstrap',headers:{host}});
    return {host,cookie:String(response.headers['set-cookie']).split(';')[0],'x-harness-csrf':String(response.json().csrfToken)};
  };
  return {app,dir,store,service,session,headers:await session()};
}

async function seedPreviewProject(dir: string, store: Store) {
  const projectDir=join(await realpath(dir),'workspace');
  await mkdir(projectDir);
  const identity=await lstat(projectDir,{bigint:true});
  store.internal('fixture.project',null,()=>{
    const id='fixture-project';
    store.put('workspaceProject',id,null,{id,name:'Fixture',authority:{kind:'local'}});
    store.put('workspaceProjectRoot',id,null,{path:projectDir,identity:{dev:String(identity.dev),ino:String(identity.ino)}});
  });
}

async function expectBudget(send: () => PromiseLike<{ statusCode: number; headers: Record<string, unknown>; json(): unknown }>, allowed: number, label: string) {
  for (let index = 0; index < allowed; index++) {
    expect((await send()).statusCode, `${label} admitted request ${index + 1}`).toBe(200);
  }
  const limited = await send();
  expect(limited.statusCode, label).toBe(429);
  expect(limited.json(), label).toMatchObject({ error: { code: 'RATE_LIMITED' } });
  expect(limited.headers['retry-after'], label).toBe('60');
}

it('allows ordinary model reads but bounds repeated expensive model discovery requests', async()=>{
  let now=1_000;
  vi.spyOn(performance,'now').mockImplementation(()=>now);
  const {app,headers,session,service}=await fixture();
  const models=vi.spyOn(service,'models').mockResolvedValue([]);
  const statuses:number[]=[];
  for(let index=0;index<31;index++)statuses.push((await app.inject({url:'/api/models',headers})).statusCode);
  expect(statuses.slice(0,30)).toEqual(Array(30).fill(200));
  expect(statuses[30]).toBe(429);
  const limited=await app.inject({url:'/api/models',headers});
  expect(limited.json()).toMatchObject({error:{code:'RATE_LIMITED'}});
  expect(limited.headers['retry-after']).toBe('60');
  expect(models).toHaveBeenCalledTimes(30);
  expect((await app.inject({url:'/api/models',headers:await session()})).statusCode).toBe(200);
  expect((await app.inject({url:'/api/shell-settings',headers})).statusCode).toBe(200);
  now+=60_000;
  expect((await app.inject({url:'/api/models',headers})).statusCode).toBe(200);
});

it('expires fixed-window hits so a limited client recovers without a permanent lockout',()=>{
  let now=1_000;const limiter=new RequestRateLimit(60_000,()=>now);
  expect(limiter.consume('client',2)).toBe(true);expect(limiter.consume('client',2)).toBe(true);expect(limiter.consume('client',2)).toBe(false);
  now+=60_001;
  expect(limiter.consume('client',2)).toBe(true);
});


it('keeps rejected socket attempts separate from valid sessions and validates origin first', async()=>{
  const {app,headers}=await fixture();
  const host=headers.host;
  for(let index=0;index<20;index++){
    expect((await app.inject({url:'/api/models',headers:{host}})).statusCode).toBe(401);
  }
  expect((await app.inject({url:'/api/models',headers:{host}})).statusCode).toBe(429);
  expect((await app.inject({url:'/api/events',headers:{host}})).statusCode).toBe(401);
  expect((await app.inject({url:'/api/models',headers:{host:'invalid.test'}})).json().error.code).toBe('INVALID_HOST');
  expect((await app.inject({url:'/api/models',headers:{host,origin:'https://invalid.test'}})).json().error.code).toBe('INVALID_ORIGIN');
  expect((await app.inject({url:'/api/models',headers})).statusCode).toBe(200);
});

it('does not evict a live limit when all identity slots are occupied',()=>{
  let now=1_000;
  const limiter=new RequestRateLimit(60_000,()=>now);
  for(let index=0;index<1000;index++)expect(limiter.consume(String(index),1)).toBe(true);
  expect(limiter.consume('overflow-a',1)).toBe(true);
  expect(limiter.consume('overflow-b',1)).toBe(false);
  expect(limiter.consume('0',1)).toBe(false);
  now+=60_000;
  expect(limiter.consume('0',1)).toBe(true);
  expect(limiter.consume('overflow-b',1)).toBe(true);
});


it('charges invalid CSRF separately and leaves the valid sign-out handler reachable', async()=>{
  const {app,headers}=await fixture();
  const inject=(csrf: string)=>app.inject({method:'POST',url:'/api/account-auth/signout',
    headers:{...headers,'x-harness-csrf':csrf},payload:{}});
  for(let index=0;index<20;index++)expect((await inject('invalid')).statusCode).toBe(403);
  expect((await inject('invalid')).statusCode).toBe(429);
  expect((await inject(headers['x-harness-csrf'])).statusCode).toBe(400);
});

it('allows normal widget, plug-in runtime and production navigation requests', async()=>{
  const {app,headers}=await fixture();
  const publicHeaders={host:headers.host};
  for(const url of ['/widget-runtime/worker.js','/plugin-runtime/runtime.js','/fixture-navigation']){
    expect((await app.inject({url,headers:publicHeaders})).statusCode,url).toBe(200);
  }
});


it('keeps the protected preview admission independent from a saturated model budget', async()=>{
  vi.stubEnv('HARNESS_FLAG_CODING_INTELLIGENCE_V1','1');
  const {app,dir,store,headers,service}=await fixture();
  vi.spyOn(service,'models').mockResolvedValue([]);
  await seedPreviewProject(dir,store);
  for(let index=0;index<30;index++)expect((await app.inject({url:'/api/models',headers})).statusCode).toBe(200);
  expect((await app.inject({url:'/api/models',headers})).statusCode).toBe(429);
  const preview=await app.inject({method:'POST',url:'/api/projects/fixture-project/previews',
    headers,payload:{command:'begin',schemaDigest:'a'.repeat(64)}});
  expect(preview.statusCode).toBe(200);
  expect(preview.json().previewId).toEqual(expect.any(String));
});


it('bounds account status and sign-out independently before reaching their operations', async () => {
  vi.spyOn(performance, 'now').mockReturnValue(1_000);
  const { app, headers, service } = await fixture();
  const target = { providerId: 'openai', accountId: null } as const;
  const result: AccountAuthStatus = {
    ...target, state: 'signed-out', identity: unavailableIdentity(), lastCheckedAt: null,
    localSignout: true, message: 'Fixture account',
  };
  const status = vi.spyOn(accountAuth, 'readAccountAuth').mockResolvedValue(result);
  const signout = vi.spyOn(accountAuth, 'signOutAccount').mockResolvedValue(result);
  const cancel = vi.spyOn(service, 'cancelComposerPredictions').mockResolvedValue(undefined);
  await expectBudget(() => app.inject({ url: '/api/account-auth?providerId=openai&accountId=', headers }), 30, 'account status');
  await expectBudget(() => app.inject({ method: 'POST', url: '/api/account-auth/signout', headers, payload: target }), 12, 'account sign-out');
  expect(status).toHaveBeenCalledTimes(30);
  expect(cancel).toHaveBeenCalledTimes(12);
  expect(signout).toHaveBeenCalledTimes(12);
});

it('bounds widget, plug-in runtime, and static reads independently before reading assets', async () => {
  vi.spyOn(performance, 'now').mockReturnValue(1_000);
  const { app, headers: { host } } = await fixture();
  readFixtureAsset.mockClear();
  const routes = [
    { group: 'widget', url: '/widget-runtime/worker.js' },
    { group: 'plugin', url: '/plugin-runtime/runtime.js' },
    { group: 'static', url: '/fixture-navigation' },
  ];
  for (const { group, url } of routes) {
    await expectBudget(() => app.inject({ url, headers: { host } }), 600, group);
    expect(readFixtureAsset.mock.calls.filter(([read]) => read === group)).toHaveLength(600);
  }
});

it('bounds admitted preview updates before handing bytes to the registry', async () => {
  vi.stubEnv('HARNESS_FLAG_CODING_INTELLIGENCE_V1', '1');
  vi.spyOn(performance, 'now').mockReturnValue(1_000);
  const { app, dir, store, headers } = await fixture();
  await seedPreviewProject(dir, store);
  const append = vi.spyOn(EditPreviewRegistry.prototype, 'append');
  const url = '/api/projects/fixture-project/previews';
  const preview = await app.inject({ method: 'POST', url, headers, payload: { command: 'begin', schemaDigest: 'a'.repeat(64) } });
  expect(preview.statusCode).toBe(200);
  const previewId = preview.json().previewId as string;
  await expectBudget(() => app.inject({ method: 'POST', url, headers, payload: { command: 'append', previewId, chunk: ' ' } }),
    119, 'preview updates');
  expect(append).toHaveBeenCalledTimes(119);
});
