import { afterEach, expect, it, vi } from 'vitest';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Store } from '../packages/storage/store.ts';
import { Service } from '../packages/core/service.ts';
import type { RuntimeAdapter } from '../packages/contracts/index.ts';
import { buildServer } from '../apps/server/server.ts';
import { RequestRateLimit } from '../apps/server/request-rate-limit.ts';

const close: (() => Promise<void>)[] = [];
afterEach(async()=>{for(const action of close.splice(0))await action();});

async function fixture() {
  const store = new Store(await mkdtemp(join(tmpdir(), 'request-rate-limit-')));
  const runtime: RuntimeAdapter = { configure:()=>{}, models:async()=>[], invalidateModels:vi.fn(async()=>{}), start:async()=>{}, followUp:async()=>{}, cancel:async()=>{}, compact:async()=>{}, dispose:async()=>{}, history:async()=>[] };
  const service = new Service(store, runtime), app = await buildServer(service,{port:4317,dev:false});
  close.push(async()=>{await app.close();await service.dispose();store.close();});
  const response = await app.inject({url:'/api/bootstrap',headers:{host:'127.0.0.1:4317'}}), bootstrap = response.json();
  return {app,headers:{host:'127.0.0.1:4317',cookie:String(response.headers['set-cookie']).split(';')[0],'x-harness-csrf':bootstrap.csrfToken}};
}

it('allows ordinary model reads but bounds repeated expensive model discovery requests', async()=>{
  const {app,headers}=await fixture();
  const statuses:number[]=[];
  for(let index=0;index<31;index++)statuses.push((await app.inject({url:'/api/models',headers})).statusCode);
  expect(statuses.slice(0,30)).toEqual(Array(30).fill(200));
  expect(statuses[30]).toBe(429);
  const body=(await app.inject({url:'/api/models',headers})).json();
  expect(body).toMatchObject({error:{code:'RATE_LIMITED'}});
});

it('expires fixed-window hits so a limited client recovers without a permanent lockout',()=>{
  let now=1_000;const limiter=new RequestRateLimit(60_000,()=>now);
  expect(limiter.consume('client',2)).toBe(true);expect(limiter.consume('client',2)).toBe(true);expect(limiter.consume('client',2)).toBe(false);
  now+=60_001;
  expect(limiter.consume('client',2)).toBe(true);
});
