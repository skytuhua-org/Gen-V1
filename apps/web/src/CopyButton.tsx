import {Check,Copy,Loader2} from 'lucide-react';
import {useLayoutEffect,useRef,useState} from 'react';
import {toast} from '../../../packages/ui-shell/Toast';

export function CopyButton({text,label='Copy',onError}:{text:string|(()=>Promise<string|null>);label?:string;onError?:(error:unknown)=>void}) {
  const [copiedText,setCopiedText]=useState<string|null>(null);
  const [busy,setBusy]=useState(false);
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null), generation=useRef(0), busyTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const copied=typeof text==='string'&&copiedText===text;
  useLayoutEffect(()=>{
    setCopiedText(null);
    return()=>{generation.current++; if(timer.current)clearTimeout(timer.current); timer.current=null; if(busyTimer.current)clearTimeout(busyTimer.current); busyTimer.current=null;};
  },[text]);
  const copy=async()=>{
    const current=++generation.current;
    setCopiedText(null);
    if(timer.current)clearTimeout(timer.current);
    try{
      let value:string|null;
      if(typeof text==='function'){
        busyTimer.current=setTimeout(()=>{if(generation.current===current)setBusy(true);},150);
        try{value=await text();}finally{if(busyTimer.current){clearTimeout(busyTimer.current);busyTimer.current=null;}if(generation.current===current)setBusy(false);}
        if(generation.current!==current)return;
        if(value===null)return;
      }else value=text;
      await navigator.clipboard.writeText(value);
      if(generation.current!==current)return;
      setCopiedText(value);
      timer.current=setTimeout(()=>{timer.current=null;setCopiedText(null);},1600);
    }catch(error){
      if(generation.current!==current)return;
      if(onError){onError(error);return;}
      toast('Copy failed. Select the text and copy manually.',{tone:'error'});
    }
  };
  return <><button type="button" className="icon-button copy-button" aria-label={label} title={copied?'Copied':label} disabled={busy} aria-busy={busy||undefined} onClick={()=>void copy()}>{busy?<Loader2 size={14} aria-hidden="true" className="live-patch-spin"/>:copied?<Check size={14} aria-hidden="true"/>:<Copy size={14} aria-hidden="true"/>}</button><span className="sr-only" role="status">{copied?'Copied':''}</span></>;
}
