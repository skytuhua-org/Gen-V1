import {execFile} from 'node:child_process';

type ExecFile=(file:string,args:string[],options:{windowsHide:boolean;timeout:number},callback:(error:Error|null,stdout:string)=>void)=>void;
export interface TerminalTreeDeps{
 execFile?:ExecFile;
 processKill?:(pid:number,signal:string|number)=>void;
 platform?:NodeJS.Platform;
 systemRoot?:string;
 delay?:(ms:number)=>Promise<void>;
}

const defaultDelay=(ms:number)=>new Promise<void>(resolve=>setTimeout(resolve,ms));
const defaultExec:ExecFile=(file,args,options,callback)=>{execFile(file,args,options,(error,stdout)=>callback(error as Error|null,String(stdout??'')));};

function descendants(rows:string,root:number):number[]{
 const children=new Map<number,number[]>();
 for(const line of rows.split('\n')){
  const parts=line.trim().split(/\s+/);
  if(parts.length<2)continue;
  const pid=Number(parts[0]),ppid=Number(parts[1]);
  if(!Number.isInteger(pid)||!Number.isInteger(ppid))continue;
  const list=children.get(ppid)??[];
  list.push(pid);
  children.set(ppid,list);
 }
 const found:number[]=[],queue=[root];
 while(queue.length){
  const current=queue.shift()!;
  for(const child of children.get(current)??[]){found.push(child);queue.push(child);}
 }
 return found;
}

/** Kill a terminal pty together with any processes it spawned. `node-pty` IPty is not a ChildProcess, so the tree is reached by pid. */
export async function terminateTerminalTree(pty:{pid:number;kill():void},deps:TerminalTreeDeps={}):Promise<void>{
 const platform=deps.platform??process.platform,kill=deps.processKill??((pid:number,signal:string|number)=>process.kill(pid,signal)),run=deps.execFile??defaultExec,delay=deps.delay??defaultDelay;
 if(platform==='win32'){
  const taskkill=`${deps.systemRoot??process.env.SystemRoot??'C:\\Windows'}\\System32\\taskkill.exe`;
  await new Promise<void>(resolve=>run(taskkill,['/PID',String(pty.pid),'/T','/F'],{windowsHide:true,timeout:5000},()=>resolve()));
  pty.kill();
  return;
 }
 let rows:string|undefined;
 try{
  rows=await new Promise<string>((resolve,reject)=>run('ps',['-A','-o','pid=,ppid='],{windowsHide:true,timeout:5000},(error,stdout)=>error?reject(error):resolve(stdout)));
 }catch{
  pty.kill();
  return;
 }
 const tree=descendants(rows,pty.pid);
 for(const pid of tree){
  try{kill(pid,'SIGTERM');}
  catch(error){if((error as NodeJS.ErrnoException).code!=='ESRCH')throw error;}
 }
 pty.kill();
 if(!tree.length)return;
 await delay(2000);
 for(const pid of tree){
  try{kill(pid,0);}
  catch(error){if((error as NodeJS.ErrnoException).code==='ESRCH')continue;continue;}
  try{kill(pid,'SIGKILL');}catch{}
 }
}
