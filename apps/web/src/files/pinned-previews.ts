import type {FilesEntry} from './FilesView.tsx';

export const PIN_LIMIT=6;
export interface PreviewSlots{pins:FilesEntry[];transient:FilesEntry|null;activePath:string|null}
export const emptySlots=():PreviewSlots=>({pins:[],transient:null,activePath:null});
const isPinned=(state:PreviewSlots,path:string)=>state.pins.some(entry=>entry.path===path);

export type SlotTransition=
 |{kind:'open';entry:FilesEntry}
 |{kind:'pin';entry:FilesEntry}
 |{kind:'unpin';path:string}
 |{kind:'close';path:string}
 |{kind:'directory'}
 |{kind:'reset'};
export interface SlotResult{state:PreviewSlots;refresh:boolean;capped:boolean;focus:{kind:'select';index:number}|{kind:'empty'}|null}
const unchanged=(state:PreviewSlots):SlotResult=>({state,refresh:false,capped:false,focus:null});

/** Deterministic slot transitions; pure state, no reads or side effects. */
export function transitionSlots(state:PreviewSlots,transition:SlotTransition):SlotResult{
 switch(transition.kind){
  case'open':{
   if(transition.entry.path===state.activePath)return{state,refresh:true,capped:false,focus:null};
   if(isPinned(state,transition.entry.path))return{state:{...state,activePath:transition.entry.path},refresh:true,capped:false,focus:null};
   return{state:{...state,transient:transition.entry,activePath:transition.entry.path},refresh:true,capped:false,focus:null};
  }
  case'pin':{
   const entry=transition.entry;
   if(state.activePath!==entry.path||isPinned(state,entry.path))return unchanged(state);
   if(state.pins.length>=PIN_LIMIT)return{state,refresh:false,capped:true,focus:null};
   return{state:{pins:[...state.pins,entry],transient:state.transient?.path===entry.path?null:state.transient,activePath:state.activePath},refresh:false,capped:false,focus:null};
  }
  case'unpin':{
   const index=state.pins.findIndex(entry=>entry.path===transition.path);
   if(index<0)return unchanged(state);
   const removed=state.pins[index]!,pins=state.pins.filter(entry=>entry.path!==transition.path);
   if(state.activePath===transition.path)return{state:{pins,transient:removed,activePath:removed.path},refresh:true,capped:false,focus:null};
   return{state:{...state,pins},refresh:false,capped:false,focus:null};
  }
  case'close':{
   const items=slotItems(state),index=items.findIndex(item=>item.entry.path===transition.path);
   if(index<0)return unchanged(state);
   const item=items[index]!;
   const pins=item.pinned?state.pins.filter(entry=>entry.path!==transition.path):state.pins;
   const transient=item.pinned?state.transient:null;
   const after=slotItems({pins,transient,activePath:state.activePath});
   if(state.activePath!==transition.path){
    const focus=after.length?{kind:'select'as const,index:Math.min(index,after.length-1)}:{kind:'empty'as const};
    return{state:{pins,transient,activePath:state.activePath},refresh:false,capped:false,focus};
   }
   let activePath:string|null=null;
   if(item.pinned)activePath=pins[index]?.path??pins[index-1]?.path??transient?.path??null;
   else activePath=pins.at(-1)?.path??null;
   const focus=activePath?{kind:'select'as const,index:after.findIndex(entry=>entry.entry.path===activePath)}:{kind:'empty'as const};
   return{state:{pins,transient,activePath},refresh:activePath!==null,capped:false,focus};
  }
  case'directory':return{state:{pins:state.pins,transient:null,activePath:null},refresh:false,capped:false,focus:null};
  case'reset':return{state:emptySlots(),refresh:false,capped:false,focus:null};
 }
}
export function slotItems(state:PreviewSlots):{entry:FilesEntry;pinned:boolean}[]{
 const items=state.pins.map(entry=>({entry,pinned:true}));
 if(state.transient)items.push({entry:state.transient,pinned:false});
 return items;
}
const parentPath=(path:string)=>{const cut=path.lastIndexOf('/');return cut<0?'.':path.slice(0,cut)||'/';};

/** Unique visible labels: duplicate basenames among slots gain ` · parent`. */
export function slotLabels(state:PreviewSlots):Map<string,{primary:string;parent:string|null;full:string}>{
 const items=slotItems(state),seen=new Map<string,number>();
 for(const item of items)seen.set(item.entry.name,(seen.get(item.entry.name)??0)+1);
 const labels=new Map<string,{primary:string;parent:string|null;full:string}>();
 for(const item of items){
  const entry=item.entry,duplicated=(seen.get(entry.name)??0)>1,parent=duplicated?parentPath(entry.path):null;
  labels.set(entry.path,{primary:entry.name,parent,full:parent?entry.name+' · '+parent:entry.name});
 }
 return labels;
}
