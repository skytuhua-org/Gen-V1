// #1326 T06 — Pull-requests panel: per-row failing-CI log disclosure (DESIGN 7.1–7.2).
// The flag gate lives in PullRequestsBody; these components render nothing
// unless workspace.ciFixV1 is on (R01) and the row is a failed check.
import {Fragment,useCallback,useEffect,useRef,useState} from 'react';
import {ChevronRight} from 'lucide-react';
import {authenticated,getShellSettings,read} from './api.ts';
import type {CiFailedJob,CiFailureReport} from '../../../packages/contracts/ci-failures.ts';

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
 const load=useCallback(()=>{if(started.current||number===null)return;started.current=true;const captured=keyRef.current;setState(current=>({...current,loading:true}));
  void get<CiFailureReport>(`${base}/pull-requests/${number}/failures?${query}`).then(report=>{if(mounted.current&&keyRef.current===captured)setState({report,error:'',loading:false});}).catch(reason=>{if(mounted.current&&keyRef.current===captured)setState({error:message(reason),loading:false});});},[base,query,number]);
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
