import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './tokens.css';
import './feedback.css';

interface Shown { text: string; target: Element; leaving: boolean }
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

/** Mount once per window: every `title` or `data-tooltip` in the document gets the shared tooltip. */
export function TooltipLayer() {
  const [shown, setShown] = useState<Shown | null>(null), [position, setPosition] = useState<{ left: number; top: number; side: 'above' | 'below' } | null>(null);
  const bubble = useRef<HTMLDivElement>(null), timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined), current = useRef<Element | null>(null), opened = useRef(false);

  useEffect(() => {
    const hide = () => {
      clearTimeout(timer.current);
      const target = current.current;
      current.current = null; opened.current = false;
      // Restore the real title once the tooltip is dismissed so a later rerender that removes
      // or replaces it is observable — a suppressed (empty) title would mutate invisibly.
      if (target?.hasAttribute('data-tooltip-adopted') && target.getAttribute('title') === '')
        target.setAttribute('title', target.getAttribute('data-tooltip') ?? '');
      setShown(value => value && !value.leaving ? { ...value, leaving: true } : value);
    };
    const schedule = (target: Element, delay: number) => {
      if (current.current === target) return;
      const text = adopt(target);
      hide();
      if (!text) return;
      current.current = target;
      timer.current = setTimeout(() => {
        if (current.current !== target || !target.isConnected) return;
        const latest = adopt(target);
        if (!latest) { hide(); return; }
        opened.current = true; setPosition(null); setShown({ text: latest, target, leaving: false });
      }, delay);
    };
    const dwell = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ui-tooltip-dwell')) || 350;
    const over = (event: PointerEvent) => { if (event.pointerType === 'touch') return; const target = owner(event.target); if (target) schedule(target, dwell()); else if (current.current) hide(); };
    const focus = (event: FocusEvent) => { const target = owner(event.target); if (target && event.target instanceof Element && event.target.matches(':focus-visible')) schedule(target, FOCUS_DWELL_MS); };
    const key = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.isComposing || event.keyCode === 229 || !current.current) return;
      if (opened.current && current.current.isConnected) { event.preventDefault(); event.stopPropagation(); }
      hide();
    };
    const leave = (event: PointerEvent) => { if (!event.relatedTarget) hide(); };
    document.addEventListener('pointerover', over); document.addEventListener('pointerout', leave); document.addEventListener('pointerdown', hide, true);
    document.addEventListener('focusin', focus); document.addEventListener('focusout', hide); document.addEventListener('keydown', key, true);
    document.addEventListener('scroll', hide, true); window.addEventListener('blur', hide);
    const observer = new MutationObserver(records => {
      const changes=new Map<Element,Set<string>>();
      for(const {target,attributeName,oldValue} of records){
        if(!(target instanceof Element)||!attributeName)continue;
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
        // A caller-provided data-tooltip update refreshes or dismisses the shown
        // tooltip; it never touches the adopted-title bookkeeping.
        if (names.has('data-tooltip') && current.current === element) {
          const text = adopt(element);
          if (!text) hide();
          else if (opened.current) setShown({ text, target: element, leaving: false });
        }
        if(!element.hasAttribute('data-tooltip-adopted'))continue;
        if(!names.has('title')){
          if((names.has('aria-labelledby')||names.has('aria-describedby'))&&element.hasAttribute('data-tooltip')){
            syncTitleAria(element,element.getAttribute('data-tooltip')!);
          }
          continue;
        }
        const title = element.getAttribute('title');
        if (title) {
          if (current.current !== element) continue;
          const text = adopt(element);
          if (!text) hide();
          else if (opened.current) setShown({ text, target: element, leaving: false });
          continue;
        }
        if (title === '' && suppressing.has(element)) { suppressing.delete(element); continue; } // our own suppression
        // A rerender removed or emptied the source title: drop the mirrored tooltip and generated names.
        element.removeAttribute('data-tooltip'); element.removeAttribute('data-tooltip-adopted');
        releaseAria(element,'aria-label');
        releaseAria(element,'aria-description');
        if (current.current === element) hide();
      }
    });
    observer.observe(document.documentElement, { subtree:true, attributes:true, attributeOldValue:true,
      attributeFilter:['title','data-tooltip','aria-label','aria-description','aria-labelledby','aria-describedby'] });
    return () => {
      observer.disconnect();
      clearTimeout(timer.current);
      document.removeEventListener('pointerover', over); document.removeEventListener('pointerout', leave); document.removeEventListener('pointerdown', hide, true);
      document.removeEventListener('focusin', focus); document.removeEventListener('focusout', hide); document.removeEventListener('keydown', key, true);
      document.removeEventListener('scroll', hide, true); window.removeEventListener('blur', hide);
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
    style={{ left: position?.left ?? 0, top: position?.top ?? 0, visibility: position ? 'visible' : 'hidden' }}>{shown.text}</div>, root);
}
