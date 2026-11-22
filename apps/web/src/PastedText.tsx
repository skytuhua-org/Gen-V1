import {useState} from 'react';
import {AlertTriangle,ClipboardPaste,X} from 'lucide-react';
import {Modal} from '../../../packages/ui-shell/Modal';
import {countLines,firstLine,lineLabel,type PastedText} from './pasted-text';
import './pasted-text.css';

const PROMPT_LIMIT=64*1024;
const block=(text:string)=>`Pasted text · ${lineLabel(countLines(text))}\n${text}\nEnd pasted text`;

export function PastedTextChip({paste,disabled=false,onEdit,onRemove,onInsert}:{paste:PastedText;disabled?:boolean;onEdit:(text:string)=>Promise<void>;onRemove:()=>Promise<void>;onInsert:(text:string)=>void}){
 const [open,setOpen]=useState(false),[text,setText]=useState(paste.text),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const lines=countLines(paste.text),overLimit=block(paste.text).length>PROMPT_LIMIT;
 const run=async(action:()=>Promise<void>|void)=>{setBusy(true);try{await action();setOpen(false);}catch(cause){setError(cause instanceof Error?cause.message:'Pasted text could not be saved. Retry.');}finally{setBusy(false);}};
 const save=()=>text?run(()=>onEdit(text)):run(()=>onRemove());
 return <span className="pasted-text-chip" {...(overLimit?{'data-over-limit':true}:{})}>
  <button type="button" disabled={disabled} className="quiet pasted-text-open" aria-label={`Pasted text, ${lines} ${lines===1?'line':'lines'}. Open to review`} title={overLimit?'Too long to send (limit 64 KB). Edit or remove it.':firstLine(paste.text)} onClick={()=>{setText(paste.text);setError('');setOpen(true);}}>
   {overLimit?<AlertTriangle size={12}/>:<ClipboardPaste size={12}/>}
   <span>Pasted text</span><small>· {lineLabel(lines)}</small>
  </button>
  <button type="button" className="quiet" aria-label={`Remove pasted text, ${lines} ${lines===1?'line':'lines'}`} disabled={disabled} onClick={()=>{void onRemove().catch(cause=>setError(cause instanceof Error?cause.message:'Could not remove pasted text.'));}}><X size={12}/></button>
  {error&&!open&&<span role="status" className="pasted-text-error">{error}</span>}
  <Modal open={open} title="Review pasted text" onClose={()=>{if(!busy)setOpen(false);}} className="pasted-text-dialog">
   <label className="pasted-text-field">Pasted text<textarea aria-label="Pasted text" value={text} disabled={busy||disabled} spellCheck={false} onChange={event=>setText(event.target.value)} rows={12}/></label>
   {error&&<p role="status">{error}</p>}
   <div className="pasted-text-actions"><span className="muted pasted-text-count" role="status">{lineLabel(countLines(text))} · {(new TextEncoder().encode(text).length/1000).toFixed(1)} KB</span><button type="button" className="secondary" disabled={busy} onClick={()=>setOpen(false)}>Cancel</button><button type="button" className="secondary" disabled={busy||disabled||!text} onClick={()=>{const insert=text;void run(()=>onInsert(insert));}}>Insert as text</button><button type="button" className="primary" disabled={busy||disabled} onClick={()=>void save()}>Save</button></div>
  </Modal>
 </span>;
}
