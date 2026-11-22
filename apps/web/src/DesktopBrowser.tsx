import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,ChevronDown,ChevronUp,LoaderCircle,RotateCcw,Search,Square,X} from 'lucide-react';
import type {DesktopBrowserState,DesktopBrowserFindState} from '../../../packages/desktop-contract';
import {DesktopWindowActions,useDesktop} from './desktop-context';
import {browserSlotRect} from './browser-slot-bounds';
function DesktopBrowserFindBar({find,run}:{find:DesktopBrowserFindState;run:(action:()=>Promise<unknown>)=>void}){
 const desktop=useDesktop(),input=useRef<HTMLInputElement>(null),timer=useRef<ReturnType<typeof setTimeout>>(undefined);
 const [draft,setDraft]=useState(find.query);
 useEffect(()=>{setDraft(find.query);const node=input.current;if(node){node.focus();node.select();}},[find.openRequest]);
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 const change=(value:string)=>{setDraft(value);clearTimeout(timer.current);timer.current=setTimeout(()=>{if(desktop)run(()=>desktop.bridge.browser({type:'find-query',query:value}));},120);};
 const step=(forward:boolean)=>{if(desktop)run(()=>desktop.bridge.browser({type:forward?'find-next':'find-prev'}));};
 const close=()=>{if(desktop)run(()=>desktop.bridge.browser({type:'find-close'}));};
 return <div className="desktop-browser-find" role="search">
  <input ref={input} aria-label="Find in page" placeholder="Find in page" value={draft} maxLength={1024} onChange={event=>change(event.target.value)} onKeyDown={event=>{if(event.nativeEvent.isComposing)return;if(event.key==='Enter'){event.preventDefault();step(!event.shiftKey);}else if(event.key==='Escape'){event.preventDefault();close();}}}/>
  <span className="desktop-browser-find-count" role="status" aria-live="polite" aria-atomic="true">{find.searching?`Searching ${find.ordinal} of ${find.matches}`:`${find.ordinal} of ${find.matches}`}</span>
  <button type="button" className="icon-button" aria-label="Previous match" title="Previous match (Shift+Enter)" disabled={!find.matches} onClick={()=>step(false)}><ChevronUp size={14}/></button>
  <button type="button" className="icon-button" aria-label="Next match" title="Next match (Enter)" disabled={!find.matches} onClick={()=>step(true)}><ChevronDown size={14}/></button>
  <button type="button" className="icon-button browser-close" aria-label="Close find in page" title="Close find (Escape)" onClick={close}><X size={15}/></button>
  {find.error&&<p role="alert" className="error-text">{find.error}</p>}
 </div>;
}
const findShortcut=(event:React.KeyboardEvent,open?:()=>void)=>{
 if(event.nativeEvent.isComposing||event.altKey||!(event.ctrlKey||event.metaKey)||event.key.toLowerCase()!=='f')return;
 event.preventDefault();open?.();
};
export function DesktopBrowserToolbar({state,detached=false}:{state?:DesktopBrowserState;detached?:boolean}){
 const desktop=useDesktop(),[url,setUrl]=useState(state?.url??''),[error,setError]=useState('');useEffect(()=>setUrl(state?.url==='about:blank'?'':state?.url??''),[state?.url]);
 const actionSequence=useRef(0);
 const run=(action:()=>Promise<unknown>)=>{const sequence=++actionSequence.current;void action().then(()=>{if(sequence===actionSequence.current)setError('');},cause=>{if(sequence===actionSequence.current)setError(cause instanceof Error?cause.message:'Browser action failed.');});};
 const find=state?.find;
 return <div className="desktop-browser-toolbar"><header>{error||state?.error?<p role="alert" className="error-text" title={error||state?.error}>{error||state?.error}</p>:<strong>{state?.title||'Browser'}</strong>}<span className="header-actions"><button type="button" className="icon-button" aria-label="Find in page" aria-pressed={find?.open===true} title="Find in page (Ctrl+F)" onClick={()=>desktop&&run(()=>desktop.bridge.browser({type:'find-open'}))}><Search size={15}/></button>{detached?<DesktopWindowActions/>:desktop?.state.dockedBrowser?<button type="button" className="icon-button browser-close" aria-label="Close browser" title="Close browser" onClick={()=>desktop&&run(()=>desktop.bridge.browser({type:'close'}))}><X size={15}/></button>:null}</span></header><form onSubmit={event=>{event.preventDefault();if(desktop)run(()=>desktop.bridge.browser({type:'navigate',url}));}}><button type="button" className="icon-button" aria-label="Browser back" disabled={!state?.canGoBack} onClick={()=>desktop&&run(()=>desktop.bridge.browser({type:'back'}))}><ArrowLeft size={15}/></button><button type="button" className="icon-button" aria-label="Browser forward" disabled={!state?.canGoForward} onClick={()=>desktop&&run(()=>desktop.bridge.browser({type:'forward'}))}><ArrowRight size={15}/></button><button type="button" className="icon-button" aria-label={state?.loading?'Stop browser loading':'Reload browser'} onClick={()=>desktop&&run(()=>desktop.bridge.browser({type:state?.loading?'stop':'reload'}))}>{state?.loading?<Square size={13}/>:<RotateCcw size={14}/>}</button><input aria-label="Browser address" placeholder="Enter a website address" value={url} onChange={event=>setUrl(event.target.value)}/><button className="quiet" type="submit">Go</button>{state?.loading&&<LoaderCircle size={13} className="spinning"/>}</form>{find?.open&&<DesktopBrowserFindBar find={find} run={run}/>}</div>;
}
function DetachedBrowserSlot(){
 const desktop=useDesktop(),slot=useRef<HTMLDivElement>(null),attached=Boolean(desktop?.state.browser);
 useLayoutEffect(()=>{if(!desktop||!attached)return;let frame=0,last='';
  const update=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const element=slot.current;if(!element)return;const rect=element.getBoundingClientRect(),{left,top,right,bottom}=browserSlotRect(rect,{width:innerWidth,height:innerHeight},[]);const blocked=Boolean(element.closest('[inert],[hidden]'))||right<=left||bottom<=top;const value=blocked?{x:0,y:0,width:0,height:0}:{x:left,y:top,width:Math.max(0,right-left),height:Math.max(0,bottom-top)},key=JSON.stringify([devicePixelRatio,value]);if(key!==last){last=key;void desktop.bridge.browser({type:'bounds',bounds:value}).catch(()=>{});}});};
  const observer=new ResizeObserver(update);observer.observe(slot.current!);const mutations=new MutationObserver(update);mutations.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['inert','open','class','hidden','style']});window.addEventListener('resize',update);update();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();mutations.disconnect();window.removeEventListener('resize',update);void desktop.bridge.browser({type:'bounds',bounds:{x:0,y:0,width:0,height:0}}).catch(()=>{});};
 },[desktop?.bridge,attached]);
 return <div ref={slot} className="desktop-browser-native" aria-label="Isolated browser content"/>;
}
export function DesktopBrowserSurface(){const desktop=useDesktop();return <main className="desktop-browser-surface" onKeyDown={event=>findShortcut(event,()=>desktop&&void desktop.bridge.browser({type:'find-open'}).catch(()=>{}))}><DesktopBrowserToolbar state={desktop?.browser} detached/><DetachedBrowserSlot/></main>;}
export function DesktopBrowserSlot(){const desktop=useDesktop(),bounds=useRef<HTMLDivElement>(null),docked=desktop?.state.dockedBrowser;
 useLayoutEffect(()=>{if(!desktop||!docked||!bounds.current)return;let frame=0,last='';const update=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const element=bounds.current;if(!element)return;const rect=element.getBoundingClientRect(),{left,top,right,bottom}=browserSlotRect(rect,{width:innerWidth,height:innerHeight},[...document.querySelectorAll('.panel-resizer,.split-divider')].map(node=>node.getBoundingClientRect()));const blocked=Boolean(document.querySelector('dialog[open],.artifact-expanded,[aria-modal="true"],.workspace-menu,.ui-popover'))||Boolean(element.closest('[inert],[hidden]'))||document.documentElement.classList.contains('workspace-canvas-interaction')||right<=left||bottom<=top;const points=[[left+1,top+1],[right-1,top+1],[left+1,bottom-1],[right-1,bottom-1],[(left+right)/2,(top+bottom)/2]];const occluded=!blocked&&points.some(([x,y])=>{const hit=document.elementFromPoint(x,y);return hit&&!element.contains(hit);});const value=blocked||occluded?{x:0,y:0,width:0,height:0}:{x:left,y:top,width:Math.max(0,right-left),height:Math.max(0,bottom-top)},key=JSON.stringify([devicePixelRatio,value]);if(key!==last){last=key;void desktop.bridge.browser({type:'bounds',bounds:value}).catch(()=>{});}});};const observer=new ResizeObserver(update);observer.observe(bounds.current);const mutations=new MutationObserver(update);mutations.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['inert','open','class','hidden','style']});window.addEventListener('resize',update);window.addEventListener('scroll',update,true);window.addEventListener('harness:canvas-layout',update);update();return()=>{cancelAnimationFrame(frame);observer.disconnect();mutations.disconnect();window.removeEventListener('resize',update);window.removeEventListener('scroll',update,true);window.removeEventListener('harness:canvas-layout',update);void desktop.bridge.browser({type:'bounds',bounds:{x:0,y:0,width:0,height:0}}).catch(()=>{});};},[desktop?.bridge,docked?.browserId]);
 return <div ref={bounds} className="desktop-browser-native" aria-label="Isolated browser content"/>;
}
export function DesktopBrowserDock(){const desktop=useDesktop(),docked=desktop?.state.dockedBrowser;
 if(!docked)return null;return <section className="desktop-browser-dock" aria-label="Docked browser" onKeyDown={event=>findShortcut(event,()=>desktop&&void desktop.bridge.browser({type:'find-open'}).catch(()=>{}))}><DesktopBrowserToolbar state={docked.state}/><DesktopBrowserSlot/></section>;
}
