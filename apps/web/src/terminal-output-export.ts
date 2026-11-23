import type {Terminal} from '@xterm/xterm';

/** Snapshot of the xterm normal (primary) buffer, frozen at a parse barrier. */
export interface TerminalOutputSnapshot {text:string;bytes:number;capturedAt:string;rows:number;lines:number;filename:string}
export const TERMINAL_OUTPUT_MAX_BYTES=8*1024*1024;
export class TerminalOutputTooLarge extends Error{constructor(){super('The retained terminal output exceeds the 8 MiB limit.');}}
export class TerminalOutputBufferUnavailable extends Error{constructor(){super('The terminal is not showing its primary output.');}}

const pad=(value:number)=>String(value).padStart(2,'0');
export function terminalOutputFilename(date:Date):string{
 if(!Number.isFinite(date.getTime()))throw new Error('The capture time is invalid.');
 return `terminal-output-${date.getUTCFullYear()}${pad(date.getUTCMonth()+1)}${pad(date.getUTCDate())}-${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z.txt`;
}

/** Serialize the retained normal buffer: physical rows joined with LF at real
 * line breaks, wrapped rows concatenated, trailing whitespace trimmed per row. */
export function captureTerminalOutput(terminal:{buffer:{active:{type:string};normal:ReadableBuffer}},now=new Date()):TerminalOutputSnapshot{
 if(terminal.buffer.active.type!=='normal')throw new TerminalOutputBufferUnavailable();
 const buffer=terminal.buffer.normal;
 if(!buffer)throw new TerminalOutputBufferUnavailable();
 const boundary=Math.max(buffer.baseY+buffer.cursorY,lastTextRow(buffer));
 const encoder=new TextEncoder();
 let text='',bytes=0,rows=0,lines=0;
 for(let index=0;index<=boundary;index++){
  const line=buffer.getLine(index);if(!line)continue;
  const endsLogical=!buffer.getLine(index+1)?.isWrapped;
  const chunk=(rows>0&&!line.isWrapped?'\n':'')+line.translateToString(endsLogical);
  bytes+=encoder.encode(chunk).length;
  if(bytes>TERMINAL_OUTPUT_MAX_BYTES)throw new TerminalOutputTooLarge();
  text+=chunk;rows++;if(!line.isWrapped)lines++;
 }
 return{text,bytes,capturedAt:now.toISOString(),rows,lines,filename:terminalOutputFilename(now)};
}
type ReadableBuffer={length:number;baseY:number;cursorY:number;getLine(index:number):{isWrapped:boolean;translateToString(trimRight?:boolean):string}|undefined};
function lastTextRow(buffer:ReadableBuffer):number{
 for(let index=buffer.length-1;index>=0;index--){const line=buffer.getLine(index);if(line&&line.translateToString(true).trim().length>0)return index;}
 return 0;
}

/** Queue a zero-length write as a parse barrier, then capture inside the
 * callback so every earlier queued write has been applied. */
export function captureTerminalOutputBarrier(terminal:Terminal,now=new Date()):Promise<TerminalOutputSnapshot>{
 return new Promise((resolve,reject)=>{terminal.write('',()=>{try{resolve(captureTerminalOutput(terminal,now));}catch(error){reject(error);}});});
}

export type TerminalSaveOutcome='started'|'saved'|'cancelled';
export interface TerminalOutputSaver{saveTerminalOutput?(payload:{text:string;filename:string}):Promise<{status:string}|undefined>}

/** Save through the native desktop bridge when it offers the channel, else a
 * browser download. Never falls back inside the desktop branch. */
export async function saveTerminalOutput(snapshot:TerminalOutputSnapshot,bridge?:TerminalOutputSaver|null):Promise<TerminalSaveOutcome>{
 if(bridge!==undefined){
  if(!bridge?.saveTerminalOutput)throw new Error('This desktop version cannot save terminal output. Update the app and try again.');
  const receipt=await bridge.saveTerminalOutput({text:snapshot.text,filename:snapshot.filename});
  return receipt?.status==='saved'?'saved':'cancelled';
 }
 const url=URL.createObjectURL(new Blob([snapshot.text],{type:'text/plain;charset=utf-8'}));
 try{const anchor=document.createElement('a');anchor.href=url;anchor.download=snapshot.filename;anchor.click();}
 finally{setTimeout(()=>URL.revokeObjectURL(url),0);}
 return 'started';
}
