import {lazy,Suspense,useEffect,useRef,useState} from 'react';
import {displayThreadTitle} from './thread-title';
import type {ProjectContext,WorkspaceAuthority} from '../../../packages/contracts/workspace.ts';
import type {ModelInfo,Snapshot,Thread} from '../../../packages/contracts/index.ts';
import type {UiPreferences} from '../../../packages/contracts/preferences.ts';
import {getPreferences} from '../../../packages/contracts/preferences.ts';
import {command,getModels,getSnapshot} from './api';
import {projectColorKey} from './project-colors';
import {projectModelDefaultFor} from './project-model-defaults';
import {ProjectContextCard} from './ProjectContextCard';
import {useProjectContext} from './project-api';
import {PlanStatus} from './PlanStatus';
import {selectPlanRecord} from './plan-visibility';
import './project-memory.css';
const MemoryReview=lazy(()=>import('./ProjectMemoryReview').then(module=>({default:module.ProjectMemoryReview})));

export interface ProjectContextSurfaceProps {thread?:Thread;snapshot:Snapshot;planOpen?:boolean;onTogglePlan?:()=>void;fullPlanVisible?:boolean;onShowChanges?:()=>void;onSelectThread?:(id:string)=>void;onConnect?:()=>void;onContext?:(context:ProjectContext|null)=>void;onOpenDetailedPlan?:()=>void;defaultPlanOpen?:boolean;composerChangesAvailable?:boolean;refresh?:()=>Promise<void>;
 /** Workspace envelope projects, used for the project model-defaults editor and prune (#1481). */
 workspaceProjects?:{id:string;authority:WorkspaceAuthority}[];modelDefaultsRequest?:number;}

export function ProjectContextSurface({thread,snapshot,planOpen,onTogglePlan,fullPlanVisible=false,onShowChanges,onSelectThread,onConnect,onContext,onOpenDetailedPlan,defaultPlanOpen=false,composerChangesAvailable=false,refresh,workspaceProjects,modelDefaultsRequest}:ProjectContextSurfaceProps){
 const project=useProjectContext((thread as Thread&{projectId?:string}|undefined)?.projectId,thread?.id),[open,setOpen]=useState(defaultPlanOpen),[memoryOwner,setMemoryOwner]=useState(''),plan=selectPlanRecord(snapshot,thread?.id),memoryLauncher=useRef<HTMLButtonElement>(null);
 const memoryTarget=thread?.projectId&&(!thread.kind||thread.kind==='main')&&!thread.parentThreadId&&!thread.sideParentId&&!thread.jobId?{projectId:thread.projectId,threadId:thread.id,accountId:thread.accountId??null}:undefined;
 const memoryKey=memoryTarget?JSON.stringify(memoryTarget):'',localProject=project.context?.project.authority.kind==='local'&&project.context.project.id===thread?.projectId&&project.context.threadId===thread?.id;
 useEffect(()=>{setMemoryOwner('');},[memoryKey]);
 useEffect(()=>{onContext?.(project.context);},[onContext,project.context]);
 const envelopeProject=thread?.projectId?workspaceProjects?.find(item=>item.id===thread.projectId):undefined;
 const preferences=getPreferences(snapshot.settings ?? {});
 const modelDefault=envelopeProject?projectModelDefaultFor(preferences,envelopeProject.authority,envelopeProject.id):null;
 const saveModelDefault=envelopeProject?async(value:{modelId:string;thinkingLevel:string|null}|null)=>{
  const live=getPreferences((await getSnapshot()).settings),next:UiPreferences['projectModelDefaults']={...live.projectModelDefaults};
  // R13: prune entries whose project no longer exists in the current workspace envelope.
  const valid=new Set((workspaceProjects??[]).map(item=>projectColorKey(item.authority,item.id)));
  for(const key of Object.keys(next))if(!valid.has(key))delete next[key];
  const key=projectColorKey(envelopeProject.authority,envelopeProject.id);
  if(value)next[key]=value;else delete next[key];
  await command('settings.update',{preferences:{projectModelDefaults:next}});await refresh?.();
 }:undefined;
 const loadDefaultCatalog=envelopeProject?async(signal:AbortSignal):Promise<ModelInfo[]>=>(await getModels(false,undefined,signal)).models:undefined;
 return <><ProjectContextCard key={JSON.stringify([thread?.id,thread?.projectId])} snapshot={snapshot} threadId={thread?.id} composerChangesAvailable={composerChangesAvailable} onOpenDetailedPlan={onOpenDetailedPlan} context={project.context} loading={project.loading} error={project.error} threadTitle={thread?displayThreadTitle(thread):undefined} onAction={project.action} onSelectThread={onSelectThread} onShowChanges={onShowChanges} onConnect={onConnect} plan={plan?<PlanStatus snapshot={snapshot} threadId={thread?.id}/>:undefined} planOpen={planOpen??open} fullPlanVisible={fullPlanVisible} onTogglePlan={onTogglePlan??(()=>setOpen(value=>!value))} modelDefault={modelDefault} onSaveModelDefault={saveModelDefault} loadDefaultCatalog={loadDefaultCatalog} modelDefaultOpen={modelDefaultsRequest}/>{memoryTarget&&<div className="project-memory-launcher"><button ref={memoryLauncher} type="button" disabled={!localProject||project.loading||Boolean(project.error)} onClick={()=>setMemoryOwner(memoryKey)}>Project memory</button></div>}{memoryTarget&&memoryOwner===memoryKey&&localProject&&<Suspense fallback={<p role="status">Opening project memory…</p>}><MemoryReview key={memoryKey} owner={memoryTarget} close={()=>{setMemoryOwner('');requestAnimationFrame(()=>memoryLauncher.current?.focus());}}/></Suspense>}</>;
}
