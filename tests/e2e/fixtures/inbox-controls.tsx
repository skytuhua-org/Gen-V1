import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {InboxView} from '../../../apps/web/src/InboxView';
import {useAttention} from '../../../apps/web/src/useAttention';
import type {AttentionItem} from '../../../packages/contracts/attention';
import '../../../apps/web/src/styles.css';

type Mode = 'success' | 'reject' | 'throw' | 'source-error';
type Call = {type: 'refresh' | 'read' | 'unread' | 'open'; id?: string};
declare global {interface Window {inboxControls: {calls: Call[]; items: AttentionItem[]; refreshMode: Mode; readMode: Mode; openMode: Mode; unreadMode?: Mode; holdRead?: Promise<void>; rejectReadId?: string; holdUnread?: Promise<void>; holdRefresh?: Promise<void>; holdOpen?: Promise<void>; arrive?(): void; remove?(...ids:string[]): void; hideInbox?(hidden:boolean): void}}}
window.inboxControls = {calls: [], items: [], refreshMode: 'success', readMode: 'success', openMode: 'success'};
const initial: AttentionItem[] = [
  {id: 'question', threadId: 'thread-question', kind: 'request', title: 'Question', summary: 'Choose the destination in the canonical conversation.', state: 'needs-input', read: false, actionable: true},
  {id: 'review', threadId: 'thread-review', kind: 'operation', title: 'Review', summary: 'The change awaits canonical review.', state: 'needs-review', read: true, actionable: true},
  {id: 'failed', threadId: 'thread-failed', kind: 'thread-failed', title: 'Failed task', summary: 'Inspect the reported failure.', state: 'failed', read: false, actionable: false},
  {id: 'completed', threadId: 'thread-completed', kind: 'thread-completed', title: 'Completed task', summary: 'Read the supplied result.', state: 'completed', read: false, actionable: false},
  {id: 'resolved', threadId: 'thread-resolved', kind: 'request', title: 'Resolved question', summary: 'The request is already resolved.', state: 'resolved', read: true, actionable: false},
].map(item => ({...item, createdAt: '2026-11-06T12:00:00Z', updatedAt: '2026-11-06T12:00:00Z', popupDismissed: false, notificationKey: item.id + ':' + item.state, destination: {threadId: item.threadId}} as AttentionItem));

function Fixture() {
  const [items, setItems] = useState(()=>{
    const params=new URLSearchParams(location.search);
    if(params.has('empty'))return [];
    if(!params.has('long'))return initial;
    if(params.get('long')==='1000')return [...initial,...Array.from({length:995},(_,index)=>({...initial[1],id:'seed-'+index,title:'Result '+index,read:index!==994}))];
    return [...initial,...Array.from({length:35},(_,index)=>({...initial[1],id:'extra-'+index,title:'Extra item '+index}))];
  }), [error, setError] = useState('');
  const [hidden,setHidden]=useState(false);
  window.inboxControls.hideInbox=setHidden;
  window.inboxControls.items = items;
  window.inboxControls.remove = (...ids) => setItems(current => current.filter(item => !ids.includes(item.id)));
  window.inboxControls.arrive = () => setItems(current => [
    {...initial[3], id:'new-arrival', title:'New result', notificationKey:'new-arrival:completed'},
    ...current,
  ]);
  const result = (mode: Mode, message: string, succeed: () => void) => {
    if (mode === 'throw') throw Error(message);
    if (mode === 'reject') return Promise.reject(Error(message));
    succeed(); return Promise.resolve();
  };
  const change = (id: string, read: boolean) => {
    window.inboxControls.calls.push({type: read ? 'read' : 'unread', id});
    const mode=read?(window.inboxControls.rejectReadId===id?'reject':window.inboxControls.readMode):window.inboxControls.unreadMode??'success';
    const apply = () => result(mode, read?'Read state could not save.':'Unread state could not save.', () => setItems(current => current.map(item => item.id === id ? {...item, read} : item)));
    const hold=read?window.inboxControls.holdRead:window.inboxControls.holdUnread;return hold?hold.then(apply):apply();
  };
  return <main><input aria-label="Outside Inbox" /><p>Synthetic source fixture · no live host or approval authority</p><div className="fixture-inbox" hidden={hidden}><InboxView projectColorFor={() => undefined}
    attention={{items, unread: items.filter(item => !item.read).length, error,
      refresh: () => {
        window.inboxControls.calls.push({type: 'refresh'});
        const mode=window.inboxControls.refreshMode;const apply=()=>result(mode, 'Refresh failed.', () => {
          if (mode === 'source-error') {setError('Inbox could not load.');}
          else {setError(''); setItems(current => current.map(item => ({...item, summary: item.summary + ' Refreshed.'})));}
        });
        const request=window.inboxControls.holdRefresh?window.inboxControls.holdRefresh.then(apply):apply();
        return request.then(()=>{if(mode==='source-error')throw Error('Inbox could not load.');});
      }, markRead: id => change(id, true), markUnread: id => change(id, false)}}
    onOpenThread={id => {window.inboxControls.calls.push({type: 'open', id}); const mode=window.inboxControls.openMode,apply=()=>result(mode, 'Navigation failed.', () => {});return window.inboxControls.holdOpen?window.inboxControls.holdOpen.then(apply):apply();}}/>
  </div></main>;
}
function NetworkInbox(){
  const attention=useAttention();
  return <main><div className="fixture-inbox"><InboxView attention={attention} onOpenThread={()=>{}}/></div></main>;
}
createRoot(document.getElementById('root')!).render(new URLSearchParams(location.search).has('network')?<NetworkInbox/>:<Fixture/>);
