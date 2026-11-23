import {randomUUID} from 'node:crypto';
import {spawn,type IPty} from 'node-pty';
import {z} from 'zod';
import {HarnessError} from '../contracts/index.ts';
import type {ProjectTools} from './tools.ts';
import {processEnvironment} from '../capabilities/process.ts';
import {environmentSettingsFor} from '../core/environment-settings.ts';

interface Session{id:string;projectId:string;threadId?:string;path:string;pty:IPty;output:string;offset:number;exited:boolean;exitCode:number|null;done:Promise<void>;startupFailed?:boolean}
const identifier=z.string().regex(/^[a-zA-Z0-9:_.-]{1,200}$/),dimension=z.number().int().min(2).max(500);
/** Host owns processes; renderer visibility and native reparenting do not own their lifetime. */
export class TerminalHost{
 private readonly sessions=new Map<string,Session>();
 constructor(private readonly projects:ProjectTools){
  const store=projects.store,unfinished=store.all<{id:string;exited:boolean}>('terminalSession').filter(item=>!item.exited);
  if(unfinished.length)store.internal('terminal.recovered',null,()=>{for(const item of unfinished)store.put('terminalSession',item.id,null,{...item,exited:true,exitCode:null,reason:'Host restarted; the previous terminal is no longer attached.'});});
 }
 async open(input:{projectId:string;threadId?:string;terminalId?:string;cols?:number;rows?:number;command?:string;program?:string;args?:string[];environment?:Record<string,string|undefined>}){
  const projectId=identifier.parse(input.projectId),threadId=input.threadId===undefined?undefined:identifier.parse(input.threadId),terminalId=input.terminalId?identifier.parse(input.terminalId):randomUUID();
  const command=input.command?z.string().min(1).max(8000).parse(input.command):undefined;
  const binding=await this.projects.binding(projectId,threadId),existing=this.sessions.get(terminalId);
  if(existing)return this.reopen(existing,projectId,threadId,binding.path);
  if(this.projects.store.get('terminalSession',terminalId))throw new HarnessError('TERMINAL_ENDED','This terminal ended. Open a new terminal.');
  if([...this.sessions.values()].filter(item=>!item.exited).length>=12)throw new HarnessError('TERMINAL_CAPACITY','Twelve terminals are already running. Stop one before opening another.');
  const shell=process.platform==='win32'?(process.env.COMSPEC??'C:/Windows/System32/cmd.exe'):(process.env.SHELL??'/bin/sh'),args=process.platform==='win32'?['/D','/Q']:[];
  const configured=!input.program&&!input.environment?await environmentSettingsFor(this.projects.store.dataDir).resolve(projectId):{};
  const currentBinding=await this.projects.binding(projectId,threadId);
  if(currentBinding.path!==binding.path)throw new HarnessError('CAPABILITY_DENIED','The project binding changed before the terminal could start.');
  // Secret resolution yields. Recheck ownership/capacity synchronously after
  // the final await so concurrent opens cannot orphan an extra process.
  const opened=this.sessions.get(terminalId);
  if(opened)return this.reopen(opened,projectId,threadId,binding.path);
  if(this.projects.store.get('terminalSession',terminalId))throw new HarnessError('TERMINAL_ENDED','This terminal ended. Open a new terminal.');
  if([...this.sessions.values()].filter(item=>!item.exited).length>=12)throw new HarnessError('TERMINAL_CAPACITY','Twelve terminals are already running. Stop one before opening another.');
  // Trusted integration programs retain their explicitly pinned environments.
  const pty=spawn(input.program??shell,input.args??args,{name:'xterm-256color',cwd:binding.path,cols:dimension.parse(input.cols??100),rows:dimension.parse(input.rows??30),env:(input.environment??{...processEnvironment(),...configured}) as Record<string,string>,useConpty:true});
  let finish!:()=>void;const session:Session={id:terminalId,projectId,...(threadId?{threadId}:{}),path:binding.path,pty,output:'',offset:0,exited:false,exitCode:null,done:new Promise<void>(resolve=>{finish=resolve;})};
  let registered=false,observingExit=false;
  const discardFailedStartup=()=>{
   if(this.sessions.get(terminalId)!==session)return;
   if(registered){
    const store=this.projects.store;
    try{store.internal('terminal.changed',threadId??null,()=>store.remove('terminalSession',terminalId));}
    catch{process.stderr.write('Gen V1 could not remove the failed terminal registration.\n');}
   }
   this.sessions.delete(terminalId);
  };
  const onExit=(event:{exitCode:number})=>{
   if(session.exited)return;
   session.exited=true;session.exitCode=event.exitCode;
   // Native exit is definitive even if the separate durable update fails.
   finish();
   if(session.startupFailed){discardFailedStartup();return;}
   if(!registered)return;
   try{this.persist(session);}catch{process.stderr.write('Gen V1 could not persist terminal exit state.\n');}
   this.evictExited(session);
  };

  this.sessions.set(terminalId,session);
  try{
   pty.onExit(onExit);
   observingExit=true;
   pty.onData(data=>{
    session.output+=data;
    if(session.output.length>512*1024){
     let remove=session.output.length-512*1024;
     const before=session.output.charCodeAt(remove-1),after=session.output.charCodeAt(remove);
     // Preserve the stream's UTF-16 cursor units without returning half a character.
     if(before>=0xd800&&before<=0xdbff&&after>=0xdc00&&after<=0xdfff)remove++;
     session.output=session.output.slice(remove);session.offset+=remove;
    }
   });
   this.persist(session);
   registered=true;
   if(session.exited)this.evictExited(session);
   else if(command!==undefined)pty.write(command+'\r');
  }catch(error){
   // Keep the pane reserved and counted until the process actually exits.
   session.startupFailed=true;
   if(!observingExit){
    try{pty.onExit(onExit);}catch{/* Still request termination if exit cannot be observed. */}
   }
   if(session.exited)discardFailedStartup();
   else{
    try{await this.stop(session);}
    catch{if(!session.exited)throw new HarnessError('TERMINAL_CANCEL_UNCONFIRMED','The failed terminal launch could not be confirmed closed.');}
   }
   throw error;
  }
  return this.result(session,0);
 }
 private assertStartupAvailable(session:Session){if(session.startupFailed)throw new HarnessError('TERMINAL_CANCEL_UNCONFIRMED','The failed terminal launch is still closing.');}
 private reopen(session:Session,projectId:string,threadId:string|undefined,path:string){
  if(session.projectId!==projectId||session.threadId!==threadId||session.path!==path)throw new HarnessError('CAPABILITY_DENIED','Terminal belongs to another working copy.');
  this.assertStartupAvailable(session);
  if(session.exited)throw new HarnessError('TERMINAL_ENDED','This terminal ended. Open a new terminal.');
  return this.result(session,0);
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
 private async owned(id:string,projectId:string,threadId?:string,stopping=false){const session=this.sessions.get(identifier.parse(id));if(!session){const old=this.projects.store.get<{projectId:string;threadId?:string}>('terminalSession',id);if(old&&old.projectId===projectId&&old.threadId===threadId)throw new HarnessError('TERMINAL_ENDED','The host restarted or this terminal ended. Open a new terminal.');throw new HarnessError('NOT_FOUND','Terminal is unavailable.');}if(session.projectId!==projectId||session.threadId!==threadId)throw new HarnessError('CAPABILITY_DENIED','Terminal belongs to another working copy.');if(!stopping){const binding=await this.projects.binding(projectId,threadId);if(session.path!==binding.path)throw new HarnessError('CAPABILITY_DENIED','Terminal belongs to another working copy.');this.assertStartupAvailable(session);}return session;}
 async read(id:string,projectId:string,threadId?:string,cursor=0){return this.result(await this.owned(id,projectId,threadId),z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).parse(cursor));}
 private async stop(session:Session){
  if(session.exited)return;
  session.pty.kill();
  let timer:ReturnType<typeof setTimeout>|undefined;
  try{await Promise.race([session.done,new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new HarnessError('TERMINAL_CANCEL_UNCONFIRMED','Terminal termination was not confirmed.')),5000);})]);}
  finally{clearTimeout(timer);}
 }
 async command(id:string,projectId:string,threadId:string|undefined,input:Record<string,unknown>){const session=await this.owned(id,projectId,threadId,input.type==='stop');if(input.type==='stop')await this.stop(session);else{if(session.exited)throw new HarnessError('TERMINAL_ENDED','The terminal has exited.');if(input.type==='input')session.pty.write(z.string().max(64*1024).parse(input.data));else if(input.type==='resize')session.pty.resize(dimension.parse(input.cols),dimension.parse(input.rows));else throw new HarnessError('INVALID_INPUT','Unknown terminal action.');}return this.result(session,0);}
 async dispose(){const outcomes=await Promise.allSettled([...this.sessions.values()].filter(item=>!item.exited).map(item=>this.command(item.id,item.projectId,item.threadId,{type:'stop'})));const errors=outcomes.flatMap(item=>item.status==='rejected'?[item.reason]:[]);if(errors.length)throw new AggregateError(errors,'Terminal shutdown could not be confirmed.');}
}
