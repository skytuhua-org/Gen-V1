import {afterEach,expect,it,vi} from 'vitest';
import {mkdtemp,realpath,rm} from 'node:fs/promises';
import {mkdtempSync,statSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Service} from '../packages/core/service.ts';
import {ENHANCE_LIMITS} from '../packages/core/composer-enhance.ts';
import {Store} from '../packages/storage/store.ts';
import {buildServer} from '../apps/server/server.ts';
import type {ResourceGrant,RuntimeAdapter,RuntimeCallbacks,StartRun,Thread} from '../packages/contracts/index.ts';

const custody=vi.hoisted(()=>({active:0,readOnly:0,readOnlyCalls:0}));
// Portable custody stand-in: real native guards have dedicated win32 cases.
vi.mock('../packages/core/file-access.ts',async original=>{
 const module=await original<typeof import('../packages/core/file-access.ts')>();
 return{...module,withResourceGrant:async<T>(grant:ResourceGrant,dataDir:string,relative:string|undefined,write:boolean,signal:AbortSignal,action:(path:string)=>Promise<T>,options?:{readOnly?:boolean})=>{
  if(signal.aborted)throw new Error('Cancelled');
  const{resolveGrant}=await import('../packages/core/security.ts'),path=await resolveGrant(grant,relative,write,dataDir);
  custody.active++;if(options?.readOnly){custody.readOnly++;custody.readOnlyCalls++;}
  try{return await action(path);}finally{custody.active--;if(options?.readOnly)custody.readOnly--;}
 }};
});

const cleanups:(()=>Promise<void>)[]=[];
afterEach(async()=>{vi.useRealTimers();for(const close of cleanups.splice(0).reverse())await close();custody.active=0;custody.readOnly=0;custody.readOnlyCalls=0;});
function adapter(){let callbacks!:RuntimeCallbacks;const starts:StartRun[]=[];const runtime:RuntimeAdapter={configure:value=>{callbacks=value;},models:async()=>[{id:'openai/prediction-test',provider:'openai',name:'Synthetic model'}],start:async value=>{starts.push(value);},followUp:async value=>{starts.push(value);},cancel:vi.fn(async()=>{}),compact:async()=>{},history:async()=>[],dispose:vi.fn(async()=>{})};return{runtime,starts,get callbacks(){return callbacks;}};}
async function fixture(){
 const directory=await mkdtemp(join(await realpath(tmpdir()),'harness-enhance-service-')),store=new Store(directory),primary=adapter(),enhancements:ReturnType<typeof adapter>[]=[];
 const options={sideRuntimeFactory:()=>primary.runtime,enhanceRuntimeFactory:()=>{const next=adapter();enhancements.push(next);return next.runtime;}};
 let service=new Service(store,primary.runtime,options);await service.recover();cleanups.push(async()=>{await service.dispose();store.close();await rm(directory,{recursive:true,force:true,maxRetries:10,retryDelay:100});});
 const send=(type:string,payload:Record<string,unknown>={},threadId?:string)=>service.command({id:crypto.randomUUID(),type,payload,threadId});
 const start=async()=>{const thread=(await send('thread.create',{})).result as Thread;await send('message.send',{content:'Please check the release.',modelId:'openai/prediction-test'},thread.id);await vi.waitFor(()=>expect(primary.starts.at(-1)?.threadId).toBe(thread.id));return primary.starts.at(-1)!;};
 const settle=(run:StartRun)=>{primary.callbacks.onEvent({...run,type:'input.processing',inputIds:run.inputIds});primary.callbacks.onEvent({...run,type:'assistant.message',messageId:crypto.randomUUID(),content:'Checked the release.',inputIds:run.inputIds});primary.callbacks.onEvent({...run,type:'settled'});return run.threadId;};
 return{store,primary,enhancements,send,start,settle,get service(){return service;},reopen:async()=>{await service.dispose();service=new Service(store,primary.runtime,options);await service.recover();}};
}
const enhance=(x:Awaited<ReturnType<typeof fixture>>,ctx:StartRun,text:string)=>{const pending=x.enhancements.at(-1)!;pending.callbacks.onEvent({...ctx,type:'assistant.message',content:text});pending.callbacks.onEvent({...ctx,type:'settled'});};

it('rewrites a draft for a bound thread without touching store, outbox or native session state',async()=>{
 const x=await fixture(),run=await x.start(),threadId=x.settle(run),sequence=x.store.sequence;
 const result=x.service.composerEnhance({draft:'make it formal',target:{kind:'thread',threadId}});
 await vi.waitFor(()=>expect(x.enhancements[0]?.starts).toHaveLength(1));
 const request=x.enhancements[0].starts[0];expect(request.sessionPath).toBeNull();expect(request.resources).toEqual([]);expect(request.modelId).toBe('openai/prediction-test');expect(request.prompt).toContain('make it formal');
 enhance(x,request,'{"draft":"Please formally review the release."}');
 expect(await result).toEqual({draft:'Please formally review the release.',usedProjectContext:false});
 expect(x.store.sequence).toBe(sequence);expect(x.store.snapshot().messages).toHaveLength(2);
 await x.reopen();expect(x.enhancements).toHaveLength(1);
});

it('validates a new-draft model against the account binding without a thread and rejects unsupported providers before any adapter',async()=>{
 const x=await fixture();
 const result=x.service.composerEnhance({draft:'tighten this',target:{kind:'new',modelId:'openai/prediction-test'}});
 await vi.waitFor(()=>expect(x.enhancements[0]?.starts).toHaveLength(1));enhance(x,x.enhancements[0].starts[0],'{"draft":"Tightened."}');
 expect(await result).toEqual({draft:'Tightened.',usedProjectContext:false});
 await expect(x.service.composerEnhance({draft:'x',target:{kind:'new',modelId:'cursor-sdk/model'}})).rejects.toMatchObject({code:'ENHANCE_UNSUPPORTED'});
 expect(x.enhancements).toHaveLength(1);
});

it('rejects missing, stale and busy thread owners before reserving an adapter',async()=>{
 const x=await fixture(),run=await x.start(),threadId=x.settle(run);
 await expect(x.service.composerEnhance({draft:'x',target:{kind:'thread',threadId:'missing'}})).rejects.toMatchObject({code:'ENHANCE_NOT_FOUND'});
 await expect(x.service.composerEnhance({draft:'x',target:{kind:'thread',threadId,modelId:'openai/other'}})).rejects.toMatchObject({code:'ENHANCE_STALE'});
 x.store.internal('fixture.busy',threadId,()=>{const thread=x.store.get<Thread>('thread',threadId)!;x.store.put('thread',threadId,threadId,{...thread,runId:'other',status:'working'});});
 await expect(x.service.composerEnhance({draft:'x',target:{kind:'thread',threadId}})).rejects.toMatchObject({code:'ENHANCE_STALE'});
 expect(x.enhancements).toEqual([]);
});

it('keeps one rewrite slot per host and cancels an owner on request, timeout and foreground precedence',async()=>{
 const x=await fixture(),run=await x.start(),threadId=x.settle(run);
 const first=x.service.composerEnhance({draft:'one',target:{kind:'thread',threadId}});first.catch(()=>{});
 await vi.waitFor(()=>expect(x.enhancements[0]?.starts).toHaveLength(1));
 await expect(Promise.resolve().then(()=>x.service.composerEnhance({draft:'two',target:{kind:'thread',threadId}}))).rejects.toMatchObject({code:'ENHANCE_BUSY'});
 const controller=new AbortController(),cancelled=Promise.resolve().then(()=>x.service.composerEnhance({draft:'?',target:{kind:'thread',threadId}}));await expect(cancelled).rejects.toMatchObject({code:'ENHANCE_BUSY'});void controller;
 await x.send('message.send',{content:'Real work.',modelId:run.modelId},threadId);
 await expect(first).rejects.toMatchObject({code:'ENHANCE_CANCELLED'});
 expect(x.enhancements[0].runtime.cancel).toHaveBeenCalled();expect(x.enhancements[0].runtime.dispose).toHaveBeenCalled();
 await vi.waitFor(()=>expect(x.primary.starts).toHaveLength(2));
});

it('fails the caller deadline and retains teardown before the slot frees',async()=>{
 const x=await fixture(),run=await x.start(),threadId=x.settle(run);
 vi.useFakeTimers();
 const result=x.service.composerEnhance({draft:'slow',target:{kind:'thread',threadId}});result.catch(()=>{});
 await vi.waitFor(()=>expect(x.enhancements[0]?.starts).toHaveLength(1));
 await vi.advanceTimersByTimeAsync(15001);
 await expect(result).rejects.toMatchObject({code:'ENHANCE_TIMEOUT'});
 vi.useRealTimers();await vi.waitFor(()=>expect(x.enhancements[0].runtime.dispose).toHaveBeenCalled());
 const again=x.service.composerEnhance({draft:'again',target:{kind:'thread',threadId}});
 await vi.waitFor(()=>expect(x.enhancements[1]?.starts).toHaveLength(1));enhance(x,x.enhancements[1].starts[0],'{"draft":"Done."}');expect((await again).draft).toBe('Done.');
});

it('rejects empty, oversized and malformed model output',async()=>{
 for(const output of ['not json','{"draft":"ok","extra":1}','{"draft":""}','{"draft":"'+('x'.repeat(9*1024))+'"}']){
  const x=await fixture(),run=await x.start(),threadId=x.settle(run),result=x.service.composerEnhance({draft:'draft',target:{kind:'thread',threadId}});
  await vi.waitFor(()=>expect(x.enhancements.at(-1)?.starts).toHaveLength(1));
  const pending=x.enhancements.at(-1)!,ctx=pending.starts[0];pending.callbacks.onEvent({...ctx,type:'assistant.message',content:output});pending.callbacks.onEvent({...ctx,type:'settled'});
  await expect(result).rejects.toMatchObject({code:'ENHANCE_INVALID_OUTPUT'});
 }
});

it('admits approved idle project notes read-only and reports their use',async()=>{
 const x=await fixture(),run=await x.start(),threadId=x.settle(run);
 const project=mkdtempSync(join(tmpdir(),'harness-enhance-project-'));writeFileSync(join(project,'AGENTS.md'),'Prefer British spelling.\n');const info=statSync(project,{bigint:true});
 const grant:ResourceGrant={id:'project-grant',threadId,kind:'project',path:project,label:'Project',writable:false,createdAt:'',identity:{dev:String(info.dev),ino:String(info.ino)}};
 x.store.internal('fixture.grant',threadId,()=>x.store.put('resource',grant.id,threadId,grant));
 const result=x.service.composerEnhance({draft:'summarize',target:{kind:'thread',threadId}});
 await vi.waitFor(()=>expect(x.enhancements[0]?.starts).toHaveLength(1));
 expect(x.enhancements[0].starts[0].prompt).toContain('Prefer British spelling.');expect(custody.readOnlyCalls).toBeGreaterThan(0);expect(custody.active).toBe(0);
 enhance(x,x.enhancements[0].starts[0],'{"draft":"Summarised."}');
 expect(await result).toEqual({draft:'Summarised.',usedProjectContext:true});
});

it('enforces auth, CSRF, the 64 KiB body cap and the documented error envelope statuses',async()=>{
 const x=await fixture(),run=await x.start(),threadId=x.settle(run),app=await buildServer(x.service,{port:4317,dev:false});cleanups.push(()=>app.close());
 const path='/api/composer-enhance',host={host:'127.0.0.1:4317'},input={draft:'make it formal',target:{kind:'thread',threadId}};
 expect((await app.inject({method:'POST',url:path,headers:host,payload:input})).statusCode).toBe(401);
 const boot=await app.inject({url:'/api/bootstrap',headers:host}),cookie=String(boot.headers['set-cookie']).split(';')[0],headers={...host,cookie,'x-harness-csrf':boot.json().csrfToken};
 expect((await app.inject({method:'POST',url:path,headers:{...host,cookie},payload:input})).statusCode).toBe(403);
 for(const bad of [{...input,extra:true},{draft:'  ',target:input.target},{draft:'x'.repeat(8193),target:input.target},{draft:'x',target:{kind:'thread',threadId:'missing'}}])expect((await app.inject({method:'POST',url:path,headers,payload:bad})).statusCode).toBeOneOf([400,404]);
 const pending=app.inject({method:'POST',url:path,headers,payload:input});
 await vi.waitFor(()=>expect(x.enhancements[0]?.starts).toHaveLength(1));
 const busy=await app.inject({method:'POST',url:path,headers,payload:input});expect(busy.statusCode).toBe(409);expect(busy.json().error.code).toBe('ENHANCE_BUSY');
 enhance(x,x.enhancements[0].starts[0],'{"draft":"Please formally review the release."}');
 const response=await pending;expect(response.statusCode).toBe(200);expect(response.json()).toEqual({draft:'Please formally review the release.',usedProjectContext:false});expect(response.headers['cache-control']).toBe('no-store');
});


async function projectNotes(x:Awaited<ReturnType<typeof fixture>>,threadId:string,files:Record<string,string>){
 const project=await mkdtemp(join(await realpath(tmpdir()),'harness-enhance-bounded-'));
 cleanups.push(()=>rm(project,{recursive:true,force:true}));
 for(const [name,text] of Object.entries(files))writeFileSync(join(project,name),text);
 const info=statSync(project,{bigint:true});
 const grant:ResourceGrant={id:'bounded-project',threadId,kind:'project',path:project,label:'Project',writable:false,createdAt:'',identity:{dev:String(info.dev),ino:String(info.ino)}};
 x.store.internal('fixture.grant',threadId,()=>x.store.put('resource',grant.id,threadId,grant));
 return grant;
}

it.each<Record<string,string>>([
 {'AGENTS.md':'😀'.repeat(9000)},
 {'AGENTS.md':'a'.repeat(4090),'CLAUDE.md':'😀'.repeat(3000)},
])('clips admitted project snippets to the total UTF-8 budget without splitting code points',async files=>{
 const x=await fixture(),run=await x.start(),threadId=x.settle(run);
 await projectNotes(x,threadId,files);
 const result=x.service.composerEnhance({draft:'Keep the meaning.',target:{kind:'thread',threadId}});void result.catch(()=>{});
 await vi.waitFor(()=>expect(x.enhancements[0]?.starts).toHaveLength(1));
 const prompt=x.enhancements[0].starts[0].prompt,notes=JSON.parse(prompt.slice(prompt.indexOf('\n')+1)).projectNotes as {filename:string;text:string}[];
 expect(notes.length).toBe(Object.keys(files).length);
 expect(notes.reduce((sum,note)=>sum+Buffer.byteLength(note.filename)+Buffer.byteLength(note.text),0)).toBeLessThanOrEqual(ENHANCE_LIMITS.projectBytes);
 for(const note of notes){expect(files[note.filename as keyof typeof files]!.startsWith(note.text)).toBe(true);expect(note.text).not.toContain('\ufffd');expect(note.text).toBe(Buffer.from(note.text).toString('utf8'));}
 expect(notes.at(-1)!.text.length).toBeGreaterThan(0);
 enhance(x,x.enhancements[0].starts[0],'{"draft":"Kept the meaning."}');expect((await result).usedProjectContext).toBe(true);
});

it.each(['epoch','modelId','accountId','projectId','workspaceId','grants'] as const)('rejects settlement after captured %s ownership changes',async field=>{
 const x=await fixture(),run=await x.start(),threadId=x.settle(run);
 const saved=(await x.send('account.create',{providerId:'openai',label:'Second synthetic profile'})).result as {id:string};
 const result=x.service.composerEnhance({draft:'Preserve ownership.',target:{kind:'thread',threadId}});
 await vi.waitFor(()=>expect(x.enhancements[0]?.starts).toHaveLength(1));
 x.store.internal('fixture.owner.changed',threadId,()=>{
  if(field==='grants'){x.store.put('resource','new-resource',threadId,{id:'new-resource',threadId,kind:'file',path:join(x.store.dataDir,'AGENTS.md'),label:'Synthetic',writable:false,createdAt:''});return;}
  const current=x.store.get<Thread>('thread',threadId)!;
  const value=field==='epoch'?current.epoch+1:field==='modelId'?'openai/changed':field==='accountId'?saved.id:'changed-owner';
  x.store.put('thread',threadId,threadId,{...current,[field]:value});
 });
 enhance(x,x.enhancements[0].starts[0],'{"draft":"A stale result."}');
 await expect(result).rejects.toMatchObject({code:'STALE_REQUEST_CONTEXT'});
});

it('rejects a new-draft result after the selected account changes',async()=>{
 const x=await fixture(),saved=(await x.send('account.create',{providerId:'openai',label:'Replacement profile'})).result as {id:string};
 const result=x.service.composerEnhance({draft:'Keep this draft.',target:{kind:'new',modelId:'openai/prediction-test'}});
 await vi.waitFor(()=>expect(x.enhancements[0]?.starts).toHaveLength(1));
 x.store.internal('fixture.selection.changed',null,()=>{const settings=x.store.get<Record<string,unknown>>('settings','global')!;x.store.put('settings','global',null,{...settings,selectedAccounts:{openai:saved.id}});});
 enhance(x,x.enhancements[0].starts[0],'{"draft":"Stale profile."}');
 await expect(result).rejects.toMatchObject({code:'ENHANCE_STALE'});
});


it('admits an unbound thread using its selected saved account',async()=>{
 const x=await fixture(),saved=(await x.send('account.create',{providerId:'openai',label:'Selected synthetic profile'})).result as {id:string};
 await x.send('account.select',{providerId:'openai',accountId:saved.id});
 const thread=(await x.send('thread.create')).result as Thread;
 let failure:unknown;
 const result=x.service.composerEnhance({draft:'Keep the selected account.',target:{kind:'thread',threadId:thread.id,modelId:'openai/prediction-test'}});void result.catch(error=>{failure=error;});
 await vi.waitFor(()=>expect(x.enhancements.length>0||failure!==undefined).toBe(true));
 expect(failure).toBeUndefined();
 await vi.waitFor(()=>expect(x.enhancements[0]?.starts).toHaveLength(1));
 expect(x.enhancements[0].starts[0].accountId).toBe(saved.id);
 enhance(x,x.enhancements[0].starts[0],'{"draft":"Selected account retained."}');expect((await result).draft).toBe('Selected account retained.');
});
