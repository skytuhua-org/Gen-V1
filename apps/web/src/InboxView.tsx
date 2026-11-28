import {useEffect,useId,useLayoutEffect,useRef,useState,type KeyboardEvent,type CSSProperties} from 'react';
import {ArrowLeft,ArrowUpRight,Bell,Bot,Check,Circle,Inbox,RefreshCw,Search,TriangleAlert,X} from 'lucide-react';
import type {AttentionItem} from '../../../packages/contracts/attention.ts';
import {Select} from '../../../packages/ui-shell/Select';
import {shownColumns,oneColumn} from '../../../third-party/vespin/inbox-columns.ts';
import {InboxList,InboxItemRow,InboxPane} from '../../../third-party/vespin/inbox-presentation.tsx';
import {projectColor} from './project-colors';
import {readMotionPolicy} from './motion-policy';
import {formatLocalDateTime,type TimeFormat} from './time-format';
import {resolveInboxFocusId} from './inbox-focus';
import './agent-inbox.css';

function RowReadButton({read,pending,toggle}:{read:boolean;pending:boolean;toggle:()=>void}){
 const label=read?'Mark as unread':'Mark as read';
 return <button type="button" className="inbox-row-read" aria-label={label} title={label} aria-disabled={pending}
  onClick={event=>{event.stopPropagation();if(!pending)toggle();}}
  onKeyDown={event=>{if(['ArrowUp','ArrowDown','j','k','Home','End'].includes(event.key))event.stopPropagation();}}>
  {read?<Circle size={11} aria-hidden="true"/>:<Check size={12} aria-hidden="true"/>}
 </button>;
}

type Filter='all'|'needs-you'|'unread'|'completed';
const filters=[{value:'all',label:'All'},{value:'needs-you',label:'Needs you'},{value:'unread',label:'Unread'},{value:'completed',label:'Completed'}];
const needsYou=(item:AttentionItem)=>item.actionable||item.state==='failed';
export const inboxFooterHint=(item:AttentionItem)=>item.actionable?'Answer or review the current request there.':item.state==='resolved'?'This request has already been resolved.':item.state==='failed'?'Read what went wrong, then open the conversation to retry.':'Read the result and its supporting evidence.';
const labels:Record<AttentionItem['state'],string>={'needs-input':'Needs your input','needs-review':'Review change',completed:'Finished',failed:'Needs attention',resolved:'Resolved'};
const age=(value:string)=>{const minutes=Math.max(0,Math.floor((Date.now()-Date.parse(value))/60_000));return minutes<1?'now':minutes<60?minutes+'m':minutes<1440?Math.floor(minutes/60)+'h':Math.floor(minutes/1440)+'d';};

const renderCap=200;

type FocusKind='return'|'reader'|'membership';
type FocusRequest={
 instance:number;
 intent:number;
 interaction:number;
 kind:FocusKind;
 requestedId:string;
 priorVisibleIds:readonly string[];
 listRevision:number;
 expectedNode?:HTMLElement;
};
type FocusedInboxSource={id:string;node:HTMLElement;interaction:number;visibleIds:readonly string[]};

function visibleFocusNode(node:HTMLElement|null|undefined):node is HTMLElement{
 if(!node?.isConnected||node.closest('[hidden],[inert],[aria-hidden="true"]')||!node.getClientRects().length)return false;
 const visibility=node.ownerDocument.defaultView?.getComputedStyle(node).visibility;
 return visibility!=='hidden'&&visibility!=='collapse';
}
function enabledFocusNode(node:HTMLElement|null|undefined,owner:HTMLElement):node is HTMLElement{
 return visibleFocusNode(node)&&owner.contains(node)&&node.ownerDocument===owner.ownerDocument
  &&!node.matches(':disabled,[aria-disabled="true"]');
}
function revealInboxRow(target:HTMLElement){
 const list=target.closest<HTMLElement>('.inbox-tasks-scroll');
 if(!list)return;
 const bounds=list.getBoundingClientRect(),row=target.getBoundingClientRect();
 const top=bounds.top+list.clientTop,bottom=top+list.clientHeight;
 const delta=row.top<top?row.top-top:row.bottom>bottom?row.bottom-bottom:0;
 if(delta)list.scrollTo({top:list.scrollTop+delta,behavior:'instant'});
}

/** Scoped adaptation of Vespin's list/reader composition; canonical Gen actions stay in their thread. */
export interface InboxViewProps {attention:{items:AttentionItem[];unread:number;error:string;loaded?:boolean;refresh():Promise<void|string>;markRead(id:string):Promise<void>;markUnread(id:string):Promise<void>;markAllRead?(ids:readonly string[]):Promise<void>};onOpenThread:(threadId:string)=>void|Promise<void>;emptyTitle?:string;emptyMessage?:string;projectColorFor?:(projectId?:string)=>string|undefined;timeFormat?:TimeFormat}
export function InboxView({attention,onOpenThread,emptyTitle,emptyMessage,projectColorFor,timeFormat='system'}:InboxViewProps){
 const [filter,setFilter]=useState<Filter>('all'),[query,setQuery]=useState(''),[chosen,setChosen]=useState<string>(),[explicitDismissed,setExplicitDismissed]=useState(false),[single,setSingle]=useState(false),[actionError,setActionError]=useState(''),root=useRef<HTMLElement>(null),reader=useRef<HTMLElement>(null),rows=useRef(new Map<string,HTMLButtonElement>()),heading=useId(),actionVersion=useRef(0),markTimer=useRef<ReturnType<typeof setTimeout>>(undefined);
 const chosenRef=useRef<string|undefined>(undefined),instanceGeneration=useRef(0),intentGeneration=useRef(0),interactionGeneration=useRef(0),focusFrame=useRef<number|undefined>(undefined),focusRequest=useRef<FocusRequest|undefined>(undefined);
 const committedVisibleIds=useRef<string[]>([]),committedListSignature=useRef<string|undefined>(undefined),listRevision=useRef(0);
 const focusedSource=useRef<FocusedInboxSource|undefined>(undefined),chosenFocusOrder=useRef<readonly string[]>([]);
 const selectedId=useRef<string|undefined>(undefined),backButton=useRef<HTMLButtonElement>(null);
 const visibilityObserver=useRef<MutationObserver|undefined>(undefined),reconcileFocus=useRef<()=>void>(()=>{});
 const [refreshing,setRefreshing]=useState(false),[refreshFeedback,setRefreshFeedback]=useState<{text:string}>();
 const refreshPending=useRef(false),retryButton=useRef<HTMLButtonElement>(null),returnRetryFocus=useRef(false);
 const [markingAll,setMarkingAll]=useState(false);
 const bulkItems=useRef<ReadonlySet<string>|undefined>(undefined);
 const bulkButton=useRef<HTMLButtonElement>(null),refreshButton=useRef<HTMLButtonElement>(null),returnBulkFocus=useRef(false);
 useLayoutEffect(()=>{
  if(markingAll||!returnBulkFocus.current)return;
  returnBulkFocus.current=false;
  const button=bulkButton.current??refreshButton.current;
  if(button&&button.ownerDocument.activeElement===button.ownerDocument.body)button.focus({preventScroll:true});
 },[markingAll,attention.unread]);
 const searchInput=useRef<HTMLInputElement>(null),knownItems=useRef<Set<string>|undefined>(undefined);
 const clearSearch=()=>{setQuery('');searchInput.current?.focus();};
 useEffect(()=>()=>{clearTimeout(markTimer.current);actionVersion.current++;instanceGeneration.current++;interactionGeneration.current++;if(focusFrame.current!==undefined)cancelAnimationFrame(focusFrame.current);focusFrame.current=undefined;focusRequest.current=undefined;},[]);
 useEffect(()=>{if(!refreshFeedback)return;const timer=setTimeout(()=>setRefreshFeedback(undefined),2400);return()=>clearTimeout(timer);},[refreshFeedback]);
 const [,setTick]=useState(0);
 useEffect(()=>{const id=setInterval(()=>setTick(t=>t+1),30_000);return()=>clearInterval(id);},[]);
 const visible=attention.items.filter(item=>(filter==='all'||filter==='needs-you'&&needsYou(item)||filter==='unread'&&!item.read||filter==='completed'&&(item.state==='completed'||item.state==='resolved'))&&`${item.title} ${item.summary} ${labels[item.state]}`.toLowerCase().includes(query.toLowerCase().trim()));
 const capped=visible.length>renderCap,rendered=capped?visible.slice(0,renderCap):visible;
 const selected=rendered.find(item=>item.id===chosen),columns=explicitDismissed?'list':shownColumns(single,selected?.id);
 selectedId.current=selected?.id;
 useLayoutEffect(()=>{
  if(refreshing||!returnRetryFocus.current)return;
  returnRetryFocus.current=false;
  const target=retryButton.current??(columns==='item'?reader.current:refreshButton.current);
  if(target&&target.ownerDocument.activeElement===target.ownerDocument.body)target.focus({preventScroll:true});
 },[columns,refreshing]);
 useEffect(()=>{const node=root.current;if(!node)return;const measure=(width:number)=>{if(width>0)setSingle(was=>oneColumn(width,was));};measure(node.getBoundingClientRect().width);const observer=new ResizeObserver(entries=>{if(entries[0])measure(entries[0].contentRect.width);});observer.observe(node);return()=>observer.disconnect();},[]);
 useLayoutEffect(()=>{
  const ids=rendered.map(item=>item.id),signature=rendered.map(item=>[item.id,item.title,item.summary,item.updatedAt,item.read,item.state,item.actionable,item.kind].join('\u0000')).join('\u0001'),prior=committedListSignature.current;
  if(prior!==undefined&&prior!==signature)listRevision.current++;
  committedVisibleIds.current=ids;committedListSignature.current=signature;
  if(chosenRef.current&&ids.includes(chosenRef.current))chosenFocusOrder.current=ids;
  reconcileFocus.current();
  if(focusedSource.current)focusedSource.current.visibleIds=ids;
  if(attention.loaded===false)return;
  const known=knownItems.current;
  if(known&&columns!=='item'&&readMotionPolicy()==='full')for(const id of ids){
   if(!known.has(id))rows.current.get(id)?.parentElement?.classList.add('row-enter');
  }
  knownItems.current=new Set(attention.items.map(item=>item.id));
 });
 useEffect(()=>{
  const owner=root.current;if(!owner)return;
  const removeEntry=(event:AnimationEvent)=>{
   if(event.animationName==='inbox-row-in'&&event.target instanceof Element)event.target.classList.remove('row-enter');
  };
  owner.addEventListener('animationend',removeEntry);owner.addEventListener('animationcancel',removeEntry);
  return()=>{owner.removeEventListener('animationend',removeEntry);owner.removeEventListener('animationcancel',removeEntry);};
 },[]);
 const requestFocus=(kind:FocusKind,requestedId:string,priorVisibleIds:readonly string[]=committedVisibleIds.current)=>{
  const owner=root.current,view=owner?.ownerDocument.defaultView;
  if(!owner||!view)return;
  const intent=++intentGeneration.current;
  focusRequest.current={instance:instanceGeneration.current,intent,interaction:interactionGeneration.current,
   kind,requestedId,priorVisibleIds,listRevision:listRevision.current,expectedNode:rows.current.get(requestedId)};
  if(focusFrame.current!==undefined)view.cancelAnimationFrame(focusFrame.current);
  focusFrame.current=view.requestAnimationFrame(()=>{
   focusFrame.current=undefined;
   const request=focusRequest.current;
   focusRequest.current=undefined;
   if(!request||request.instance!==instanceGeneration.current||request.intent!==intentGeneration.current
    ||request.interaction!==interactionGeneration.current||owner.ownerDocument.hidden
    ||root.current!==owner||!visibleFocusNode(owner))return;
   if(request.kind==='reader'){
    if(chosenRef.current===request.requestedId&&selectedId.current===request.requestedId&&request.listRevision===listRevision.current&&enabledFocusNode(reader.current,owner)){
     reader.current.focus({preventScroll:true});
    }
    return;
   }
   const eligible=committedVisibleIds.current.filter(id=>enabledFocusNode(rows.current.get(id),owner));
   const id=resolveInboxFocusId(request.requestedId,request.priorVisibleIds,eligible);
   const row=id===null?undefined:rows.current.get(id);
   if(request.kind==='return'){
    const active=owner.ownerDocument.activeElement;
    const focusStillPresent=active instanceof HTMLElement&&active!==owner.ownerDocument.body&&visibleFocusNode(active);
    // A changed projection still cancels the older same-row request. The
    // missing-row path is allowed when that request's focused source is gone.
    if(request.listRevision!==listRevision.current&&(id===request.requestedId||focusStillPresent))return;
    if(id===request.requestedId&&row!==request.expectedNode)return;
   }
   const target=[row,searchInput.current,refreshButton.current,request.kind==='membership'?backButton.current:null]
    .find(node=>enabledFocusNode(node,owner));
   target?.focus({preventScroll:true});
   if(target&&row===target)revealInboxRow(target);
  });
 };
 reconcileFocus.current=()=>{
  const owner=root.current,source=focusedSource.current;
  if(!source&&!focusRequest.current)return;
  if(!visibleFocusNode(owner)){
   if(source||focusRequest.current)interactionGeneration.current++;
   focusedSource.current=undefined;
   visibilityObserver.current?.disconnect();
   return;
  }
  if(!source||visibleFocusNode(source.node))return;
  const document=owner.ownerDocument,active=document.activeElement;
  focusedSource.current=undefined;
  visibilityObserver.current?.disconnect();
  if(source.interaction!==interactionGeneration.current||document.hidden||focusRequest.current
   ||active!==document.body&&active!==source.node&&active!==null)return;
  requestFocus('membership',source.id,source.visibleIds);
 };
 useEffect(()=>{
  const owner=root.current,document=owner?.ownerDocument,view=document?.defaultView;
  if(!owner||!document||!view)return;
  const observer=new MutationObserver(()=>reconcileFocus.current());
  visibilityObserver.current=observer;
  const clear=()=>{
   interactionGeneration.current++;
   focusRequest.current=undefined;
   focusedSource.current=undefined;
   observer.disconnect();
  };
  const focus=(event:FocusEvent)=>{
   const node=event.target;
   if(node===document.body&&focusedSource.current&&!visibleFocusNode(focusedSource.current.node))return;
   clear();
   if(!(node instanceof HTMLElement)||!owner.contains(node))return;
   const row=node.closest('.ui-list-row')?.querySelector<HTMLElement>('.ui-list-row-main');
   const id=row?.dataset.inboxFocusId??(reader.current?.contains(node)?selectedId.current:undefined);
   if(!id)return;
   focusedSource.current={id,node,visibleIds:committedVisibleIds.current,interaction:interactionGeneration.current};
   for(let ancestor:HTMLElement|null=node;ancestor;ancestor=ancestor.parentElement){
    observer.observe(ancestor,{attributes:true,attributeFilter:['hidden','inert','aria-hidden','class','style']});
   }
  };
  const intent=(event:Event)=>{
   const interaction=++interactionGeneration.current,source=focusedSource.current;
   if(source&&event.target instanceof Node&&source.node.contains(event.target)&&document.activeElement===source.node){
    source.interaction=interaction;
   }
  };
  const hide=()=>{if(document.hidden)clear();};
  view.addEventListener('keydown',intent,true);
  view.addEventListener('pointerdown',intent,true);
  view.addEventListener('focusin',focus,true);
  view.addEventListener('wheel',intent,true);
  view.addEventListener('blur',clear);
  document.addEventListener('visibilitychange',hide);
  return()=>{
   clear();
   visibilityObserver.current=undefined;
   view.removeEventListener('keydown',intent,true);
   view.removeEventListener('pointerdown',intent,true);
   view.removeEventListener('focusin',focus,true);
   view.removeEventListener('wheel',intent,true);
   view.removeEventListener('blur',clear);
   document.removeEventListener('visibilitychange',hide);
  };
 },[]);
 const activeReadWrites=useRef(new Map<string,Promise<void>>());
 const [pendingReadWrites,setPendingReadWrites]=useState<ReadonlySet<string>>(()=>new Set());
 const readButton=useRef<HTMLButtonElement>(null),refocusReadItem=useRef<string|undefined>(undefined);
 const pendingRead=(id:string)=>pendingReadWrites.has(id)||Boolean(bulkItems.current?.has(id));
 const readBusy=selected?pendingRead(selected.id):false;
 useLayoutEffect(()=>{
  const id=refocusReadItem.current;
  if(!id)return;
  if(selected?.id!==id){refocusReadItem.current=undefined;return;}
  if(readBusy)return;
  refocusReadItem.current=undefined;
  const button=readButton.current;
  if(button&&button.ownerDocument.activeElement===button.ownerDocument.body)button.focus({preventScroll:true});
 },[selected?.id,readBusy]);
 const act=(work:()=>void|Promise<void>,version=++actionVersion.current)=>{
  const request=Promise.resolve().then(work);
  void request.then(()=>{if(version===actionVersion.current)setActionError('');},cause=>{if(version===actionVersion.current)setActionError(cause instanceof Error?cause.message:String(cause));});
  return request;
 };
 const refresh=()=>{
  if(refreshPending.current)return;
  refreshPending.current=true;
  setRefreshing(true);
  setRefreshFeedback(undefined);
  const request=act(async()=>{const error=await attention.refresh();if(error)throw new Error(error);});
  const settle=(feedback:string)=>{
   refreshPending.current=false;
   setRefreshing(false);
   setRefreshFeedback({text:feedback});
  };
  void request.then(()=>{
   const now=new Date();
   settle('Updated '+String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0'));
  },()=>settle('Refresh failed'));
 };
 const setItemRead=(id:string,read:boolean,version?:number)=>{
  if(activeReadWrites.current.has(id)||bulkItems.current?.has(id))return;
  const button=readButton.current;
  if(button?.dataset.itemId===id&&button.ownerDocument.activeElement===button)refocusReadItem.current=id;
  const request=act(()=>read?attention.markRead(id):attention.markUnread(id),version);
  activeReadWrites.current.set(id,request);
  setPendingReadWrites(new Set(activeReadWrites.current.keys()));
  const finish=()=>{
   activeReadWrites.current.delete(id);
   setPendingReadWrites(new Set(activeReadWrites.current.keys()));
  };
  void request.then(finish,finish);
 };
 const toggleRead=(item:AttentionItem)=>{
  if(activeReadWrites.current.has(item.id)||bulkItems.current?.has(item.id))return;
  if(chosenRef.current===item.id)clearTimeout(markTimer.current);
  setItemRead(item.id,!item.read);
 };
 const markAll=()=>{
  if(bulkItems.current)return;
  const unread=attention.items.filter(item=>!item.read).map(item=>item.id);
  if(!unread.length)return;
  const pending:Promise<void>[]=[],fresh:string[]=[];
  for(const id of unread){
   const request=activeReadWrites.current.get(id);
   if(request)pending.push(request);else fresh.push(id);
  }
  bulkItems.current=new Set(unread);
  if(chosenRef.current&&bulkItems.current.has(chosenRef.current))clearTimeout(markTimer.current);
  returnBulkFocus.current=bulkButton.current===bulkButton.current?.ownerDocument.activeElement;
  setMarkingAll(true);
  const request=act(async()=>{
   const batch=attention.markAllRead;
   const writes=batch&&fresh.length?[...pending,Promise.resolve().then(()=>batch(fresh))]
     :[...pending,...fresh.map(id=>Promise.resolve().then(()=>attention.markRead(id)))];
   const results=await Promise.allSettled(writes);
   const failure=results.find(result=>result.status==='rejected');
   if(!batch){
    try{const error=await attention.refresh();if(error)throw new Error(error);}catch(error){if(!failure)throw error;}
   }
   if(failure)throw failure.reason;
  });
  const finish=()=>{bulkItems.current=undefined;setMarkingAll(false);};
  void request.then(finish,finish);
 };
 // Arrow-key traversal calls choose() per step; only the settled selection
 // earns a mark-read write, so coalesce rapid choices into one request.
 const choose=(item:AttentionItem,focusReader=false)=>{
  const version=++actionVersion.current;
  chosenRef.current=item.id;chosenFocusOrder.current=committedVisibleIds.current;setChosen(item.id);setExplicitDismissed(false);setActionError('');clearTimeout(markTimer.current);
  const pending=activeReadWrites.current.get(item.id);
  if(pending)void act(()=>pending,version);
  else if(!item.read&&!bulkItems.current?.has(item.id))markTimer.current=setTimeout(()=>setItemRead(item.id,true,version),500);
  if(focusReader&&single)requestFocus('reader',item.id);
 };
 const back=()=>{const id=chosenRef.current;actionVersion.current++;chosenRef.current=undefined;clearTimeout(markTimer.current);setChosen(undefined);setExplicitDismissed(true);setActionError('');if(id)requestFocus('return',id,chosenFocusOrder.current);};
 const keyboard=(event:KeyboardEvent<HTMLElement>)=>{
  const native=event.nativeEvent,target=event.target as HTMLElement;
  if(event.defaultPrevented||native.isComposing||native.keyCode===229||target.closest('input,textarea,select,[role=combobox],[role=listbox],[contenteditable]:not([contenteditable="false"])'))return;
  const right=event.key==='ArrowRight'||event.key==='l';
  if(columns==='both'&&selected){
   if((event.key==='Escape'||event.key==='ArrowLeft')&&reader.current?.contains(target)){
    event.preventDefault();event.stopPropagation();requestFocus('return',selected.id,chosenFocusOrder.current);return;
   }
   if(right&&rows.current.get(selected.id)?.contains(target)){
    event.preventDefault();event.stopPropagation();requestFocus('reader',selected.id);return;
   }
  }
  if(event.key==='Escape'){if(chosenRef.current){event.preventDefault();event.stopPropagation();back();}return;}
  const direction=event.key==='ArrowDown'||event.key==='j'||(columns==='item'&&right)?1:event.key==='ArrowUp'||event.key==='k'?-1:0;
  if(!direction&&event.key!=='Home'&&event.key!=='End')return;
  event.preventDefault();
  const pressed=target.closest('.ui-list-row-main'),focusedId=pressed?[...rows.current.entries()].find(([,node])=>node===pressed)?.[0]:undefined;
  const index=rendered.findIndex(item=>item.id===(focusedId??chosenRef.current));
  const next=event.key==='Home'?0:event.key==='End'?rendered.length-1:Math.max(0,Math.min(rendered.length-1,index<0?direction>0?0:rendered.length-1:index+direction));
  const item=rendered[next];
  if(!item||columns==='item'&&right&&item.id===chosenRef.current)return;
  choose(item);
  if(columns!=='item'){const row=rows.current.get(item.id);row?.focus();row?.scrollIntoView({block:'nearest'});}
 };
 const sourceLabels:Record<AttentionItem['kind'],string>={request:'Question',operation:'Change review','thread-completed':'Task result','thread-failed':'Task needs attention'};
 const hasItems=attention.items.length>0;
 const error=actionError||attention.error;
 const reconnecting=!actionError&&error==='Inbox is reconnecting…';
 const empty=<div className="agent-inbox-empty"><Inbox size={27}/><h3>{hasItems?'Nothing matches':emptyTitle??'You are all caught up'}</h3><p>{hasItems?'Try another view or search.':emptyMessage??'Questions, reviews and task results will appear here.'}</p>{hasItems&&<button type="button" className="quiet inbox-filter-reset" onClick={()=>{setFilter('all');clearSearch();}}>Clear search and filter</button>}</div>;
 const head=<header className="ui-toolbar inbox-list-head" data-place="inbox"><h2 id={heading}>Inbox</h2>{!refreshFeedback&&attention.unread>0&&<span className="inbox-unread-count"><span key={attention.unread}>{attention.unread}</span></span>}<span className="inbox-refresh-status" aria-live="polite">{refreshFeedback?.text}</span><div className="inbox-view-controls"><Select aria-label="Inbox filter" value={filter} options={filters} onValueChange={value=>setFilter(value as Filter)}/><button ref={refreshButton} type="button" className="icon-button" aria-label="Refresh inbox" title={refreshing?'Refreshing…':'Refresh inbox'} aria-busy={refreshing} aria-disabled={refreshing} onClick={refresh}><RefreshCw className={refreshing?'spinning':undefined} size={14} aria-hidden="true"/></button>{(attention.unread>0||markingAll)&&<button ref={bulkButton} type="button" className="quiet inbox-mark-all" aria-label="Mark all as read" disabled={markingAll} onClick={markAll}>{markingAll?'Marking…':'Mark all read'}</button>}</div></header>;
 const search=<search className="inbox-search"><div className="inbox-search-field"><Search size={14} aria-hidden="true"/><input ref={searchInput} type="search" placeholder="Search inbox" aria-label="Search Inbox" value={query} onChange={event=>setQuery(event.target.value)} onKeyDown={event=>{if(event.key==='Escape'&&query&&!event.nativeEvent.isComposing&&event.nativeEvent.keyCode!==229){event.preventDefault();event.stopPropagation();clearSearch();}}}/>{query&&<button type="button" className="inbox-search-clear" aria-label="Clear search" title="Clear search" onClick={clearSearch}><X size={11} aria-hidden="true"/></button>}</div></search>;
 const toolbar=selected?<header className="ui-toolbar inbox-item-toolbar" data-place="inbox-item">
  {single&&<button ref={backButton} type="button" className="quiet" onClick={back}><ArrowLeft size={14}/>Inbox</button>}
  <span className="inbox-item-crumb"><Bot size={13}/>{sourceLabels[selected.kind]}</span>
  <span className="inbox-item-toolbar-actions">
   <button ref={readButton} data-item-id={selected.id} type="button" className="quiet inbox-read-action" disabled={readBusy} aria-disabled={readBusy}
    title={readBusy?'Updating read state':undefined} aria-label={selected.read?'Mark as unread':'Mark as read'} onClick={()=>toggleRead(selected)}>
    {selected.read?<Circle size={12} aria-hidden="true"/>:<Check size={12} aria-hidden="true"/>}{selected.read?'Mark unread':'Mark read'}
   </button>
  </span>
 </header>:null;
 const footer=selected?<div className="agent-inbox-answer"><button type="button" className="primary" onClick={()=>{void act(()=>onOpenThread(selected.destination.threadId));}}>Open conversation<ArrowUpRight size={14}/></button><small>{inboxFooterHint(selected)}</small></div>:null;
 return <section className="agent-inbox inbox-view" aria-label="Agent inbox" ref={root} data-columns={columns} data-capped={capped||undefined} onKeyDown={keyboard}>
  <InboxList label="Inbox items" hidden={columns==='item'} head={head} search={search} empty={!rendered.length} note={!rendered.length?empty:capped?<p className="inbox-render-cap">{`Showing ${renderCap} of ${visible.length}. Refine search or filter to see more.`}</p>:undefined}>
   {rendered.map(item=><InboxItemRow key={item.id} pressRef={node=>{if(node){node.dataset.inboxFocusId=item.id;rows.current.set(item.id,node);}else rows.current.delete(item.id);}} title={item.title} description={<>{item.actionable&&<Bell size={11}/>}<span>{item.summary}</span></>} lead={{icon:<span className="inbox-holder-mark" style={{'--inbox-project':projectColorFor?projectColorFor(item.projectId):projectColor({kind:'local'},item.projectId)} as CSSProperties}>{item.state==='failed'?<TriangleAlert size={13}/>:item.state==='completed'||item.state==='resolved'?<Check size={13}/>:<Bot size={13}/>}</span>,label:sourceLabels[item.kind]}} action={<RowReadButton read={item.read} pending={pendingRead(item.id)} toggle={()=>toggleRead(item)}/>} meta={<time dateTime={item.updatedAt}>{age(item.updatedAt)}</time>} unread={!item.read} current={chosen===item.id} muted={item.state==='completed'||item.state==='resolved'} label={`${item.title}, ${labels[item.state]}${!item.read?', unread':''}`} onPress={()=>choose(item,true)}/>)}
  </InboxList>
  {!explicitDismissed&&<InboxPane title={selected?.title} hidden={columns==='list'} toolbar={toolbar} paneRef={reader} footer={footer} empty={<div className="agent-inbox-empty"><Inbox size={29}/><h3>Select an item</h3><p>Read it here, then open its conversation when needed.</p></div>}>
   {selected&&<div key={selected.id} className="inbox-canonical-message"><div className="inbox-message-meta"><span data-state={selected.state}>{labels[selected.state]}</span><time dateTime={selected.updatedAt}>{formatLocalDateTime(selected.updatedAt,timeFormat,undefined,{dateStyle:'medium',timeStyle:'short'})}</time></div><p>{selected.summary}</p></div>}
  </InboxPane>}
  {error&&<div className="agent-inbox-error" data-tone={reconnecting?'info':'danger'}>
   <span role={reconnecting?'status':'alert'} aria-atomic="true">{error}</span>
   {!reconnecting&&<button ref={retryButton} type="button" className="agent-inbox-retry" disabled={refreshing} onClick={event=>{
    returnRetryFocus.current=event.currentTarget.ownerDocument.activeElement===event.currentTarget;
    refresh();
   }}>Retry</button>}
  </div>}
 </section>;
}
