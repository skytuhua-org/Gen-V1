import {beforeEach,expect,it,vi} from 'vitest';
const mocks=vi.hoisted(()=>({spawn:vi.fn(()=>({onData:vi.fn(),onExit:vi.fn(),write:vi.fn(),kill:vi.fn()})),resolve:vi.fn(async()=>({EXAMPLE_API_KEY:'fixture'}))}));
vi.mock('node-pty',()=>({spawn:mocks.spawn}));
vi.mock('../packages/core/environment-settings.ts',()=>({environmentSettingsFor:()=>({resolve:mocks.resolve})}));
import {TerminalHost} from '../packages/workspace/terminal.ts';
import type {ProjectTools} from '../packages/workspace/tools.ts';
beforeEach(()=>{mocks.spawn.mockClear();mocks.resolve.mockClear();});
function fixture(){const saved=new Map<string,unknown>();const projects={binding:vi.fn(async()=>({path:'C:/fixture'})),store:{dataDir:'C:/unused',all:()=>[],get:(_kind:string,id:string)=>saved.get(id),internal:(_type:string,_thread:unknown,apply:()=>unknown)=>apply(),put:(_kind:string,id:string,_thread:unknown,value:unknown)=>saved.set(id,value),remove:(_kind:string,id:string)=>saved.delete(id)}};return{host:new TerminalHost(projects as unknown as ProjectTools),projects};}
it('deduplicates concurrent same-pane opens after asynchronous environment resolution',async()=>{
 const {host}=fixture();const input={projectId:'project-a',threadId:'thread-a',terminalId:'terminal-a'};
 const results=await Promise.all([host.open(input),host.open(input)]);
 expect(mocks.spawn).toHaveBeenCalledTimes(1);expect(results[0].id).toBe(results[1].id);
});
it('revalidates the canonical binding after secret resolution before starting a process',async()=>{
 const {host,projects}=fixture();projects.binding.mockResolvedValueOnce({path:'C:/before'}).mockResolvedValue({path:'C:/after'});
 await expect(host.open({projectId:'project-a',threadId:'thread-a'})).rejects.toThrow('changed');expect(mocks.spawn).not.toHaveBeenCalled();
});
it('returns an empty range at the current end for a cursor beyond the transcript',async()=>{
 const {host}=fixture();const input={projectId:'project-a',terminalId:'terminal-a'};
 await host.open(input);
 const emit=(mocks.spawn.mock.results[0]?.value.onData.mock.calls as unknown as [(data:string)=>void][])?.[0]?.[0];
 emit('ready');
 await expect(host.read(input.terminalId,input.projectId,undefined,500)).resolves.toMatchObject({output:'',start:5,cursor:5});
 await expect(host.read(input.terminalId,input.projectId,undefined,2)).resolves.toMatchObject({output:'ady',start:2,cursor:5});
});

it('does not write an initial command during an ordinary open',async()=>{
 const {host}=fixture();
 const input={projectId:'project-a',threadId:'thread-a',terminalId:'terminal-a',command:'fixture'};
 await expect(host.open(input)).resolves.toMatchObject({id:'terminal-a'});
 expect(mocks.spawn).toHaveBeenCalledOnce();
 expect(mocks.spawn.mock.results[0]?.value.write).not.toHaveBeenCalled();
});

it('keeps the retained output and its cursor on a complete UTF-16 character boundary',async()=>{
 const {host}=fixture();
 const opened=await host.open({projectId:'project-a',terminalId:'unicode'});
 const onData=mocks.spawn.mock.results[0]!.value.onData.mock.calls[0]![0] as (data:string)=>void;
 const cap=512*1024;
 onData('😀'+'x'.repeat(cap-1));
 const result=await host.read(opened.id,opened.projectId);
 expect(result.start).toBe(2);
 expect(result.cursor).toBe(cap+1);
 expect(result.output).toBe('x'.repeat(cap-1));
 expect((await host.read(opened.id,opened.projectId,undefined,result.cursor)).output).toBe('');
});

function startupPty(){
 let onExit:((event:{exitCode:number})=>void)|undefined;
 const exit=()=>onExit?.({exitCode:1});
 const pty={onData:vi.fn(),onExit:vi.fn(handler=>{onExit=handler;}),write:vi.fn(),kill:vi.fn(exit)};
 mocks.spawn.mockReturnValueOnce(pty);
 return {pty,exit};
}

function storedScriptFixture(command='fixture'){
 const {host,projects}=fixture(),{store}=projects;
 const projectId='project-a',scriptId='script-a',operationId='operation-a';
 store.put('workspaceProject',projectId,undefined,{id:projectId,authority:{kind:'local'}});
 store.put('projectScript',scriptId,undefined,{projectId,command});
 Object.assign(store,{receipt:vi.fn(),command:(_action:unknown,apply:()=>void)=>apply()});
 const run=()=>host.runScript(projectId,undefined,scriptId,operationId);
 const terminalInput=()=>{
  const intent=store.get('projectScriptIntent',operationId) as {terminalId:string};
  return {projectId,terminalId:intent.terminalId};
 };
 return {host,projects,run,terminalInput};
}

it('rejects an oversized stored command before reserving a terminal',async()=>{
 const {projects,run}=storedScriptFixture('x'.repeat(8001));
 await expect(run()).rejects.toThrow();
 expect(projects.store.get('projectScriptIntent','operation-a')).toBeUndefined();
 expect(mocks.spawn).not.toHaveBeenCalled();
});

it.each(['registration','initial write','data listener','exit listener'] as const)('rolls back a spawned terminal after %s fails',async(step)=>{
 const {host,projects,run,terminalInput}=storedScriptFixture(),{pty}=startupPty();
 const error=new Error(`Fixture ${step} failed`);
 const fail=()=>{throw error;};
 const put=projects.store.put;
 const registration=step==='registration'?vi.spyOn(projects.store,'put').mockImplementation((kind,id,thread,value)=>{
  if(kind==='terminalSession')return fail();
  return put(kind,id,thread,value);
 }):undefined;
 if(step==='initial write')pty.write.mockImplementationOnce(fail);
 if(step==='data listener')pty.onData.mockImplementationOnce(fail);
 if(step==='exit listener')pty.onExit.mockImplementationOnce(fail);

 await expect(run()).rejects.toMatchObject({code:'ACTION_UNCERTAIN'});
 registration?.mockRestore();
 const input=terminalInput();
 expect(pty.kill).toHaveBeenCalledOnce();
 expect(pty.write).toHaveBeenCalledTimes(step==='initial write'?1:0);
 expect(projects.store.get('terminalSession',input.terminalId)).toBeUndefined();
 await expect(host.read(input.terminalId,input.projectId)).rejects.toMatchObject({code:'NOT_FOUND'});
 await expect(host.open(input)).resolves.toMatchObject({id:input.terminalId,exited:false});
 expect(mocks.spawn).toHaveBeenCalledTimes(2);
});

it.each(['reopen','dispose'] as const)('retries failed terminal registration cleanup during %s',async (next)=>{
 const {host,projects,run,terminalInput}=storedScriptFixture(),{pty}=startupPty();
 const failure=Error('Fixture initial write failed');
 pty.write.mockImplementationOnce(()=>{throw failure;});
 vi.spyOn(projects.store,'remove').mockImplementationOnce(()=>{throw Error('Fixture temporary store failure');});
 await expect(run()).rejects.toMatchObject({code:'ACTION_UNCERTAIN'});
 const input=terminalInput();
 expect(pty.kill).toHaveBeenCalledOnce();
 expect(projects.store.get('terminalSession',input.terminalId)).toMatchObject({exited:false});
 if(next==='dispose'){
  await host.dispose();
  expect(projects.store.get('terminalSession',input.terminalId)).toBeUndefined();
 }else{
  await expect(host.open(input)).resolves.toMatchObject({id:input.terminalId,exited:false});
  expect(mocks.spawn).toHaveBeenCalledTimes(2);
 }
});

it('retries durable rollback when shutdown was waiting for the failed startup to exit',async()=>{
 const {host,projects,run,terminalInput}=storedScriptFixture(),{pty,exit}=startupPty();
 const failure=Error('Fixture initial write failed');
 pty.write.mockImplementationOnce(()=>{throw failure;});
 pty.kill.mockImplementation(()=>{});
 vi.spyOn(projects.store,'remove').mockImplementationOnce(()=>{throw Error('Fixture temporary store failure');});
 const opening=run().catch(error=>error);
 await vi.waitFor(()=>expect(pty.kill).toHaveBeenCalledOnce());
 const shutdown=host.dispose();
 await vi.waitFor(()=>expect(pty.kill).toHaveBeenCalledTimes(2));
 exit();
 await expect(opening).resolves.toMatchObject({code:'ACTION_UNCERTAIN'});
 await shutdown;
 const input=terminalInput();
 expect(projects.store.get('terminalSession',input.terminalId)).toBeUndefined();
});

it('holds a failed terminal in custody until native exit even when termination times out',async()=>{
 vi.useFakeTimers();
 const {host,projects,run,terminalInput}=storedScriptFixture(),{pty,exit}=startupPty();
 pty.write.mockImplementationOnce(()=>{throw Error('Fixture initial write failed');});
 pty.kill.mockImplementation(()=>{});
 const opening=run().catch(error=>error);
 let input:ReturnType<typeof terminalInput>;
 try{
  await vi.waitFor(()=>expect(pty.kill).toHaveBeenCalledOnce());
  input=terminalInput();
  await expect(host.open(input)).rejects.toMatchObject({code:'TERMINAL_CANCEL_UNCONFIRMED'});
  await expect(host.read(input.terminalId,input.projectId)).rejects.toMatchObject({code:'TERMINAL_CANCEL_UNCONFIRMED'});
  await vi.advanceTimersByTimeAsync(5000);
  expect(await opening).toMatchObject({code:'ACTION_UNCERTAIN'});
  await expect(host.open(input)).rejects.toMatchObject({code:'TERMINAL_CANCEL_UNCONFIRMED'});
  expect(mocks.spawn).toHaveBeenCalledOnce();
 }finally{exit();await opening;vi.useRealTimers();}
 expect(projects.store.get('terminalSession',input.terminalId)).toBeUndefined();
 await expect(host.open(input)).resolves.toMatchObject({id:input.terminalId,exited:false});
});

it('settles an observed native exit even when recording it in the Store fails',async()=>{
 const {host,projects}=fixture();
 const opened=await host.open({projectId:'project-a',terminalId:'exit-storage'});
 const pty=mocks.spawn.mock.results[0]!.value;
 const onExit=pty.onExit.mock.calls[0]![0] as (event:{exitCode:number})=>void;
 vi.spyOn(projects.store,'put').mockImplementationOnce(()=>{throw new Error('Fixture storage is full');});
 pty.kill.mockImplementationOnce(()=>{
  expect(()=>onExit({exitCode:0})).not.toThrow();
 });
 await expect(host.command(opened.id,opened.projectId,undefined,{type:'stop'})).resolves.toMatchObject({exited:true,exitCode:0});
 await expect(host.read(opened.id,opened.projectId)).resolves.toMatchObject({exited:true,exitCode:0});
 expect(projects.store.get('terminalSession',opened.id)).toMatchObject({exited:false});
});


it('retains newly exited scrollback by exit order, not by when the terminal opened',async()=>{
 const {host}=fixture();
 const projectId='project-a';
 const finish=(index:number,output:string)=>{
  const pty=mocks.spawn.mock.results[index]!.value;
  const onData=pty.onData.mock.calls[0]![0] as (data:string)=>void;
  const onExit=pty.onExit.mock.calls[0]![0] as (event:{exitCode:number})=>void;
  onData(output);onExit({exitCode:0});
 };
 const oldest=await host.open({projectId,terminalId:'long-lived'});
 for(let index=1;index<=48;index++){
  await host.open({projectId,terminalId:'short-'+index});
  finish(index,'short '+index);
 }
 finish(0,'most recently finished');
 await expect(host.read(oldest.id,projectId)).resolves.toMatchObject({output:'most recently finished',exited:true});
 await expect(host.read('short-1',projectId)).rejects.toMatchObject({code:'TERMINAL_ENDED'});
 await expect(host.read('short-2',projectId)).resolves.toMatchObject({output:'short 2',exited:true});
});


it.each(['environment resolution','final binding'] as const)('does not spawn a terminal when shutdown finishes during %s',async(stage)=>{
 const {host,projects}=fixture();
 let resume!:()=>void,reached!:()=>void;
 const blocked=new Promise<void>(resolve=>{reached=resolve;});
 if(stage==='environment resolution')mocks.resolve.mockImplementationOnce(()=>new Promise(resolve=>{resume=()=>resolve({EXAMPLE_API_KEY:'fixture'});reached();}));
 else projects.binding.mockResolvedValueOnce({path:'C:/fixture'}).mockImplementationOnce(()=>new Promise(resolve=>{resume=()=>resolve({path:'C:/fixture'});reached();}));
 const input={projectId:'project-a',threadId:'thread-a',terminalId:'shutdown-open'};
 const opening=host.open(input);void opening.catch(()=>{});
 await blocked;
 await host.dispose();
 resume();
 await expect(opening).rejects.toMatchObject({code:'HOST_CLOSING'});
 await expect(host.open({...input,terminalId:'after-close'})).rejects.toMatchObject({code:'HOST_CLOSING'});
 expect(mocks.spawn).not.toHaveBeenCalled();
 expect(projects.store.get('terminalSession',input.terminalId)).toBeUndefined();
});
