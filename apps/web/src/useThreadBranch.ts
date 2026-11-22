import {useCallback,useEffect,useLayoutEffect,useRef,useState} from 'react';
import {ApiError,authenticated,csrfToken,read} from './api.ts';
import type {BranchList} from '../../../packages/contracts/workspace-branches.ts';
import type {WorkspaceActionExecution} from '../../../packages/contracts/workspace-action-outcomes.ts';

export const WORKSPACE_CHANGED='gen:workspace-changed';
export interface WorkspaceChangedDetail {projectId:string;threadId:string}
export function announceWorkspaceChanged(projectId:string,threadId:string){
 window.dispatchEvent(new CustomEvent<WorkspaceChangedDetail>(WORKSPACE_CHANGED,{detail:{projectId,threadId}}));
}
export function onWorkspaceChanged(listener:(detail:WorkspaceChangedDetail)=>void):()=>void{
 const handler=(event:Event)=>{const detail=(event as CustomEvent<WorkspaceChangedDetail>).detail;if(detail&&typeof detail.projectId==='string'&&typeof detail.threadId==='string')listener(detail);};
 window.addEventListener(WORKSPACE_CHANGED,handler);return()=>window.removeEventListener(WORKSPACE_CHANGED,handler);
}

export interface BranchActionResult {state:WorkspaceActionExecution['state'];code?:string;message?:string}
export function useThreadBranch(projectId?:string,threadId?:string){
 const [state,setState]=useState<{list:BranchList|null;loading:boolean;error:string}>({list:null,loading:false,error:''});
 const generation=useRef(0),pending=useRef<AbortController|null>(null),activeLoad=useRef<(()=>Promise<void>)|null>(null);
 const load=useCallback(async()=>{
  const captured=++generation.current;pending.current?.abort();pending.current=null;
  if(!projectId){setState({list:null,loading:false,error:''});return;}
  const controller=new AbortController();pending.current=controller;
  setState(previous=>({list:previous.list,loading:true,error:''}));
  try{
   const next=await authenticated(()=>fetch(`/api/projects/${encodeURIComponent(projectId)}/branches${threadId?'?threadId='+encodeURIComponent(threadId):''}`,{credentials:'same-origin',cache:'no-store',signal:controller.signal})).then(read<BranchList>);
   if(captured!==generation.current)return;setState({list:next,loading:false,error:''});
  }catch(reason){if(captured===generation.current&&!controller.signal.aborted)setState({list:null,loading:false,error:reason instanceof Error?reason.message:'Branch list could not be loaded.'});}
  finally{if(pending.current===controller)pending.current=null;}
 },[projectId,threadId]);
 useLayoutEffect(()=>{activeLoad.current=load;},[load]);
 useEffect(()=>{void load();return()=>{if(activeLoad.current===load)activeLoad.current=null;generation.current++;pending.current?.abort();pending.current=null;};},[load]);
 const act=useCallback(async(type:'switch-branch'|'create-branch',payload:Record<string,unknown>):Promise<BranchActionResult>=>{
  if(!projectId)return{state:'not-applied',code:'NO_PROJECT',message:'No project is selected.'};
  try{
   const result=await authenticated(()=>fetch(`/api/projects/${encodeURIComponent(projectId)}/actions`,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','x-harness-csrf':csrfToken},body:JSON.stringify({id:crypto.randomUUID(),type,payload,...(threadId?{threadId}:{})})})).then(read<WorkspaceActionExecution>);
   if(result.state==='confirmed'&&threadId)announceWorkspaceChanged(projectId,threadId);
   if(activeLoad.current===load)await load();
   return{state:result.state,...('error' in result&&result.error?{code:result.error.code,message:result.error.message}:{})};
  }catch(reason){
   const code=reason instanceof ApiError?reason.code:'HTTP_ERROR',message=reason instanceof Error?reason.message:'The branch action could not finish.';
   if(activeLoad.current===load)await load();
   return{state:code==='HTTP_ERROR'||code==='NETWORK_ERROR'?'uncertain':'not-applied',code,message};
  }
 },[projectId,threadId,load]);
 return{list:state.list,loading:state.loading,error:state.error,reload:load,act};
}
