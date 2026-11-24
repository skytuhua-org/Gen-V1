import {afterAll,beforeAll,describe,expect,it} from 'vitest';
import {build} from 'esbuild';
import {chromium,type Browser} from '@playwright/test';
// Issue #1980: widget checkpoint writes must stay bound to the state revision the
// editor observed when it emitted the draft. A delayed edit lease must not let an
// older draft relabel itself with the newer revision, an accepted receipt older
// than the mounted canonical state must not regress it, and the prop-update path
// must validate saved state with the same schema used at startup.
const fixture=`
import React,{useRef,useState} from 'react';import {createRoot} from 'react-dom/client';import {Widget} from './apps/web/src/Widget';
const stateSchema={type:'object',required:['count'],properties:{count:{type:'number'}},additionalProperties:false};
function App(){const[rev,setRev]=useState(1),[values,setValues]=useState({count:0}),[artRev,setArtRev]=useState(1);const handle=useRef(null);
window.acceptedCalls=window.acceptedCalls??[];window.pushState=(values,revision)=>{window.canonicalRev=revision;setValues(values);setRev(revision);};
window.setArtifactRev=(next)=>setArtRev(next);window.releaseLease=()=>handle.current?.releaseLease();
const artifact={id:'widget-a',threadId:'thread-a',stateId:'state-a',title:'Widget',revision:artRev,actions:{},widget:{html:'',stateSchemaVersion:1,inputSchema:{type:'object'},stateSchema,eventSchema:{type:'object'}}};
return <><span data-testid="rev">{rev}</span><Widget ref={handle} artifact={artifact} inputs={{}} values={values} stateRevision={rev} theme="light" onAction={async()=>{}} onAccepted={(values,revision)=>window.acceptedCalls.push([values,revision])} onDirty={()=>{}}/></>;}
createRoot(document.getElementById('root')).render(<App/>);
`;
const stubs:Record<string,string>={api:`export const widgetOrigin='https://widget.invalid';
export const getWidgetMount=async()=>{window.mountCalls=(window.mountCalls??0)+1;window.lastTicket={url:'https://widget.invalid/frame',token:'token',mountId:'mount-'+window.mountCalls,revision:window.artifactRevision??1};return window.lastTicket;};
export const command=async(type,payload)=>{window.cmdCalls=(window.cmdCalls??[]);window.cmdCalls.push({type,payload});
if(type==='edit.begin'){window.beginResolvers=(window.beginResolvers??[]);return new Promise(resolve=>{window.beginResolvers.push(resolve);});}
if(type==='edit.end'){return {result:{released:true}};}
if(type==='widget.checkpoint'){window.checkpointCalls=(window.checkpointCalls??[]);window.checkpointCalls.push(payload);
if(window.forceReceiptRevision!=null)return {result:{id:'state-a',threadId:'thread-a',schemaVersion:1,revision:window.forceReceiptRevision,values:payload.values}};
if(payload.baseStateRevision!==(window.canonicalRev??1))throw new Error('Checkpoint is stale');
const revision=++window.canonicalRev;return {result:{id:'state-a',threadId:'thread-a',schemaVersion:1,revision,values:payload.values}};}
return {result:{}};};`,controller:`export function createWidgetRuntime(){window.runtimeReady=true;return {post:message=>(window.posts??=[]).push(message),dispose:()=>{}};}`};
const initPage=async(browser:Browser,script:string)=>{
  const page=await browser.newPage();
  await page.setContent('<div id="root"></div>');
  await page.evaluate(()=>{if(!crypto.randomUUID)Object.defineProperty(crypto,'randomUUID',{value:()=>'synthetic-id'});window.canonicalRev=1;});
  await page.addScriptTag({content:script});
  await expect.poll(()=>page.evaluate(()=>Boolean(window.runtimeReady))).toBe(true);
  await page.evaluate(()=>{window.sendWidget=(type:string,payload:Record<string,unknown>)=>{const source=document.querySelector('iframe')!.contentWindow!;window.dispatchEvent(new MessageEvent('message',{source,data:{channel:'harness-widget',token:'token',mountId:'mount-1',artifactId:'widget-a',type,payload}}));};});
  await page.evaluate(()=>window.sendWidget('ready'));
  await expect.poll(()=>page.evaluate(()=>window.posts?.some((item)=>item.type==='init'))).toBe(true);
  return page;
};
describe('widget checkpoint revision binding (#1980)',()=>{
 let browser:Browser,script:string;
 beforeAll(async()=>{script=(await build({stdin:{contents:fixture,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'widget-fixture',setup(b){b.onResolve({filter:/^(\.\/api|\.\.\/\.\.\/\.\.\/packages\/widgets\/controller)$/},args=>({path:args.path==='./api'?'api':'controller',namespace:'stub'}));b.onLoad({filter:/.*/,namespace:'stub'},args=>({contents:stubs[args.path],loader:'js',resolveDir:process.cwd()}));}}]})).outputFiles[0]!.text;browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});});
 afterAll(async()=>{await browser?.close();});
 it('accepts an ordinary checkpoint and releases the lease',async()=>{const page=await initPage(browser,script);try{
   await page.evaluate(()=>window.sendWidget('checkpoint',{requestId:'r1',stateSchemaVersion:1,values:{count:7}}));
   await expect.poll(()=>page.evaluate(()=>window.beginResolvers?.length)).toBe(1);
   await page.evaluate(()=>window.beginResolvers[0]({result:{}}));
   await expect.poll(()=>page.evaluate(()=>window.checkpointCalls?.length)).toBe(1);
   expect(await page.evaluate(()=>window.checkpointCalls[0].baseStateRevision)).toBe(1);
   await expect.poll(()=>page.evaluate(()=>window.posts?.find((item)=>item.type==='checkpoint.ack')?.payload?.stateRevision)).toBe(2);
   await expect.poll(()=>page.evaluate(()=>window.acceptedCalls?.length)).toBe(1);
   await expect.poll(()=>page.evaluate(()=>window.cmdCalls?.some((c)=>c.type==='edit.end'))).toBe(true);
 }finally{await page.close();}});
 it('keeps the draft bound to the observed revision when a delayed lease resolves',async()=>{const page=await initPage(browser,script);try{
   await page.evaluate(()=>window.sendWidget('checkpoint',{requestId:'r1',stateSchemaVersion:1,values:{count:7}}));
   await expect.poll(()=>page.evaluate(()=>window.beginResolvers?.length)).toBe(1);
   // A newer canonical state is accepted elsewhere while this lease is pending.
   await page.evaluate(()=>window.pushState({count:9},5));
   await expect.poll(()=>page.getByTestId('rev').textContent()).toBe('5');
   await page.evaluate(()=>window.beginResolvers[0]({result:{}}));
   await expect.poll(()=>page.evaluate(()=>window.checkpointCalls?.length)).toBe(1);
   // The draft was authored against revision 1: the write must say so so the host
   // rejects it instead of silently relabeling the older values as revision 5+1.
   expect(await page.evaluate(()=>window.checkpointCalls[0].baseStateRevision)).toBe(1);
   await expect.poll(()=>page.evaluate(()=>window.posts?.some((item)=>item.type==='checkpoint.error'))).toBe(true);
   expect(await page.evaluate(()=>window.acceptedCalls?.length)).toBe(0);
   expect(await page.evaluate(()=>window.posts?.some((item)=>item.type==='checkpoint.ack'))).toBe(false);
 }finally{await page.close();}});
 it('does not regress mounted canonical state on a stale accepted receipt',async()=>{const page=await initPage(browser,script);try{
   await page.evaluate(()=>window.sendWidget('checkpoint',{requestId:'r1',stateSchemaVersion:1,values:{count:7}}));
   await expect.poll(()=>page.evaluate(()=>window.beginResolvers?.length)).toBe(1);
   await page.evaluate(()=>window.pushState({count:9},5));
   await expect.poll(()=>page.getByTestId('rev').textContent()).toBe('5');
   await page.evaluate(()=>{window.forceReceiptRevision=4;window.beginResolvers[0]({result:{}});});
   await expect.poll(()=>page.evaluate(()=>window.checkpointCalls?.length)).toBe(1);
   await expect.poll(()=>page.evaluate(()=>window.posts?.some((item)=>item.type==='checkpoint.ack'))).toBe(true);
   // The receipt (revision 4) is older than the mounted canonical state (5): the
   // accepted values must not be pushed back into the editor.
   expect(await page.evaluate(()=>window.acceptedCalls?.length)).toBe(0);
 }finally{await page.close();}});
 it('does not publish prop updates whose saved state fails the schema',async()=>{const page=await initPage(browser,script);try{
   await page.evaluate(()=>window.pushState({unexpected:true},2));
   await page.waitForTimeout(300);
   const inits=await page.evaluate(()=>window.posts?.filter((item)=>item.type==='init').map((item)=>item.state));
   // The last state published to the mounted widget must remain the valid one.
   expect(inits?.at(-1)).toEqual({count:0});
 }finally{await page.close();}});
 it('releases the lease on request and remounts on a new artifact revision',async()=>{const page=await initPage(browser,script);try{
   await page.evaluate(()=>window.sendWidget('dirty',{dirty:true}));
   await expect.poll(()=>page.evaluate(()=>window.beginResolvers?.length)).toBe(1);
   await page.evaluate(()=>window.beginResolvers[0]({result:{}}));
   await page.evaluate(()=>window.releaseLease());
   await expect.poll(()=>page.evaluate(()=>window.cmdCalls?.some((c)=>c.type==='edit.end'))).toBe(true);
   await page.evaluate(()=>{window.artifactRevision=2;window.setArtifactRev(2);});
   await expect.poll(()=>page.evaluate(()=>(window.mountCalls??0)>=2)).toBe(true);
   await page.evaluate(()=>{const source=document.querySelector('iframe')!.contentWindow!;window.dispatchEvent(new MessageEvent('message',{source,data:{channel:'harness-widget',token:'token',mountId:window.lastTicket.mountId,artifactId:'widget-a',type:'ready'}}));});
   await expect.poll(()=>page.evaluate(()=>window.posts?.filter((item)=>item.type==='init'&&item.mountId===window.lastTicket.mountId).length)).toBeGreaterThanOrEqual(1);
 }finally{await page.close();}});
});
