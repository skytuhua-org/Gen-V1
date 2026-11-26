import {connect} from 'node:net';
import {createLineCarry,detectAddresses} from './dev-server-detect.ts';

/** Terminal metadata passed to the tracker observer; no pty handle crosses this boundary. */
export interface SessionInfo{id:string;projectId:string;threadId?:string;startedAt:string;scriptName:string|null;label:string|null}

export interface DevServerRow{
 id:string;projectId:string;threadId:string|null;terminalId:string;
 url:string;port:number;label:string;source:'script'|'terminal';scriptName:string|null;
 startedAt:string;detectedAt:string;
}

interface Candidate{info:SessionInfo;url:string;port:number;attempts:number;timer:unknown}
interface Confirmed{row:DevServerRow;fails:number}

export interface DevServerDeps{
 probe?:(host:string,port:number)=>Promise<boolean>;
 now?:()=>number;
 setTimer?:(fn:()=>void,ms:number)=>unknown;
 clearTimer?:(timer:unknown)=>void;
 timestamp?:()=>string;
}

const probeOnce=(host:string,port:number)=>new Promise<boolean>(resolve=>{
 const socket=connect({host,port});
 let done=false;
 const finish=(ok:boolean)=>{if(done)return;done=true;socket.destroy();resolve(ok);};
 socket.setTimeout(750,()=>finish(false));
 socket.once('connect',()=>finish(true));
 socket.once('error',()=>finish(false));
});
/** Probes the announced listener. A named `localhost` tries both stacks; a literal address is probed exactly, so a server bound to e.g. 127.0.0.2 still confirms. */
const defaultProbe=async(host:string,port:number)=>{
 for(const target of host==='localhost'?['127.0.0.1','::1']:[host])if(await probeOnce(target,port))return true;
 return false;
};

const probeHost=(url:string)=>{const host=new URL(url).hostname;return host.startsWith('[')?host.slice(1,-1):host;};

const PER_TERMINAL_CAP=8,GLOBAL_CAP=32,RETRY_MS=1000,MAX_ATTEMPTS=5,REPROBE_MS=10*1000,IDLE_MS=30*1000;

/** Tracks dev servers announced in terminal output: a printed loopback address becomes a candidate, is confirmed by TCP probes, and is re-probed while anyone keeps reading the list. */
export class DevServerTracker{
 private readonly carries=new Map<string,ReturnType<typeof createLineCarry>>();
 private readonly candidates=new Map<string,Candidate>();
 private readonly rows=new Map<string,Confirmed>();
 private readonly probe:(host:string,port:number)=>Promise<boolean>;
 private readonly now:()=>number;
 private readonly setTimer:(fn:()=>void,ms:number)=>unknown;
 private readonly clearTimer:(timer:unknown)=>void;
 private readonly timestamp:()=>string;
 private lastReadAt:number;
 private reprobe:unknown;
 private readonly tailTimers=new Map<string,unknown>();
 constructor(deps:DevServerDeps={}){
  this.probe=deps.probe??defaultProbe;
  this.now=deps.now??Date.now;
  this.setTimer=deps.setTimer??((fn,ms)=>setTimeout(fn,ms));
  this.clearTimer=deps.clearTimer??(timer=>clearTimeout(timer as NodeJS.Timeout));
  this.timestamp=deps.timestamp??(()=>new Date().toISOString());
  this.lastReadAt=this.now();
  this.reprobe=this.setTimer(()=>this.reprobeTick(),REPROBE_MS);
 }
 output(info:SessionInfo,chunk:string){
  let carry=this.carries.get(info.id);
  if(!carry){carry=createLineCarry();this.carries.set(info.id,carry);}
  const text=carry.feed(chunk);
  const existing=this.tailTimers.get(info.id);
  if(existing!==undefined)this.clearTimer(existing);
  this.tailTimers.set(info.id,this.setTimer(()=>{this.tailTimers.delete(info.id);const pending=this.carries.get(info.id)?.pending();if(pending)this.scan(info,pending);},RETRY_MS));
  this.scan(info,text);
 }
 private scan(info:SessionInfo,text:string){
  for(const found of detectAddresses(text)){
   const key=`${info.id}:${found.port}`;
   if(this.candidates.has(key)||this.rows.has(key))continue;
   if(this.portTaken(found.port))continue;
   if(this.terminalCount(info.id)>=PER_TERMINAL_CAP||this.candidates.size+this.rows.size>=GLOBAL_CAP)continue;
   const candidate:Candidate={info,url:found.url,port:found.port,attempts:0,timer:undefined};
   this.candidates.set(key,candidate);
   this.attempt(key,candidate);
  }
 }
 private attempt(key:string,candidate:Candidate){
  void this.probe(probeHost(candidate.url),candidate.port).then(ok=>{
   if(this.candidates.get(key)!==candidate)return;
   if(ok){this.confirm(key,candidate);return;}
   candidate.attempts++;
   if(candidate.attempts>MAX_ATTEMPTS){this.candidates.delete(key);return;}
   candidate.timer=this.setTimer(()=>this.attempt(key,candidate),RETRY_MS);
  },()=>{if(this.candidates.get(key)===candidate)this.candidates.delete(key);});
 }
 private confirm(key:string,candidate:Candidate){
  this.candidates.delete(key);
  if(candidate.timer!==undefined)this.clearTimer(candidate.timer);
  const {info}=candidate;
  this.rows.set(key,{fails:0,row:{
   id:key,projectId:info.projectId,threadId:info.threadId??null,terminalId:info.id,
   url:candidate.url,port:candidate.port,label:info.label??'Terminal',source:info.scriptName?'script':'terminal',scriptName:info.scriptName,
   startedAt:info.startedAt,detectedAt:this.timestamp(),
  }});
 }
 private reprobeTick(){
  this.reprobe=this.setTimer(()=>this.reprobeTick(),REPROBE_MS);
  if(this.now()-this.lastReadAt>IDLE_MS)return;
  for(const [key,confirmed]of [...this.rows]){
   void this.probe(probeHost(confirmed.row.url),confirmed.row.port).then(ok=>{
    if(this.rows.get(key)!==confirmed)return;
    if(ok){confirmed.fails=0;return;}
    if(++confirmed.fails>=2)this.rows.delete(key);
   },()=>{});
  }
 }
 private portTaken(port:number){
  for(const candidate of this.candidates.values())if(candidate.port===port)return true;
  for(const confirmed of this.rows.values())if(confirmed.row.port===port)return true;
  return false;
 }
 private terminalCount(id:string){
  let count=0;
  for(const candidate of this.candidates.values())if(candidate.info.id===id)count++;
  for(const confirmed of this.rows.values())if(confirmed.row.terminalId===id)count++;
  return count;
 }
 exit(info:SessionInfo){
  for(const [key,candidate]of [...this.candidates])if(candidate.info.id===info.id){if(candidate.timer!==undefined)this.clearTimer(candidate.timer);this.candidates.delete(key);}
  for(const [key,confirmed]of [...this.rows])if(confirmed.row.terminalId===info.id)this.rows.delete(key);
  const tail=this.tailTimers.get(info.id);
  if(tail!==undefined)this.clearTimer(tail);
  this.tailTimers.delete(info.id);
  this.carries.delete(info.id);
 }
 /** Rows for one project; reading keeps the re-probe loop active for another idle window. */
 list(projectId:string):DevServerRow[]{
  this.lastReadAt=this.now();
  return [...this.rows.values()].map(confirmed=>confirmed.row).filter(row=>row.projectId===projectId);
 }
 /** Every confirmed row, for host-level prompts like the quit dialog. */
 all():DevServerRow[]{
  this.lastReadAt=this.now();
  return [...this.rows.values()].map(confirmed=>confirmed.row);
 }
 count():number{return this.rows.size;}
 dispose(){
  this.clearTimer(this.reprobe);
  for(const candidate of this.candidates.values())if(candidate.timer!==undefined)this.clearTimer(candidate.timer);
  for(const timer of this.tailTimers.values())this.clearTimer(timer);
  this.tailTimers.clear();
  this.candidates.clear();this.rows.clear();this.carries.clear();
 }
}
