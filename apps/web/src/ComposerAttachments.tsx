import {File,Lock,X} from 'lucide-react';
import {useEffect, useId, useLayoutEffect, useRef, useState} from 'react';
import type {MessageAttachment,ResourceGrant} from '../../../packages/contracts';
import './composer-entry.css';
import {TerminalExcerpt} from './TerminalExcerpt';
import type {TimeFormat} from './time-format';
import type {TerminalExcerpt as Excerpt} from './terminal-excerpts';
import {reducedMotion} from './task-motion';

function AttachmentNotice({resource, onDismiss, onUndo, undoDisabled}: {
 resource: ResourceGrant; onDismiss: () => void; onUndo: () => void; undoDisabled: boolean;
}) {
 const [hovered,setHovered]=useState(false),[focused,setFocused]=useState(false),[leaving,setLeaving]=useState(false);
 const remaining=useRef(8_000);
 const dismiss=useRef(onDismiss), element=useRef<HTMLDivElement>(null);
 dismiss.current=onDismiss;
 useEffect(()=>{
  if(hovered||focused||undoDisabled||leaving)return;
  const started=performance.now();
  const timer=window.setTimeout(()=>{
   if(reducedMotion())dismiss.current();
   else setLeaving(true);
  },remaining.current);
  return ()=>{
   window.clearTimeout(timer);
   remaining.current=Math.max(0,remaining.current-(performance.now()-started));
  };
 },[hovered,focused,undoDisabled,leaving]);
 useEffect(()=>{
  if(!leaving)return;
  let active=true;
  void Promise.allSettled((element.current?.getAnimations()??[]).map(animation=>animation.finished)).then(()=>{
   if(active)dismiss.current();
  });
  return ()=>{active=false;};
 },[leaving]);
 return <div ref={element} className="composer-attachment-notice" data-leaving={leaving||undefined}
  onPointerEnter={()=>setHovered(true)} onPointerLeave={()=>setHovered(false)}
  onFocus={()=>setFocused(true)} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setFocused(false);}}>
  <span>Attached {resource.label} from {resource.composerAttachment?.title}</span>
  <button type="button" className="quiet" aria-disabled={undoDisabled||undefined} onClick={onUndo}>Undo</button>
 </div>;
}

export function useComposerAttachmentFeedback(resources:readonly ResourceGrant[],onRemoveResource:(resource:ResourceGrant)=>Promise<void>,removeBlocked?:'read-only'|'archived') {
 const [noticeId,setNoticeId]=useState<string>(),[announcement,setAnnouncement]=useState('');
 const [removing,setRemoving]=useState(false);
 const removingRef=useRef(false);
 // Seed existing grants without replaying old announcements on navigation or reload.
 const seen=useRef<Set<string>|null>(null);
 useEffect(()=>{
  const prior=seen.current;
  const generated=resources.filter(resource=>resource.composerAttachment);
  seen.current=new Set(generated.map(resource=>resource.id));
  if(!prior)return;
  const fresh=generated.filter(resource=>!resource.composerAttachment?.hidden&&!resource.draftAttachmentConsumedBy&&!prior.has(resource.id));
  const latest=fresh.toSorted((a,b)=>a.createdAt.localeCompare(b.createdAt)).at(-1);
  if(latest){
   setNoticeId(latest.id);
   setAnnouncement(fresh.map(resource=>`${resource.label} added to attachments`).join('. '));
  }
 },[resources]);
 const notice=resources.find(resource=>resource.id===noticeId&&!resource.composerAttachment?.hidden&&!resource.draftAttachmentConsumedBy);
 const remove=(resource:ResourceGrant)=>{
  if(!onRemoveResource||removeBlocked||removingRef.current)return;
  removingRef.current=true;
  setRemoving(true);
  void onRemoveResource(resource).then(()=>{
   setNoticeId(value=>value===resource.id?undefined:value);
   setAnnouncement(resource.composerAttachment?`${resource.label} removed`:`Removed ${resource.label}`);
  }).catch(()=>{}).finally(()=>{removingRef.current=false;setRemoving(false);});
 };
 return {announcement,removing,remove,notice:notice&&<AttachmentNotice key={notice.id} resource={notice}
  onDismiss={()=>setNoticeId(value=>value===notice.id?undefined:value)} onUndo={()=>remove(notice)}
  undoDisabled={removing||Boolean(removeBlocked)}/>};
}

export function ComposerAttachments({resources,excerpts=[],disabled=false,onEditExcerpt,onRemoveExcerpt,onRemoveResource,removeBlocked,timeFormat,removing=false}:{removing?:boolean;resources:readonly ResourceGrant[];excerpts?:readonly Excerpt[];disabled?:boolean;onEditExcerpt?:(id:string,text:string)=>Promise<void>;onRemoveExcerpt?:(id:string)=>Promise<void>;onRemoveResource?:(resource:ResourceGrant)=>void;removeBlocked?:'read-only'|'archived';timeFormat?:TimeFormat}) {
 const attachments=resources.filter(resource=>resource.kind!=='project'&&!resource.composerAttachment?.hidden&&!resource.draftAttachmentConsumedBy);
 const descriptionId=useId();
 // Keep recently removed chips mounted long enough for their exit animation.
 const cache=useRef(new Map<string,ResourceGrant>()),[leaving,setLeaving]=useState<ReadonlySet<string>>(new Set());
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
 const removeTitle=removeBlocked==='read-only'?'Removal unavailable — thread is read-only':removeBlocked==='archived'?'Removal unavailable — thread is archived':'Remove resource';
 if(!attachments.length&&!excerpts.length&&!leaving.size)return null;
 return <div className="composer-attachment-band" data-state="open" role="group" aria-label="Attachments"><div className="composer-attachment-clip"><div className="resource-strip">
  {attachments.map((resource,index)=>{
   const source=resource.composerAttachment?.title;
   const describedBy=source?`${descriptionId}-${index}`:undefined;
   const provenance=source?`Added by "${source}"`:undefined;
   const permission=resource.writable?'Approved writes allowed':'Read only — the agent can view this file but cannot change it';
   return <span key={resource.id} className="resource-chip" data-artifact-attachment={source?true:undefined}
    title={`${resource.path} · ${permission}${provenance?` · ${provenance}`:''}`} aria-describedby={describedBy}>
    <File size={12}/>{resource.label}
    {provenance&&<span id={describedBy} className="sr-only">{provenance}</span>}
    {!resource.writable&&<Lock size={10} aria-label="Read only" className="resource-chip-readonly"/>}
    {onRemoveResource&&<button type="button" className="resource-chip-remove" aria-label={`Remove resource ${resource.label}`}
     aria-describedby={describedBy} title={removeTitle} disabled={Boolean(removeBlocked)}
     aria-disabled={Boolean(removeBlocked)||removing||undefined} onClick={()=>onRemoveResource(resource)}><X size={10}/></button>}
   </span>;
  })}
  {[...leaving].map(id=>{const resource=cache.current.get(id);return resource?<span key={id} className="resource-chip" data-leaving aria-hidden="true" onAnimationEnd={()=>{cache.current.delete(id);setLeaving(previous=>{const next=new Set(previous);next.delete(id);return next;});}}><File size={12}/>{resource.label}</span>:null;})}
  {excerpts.map(excerpt=><TerminalExcerpt key={excerpt.id} excerpt={excerpt} disabled={disabled||!onEditExcerpt||!onRemoveExcerpt} onEdit={text=>onEditExcerpt!(excerpt.id,text)} onRemove={()=>onRemoveExcerpt!(excerpt.id)} timeFormat={timeFormat}/>)}
 </div></div></div>;
}


export function MessageAttachments({attachments}: {attachments?:readonly MessageAttachment[]}) {
 if(!attachments?.length)return null;
 return <ul className="message-attachments" aria-label={`${attachments.length} ${attachments.length===1?'attachment':'attachments'}`}>
  {attachments.map(attachment=><li key={attachment.id}><a
   href={'/api/resources/'+encodeURIComponent(attachment.id)+'/content'} download={attachment.label} title={attachment.label}
   aria-label={attachment.writable?attachment.label:`${attachment.label}, read only`}>
   <File size={12} aria-hidden="true"/><span>{attachment.label}</span>{!attachment.writable&&<Lock size={10} aria-hidden="true"/>}
  </a></li>)}
 </ul>;
}
