import {dialog, type BrowserWindow} from 'electron';
import {writeFile} from 'node:fs/promises';

const MAX_BYTES=8*1024*1024,MAX_PENDING=4;
const FILENAME=/^terminal-output-\d{8}-\d{6}Z\.txt$/;
const ALLOWED_SURFACES=new Set(['main','thread','workspace']);

export interface TerminalOutputSaveReceipt {status:'saved'|'cancelled';bytes?:number}
export interface TerminalOutputSaveOwner {window:BrowserWindow;kind:string;isCurrent:()=>boolean}

/** Trusted native save path for user-reviewed terminal text: strict payload
 * validation, authorized surfaces only, OS chooser, exact UTF-8 write, bounded
 * pending slots, content-free receipts. */
export function createTerminalOutputSaver(deps:{choose?:(window:BrowserWindow,filename:string)=>Promise<string|undefined>;write?:(path:string,data:Uint8Array)=>Promise<void>}={}){
 const choose=deps.choose??(async(window:BrowserWindow,filename:string)=>{
  const result=await dialog.showSaveDialog(window,{title:'Save terminal output',defaultPath:filename,filters:[{name:'Text',extensions:['txt']}],properties:['showOverwriteConfirmation']});
  return result.canceled?undefined:result.filePath;
 });
 const persist=deps.write??((path:string,data:Uint8Array)=>writeFile(path,data));
 let pending=0;const busyWindows=new Set<number>();
 return async function saveTerminalOutput(owner:TerminalOutputSaveOwner,value:unknown):Promise<TerminalOutputSaveReceipt>{
  if(!ALLOWED_SURFACES.has(owner.kind))throw Error('This window cannot save terminal output.');
  const payload=validateTerminalOutput(value);
  if(pending>=MAX_PENDING||busyWindows.has(owner.window.webContents.id))throw Error('Another terminal output save is still in progress.');
  pending++;busyWindows.add(owner.window.webContents.id);
  try{
   if(!owner.isCurrent())throw Error('The owning window is no longer available.');
   const path=await choose(owner.window,payload.filename);
   if(path===undefined)return{status:'cancelled'};
   if(!owner.isCurrent())throw Error('The owning window is no longer available.');
   const data=new TextEncoder().encode(payload.text);
   await persist(path,data);
   return{status:'saved',bytes:data.length};
  }finally{pending--;busyWindows.delete(owner.window.webContents.id);}
 };
}
function validateTerminalOutput(value:unknown):{text:string;filename:string}{
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)throw Error('Invalid terminal output payload.');
 const record=value as Record<string,unknown>;
 if(Object.keys(record).length!==2)throw Error('Invalid terminal output payload.');
 if(typeof record.text!=='string'||typeof record.filename!=='string')throw Error('Invalid terminal output payload.');
 if(record.filename.length>120||!FILENAME.test(record.filename))throw Error('Invalid terminal output filename.');
 for(const character of record.text)if(character<' '&&character!=='\n'&&character!=='\t')throw Error('Terminal output contains unsupported control characters.');
 if(new TextEncoder().encode(record.text).length>MAX_BYTES)throw Error('Terminal output exceeds the 8 MiB limit.');
 return{text:record.text,filename:record.filename};
}
