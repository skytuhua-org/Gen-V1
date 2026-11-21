import {createSpringValue} from './motion-spring';
import {readMotionPolicy,observeMotionPolicy} from './motion-policy';

export type ConversationPosition={top:number;tail:boolean};
export type ConversationAnchor={height:number;top:number};

type ScrollGeometry = Pick<HTMLElement, 'scrollHeight' | 'scrollTop'>;

/** Stage one anchor for the next commit, not for the lifetime of a page request. */
export function createHistoryAnchor() {
 let pending: { owner: string; element: ScrollGeometry; geometry: ConversationAnchor } | undefined;
 return {
  capture(owner: string, activeOwner: string, element: ScrollGeometry | null) {
   if (owner === activeOwner && element) pending = { owner, element, geometry: { height: element.scrollHeight, top: element.scrollTop } };
  },
  consume(owner: string, element: ScrollGeometry) {
   const anchor = pending;
   pending = undefined;
   if (anchor?.owner === owner && anchor.element === element) return anchor.geometry;
  },
 };
}

/** cubic-bezier(0.2, 0, 0, 1) as y(x): prompt navigation's only movement curve. */
const promptEase=(x:number)=>{
 const X=(t:number)=>((1.6*t-1.2)*t+0.6)*t,Y=(t:number)=>((-2*t+3)*t)*t;
 let t=x;
 for(let i=0;i<6;i++){const dx=X(t)-x;if(Math.abs(dx)<1e-6)return Y(t);const slope=4.8*t*t-2.4*t+0.6;if(Math.abs(slope)<1e-6)break;t-=dx/slope;}
 let lo=0,hi=1;t=x;
 while(hi-lo>1e-5){if(X(t)<x)lo=t;else hi=t;t=(lo+hi)/2;}
 return Y(t);
};

/** Own only tail-following scrolls. Reading history and user intent always win. */
export function createConversationScroll(element:HTMLElement){
 let thread='',following=false,disposed=false,ownedTop:number|undefined,dragging=false,nativePointer:number|undefined;
 const maximum=()=>Math.max(0,element.scrollHeight-element.clientHeight);
 const nearTail=()=>maximum()-element.scrollTop<80;
 const write=(value:number)=>{element.scrollTop=Math.min(maximum(),Math.max(0,value));ownedTop=element.scrollTop;};
 let spring=createSpringValue(element.scrollTop,write);
 let navFrame=0,navSettle:(()=>void)|null=null;
 const cancelNavigation=()=>{if(navFrame)cancelAnimationFrame(navFrame);navFrame=0;navSettle=null;};
 const interrupt=()=>{cancelNavigation();spring.dispose();spring=createSpringValue(element.scrollTop,write);ownedTop=undefined;following=false;};
 const follow=()=>{if(!disposed&&!dragging&&following)spring.to(maximum(),readMotionPolicy()!=='full'||document.visibilityState==='hidden'||!element.getClientRects().length);};
 const observed=new Set<Element>();
 const observer=new ResizeObserver(follow);
 observer.observe(element);
 const observeContent=()=>{
  const children=new Set(element.children);
  for(const child of observed)if(!children.has(child)){observer.unobserve(child);observed.delete(child);}
  for(const child of children)if(!observed.has(child)){observed.add(child);observer.observe(child);}
 };
 const wheel=(event:WheelEvent)=>{if(event.ctrlKey)return;interrupt();if(event.deltaY>=0&&nearTail())following=true;};
 const touchStart=()=>{interrupt();};
 const touchEnd=()=>{following=nearTail();};
 const pointerDown=(event:PointerEvent)=>{
  // Ordinary button clicks should not detach a conversation from the tail.
  // The scrollbar and middle-button pan do constitute reading intent.
  if(dragging||event.button!==1&&!(event.target===element&&event.clientX>=element.getBoundingClientRect().left+element.clientWidth))return;
  nativePointer=event.pointerId;dragging=true;interrupt();
 };
 const pointerEnd=(event:PointerEvent)=>{if(dragging&&nativePointer!==undefined&&event.pointerId===nativePointer){nativePointer=undefined;dragging=false;following=nearTail();}};
 const key=(event:KeyboardEvent)=>{
  if(event.defaultPrevented||event.ctrlKey||event.metaKey||event.altKey||!['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key))return;
  const target=event.target as HTMLElement|null;
  if(target?.closest?.('input,textarea,select,button,a,summary,[contenteditable="true"],[role="slider"]'))return;
  interrupt();
  const towardTail=['ArrowDown','PageDown','End'].includes(event.key)||(event.key===' '&&!event.shiftKey);
  if(towardTail&&nearTail())following=true;
 };
 const settleHidden=()=>{if(document.visibilityState!=='hidden')return;navSettle?.();if(following)spring.to(maximum(),true);};
 const stopObservingMotion=observeMotionPolicy(policy=>{if(policy==='full')return;navSettle?.();if(following&&!dragging)spring.to(maximum(),true);});
 element.addEventListener('wheel',wheel,{passive:true});
 element.addEventListener('touchstart',touchStart,{passive:true});
 element.addEventListener('touchend',touchEnd,{passive:true});
 element.addEventListener('touchcancel',touchEnd,{passive:true});
 element.addEventListener('pointerdown',pointerDown);
 element.addEventListener('keydown',key);
 document.addEventListener('pointerup',pointerEnd);
 document.addEventListener('pointercancel',pointerEnd);
 document.addEventListener('visibilitychange',settleHidden);
 return {
  beginManualScroll(){if(!disposed){nativePointer=undefined;dragging=true;interrupt();}},
  scrollTo(top:number):ConversationPosition{
   if(!disposed&&Number.isFinite(top)){interrupt();element.scrollTop=Math.max(0,Math.min(maximum(),top));following=!dragging&&nearTail();}
   return {top:element.scrollTop,tail:following};
  },
  endManualScroll(){if(!disposed){nativePointer=undefined;dragging=false;following=nearTail();}},
  update(id:string,position:ConversationPosition,anchor?:ConversationAnchor){
   if(disposed)return;
   observeContent();
   if(thread!==id){thread=id;interrupt();following=position.tail;spring.to(position.tail?maximum():position.top,true);}
   else if(anchor){interrupt();following=position.tail;spring.to(anchor.top+element.scrollHeight-anchor.height,true);}
   else follow();
  },
  remember():ConversationPosition|null{
   if(disposed||ownedTop!==undefined&&Math.abs(element.scrollTop-ownedTop)<1)return null;
   interrupt();following=nearTail();ownedTop=element.scrollTop;return {top:element.scrollTop,tail:following};
  },
  position():ConversationPosition{
   // A stale `following` (a scroll that no listener observed) must not
   // report tail=true: only claim the tail while the spring is catching
   // up or the view is actually near it.
   return {top:element.scrollTop,tail:following&&(spring.active||nearTail())};
  },
  jump():ConversationPosition{
   following=true;follow();return {top:maximum(),tail:true};
  },
  /** Prompt navigation: one cancellable controller-owned 220ms move. The caller
   * keeps the returned handle; every existing interrupt path also cancels it. */
  navigateTo(top:number,landed?:()=>void):{cancel:()=>void}|null{
   if(disposed||!Number.isFinite(top))return null;
   interrupt();
   const target=Math.max(0,Math.min(maximum(),top)),start=element.scrollTop,began=performance.now();
   const settle=()=>{if(navSettle!==settle)return;navSettle=null;if(navFrame){cancelAnimationFrame(navFrame);navFrame=0;}write(target);landed?.();};
   const step=(now:number)=>{
    navFrame=0;
    if(disposed)return;
    if(document.visibilityState==='hidden'||readMotionPolicy()!=='full'){settle();return;}
    const progress=Math.min(1,(now-began)/220);
    write(start+(target-start)*promptEase(progress));
    if(progress>=1){navSettle=null;landed?.();}
    else navFrame=requestAnimationFrame(step);
   };
   if(Math.abs(target-start)<1||document.visibilityState==='hidden'||readMotionPolicy()!=='full'){write(target);landed?.();return {cancel:()=>{}};}
   navSettle=settle;navFrame=requestAnimationFrame(step);
   return {cancel(){if(navSettle===settle)cancelNavigation();}};
  },
  dispose(){
   if(disposed)return;disposed=true;cancelNavigation();spring.dispose();observer.disconnect();observed.clear();
   element.removeEventListener('wheel',wheel);element.removeEventListener('touchstart',touchStart);element.removeEventListener('touchend',touchEnd);element.removeEventListener('touchcancel',touchEnd);element.removeEventListener('pointerdown',pointerDown);element.removeEventListener('keydown',key);
   document.removeEventListener('pointerup',pointerEnd);document.removeEventListener('pointercancel',pointerEnd);document.removeEventListener('visibilitychange',settleHidden);stopObservingMotion();
  },
 };
}

/** Observe the viewport and its immediate content containers. Deeper mutations
 * still schedule a measurement, but cannot change which children we observe. */
export function observeConversationExtent(element:HTMLElement,schedule:()=>void):()=>void{
 const resize=new ResizeObserver(schedule);
 const observe=()=>{resize.disconnect();resize.observe(element);for(const child of element.children)resize.observe(child);};
 const mutation=new MutationObserver(records=>{
  if(records.some(record=>record.type==='childList'&&record.target===element))observe();
  schedule();
 });
 resize.observe(element);
 for(const child of element.children)resize.observe(child);
 mutation.observe(element,{childList:true,subtree:true,characterData:true});
 return ()=>{resize.disconnect();mutation.disconnect();};
}
