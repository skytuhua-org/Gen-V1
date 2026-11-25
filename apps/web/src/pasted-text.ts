import {z} from 'zod';
import {journalCompareAndSwap,journalReadRecord} from './journal';
import {serializeTerminalExcerpts,type TerminalExcerpt} from './terminal-excerpts';
import {SAVED_DRAFT_MAX_BYTES} from './draft-limits';
import type {UiPreferences} from '../../../packages/contracts/preferences';

export const PASTED_TEXT_MAX_COUNT=8;
/** A paste larger than the saved-draft text cap is refused entirely (R17). */
export const PASTED_TEXT_MAX_BYTES=SAVED_DRAFT_MAX_BYTES;
/** Long single-line pastes collapse on characters even under the line threshold. */
export const PASTE_COLLAPSE_CHARS=4_000;
export type PasteCollapse=UiPreferences['pasteCollapse'];

const encoder=new TextEncoder(),bounded=(value:string)=>encoder.encode(value).length<=PASTED_TEXT_MAX_BYTES;
export const pastedTextSchema=z.object({version:z.literal(1),id:z.string().uuid(),createdAt:z.string().datetime(),text:z.string().min(1).refine(bounded)}).strict();
export type PastedText=z.infer<typeof pastedTextSchema>;

export const pasteDraftKey=(threadId:string)=>'draft-pastes:'+threadId;

export function readPastedTexts(value:unknown):PastedText[]{
 const pastes=value===undefined?[]:z.array(pastedTextSchema).max(PASTED_TEXT_MAX_COUNT).parse(value);
 if(new Set(pastes.map(paste=>paste.id)).size!==pastes.length)throw Error('Pasted texts contain duplicate entries.');
 return pastes;
}
export function normalizePaste(text:string):string{return text.replace(/\r\n/g,'\n').replace(/\r/g,'\n');}
export function countLines(text:string):number{
 if(!text)return 0;const end=text.endsWith('\n')?text.length-1:text.length;let lines=1;
 for(let i=0;i<end;i++)if(text[i]==='\n')lines++;
 return lines;
}
export function shouldCollapse(text:string,setting:PasteCollapse):boolean{
 if(setting==='off')return false;
 if(text.length>PASTE_COLLAPSE_CHARS)return true;
 return countLines(text)>Number(setting);
}
export function firstLine(text:string):string{
 for(const line of text.split('\n')){const trimmed=line.trim();if(trimmed)return trimmed.length>80?trimmed.slice(0,80)+'…':trimmed;}
 return '';
}
export const lineLabel=(lines:number)=>lines===1?'1 line':`${lines} lines`;

/** Typed text, then pasted-text blocks in chip order, then terminal excerpts
 * (R10). With no chips the result is byte-identical to the baseline. */
export function serializeComposerPrompt(text:string,pastes:readonly PastedText[],excerpts:readonly TerminalExcerpt[]):string{
 const blocks=readPastedTexts(pastes).map(paste=>`Pasted text · ${lineLabel(countLines(paste.text))}\n${paste.text}\nEnd pasted text`);
 if(!blocks.length)return serializeTerminalExcerpts(text,excerpts);
 try{return serializeTerminalExcerpts([text.trim(),...blocks].filter(Boolean).join('\n\n'),excerpts);}
 catch{throw Error('Prompt, pasted text and excerpts exceed the 64 KB message limit. Shorten or remove a pasted text.');}
}
export async function changePastedTexts(threadId:string,update:(current:PastedText[])=>PastedText[]):Promise<void>{
 const key=pasteDraftKey(threadId);
 for(let attempt=0;attempt<8;attempt++){const record=await journalReadRecord(key),next=readPastedTexts(update(readPastedTexts(record?.value)));if(await journalCompareAndSwap(key,record?.generation,next))return;}
 throw Error('Pasted text changed in another window. Retry.');
}
/** Drop the accepted chips so chips added while the send was in flight
 * survive. A chip edited elsewhere keeps its id but no longer matches the
 * submitted content, so it is kept rather than deleted. */
export async function clearAcceptedPastes(threadId:string,accepted:readonly PastedText[]):Promise<void>{
 if(!accepted.length)return;
 const key=pasteDraftKey(threadId),drop=new Map(accepted.map(paste=>[paste.id,paste]));
 for(let attempt=0;attempt<8;attempt++){
  const record=await journalReadRecord(key);
  if(!record)return;
  const current=readPastedTexts(record.value),next=current.filter(paste=>{const sent=drop.get(paste.id);return !sent||sent.text!==paste.text||sent.createdAt!==paste.createdAt;});
  if(next.length===current.length)return;
  if(await journalCompareAndSwap(key,record.generation,next))return;
 }
 throw Error('Pasted text changed in another window. Retry.');
}
