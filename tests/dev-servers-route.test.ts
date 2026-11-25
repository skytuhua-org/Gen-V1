import {afterEach,expect,it,vi} from 'vitest';
import {mkdtemp,mkdir,rm} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {Store} from '../packages/storage/store.ts';
import {Service} from '../packages/core/service.ts';
import {buildServer} from '../apps/server/server.ts';
import type {RuntimeAdapter,Thread} from '../packages/contracts/index.ts';
import {workspaceHost} from '../apps/server/workspace-host.ts';
import type {DevServerRow,DevServerTracker} from '../packages/workspace/dev-servers.ts';
import {devServerListSchema} from '../packages/contracts/dev-servers.ts';

const cleanup:(()=>Promise<void>)[]=[];
afterEach(async()=>{for(const close of cleanup.splice(0).reverse())await close();});

const row=(overrides:Partial<DevServerRow>):DevServerRow=>({id:'term-1:5173',projectId:'p',threadId:'thread-a',terminalId:'term-1',url:'http://localhost:5173/',port:5173,label:'dev',source:'script',scriptName:'dev',startedAt:'2026-01-01T00:00:00Z',detectedAt:'2026-01-01T00:00:01Z',...overrides});
const thread=(id:string,title:string,projectId:string):Thread=>({id,title,projectId,projectName:'Fixture',createdAt:'2026-01-01T00:00:00Z',updatedAt:'2026-01-01T00:00:00Z',status:'ready',epoch:0,runId:null,modelId:null,sessionPath:null,kind:'main'});

async function setup(rows:DevServerRow[]){
 const root=await mkdtemp(join(tmpdir(),'gen-dev-servers-')),path=join(root,'repo'),path2=join(root,'repo2'),data=join(root,'data');await mkdir(path);await mkdir(path2);
 const store=new Store(data),runtime:RuntimeAdapter={configure:()=>{},models:async()=>[],start:async()=>{},followUp:async()=>{},cancel:async()=>{},compact:async()=>{},history:async()=>[],dispose:async()=>{}};
 const service=new Service(store,runtime),app=await buildServer(service,{port:4319,dev:false});
 const host=workspaceHost(service);
 const connected=await host.projects.connect({id:randomUUID(),type:'workspace.project.connect',payload:{name:'Fixture',path}}),projectId=(connected.result as {projects:{id:string}[]}).projects[0]!.id;
 const second=await host.projects.connect({id:randomUUID(),type:'workspace.project.connect',payload:{name:'Other',path:path2}}),otherId=(second.result as {projects:{id:string;name:string}[]}).projects.find(item=>item.name==='Other')!.id;
 const mapped=rows.map(item=>({...item,projectId:item.projectId==='place'?projectId:item.projectId}));
 host.devServers={list:vi.fn((project:string)=>mapped.filter(item=>item.projectId===project)),count:()=>mapped.length,output:()=>{},exit:()=>{},dispose:()=>{}} as unknown as DevServerTracker;
 store.internal('fixture.threads',null,()=>{store.put('thread','thread-a','thread-a',thread('thread-a','Alpha work',projectId));store.put('thread','thread-b','thread-b',thread('thread-b','Beta work',projectId));});
 const bootstrap=await app.inject({url:'/api/bootstrap',headers:{host:'127.0.0.1:4319'}});
 const headers={host:'127.0.0.1:4319',cookie:String(bootstrap.headers['set-cookie']).split(';')[0]};
 cleanup.push(async()=>{await app.close();await service.dispose();store.close();await rm(root,{recursive:true,force:true,maxRetries:5});});
 return{app,headers,projectId,otherId};
}

it('lists only the requested project rows with thread titles and schema-valid output',async()=>{
 const{app,headers,projectId,otherId}=await setup([
  row({projectId:'place',id:'term-1:5173',threadId:'thread-a'}),
  row({projectId:'place',id:'term-2:3000',terminalId:'term-2',port:3000,url:'http://localhost:3000/',threadId:'thread-b',label:'npm start',source:'terminal',scriptName:null}),
  row({projectId:'other',id:'term-9:8080',terminalId:'term-9',port:8080,url:'http://localhost:8080/'}),
 ]);
 const page=await app.inject({url:`/api/projects/${projectId}/dev-servers`,headers});
 expect(page.statusCode).toBe(200);expect(page.headers['cache-control']).toBe('no-store');
 const body=devServerListSchema.parse(page.json());
 expect(body.items.map(item=>item.id)).toEqual(['term-1:5173','term-2:3000']);
 expect(body.items[0]).toMatchObject({threadTitle:'Alpha work',source:'script',scriptName:'dev'});
 expect(body.items[1]).toMatchObject({threadTitle:'Beta work',source:'terminal',scriptName:null});
 const empty=await app.inject({url:`/api/projects/${otherId}/dev-servers`,headers});
 expect(empty.statusCode).toBe(200);expect(devServerListSchema.parse(empty.json()).items).toEqual([]);
});

it('rejects an unknown project the same way /context does',async()=>{
 const{app,headers}=await setup([]);
 const ours=await app.inject({url:'/api/projects/no-such-project/dev-servers',headers});
 const reference=await app.inject({url:'/api/projects/no-such-project/context',headers});
 expect(ours.statusCode).toBe(reference.statusCode);
});
