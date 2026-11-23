import {useCallback,useEffect,useRef,useState} from 'react';
import {ArrowDown,ArrowDownToLine,ArrowUp,Check,CloudOff,GitFork,RefreshCw} from 'lucide-react';
import type {GitSyncResult,GitSyncBlocker} from '../../../packages/contracts/workspace-sync.ts';
import {ApiError,authenticated,csrfToken,read} from './api.ts';
import {toast} from '../../../packages/ui-shell/Toast';
import {GitHubSignIn} from './GitHubSignIn.tsx';
import {formatLocalDateTime,type TimeFormat} from './time-format';
import './remote-sync.css';

const getSync=<T,>(url:string,signal?:AbortSignal)=>authenticated(()=>fetch(url,{credentials:'same-origin',cache:'no-store',signal})).then(read<T>);
const postAction=<T,>(url:string,body:unknown)=>authenticated(()=>fetch(url,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','x-harness-csrf':csrfToken},body:JSON.stringify(body)})).then(read<T>);

const pullBlockedReason=(blockers:GitSyncBlocker[],overlapPath?:string)=>{
 if(blockers.includes('RUN_ACTIVE'))return 'Wait for the agent to finish before pulling.';
 if(blockers.includes('NO_UPSTREAM'))return 'This branch is not on origin yet.';
 if(blockers.includes('UP_TO_DATE'))return 'Already up to date.';
 if(blockers.includes('AHEAD_ONLY'))return 'Nothing to pull. Your branch is ahead.';
 if(blockers.includes('DIVERGED'))return 'Diverged — ask the agent or rebase.';
 if(blockers.includes('DIRTY_OVERLAP'))return `Commit or discard changes to ${overlapPath??'overlapping files'} first; the pull changes them.`;
 if(blockers.includes('DETACHED'))return 'Checkout a branch before pulling.';
 if(blockers.includes('NO_REMOTE'))return 'No GitHub remote.';
 if(blockers.includes('READ_ONLY'))return 'This working copy is read-only.';
 return 'Pull is not available for this working copy.';
};

const chipContent=(sync:GitSyncResult)=>{
 switch(sync.state){
  case 'up-to-date':return<><Check size={12} aria-hidden="true"/>Up to date</>;
  case 'ahead':return<><ArrowUp size={12} aria-hidden="true"/>{sync.ahead??''}</>;
  case 'behind':return<><ArrowDown size={12} aria-hidden="true"/>{sync.behind??''}</>;
  case 'diverged':return<><ArrowUp size={12} aria-hidden="true"/>{sync.ahead??''} <ArrowDown size={12} aria-hidden="true"/>{sync.behind??''}<GitFork size={12} aria-hidden="true"/></>;
  case 'no-upstream':return<><CloudOff size={12} aria-hidden="true"/>Not on remote</>;
  case 'no-remote':return<>No GitHub remote</>;
  case 'detached':return<>Detached</>;
 }
};

const relativeFetched=(iso:string|null,timeFormat:TimeFormat)=>{
 if(!iso)return'Never fetched in this session';
 const minutes=Math.max(0,Math.round((Date.now()-Date.parse(iso))/60000));
 if(minutes<1)return'Fetched just now';
 if(minutes<60)return`Fetched ${minutes} min ago`;
 return`Fetched ${formatLocalDateTime(iso,timeFormat)}`;
};

export function RemoteSync({base,query,active,tick=0,onChanged,timeFormat='system'}:{base:string;query:URLSearchParams;active:boolean;tick?:number;onChanged?:()=>void|Promise<void>;timeFormat?:TimeFormat}){
 const[sync,setSync]=useState<GitSyncResult|null>(null);
 const[busy,setBusy]=useState<'fetch'|'pull'|null>(null);
 const[error,setError]=useState('');
 const[errorCode,setErrorCode]=useState('');
 const[flash,setFlash]=useState(false);
 const mounted=useRef(true),generation=useRef(0);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;generation.current++;};},[]);

 const load=useCallback(async()=>{
  const captured=++generation.current;
  try{
   const next=await getSync<GitSyncResult>(base+'/git/sync?'+query);
   if(mounted.current&&captured===generation.current)setSync(next);
  }catch{/* Keep the last good read; the chip is advisory. */}
 },[base,query]);
 useEffect(()=>{if(active)void load();},[active,load,tick]);

 const action=useCallback(async(type:'fetch'|'pull')=>{
  if(!sync||busy)return;
  setBusy(type);setError('');setErrorCode('');
  try{
   await postAction(base+'/actions',{id:crypto.randomUUID(),type,payload:{revision:sync.revision,expectedHead:sync.head},...(query.get('threadId')?{threadId:query.get('threadId')}:{})});
   const next=await getSync<GitSyncResult>(base+'/git/sync?'+query).catch(()=>null);
   if(!mounted.current)return;
   if(next)setSync(next);
   const short=next?.upstream?.short??sync.upstream?.short??'origin';
   if(type==='fetch')toast(next?.behind?`Fetched origin. ${next.behind} new commit${next.behind===1?'':'s'} on ${short}.`:'Fetched origin. No new commits.',{tone:'success'});
   else{toast(`Pulled ${sync.behind??''} commits from ${short}.`,{tone:'success'});setFlash(true);window.setTimeout(()=>{if(mounted.current)setFlash(false);},700);}
   await onChanged?.();
  }catch(cause){
   if(!mounted.current)return;
   const code=cause instanceof ApiError?cause.code:'';
   setErrorCode(code);
   if(code==='PULL_BLOCKED'){
    const blockers=(cause instanceof ApiError&&Array.isArray((cause.details as {blockers?:string[]})?.blockers)?(cause.details as {blockers:string[]}).blockers:[]) as GitSyncBlocker[];
    setError(pullBlockedReason(blockers));
   }else if(code==='GITHUB_AUTH_REQUIRED')setError('Sign in to GitHub to fetch from this repository.');
   else if(code==='FETCH_TIMEOUT')setError('Fetch timed out. Check your connection and try again.');
   else if(code==='REVISION_CHANGED')setError('Your working copy changed. Refresh, then pull again.');
   else if(code==='ACTION_UNCERTAIN')setError('We could not confirm the pull finished. Check the branch, then Refresh.');
   else setError(cause instanceof Error?cause.message:'The sync action could not complete.');
   void load();
  }finally{if(mounted.current)setBusy(null);}
 },[sync,busy,base,query,onChanged,load]);

 if(!sync||sync.blockers.includes('READ_ONLY'))return null;
 const pullable=sync.state==='behind'&&!sync.blockers.length;
 const pullReason=pullBlockedReason(sync.blockers);
 const chipTitle=`${sync.upstream?.short??sync.state}${sync.state==='diverged'?'\nYour branch and origin both have new commits. Ask the agent to merge or rebase.':''}\n${relativeFetched(sync.lastFetchedAt,timeFormat)}`;
 return<span className="remote-sync">
  <span className={`remote-sync-chip${flash?' remote-sync-flash':''}`} data-state={sync.state} data-busy={busy??undefined} title={chipTitle}>
   {chipContent(sync)}
   {!sync.lastFetchedAt&&<span className="remote-sync-dot" aria-hidden="true"/>}
  </span>
  {sync.remote&&<button type="button" className="remote-sync-btn" disabled={busy!==null} aria-busy={busy==='fetch'} onClick={()=>void action('fetch')}>
   <RefreshCw size={14} aria-hidden="true" className={busy==='fetch'?'remote-sync-spin':undefined}/><span className="remote-sync-label">{busy==='fetch'?'Fetching…':'Fetch'}</span>
  </button>}
  {sync.remote&&<button type="button" className="remote-sync-btn" disabled={busy!==null||!pullable} aria-busy={busy==='pull'} title={pullable?undefined:pullReason} aria-describedby={pullable?undefined:'remote-sync-pull-reason'} onClick={()=>void action('pull')}>
   <ArrowDownToLine size={14} aria-hidden="true" className={busy==='pull'?'remote-sync-nudge':undefined}/><span className="remote-sync-label">{busy==='pull'?'Pulling…':sync.state==='behind'&&sync.behind?`Pull ${sync.behind}`:'Pull'}</span>
   {!pullable&&<span id="remote-sync-pull-reason" className="sr-only">{pullReason}</span>}
  </button>}
  {error&&<p role="status" className="error-text remote-sync-error">{error}{errorCode==='GITHUB_AUTH_REQUIRED'&&<GitHubSignIn active={active} onAuthenticated={load} timeFormat={timeFormat}/>}</p>}
 </span>;
}
