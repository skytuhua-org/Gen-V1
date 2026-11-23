import {AlertTriangle,Info,X} from 'lucide-react';
import './composer-toolbar.css';

export interface ComposerModelNoticeProps {
 kind:'unavailable'|'dropped';
 /** Project label in the unavailable copy. */
 projectName?:string;
 /** Model label and dropped reasoning level in the dropped copy. */
 modelName?:string;level?:string;
 onChooseModel?:()=>void;onEditDefaults?:()=>void;onDismiss?:()=>void;
}

/** One-line composer notices for project model defaults (R07): the picker stays keyboard-reachable through the action buttons. */
export function ComposerModelNotice({kind,projectName,modelName,level,onChooseModel,onEditDefaults,onDismiss}:ComposerModelNoticeProps){
 if(kind==='unavailable')return <p className="composer-model-notice composer-model-unavailable" role="status"><AlertTriangle size={14} aria-hidden="true"/><span>{projectName??'This project'}&rsquo;s default model isn&rsquo;t available with your selected accounts. Choose a model to send.</span><button type="button" className="composer-model-notice-action" onClick={onChooseModel}>Choose model</button>{onEditDefaults&&<button type="button" className="composer-model-notice-action" onClick={onEditDefaults}>Edit project defaults</button>}</p>;
 return <p className="composer-model-notice" role="status"><Info size={14} aria-hidden="true"/><span>{modelName} doesn&rsquo;t offer {level} reasoning, so it uses the model default.</span><button type="button" className="composer-model-notice-dismiss" aria-label="Dismiss" onClick={onDismiss}><X size={12} aria-hidden="true"/></button></p>;
}
