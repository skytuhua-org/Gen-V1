import {useCallback,useEffect,useLayoutEffect,useRef,useState} from 'react';
import {authenticated,csrfToken,read} from './api.ts';
import type {ProjectContext} from '../../../packages/contracts/workspace.ts';
import {devServerListSchema,type DevServer} from '../../../packages/contracts/dev-servers.ts';

export const DEV_SERVERS_REFRESH_EVENT='gen:dev-servers-refresh';
export function refreshDevServers(){window.dispatchEvent(new Event(DEV_SERVERS_REFRESH_EVENT));}

export function useDevServers(projectId?:string,threadId?:string){
 const owner=projectId?JSON.stringify([projectId,threadId]):'';
 const [state,setState]=useState<{owner:string;items:DevServer[];error:string}>({owner:'',items:[],error:''}),generation=useRef(0);
 const load=useCallback(async()=>{
  const captured=++generation.current;
  if(!projectId){setState({owner,items:[],error:''});return;}
  try{
   const next=await authenticated(()=>fetch(`/api/projects/${encodeURIComponent(projectId)}/dev-servers${threadId?'?threadId='+encodeURIComponent(threadId):''}`,{credentials:'same-origin',cache:'no-store'})).then(read<unknown>);
   if(captured!==generation.current)return;
   const parsed=devServerListSchema.safeParse(next);
   setState(parsed.success?{owner,items:parsed.data.items,error:''}:{owner,items:[],error:'The dev servers response was malformed.'});
  }catch(reason){
   if(captured!==generation.current)return;
   const message=reason instanceof Error?reason.message:'Dev servers could not be loaded.';
   setState(previous=>previous.owner===owner?{...previous,error:message}:{owner,items:[],error:message});
  }
 },[projectId,threadId,owner]);
 useEffect(()=>{
  void load();
  const poll=()=>{if(document.visibilityState==='visible')void load();};
  const timer=setInterval(poll,3000);
  document.addEventListener('visibilitychange',poll);
  window.addEventListener(DEV_SERVERS_REFRESH_EVENT,load);
  return()=>{generation.current++;clearInterval(timer);document.removeEventListener('visibilitychange',poll);window.removeEventListener(DEV_SERVERS_REFRESH_EVENT,load);};
 },[load]);
 const current=state.owner===owner?state:{items:[],error:''};
 return{items:current.items,error:current.error,refresh:load};
}

function isProjectContext(value:unknown):value is ProjectContext{
 if(!value||typeof value!=='object')return false;
 const next=value as Record<string,unknown>,project=next.project as Record<string,unknown>|undefined,capabilities=next.capabilities as Record<string,unknown>|undefined,changes=next.changes as Record<string,unknown>|undefined,editor=next.editor as Record<string,unknown>|undefined;
 const stringOrNull=(field:unknown)=>typeof field==='string'||field===null,countOrNull=(field:unknown)=>typeof field==='number'||field===null;
 if(!project||typeof project!=='object'||typeof project.id!=='string'||typeof project.name!=='string')return false;
 if(typeof next.machineName!=='string'||!editor||typeof editor!=='object'||typeof editor.available!=='boolean'||typeof editor.label!=='string')return false;
 if(!stringOrNull(next.branch)||!stringOrNull(next.head))return false;
 if(!changes||typeof changes!=='object'||!countOrNull(changes.added)||!countOrNull(changes.removed)||!countOrNull(changes.files))return false;
 if(!capabilities||typeof capabilities!=='object'||typeof capabilities.git!=='boolean'||typeof capabilities.terminal!=='boolean'||typeof capabilities.pullRequests!=='boolean')return false;
 if(!Array.isArray(next.lineage)||!next.lineage.every(item=>item&&typeof item==='object'&&typeof(item as Record<string,unknown>).id==='string'&&typeof(item as Record<string,unknown>).title==='string'&&typeof(item as Record<string,unknown>).status==='string'))return false;
 if(!Array.isArray(next.scripts)||!next.scripts.every(item=>item&&typeof item==='object'&&typeof(item as Record<string,unknown>).id==='string'&&typeof(item as Record<string,unknown>).name==='string'&&typeof(item as Record<string,unknown>).command==='string'))return false;
 return true;
}

export function useProjectContext(projectId?:string,threadId?:string,workspaceId?:string){
 const owner=projectId?JSON.stringify([projectId,threadId,workspaceId]):'';
 const [state,setState]=useState<{owner:string;context:ProjectContext|null;loading:boolean;error:string}>({owner:'',context:null,loading:false,error:''}),generation=useRef(0);
 const pending=useRef<AbortController|null>(null);
 const activeLoad=useRef<(()=>Promise<void>)|null>(null);
 const load=useCallback(async()=>{
  const captured=++generation.current;pending.current?.abort();pending.current=null;if(!projectId){setState({owner,context:null,loading:false,error:''});return;}
  const controller=new AbortController();pending.current=controller;
  setState(previous=>({owner,context:previous.owner===owner?previous.context:null,loading:true,error:''}));
  try{const next=await authenticated(()=>fetch(`/api/projects/${encodeURIComponent(projectId)}/context${threadId?'?threadId='+encodeURIComponent(threadId):''}`,{credentials:'same-origin',cache:'no-store',signal:controller.signal})).then(read<ProjectContext>);if(captured!==generation.current)return;const malformed=!isProjectContext(next);setState({owner,context:malformed?null:next,loading:false,error:malformed?'The project context response was malformed.':''});}
  catch(reason){if(captured===generation.current&&!controller.signal.aborted)setState({owner,context:null,loading:false,error:reason instanceof Error?reason.message:'Project context could not be loaded.'});}
  finally{if(pending.current===controller)pending.current=null;}
 },[projectId,threadId,owner]);
 useLayoutEffect(()=>{activeLoad.current=load;},[load]);
 useEffect(()=>{void load();return()=>{if(activeLoad.current===load)activeLoad.current=null;generation.current++;pending.current?.abort();pending.current=null;};},[load]);
 const action=useCallback(async(type:string,payload:Record<string,unknown>={})=>{
  if(!projectId)return;
  await authenticated(()=>fetch(`/api/projects/${encodeURIComponent(projectId)}/actions`,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','x-harness-csrf':csrfToken},body:JSON.stringify({id:crypto.randomUUID(),type,payload,...(threadId?{threadId}:{})})})).then(read);
  if(activeLoad.current===load)await load();
 },[projectId,threadId,load]);
 const current=state.owner===owner?state:{context:null,loading:Boolean(projectId),error:''};
 return{context:current.context,loading:current.loading,error:current.error,action};
}
