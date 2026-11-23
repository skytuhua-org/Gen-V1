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

it('rejects an oversized initial command before starting or reserving a terminal',async()=>{
 const {host}=fixture();const input={projectId:'project-a',threadId:'thread-a',terminalId:'terminal-a'};
 await expect(host.open({...input,command:'x'.repeat(8001)})).rejects.toThrow();
 expect(mocks.spawn).not.toHaveBeenCalled();
 await expect(host.open({...input,command:'echo ready'})).resolves.toMatchObject({id:'terminal-a'});
 expect(mocks.spawn).toHaveBeenCalledOnce();
 expect(mocks.spawn.mock.results[0]?.value.write).toHaveBeenCalledWith('echo ready\r');
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

it.each(['registration','initial write','data listener','exit listener'] as const)('rolls back a spawned terminal after %s fails',async(step)=>{
 const {host,projects}=fixture(),{pty}=startupPty();
 const input={projectId:'project-a',terminalId:'failed-start'},error=new Error(`Fixture ${step} failed`);
 const fail=()=>{throw error;};
 if(step==='registration')vi.spyOn(projects.store,'put').mockImplementationOnce(fail);
 if(step==='initial write')pty.write.mockImplementationOnce(fail);
 if(step==='data listener')pty.onData.mockImplementationOnce(fail);
 if(step==='exit listener')pty.onExit.mockImplementationOnce(fail);

 await expect(host.open({...input,command:'echo ready'})).rejects.toBe(error);
 expect(pty.kill).toHaveBeenCalledOnce();
 expect(pty.write).toHaveBeenCalledTimes(step==='initial write'?1:0);
 expect(projects.store.get('terminalSession',input.terminalId)).toBeUndefined();
 await expect(host.read(input.terminalId,input.projectId)).rejects.toMatchObject({code:'NOT_FOUND'});
 await expect(host.open(input)).resolves.toMatchObject({id:input.terminalId,exited:false});
 expect(mocks.spawn).toHaveBeenCalledTimes(2);
});

it('holds a failed terminal in custody until native exit even when termination times out',async()=>{
 vi.useFakeTimers();
 const {host,projects}=fixture(),{pty,exit}=startupPty();
 const input={projectId:'project-a',terminalId:'still-closing'};
 pty.write.mockImplementationOnce(()=>{throw Error('Fixture initial write failed');});
 pty.kill.mockImplementation(()=>{});
 const opening=host.open({...input,command:'echo ready'}).catch(error=>error);
 try{
  await vi.waitFor(()=>expect(pty.kill).toHaveBeenCalledOnce());
  await expect(host.open(input)).rejects.toMatchObject({code:'TERMINAL_CANCEL_UNCONFIRMED'});
  await expect(host.read(input.terminalId,input.projectId)).rejects.toMatchObject({code:'TERMINAL_CANCEL_UNCONFIRMED'});
  await vi.advanceTimersByTimeAsync(5000);
  expect(await opening).toMatchObject({code:'TERMINAL_CANCEL_UNCONFIRMED'});
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

