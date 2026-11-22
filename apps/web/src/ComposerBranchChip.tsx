import {useEffect,useId,useRef,useState,type KeyboardEvent} from 'react';
import {Popover} from '../../../packages/ui-shell/Popover';
import {isComposing} from '../../../packages/ui-shell/list-navigation';
import {Check,ChevronDown,GitBranch,Search} from 'lucide-react';
import type {BranchEntry} from '../../../packages/contracts/workspace-branches.ts';
import type {ProjectContext} from '../../../packages/contracts/workspace.ts';
import {useThreadBranch,type BranchActionResult} from './useThreadBranch.ts';
import './composer-branch.css';

export interface ComposerBranchChipProps {
 projectId?:string;threadId?:string;context?:ProjectContext|null;
 working?:boolean;disabled?:boolean;
 onOpenChanges?:()=>void|Promise<void>;
}
const branchNameProblem=(name:string):string|null=>{
 if(!name||name.length>250)return 'Enter a branch name.';
 if(/^[\x00-\x20~]|[\x00-\x20~]$/.test(name)||/[\x00-\x1f\x7f]/.test(name))return 'Branch names cannot contain control characters.';
 if(name.startsWith('-'))return 'A branch name cannot start with a dash.';
 if(/\.lock(?:\/|$)/.test(name))return 'A path component cannot end with ".lock".';
 if(/\.\.|\/\/|@{|@$|^\/|\/$/.test(name))return 'Branch names cannot contain "..", "//", "@{", or empty path segments.';
 if(/[?*\[\\:]/.test(name))return 'Branch names cannot contain spaces or ? * [ \\ : characters.';
 if(/[ \t]/.test(name))return 'Branch names cannot contain spaces.';
 if(name==='@'||name==='HEAD')return `"${name}" is reserved by Git.`;
 return null;
};
const relativeTime=(value:string):string=>{
 const then=Date.parse(value);if(!Number.isFinite(then))return '';
 const seconds=Math.round((then-Date.now())/1000),absolute=Math.abs(seconds);
 const formatter=new Intl.RelativeTimeFormat(undefined,{numeric:'auto'});
 if(absolute<60)return formatter.format(Math.trunc(seconds/60)*60,'minute');
 if(absolute<3600)return formatter.format(Math.trunc(seconds/60),'minute');
 if(absolute<86400)return formatter.format(Math.trunc(seconds/3600),'hour');
 if(absolute<86400*30)return formatter.format(Math.trunc(seconds/86400),'day');
 if(absolute<86400*365)return formatter.format(Math.trunc(seconds/(86400*30)),'month');
 return formatter.format(Math.trunc(seconds/(86400*365)),'year');
};
const matches=(entry:BranchEntry,query:string)=>entry.name.toLowerCase().includes(query);

export function ComposerBranchChip({projectId,threadId,context,working=false,disabled=false,onOpenChanges}:ComposerBranchChipProps){
 const id=useId(),trigger=useRef<HTMLButtonElement>(null),popover=useRef<HTMLDivElement>(null),search=useRef<HTMLInputElement>(null),createInput=useRef<HTMLInputElement>(null);
 const {list,loading,error:loadError,reload,act}=useThreadBranch(projectId,threadId);
 const [open,setOpen]=useState(false),[present,setPresent]=useState(false),[query,setQuery]=useState(''),[active,setActive]=useState('');
 const [confirming,setConfirming]=useState<BranchEntry|null>(null),[creating,setCreating]=useState(false),[name,setName]=useState('');
 const [pending,setPending]=useState<BranchEntry|null>(null),[notice,setNotice]=useState(''),[failure,setFailure]=useState<{code:string;message:string}|null>(null),[switched,setSwitched]=useState('');
 const wasWorking=useRef(working);
 const git=context?.capabilities.git===true,locked=disabled||working||Boolean(list&&!list.canSwitch);
 const dirty=(list?.dirty.tracked??0)+(list?.dirty.untracked??0)>0;
 const trimmed=query.trim().toLowerCase();
 const localEntries=(list?.local??[]).filter(entry=>matches(entry,trimmed)).toSorted((a,b)=>Number(b.current)-Number(a.current));
 const remoteEntries=(list?.remote??[]).filter(entry=>matches(entry,trimmed));
 const visible=[...localEntries.map(entry=>({entry,source:'local' as const})),...remoteEntries.map(entry=>({entry,source:'remote' as const}))];
 const activeItem=visible.find(item=>item.entry.name===active&&item.source==='local')??visible.find(item=>item.entry.name===active)??visible[0];
 const nameProblem=creating?branchNameProblem(name.trim()):null;
 useEffect(()=>{if(open||!present)return;const timeout=window.setTimeout(()=>setPresent(false),140);return()=>window.clearTimeout(timeout);},[open,present]);
 useEffect(()=>{if(working&&!wasWorking.current)close(false);if(wasWorking.current&&!working&&threadId)void reload();wasWorking.current=working;},[working,threadId,reload]);
 useEffect(()=>{if(!git)setOpen(false);},[git]);
 function close(restoreFocus=false){setOpen(false);setConfirming(null);setCreating(false);setFailure(null);if(restoreFocus)trigger.current?.focus();}
 function show(){if(locked)return;setQuery('');setActive('');setConfirming(null);setCreating(false);setFailure(null);void reload();setPresent(true);setOpen(true);}
 async function finish(result:BranchActionResult,label:string){
  setPending(null);
  if(result.state==='confirmed'){setSwitched(label);setNotice('Switched to '+label);close(false);return;}
  if(result.state==='uncertain'){setFailure({code:result.code??'ACTION_UNCERTAIN',message:'Gen could not confirm the branch change. Check the branch before retrying.'});return;}
  setFailure({code:result.code??'ACTION_FAILED',message:result.message??'The branch change was not applied.'});
 }
 async function pick(entry:BranchEntry,source:'local'|'remote',bringChanges=false){
  if(pending||!list)return;
  if(entry.current&&!bringChanges){close(true);return;}
  if(entry.occupiedBy==='other'){setFailure({code:'BRANCH_IN_USE',message:'"'+entry.name+'" is in use by another thread.'});return;}
  if(dirty&&!bringChanges){setConfirming(entry);setActive(entry.name);return;}
  setPending(entry);setFailure(null);
  await finish(await act('switch-branch',{branch:entry.name,source,bringChanges,expectedHead:list.head,revision:list.revision}),entry.name);
 }
 async function create(){
  const branch=name.trim(),problem=branchNameProblem(branch);
  if(problem||pending||!list)return;
  const entry:BranchEntry={name:branch,head:list.head??'',subject:'',committedAt:'',upstream:null,current:false,occupiedBy:null};
  setPending(entry);setFailure(null);
  await finish(await act('create-branch',{name:branch,expectedHead:list.head,revision:list.revision}),branch);
 }
 function navigate(event:KeyboardEvent<HTMLInputElement>){
  if(isComposing(event)){if(event.key==='Escape')event.preventDefault();return;}
  if(event.altKey||event.ctrlKey||event.metaKey)return;
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();if(confirming||creating){setConfirming(null);setCreating(false);return;}close(true);return;}
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){
   event.preventDefault();const index=visible.findIndex(item=>item===activeItem),count=visible.length;if(!count)return;
   const next=(index+(event.key==='ArrowDown'?1:-1)+count)%count;setActive(visible[next].entry.name);return;
  }
  if(event.key==='Enter'){event.preventDefault();if(activeItem)void pick(activeItem.entry,activeItem.source);}
 }
 if(!git||!threadId)return null;
 const label=list?.current??(list?.detached?(list.head??'').slice(0,7):'…');
 const chipTitle=working?'Wait for the active run to finish':list?`${label} · Switch branch`:'Load branches';
 return <>
  <button ref={trigger} type="button" role="combobox" aria-label={'Branch: '+(list?.detached?'detached at '+label:label)} aria-expanded={open} aria-haspopup="dialog" aria-controls={open?id+'-branches':undefined} aria-disabled={locked} className="composer-context-chip composer-branch" title={chipTitle} onClick={()=>open?close(true):show()}>
   <GitBranch size={12} className="composer-branch-glyph" aria-hidden="true" data-success={Boolean(switched)}/>
   {pending?<span className="composer-branch-ring" aria-hidden="true"/>:null}
   <span className="composer-branch-name" data-detached={list?.detached||undefined} key={switched||label}>{label}</span>
   {dirty&&<><span className="composer-branch-dirty" aria-hidden="true"/><span className="sr-only">uncommitted changes</span></>}
   <ChevronDown size={10} aria-hidden="true"/>
  </button>
  <span className="sr-only" role="status" aria-live="polite">{notice}</span>
  <Popover anchor={trigger} contentRef={popover} initialFocus={search} open={open&&!locked} present={present} width={360} height={420} onDismiss={()=>close()} preferredSide="above" id={id+'-branches'} role="dialog" aria-label="Branches" className="composer-branch-popover">
   <div className="composer-branch-search"><Search size={14} aria-hidden="true"/><input ref={search} type="search" aria-label="Search branches" placeholder="Search branches…" value={query} autoComplete="off" spellCheck={false} aria-autocomplete="list" aria-controls={id+'-list'} aria-activedescendant={activeItem?id+'-'+activeItem.source+'-'+activeItem.entry.name:undefined} onChange={event=>{setQuery(event.target.value);setActive('');}} onKeyDown={navigate}/></div>
   {confirming?
    <div className="composer-branch-confirm" role="alertdialog" aria-label="Uncommitted changes">
     <p>{`This working copy has uncommitted changes. Bring them to "${confirming.name}"?`}</p>
     <div className="composer-branch-confirm-actions">
      <button type="button" className="composer-branch-primary" onClick={()=>{const target=confirming;setConfirming(null);void pick(target,remoteEntries.includes(target)?'remote':'local',true);}}>Bring changes</button>
      <button type="button" onClick={()=>setConfirming(null)}>Cancel</button>
     </div>
    </div>:
   <>
    <div id={id+'-list'} role="listbox" aria-label="Branches" aria-busy={Boolean(pending)||loading} className="composer-branch-list" tabIndex={-1}>
     {localEntries.length>0&&<div className="composer-branch-heading" aria-hidden="true">Local</div>}
     {localEntries.map(entry=><BranchRow key={'l:'+entry.name} id={id+'-local-'+entry.name} entry={entry} activeItem={activeItem?.entry===entry} pending={pending?.name===entry.name} onPick={()=>void pick(entry,'local')}/>)}
     {remoteEntries.length>0&&<div className="composer-branch-heading" aria-hidden="true">Remote</div>}
     {remoteEntries.map(entry=><BranchRow key={'r:'+entry.name} id={id+'-remote-'+entry.name} entry={entry} activeItem={activeItem?.entry===entry} pending={pending?.name===entry.name} onPick={()=>void pick(entry,'remote')}/>)}
     {!visible.length&&<p className="composer-branch-empty" role="status">No branches match "{query}".</p>}
    </div>
    {failure&&<div className="composer-branch-error" role="alert">{failure.message}{(failure.code==='BRANCH_CONFLICT'||failure.code==='DIRTY_TREE')&&onOpenChanges&&<button type="button" onClick={()=>{void onOpenChanges();close(false);}}>Open Changes</button>}{failure.code==='RUN_ACTIVE'&&<span className="composer-branch-note"> Wait for the active run to finish, then switch.</span>}</div>}
    {loadError&&<div className="composer-branch-error" role="alert">{loadError}<button type="button" onClick={()=>void reload()}>Check branch</button></div>}
    <div className="composer-branch-create" data-open={creating}>
     {creating?
      <div className="composer-branch-create-form">
       <input ref={createInput} type="text" aria-label="New branch name" placeholder="New branch name" value={name} autoComplete="off" spellCheck={false} aria-invalid={Boolean(name&&nameProblem)} onChange={event=>setName(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();void create();}if(event.key==='Escape'){event.preventDefault();setCreating(false);}}}/>
       <button type="button" className="composer-branch-primary" disabled={Boolean(nameProblem)||pending!==null} onClick={()=>void create()}>Create</button>
       <button type="button" onClick={()=>setCreating(false)}>Cancel</button>
      </div>:
      <button type="button" className="composer-branch-create-row" onClick={()=>{setCreating(true);setName(!visible.length?query:'');window.setTimeout(()=>createInput.current?.focus());}}>Create branch from here</button>}
     {creating&&name&&nameProblem&&<p className="composer-branch-note" role="status">{nameProblem}</p>}
    </div>
    {!list?.canSwitch&&list?.reason&&<p className="composer-branch-note" role="note">{list.reason==='run-active'?'A run is active. Branch switching is disabled until it finishes.':list.reason==='read-only'?'This working copy is read-only.':'Git is not available in this project.'}</p>}
   </>}
  </Popover>
 </>;
}
function BranchRow({id,entry,activeItem,pending,onPick}:{id:string;entry:BranchEntry;activeItem:boolean;pending:boolean;onPick:()=>void}){
 const inUse=entry.occupiedBy==='other';
 return <div id={id} role="option" aria-selected={entry.current} aria-disabled={inUse} data-active={activeItem||undefined} className="composer-branch-row" title={entry.name} onMouseDown={event=>event.preventDefault()} onClick={()=>{if(!inUse)onPick();}}>
  <span className="composer-branch-check">{pending?<span className="composer-branch-ring" aria-hidden="true"/>:entry.current&&<Check size={12} aria-hidden="true"/>}</span>
  <span className="composer-branch-row-name">{entry.name}</span>
  {inUse?<span className="composer-branch-meta">In use by another thread</span>:<span className="composer-branch-meta">{entry.head.slice(0,7)}{entry.committedAt&&' · '+relativeTime(entry.committedAt)}</span>}
 </div>;
}
