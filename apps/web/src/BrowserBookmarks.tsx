import {BookMarked,Globe,Pencil,Star,Trash2,X} from 'lucide-react';
import {useEffect,useRef,useState} from 'react';
import type {DesktopBrowserBookmark,DesktopBrowserState} from '../../../packages/desktop-contract';
import {Popover} from '../../../packages/ui-shell/Popover';
import {toast} from '../../../packages/ui-shell/Toast';
import {useDesktop} from './desktop-context';

function pageBookmarkUrl(raw:string|undefined,keepQuery:boolean):string|null{
 if(!raw)return null;
 try{
  const url=new URL(raw);
  if(url.protocol!=='http:'&&url.protocol!=='https:')return null;
  if(url.username||url.password||url.href.length>2048)return null;
  if(!keepQuery){url.search='';url.hash='';}
  return url.href;
 }catch{return null;}
}
function pageHost(raw:string|undefined){try{return new URL(raw!).hostname;}catch{return '';}}

/** Star + list controls for the Gen Browser toolbar. Renders nothing outside the desktop shell. */
export function BrowserBookmarkControls({state,detached=false}:{state?:DesktopBrowserState;detached?:boolean}){
 const desktop=useDesktop(),[saveOpen,setSaveOpen]=useState(false),[listOpen,setListOpen]=useState(false),[draft,setDraft]=useState(''),[keepQuery,setKeepQuery]=useState(false),[editing,setEditing]=useState<string|null>(null),[active,setActive]=useState(0),[announcement,setAnnouncement]=useState(''),[pending,setPending]=useState(false);
 const star=useRef<HTMLButtonElement>(null),list=useRef<HTMLButtonElement>(null),nameInput=useRef<HTMLInputElement>(null),listContent=useRef<HTMLDivElement>(null),rows=useRef(new Map<string,HTMLElement>()),editingRef=useRef<string|null>(null);
 const store=desktop?.state.browserBookmarks,items=store?.items??[],limit=store?.limit??200,notice=store?.notice;
 const trimmed=pageBookmarkUrl(state?.url,false),full=pageBookmarkUrl(state?.url,true),saved=items.find(item=>item.url===trimmed||item.url===full);
 const starReason=!trimmed?'Only public http or https pages can be bookmarked.':items.length>=limit&&!saved?`Bookmark limit reached (${limit}). Remove one to save another.`:'';
 const send=(command:Parameters<NonNullable<typeof desktop>['bridge']['browser']>[0])=>{if(!desktop)return Promise.reject(Error('Desktop unavailable.'));setPending(true);return desktop.bridge.browser(command).finally(()=>setPending(false));};
 const announce=(message:string)=>setAnnouncement(message);
 const openSaved=()=>{setDraft(saved?.title??state?.title??'');setKeepQuery(Boolean(saved&&full&&saved.url===full));setSaveOpen(true);};
 const starAction=()=>{if(!desktop||starReason)return;if(saved){openSaved();return;}
  void send({type:'bookmark-add'}).then(()=>{announce('Bookmark saved');openSaved();}).catch(cause=>toast(cause instanceof Error?cause.message:'Bookmark could not be saved.',{tone:'error'}));};
 const removeItem=(item:DesktopBrowserBookmark)=>{void send({type:'bookmark-remove',id:item.id}).then(()=>{announce('Bookmark removed. Undo available.');toast('Bookmark removed.',{durationMs:5000,action:{label:'Undo',onClick:()=>{void send({type:'bookmark-restore',bookmark:item}).catch(cause=>toast(cause instanceof Error?cause.message:'Bookmark could not be restored.',{tone:'error'}));}}});}).catch(cause=>toast(cause instanceof Error?cause.message:'Bookmark could not be removed.',{tone:'error'}));};
 const commitName=(item:DesktopBrowserBookmark,value:string)=>{editingRef.current=null;setEditing(null);listContent.current?.focus();const title=value.trim();if(!title||title===item.title)return;void send({type:'bookmark-update',id:item.id,title}).then(()=>announce('Bookmark renamed')).catch(cause=>toast(cause instanceof Error?cause.message:'Bookmark could not be renamed.',{tone:'error'}));};
 const overlay=saveOpen||listOpen;
 const overlayBridge=desktop?.bridge;
 useEffect(()=>{if(!detached||!overlayBridge||!overlay)return;void overlayBridge.browser({type:'overlay',open:true}).catch(()=>{});
  return()=>{void overlayBridge.browser({type:'overlay',open:false}).catch(()=>{});};},[detached,overlayBridge,overlay]);
 const starActionRef=useRef(starAction);starActionRef.current=starAction;
 useEffect(()=>{if(!desktop)return;const onKey=(event:KeyboardEvent)=>{
  if(event.key.toLowerCase()!=='d'||!(event.metaKey||event.ctrlKey)||event.repeat)return;
  const active=document.activeElement;if(!(active instanceof HTMLElement)||!active.closest('.desktop-browser-toolbar'))return;
  event.preventDefault();starActionRef.current();
 };document.addEventListener('keydown',onKey);return()=>document.removeEventListener('keydown',onKey);},[desktop]);
 if(!desktop)return null;
 const hasQuery=Boolean(trimmed&&full&&trimmed!==full);
 return <span className="browser-bookmarks">
  <button ref={star} type="button" className="icon-button bookmark-star" aria-label={saved?'Edit bookmark':'Bookmark this page'} aria-pressed={Boolean(saved)} title={starReason||(saved?'Edit bookmark':'Bookmark this page (Ctrl+D)')} disabled={pending||Boolean(starReason)} onClick={starAction}><Star size={16} fill={saved?'currentColor':'none'}/></button>
  <button ref={list} type="button" className="icon-button bookmark-list-button" aria-label="Bookmarks" aria-haspopup="dialog" aria-expanded={listOpen} title="Bookmarks" onClick={()=>{editingRef.current=null;setEditing(null);setActive(0);setListOpen(true);}}><BookMarked size={16}/></button>
  <Popover anchor={star} open={saveOpen} initialFocus={nameInput} width={300} height={hasQuery?208:172} preferredSide="below" align="end" onDismiss={()=>setSaveOpen(false)} role="dialog" aria-label="Edit bookmark" className="bookmark-save-popover">
   <p className="bookmark-popover-title">Bookmark saved</p>
   <label className="bookmark-field"><span>Name</span><input ref={nameInput} value={draft} maxLength={120} onChange={event=>setDraft(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'&&saved)commitName(saved,draft);}} onBlur={()=>{if(saved)commitName(saved,draft);}}/></label>
   <p className="bookmark-address" title={saved?.url??trimmed??''}>{saved?.url??trimmed??''}</p>
   {hasQuery&&<label className="bookmark-keep"><input type="checkbox" checked={keepQuery} disabled={!saved} onChange={event=>{setKeepQuery(event.target.checked);if(saved)void send({type:'bookmark-update',id:saved.id,keepQuery:event.target.checked}).catch(cause=>{setKeepQuery(!event.target.checked);toast(cause instanceof Error?cause.message:'Bookmark could not be updated.',{tone:'error'});});}}/>Keep query and #fragment</label>}
   <div className="bookmark-actions">
    {saved&&<button type="button" className="quiet bookmark-danger" onClick={()=>{removeItem(saved);setSaveOpen(false);}}>Remove</button>}
    <button type="button" className="primary" onClick={()=>setSaveOpen(false)}>Done</button>
   </div>
  </Popover>
  <Popover anchor={list} open={listOpen} contentRef={listContent} initialFocus={listContent} width={320} height={Math.min(360,72+Math.max(items.length,1)*36+(notice?40:0))} preferredSide="below" align="end" onDismiss={()=>{setListOpen(false);editingRef.current=null;setEditing(null);}} role="dialog" aria-label="Bookmarks" className="bookmark-list-popover" tabIndex={-1}>
   <p className="bookmark-popover-title">Bookmarks <span className="bookmark-count">{items.length} of {limit}</span></p>
   {notice&&<p className="bookmark-notice">{notice}<button type="button" className="icon-button" aria-label="Dismiss bookmark notice" onClick={()=>void send({type:'bookmark-notice-dismiss'}).catch(()=>{})}><X size={12}/></button></p>}
   {items.length===0?<p className="bookmark-empty">No bookmarks yet. Use the star to save this page.</p>:
   <div role="listbox" aria-label="Saved bookmarks" onKeyDown={event=>{
    if(!items.length)return;const current=items[Math.min(active,items.length-1)]!;
    if(event.key==='ArrowDown'||event.key==='ArrowUp'||event.key==='Home'||event.key==='End'){event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?items.length-1:Math.min(items.length-1,Math.max(0,active+(event.key==='ArrowDown'?1:-1)));setActive(next);rows.current.get(items[next]!.id)?.focus();}
    else if(event.key==='Enter'){event.preventDefault();void send({type:'bookmark-open',id:current.id}).then(()=>setListOpen(false)).catch(cause=>toast(cause instanceof Error?cause.message:'Bookmark could not be opened.',{tone:'error'}));}
    else if(event.key==='F2'){event.preventDefault();editingRef.current=current.id;setEditing(current.id);}
    else if(event.key==='Delete'){event.preventDefault();removeItem(current);}
   }}>
    {items.map((item,index)=>editing===item.id?
     <input key={item.id} className="bookmark-rename" defaultValue={item.title} maxLength={120} autoFocus onKeyDown={event=>{event.stopPropagation();if(event.key==='Enter')commitName(item,(event.target as HTMLInputElement).value);if(event.key==='Escape'){editingRef.current=null;setEditing(null);listContent.current?.focus();}}} onBlur={event=>{if(editingRef.current===item.id)commitName(item,event.target.value);}} aria-label={`Rename ${item.title}`}/>:
     <div key={item.id} id={`bookmark-row-${item.id}`} role="option" aria-selected={index===active} tabIndex={index===active?0:-1} className="bookmark-row" ref={node=>{if(node)rows.current.set(item.id,node);else rows.current.delete(item.id);}} onClick={()=>{void send({type:'bookmark-open',id:item.id}).then(()=>setListOpen(false)).catch(cause=>toast(cause instanceof Error?cause.message:'Bookmark could not be opened.',{tone:'error'}));}}>
      <Globe size={14} className="bookmark-row-icon"/>
      <span className="bookmark-row-name" title={item.title}>{item.title}</span>
      <span className="bookmark-row-host">{pageHost(item.url)}</span>
      <button type="button" className="icon-button bookmark-row-action" aria-label={`Rename ${item.title}`} onClick={event=>{event.stopPropagation();editingRef.current=item.id;setEditing(item.id);}}><Pencil size={12}/></button>
      <button type="button" className="icon-button bookmark-row-action" aria-label={`Remove ${item.title}`} onClick={event=>{event.stopPropagation();removeItem(item);}}><Trash2 size={12}/></button>
     </div>)}
   </div>}
  </Popover>
  <span className="sr-only" aria-live="polite">{announcement}</span>
 </span>;
}
