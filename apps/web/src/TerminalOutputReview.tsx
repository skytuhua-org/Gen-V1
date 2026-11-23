import {useEffect,useRef} from 'react';
import {Modal} from '../../../packages/ui-shell/Modal';
import type {TerminalOutputSnapshot} from './terminal-output-export';
import './terminal-output-export.css';

/** In-memory review of a frozen terminal buffer snapshot before the user
 * chooses a native save or browser download. Preview is literal text only. */
export function TerminalOutputReview({snapshot,busy,error,notice,confirmLabel,onCancel,onConfirm}:{snapshot:TerminalOutputSnapshot;busy:boolean;error:string;notice:string;confirmLabel:string;onCancel:()=>void;onConfirm:()=>void}){
 const preview=useRef<HTMLTextAreaElement>(null);
 useEffect(()=>{preview.current?.focus();},[]);
 return <Modal open title="Save terminal output" onClose={busy?()=>{}:onCancel} className="terminal-output-review">
  <p className="terminal-output-meta">Captured {snapshot.capturedAt} UTC · {snapshot.rows} retained rows · {snapshot.lines} lines · {snapshot.bytes.toLocaleString('en-US')} bytes</p>
  <p className="terminal-output-warning">Only output still retained in this terminal view is included. Earlier dropped output cannot be recovered.</p>
  <p className="terminal-output-warning">Terminal output may contain passwords, tokens, or other credentials. Review before saving or sharing.</p><p className="terminal-output-meta">Trailing spaces at line ends are removed.</p>
  {snapshot.text?<label className="terminal-output-preview-label">Retained terminal output<textarea ref={preview} readOnly spellCheck={false} className="terminal-output-preview" value={snapshot.text}/></label>:<p className="terminal-output-meta">No retained terminal output to save.</p>}
  <p className="terminal-output-meta">Suggested file name: {snapshot.filename}</p>
  {notice&&<p className="terminal-output-meta" role="status">{notice}</p>}
  {error&&<p className="error-text" role="alert">{error}</p>}
  <div className="terminal-output-actions"><button type="button" disabled={busy} onClick={onCancel}>Cancel</button><button type="button" className="secondary" disabled={busy||!snapshot.text} onClick={onConfirm}>{busy?'Saving…':confirmLabel}</button></div>
 </Modal>;
}
