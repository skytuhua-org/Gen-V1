import {useCallback,useId,useLayoutEffect,useRef,useState,type RefObject} from 'react';
import {ArrowDown,ArrowUp,Search,X} from 'lucide-react';
import {usableFocusable} from '../../../packages/ui-shell/focus-retention';
import {coalescedTranscriptScan,conversationRanges,highlightConversation,nextFindIndex,retainFindIndex,type ConversationMatch} from './conversation-find';
import {chordFor} from './keyboard-bindings';
import {matchesShortcut} from './shell-layout';
import './conversation-find.css';
export interface ConversationFindProps {
 ownerKey:string;
 transcript:RefObject<HTMLElement|null>;
 /** Includes the owner's composer so Ctrl+F never changes another conversation. */
 scope:RefObject<HTMLElement|null>;
 active?:boolean;
 /** Empty transcript: trigger stays disabled and the shortcut is a no-op. */
 empty?:boolean;
 onNavigate?:()=>void;
 onLoadEarlier?:()=>void;
 historyPending?:boolean;
 historyLimited?:boolean;
 historyError?:string|null;
}
interface FindShortcutOwner {
 scope:HTMLElement;
 transcript:RefObject<HTMLElement|null>;
 empty:boolean;
 show: (opener:HTMLElement|null)=>void;
}
interface FindShortcutRegistry {
 owners:Set<FindShortcutOwner>;
 key:(event:KeyboardEvent)=>void;
}
const findShortcuts=new WeakMap<Document,FindShortcutRegistry>();
function focusedSplitPane(scope:HTMLElement):boolean {
 const view=scope.closest<HTMLElement>('[data-split-view]');
 const paneId=view?.dataset.paneId;
 return Boolean(paneId&&view?.closest('.split-workspace')
  ?.querySelector(`.split-pane.is-focused[data-split-pane="${CSS.escape(paneId)}"]`));
}
function registerFindShortcut(owner:FindShortcutOwner){
 const document=owner.scope.ownerDocument;
 let registry=findShortcuts.get(document);
 if(!registry){
  const owners=new Set<FindShortcutOwner>();
  const key=(event:KeyboardEvent)=>{
   if(event.defaultPrevented||event.isComposing||event.keyCode===229||!matchesShortcut(event,chordFor('find-in-conversation')))return;
   if(document.querySelector('dialog[open], [role="dialog"][aria-modal="true"]:not([hidden])'))return;
   const opener=document.activeElement as HTMLElement|null;
   const visible=[...owners].filter(({scope,transcript})=>scope.isConnected&&!scope.closest('[hidden],[inert]')&&Boolean(transcript.current?.getClientRects().length));
   const local=visible.findLast(candidate=>candidate.scope.contains(opener));
   const available=visible.filter(candidate=>!candidate.empty);
   const target=local??available.find(candidate=>focusedSplitPane(candidate.scope))??available[0];
   if(!target)return;
   event.preventDefault();
   if(!target.empty)target.show(opener);
  };
  registry={owners,key};
  document.addEventListener('keydown',key);
  findShortcuts.set(document,registry);
 }
 const {owners,key}=registry;
 owners.add(owner);
 return()=>{
  owners.delete(owner);
  if(!owners.size){document.removeEventListener('keydown',key);findShortcuts.delete(document);}
 };
}

/** Reusable by ordinary, canvas and scoped transcript owners. No command/draft authority. */
export function ConversationFind({ownerKey,transcript,scope,active=true,empty=false,onNavigate,onLoadEarlier,historyPending,historyLimited,historyError}:ConversationFindProps){
 const id=useId(),input=useRef<HTMLInputElement>(null),trigger=useRef<HTMLButtonElement>(null),restoreFocus=useRef(false),opener=useRef<HTMLElement|null>(null);
 const [open,setOpen]=useState(false),[query,setQuery]=useState(''),[count,setCount]=useState(0),[index,setIndex]=useState(-1);
 const matches=useRef<ConversationMatch[]>([]),selected=useRef<string|null>(null),lastQuery=useRef('');
 const navigateRef=useRef(onNavigate);navigateRef.current=onNavigate;
 const jump=useCallback((value:number)=>{
  const match=matches.current[value],root=transcript.current;if(!match||!root)return;
  const node=match.range.startContainer.parentElement;
  if(node?.closest('[data-conversation-text^="artifact:"]')){
   const reduced=root.ownerDocument.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches;
   node.scrollIntoView({block:'nearest',inline:'nearest',behavior:reduced?'auto':'smooth'});
  }else{
   const rect=match.range.getBoundingClientRect(),bounds=root.getBoundingClientRect();
   root.scrollTop+=rect.top-bounds.top-root.clientHeight/2+rect.height/2;
  }
  selected.current=match.key;setIndex(value);highlightConversation(root.ownerDocument,id,matches.current,value);navigateRef.current?.();
 },[transcript,id]);
 const close=useCallback(()=>{restoreFocus.current=true;setOpen(false);},[]);
 useLayoutEffect(()=>{setOpen(false);setQuery('');selected.current=null;matches.current=[];setCount(0);setIndex(-1);},[ownerKey]);
 const showFromShortcut=useRef<(element:HTMLElement|null)=>void>(()=>{});
 showFromShortcut.current=element=>{
  if(!open){opener.current=element;setOpen(true);return;}
  input.current?.focus();input.current?.select();
 };
 useLayoutEffect(()=>{
  const root=scope.current;
  if(!root||!active)return;
  return registerFindShortcut({scope:root,transcript,empty,show:element=>showFromShortcut.current(element)});
 },[active,empty,scope,transcript]);
 useLayoutEffect(()=>{
  if(open){input.current?.focus();return;}
  if(!restoreFocus.current)return;
  restoreFocus.current=false;
  const preferred=opener.current?.isConnected?opener.current:trigger.current;
  const viewport=transcript.current,root=scope.current;
  const target=preferred&&!preferred.matches(':disabled')&&!preferred.closest('[hidden],[inert]')?preferred
   :viewport&&viewport.tabIndex>=0?viewport:root?usableFocusable(root):undefined;
  target?.focus({preventScroll:true});
 },[open,scope,transcript]);
 useLayoutEffect(()=>{if(empty&&open)close();},[empty,open,close]);
 useLayoutEffect(()=>{
  const root=transcript.current;if(!root)return;
  if(!open||!active){highlightConversation(root.ownerDocument,id,[],-1);return;}
  const scan=()=>{
   const found=conversationRanges(root,query),changed=query!==lastQuery.current;
   const next=retainFindIndex(found.map(m=>m.key),changed?null:selected.current);
   matches.current=found;lastQuery.current=query;selected.current=found[next]?.key??null;
   setCount(found.length);setIndex(next);highlightConversation(root.ownerDocument,id,found,next);
   if(changed&&next>=0)jump(next);
  };
  scan();const stopScan=coalescedTranscriptScan(root,()=>Boolean(query),scan);
  return()=>{stopScan();highlightConversation(root.ownerDocument,id,[],-1);};
 },[open,active,query,ownerKey,transcript,id,jump]);
 if(!active)return null;
 return <div className="conversation-find-owner">
  {!open?<button ref={trigger} type="button" className="quiet conversation-find-trigger" aria-label="Find in conversation" disabled={empty} aria-disabled={empty||undefined} title={empty?'No messages to search':'Find in conversation (Ctrl+F)'} onClick={event=>{opener.current=event.currentTarget;setOpen(true);}}><Search size={14}/></button>:
   <div className="conversation-find" role="search" aria-label="Find in conversation" onKeyDown={event=>{
    if(event.nativeEvent.isComposing||event.keyCode===229)return;
    if(matchesShortcut(event,chordFor('close-find'))){event.preventDefault();event.stopPropagation();close();}
    if(event.target===input.current&&matchesShortcut(event,chordFor('find-next-match'))){event.preventDefault();jump(nextFindIndex(index,1,count));}
    if(event.target===input.current&&matchesShortcut(event,chordFor('find-previous-match'))){event.preventDefault();jump(nextFindIndex(index,-1,count));}
   }}>
    <div className="conversation-find-row"><Search size={14}/><input ref={input} aria-label="Find phrase" value={query} onChange={event=>setQuery(event.target.value)} autoComplete="off" spellCheck={false}/>
     <span className="conversation-find-count" role="status" aria-live="polite">{query?count?`${index+1} of ${count}`:'0 results':'Find a phrase'}</span>
     <button type="button" className="quiet" aria-label="Previous match" disabled={!count} onClick={()=>jump(nextFindIndex(index,-1,count))}><ArrowUp size={14}/></button>
     <button type="button" className="quiet" aria-label="Next match" disabled={!count} onClick={()=>jump(nextFindIndex(index,1,count))}><ArrowDown size={14}/></button>
     <button type="button" className="quiet" aria-label="Close find" onClick={close}><X size={14}/></button>
    </div>
    <div className="conversation-find-scope"><span>Loaded messages</span>{onLoadEarlier&&<button className="quiet" type="button" disabled={historyPending||historyLimited} onClick={()=>{onLoadEarlier();input.current?.focus({preventScroll:true});}}>{historyLimited?'History limit reached':historyPending?'Loading older messages…':'Load older messages'}</button>}</div>
    {historyError&&<p role="alert">{historyError}</p>}
   </div>}
 </div>;
}
