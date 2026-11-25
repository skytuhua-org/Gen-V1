import {describe,expect,it,vi} from 'vitest';
import {spawn} from 'node:child_process';
import {terminateTerminalTree,type TerminalTreeDeps} from '../packages/workspace/terminal-tree.ts';

const pty=(pid=10)=>({pid,kill:vi.fn()});

function makeDeps(overrides:Partial<TerminalTreeDeps>={}):{deps:TerminalTreeDeps;calls:{file:string;args:string[]}[];kills:{pid:number;signal:string|number}[]}{
 const calls:{file:string;args:string[]}[]=[],kills:{pid:number;signal:string|number}[]=[];
 const deps:TerminalTreeDeps={
  execFile:(file,args,_options,callback)=>{calls.push({file,args});callback(null,overrides.execFile?'' :'10 1\n11 10\n12 11\n13 1');},
  processKill:(pid,signal)=>{kills.push({pid,signal});if(kills.filter(k=>k.pid===pid&&k.signal===0).length>0&&kills.some(k=>k.pid===pid&&k.signal==='SIGKILL'))throw Object.assign(new Error('gone'),{code:'ESRCH'});},
  platform:'linux',
  delay:async()=>{},
  ...overrides,
 };
 return{deps,calls,kills};
}

describe('terminateTerminalTree',()=>{
 it('runs taskkill then kills the pty on Windows',async()=>{
  const calls:{file:string;args:string[]}[]=[];
  const target=pty();
  await terminateTerminalTree(target,{platform:'win32',systemRoot:'D:\\Win',execFile:(file,args,_o,cb)=>{calls.push({file,args});cb(null,'');}});
  expect(calls).toEqual([{file:'D:\\Win\\System32\\taskkill.exe',args:['/PID','10','/T','/F']}]);
  expect(target.kill).toHaveBeenCalled();
 });
 it('signals POSIX descendants and not unrelated processes',async()=>{
  const{deps,kills}=makeDeps();
  const target=pty();
  await terminateTerminalTree(target,deps);
  expect(kills).toEqual([{pid:11,signal:'SIGTERM'},{pid:12,signal:'SIGTERM'},{pid:11,signal:0},{pid:11,signal:'SIGKILL'},{pid:12,signal:0},{pid:12,signal:'SIGKILL'}]);
  expect(kills.some(k=>k.pid===13)).toBe(false);
  expect(target.kill).toHaveBeenCalled();
 });
 it('falls back to pty.kill when ps fails',async()=>{
  const target=pty();
  await terminateTerminalTree(target,{platform:'linux',execFile:(_f,_a,_o,cb)=>cb(new Error('no ps'),''),delay:async()=>{}});
  expect(target.kill).toHaveBeenCalled();
 });
 it('kills a real process tree',async()=>{
  if(process.platform==='win32')return;
  const child=spawn(process.execPath,['-e',`const {spawn}=require('node:child_process');const child=spawn(process.execPath,['-e','setInterval(()=>{},1000)'],{stdio:'ignore'});child.once('error',error=>{process.stderr.write(String(error));process.exitCode=1;});child.once('spawn',()=>process.stdout.write(String(child.pid)));`],{stdio:['ignore','pipe','ignore']});
  const grandchild=await new Promise<number>((resolve,reject)=>{child.once('error',reject);child.stdout.once('data',data=>resolve(Number(String(data).trim())));});
  const pid=child.pid!;
  const wrapper={pid,kill:()=>{child.kill('SIGTERM');}};
  await terminateTerminalTree(wrapper,{delay:ms=>new Promise(r=>setTimeout(r,ms))});
  await new Promise(r=>setTimeout(r,100));
  await expect(new Promise<boolean>(resolve=>{try{process.kill(grandchild,0);resolve(true);}catch{resolve(false);}})).resolves.toBe(false);
 },10000);
});
