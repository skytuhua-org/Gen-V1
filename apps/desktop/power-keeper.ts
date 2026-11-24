import type {DesktopPowerState} from '../../packages/desktop-contract/index.ts';

export interface PowerBlockerApi {start(type:'prevent-app-suspension'):number;isStarted(id:number):boolean;stop(id:number):void}
export interface PowerActivityRead {tasks:number;schedules:number;keepAwakeTasks:boolean;keepAwakeSchedules:boolean}
export interface PowerKeeperOptions {api:PowerBlockerApi;read:()=>Promise<PowerActivityRead>;onChange?:(state:DesktopPowerState)=>void;pollMs?:number;debounceMs?:number}
export interface PowerKeeper {schedule():void;release():void;dispose():void;state():DesktopPowerState}

/** Serialized reconciliation between host activity reads and one
 * `prevent-app-suspension` blocker. A dirty flag collapses bursts and a
 * generation fence prevents released reads from reclaiming the blocker. */
export function createPowerKeeper(options:PowerKeeperOptions):PowerKeeper {
 const {api,read,onChange}=options,pollMs=options.pollMs??30_000,debounceMs=options.debounceMs??500;
 let dirty=true,inflight=false,disposed=false,blockerId:number|undefined,consecutiveFailures=0,generation=0;
 let current:DesktopPowerState={state:'off'},debounce:ReturnType<typeof setTimeout>|undefined,poll:ReturnType<typeof setInterval>|undefined;
 function publish(next:DesktopPowerState){if(current.state===next.state&&current.reason===next.reason)return;current=next;try{onChange?.(next);}catch{}}
 function drop(){if(blockerId!==undefined){const id=blockerId;blockerId=undefined;try{api.stop(id);}catch{}}}
 async function reconcile(){
  const observedGeneration=generation;
  let activity:PowerActivityRead;
  try{activity=await read();if(disposed||observedGeneration!==generation)return;consecutiveFailures=0;}
  catch{if(disposed||observedGeneration!==generation)return;consecutiveFailures++;if(consecutiveFailures>=2){drop();publish({state:'unavailable'});}return;}
  const tasks=activity.keepAwakeTasks&&activity.tasks>0,schedules=activity.keepAwakeSchedules&&activity.schedules>0,want=tasks||schedules;
  if(!want){drop();publish({state:activity.tasks>0||activity.schedules>0?'idle':'off'});return;}
  if(blockerId===undefined||!safeStarted()){
   drop();
   try{blockerId=api.start('prevent-app-suspension');}
   catch{drop();publish({state:'unavailable'});return;}
   if(!safeStarted()){drop();publish({state:'unavailable'});return;}
  }
  const reason=tasks&&schedules?'both':tasks?'tasks':'schedules';
  publish({state:'holding',reason});
 }
 function safeStarted(){try{return blockerId!==undefined&&api.isStarted(blockerId);}catch{return false;}}
 async function drain(){if(inflight)return;inflight=true;try{while(dirty&&!disposed){dirty=false;await reconcile();}}finally{inflight=false;}}
 function schedule(){if(disposed)return;dirty=true;clearTimeout(debounce);debounce=setTimeout(()=>void drain(),debounceMs);}
 function release(){generation++;dirty=false;consecutiveFailures=0;clearTimeout(debounce);drop();publish({state:'off'});}
 function dispose(){disposed=true;if(poll)clearInterval(poll);release();}
 poll=setInterval(schedule,pollMs);
 schedule();
 return{schedule,release,dispose,state:()=>current};
}
