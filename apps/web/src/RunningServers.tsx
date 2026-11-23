import {useEffect,useRef,useState} from 'react';
import {Server} from 'lucide-react';
import {authenticated,csrfToken,read} from './api.ts';
import {useDevServers} from './project-api.ts';
import {CopyButton} from './CopyButton.tsx';
import type {DevServer} from '../../../packages/contracts/dev-servers.ts';
import './running-servers.css';

export function formatServerUptime(startedAt:string,now:number=Date.now()):string{
 const seconds=Math.max(0,Math.floor((now-Date.parse(startedAt))/1000));
 if(seconds<60)return '<1m';
 const minutes=Math.floor(seconds/60);
 if(minutes<60)return `${minutes}m`;
 const hours=Math.floor(minutes/60);
 if(hours<48)return `${hours}h ${minutes%60}m`;
 return `${Math.floor(hours/24)}d`;
}

export interface RunningServersViewProps{
 items:DevServer[];unavailable?:string;
 onStop?:(row:DevServer)=>void;stoppingId?:string|null;errors?:Record<string,string>;
}

export function RunningServersView({items,unavailable='',onStop,stoppingId=null,errors={}}:RunningServersViewProps){
 const [armed,setArmed]=useState<string|null>(null);
 const armTimer=useRef<ReturnType<typeof setTimeout>|null>(null),focusNext=useRef<string|null>(null);
 const disarm=()=>{if(armTimer.current){clearTimeout(armTimer.current);armTimer.current=null;}setArmed(null);};
 useEffect(()=>()=>{if(armTimer.current)clearTimeout(armTimer.current);},[]);
 useEffect(()=>{
  // When the list changes after a confirmed stop, move focus to the recorded
  // successor (or last row) so keyboard users keep their place (T06).
  if(!focusNext.current)return;
  const target=document.querySelector<HTMLElement>(`.running-servers-row[data-server-id="${CSS.escape(focusNext.current)}"] button`);
  focusNext.current=null;
  target?.focus();
 },[items]);
 if(items.length===0){
  return unavailable?<p className="running-servers-error">{unavailable}</p>:null;
 }
 const confirmStop=(row:DevServer,index:number)=>{
  focusNext.current=items[index+1]?.id??items[index-1]?.id??null;
  disarm();onStop?.(row);
 };
 const arm=(id:string)=>{
  setArmed(id);
  if(armTimer.current)clearTimeout(armTimer.current);
  armTimer.current=setTimeout(()=>{armTimer.current=null;setArmed(null);},3000);
 };
 return <section className="running-servers" aria-label="Running servers">
  <h3 className="running-servers-heading"><Server size={14} aria-hidden="true"/><span>Running</span><span className="running-servers-count">{items.length}</span></h3>
  {unavailable&&<p className="running-servers-error">{unavailable}</p>}
  <ul className="running-servers-list">
   {items.map((row,index)=>{
    const busy=stoppingId===row.id,error=errors[row.id];
    return <li key={row.id} data-server-id={row.id} className="running-servers-row" data-stopping={busy||undefined} aria-label={`${row.label} on port ${row.port}`}>
     <div className="running-servers-main">
      <span className="running-servers-label" title={row.label}>{row.label}</span>
      <span className="running-servers-url" title={row.url}>{row.url.replace(/^https?:\/\//,'')}</span>
      {row.threadTitle&&<span className="running-servers-thread" title={row.threadTitle}>{row.threadTitle}</span>}
      <time className="running-servers-uptime" dateTime={row.startedAt}>{formatServerUptime(row.startedAt)}</time>
     </div>
     <div className="running-servers-actions">
      <CopyButton text={row.url} label={`Copy URL for ${row.label}`}/>
      {onStop&&<button type="button" className="running-servers-stop" data-armed={armed===row.id||undefined} disabled={busy}
       aria-label={armed===row.id?`Confirm stop ${row.label}`:`Stop ${row.label}`}
       onClick={()=>{armed===row.id?confirmStop(row,index):arm(row.id);}}
       onKeyDown={event=>{if(event.key==='Escape'){event.stopPropagation();disarm();}}}
       onBlur={disarm}>
       {busy?<span className="running-servers-spinner" aria-hidden="true"/>:armed===row.id?'Stop?':'Stop'}
      </button>}
     </div>
     {error&&<p className="running-servers-error" role="alert">{error}</p>}
    </li>;
   })}
  </ul>
 </section>;
}

export function RunningServers({projectId,threadId}:{projectId:string;threadId?:string}){
 const{items,error,refresh}=useDevServers(projectId,threadId);
 const[stoppingId,setStoppingId]=useState<string|null>(null),[errors,setErrors]=useState<Record<string,string>>({});
 const stop=async(row:DevServer)=>{
  setStoppingId(row.id);
  setErrors(previous=>{const next={...previous};delete next[row.id];return next;});
  try{
   await authenticated(()=>fetch(`/api/terminals/${encodeURIComponent(row.terminalId)}/commands`,{
    method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','x-harness-csrf':csrfToken},
    body:JSON.stringify({projectId:row.projectId,...(row.threadId?{threadId:row.threadId}:{}),type:'stop'}),
   })).then(read);
   await refresh();
  }catch(cause){
   setErrors(previous=>({...previous,[row.id]:cause instanceof Error?cause.message:'The server could not be stopped.'}));
  }finally{
   setStoppingId(value=>value===row.id?null:value);
  }
 };
 return <RunningServersView items={items} unavailable={error} onStop={stop} stoppingId={stoppingId} errors={errors}/>;
}
