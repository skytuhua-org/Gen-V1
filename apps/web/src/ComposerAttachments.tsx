import {ClipboardPaste,File,Lock} from 'lucide-react';
import {useLayoutEffect, useRef, useState} from 'react';
import type {ResourceGrant} from '../../../packages/contracts';
import './composer-entry.css';
import {TerminalExcerpt} from './TerminalExcerpt';
import {PastedTextChip} from './PastedText';
import {countLines,lineLabel,type PastedText} from './pasted-text';
import type {TimeFormat} from './time-format';
import type {TerminalExcerpt as Excerpt} from './terminal-excerpts';
import {reducedMotion} from './task-motion';

export function ComposerAttachments({resources,excerpts=[],pastes=[],disabled=false,onEditExcerpt,onRemoveExcerpt,onEditPaste,onRemovePaste,onInsertPaste,timeFormat}:{resources:readonly ResourceGrant[];excerpts?:readonly Excerpt[];pastes?:readonly PastedText[];disabled?:boolean;onEditExcerpt?:(id:string,text:string)=>Promise<void>;onRemoveExcerpt?:(id:string)=>Promise<void>;onEditPaste?:(id:string,text:string)=>Promise<void>;onRemovePaste?:(id:string)=>Promise<void>;onInsertPaste?:(id:string,text:string)=>void;timeFormat?:TimeFormat}) {
 const attachments=resources.filter(resource=>resource.kind!=='project');
 // Keep recently removed chips mounted long enough for their exit animation.
 const cache=useRef(new Map<string,ResourceGrant>()),pasteCache=useRef(new Map<string,PastedText>());
 const [leaving,setLeaving]=useState<ReadonlySet<string>>(new Set()),[leavingPastes,setLeavingPastes]=useState<ReadonlySet<string>>(new Set());
 useLayoutEffect(()=>{
  const now=new Set(attachments.map(resource=>resource.id));
  for(const resource of attachments)cache.current.set(resource.id,resource);
  // Exit animations cannot finish when the motion policy or panel animations disable them.
  const animated=!reducedMotion()&&document.querySelector('.app-shell')?.getAttribute('data-panel-animations')!=='false';
  const fresh=animated?[...cache.current.keys()].filter(id=>!now.has(id)&&!leaving.has(id)):[];
  const back=[...leaving].filter(id=>now.has(id));
  if(!animated)for(const id of cache.current.keys())if(!now.has(id))cache.current.delete(id);
  if(fresh.length||back.length||(!animated&&leaving.size))setLeaving(previous=>{const next=new Set(previous);for(const id of fresh)next.add(id);for(const id of back)next.delete(id);if(!animated)next.clear();return next;});
 },[attachments]);
 useLayoutEffect(()=>{
  const now=new Set(pastes.map(paste=>paste.id));
  for(const paste of pastes)pasteCache.current.set(paste.id,paste);
  const animated=!reducedMotion()&&document.querySelector('.app-shell')?.getAttribute('data-panel-animations')!=='false';
  const fresh=animated?[...pasteCache.current.keys()].filter(id=>!now.has(id)&&!leavingPastes.has(id)):[];
  const back=[...leavingPastes].filter(id=>now.has(id));
  if(!animated)for(const id of pasteCache.current.keys())if(!now.has(id))pasteCache.current.delete(id);
  if(fresh.length||back.length||(!animated&&leavingPastes.size))setLeavingPastes(previous=>{const next=new Set(previous);for(const id of fresh)next.add(id);for(const id of back)next.delete(id);if(!animated)next.clear();return next;});
 },[pastes]);
 if(!attachments.length&&!excerpts.length&&!pastes.length&&!leaving.size&&!leavingPastes.size)return null;
 return <div className="composer-attachment-band" data-state="open" role="group" aria-label="Attachments"><div className="composer-attachment-clip"><div className="resource-strip">
  {attachments.map(resource=><span key={resource.id} className="resource-chip" title={`${resource.path} · ${resource.writable?'Approved writes allowed':'Read only — the agent can view this file but cannot change it'}`}><File size={12}/>{resource.label}{!resource.writable&&<Lock size={10} aria-label="Read only" className="resource-chip-readonly"/>}</span>)}
  {[...leaving].map(id=>{const resource=cache.current.get(id);return resource?<span key={id} className="resource-chip" data-leaving aria-hidden="true" onAnimationEnd={()=>{cache.current.delete(id);setLeaving(previous=>{const next=new Set(previous);next.delete(id);return next;});}}><File size={12}/>{resource.label}</span>:null;})}
  {pastes.map(paste=><PastedTextChip key={paste.id} paste={paste} disabled={disabled||!onEditPaste||!onRemovePaste||!onInsertPaste} onEdit={text=>onEditPaste!(paste.id,text)} onRemove={()=>onRemovePaste!(paste.id)} onInsert={text=>onInsertPaste!(paste.id,text)}/>)}
  {[...leavingPastes].map(id=>{const paste=pasteCache.current.get(id);return paste?<span key={id} className="pasted-text-chip" data-leaving aria-hidden="true" onAnimationEnd={()=>{pasteCache.current.delete(id);setLeavingPastes(previous=>{const next=new Set(previous);next.delete(id);return next;});}}><ClipboardPaste size={12}/><span>Pasted text</span><small>· {lineLabel(countLines(paste.text))}</small></span>:null;})}
  {excerpts.map(excerpt=><TerminalExcerpt key={excerpt.id} excerpt={excerpt} disabled={disabled||!onEditExcerpt||!onRemoveExcerpt} onEdit={text=>onEditExcerpt!(excerpt.id,text)} onRemove={()=>onRemoveExcerpt!(excerpt.id)} timeFormat={timeFormat}/>)}
 </div></div></div>;
}
