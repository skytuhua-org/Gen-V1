import {lstat} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {HarnessError} from '../contracts/index.ts';

const fail=()=>new HarnessError('TRASH_FAILED',"Couldn't move the file to the Recycle Bin. It was not changed.");

/**
 * Move one file to the Windows Recycle Bin via a fixed, profile-free
 * PowerShell invocation; the path travels in an environment variable, never
 * in the script text. Other hosts have no bin, so they refuse outright and
 * leave the file in place.
 */
export async function moveToRecycleBin(target:string,signal:AbortSignal):Promise<void>{
 if(process.platform!=='win32')throw new HarnessError('TRASH_UNAVAILABLE','The Recycle Bin is only available on Windows. The file was not changed.');
 const shell=(process.env.SystemRoot??'C:/Windows')+'/System32/WindowsPowerShell/v1.0/powershell.exe';
 await new Promise<void>((accept,reject)=>{
  const child=spawn(shell,['-NoLogo','-NoProfile','-NonInteractive','-Command',"Add-Type -AssemblyName Microsoft.VisualBasic; [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile($env:GEN_TRASH_PATH, 'OnlyErrorDialogs', 'SendToRecycleBin')"],{windowsHide:true,stdio:'ignore',env:{...process.env,GEN_TRASH_PATH:target}});
  const timer=setTimeout(()=>{child.kill();reject(fail());},10_000);
  const drop=(error:unknown)=>{clearTimeout(timer);reject(error instanceof Error?error:fail());};
  signal.addEventListener('abort',()=>{child.kill();drop(new HarnessError('CANCELLED','Discard cancelled.'));},{once:true});
  child.once('error',()=>drop(fail()));
  child.once('exit',code=>{clearTimeout(timer);if(code===0)accept();else reject(fail());});
 });
 try{await lstat(target);}catch(error){if((error as NodeJS.ErrnoException).code==='ENOENT')return;throw error;}
 throw fail();
}
