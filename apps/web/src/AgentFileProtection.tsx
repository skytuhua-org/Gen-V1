import {useEffect,useRef,useState} from 'react';
import {Lock} from 'lucide-react';
import {Modal} from '../../../packages/ui-shell/Modal';
import {Select} from '../../../packages/ui-shell/Select';
import {authenticated,csrfToken,read} from './api';
import {parseAgentFilePolicyRules,AGENT_FILE_POLICY_DEFAULTS} from '../../../packages/contracts/agent-file-policy.ts';
import './agent-file-protection.css';

interface PolicyState {revision:number;rules:string[];explicit:boolean}
interface ScopeOption {id:string;label:string}

const messageOf=(error:unknown)=>error instanceof Error?error.message:'The request could not be completed.';
const loadPolicy=(scope:string)=>authenticated(()=>fetch(`/api/agent-file-policy?scope=${encodeURIComponent(scope)}`,{credentials:'same-origin',cache:'no-store'})).then(read<PolicyState>);
const putPolicy=(scope:string,baseRevision:number,rulesText:string)=>authenticated(()=>fetch('/api/agent-file-policy',{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'application/json','x-harness-csrf':csrfToken},body:JSON.stringify({scope,baseRevision,rulesText})}));

export function AgentFileProtection({projects,busy}:{projects:readonly ScopeOption[];busy:boolean}) {
  const scopes:ScopeOption[]=[{id:'global',label:'All local projects'},...projects];
  const [scope,setScope]=useState('global');
  const [policy,setPolicy]=useState<PolicyState>({revision:0,rules:[],explicit:false});
  const [globalRules,setGlobalRules]=useState<string[]>([]);
  const [draft,setDraft]=useState('');
  const [baseline,setBaseline]=useState('');
  const [errors,setErrors]=useState<{line:number;message:string}[]>([]);
  const [conflict,setConflict]=useState(false);
  const [status,setStatus]=useState('');
  const [pendingScope,setPendingScope]=useState<string|null>(null);
  const [working,setWorking]=useState(false);
  const [available,setAvailable]=useState(false);
  const operation=useRef(0);
  const mounted=useRef(false);
  const field=useRef<HTMLTextAreaElement>(null);
  const dirty=draft!==baseline;
  const disabled=busy||working||!available;

  const apply=(target:string,next:PolicyState)=>{setScope(target);setPolicy(next);const text=next.rules.join('\n');setDraft(text);setBaseline(text);setErrors([]);setConflict(false);};
  const open=async(target:string,announcement='')=>{
    if(!mounted.current)return;
    const owner=++operation.current,current=()=>mounted.current&&operation.current===owner;
    setWorking(true);setAvailable(false);setStatus('');setScope(target);
    if(target!==scope){setDraft('');setBaseline('');setErrors([]);setConflict(false);}
    try{
      const next=await loadPolicy(target);
      if(!current())return;
      apply(target,next);if(target==='global')setGlobalRules(next.rules);
      setAvailable(true);setStatus(announcement);
    }catch(cause){if(current())setStatus(messageOf(cause));}
    finally{if(current())setWorking(false);}
  };
  const choose=(target:string)=>{if(disabled||target===scope)return;if(dirty)setPendingScope(target);else void open(target);};

  useEffect(()=>{
    mounted.current=true;void open('global');
    return()=>{mounted.current=false;operation.current++;};
  },[]);

  const save=async(rulesText:string)=>{
    if(disabled||!mounted.current)return false;
    const owner=++operation.current,current=()=>mounted.current&&operation.current===owner;
    setWorking(true);setStatus('');setConflict(false);
    try{
      const response=await putPolicy(scope,policy.revision,rulesText);
      if(!response.ok){
        const failure=await response.json().catch(()=>({})) as {error?:{code?:string;message?:string}};
        if(!current())return false;
        if(failure.error?.code==='AGENT_FILE_POLICY_CHANGED'){setConflict(true);setStatus('These rules were changed in another window. Review the latest version before saving.');return false;}
        throw new Error(failure.error?.message??'The rules could not be saved.');
      }
      const saved=await read<{scope:string;revision:number}>(response);
      if(!current())return false;
      const rules=parseAgentFilePolicyRules(rulesText).rules;
      setPolicy({revision:saved.revision,rules,explicit:true});
      setBaseline(rulesText);setErrors([]);
      if(scope==='global')setGlobalRules(rules);
      setStatus('Rules saved.');
      return true;
    }catch(cause){if(current())setStatus(messageOf(cause));return false;}
    finally{if(current())setWorking(false);}
  };
  const submit=()=>{
    const parsed=parseAgentFilePolicyRules(draft);
    if(parsed.errors.length){setErrors(parsed.errors);field.current?.focus();setStatus('Some rules need attention before saving.');return;}
    void save(draft);
  };
  const discard=()=>{setDraft(baseline);setErrors([]);setConflict(false);setStatus('');};
  const reload=()=>{void open(scope,'Latest rules loaded.');};

  return <section className="settings-card afp" data-setting-id="agent-file-protection">
    <div className="afp-panel" key={scope}>
      <h2 className="afp-title"><Lock size={15} aria-hidden="true"/>Agent file protection</h2>
      <p>Deny rules keep matching files out of agent reads, listings, search and mentions.</p>
      <label className="field">Scope<Select aria-label="Rules scope" disabled={disabled} value={scope} onValueChange={choose} options={scopes.map(({id,label})=>({value:id,label}))}/></label>
      {scope!=='global'&&<div className="afp-inherited"><h3>Inherited from all local projects</h3>{globalRules.length?<ul>{globalRules.map(rule=><li key={rule}><code>{rule}</code></li>)}</ul>:<p className="settings-empty">No default rules.</p>}</div>}
      <label className="field afp-editor">Deny rules — one pattern per line<textarea ref={field} aria-describedby="afp-errors afp-hint" aria-invalid={errors.length>0} spellCheck={false} disabled={disabled} value={draft} onChange={event=>setDraft(event.target.value)} placeholder={'.env\n.env.*\nsecrets/**\n*.pem'}/>
      </label>
      {errors.length>0&&<ul id="afp-errors" className="afp-errors" role="alert">{errors.map(error=><li key={error.line}>Line {error.line}: {error.message}</li>)}</ul>}
      <p id="afp-hint" className="afp-footer">Blocks supported file tools, project search, and file references. It doesn't sandbox terminals or remove content already shared.</p>
      {conflict&&<p role="alert" className="afp-conflict">Save blocked by a newer revision.</p>}
      <div className="settings-inline-controls">
        {(conflict||!available)&&<button type="button" className="secondary" disabled={busy||working} onClick={reload}>Reload</button>}
        {!conflict&&<>
          <button type="button" className="primary" disabled={disabled||!dirty} onClick={submit}>Save rules</button>
          <button type="button" className="secondary" disabled={disabled||!dirty} onClick={discard}>Discard changes</button>
          {scope==='global'&&<button type="button" className="quiet" disabled={disabled} onClick={()=>{setDraft(AGENT_FILE_POLICY_DEFAULTS.join('\n'));setErrors([]);setStatus('');}}>Reset defaults</button>}
        </>}
      </div>
      <p role="status" aria-live="polite" className="afp-status">{status}</p>
    </div>
    {pendingScope&&<Modal open title="Unsaved rule changes" onClose={()=>setPendingScope(null)} className="dialog">
      <p>Save or discard the current rules before switching scope.</p>
      <footer className="dialog-actions">
        <button type="button" className="quiet" onClick={()=>setPendingScope(null)}>Cancel</button>
        <button type="button" className="secondary" onClick={()=>{const target=pendingScope;setPendingScope(null);discard();void open(target).catch(cause=>setStatus(messageOf(cause)));}}>Discard changes</button>
        <button type="button" className="primary" onClick={()=>{const target=pendingScope;setPendingScope(null);void save(draft).then(saved=>{if(saved)return open(target);}).catch(()=>undefined);}}>Save rules</button>
      </footer>
    </Modal>}
  </section>;
}
