import {randomUUID} from 'node:crypto';
import {spawn,type IPty} from 'node-pty';
import {z} from 'zod';
import {HarnessError,type Thread} from '../contracts/index.ts';
import type {ProjectSummary} from '../contracts/workspace.ts';
import {digest} from '../storage/store.ts';
import type {ProjectTools,WorkspaceBinding} from './tools.ts';
import {processEnvironment} from '../capabilities/process.ts';
import {environmentSettingsFor} from '../core/environment-settings.ts';

const scriptRejections={
 CAPABILITY_DENIED:'Project script access changed. Select its original project and thread.',
 HOST_CLOSING:'Gen is closing. The script was not sent.',
 NOT_FOUND:'Project script is unavailable.',
 PROJECT_NOT_CONNECTED:'Connect this project to a local folder.',
 TERMINAL_CAPACITY:'Twelve terminals are already running. Stop one before opening another.',
 TERMINAL_ENDED:'The terminal ended before the script was sent.',
 TERMINAL_START_FAILED:'The terminal could not start. The script was not sent.',
} as const;
type ScriptRejection=keyof typeof scriptRejections;
type ScriptIntent={owner:string;terminalId:string}&(
 {state:'pending'|'accepted'}|{state:'not-applied';code:ScriptRejection}
);
function scriptRejection(code:ScriptRejection){return new HarnessError(code,scriptRejections[code]);}
interface TerminalOpenInput {
 projectId:string;threadId?:string;terminalId?:string;cols?:number;rows?:number;
 program?:string;args?:string[];environment?:Record<string,string|undefined>;
}
interface StoredScriptStartup {check:()=>string;attempt:()=>void}
interface Session{id:string;projectId:string;threadId?:string;path:string;pty:IPty;output:string;offset:number;exited:boolean;exitCode:number|null;done:Promise<void>;startupFailed?:boolean}
const identifier=z.string().regex(/^[a-zA-Z0-9:_.-]{1,200}$/),dimension=z.number().int().min(2).max(500);
/** Host owns processes; renderer visibility and native reparenting do not own their lifetime. */
export class TerminalHost{
 private readonly sessions=new Map<string,Session>();
 private closing=false;
 constructor(private readonly projects:ProjectTools){
  const store=projects.store,unfinished=store.all<{id:string;exited:boolean}>('terminalSession').filter(item=>!item.exited);
  if(unfinished.length)store.internal('terminal.recovered',null,()=>{for(const item of unfinished)store.put('terminalSession',item.id,null,{...item,exited:true,exitCode:null,reason:'Host restarted; the previous terminal is no longer attached.'});});
 }
 private assertOpen(){if(this.closing)throw new HarnessError('HOST_CLOSING','Gen is closing. No new terminal can start.');}
 async open(input:TerminalOpenInput){
  return this.#start(input);
 }
 async #start(input:TerminalOpenInput,script?:StoredScriptStartup){
  this.assertOpen();
  const projectId=identifier.parse(input.projectId),threadId=input.threadId===undefined?undefined:identifier.parse(input.threadId),terminalId=input.terminalId?identifier.parse(input.terminalId):randomUUID();
  const binding=await this.projects.binding(projectId,threadId);
  this.assertOpen();
  const existing=this.reopen(this.sessions.get(terminalId),projectId,threadId,binding.path);
  if(existing)return existing;
  if(this.projects.store.get('terminalSession',terminalId))throw new HarnessError('TERMINAL_ENDED','This terminal ended. Open a new terminal.');
  if([...this.sessions.values()].filter(item=>!item.exited).length>=12)throw new HarnessError('TERMINAL_CAPACITY','Twelve terminals are already running. Stop one before opening another.');
  const shell=process.platform==='win32'?(process.env.COMSPEC??'C:/Windows/System32/cmd.exe'):(process.env.SHELL??'/bin/sh'),args=process.platform==='win32'?['/D','/Q']:[];
  const configured=!input.program&&!input.environment?await environmentSettingsFor(this.projects.store.dataDir).resolve(projectId):{};
  this.assertOpen();
  const currentBinding=await this.projects.binding(projectId,threadId);
  this.assertOpen();
  if(currentBinding.path!==binding.path)throw new HarnessError('CAPABILITY_DENIED','The project binding changed before the terminal could start.');
  // Secret resolution yields. Recheck ownership/capacity synchronously after
  // the final await so concurrent opens cannot orphan an extra process.
  const opened=this.reopen(this.sessions.get(terminalId),projectId,threadId,binding.path);
  if(opened)return opened;
  if(this.projects.store.get('terminalSession',terminalId))throw new HarnessError('TERMINAL_ENDED','This terminal ended. Open a new terminal.');
  if([...this.sessions.values()].filter(item=>!item.exited).length>=12)throw new HarnessError('TERMINAL_CAPACITY','Twelve terminals are already running. Stop one before opening another.');
  script?.check();
  // Trusted integration programs retain their explicitly pinned environments.
  const options={name:'xterm-256color',cwd:binding.path,cols:dimension.parse(input.cols??100),rows:dimension.parse(input.rows??30),env:(input.environment??{...processEnvironment(),...configured}) as Record<string,string>,useConpty:true};
  let pty:IPty;
  try{pty=spawn(input.program??shell,input.args??args,options);}
  catch(error){if(script)throw scriptRejection('TERMINAL_START_FAILED');throw error;}
  let finish!:()=>void;const session:Session={id:terminalId,projectId,...(threadId?{threadId}:{}),path:binding.path,pty,output:'',offset:0,exited:false,exitCode:null,done:new Promise<void>(resolve=>{finish=resolve;})};
  let registered=false,observingExit=false;
  const discardFailedStartup=()=>{
   try{this.discardFailedStartup(session);}
   catch{process.stderr.write('Gen V1 could not remove the failed terminal registration.\n');}
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
   else if(script){
    this.assertOpen();
    const command=script.check();
    script.attempt();
    pty.write(command+'\r');
   }
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
 private scriptScope(projectId:string,threadId:string|undefined,scriptId:string){
  const store=this.projects.store,project=store.get<ProjectSummary>('workspaceProject',projectId);
  const thread=threadId?store.get<Thread>('thread',threadId):null;
  const workspace=thread?.workspaceId?store.get<WorkspaceBinding>('workspaceBinding',thread.workspaceId):null;
  if(project?.id!==projectId||project.authority.kind!=='local'||
   (threadId&&(!thread||thread.id!==threadId||thread.projectId!==projectId||thread.kind==='delegate'||thread.kind==='side'||thread.sideParentId||store.get('archivedThread',threadId)))||
   (thread?.workspaceId&&(!workspace||workspace.id!==thread.workspaceId||workspace.threadId!==threadId||workspace.projectId!==projectId))){
   throw scriptRejection('CAPABILITY_DENIED');
  }
  const script=store.get<{projectId:string;command:string}>('projectScript',scriptId);
  if(!script||script.projectId!==projectId)throw new HarnessError('NOT_FOUND','Project script is unavailable.');
  const command=z.string().min(1).max(8000).parse(script.command);
  const owner=digest([project.authority,store.get('workspaceProjectRoot',projectId),workspace,
   thread&&[thread.id,thread.projectId,thread.workspaceId,thread.epoch,thread.kind],digest(command)]);
  return{command,owner,threadEpoch:thread?.epoch};
 }
 /** A deliberate local click owns one write, including across host restarts. */
 async runScript(projectId:string,threadId:string|undefined,scriptId:string,operationId:string,expectedThreadEpoch?:number){
  const store=this.projects.store;
  if(threadId ? expectedThreadEpoch===undefined||!Number.isSafeInteger(expectedThreadEpoch)||expectedThreadEpoch<0 : expectedThreadEpoch!==undefined){
   throw new HarnessError('INVALID_INPUT','The script request must match the current conversation. Reopen Project tools and try again.');
  }
  const action={id:operationId,type:'project.run-script',threadId,payload:{projectId,scriptId,...(threadId?{expectedThreadEpoch}:{})}};
  // Validate reused IDs before looking up another project's script.
  store.receipt(action);
  const {owner,threadEpoch}=this.scriptScope(projectId,threadId,scriptId);
  if(threadEpoch!==expectedThreadEpoch)throw new HarnessError('REVISION_CHANGED','Conversation changed. Reopen Project tools and run the script again.');
  const requireOwner=(actual:string)=>{if(actual!==owner)throw scriptRejection('CAPABILITY_DENIED');};
  const uncertain=()=>new HarnessError('ACTION_UNCERTAIN','The script write could not be confirmed. Inspect the original terminal before running the script again.');
  await this.projects.binding(projectId,threadId);
  requireOwner(this.scriptScope(projectId,threadId,scriptId).owner);
  const proposed:ScriptIntent={owner,terminalId:randomUUID(),state:'pending'};
  // The command receipt reserves the ID atomically with the private intent.
  // It holds no script text or terminal output.
  store.command(action,()=>{store.put('projectScriptIntent',operationId,threadId??null,proposed);});
  const intent=store.get<ScriptIntent>('projectScriptIntent',operationId);
  if(!intent)throw uncertain();
  requireOwner(intent.owner);
  if(intent.terminalId!==proposed.terminalId){
   if(intent.state==='not-applied')throw scriptRejection(intent.code);
   if(intent.state!=='accepted')throw uncertain();
   const live=this.sessions.get(intent.terminalId);
   if(live&&live.projectId===projectId&&live.threadId===threadId)return this.result(live,0);
   const saved=store.get<{projectId:string;threadId?:string;exited:boolean;exitCode:number|null}>('terminalSession',intent.terminalId);
   if(!saved||saved.projectId!==projectId||saved.threadId!==threadId||!saved.exited)throw uncertain();
   return{id:intent.terminalId,projectId,threadId,output:'',start:0,cursor:0,exited:true,exitCode:saved.exitCode};
  }
  let attempted=false;
  try{
   const check=()=>{
    const current=store.get<ScriptIntent>('projectScriptIntent',operationId);
    if(!current||current.state!=='pending'||current.terminalId!==intent.terminalId||current.owner!==owner)throw uncertain();
    const scope=this.scriptScope(projectId,threadId,scriptId);
    requireOwner(scope.owner);
    return scope.command;
   };
   const result=await this.#start({projectId,threadId,terminalId:intent.terminalId},{check,attempt:()=>{attempted=true;}});
   if(!attempted)throw scriptRejection('TERMINAL_ENDED');
   store.internal('project.script.accepted',threadId??null,()=>{
    store.put('projectScriptIntent',operationId,threadId??null,{...intent,state:'accepted'});
   });
   return result;
  }catch(error){
   if(attempted||!(error instanceof HarnessError)||!Object.hasOwn(scriptRejections,error.code))throw uncertain();
   const code=error.code as ScriptRejection;
   try{
    store.internal('project.script.not-applied',threadId??null,()=>{
     store.put('projectScriptIntent',operationId,threadId??null,{...intent,state:'not-applied',code});
    });
   }catch{throw uncertain();}
   throw scriptRejection(code);
  }
 }
 private assertStartupAvailable(session:Session){if(session.startupFailed)throw new HarnessError('TERMINAL_CANCEL_UNCONFIRMED','The failed terminal launch is still closing.');}
 private discardFailedStartup(session:Session){
  if(this.sessions.get(session.id)!==session)return;
  const store=this.projects.store;
  if(store.get('terminalSession',session.id))store.internal('terminal.changed',session.threadId??null,()=>store.remove('terminalSession',session.id));
  this.sessions.delete(session.id);
 }
 private reopen(session:Session|undefined,projectId:string,threadId:string|undefined,path:string){
  if(!session)return;
  if(session.projectId!==projectId||session.threadId!==threadId||session.path!==path)throw new HarnessError('CAPABILITY_DENIED','Terminal belongs to another working copy.');
  // A confirmed exit can be reopened after its durable rollback is retried.
  if(session.startupFailed&&session.exited){this.discardFailedStartup(session);return;}
  this.assertStartupAvailable(session);
  if(session.exited)throw new HarnessError('TERMINAL_ENDED','This terminal ended. Open a new terminal.');
  return this.result(session,0);
 }
 private persist(session:Session){this.projects.store.internal('terminal.changed',session.threadId??null,()=>this.projects.store.put('terminalSession',session.id,session.threadId??null,{id:session.id,projectId:session.projectId,threadId:session.threadId,exited:session.exited,exitCode:session.exitCode}));}
 /** Exited sessions keep up to 512 KiB of scrollback each; retain only the newest few so the map stays bounded. Reads of evicted ids still resolve TERMINAL_ENDED through the durable record. */
 private evictExited(session:Session){
  // Active terminals may outlive many later starts. Record recency when they exit.
  this.sessions.delete(session.id);this.sessions.set(session.id,session);
  const dead=[...this.sessions.entries()].filter(([,session])=>session.exited&&!session.startupFailed);
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
 async command(id:string,projectId:string,threadId:string|undefined,input:Record<string,unknown>){
  const session=await this.owned(id,projectId,threadId,input.type==='stop');
  if(input.type==='stop'){
   await this.stop(session);
   if(session.startupFailed)this.discardFailedStartup(session);
  }else{
   if(session.exited)throw new HarnessError('TERMINAL_ENDED','The terminal has exited.');
   if(input.type==='input')session.pty.write(z.string().max(64*1024).parse(input.data));
   else if(input.type==='resize')session.pty.resize(dimension.parse(input.cols),dimension.parse(input.rows));
   else throw new HarnessError('INVALID_INPUT','Unknown terminal action.');
  }
  return this.result(session,0);
 }
 async dispose(){
  // Disposal can run before in-flight HTTP handlers finish resolving their bindings.
  this.closing=true;
  const outcomes=await Promise.allSettled([...this.sessions.values()].filter(item=>!item.exited||item.startupFailed).map(item=>this.command(item.id,item.projectId,item.threadId,{type:'stop'})));const errors=outcomes.flatMap(item=>item.status==='rejected'?[item.reason]:[]);if(errors.length)throw new AggregateError(errors,'Terminal shutdown could not be confirmed.');}
}
