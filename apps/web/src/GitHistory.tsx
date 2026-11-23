import {useCallback,useEffect,useRef,useState} from 'react';
import {ArrowLeft,ChevronRight,RefreshCw} from 'lucide-react';
import {ApiError} from './api';
import {CopyButton} from './CopyButton';
import {formatLocalDateTime,type TimeFormat} from './time-format';
import type {GitHistoryAdapter} from './git-history-api';
import type {GitCommitComparison,GitCommitPatch,GitHistoryCommitRow} from '../../../packages/contracts/code-review';
import './git-history.css';

type ReadError={code:string;message:string};
const toError=(reason:unknown):ReadError=>reason instanceof ApiError?{code:reason.code,message:reason.message}:reason instanceof Error&&reason.message?{code:'HISTORY_UNAVAILABLE',message:reason.message}:{code:'HISTORY_UNAVAILABLE',message:'Commit history is unavailable.'};
const isStale=(error:ReadError)=>error.code==='REVISION_CHANGED'||error.code==='HISTORY_STALE';
const staleMessage={code:'REVISION_CHANGED',message:'History changed. Refresh history to continue.'};

const relative=(authoredAt:string)=>{
 const seconds=Math.round((Date.parse(authoredAt)-Date.now())/1000);
 if(!Number.isFinite(seconds))return authoredAt;
 if(Math.abs(seconds)<60)return 'just now';
 const formatter=new Intl.RelativeTimeFormat(undefined,{numeric:'auto'});
 const minutes=Math.trunc(seconds/60);
 if(Math.abs(minutes)<60)return formatter.format(minutes,'minute');
 const hours=Math.trunc(minutes/60);
 if(Math.abs(hours)<24)return formatter.format(hours,'hour');
 const days=Math.trunc(hours/24);
 if(Math.abs(days)<7)return formatter.format(days,'day');
 const weeks=Math.trunc(days/7);
 if(Math.abs(weeks)<5)return formatter.format(weeks,'week');
 const months=Math.trunc(days/30);
 if(Math.abs(months)<12)return formatter.format(months,'month');
 return formatter.format(Math.trunc(days/365),'year');
};

const DiffBody=({patch}:{patch:GitCommitPatch})=>{
 if(patch.state==='text'&&patch.text){
  const lines=patch.text.split('\n');if(lines.at(-1)==='')lines.pop();
  const firstHunk=lines.findIndex(line=>line.startsWith('@@'));
  const visible=lines.filter((line,index)=>index>=(firstHunk===-1?0:firstHunk)||!(line.startsWith('--- ')||line.startsWith('+++ ')));
  return <pre className="unified-diff">{visible.map((line,index)=>{
   const kind=line.startsWith('@@')?'hunk':line.startsWith('+')?'add':line.startsWith('-')?'remove':line.startsWith('diff --git')?'hunk':undefined;
   return <span key={index} data-kind={kind}>{line}</span>;
  })}</pre>;
 }
 const message=patch.state==='binary'?'Binary file — no text diff':patch.state==='truncated'?'Diff is too large to display.':patch.state==='empty'?'No differences.':'This file diff is unavailable.';
 return <p className="file-checkpoints-note git-history-diff-note">{message}</p>;
};

const statusLabel={A:'Added',M:'Modified',D:'Deleted',R:'Renamed',T:'Type changed',U:'Updated'} as const;

function CommitDetail({adapter,comparison,onBack}:{adapter:GitHistoryAdapter;comparison:GitCommitComparison;onBack:()=>void}){
 const [patches,setPatches]=useState<Record<string,{state:'loading'}|{state:'ready';patch:GitCommitPatch}|{state:'error';error:ReadError}>>({});
 const request=useRef(0);
 const load=useCallback((path:string)=>{
  const controller=new AbortController(),id=++request.current;
  setPatches(current=>({...current,[path]:{state:'loading'}}));
  adapter.file(comparison.comparisonId,path,controller.signal).then(patch=>{if(id===request.current)setPatches(current=>({...current,[path]:{state:'ready',patch}}));}).catch(reason=>{if(!controller.signal.aborted)setPatches(current=>({...current,[path]:{state:'error',error:toError(reason)}}));});
 },[adapter,comparison.comparisonId]);
 useEffect(()=>()=>{request.current++;},[]);
 return <div className="git-history-detail">
  <button type="button" className="file-checkpoints-back" onClick={onBack}><ArrowLeft size={14} aria-hidden/>Back to commits</button>
  <h3 className="git-history-detail-subject">Commit details</h3>
  <p className="file-checkpoints-meta">{comparison.basis==='root'?'Compared with the empty root':'Compared with first parent '+comparison.parentOid?.slice(0,8)}</p>
  <p className="git-history-sha"><code>{comparison.oid}</code><CopyButton text={comparison.oid} label="Copy SHA"/></p>
  {comparison.files.length===0?<p className="file-checkpoints-empty">No files changed in this commit</p>
   :<ul className="file-checkpoints-list">
    {comparison.files.map(file=>{
     const entry=Object.hasOwn(patches,file.path)?patches[file.path]:undefined;
     const label=statusLabel[file.status as keyof typeof statusLabel]??file.status;
     return <li key={file.path}><details className="workspace-diff git-history-file" onToggle={event=>{if(event.currentTarget.open&&!entry)load(file.path);}}>
      <summary title={file.oldPath?file.oldPath+' → '+file.path:file.path}><span className="git-history-file-path">{file.path}</span>{' '}<small>{label}{file.additions==null?'':' +'+file.additions+' −'+file.deletions}</small></summary>
      {entry?.state==='loading'&&<p className="file-checkpoints-note git-history-diff-note" role="status">Loading diff…</p>}
      {entry?.state==='error'&&<p className="file-checkpoints-note git-history-diff-note" role="alert">{isStale(entry.error)?staleMessage.message:entry.error.message}</p>}
      {entry?.state==='ready'&&<DiffBody patch={entry.patch}/>}
     </details></li>;})}
   </ul>}
  {comparison.filesTruncated&&<p className="file-checkpoints-note">File list is truncated at 1000 entries.</p>}
 </div>;
}

export function GitHistory({adapter,active,timeFormat='system'}:{adapter:GitHistoryAdapter;active:boolean;timeFormat?:TimeFormat}){
 const [pages,setPages]=useState<GitHistoryCommitRow[]>([]);
 const [snapshot,setSnapshot]=useState<{snapshotId:string;branch:string|null;headOid:string;upstreamRef:string|null}|null>(null);
 const [nextCursor,setNextCursor]=useState<string|null>(null);
 const [phase,setPhase]=useState<'idle'|'loading'|'more'|'ready'|'error'>('idle');
 const [error,setError]=useState<ReadError|null>(null);
 const [detail,setDetail]=useState<{state:'loading';oid:string}|{state:'ready';comparison:GitCommitComparison}|{state:'error';oid:string;error:ReadError}|null>(null);
 const request=useRef(0),mounted=useRef(true),listRef=useRef<HTMLUListElement|null>(null),lastOid=useRef('');

 const load=useCallback((cursor:string|undefined,replace:boolean)=>{
  const controller=new AbortController(),id=++request.current;
  setPhase(cursor?'more':'loading');setError(null);
  adapter.page(cursor,controller.signal).then(page=>{
   if(!mounted.current||id!==request.current)return;
   setSnapshot({snapshotId:page.snapshotId,branch:page.branch,headOid:page.headOid??'',upstreamRef:page.upstreamRef});
   setPages(current=>replace?page.commits:[...current,...page.commits]);
   setNextCursor(page.nextCursor);setPhase('ready');
  }).catch(reason=>{if(controller.signal.aborted||!mounted.current||id!==request.current)return;setError(toError(reason));setPhase('error');});
  return controller;
 },[adapter]);

 useEffect(()=>()=>{mounted.current=false;},[]);
 useEffect(()=>{if(active&&pages.length===0&&phase==='idle')load(undefined,true);},[active,load,pages.length,phase]);
 useEffect(()=>{if(!active){setDetail(null);}},[active]);
 const refresh=()=>{setPages([]);setSnapshot(null);setDetail(null);setNextCursor(null);setPhase('idle');load(undefined,true);};

 const select=(row:GitHistoryCommitRow)=>{
  const id=++request.current;lastOid.current=row.oid;setDetail({state:'loading',oid:row.oid});
  adapter.commit(snapshot!.snapshotId,row.oid,new AbortController().signal).then(comparison=>{if(mounted.current&&id===request.current)setDetail({state:'ready',comparison});}).catch(reason=>{if(mounted.current&&id===request.current)setDetail({state:'error',oid:row.oid,error:toError(reason)});});
 };

 const back=()=>{setDetail(null);queueMicrotask(()=>listRef.current?.querySelector<HTMLButtonElement>('[data-oid="'+lastOid.current+'"] button')?.focus());};

 const busy=phase==='loading'||phase==='more';
 const shownError=error&&(isStale(error)?staleMessage:error);
 return <div className="git-history" data-detail={detail?true:undefined}>
  <div className="git-history-header">
   <div className="git-history-heading">
    <strong>{snapshot?(snapshot.branch??'Detached HEAD'):'Git history'}{snapshot?.headOid&&<code className="git-history-oid">{snapshot.headOid.slice(0,8)}</code>}</strong>
    {snapshot&&<p className="file-checkpoints-note">{snapshot.upstreamRef?'Compared against '+snapshot.upstreamRef+' from last-known local data.':'No upstream branch data was found locally; push state is unknown.'}</p>}
   </div>
   <button type="button" className="git-history-refresh" onClick={refresh} disabled={busy}><RefreshCw size={14} aria-hidden/>Refresh history</button>
  </div>
  <p className="git-history-status" role="status">{phase==='loading'?'Loading commit history…':phase==='more'?'Loading more commits…':''}</p>
  <div className="git-history-columns">
   <div className="git-history-list" aria-label="Commits">
    {shownError&&pages.length===0&&phase!=='loading'
     ?<div className="git-history-error"><p role="alert">{shownError.message}</p><button type="button" onClick={refresh}>Refresh history</button></div>
     :pages.length===0&&phase==='ready'
      ?<p className="file-checkpoints-empty">No commits yet</p>
      :<ul className="file-checkpoints-list git-history-entries" ref={listRef}>
       {pages.map(row=><li key={row.oid} data-oid={row.oid}>
        <button type="button" className="file-checkpoints-entry git-history-entry" aria-current={detail&&'oid'in detail&&detail.oid===row.oid?'true':undefined} onClick={()=>select(row)}>
         <span><strong>{row.subject||row.oid.slice(0,8)}</strong>
          <small>{row.author} · <time dateTime={row.authoredAt} title={formatLocalDateTime(row.authoredAt,timeFormat)}>{relative(row.authoredAt)}</time>{row.filesChanged==null?'':' · '+row.filesChanged+(row.filesChanged===1?' file':' files')}</small></span>
         {row.pushState==='unpushed'&&<span className="git-history-badge">Unpushed</span>}
         <span className="file-checkpoints-entry-action"><ChevronRight size={14} aria-hidden/></span>
        </button></li>)}
      </ul>}
    {nextCursor&&!detail&&<div className="file-checkpoints-more"><button type="button" onClick={()=>load(nextCursor,false)} disabled={busy}>{phase==='more'?'Loading…':'Load more'}</button></div>}
   </div>
   {detail&&<div className="git-history-panel">
    {detail.state==='loading'&&<p className="file-checkpoints-note" role="status">Loading commit…</p>}
    {detail.state==='error'&&<div className="git-history-error"><p role="alert">{(isStale(detail.error)?staleMessage:detail.error).message}</p><button type="button" className="file-checkpoints-back" onClick={back}><ArrowLeft size={14} aria-hidden/>Back to commits</button></div>}
    {detail.state==='ready'&&<CommitDetail adapter={adapter} comparison={detail.comparison} onBack={back}/>}
   </div>}
  </div>
 </div>;
}
