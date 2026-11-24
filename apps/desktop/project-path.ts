import {basename} from 'node:path';
import {desktopOpenBlocked,type DesktopProjectPathRequest,type DesktopProjectPathResult} from '../../packages/desktop-contract/index.ts';

export interface ProjectPathResolution {path:string;kind:'file'|'directory';openable:boolean}
export interface ProjectPathShell {showItemInFolder(path:string):void;openPath(path:string):Promise<string>}

const absolute=(value:string)=>value.length>0&&value.length<=4096&&(value.startsWith('/')||/^[A-Za-z]:[\\/]/.test(value)||value.startsWith('\\\\'));

/** Reveal or open a project file through the OS shell, with the R05 program/script block. */
export async function runProjectPath({request,resolve,shell}:{request:DesktopProjectPathRequest;resolve(request:DesktopProjectPathRequest):Promise<ProjectPathResolution>;shell:ProjectPathShell}):Promise<DesktopProjectPathResult> {
 const entry=await resolve(request);
 if(typeof entry.path!=='string'||!absolute(entry.path))throw Error('The project path is unavailable.');
 if(request.action==='reveal'){shell.showItemInFolder(entry.path);return{action:'reveal'};}
 if(entry.openable!==true||desktopOpenBlocked(basename(entry.path)))throw Error('Open is turned off for programs and scripts.');
 const error=await shell.openPath(entry.path);
 if(error)throw Error(`Windows could not open this file. ${String(error).slice(0,200)}`);
 return{action:'open'};
}
