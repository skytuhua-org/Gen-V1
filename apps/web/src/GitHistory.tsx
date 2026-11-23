import {useEffect,useRef,useState} from 'react';
import {ChevronLeft,ChevronRight,GitCommitHorizontal,RotateCw} from 'lucide-react';
import type {UiPreferences} from '../../../packages/contracts/preferences';
import type {GitHistoryCommit,GitHistoryCommitDetail,GitHistoryPage,GitHistoryPatch} from '../../../packages/contracts/code-review.ts';
import {ApiError,authenticated,read} from './api.ts';
import {displayFilePath} from './files/FilesView';
import {CheckpointDiff,errorMessage,formatTime,plural} from './FileCheckpoints';
import {CopyButton} from './CopyButton';
import {ErrorState} from '../../../packages/ui-shell/Feedback';
import './git-history.css';

const get=<T,>(url:string,signal?:AbortSignal)=>authenticated(()=>fetch(url,{credentials:'same-origin',cache:'no-store',signal})).then(read<T>);
export const relative=(iso:string)=>{
  const then=Date.parse(iso);if(!Number.isFinite(then))return '';
  const span=Math.max(0,Date.now()-then),minute=60_000,hour=60*minute,day=24*hour;
  if(span<minute)return 'just now';if(span<hour)return plural(Math.floor(span/minute),'minute')+' ago';
  if(span<day)return plural(Math.floor(span/hour),'hour')+' ago';
  if(span<30*day)return plural(Math.floor(span/day),'day')+' ago';
  return new Date(then).toLocaleDateString(undefined,{dateStyle:'medium'});
};
const statusLabel=(status:string)=>status.startsWith('R')?'Renamed':status.startsWith('C')?'Copied':status==='A'?'Added':status==='D'?'Deleted':status==='T'?'Type changed':status==='M'?'Modified':status;
const stale=(error:unknown)=>error instanceof ApiError&&['HISTORY_EXPIRED','HISTORY_CHANGED','COMPARISON_EXPIRED'].includes(error.code);
export function GitHistory({base,query,preferences}:{base:string;query:URLSearchParams;preferences:UiPreferences}){
  const [commits,setCommits]=useState<GitHistoryCommit[]>([]),[snapshotId,setSnapshotId]=useState<string>(),[upstreamRef,setUpstreamRef]=useState<string|null>(null),[nextCursor,setNextCursor]=useState<string>(),[selected,setSelected]=useState<GitHistoryCommit>();
  const [error,setError]=useState<{text:string;stale:boolean}>(),[loading,setLoading]=useState(true),[attempt,setAttempt]=useState(0),[cursor,setCursor]=useState<string>();
  const opener=useRef<HTMLButtonElement|null>(null),queryKey=query.toString();
  const refresh=()=>{setCommits([]);setSelected(undefined);setCursor(undefined);setAttempt(value=>value+1);};
  useEffect(()=>{
    const controller=new AbortController();setLoading(true);setError(undefined);
    const params=new URLSearchParams(queryKey);if(cursor)params.set('cursor',cursor);
    void get<GitHistoryPage>(base+'/git/history?'+params,controller.signal).then(page=>{
      if(controller.signal.aborted)return;
      setCommits(previous=>cursor?[...previous,...page.commits]:page.commits);
      setSnapshotId(page.snapshotId??undefined);setUpstreamRef(page.upstreamRef);setNextCursor(page.nextCursor??undefined);
    }).catch(cause=>{if(!controller.signal.aborted)setError({text:stale(cause)?'History changed. Refresh history to continue.':errorMessage(cause),stale:stale(cause)});}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return()=>controller.abort();
  },[base,queryKey,attempt,cursor]);
  return <div className="file-checkpoints-history git-history">
    <div hidden={Boolean(selected)}>
      <div className="file-checkpoints-heading"><h3>Git history</h3><button type="button" className="file-checkpoints-quiet" disabled={loading} onClick={refresh}><RotateCw size={13} aria-hidden="true"/>Refresh history</button></div>
      <p className="file-checkpoints-caption">Recent commits on this working copy, newest first.</p>
      {upstreamRef&&<p className="file-checkpoints-note" role="note">Unpushed marks commits missing from local {upstreamRef}; that copy may be out of date.</p>}
      {!upstreamRef&&commits.some(row=>row.pushState==='unknown')&&<p className="file-checkpoints-note" role="note">Push status unavailable.</p>}
      {loading&&commits.length===0&&<p role="status" className="file-checkpoints-note">Loading commits…</p>}
      {loading&&commits.length>0&&<p role="status" className="file-checkpoints-note">Loading more commits…</p>}
      {error&&<ErrorState message={error.text} retryLabel={error.stale?'Refresh history':undefined} onRetry={error.stale?refresh:()=>setAttempt(value=>value+1)}/>}
      {!loading&&!error&&commits.length===0&&<p className="file-checkpoints-empty"><span>No commits yet.</span> Commits on this working copy will appear here.</p>}
      {commits.length>0&&<ul className="file-checkpoints-list file-checkpoints-entries git-history-list">{commits.map(row=><li key={row.oid}>
        <button type="button" className="git-history-row" aria-label={`Open commit ${row.subject||row.oid.slice(0,10)}`} title={row.oid} onClick={event=>{opener.current=event.currentTarget;setSelected(row);}}>
          <GitCommitHorizontal size={14} aria-hidden="true"/>
          <span className="git-history-row-main"><strong>{row.subject||row.oid.slice(0,10)}</strong><small>{row.author||'Unknown author'} · {row.authoredAt?<time dateTime={row.authoredAt} title={formatTime(row.authoredAt,preferences)}>{relative(row.authoredAt)}</time>:'Unknown time'}{row.filesChanged!==null?` · ${plural(row.filesChanged,'file')}`:''}</small></span>
          {row.pushState==='unpushed'&&<span className="git-history-badge" title={upstreamRef?`Not in local ${upstreamRef}`:undefined}>Unpushed</span>}
          <span className="file-checkpoints-entry-action" aria-hidden="true">Review<ChevronRight size={13}/></span>
        </button>
      </li>)}</ul>}
      {nextCursor&&<button type="button" className="file-checkpoints-quiet file-checkpoints-more" disabled={loading} onClick={()=>setCursor(nextCursor)}>Load more commits</button>}
    </div>
    {selected&&snapshotId&&<GitHistoryCommitView key={selected.oid+':'+snapshotId} base={base} query={query} snapshotId={snapshotId} commit={selected} preferences={preferences} onBack={()=>{setSelected(undefined);queueMicrotask(()=>opener.current?.focus());}} onRefresh={refresh}/>}
  </div>;
}
function GitHistoryCommitView({base,query,snapshotId,commit,preferences,onBack,onRefresh}:{base:string;query:URLSearchParams;snapshotId:string;commit:GitHistoryCommit;preferences:UiPreferences;onBack:()=>void;onRefresh:()=>void}){
  const [detail,setDetail]=useState<GitHistoryCommitDetail>(),[error,setError]=useState<{text:string;stale:boolean}>(),[attempt,setAttempt]=useState(0),[file,setFile]=useState<string>(),queryKey=query.toString();
  const back=useRef<HTMLButtonElement>(null);
  useEffect(()=>{back.current?.focus();},[]);
  useEffect(()=>{
    const controller=new AbortController();setDetail(undefined);setError(undefined);setFile(undefined);
    const params=new URLSearchParams(queryKey);params.set('snapshotId',snapshotId);params.set('oid',commit.oid);
    void get<GitHistoryCommitDetail>(base+'/git/history/commit?'+params,controller.signal)
      .then(value=>{if(!controller.signal.aborted)setDetail(value);})
      .catch(cause=>{if(!controller.signal.aborted)setError({text:stale(cause)?'History changed. Refresh history to continue.':errorMessage(cause),stale:stale(cause)});});
    return()=>controller.abort();
  },[base,queryKey,snapshotId,commit.oid,attempt]);
  return <section aria-label="Commit review" className="file-checkpoints-review git-history-commit">
    <button ref={back} type="button" className="file-checkpoints-back" onClick={onBack}><ChevronLeft size={14} aria-hidden="true"/>Back to Git history</button>
    <h3>{commit.subject||commit.oid.slice(0,10)}</h3>
    <p className="file-checkpoints-meta">{commit.author||'Unknown author'}{commit.authoredAt&&<> · <time dateTime={commit.authoredAt}>{formatTime(commit.authoredAt,preferences)}</time></>}</p>
    <p className="file-checkpoints-meta git-history-sha"><code>{commit.oid}</code><CopyButton text={commit.oid} label="Copy SHA"/></p>
    {error?<ErrorState message={error.text} retryLabel={error.stale?'Refresh history':'Retry'} onRetry={error.stale?onRefresh:()=>setAttempt(value=>value+1)}/>:!detail?<p role="status" className="file-checkpoints-note">Loading changed files…</p>:<>
      <p className="file-checkpoints-note">{detail.basis==='root'?'Root commit — compared with an empty tree.':'Compared with its first parent.'}{detail.filesTruncated?' File list truncated.':''}</p>
      {detail.files.length===0&&<p className="file-checkpoints-empty"><span>No file changes.</span></p>}
      {detail.files.length>0&&<ul className="file-checkpoints-list file-checkpoints-entries git-history-files">{detail.files.map(item=><li key={item.path}>
        <button type="button" className="git-history-row" aria-label={`Open diff for ${item.path}`} aria-expanded={file===item.path||undefined} onClick={()=>setFile(current=>current===item.path?undefined:item.path)}>
          <span className="git-history-row-main"><strong>{item.oldPath?displayFilePath(item.oldPath)+' → ':''}{displayFilePath(item.path)}</strong><small>{statusLabel(item.status)}{item.additions!==null||item.deletions!==null?` · +${item.additions??'?'} −${item.deletions??'?'}`:''}</small></span>
        </button>
        {file===item.path&&<GitHistoryFileDiff base={base} query={query} comparisonId={detail.comparisonId} file={item.path}/>}
      </li>)}</ul>}
    </>}
  </section>;
}
function GitHistoryFileDiff({base,query,comparisonId,file}:{base:string;query:URLSearchParams;comparisonId:string;file:string}){
  const [patch,setPatch]=useState<GitHistoryPatch>(),[error,setError]=useState(''),queryKey=query.toString();
  useEffect(()=>{
    const controller=new AbortController();setPatch(undefined);setError('');
    const params=new URLSearchParams(queryKey);params.set('comparisonId',comparisonId);params.set('path',file);
    void get<GitHistoryPatch>(base+'/git/history/file?'+params,controller.signal)
      .then(value=>{if(!controller.signal.aborted)setPatch(value);})
      .catch(cause=>{if(!controller.signal.aborted)setError(errorMessage(cause));});
    return()=>controller.abort();
  },[base,queryKey,comparisonId,file]);
  if(error)return <p role="status" className="file-checkpoints-note">{error}</p>;
  if(!patch)return <p role="status" className="file-checkpoints-note">Loading diff…</p>;
  const note=patch.state==='binary'?'Binary file, no preview':patch.state==='truncated'?'Too large to preview':patch.state==='unavailable'?(patch.reason==='conflict'?'Patch unavailable for this entry.':patch.reason==='unsupported-path'?'This path cannot be shown.':patch.reason==='unsupported-file'?'This file cannot be shown.':'No patch available.'):patch.state==='empty'?'No differences.':'';
  if(patch.text===null||patch.state!=='text')return <p className="file-checkpoints-note">{note}</p>;
  return <CheckpointDiff diff={patch.text}/>;
}
