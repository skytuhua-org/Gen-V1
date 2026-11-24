import {useEffect,useRef,useState} from 'react';
import {Minus,Plus} from 'lucide-react';
import type {DesktopState} from '../../../packages/desktop-contract';
import {ariaKeyShortcuts} from './keyboard-bindings';
import {useDesktop} from './desktop-context';

export const ZOOM_INDICATOR_TIMING={visible:1600,exit:160,resume:400} as const;

/** Whether a fresh desktop state shows the indicator in this window; the first state is ignored. */
export function zoomIndicatorUpdate(seen:number,appZoom:DesktopState['appZoom'],windowId:string):{seen:number;show:{factor:number;sequence:number}|null}{
 const sequence=appZoom?.sequence??seen;
 if(!appZoom||sequence===seen||appZoom.origin!==windowId)return {seen:sequence,show:null};
 return {seen:sequence,show:{factor:appZoom.factor,sequence:appZoom.sequence}};
}

/** Auto-hide clock: re-arms on every change, pauses while hovered or focused, exits before unmount. */
export function createZoomIndicatorClock(handlers:{show:(factor:number,sequence:number)=>void;leave:()=>void;hide:()=>void},timing:{visible:number;exit:number;resume:number}=ZOOM_INDICATOR_TIMING){
 let expiry:ReturnType<typeof setTimeout>|undefined,exitTimer:ReturnType<typeof setTimeout>|undefined,remaining=timing.visible,started=0,held=0;
 const leave=()=>{expiry=undefined;handlers.leave();exitTimer=setTimeout(()=>{exitTimer=undefined;handlers.hide();},timing.exit);};
 const arm=(ms:number)=>{clearTimeout(expiry);started=Date.now();expiry=setTimeout(leave,ms);};
 return {
  show(factor:number,sequence:number){
   if(exitTimer!==undefined){clearTimeout(exitTimer);exitTimer=undefined;}
   handlers.show(factor,sequence);remaining=timing.visible;
   if(!held)arm(remaining);
  },
  hold(value:boolean){
   if(value){held++;if(exitTimer!==undefined||expiry===undefined)return;clearTimeout(expiry);expiry=undefined;remaining=Math.max(timing.resume,remaining-(Date.now()-started));}
   else{held=Math.max(0,held-1);if(held||expiry!==undefined||exitTimer!==undefined)return;arm(remaining);}
  },
  dispose(){clearTimeout(expiry);clearTimeout(exitTimer);},
 };
}

export function ZoomIndicatorView({factor,sequence,leaving,onCommand,onHold}:{factor:number;sequence:number;leaving:boolean;onCommand:(command:'in'|'out'|'reset')=>void;onHold:(held:boolean)=>void}){
 return <div className="zoom-indicator" role="status" aria-live="polite" data-leaving={leaving||undefined} onMouseEnter={()=>onHold(true)} onMouseLeave={()=>onHold(false)} onFocusCapture={()=>onHold(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node))onHold(false);}}>
  <span className="zoom-indicator-label">Zoom</span><span className="zoom-indicator-value" key={sequence}>{Math.round(factor*100)+'%'}</span><span className="zoom-indicator-divider"/>
  <button type="button" className="icon-button" aria-label="Zoom out" aria-keyshortcuts={ariaKeyShortcuts(['app-zoom-out'])} disabled={factor<=0.5} onClick={()=>onCommand('out')}><Minus size={14}/></button>
  <button type="button" className="icon-button" aria-label="Zoom in" aria-keyshortcuts={ariaKeyShortcuts(['app-zoom-in'])} disabled={factor>=2} onClick={()=>onCommand('in')}><Plus size={14}/></button>
  {factor!==1&&<button type="button" className="quiet zoom-indicator-reset" aria-keyshortcuts={ariaKeyShortcuts(['app-zoom-reset'])} onClick={()=>onCommand('reset')}>Reset</button>}
 </div>;
}

/** Desktop app zoom readout: appears where a zoom change originated, updates in place, then fades. */
export function ZoomIndicator(){
 const desktop=useDesktop(),[shown,setShown]=useState<{factor:number;sequence:number}|null>(null),[leaving,setLeaving]=useState(false);
 const seen=useRef(desktop?.state.appZoom?.sequence??0);
 const clock=useRef<ReturnType<typeof createZoomIndicatorClock>>(undefined);
 if(!clock.current)clock.current=createZoomIndicatorClock({show:(factor,sequence)=>{setLeaving(false);setShown({factor,sequence});},leave:()=>setLeaving(true),hide:()=>{setLeaving(false);setShown(null);}});
 const appZoom=desktop?.state.appZoom,ownId=desktop?.context.windowId;
 useEffect(()=>{const next=zoomIndicatorUpdate(seen.current,appZoom,ownId??'');seen.current=next.seen;if(next.show)clock.current!.show(next.show.factor,next.show.sequence);},[appZoom,ownId]);
 useEffect(()=>()=>clock.current!.dispose(),[]);
 if(!desktop||!shown)return null;
 return <ZoomIndicatorView factor={shown.factor} sequence={shown.sequence} leaving={leaving} onCommand={command=>void desktop.bridge.zoom(command)} onHold={held=>clock.current!.hold(held)}/>;
}
