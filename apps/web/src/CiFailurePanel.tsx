// #1326 T06+T07 — Pull-requests panel: per-row failing-CI log disclosure
// (DESIGN 7.1–7.2) and the inline fix sheet (DESIGN 4, 7.3–7.4, R10–R15).
// The flag gate lives in PullRequestsBody; these components render nothing
// unless workspace.ciFixV1 is on (R01) and the row is a failed check.
import {Fragment,useCallback,useEffect,useRef,useState} from 'react';
import {ChevronRight,Wrench} from 'lucide-react';
import {ApiError,authenticated,command,getShellSettings,read} from './api.ts';
import type {CiFailedJob,CiFailureReport,CiStoredFailure,CiStoredJob} from '../../../packages/contracts/ci-failures.ts';

const get=<T,>(url:string,signal?:AbortSignal)=>authenticated(()=>fetch(url,{credentials:'same-origin',cache:'no-store',signal})).then(read<T>);
const message=(error:unknown)=>error instanceof Error?error.message:'The failure report could not be loaded.';
const actionsJobUrl=/^https:\/\/github\.com\/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)\/actions\/runs\/\d+\/job\/\d+$/;
export const isActionsCheckUrl=(repo:string,url:string|undefined)=>{const match=url?actionsJobUrl.exec(url):null;return !!match&&match[1].toLowerCase()===repo.toLowerCase();};

/** Reads the host flag snapshot once; the panel stays identical to baseline while off. */
export function useCiFixEnabled(active:boolean){
 const[on,setOn]=useState(false);
 useEffect(()=>{let live=true;if(!active)return;void getShellSettings().then(settings=>{if(live)setOn(settings.flags?.['workspace.ciFixV1']===true);}).catch(()=>{});return()=>{live=false;};},[active]);
 return on;
}

/** One lazy fetch of the report per selected PR; expanding any row loads it once. */
export function useCiFailureReport(base:string,query:URLSearchParams,number:number|null){
 const[state,setState]=useState<{report?:CiFailureReport;error:string;loading:boolean}>({error:'',loading:false});
 const started=useRef(false),mounted=useRef(true),key=`${base}:${query.toString()}:${number}`;
 const keyRef=useRef(key);
 useEffect(()=>()=>{mounted.current=false;},[]);
 useEffect(()=>{started.current=false;keyRef.current=key;setState({error:'',loading:false});},[key]);
 const load=useCallback((refresh=false)=>{if(started.current&&!refresh||number===null)return;started.current=true;const captured=keyRef.current;setState(current=>({...current,loading:true}));
  const params=new URLSearchParams(query);if(refresh)params.set('refresh','1');
  void get<CiFailureReport>(`${base}/pull-requests/${number}/failures?${params}`).then(report=>{if(mounted.current&&keyRef.current===captured)setState({report,error:'',loading:false});}).catch(reason=>{if(mounted.current&&keyRef.current===captured)setState({error:message(reason),loading:false});});},[base,query,number]);
 return{...state,load};
}

/** grid-template-rows 0fr→1fr collapse animation (7.2); reduced/off motion is handled globally. */
function Collapsible({open,children}:{open:boolean;children:React.ReactNode}){
 const[render,setRender]=useState(open),[expanded,setExpanded]=useState(false),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>{
  if(open){setRender(true);const frame=requestAnimationFrame(()=>requestAnimationFrame(()=>setExpanded(true)));return()=>cancelAnimationFrame(frame);}
  setExpanded(false);timer.current=setTimeout(()=>setRender(false),180);return()=>{if(timer.current)clearTimeout(timer.current);};
 },[open]);
 if(!render)return null;
 return<div className="pr-check-log-anim" data-expanded={expanded||undefined}><div className="pr-check-log-anim-inner">{children}</div></div>;
}

function ExcerptBody({job}:{job:CiFailedJob}){
 const pre=useRef<HTMLPreElement|null>(null),errors=new Set(job.errorLines);
 useEffect(()=>{if(pre.current)pre.current.scrollTop=pre.current.scrollHeight;},[]);
 return<>
  {job.truncated&&<p className="pr-check-log-truncated">Showing the last {job.excerptLines} lines.</p>}
  <pre className="pr-check-log-body" ref={pre}>{job.excerpt.split('\n').map((line,index)=>
   <Fragment key={index}>{errors.has(index)?<mark className="pr-check-log-error">{line}</mark>:line.startsWith('▸ ')?<span className="pr-check-log-group">{line}</span>:line}{'\n'}</Fragment>)}</pre>
 </>;
}

function LogRegion({job,error,loading}:{job?:CiFailedJob;error:string;loading:boolean}){
 const[loaded,setLoaded]=useState(false);
 useEffect(()=>{if(!loading||loaded)return;const timer=setTimeout(()=>setLoaded(true),150);return()=>clearTimeout(timer);},[loading,loaded]);
 if(error)return<div className="pr-check-log"><p className="pr-check-log-note" role="status">{error}</p></div>;
 if(loading||!job)return<div className="pr-check-log">{loaded&&<div className="pr-check-log-skeleton" aria-hidden="true"><span/><span/><span/></div>}</div>;
 if(job.logState==='unavailable')return<div className="pr-check-log"><p className="pr-check-log-note">GitHub no longer has this log.{job.url&&<> <a href={job.url} target="_blank" rel="noreferrer">Open on GitHub</a></>}</p></div>;
 if(job.logState==='too-large')return<div className="pr-check-log"><p className="pr-check-log-note">This log is too large to preview.{job.url&&<> <a href={job.url} target="_blank" rel="noreferrer">Open on GitHub</a></>}</p></div>;
 if(job.logState!=='ready')return<div className="pr-check-log"><p className="pr-check-log-note">This check does not publish a GitHub Actions log.{job.url&&<> <a href={job.url} target="_blank" rel="noreferrer">Open on GitHub</a></>}</p></div>;
 return<div className="pr-check-log">
  <div className="pr-check-log-head">
   {job.failedStep&&<strong>Step: {job.failedStep}</strong>}
   <span className="pr-check-log-actions">
    <button type="button" onClick={()=>void navigator.clipboard.writeText(job.excerpt).catch(()=>{})}>Copy</button>
    {job.url&&<a href={job.url} target="_blank" rel="noreferrer">Open on GitHub</a>}
   </span>
  </div>
  <ExcerptBody job={job}/>
 </div>;
}

/** Row-end toggle (Actions jobs) or the plain GitHub link (external checks); the
 * log region below is keyed off the check so a refresh keeps the expansion (7.6). */
export function CiCheckLogDisclosure({checkName,checkState,detailsUrl,repo,failures}:{checkName:string;checkState:string;detailsUrl:string|undefined;repo:string;failures:ReturnType<typeof useCiFailureReport>}){
 const[open,setOpen]=useState(false);
 if(checkState!=='fail')return null;
 if(!isActionsCheckUrl(repo,detailsUrl))return detailsUrl?<a className="pr-check-github" href={detailsUrl} target="_blank" rel="noreferrer">Open on GitHub</a>:null;
 const job=failures.report?.jobs.find(entry=>entry.checkName===checkName);
 return<>
  <button type="button" className="pr-check-log-toggle" aria-expanded={open} aria-label={(open?'Hide log for ':'Show log for ')+checkName}
   onClick={()=>{if(!open)failures.load();setOpen(!open);}}><ChevronRight size={14} aria-hidden="true"/></button>
  <Collapsible open={open}><LogRegion job={job} error={failures.error} loading={failures.loading&&!job}/></Collapsible>
 </>;
}

// ── T07: fix sheet (DESIGN 4, 7.3–7.4) ───────────────────────────────────────

const jobDisabledReason=(job:CiFailedJob)=>job.logState==='ready'?'':job.logState==='unavailable'?'GitHub no longer has this log.':job.logState==='too-large'?'This log is too large to preview.':'This check does not publish a GitHub Actions log.';
const defaultInstruction=(number:number,jobs:CiFailedJob[])=>`Fix the failing CI on PR #${number}: ${jobs.filter(job=>job.logState==='ready').map(job=>job.checkName).join(', ')}. Use the attached logs. Find the cause, make the smallest fix in this working copy, run the relevant checks locally, and tell me what you changed. Don't push unless I ask.`;

function CiFixSheet({report,threadId,prStale,staleText,close,refresh}: {report:CiFailureReport;threadId:string;prStale:boolean;staleText:string;close:(focus:boolean)=>void;refresh:()=>void}){
 const[checked,setChecked]=useState<Set<string>>(()=>new Set(report.jobs.filter(job=>job.logState==='ready').map(job=>job.id)));
 const[text,setText]=useState(()=>defaultInstruction(report.number,report.jobs));
 const[sending,setSending]=useState(false),[sent,setSent]=useState(false),[error,setError]=useState<''|'expired'|string>(''),first=useRef<HTMLInputElement|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>{first.current?.focus();},[]);
 useEffect(()=>{setError('');},[report.id]);
 const send=()=>{
  if(sending||!checked.size||!text.trim())return;setSending(true);setError('');const ids=report.jobs.map(job=>job.id).filter(id=>checked.has(id));
  timer.current=setTimeout(()=>setSent(true),150);
  void command('message.send',{content:text.trim(),ciFailure:{reportId:report.id,jobIds:ids}},threadId).then(()=>close(true)).catch(cause=>{
   if(timer.current)clearTimeout(timer.current);setSending(false);setSent(false);
   setError(cause instanceof ApiError&&cause.code==='CI_REPORT_EXPIRED'?'expired':message(cause));
  });
 };
 const shown=report.jobs.slice(0,6);
 return<div className="pr-fix-sheet" onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();close(false);}if(event.key==='Enter'&&(event.ctrlKey||event.metaKey)){event.preventDefault();send();}}}>
  <strong className="pr-fix-title">Send failing checks to the agent</strong>
  <div className="pr-fix-jobs">{shown.map((job,index)=>{
   const reason=jobDisabledReason(job);
   return<label key={job.id} className="pr-fix-job"><input ref={index===0?first:undefined} type="checkbox" checked={checked.has(job.id)} disabled={!!reason||sending} onChange={event=>setChecked(current=>{const next=new Set(current);if(event.target.checked)next.add(job.id);else next.delete(job.id);return next;})}/><span><strong>{job.workflowName} · {job.checkName}</strong><small className="pr-fix-sub">{reason||job.failedStep||''}</small></span></label>;
  })}{report.jobs.length>shown.length&&<small className="pr-fix-sub">+{report.jobs.length-shown.length} more failed checks not included</small>}</div>
  {prStale&&<p className="pr-checks-stale">{staleText}</p>}
  <label className="pr-fix-instruction">Instruction<textarea value={text} disabled={sending} onChange={event=>setText(event.target.value)}/></label>
  {error&&<p className="pr-fix-error" role="status">{error==='expired'?<>These logs expired. Refresh and send again. <button type="button" onClick={refresh}>Refresh</button></>:error}</p>}
  <div className="pr-fix-actions"><button type="button" disabled={sending} onClick={()=>close(false)}>Cancel</button><button type="button" className="primary" disabled={!checked.size||!text.trim()||sending} onClick={send}>{sent||sending?'Sending…':'Send to agent'}</button></div>
 </div>;
}

/** Checks-head "Fix with agent" launcher + inline sheet + sent status (7.3). */
export function CiFixSection({hasFailed,threadId,prStale,staleText,failures}:{hasFailed:boolean;threadId:string|undefined;prStale:boolean;staleText:string;failures:ReturnType<typeof useCiFailureReport>}){
 const[open,setOpen]=useState(false),[sent,setSent]=useState(false),button=useRef<HTMLButtonElement|null>(null);
 useEffect(()=>{if(!sent)return;const timer=setTimeout(()=>setSent(false),6000);return()=>clearTimeout(timer);},[sent]);
 if(!hasFailed)return null;
 if(!threadId)return<small className="pr-fix-note">Open this panel from a thread to send failures to its agent.</small>;
 const report=failures.report;
 return<>
  <span className="pr-fix-launcher"><button ref={button} type="button" className="primary" disabled={open} onClick={()=>{failures.load();setOpen(true);}}><Wrench size={14} aria-hidden="true"/>Fix with agent</button>{sent&&<small className="pr-fix-sent" role="status">Sent to the thread.</small>}</span>
  <Collapsible open={open}>
   {open&&(report?<CiFixSheet report={report} threadId={threadId} prStale={prStale} staleText={staleText} refresh={()=>failures.load(true)} close={focus=>{setOpen(false);if(focus)setSent(true);requestAnimationFrame(()=>button.current?.focus());}}/>:failures.error?<p className="pr-check-log-note" role="status">{failures.error}</p>:<div className="pr-check-log-skeleton" aria-hidden="true"><span/><span/><span/></div>)}
  </Collapsible>
 </>;
}

// ── T08: thread chip (DESIGN 7.5) ────────────────────────────────────────────

function StoredExcerpt({job}:{job:CiStoredJob}){
 const pre=useRef<HTMLPreElement|null>(null),errors=new Set(job.errorLines);
 useEffect(()=>{if(pre.current)pre.current.scrollTop=pre.current.scrollHeight;},[]);
 return<>
  {job.truncated&&<p className="pr-check-log-truncated">Showing the stored tail of the log.</p>}
  <pre className="pr-check-log-body" ref={pre}>{job.excerpt.split('\n').map((line,index)=>
   <Fragment key={index}>{errors.has(index)?<mark className="pr-check-log-error">{line}</mark>:line.startsWith('▸ ')?<span className="pr-check-log-group">{line}</span>:line}{'\n'}</Fragment>)}</pre>
 </>;
}

/** Chip under a user message carrying the stored failure reference (7.5). */
export function CiMessageChip({failure}:{failure:CiStoredFailure}){
 const[open,setOpen]=useState(false);
 if(!failure.jobs.length)return null;
 return<>
  <button type="button" className="message-ci-chip" aria-expanded={open} onClick={()=>setOpen(value=>!value)}>
   <span className="message-ci-chip-dot" aria-hidden="true"/>Failing CI · {failure.jobs.length} jobs</button>
  <Collapsible open={open}>
   {failure.jobs.map(job=><div key={job.id} className="pr-check-log">
    <div className="pr-check-log-head">
     <strong>{job.workflowName??'Actions'} · {job.checkName}{job.failedStep?` · ${job.failedStep}`:''}</strong>
     <span className="pr-check-log-actions">
      <button type="button" onClick={()=>void navigator.clipboard.writeText(job.excerpt).catch(()=>{})}>Copy</button>
      {job.url&&<a href={job.url} target="_blank" rel="noreferrer">Open on GitHub</a>}
     </span>
    </div>
    <StoredExcerpt job={job}/>
   </div>)}
  </Collapsible>
 </>;
}
