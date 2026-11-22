import type {DesktopBrowserFindState} from '../../packages/desktop-contract/index.ts';

export interface BrowserFindResult {matches:number;activeMatchOrdinal:number;finalUpdate:boolean}
export interface BrowserFindNative {
 findInPage(text:string,options:{findNext:boolean;forward:boolean}):number;
 stopFindInPage(action:'clearSelection'|'keepSelection'):void;
}
export interface BrowserFindController {
 readonly state:DesktopBrowserFindState;
 open():void;
 query(text:string):void;
 next():void;
 previous():void;
 close():void;
 found(requestId:number,result:BrowserFindResult):void;
 /** Navigation, custody handoff, owner loss or renderer crash: drop everything. */
 reset():void;
}

const closed:DesktopBrowserFindState={open:false,openRequest:0,query:'',ordinal:0,matches:0,searching:false};

/** One Find session per BrowserRecord. Results are fenced by the Electron
 * request id; `revision` invalidates every earlier in-flight query, and the
 * caller resets the controller on document/owner epoch changes so stale
 * results can never reapply to a different page or custody. */
export function createBrowserFind(native:BrowserFindNative,alive:()=>boolean,emit:(state:DesktopBrowserFindState)=>void):BrowserFindController {
 let state:DesktopBrowserFindState={...closed},revision=0,requestId=-1,highlighted=false;
 const apply=(next:Partial<DesktopBrowserFindState>)=>{state={...state,...next};emit(state);};
 const stop=(action:'clearSelection'|'keepSelection')=>{if(!highlighted)return;highlighted=false;if(alive())try{native.stopFindInPage(action);}catch{}};
 const search=(forward:boolean,findNext:boolean)=>{
  if(!alive())return;
  const fence=++revision;
  apply({searching:true,error:undefined,open:true});
  try{
   requestId=native.findInPage(state.query,{findNext,forward});
   if(fence!==revision)requestId=-1;
  }catch(cause){
   if(fence!==revision)return;
   requestId=-1;
   apply({searching:false,error:cause instanceof Error?cause.message.slice(0,300):'Find failed'});
  }
 };
 return {
  get state(){return state;},
  open(){if(!state.open||state.openRequest===0)apply({open:true,openRequest:state.openRequest+1});else apply({openRequest:state.openRequest+1});},
  query(text){
   if(!alive())return;
   const query=String(text);
   if(query===state.query&&state.open&&!state.error)return;
   if(!query){revision++;requestId=-1;stop('clearSelection');apply({query:'',ordinal:0,matches:0,searching:false,error:undefined,open:true});return;}
   apply({query,open:true});
   search(true,false);
  },
  next(){if(state.open&&state.query&&!state.error)search(true,true);},
  previous(){if(state.open&&state.query&&!state.error)search(false,true);},
  close(){if(!state.open)return;revision++;requestId=-1;stop('clearSelection');apply({open:false,ordinal:0,matches:0,searching:false,error:undefined});},
  found(id,result){
   if(!alive()||id!==requestId||requestId<0)return;
   highlighted=highlighted||result.matches>0;
   apply({ordinal:result.activeMatchOrdinal,matches:result.matches,searching:!result.finalUpdate});
  },
  reset(){
   revision++;requestId=-1;
   if(alive())try{if(highlighted){highlighted=false;native.stopFindInPage('clearSelection');}}catch{}
   if(state.open||state.query||state.ordinal||state.matches||state.searching||state.error){state={...closed,openRequest:state.openRequest};emit(state);}
  },
 };
}
export function closedBrowserFindState(openRequest=0):DesktopBrowserFindState{return {...closed,openRequest};}
