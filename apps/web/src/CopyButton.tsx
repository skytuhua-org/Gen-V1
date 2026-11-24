import {Check,Copy,type LucideIcon} from 'lucide-react';
import {useLayoutEffect,useRef,useState} from 'react';
import {toast} from '../../../packages/ui-shell/Toast';

export function CopyButton({text,label='Copy',icon:Icon=Copy,copiedLabel='Copied',failureMessage='Copy failed. Select the text and copy manually.',onCopied,onDisabledPress,onFailure,disabled,busy,describedBy,tooltip,srLabel}:{text:string;label?:string;icon?:LucideIcon;copiedLabel?:string;failureMessage?:string;onCopied?:()=>void;onDisabledPress?:()=>void;onFailure?:()=>void;disabled?:boolean;busy?:boolean;describedBy?:string;tooltip?:string;srLabel?:string}) {
  const [copiedText,setCopiedText]=useState<string|null>(null);
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null), generation=useRef(0);
  const copied=copiedText===text;
  useLayoutEffect(()=>{
    setCopiedText(null);
    return()=>{generation.current++; if(timer.current)clearTimeout(timer.current); timer.current=null;};
  },[text]);
  const copy=async()=>{
    if(disabled){onDisabledPress?.();return;}
    const current=++generation.current;
    setCopiedText(null);
    if(timer.current)clearTimeout(timer.current);
    try{
      await navigator.clipboard.writeText(text);
      if(generation.current!==current)return;
      setCopiedText(text);
      onCopied?.();
      timer.current=setTimeout(()=>{timer.current=null;setCopiedText(null);},1600);
    }catch{
      if(generation.current===current){toast(failureMessage,{tone:'error'});onFailure?.();}
    }
  };
  return <><button type="button" className="icon-button copy-button" data-copied={copied||undefined} aria-label={label} title={tooltip??(copied?copiedLabel:label)} aria-disabled={disabled||undefined} aria-busy={busy||undefined} aria-describedby={describedBy} onClick={()=>void copy()}>{copied?<Check size={14} aria-hidden="true"/>:<Icon size={14} aria-hidden="true"/>}</button>{(srLabel??copiedLabel)&&<span className="sr-only" role="status">{copied?(srLabel??copiedLabel):''}</span>}</>;
}
