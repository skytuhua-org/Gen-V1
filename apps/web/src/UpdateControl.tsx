import {Download} from 'lucide-react';
import {useState} from 'react';
import {useDesktop} from './desktop-context';

/** Both Settings and sidebar actions use the one main-process updater. */
export function UpdateControl({compact=false}: {compact?:boolean}){
 const desktop=useDesktop(),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const status=desktop?.state.update,message=error||status?.message||'Install Gen to receive automatic updates.';
 const ready=status?.state==='ready',unavailable=!desktop?.bridge.update||status?.state==='unavailable';
 const run=async()=>{if(!desktop?.bridge.update)return;setBusy(true);setError('');try{await desktop.bridge.update(ready?'restart':'check');}catch{setError('Updates are unavailable. Gen will keep the current version.');}finally{setBusy(false);}};
 if(compact){const inert=busy||unavailable||status?.state==='checking'||status?.state==='downloading';
  // aria-disabled keeps the control tabbable so keyboard users reach its
  // explanation; click is guarded so it stays inert while disabled.
  return <button type="button" title={message} aria-disabled={inert||undefined} aria-describedby="update-control-reason" onClick={()=>{if(!inert)void run();}}><Download size={16}/><span>{ready?'Restart to update':'Update'}</span><span id="update-control-reason" className="sr-only">{message}</span></button>;}
 return <section className="settings-row" aria-label="Gen updates"><div className="settings-row-copy"><h2>Updates</h2><p role="status">{message}{status?.state==='downloading'&&status.percent!==undefined?` ${Math.round(status.percent)}%`:''}</p></div><div className="settings-row-control"><button className="secondary" disabled={busy||unavailable||status?.state==='checking'||status?.state==='downloading'} onClick={()=>void run()}>{ready?'Restart to update':'Check for updates'}</button></div></section>;
}
