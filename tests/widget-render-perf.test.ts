import {describe,expect,it} from 'vitest';
import {build} from 'esbuild';
import vm from 'node:vm';
import {performance} from 'node:perf_hooks';
// Issue #1962 T01/T02: bound repeated plug-in verification and widget snapshot
// work. This drives the REAL packages/widgets/worker.ts bundle: every ui.event
// triggers a whole-tree snapshot whose per-node and per-attribute validateRender
// calls rebuilt ~150-entry Set allowlists on every invocation.
const globals=(posts:unknown[],listeners:Map<string,(e:{data:unknown})=>void>)=>({
 postMessage:(m:unknown)=>posts.push(m),
 addEventListener:(t:string,f:(e:{data:unknown})=>void)=>listeners.set(t,f),
 setInterval:()=>0,setTimeout,clearTimeout,clearInterval:()=>{},
 performance,crypto,console,Object,Array,Map,WeakMap,Set,Number,String,RegExp,Promise,Error,JSON,Math,Proxy,Reflect,Symbol,BigInt,Boolean,Date,
});
async function boot(html:string){
 const code=(await build({entryPoints:['packages/widgets/worker.ts'],bundle:true,write:false,format:'iife',platform:'node'})).outputFiles[0]!.text;
 const posts:unknown[]=[],listeners=new Map<string,(e:{data:unknown})=>void>();
 const context=vm.createContext(globals(posts,listeners));
 vm.runInContext(code,context);
 expect(posts).toContainEqual({type:'ready'});
 const send=(data:unknown)=>listeners.get('message')!({data});
 send({type:'start',html,stateSchemaVersion:1});
 send({type:'init',inputs:{},state:{},theme:{},stateRevision:1});
 return {posts,send};
}
const markup=(rows:number)=>{let s='<div>';for(let i=0;i<rows;i++)s+=`<div class="row" title="t${i}" role="listitem"><span class="v" title="c${i}">cell ${i}</span></div>`;return s+'</div>';};
describe('widget render perf (#1962)',()=>{
 it('renders a large tree with bounded repeated snapshot work',async()=>{
  const {posts,send}=await boot(markup(150));
  const renders=()=>posts.filter(m=>(m as {type?:string}).type==='render').length;
  expect(renders()).toBe(1);
  // 20 ordinary update ticks (no DOM change): each pays a snapshot; dedupe keeps
  // render posts at 1. Measure total worker-side CPU for the 20 ticks.
  const t0=performance.now();
  for(let i=0;i<20;i++){await new Promise(r=>setTimeout(r,55));send({type:'ui.event',payload:{id:1,event:'keydown',key:'a'}});}
  const elapsed=performance.now()-t0-20*55;
  expect(renders()).toBe(1);
  console.log(`BASELINE 20 idle snapshots over 150-row tree: ~${elapsed.toFixed(0)}ms net`);
 },60000);
 it('keeps dropping a single invalid attribute while keeping valid ones',async()=>{
  const {posts}=await boot('<div id="a" onclick="x()" title="ok"><p>v</p></div>');
  const render=posts.find(m=>(m as {type?:string}).type==='render') as {payload:{tree:{tag:string;attrs:Record<string,string>}[]}};
  expect(render.payload.tree[0]!.attrs).toEqual({id:'a',title:'ok'});
 },20000);
});
