import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {gapTooltipGroup,openedTooltipGroup,pointerOpening,sameTooltipGroup,
  type TooltipGroup,type TooltipOpening,type TooltipWarmth} from './tooltip-transfer';
import './tokens.css';
import './feedback.css';

interface Shown { text:string; target:Element; leaving:boolean; opening:TooltipOpening }
interface TooltipOwner {target:Element;group:TooltipGroup|null;dialog:Element|null;modal:Element|null}
interface Intent extends TooltipOwner {opening:TooltipOpening;opened:boolean}
const FOCUS_DWELL_MS = 100, GAP = 6, GUTTER = 8;

/** Elements whose `title=""` mutation came from `adopt` itself, not a rerender. */
const suppressing = new WeakSet<Element>();
type TooltipAria='aria-label'|'aria-description';
const generatedAria:Record<TooltipAria,WeakMap<Element,string>>={
  'aria-label':new WeakMap(),
  'aria-description':new WeakMap(),
};

function releaseAria(target:Element,attribute:TooltipAria) {
  const values=generatedAria[attribute],owned=values.get(target);
  values.delete(target);
  if(owned!==undefined&&target.getAttribute(attribute)===owned)target.removeAttribute(attribute);
}

function syncTitleAria(target:Element,title:string) {
  const callerOwns=(attribute:TooltipAria)=>target.hasAttribute(attribute)
    &&target.getAttribute(attribute)!==generatedAria[attribute].get(target);
  const label=!target.textContent?.trim()&&!target.hasAttribute('aria-labelledby')&&!callerOwns('aria-label');
  const description=!label&&!target.hasAttribute('aria-describedby')&&!callerOwns('aria-description');
  for(const [attribute,needed] of [['aria-label',label],['aria-description',description]] as const){
    if(!needed){releaseAria(target,attribute);continue;}
    generatedAria[attribute].set(target,title);
    if(target.getAttribute(attribute)!==title)target.setAttribute(attribute,title);
  }
}

/** Reads the tooltip text and silences the native bubble so only one tooltip shows. */
function adopt(target: Element) {
  const title = target.getAttribute('title');
  if (title) {
    // Keep `title` present but empty: native tooltips treat it as absent, while a framework
    // removing it later still produces a mutation record the observer can act on.
    target.setAttribute('data-tooltip', title);
    target.setAttribute('data-tooltip-adopted', '');
    suppressing.add(target);
    target.setAttribute('title', '');
    // Preserve the browser's accessible fallback when native title is silenced.
    syncTitleAria(target,title);
  }
  const text = target.getAttribute('data-tooltip')?.trim() ?? '';
  return text && text !== target.textContent?.trim() ? text : '';
}
const owner = (node: EventTarget | null) => node instanceof Element ? node.closest('[title],[data-tooltip]') : null;

function groupAt(node:EventTarget|null):TooltipGroup|null{
  if(!(node instanceof Element))return null;
  const boundary=node.closest('[data-tooltip-group]'),ownerKey=boundary?.getAttribute('data-tooltip-group');
  return boundary&&ownerKey?{boundary,ownerKey,document:node.ownerDocument,
    dialog:node.closest('dialog[open]'),modal:node.closest('[role="dialog"][aria-modal="true"]')}:null;
}

function sameGroup(a:TooltipGroup|null,b:TooltipGroup|null):boolean{
  return a&&b?sameTooltipGroup(a,b):a===b;
}

function tooltipOwner(target:Element,group=groupAt(target)):TooltipOwner{
  return {target,group,dialog:target.closest('dialog[open]'),modal:target.closest('[role="dialog"][aria-modal="true"]')};
}
function currentOwner(owner:TooltipOwner):boolean{
  const {target,group,dialog,modal}=tooltipOwner(owner.target);
  return visibleTarget(target)&&sameGroup(group,owner.group)&&dialog===owner.dialog&&modal===owner.modal;
}
function visibleTarget(target:Element):boolean{
  if(target.ownerDocument!==document||!target.isConnected||document.hidden||!target.getClientRects().length
    ||target.closest('[hidden],[inert],[aria-hidden="true"]'))return false;
  const style=getComputedStyle(target);
  return style.display!=='none'&&style.visibility!=='hidden'&&style.visibility!=='collapse';
}


/** Mount once per window: every `title` or `data-tooltip` in the document gets the shared tooltip. */
export function TooltipLayer() {
  const [shown, setShown] = useState<Shown | null>(null), [position, setPosition] = useState<{ left: number; top: number; side: 'above' | 'below' } | null>(null);
  const bubble=useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active:Intent|null=null,warmth:TooltipWarmth|null=null,suppressed:TooltipOwner|null=null;
    let dwellTimer:ReturnType<typeof setTimeout>|undefined,graceTimer:ReturnType<typeof setTimeout>|undefined;
    const retire=()=>{
      clearTimeout(dwellTimer);
      dwellTimer=undefined;
      const target=active?.target;
      active=null;
      if(target?.hasAttribute('data-tooltip-adopted')&&target.getAttribute('title')===''){
        target.setAttribute('title',target.getAttribute('data-tooltip')??'');
      }
    };
    const clearWarmth=()=>{
      clearTimeout(graceTimer);
      graceTimer=undefined;
      warmth=null;
    };
    const reset=(animate=true)=>{
      retire();
      clearWarmth();
      lifecycle.disconnect();
      setShown(value=>animate&&value?value.leaving?value:{...value,leaving:true}:null);
    };
    const refresh=(intent:Intent)=>{
      if(active!==intent)return;
      if(!currentOwner(intent)){suppressed=null;reset(false);return;}
      const latest=adopt(intent.target);
      if(!latest){reset(false);return;}
      if(intent.opened)setShown({text:latest,target:intent.target,opening:intent.opening,leaving:false});
    };
    const lifecycle=new MutationObserver(()=>{
      if(active){refresh(active);return;}
      const boundary=warmth?.group.boundary;
      if(boundary instanceof Element&&(!visibleTarget(boundary)||!sameGroup(warmth?.group??null,groupAt(boundary))))reset(false);
    });
    const watch=(node:Element)=>{
      lifecycle.disconnect();
      for(let ancestor:Element|null=node;ancestor;ancestor=ancestor.parentElement){
        lifecycle.observe(ancestor,{attributes:true,childList:true,
          attributeFilter:['hidden','inert','aria-hidden','class','style','open','role','aria-modal','data-tooltip-group']});
      }
    };
    const begin=(target:Element,group:TooltipGroup|null,opening:TooltipOpening,delay:number)=>{
      if(active?.target===target&&active.opening===opening&&sameGroup(active.group,group))return;
      if(!visibleTarget(target)){reset(false);return;}
      if(opening==='pointer-warm'){retire();clearWarmth();}
      else reset();
      if(!adopt(target))return;
      const intent:Intent={...tooltipOwner(target,group),opening,opened:false};
      active=intent;
      watch(target);
      const commit=()=>{
        if(active!==intent)return;
        if(!currentOwner(intent)){suppressed=null;reset(false);return;}
        const latest=adopt(target);
        if(!latest){reset(false);return;}
        intent.opened=true;
        warmth=openedTooltipGroup(group,opening);
        setPosition(null);
        setShown({text:latest,target,opening,leaving:false});
      };
      if(opening==='pointer-warm')commit();
      else dwellTimer=setTimeout(commit,delay);
    };
    const dwell=()=>parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ui-tooltip-dwell'))||350;
    const pointer=(node:EventTarget|null)=>{
      const target=owner(node),group=groupAt(node);
      if(suppressed&&(target!==suppressed.target||!currentOwner(suppressed)))suppressed=null;
      if(target&&target===suppressed?.target)return;
      if(target&&active?.target===target&&sameGroup(active.group,group))return;
      const now=performance.now();
      if(target){
        begin(target,group,pointerOpening(warmth,group,now),dwell());
        return;
      }
      if(warmth&&sameGroup(warmth.group,group)){
        retire();
        const gap=gapTooltipGroup(warmth,now);
        if(!gap){reset(false);return;}
        warmth=gap;
        setShown(null);
        if(gap.group.boundary instanceof Element)watch(gap.group.boundary);
        if(graceTimer===undefined){
          graceTimer=setTimeout(()=>{clearWarmth();lifecycle.disconnect();},Math.max(0,(gap.deadline??now)-now));
        }
      }else if(active||warmth)reset();
    };
    const over=(event:PointerEvent)=>{
      if(event.pointerType==='touch'||event.buttons>0)return;
      pointer(event.target);
    };
    const leave=(event:PointerEvent)=>{
      if(event.pointerType==='touch'||event.buttons>0)return;
      if(!event.relatedTarget){suppressed=null;reset();return;}
      if(owner(event.target)!==owner(event.relatedTarget)||!sameGroup(groupAt(event.target),groupAt(event.relatedTarget))){
        pointer(event.relatedTarget);
      }
    };
    const focus=(event:FocusEvent)=>{
      const target=owner(event.target);
      if(!target){reset();return;}
      if((target!==suppressed?.target||!currentOwner(suppressed))&&event.target instanceof Element&&event.target.matches(':focus-visible')){
        begin(target,groupAt(target),'keyboard',FOCUS_DWELL_MS);
      }
    };
    const leaveFocus=()=>{suppressed=null;reset();};
    const key=(event:KeyboardEvent)=>{
      if(event.key!=='Escape'||event.defaultPrevented||event.isComposing||event.keyCode===229)return;
      if(active?.opened&&currentOwner(active)){event.preventDefault();event.stopPropagation();}
      suppressed=active??suppressed;
      reset();
    };
    const activate=(event:Event)=>{
      const target=owner(event.target);
      suppressed=target?tooltipOwner(target):null;
      reset();
    };
    const scroll=()=>reset();
    const visibility=()=>{if(document.hidden)leaveFocus();};
    document.addEventListener('pointerover',over);document.addEventListener('pointerout',leave);
    document.addEventListener('pointerdown',activate,true);document.addEventListener('click',activate,true);
    document.addEventListener('focusin',focus);document.addEventListener('focusout',leaveFocus);
    document.addEventListener('keydown',key,true);document.addEventListener('scroll',scroll,true);
    document.addEventListener('visibilitychange',visibility);window.addEventListener('blur',leaveFocus);
    const observer = new MutationObserver(records => {
      const changes=new Map<Element,Set<string>>();
      for(const {target,attributeName,oldValue} of records){
        if(!(target instanceof Element)||!attributeName||!target.hasAttribute('data-tooltip-adopted')&&active?.target!==target)continue;
        if(attributeName==='aria-label'||attributeName==='aria-description'){
          const values=generatedAria[attributeName],owned=values.get(target);
          // Our writes always change the attribute. An assignment of the
          // existing generated value also hands ownership back to the caller.
          if(owned!==undefined&&(target.getAttribute(attributeName)!==owned||oldValue===owned))values.delete(target);
        }
        const names=changes.get(target)??new Set<string>();
        names.add(attributeName);
        changes.set(target,names);
      }
      for(const [element,names] of changes){
        if(names.has('data-tooltip')&&active?.target===element)refresh(active);
        if(!element.hasAttribute('data-tooltip-adopted'))continue;
        if(!names.has('title')){
          const help=element.getAttribute('data-tooltip');
          if(help&&(names.has('aria-labelledby')||names.has('aria-describedby')))syncTitleAria(element,help);
          continue;
        }
        const title = element.getAttribute('title');
        if (title) {
          if(active?.target===element)refresh(active);
          continue;
        }
        if (title === '' && suppressing.has(element)) { suppressing.delete(element); continue; } // our own suppression
        // A rerender removed or emptied the source title: drop the mirrored tooltip and generated names.
        element.removeAttribute('data-tooltip'); element.removeAttribute('data-tooltip-adopted');
        releaseAria(element,'aria-label');
        releaseAria(element,'aria-description');
        if(active?.target===element)reset(false);
      }
    });
    observer.observe(document.documentElement, { subtree:true, attributes:true, attributeOldValue:true,
      attributeFilter:['title','data-tooltip','aria-label','aria-description','aria-labelledby','aria-describedby'] });
    return () => {
      observer.disconnect();
      lifecycle.disconnect();
      retire();
      clearWarmth();
      document.removeEventListener('pointerover',over);document.removeEventListener('pointerout',leave);
      document.removeEventListener('pointerdown',activate,true);document.removeEventListener('click',activate,true);
      document.removeEventListener('focusin',focus);document.removeEventListener('focusout',leaveFocus);
      document.removeEventListener('keydown',key,true);document.removeEventListener('scroll',scroll,true);
      document.removeEventListener('visibilitychange',visibility);window.removeEventListener('blur',leaveFocus);
    };
  }, []);

  useLayoutEffect(() => {
    if (!shown || shown.leaving || !bubble.current) return;
    if (!shown.target.isConnected) { setShown(null); return; }
    const anchor = shown.target.getBoundingClientRect(), box = bubble.current.getBoundingClientRect();
    const above = anchor.top - GAP - GUTTER;
    const below = window.innerHeight - GUTTER - anchor.bottom - GAP;
    const side = above >= box.height || (below < box.height && above >= below) ? 'above' : 'below';
    const preferredTop = side === 'above' ? anchor.top - box.height - GAP : anchor.bottom + GAP;
    setPosition({ side,
      top: Math.max(GUTTER, Math.min(window.innerHeight - box.height - GUTTER, preferredTop)),
      left: Math.max(GUTTER, Math.min(window.innerWidth - box.width - GUTTER, anchor.left + anchor.width / 2 - box.width / 2)) });
  }, [shown]);

  useEffect(() => {
    if (!shown?.leaving) return;
    const running = bubble.current?.getAnimations?.() ?? [];
    if (!running.length) { setShown(null); return; }
    let cancelled = false;
    void Promise.allSettled(running.map(animation => animation.finished)).then(() => { if (!cancelled) setShown(value => value?.leaving ? null : value); });
    return () => { cancelled = true; };
  }, [shown]);

  if (!shown) return null;
  // The top layer of an open modal dialog would cover a body-level tooltip.
  const root = shown.target.closest('dialog[open]') ?? document.body;
  return createPortal(<div ref={bubble} className="ui-tooltip" role="tooltip" data-state={shown.leaving ? 'closed' : 'open'} data-side={position?.side}
    data-opening={shown.opening} aria-hidden={shown.leaving||undefined}
    style={{ left: position?.left ?? 0, top: position?.top ?? 0, visibility: position ? 'visible' : 'hidden' }}>{shown.text}</div>, root);
}
