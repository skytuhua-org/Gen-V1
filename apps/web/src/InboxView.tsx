import {useEffect,useId,useLayoutEffect,useRef,useState,type KeyboardEvent,type CSSProperties} from 'react';
import {ArrowLeft,ArrowUpRight,Bell,Bot,Check,Circle,Inbox,RefreshCw,Search,TriangleAlert,X} from 'lucide-react';
import type {AttentionItem} from '../../../packages/contracts/attention.ts';
import {Select} from '../../../packages/ui-shell/Select';
import {shownColumns,oneColumn} from '../../../third-party/vespin/inbox-columns.ts';
import {InboxList,InboxItemRow,InboxPane} from '../../../third-party/vespin/inbox-presentation.tsx';
import {projectColor} from './project-colors';
import {formatLocalDateTime,type TimeFormat} from './time-format';
import './agent-inbox.css';

type Filter='all'|'needs-you'|'unread'|'completed';
const filters=[{value:'all',label:'All'},{value:'needs-you',label:'Needs you'},{value:'unread',label:'Unread'},{value:'completed',label:'Completed'}];
const needsYou=(item:AttentionItem)=>item.actionable||item.state==='failed';
export const inboxFooterHint=(item:AttentionItem)=>item.actionable?'Answer or review the current request there.':item.state==='resolved'?'This request has already been resolved.':item.state==='failed'?'Read what went wrong, then open the conversation to retry.':'Read the result and its supporting evidence.';
const labels:Record<AttentionItem['state'],string>={'needs-input':'Needs your input','needs-review':'Review change',completed:'Finished',failed:'Needs attention',resolved:'Resolved'};
const age=(value:string)=>{const minutes=Math.max(0,Math.floor((Date.now()-Date.parse(value))/60_000));return minutes<1?'now':minutes<60?minutes+'m':minutes<1440?Math.floor(minutes/60)+'h':Math.floor(minutes/1440)+'d';};

/** Scoped adaptation of Vespin's list/reader composition; canonical Gen actions stay in their thread. */
export interface InboxViewProps {attention:{items:AttentionItem[];unread:number;error:string;refresh():Promise<void>;markRead(id:string):Promise<void>;markUnread(id:string):Promise<void>};onOpenThread:(threadId:string)=>void|Promise<void>;emptyTitle?:string;emptyMessage?:string;projectColorFor?:(projectId?:string)=>string|undefined;timeFormat?:TimeFormat}
export function InboxView({attention,onOpenThread,emptyTitle,emptyMessage,projectColorFor,timeFormat='system'}:InboxViewProps){
 const [filter,setFilter]=useState<Filter>('all'),[query,setQuery]=useState(''),[chosen,setChosen]=useState<string>(),[single,setSingle]=useState(false),[actionError,setActionError]=useState(''),root=useRef<HTMLElement>(null),reader=useRef<HTMLElement>(null),rows=useRef(new Map<string,HTMLButtonElement>()),heading=useId(),actionVersion=useRef(0),markTimer=useRef<ReturnType<typeof setTimeout>>(undefined);
 const [refreshing,setRefreshing]=useState(false),[refreshFeedback,setRefreshFeedback]=useState<{text:string}>();
 const refreshPending=useRef(false);
 const searchInput=useRef<HTMLInputElement>(null);
 const clearSearch=()=>{setQuery('');searchInput.current?.focus();};
 useEffect(()=>()=>{clearTimeout(markTimer.current);actionVersion.current++;},[]);
 useEffect(()=>{if(!refreshFeedback)return;const timer=setTimeout(()=>setRefreshFeedback(undefined),2400);return()=>clearTimeout(timer);},[refreshFeedback]);
 const [,setTick]=useState(0);
 useEffect(()=>{const id=setInterval(()=>setTick(t=>t+1),30_000);return()=>clearInterval(id);},[]);
 const visible=attention.items.filter(item=>(filter==='all'||filter==='needs-you'&&needsYou(item)||filter==='unread'&&!item.read||filter==='completed'&&(item.state==='completed'||item.state==='resolved'))&&`${item.title} ${item.summary} ${labels[item.state]}`.toLowerCase().includes(query.toLowerCase().trim()));
 const selected=visible.find(item=>item.id===chosen),columns=shownColumns(single,selected?.id);
 useEffect(()=>{const node=root.current;if(!node)return;const measure=(width:number)=>{if(width>0)setSingle(was=>oneColumn(width,was));};measure(node.getBoundingClientRect().width);const observer=new ResizeObserver(entries=>{if(entries[0])measure(entries[0].contentRect.width);});observer.observe(node);return()=>observer.disconnect();},[]);
 const activeReadWrites=useRef(new Map<string,Promise<void>>());
 const [pendingReadWrites,setPendingReadWrites]=useState<ReadonlySet<string>>(()=>new Set());
 const readButton=useRef<HTMLButtonElement>(null),refocusReadItem=useRef<string|undefined>(undefined);
 const readBusy=selected?pendingReadWrites.has(selected.id):false;
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
  const request=act(()=>attention.refresh());
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
  if(activeReadWrites.current.has(id))return;
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
  if(activeReadWrites.current.has(item.id))return;
  clearTimeout(markTimer.current);
  setItemRead(item.id,!item.read);
 };
 // Arrow-key traversal calls choose() per step; only the settled selection
 // earns a mark-read write, so coalesce rapid choices into one request.
 const choose=(item:AttentionItem,focusReader=false)=>{
  const version=++actionVersion.current;
  setChosen(item.id);setActionError('');clearTimeout(markTimer.current);
  const pending=activeReadWrites.current.get(item.id);
  if(pending)void act(()=>pending,version);
  else if(!item.read)markTimer.current=setTimeout(()=>setItemRead(item.id,true,version),500);
  if(focusReader&&single)requestAnimationFrame(()=>reader.current?.focus());
 };
 const back=()=>{const id=chosen;actionVersion.current++;clearTimeout(markTimer.current);setChosen(undefined);setActionError('');requestAnimationFrame(()=>id&&rows.current.get(id)?.focus());};
 const keyboard=(event:KeyboardEvent<HTMLElement>)=>{if(event.defaultPrevented||(event.target as HTMLElement).closest('input,textarea,select,[role=combobox],[role=listbox],[contenteditable=true]'))return;if(event.key==='Escape'&&single&&chosen){event.preventDefault();event.stopPropagation();back();return;}const direction=event.key==='ArrowDown'||event.key==='j'?1:event.key==='ArrowUp'||event.key==='k'?-1:0;if(!direction&&event.key!=='Home'&&event.key!=='End')return;event.preventDefault();const index=visible.findIndex(item=>item.id===chosen),next=event.key==='Home'?0:event.key==='End'?visible.length-1:Math.max(0,Math.min(visible.length-1,index<0?direction>0?0:visible.length-1:index+direction)),item=visible[next];if(item){choose(item);const row=rows.current.get(item.id);if(columns!=='item'){row?.focus();row?.scrollIntoView({block:'nearest'});}}};
 const sourceLabels:Record<AttentionItem['kind'],string>={request:'Question',operation:'Change review','thread-completed':'Task result','thread-failed':'Task needs attention'};
 const hasItems=attention.items.length>0;
 const empty=<div className="agent-inbox-empty"><Inbox size={27}/><h3>{hasItems?'Nothing matches':emptyTitle??'You are all caught up'}</h3><p>{hasItems?'Try another view or search.':emptyMessage??'Questions, reviews and task results will appear here.'}</p>{hasItems&&<button type="button" className="quiet inbox-filter-reset" onClick={()=>{setFilter('all');clearSearch();}}>Clear search and filter</button>}</div>;
 const head=<header className="ui-toolbar inbox-list-head" data-place="inbox"><h2 id={heading}>Inbox</h2>{!refreshFeedback&&attention.unread>0&&<span className="inbox-unread-count">{attention.unread}</span>}<span className="inbox-refresh-status" aria-live="polite">{refreshFeedback?.text}</span><div className="inbox-view-controls"><Select aria-label="Inbox filter" value={filter} options={filters} onValueChange={value=>setFilter(value as Filter)}/><button type="button" className="icon-button" aria-label="Refresh inbox" title={refreshing?'Refreshing…':'Refresh inbox'} aria-busy={refreshing} aria-disabled={refreshing} onClick={refresh}><RefreshCw className={refreshing?'spinning':undefined} size={14} aria-hidden="true"/></button></div></header>;
 const search=<search className="inbox-search"><div className="inbox-search-field"><Search size={14} aria-hidden="true"/><input ref={searchInput} type="search" placeholder="Search inbox" aria-label="Search Inbox" value={query} onChange={event=>setQuery(event.target.value)} onKeyDown={event=>{if(event.key==='Escape'&&query){event.preventDefault();event.stopPropagation();clearSearch();}}}/>{query&&<button type="button" className="inbox-search-clear" aria-label="Clear search" title="Clear search" onClick={clearSearch}><X size={11} aria-hidden="true"/></button>}</div></search>;
 const toolbar=selected?<header className="ui-toolbar inbox-item-toolbar" data-place="inbox-item">
  {single&&<button type="button" className="quiet" onClick={back}><ArrowLeft size={14}/>Inbox</button>}
  <span className="inbox-item-crumb"><Bot size={13}/>{sourceLabels[selected.kind]}</span>
  <span className="inbox-item-toolbar-actions">
   <button ref={readButton} data-item-id={selected.id} type="button" className="quiet inbox-read-action" disabled={readBusy} aria-disabled={readBusy}
    title={readBusy?'Updating read state':undefined} aria-label={selected.read?'Mark as unread':'Mark as read'} onClick={()=>toggleRead(selected)}>
    {selected.read?<Circle size={12} aria-hidden="true"/>:<Check size={12} aria-hidden="true"/>}{selected.read?'Mark unread':'Mark read'}
   </button>
  </span>
 </header>:null;
 const footer=selected?<div className="agent-inbox-answer"><button type="button" className="primary" onClick={()=>{void act(()=>onOpenThread(selected.destination.threadId));}}>Open conversation<ArrowUpRight size={14}/></button><small>{inboxFooterHint(selected)}</small></div>:null;
 return <section className="agent-inbox inbox-view" aria-label="Agent inbox" ref={root} data-columns={columns} onKeyDown={keyboard}>
  <InboxList label="Inbox items" hidden={columns==='item'} head={head} search={search} empty={!visible.length} note={!visible.length?empty:undefined}>
   {visible.map(item=><InboxItemRow key={item.id} pressRef={node=>{if(node)rows.current.set(item.id,node);else rows.current.delete(item.id);}} title={item.title} description={<>{item.actionable&&<Bell size={11}/>}<span>{item.summary}</span></>} lead={{icon:<span className="inbox-holder-mark" style={{'--inbox-project':projectColorFor?projectColorFor(item.projectId):projectColor({kind:'local'},item.projectId)} as CSSProperties}>{item.state==='failed'?<TriangleAlert size={13}/>:item.state==='completed'||item.state==='resolved'?<Check size={13}/>:<Bot size={13}/>}</span>,label:sourceLabels[item.kind]}} meta={<time dateTime={item.updatedAt}>{age(item.updatedAt)}</time>} unread={!item.read} current={chosen===item.id} muted={item.state==='completed'||item.state==='resolved'} label={`${item.title}, ${labels[item.state]}${!item.read?', unread':''}`} onPress={()=>choose(item,true)}/>)}
  </InboxList>
  <InboxPane title={selected?.title} hidden={columns==='list'} toolbar={toolbar} paneRef={reader} footer={footer} empty={<div className="agent-inbox-empty"><Inbox size={29}/><h3>Select an item</h3><p>Read it here, then open its conversation when needed.</p></div>}>
   {selected&&<div className="inbox-canonical-message"><div className="inbox-message-meta"><span data-state={selected.state}>{labels[selected.state]}</span><time dateTime={selected.updatedAt}>{formatLocalDateTime(selected.updatedAt,timeFormat,undefined,{dateStyle:'medium',timeStyle:'short'})}</time></div><p>{selected.summary}</p></div>}
  </InboxPane>
  {(attention.error||actionError)&&<p className="agent-inbox-error" role="status">{actionError||attention.error}</p>}
 </section>;
}
