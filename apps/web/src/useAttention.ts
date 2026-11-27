import {useSyncExternalStore} from 'react';
import {attentionItemSchema,type AttentionEnvelope} from '../../../packages/contracts/attention.ts';
import {authenticated,csrfToken,read,subscribe} from './api';

let state:AttentionEnvelope&{error:string;loaded:boolean}={items:[],unread:0,sequence:0,error:'',loaded:false};
const listeners=new Set<()=>void>();let stop:(()=>void)|undefined,flight:Promise<string|undefined>|undefined,trailing:Promise<string|undefined>|undefined,timer:ReturnType<typeof setTimeout>|undefined;
const publish=()=>{for(const listener of listeners)listener();};
async function withAttentionDeadline<T>(run:(signal:AbortSignal)=>Promise<T>):Promise<T>{
 const controller=new AbortController();
 let timer:ReturnType<typeof setTimeout>|undefined;
 const timeout=new Promise<never>((_,reject)=>{
  timer=setTimeout(()=>{
   const error=new Error('The inbox is not responding. Try again.');
   reject(error);
   controller.abort(error);
  },15_000);
 });
 try{return await Promise.race([run(controller.signal),timeout]);}
 finally{clearTimeout(timer);}
}
function refreshAttention():Promise<string|undefined>{
 if(flight)return trailing??=flight.then(()=>{trailing=undefined;return refreshAttention();});
 return flight=Promise.resolve().then(async()=>{
  try{const value=await withAttentionDeadline(signal=>authenticated(()=>fetch('/api/attention',{credentials:'same-origin',cache:'no-store',redirect:'error',signal})).then(read<AttentionEnvelope>));if(!Array.isArray(value.items)||value.items.length>1000||!Number.isSafeInteger(value.sequence))throw Error('The Inbox response is invalid.');state={...value,items:value.items.map(item=>attentionItemSchema.parse(item)),error:'',loaded:true};publish();}
  catch(cause){const error=cause instanceof Error?cause.message:'Inbox could not load.';state={...state,error};publish();return error;}
  finally{flight=undefined;}
 });
}
function listen(listener:()=>void){listeners.add(listener);if(listeners.size===1){let cancelled=false,disconnect:(()=>void)|undefined;const changed=()=>{clearTimeout(timer);timer=setTimeout(()=>void refreshAttention(),60);};void refreshAttention().then(()=>{if(cancelled||!listeners.size)return;disconnect=subscribe(state.sequence,changed,connected=>{if(!connected){state={...state,error:'Inbox is reconnecting…'};publish();}},async()=>{await refreshAttention();});});window.addEventListener('focus',changed);stop=()=>{cancelled=true;disconnect?.();window.removeEventListener('focus',changed);};}return()=>{listeners.delete(listener);if(!listeners.size){clearTimeout(timer);stop?.();stop=undefined;}};}
async function writeReadState(eventId:string,type:'read'|'unread'|'dismiss-popup'){
 const body=JSON.stringify({id:crypto.randomUUID(),type});
 await withAttentionDeadline(signal=>authenticated(()=>fetch(`/api/attention/${encodeURIComponent(eventId)}/commands`,{method:'POST',credentials:'same-origin',cache:'no-store',redirect:'error',headers:{'Content-Type':'application/json','x-harness-csrf':csrfToken},body,signal})).then(read));
}
async function change(eventId:string,type:'read'|'unread'|'dismiss-popup'){
 await writeReadState(eventId,type);
 await refreshAttention();
}
async function markAllRead(ids:readonly string[]){
 const results=await Promise.allSettled(ids.map(id=>writeReadState(id,'read')));
 await refreshAttention();
 const failure=results.find(result=>result.status==='rejected');
 if(failure)throw failure.reason;
}
export function useAttention(enabled=true){
 const current=useSyncExternalStore(enabled?listen:()=>()=>{},()=>state,()=>state);
 return{...current,refresh:refreshAttention,markRead:(id:string)=>change(id,'read'),markUnread:(id:string)=>change(id,'unread'),markAllRead,dismissPopup:(id:string)=>change(id,'dismiss-popup')};
}
