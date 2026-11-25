import {afterEach,describe,expect,it,vi} from 'vitest';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Store} from '../packages/storage/store.ts';
import type {ProjectTools} from '../packages/workspace/tools.ts';
import {TerminalHost} from '../packages/workspace/terminal.ts';
import {DevServerTracker,type SessionInfo} from '../packages/workspace/dev-servers.ts';

const cleanups:(()=>void)[]=[];
afterEach(()=>{for(const cleanup of cleanups.splice(0))cleanup();});

const spawned=vi.hoisted(()=>[] as {onData:(cb:(data:string)=>void)=>void;onExit:(cb:(event:{exitCode:number})=>void)=>void;write:ReturnType<typeof vi.fn>;kill:ReturnType<typeof vi.fn>;emitData:(data:string)=>void;emitExit:(code:number)=>void}[]);
vi.mock('node-pty',()=>({
 spawn:vi.fn(()=>{
  const dataCallbacks:((data:string)=>void)[]=[],exitCallbacks:((event:{exitCode:number})=>void)[]=[];
  const pty={
   onData:(cb:(data:string)=>void)=>{dataCallbacks.push(cb);},
   onExit:(cb:(event:{exitCode:number})=>void)=>{exitCallbacks.push(cb);},
   write:vi.fn(),
   kill:vi.fn(()=>{for(const cb of exitCallbacks)cb({exitCode:0});}),
   emitData:(data:string)=>{for(const cb of dataCallbacks)cb(data);},
   emitExit:(exitCode:number)=>{for(const cb of exitCallbacks)cb({exitCode});},
  };
  spawned.push(pty);
  return pty;
 }),
}));

let now=0;
const timers=vi.hoisted(()=>({list:[] as {fn:()=>void;at:number;id:number}[],seq:0}));
const setTimer=(fn:()=>void,ms:number)=>{timers.list.push({fn,at:now+ms,id:++timers.seq});return timers.seq;};
const clearTimer=(id:unknown)=>{const index=timers.list.findIndex(timer=>timer.id===id);if(index>=0)timers.list.splice(index,1);};
const run=(ms:number)=>{const end=now+ms;for(;;){const next=timers.list.filter(timer=>timer.at<=end).sort((a,b)=>a.at-b.at||a.id-b.id)[0];if(!next)break;timers.list.splice(timers.list.indexOf(next),1);now=next.at;next.fn();}now=end;};
const flush=()=>new Promise(resolve=>setImmediate(resolve));

function trackerFixture(){
 now=0;timers.list.length=0;timers.seq=0;
 const probes:{host:string;port:number;resolve:(listening:boolean)=>void}[]=[];
 const tracker=new DevServerTracker({probe:(host,port)=>new Promise<boolean>(resolve=>probes.push({host,port,resolve})),now:()=>now,setTimer,clearTimer,timestamp:()=>'2026-02-02T00:00:00.000Z'});
 cleanups.push(()=>tracker.dispose());
 return{tracker,probes};
}

const info=(overrides:Partial<SessionInfo>={}):SessionInfo=>({id:'term-1',projectId:'project-a',threadId:'thread-a',startedAt:'2026-01-01T00:00:00.000Z',scriptName:null,label:null,...overrides});

describe('DevServerTracker',()=>{
 it('confirms a candidate on its third probe into a script-labelled row',async()=>{
  const{tracker,probes}=trackerFixture();
  tracker.output(info({scriptName:'dev',label:'dev'}),'  ➜  Local:   http://localhost:5173/\n');
  expect(probes.map(p=>p.port)).toEqual([5173]);
  probes[0].resolve(false);await flush();run(1000);
  probes[1].resolve(false);await flush();run(1000);
  probes[2].resolve(true);await flush();
  expect(probes.length).toBe(3);
  expect(tracker.list('project-a')).toEqual([{id:'term-1:5173',projectId:'project-a',threadId:'thread-a',terminalId:'term-1',url:'http://localhost:5173/',port:5173,label:'dev',source:'script',scriptName:'dev',startedAt:'2026-01-01T00:00:00.000Z',detectedAt:'2026-02-02T00:00:00.000Z'}]);
  expect(tracker.count()).toBe(1);
 });
 it('drops a candidate that never listens after five retries',async()=>{
  const{tracker,probes}=trackerFixture();
  tracker.output(info(),'http://localhost:4000/\n');
  for(let attempt=0;attempt<6;attempt++){probes[probes.length-1].resolve(false);await flush();run(1000);}
  expect(probes.length).toBe(6);
  run(10*1000);
  expect(probes.length).toBe(6);
  expect(tracker.list('project-a')).toEqual([]);
 });
 it('removes a confirmed row after two failed re-probes',async()=>{
  const{tracker,probes}=trackerFixture();
  tracker.output(info(),'http://localhost:4000/\n');
  probes[0].resolve(true);await flush();
  expect(tracker.list('project-a').length).toBe(1);
  run(10*1000);expect(probes.length).toBe(2);probes[1].resolve(false);await flush();
  expect(tracker.list('project-a').length).toBe(1);
  run(10*1000);expect(probes.length).toBe(3);probes[2].resolve(false);await flush();
  expect(tracker.list('project-a')).toEqual([]);
 });
 it('removes every candidate and row when its terminal exits',async()=>{
  const{tracker,probes}=trackerFixture();
  const terminal=info();
  tracker.output(terminal,'http://localhost:4000/\nhttp://localhost:4001/\n');
  probes[0].resolve(true);await flush();
  expect(tracker.list('project-a').length).toBe(1);
  tracker.exit(terminal);
  expect(tracker.list('project-a')).toEqual([]);
  probes[1].resolve(true);await flush();run(20*1000);
  expect(probes.length).toBe(2);
 });
 it('caps candidates at eight per terminal and thirty-two overall',async()=>{
  const{tracker,probes}=trackerFixture();
  tracker.output(info(),Array.from({length:9},(_,index)=>`http://localhost:${3001+index}/\n`).join(''));
  expect(probes.length).toBe(8);
  for(const probe of [...probes])probe.resolve(true);await flush();
  let port=4001;
  for(const id of ['term-2','term-3','term-4','term-5']){
   tracker.output(info({id}),Array.from({length:9},()=>`http://localhost:${port++}/\n`).join(''));
  }
  expect(probes.length).toBe(32);
 });
 it('attributes a duplicate port to the first terminal that printed it',async()=>{
  const{tracker,probes}=trackerFixture();
  tracker.output(info(),'http://localhost:4000/\n');
  tracker.output(info({id:'term-2'}),'http://localhost:4000/\n');
  expect(probes.length).toBe(1);
  probes[0].resolve(true);await flush();
  expect(tracker.list('project-a')[0].terminalId).toBe('term-1');
 });
 it('stops re-probing when nobody has listed for thirty seconds',async()=>{
  const{tracker,probes}=trackerFixture();
  tracker.output(info(),'http://localhost:4000/\n');
  probes[0].resolve(true);await flush();
  tracker.list('project-a');
  run(40*1000);
  expect(probes.length).toBe(4);
  run(30*1000);
  expect(probes.length).toBe(4);
 });
 it('detects an address split across output chunks',async()=>{
  const{tracker,probes}=trackerFixture();
  tracker.output(info(),'VITE ready\nhttp://local');
  tracker.output(info(),'host:4321/\n');
  expect(probes.map(p=>p.port)).toEqual([4321]);
 });
 it('detects an unterminated trailing address once output pauses',async()=>{
  const{tracker,probes}=trackerFixture();
  tracker.output(info(),'Ready\nhttp://localhost:5173/');
  expect(probes).toEqual([]);
  run(1000);
  expect(probes.map(p=>p.port)).toEqual([5173]);
 });
 it('probes the literal loopback host a server announced',async()=>{
  const{tracker,probes}=trackerFixture();
  tracker.output(info(),'Serving on http://127.0.0.2:8080/\n');
  expect(probes.map(p=>[p.host,p.port])).toEqual([['127.0.0.2',8080]]);
 });
});

function terminalFixture(observer?:{output(info:SessionInfo,chunk:string):void;exit(info:SessionInfo):void}){
 const dataDir=mkdtempSync(join(tmpdir(),'harness-terminal-')),root=mkdtempSync(join(tmpdir(),'harness-project-'));
 const store=new Store(dataDir);
 cleanups.push(()=>{store.close();rmSync(dataDir,{recursive:true,force:true});rmSync(root,{recursive:true,force:true});});
 const projects={store,binding:vi.fn(async()=>({project:{id:'project-a',name:'Project',rootPath:root,authority:{kind:'local' as const},createdAt:'2026-01-01T00:00:00Z'},path:root}))};
 spawned.length=0;
 const host=new TerminalHost(projects as unknown as ProjectTools,observer);
 cleanups.push(()=>void host.dispose().catch(()=>{}));
 return{host,projects};
}

describe('TerminalHost observer',()=>{
 const openInput={projectId:'project-a',threadId:'thread-a',environment:{} as Record<string,string>};
 it('keeps buffering output when the observer throws',async()=>{
  const{host}=terminalFixture({output:()=>{throw Error('observer boom');},exit:()=>{throw Error('observer boom');}});
  const session=await host.open({...openInput,terminalId:'term-1'});
  spawned[0].emitData('hello\n');spawned[0].emitExit(0);
  const read=await host.read(session.id,'project-a','thread-a');
  expect(read.output).toContain('hello');
  expect(read.exited).toBe(true);
 });
 it('labels a terminal from its first typed command',async()=>{
  const seen:SessionInfo[]=[];
  const{host}=terminalFixture({output:info=>seen.push(info),exit:()=>{}});
  const session=await host.open({...openInput,terminalId:'term-1'});
  await host.command(session.id,'project-a','thread-a',{type:'input',data:'pnpm d'});
  await host.command(session.id,'project-a','thread-a',{type:'input',data:'ev\r'});
  spawned[0].emitData('ready\n');
  expect(seen.at(-1)?.label).toBe('pnpm dev');
 });
});
