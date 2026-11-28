/** Effective policy for imperative browser effects. No subscriptions at import time. */
export type MotionPolicy = 'full' | 'reduced' | 'off';
const effectivePolicy = (reduce: boolean): MotionPolicy => {
 const app=document.documentElement.dataset.motion;
 return app==='off'?'off':app==='reduced'||reduce?'reduced':'full';
};
export function readMotionPolicy(): MotionPolicy {
 return effectivePolicy(matchMedia('(prefers-reduced-motion: reduce)').matches);
}
const cssTime=/^([+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)(ms|s)$/i;
/** Resolve an already-effective CSS duration token; scale only a raw fallback. */
export function resolveMotionDuration(baseDurationMs:number,resolvedToken:string|undefined,speed:number):number{
 const match=resolvedToken?.trim().match(cssTime);
 if(match){
  const value=Number(match[1])*(match[2].toLowerCase()==='s'?1000:1);
  if(Number.isFinite(value)&&value>=0)return value;
 }
 const base=Number.isFinite(baseDurationMs)&&baseDurationMs>=0?baseDurationMs:0;
 const scale=Number.isFinite(speed)&&speed>0?speed:1;
 const fallback=base/scale;
 return Number.isFinite(fallback)&&fallback>=0?fallback:0;
}
/** Own both sources; notify only when their combined policy changes. */
export function observeMotionPolicy(listener: (policy: MotionPolicy) => void): () => void {
 const media=matchMedia('(prefers-reduced-motion: reduce)');
 let current=effectivePolicy(media.matches),disposed=false;
 const changed=()=>{
  if(disposed)return;
  const next=effectivePolicy(media.matches);
  if(next!==current){current=next;listener(next);}
 };
 const observer=new MutationObserver(changed);
 observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-motion']});
 media.addEventListener('change',changed);
 return ()=>{if(disposed)return;disposed=true;observer.disconnect();media.removeEventListener('change',changed);};
}
