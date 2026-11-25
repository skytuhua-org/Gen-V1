import {useCallback,useEffect,useRef,useState,type RefObject} from 'react';
import {chordFor} from './keyboard-bindings';
import {matchesShortcut} from './shell-layout';
import {promptAnchor,promptDestination,promptEventEligible,selectPromptTarget,type PromptDirection,type PromptTarget} from './prompt-navigation';
import {observeConversationExtent,type createConversationScroll} from './conversation-scroll';

export interface PromptNavigationOptions{
 /** Active transcript owner; a change invalidates the cursor and closes the session. */
 owner:string;
 /** loaded && embeddedActive && !threadHeld: a held or background owner never dispatches. */
 active:boolean;
 frame:RefObject<HTMLElement|null>;
 scroller:RefObject<HTMLElement|null>;
 /** Explicit visible thread wrapper; hidden cached wrappers never contribute targets. */
 wrapper:RefObject<HTMLElement|null>;
 controller:RefObject<ReturnType<typeof createConversationScroll>|null>;
 /** Accepted intent bookkeeping (manual reading position, latest-available). */
 onNavigated?:()=>void;
}

export interface PromptNavigation{
 visible:boolean;
 previous:boolean;
 next:boolean;
 navigate:(direction:PromptDirection)=>boolean;
 /** Find and external navigation cancel pending movement and the transient cursor. */
 cancel:()=>void;
}

const SCROLL_KEYS=new Set(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' ']);

export function usePromptNavigation({owner,active,frame,scroller,wrapper,controller,onNavigated}:PromptNavigationOptions):PromptNavigation{
 const cursor=useRef<string|null>(null),handle=useRef<{cancel:()=>void}|null>(null),flash=useRef<{element:HTMLElement;timer:ReturnType<typeof setTimeout>}|null>(null);
 const [state,setState]=useState({visible:false,previous:false,next:false});
 const navigated=useRef(onNavigated);navigated.current=onNavigated;

 const targets=useCallback(():PromptTarget[]=>{
  const root=wrapper.current,element=scroller.current;
  if(!root||!element)return [];
  const bounds=element.getBoundingClientRect();
  const rows:PromptTarget[]=[];
  root.querySelectorAll<HTMLElement>('[data-prompt-row]').forEach(row=>{
   if(!row.isConnected||!row.getClientRects().length)return;
   const id=row.dataset.messageId;
   if(id)rows.push({id,top:row.getBoundingClientRect().top-bounds.top-element.clientTop+element.scrollTop});
  });
  return rows;
 },[wrapper,scroller]);

 const clearFlash=()=>{if(flash.current){clearTimeout(flash.current.timer);flash.current.element.removeAttribute('data-prompt-target');flash.current=null;}};
 const release=useCallback(()=>{handle.current?.cancel();handle.current=null;cursor.current=null;clearFlash();},[]);

 const refresh=useCallback(()=>{
  const element=scroller.current,rows=targets();
  const eligible=Boolean(active&&element&&rows.length);
  const anchor=element?promptAnchor(element.scrollTop):0;
  setState(previous=>{
   const next={visible:eligible,previous:eligible&&Boolean(selectPromptTarget(rows,anchor,-1,cursor.current)),next:eligible&&Boolean(selectPromptTarget(rows,anchor,1,cursor.current))};
   return previous.visible===next.visible&&previous.previous===next.previous&&previous.next===next.next?previous:next;
  });
 },[active,scroller,targets]);

 const cancel=useCallback(()=>{release();refresh();},[release,refresh]);

 const navigate=useCallback((direction:PromptDirection)=>{
  const element=scroller.current;
  if(!active||!element)return false;
  const rows=targets(),target=selectPromptTarget(rows,promptAnchor(element.scrollTop),direction,cursor.current);
  if(!target)return false;
  let row:HTMLElement|undefined;
  wrapper.current?.querySelectorAll<HTMLElement>('[data-prompt-row]').forEach(candidate=>{if(candidate.dataset.messageId===target.id)row=candidate;});
  if(!row?.isConnected){cursor.current=null;refresh();return false;}
  cursor.current=target.id;
  clearFlash();
  const content=row.querySelector<HTMLElement>('.message-content');
  if(content){content.setAttribute('data-prompt-target','');flash.current={element:content,timer:setTimeout(clearFlash,700)};}
  row.focus({preventScroll:true});
  handle.current=controller.current?.navigateTo(promptDestination(target.top,element.scrollHeight,element.clientHeight),()=>{handle.current=null;navigated.current?.();refresh();})??null;
  refresh();
  return true;
 },[active,scroller,wrapper,controller,targets,refresh]);

 useEffect(()=>{
  const element=frame.current,scrolling=scroller.current;
  cursor.current=null;handle.current?.cancel();handle.current=null;clearFlash();
  if(!element||!scrolling)return;
  const key=(event:KeyboardEvent)=>{
   const direction=matchesShortcut(event,chordFor('previous-prompt'))?-1:matchesShortcut(event,chordFor('next-prompt'))?1:0;
   if(!direction)return;
   if(!promptEventEligible(event,element))return;
   event.preventDefault();event.stopPropagation();
   navigate(direction as PromptDirection);
  };
  const invalidate=()=>{cursor.current=null;};
  const manualKey=(event:KeyboardEvent)=>{if(!event.altKey&&SCROLL_KEYS.has(event.key))cursor.current=null;};
  const reschedule=()=>{cursor.current=null;const focused=scrolling.ownerDocument.activeElement as HTMLElement|null;if(focused&&!focused.isConnected)scrolling.focus({preventScroll:true});refresh();};
  const rail=element.querySelector('.chat-scroll-indicator');
  const stopObservingExtent=observeConversationExtent(scrolling,reschedule);
  element.addEventListener('keydown',key);
  scrolling.addEventListener('keydown',manualKey);
  scrolling.addEventListener('wheel',invalidate,{passive:true});
  scrolling.addEventListener('touchstart',invalidate,{passive:true});
  scrolling.addEventListener('scroll',refresh,{passive:true});
  rail?.addEventListener('pointerdown',invalidate);
  refresh();
  return()=>{stopObservingExtent();element.removeEventListener('keydown',key);scrolling.removeEventListener('keydown',manualKey);scrolling.removeEventListener('wheel',invalidate);scrolling.removeEventListener('touchstart',invalidate);scrolling.removeEventListener('scroll',refresh);rail?.removeEventListener('pointerdown',invalidate);release();};
 },[owner,active,frame,scroller,wrapper,navigate,refresh,release]);

 return {visible:state.visible,previous:state.previous,next:state.next,navigate,cancel};
}
