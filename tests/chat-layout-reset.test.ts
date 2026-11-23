import {afterEach,describe,expect,it,vi} from 'vitest';
import {CHAT_LAYOUT_RESET_EVENT,readChatLayout,resetChatLayout,writeChatLayout} from '../packages/ui-shell/chat-layout';
import {defaultPlacementRecord,isDefaultPlacement} from '../apps/web/src/conversation-placement';

const map=()=>{const m=new Map<string,string>();return {getItem:(k:string)=>m.get(k)??null,setItem:(k:string,v:string)=>{m.set(k,v);},store:m};};
const layout=(overrides:Partial<ReturnType<typeof base>>={})=>({...base(),...overrides});
const base=()=>({version:2 as const,id:'ws',revision:3,undoDepth:0,redoDepth:0,root:{kind:'pane' as const,paneId:'pane-main'},panes:{'pane-main':{id:'pane-main',activeViewId:'v1',viewIds:['v1','v2'],collapsed:false}},views:{v1:{id:'v1',kind:'thread' as const,binding:{authority:{kind:'local' as const},threadId:'t1'}},v2:{id:'v2',kind:'workspace' as const,binding:{authority:{kind:'local' as const},resourceId:'x'}}},parkedViewIds:[],focusedPaneId:'pane-main'});

describe('resetChatLayout',()=>{
 afterEach(()=>vi.restoreAllMocks());
 it('writes the pristine centered record, dropping saved rects',()=>{
  const s=map();
  writeChatLayout({mode:'popup',detached:true,popup:{x:10,y:20,width:300,height:400}},s);
  resetChatLayout(s);
  expect(JSON.parse(s.store.get('harness:chat-view:v1')??'')).toEqual({mode:'full',detached:false});
  expect(readChatLayout(s)).toEqual({mode:'full',detached:false});
 });
 it('notifies the document so a mounted ChatView restores',()=>{
  const seen=vi.fn();vi.stubGlobal('dispatchEvent',seen);
  resetChatLayout(map());
  expect(seen).toHaveBeenCalledTimes(1);
  expect(seen.mock.calls[0]![0]).toMatchObject({type:CHAT_LAYOUT_RESET_EVENT});
 });
 it('still persists when storage is unavailable',()=>{
  expect(()=>resetChatLayout(undefined)).not.toThrow();
 });
});

describe('placement reset record',()=>{
 it('is default when there is no record and stays default after a reset write',()=>{
  const l=layout();
  expect(isDefaultPlacement(null,l)).toBe(true);
  expect(isDefaultPlacement(defaultPlacementRecord(l),l)).toBe(true);
 });
 it('clears floating overrides and a custom main pane, keeping the main selection',()=>{
  const l=layout(),record=defaultPlacementRecord(l,{version:1,workspaceId:'ws',mainPaneId:'pane-b',mainSelection:{kind:'thread',threadId:'t1'},floating:{f:{view:l.views.v1! as never,rect:{x:0,y:0,width:100,height:100}}},mainBasis:{paneId:'pane-b',activeViewId:null,viewIds:[],revision:3}});
  expect(record).toMatchObject({mainPaneId:'pane-main',mainSelection:{kind:'thread',threadId:'t1'},floating:{},mainBasis:{paneId:'pane-main',activeViewId:'v1',viewIds:['v1','v2'],revision:3}});
  expect(record.pending).toBeUndefined();
 });
 it('detects non-default placement for the disabled state',()=>{
  const l=layout();
  const floating={f:{view:l.views.v1! as never,rect:{x:0,y:0,width:100,height:100}}};
  expect(isDefaultPlacement({...defaultPlacementRecord(l),floating},l)).toBe(false);
  expect(isDefaultPlacement({...defaultPlacementRecord(l),mainPaneId:'pane-other'},l)).toBe(false);
 });
});
