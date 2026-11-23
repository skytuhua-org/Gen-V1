import {randomUUID} from 'node:crypto';
import {lstat,realpath} from 'node:fs/promises';
import {relative,resolve} from 'node:path';
import {spawn,type IPty} from 'node-pty';
import {z} from 'zod';
import {HarnessError} from '../contracts/index.ts';
import type {ProjectTools} from './tools.ts';
import {processEnvironment} from '../capabilities/process.ts';
import {environmentSettingsFor} from '../core/environment-settings.ts';
import {inside} from '../core/security.ts';
import {withPathGuard} from '../core/file-access.ts';
import {containsGuardMarker,terminalDirectoryPathSchema,terminalDirectoryProofs,type TerminalDirectorySelection} from './terminal-directory.ts';

interface Session{id:string;projectId:string;threadId?:string;path:string;directory?:string;pty:IPty;output:string;offset:number;exited:boolean;exitCode:number|null;done:Promise<void>}
const identifier=z.string().regex(/^[a-zA-Z0-9:_.-]{1,200}$/),dimension=z.number().int().min(2).max(500);
/** Host owns processes; renderer visibility and native reparenting do not own their lifetime. */
interface TerminalResult{id:string;projectId:string;threadId?:string;output:string;start:number;cursor:number;exited:boolean;exitCode:number|null}
export class TerminalHost{
 private readonly sessions=new Map<string,Session>();
 private readonly directoryStarts=new Map<string,{fingerprint:string;promise:Promise<TerminalResult>}>();
 constructor(private readonly projects:ProjectTools){
  const store=projects.store,unfinished=store.all<{id:string;exited:boolean}>('terminalSession').filter(item=>!item.exited);
  if(unfinished.length)store.internal('terminal.recovered',null,()=>{for(const item of unfinished)store.put('terminalSession',item.id,null,{...item,exited:true,exitCode:null,reason:'Host restarted; the previous terminal is no longer attached.'});});
 }
 async open(input:{projectId:string;threadId?:string;terminalId?:string;cols?:number;rows?:number;command?:string;program?:string;args?:string[];environment?:Record<string,string|undefined>;directory?:TerminalDirectorySelection}){
  const projectId=identifier.parse(input.projectId),threadId=input.threadId===undefined?undefined:identifier.parse(input.threadId),terminalId=input.terminalId?identifier.parse(input.terminalId):randomUUID();
  const command=input.command?z.string().min(1).max(8000).parse(input.command):undefined;
  const binding=await this.projects.binding(projectId,threadId),existing=this.sessions.get(terminalId);
  if(input.directory!==undefined){
   // A directory launch is a distinct contract, not a root-start retry shape.
   if(!input.terminalId)throw new HarnessError('INVALID_INPUT','A directory launch requires a caller terminal ID.');
   return this.startDirectory({projectId,threadId,terminalId,binding,directory:input.directory,cols:input.cols,rows:input.rows});
  }
  if(existing){if(existing.projectId!==projectId||existing.threadId!==threadId||existing.path!==binding.path||existing.directory!==undefined)throw new HarnessError('CAPABILITY_DENIED','Terminal belongs to another working copy.');if(existing.exited)throw new HarnessError('TERMINAL_ENDED','This terminal ended. Open a new terminal.');return this.result(existing,0);}
  if(this.projects.store.get('terminalSession',terminalId))throw new HarnessError('TERMINAL_ENDED','This terminal ended. Open a new terminal.');
  if([...this.sessions.values()].filter(item=>!item.exited).length>=12)throw new HarnessError('TERMINAL_CAPACITY','Twelve terminals are already running. Stop one before opening another.');
  const shell=process.platform==='win32'?(process.env.COMSPEC??'C:/Windows/System32/cmd.exe'):(process.env.SHELL??'/bin/sh'),args=process.platform==='win32'?['/D','/Q']:[];
  const configured=!input.program&&!input.environment?await environmentSettingsFor(this.projects.store.dataDir).resolve(projectId):{};
  const currentBinding=await this.projects.binding(projectId,threadId);
  if(currentBinding.path!==binding.path)throw new HarnessError('CAPABILITY_DENIED','The project binding changed before the terminal could start.');
  // Secret resolution yields. Recheck ownership/capacity synchronously after
  // the final await so concurrent opens cannot orphan an extra process.
  const opened=this.sessions.get(terminalId);
  if(opened){if(opened.projectId!==projectId||opened.threadId!==threadId||opened.path!==binding.path||opened.directory!==undefined)throw new HarnessError('CAPABILITY_DENIED','Terminal belongs to another working copy.');if(opened.exited)throw new HarnessError('TERMINAL_ENDED','This terminal ended. Open a new terminal.');return this.result(opened,0);}
  if(this.projects.store.get('terminalSession',terminalId))throw new HarnessError('TERMINAL_ENDED','This terminal ended. Open a new terminal.');
  if(this.liveCount()>=12)throw new HarnessError('TERMINAL_CAPACITY','Twelve terminals are already running. Stop one before opening another.');
  // Trusted integration programs retain their explicitly pinned environments.
  const pty=spawn(input.program??shell,input.args??args,{name:'xterm-256color',cwd:binding.path,cols:dimension.parse(input.cols??100),rows:dimension.parse(input.rows??30),env:(input.environment??{...processEnvironment(),...configured}) as Record<string,string>,useConpty:true});
  const session=this.register({id:terminalId,projectId,...(threadId?{threadId}:{}),path:binding.path,pty,output:'',offset:0,exited:false,exitCode:null,done:undefined as unknown as Promise<void>});
  if(command!==undefined)pty.write(command+'\r');
  return this.result(session,0);
 }
 /** In-flight starts count against capacity so interleaved directory opens
 * cannot oversubscribe before their PTYs land in the session table. */
 private liveCount(){return[...this.sessions.values()].filter(item=>!item.exited).length+this.directoryStarts.size;}
 private register(session:Session){
  let finish!:()=>void;session.done=new Promise<void>(resolve=>{finish=resolve;});
  this.sessions.set(session.id,session);this.persist(session);
  session.pty.onData(data=>{
   session.output+=data;
   if(session.output.length>512*1024){
    let remove=session.output.length-512*1024;
    const before=session.output.charCodeAt(remove-1),after=session.output.charCodeAt(remove);
    // Preserve the stream's UTF-16 cursor units without returning half a character.
    if(before>=0xd800&&before<=0xdbff&&after>=0xdc00&&after<=0xdfff)remove++;
    session.output=session.output.slice(remove);session.offset+=remove;
   }
  });
  session.pty.onExit(event=>{
   session.exited=true;session.exitCode=event.exitCode;
   // Native exit is definitive even if the separate durable update fails.
   finish();
   try{this.persist(session);}catch{process.stderr.write('Gen V1 could not persist terminal exit state.\n');}
   this.evictExited(session);
  });
  return session;
 }
 /** Join identical concurrent directory starts; reject a different request on the same ID. */
 private startDirectory(args:{projectId:string;threadId?:string;terminalId:string;binding:Awaited<ReturnType<ProjectTools['binding']>>;directory:{path:string;proof:string};cols?:number;rows?:number}):Promise<TerminalResult>{
  const fingerprint=JSON.stringify([args.projectId,args.threadId??null,args.binding.path,args.directory.path]);
  const pending=this.directoryStarts.get(args.terminalId);
  if(pending){if(pending.fingerprint!==fingerprint)throw new HarnessError('CAPABILITY_DENIED','This terminal ID already belongs to another request.');return pending.promise;}
  const reservation={fingerprint,promise:this.openDirectory(args).finally(()=>{if(this.directoryStarts.get(args.terminalId)===reservation)this.directoryStarts.delete(args.terminalId);})};
  this.directoryStarts.set(args.terminalId,reservation);
  return reservation.promise;
 }
 /** A proof-backed launch: the selected folder is passed to the native spawn
 * cwd only — never to the shell, a command, an input write or the layout. */
 private async openDirectory(args:{projectId:string;threadId?:string;terminalId:string;binding:Awaited<ReturnType<ProjectTools['binding']>>;directory:{path:string;proof:string};cols?:number;rows?:number}):Promise<TerminalResult>{
  const{projectId,threadId,terminalId,binding,directory}=args;
  const relativePath=terminalDirectoryPathSchema.parse(directory.path),target=resolve(binding.path,relativePath||'.');
  const existing=this.sessions.get(terminalId);
  if(existing){if(existing.projectId!==projectId||existing.threadId!==threadId||existing.path!==binding.path||existing.directory!==relativePath)throw new HarnessError('CAPABILITY_DENIED','Terminal belongs to another working copy.');if(existing.exited)throw new HarnessError('TERMINAL_ENDED','This terminal ended. Open a new terminal.');return this.result(existing,0);}
  if(this.projects.store.get('terminalSession',terminalId))throw new HarnessError('TERMINAL_ENDED','This terminal ended. Open a new terminal.');
  const resolved=await realpath(target).catch(()=>{throw new HarnessError('CAPABILITY_DENIED','The selected folder is no longer available.')});
  if(!inside(binding.path,resolved)||containsGuardMarker(relative(binding.path,resolved)))throw new HarnessError('CAPABILITY_DENIED','The selected folder cannot be used for a terminal in this workspace.');
  const info=await lstat(target,{bigint:true});
  if(info.isSymbolicLink()||!info.isDirectory())throw new HarnessError('CAPABILITY_DENIED','The selected folder cannot be used for a terminal in this workspace.');
  const subject={projectId,threadId,bindingStamp:this.projects.terminalDirectoryStamp(projectId,binding),path:relativePath,dev:String(info.dev),ino:String(info.ino)};
  if(!terminalDirectoryProofs().verify(directory.proof,subject))throw new HarnessError('CAPABILITY_DENIED','This folder listing changed. Refresh Files and choose it again.');
  const shell=process.platform==='win32'?(process.env.COMSPEC??'C:/Windows/System32/cmd.exe'):(process.env.SHELL??'/bin/sh'),spawnArgs=process.platform==='win32'?['/D','/Q']:[];
  const configured=await environmentSettingsFor(this.projects.store.dataDir).resolve(projectId);
  const current=await this.projects.binding(projectId,threadId);
  if(current.path!==binding.path||current.workspace?.id!==binding.workspace?.id)throw new HarnessError('WORKSPACE_CHANGED','The working copy changed before the terminal could start.');
  // Directory custody pins the exact folder through native process creation;
  // cwd is consumed at fork and the guard releases right after — it is not a
  // sandbox claim on the interactive shell.
  return withPathGuard([{path:target,leaf:false,readOnly:true}],new AbortController().signal,async()=>{
   const again=await lstat(target,{bigint:true});
   if(again.isSymbolicLink()||!again.isDirectory()||String(again.dev)!==subject.dev||String(again.ino)!==subject.ino)throw new HarnessError('CAPABILITY_DENIED','The selected folder changed before the terminal could start.');
   if(!terminalDirectoryProofs().verify(directory.proof,subject))throw new HarnessError('CAPABILITY_DENIED','This folder listing changed. Refresh Files and choose it again.');
   const opened=this.sessions.get(terminalId);
   if(opened){if(opened.projectId!==projectId||opened.threadId!==threadId||opened.path!==binding.path||opened.directory!==relativePath)throw new HarnessError('CAPABILITY_DENIED','Terminal belongs to another working copy.');if(opened.exited)throw new HarnessError('TERMINAL_ENDED','This terminal ended. Open a new terminal.');return this.result(opened,0);}
   if(this.projects.store.get('terminalSession',terminalId))throw new HarnessError('TERMINAL_ENDED','This terminal ended. Open a new terminal.');
   // liveCount already includes this reservation — capacity is not doubled.
   if(this.liveCount()>12)throw new HarnessError('TERMINAL_CAPACITY','Twelve terminals are already running. Stop one before opening another.');
   const pty=spawn(shell,spawnArgs,{name:'xterm-256color',cwd:target,cols:dimension.parse(args.cols??100),rows:dimension.parse(args.rows??30),env:{...processEnvironment(),...configured} as Record<string,string>,useConpty:true});
   try{
    const session=this.register({id:terminalId,projectId,...(threadId?{threadId}:{}),path:binding.path,directory:relativePath,pty,output:'',offset:0,exited:false,exitCode:null,done:undefined as unknown as Promise<void>});
    return this.result(session,0);
   }catch(error){this.sessions.delete(terminalId);try{pty.kill();}catch{/* the process is either unborn or already accountable */}throw error;}
  });
 }
 private persist(session:Session){this.projects.store.internal('terminal.changed',session.threadId??null,()=>this.projects.store.put('terminalSession',session.id,session.threadId??null,{id:session.id,projectId:session.projectId,threadId:session.threadId,exited:session.exited,exitCode:session.exitCode}));}
 /** Exited sessions keep up to 512 KiB of scrollback each; retain only the newest few so the map stays bounded. Reads of evicted ids still resolve TERMINAL_ENDED through the durable record. */
 private evictExited(session:Session){
  // Active terminals may outlive many later starts. Record recency when they exit.
  this.sessions.delete(session.id);this.sessions.set(session.id,session);
  const dead=[...this.sessions.entries()].filter(([,session])=>session.exited);
  for(const [id]of dead.slice(0,Math.max(0,dead.length-48)))this.sessions.delete(id);
 }
 private result(session:Session,cursor:number){const end=session.offset+session.output.length,start=Math.min(end,Math.max(session.offset,cursor));return{id:session.id,projectId:session.projectId,threadId:session.threadId,output:session.output.slice(start-session.offset),start,cursor:end,exited:session.exited,exitCode:session.exitCode};}
 private async owned(id:string,projectId:string,threadId?:string,stopping=false){const session=this.sessions.get(identifier.parse(id));if(!session){const old=this.projects.store.get<{projectId:string;threadId?:string}>('terminalSession',id);if(old&&old.projectId===projectId&&old.threadId===threadId)throw new HarnessError('TERMINAL_ENDED','The host restarted or this terminal ended. Open a new terminal.');throw new HarnessError('NOT_FOUND','Terminal is unavailable.');}if(session.projectId!==projectId||session.threadId!==threadId)throw new HarnessError('CAPABILITY_DENIED','Terminal belongs to another working copy.');if(!stopping){const binding=await this.projects.binding(projectId,threadId);if(session.path!==binding.path)throw new HarnessError('CAPABILITY_DENIED','Terminal belongs to another working copy.');}return session;}
 async read(id:string,projectId:string,threadId?:string,cursor=0){return this.result(await this.owned(id,projectId,threadId),z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).parse(cursor));}
 async command(id:string,projectId:string,threadId:string|undefined,input:Record<string,unknown>){const session=await this.owned(id,projectId,threadId,input.type==='stop');if(input.type==='stop'){if(!session.exited){session.pty.kill();let timer:ReturnType<typeof setTimeout>|undefined;try{await Promise.race([session.done,new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new HarnessError('TERMINAL_CANCEL_UNCONFIRMED','Terminal termination was not confirmed.')),5000);})]);}finally{clearTimeout(timer);}}}else{if(session.exited)throw new HarnessError('TERMINAL_ENDED','The terminal has exited.');if(input.type==='input')session.pty.write(z.string().max(64*1024).parse(input.data));else if(input.type==='resize')session.pty.resize(dimension.parse(input.cols),dimension.parse(input.rows));else throw new HarnessError('INVALID_INPUT','Unknown terminal action.');}return this.result(session,0);}
 async dispose(){const outcomes=await Promise.allSettled([...this.sessions.values()].filter(item=>!item.exited).map(item=>this.command(item.id,item.projectId,item.threadId,{type:'stop'})));const errors=outcomes.flatMap(item=>item.status==='rejected'?[item.reason]:[]);if(errors.length)throw new AggregateError(errors,'Terminal shutdown could not be confirmed.');}
}
