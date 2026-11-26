import {afterAll,beforeAll,describe,expect,it} from 'vitest';
import {build} from 'esbuild';
import {chromium,type Browser} from '@playwright/test';
const fixture=`
import React,{Suspense,startTransition,useState} from 'react';import {createRoot} from 'react-dom/client';import {useFilesRead} from './apps/web/src/files/useFilesRead';
const never=new Promise(()=>{});const read=()=>new Promise((resolve,reject)=>{window.acceptA=()=>resolve('accepted A');window.rejectA=()=>reject(Error('A read failed'));});
function Reader({owner}){const state=useFilesRead(owner,true,read);if(owner==='B'){window.bRendered=true;throw never;}return <div><span data-testid="value">{state.value||''}</span><span data-testid="error">{state.error}</span><span data-testid="pending">{String(state.pending)}</span></div>;}
function App(){const[owner,setOwner]=useState('A');window.startB=()=>startTransition(()=>setOwner('B'));return <Suspense fallback="fallback"><Reader owner={owner}/></Suspense>;}
createRoot(document.getElementById('root')).render(<App/>);
`;
describe('file read committed ownership',()=>{
 let browser:Browser,script:string;
 beforeAll(async()=>{script=(await build({stdin:{contents:fixture,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'}})).outputFiles[0]!.text;browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});});
 afterAll(async()=>{await browser?.close();});
 for(const outcome of ['success','error'] as const)it(`keeps A's ${outcome} when B renders but never commits`,async()=>{const page=await browser.newPage();try{await page.setContent('<div id="root"></div>');await page.addScriptTag({content:script});await expect.poll(()=>page.evaluate(()=>typeof (window as any).acceptA)).toBe('function');await page.evaluate(()=>(window as any).startB());await expect.poll(()=>page.evaluate(()=>Boolean((window as any).bRendered))).toBe(true);await page.evaluate(outcome=>outcome==='success'?(window as any).acceptA():(window as any).rejectA(),outcome);await expect.poll(()=>page.getByTestId(outcome==='success'?'value':'error').textContent()).toBe(outcome==='success'?'accepted A':'A read failed');expect(await page.getByTestId('pending').textContent()).toBe('false');}finally{await page.close();}});
});

const bindingFixture = `
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ProjectFiles} from './apps/web/src/files/ProjectFiles';
const entries=['a.txt','b.txt'].map(name=>({name,path:name,kind:'file'}));
const state={files:[],folders:[],holdFolders:false,bindingId:'binding-A'};window.bindingFixture=state;
window.fetch=(input,options={})=>{
 const url=new URL(String(input),'http://fixture');
 if(url.pathname.endsWith('/files')){
  if(!state.holdFolders)return Promise.resolve(Response.json({entries,bindingId:state.bindingId}));
  return new Promise(resolve=>state.folders.push({resolve,signal:options.signal}));
 }
 if(url.pathname.endsWith('/file'))return new Promise(resolve=>state.files.push({path:url.searchParams.get('path'),resolve,signal:options.signal,settled:false}));
 return Promise.resolve(Response.json({csrfToken:'fixture'}));
};
state.acceptFile=(path,text,bindingId='binding-A')=>{
 const request=state.files.find(request=>request.path===path&&!request.settled);
 if(!request)throw Error('No held file '+path);request.settled=true;
 request.resolve(Response.json({text,binary:false,sha256:'a'.repeat(64),bindingId}));
};
state.rejectFile=(path,code)=>{const request=state.files.find(request=>request.path===path&&!request.settled);if(!request)throw Error('No held file '+path);request.settled=true;request.resolve(Response.json({error:{code,message:code==='FILES_BINDING_CHANGED'?'Checkout changed. Retry folder.':'File denied. Retry file.'}},{status:409}));};
state.acceptFolders=(bindingId)=>{state.bindingId=bindingId;state.holdFolders=false;for(const request of state.folders.splice(0))request.resolve(Response.json({entries,bindingId}));};
function App(){const[active,setActive]=useState(true);state.setActive=setActive;return <main data-active={active}><ProjectFiles base="/api/projects/project-one" query="threadId=thread-one" active={active} fallback={<p>Disconnected</p>}/></main>;}
createRoot(document.getElementById('root')).render(<App/>);
`;

describe('pinned preview binding accepts only the current read',()=>{
 let browser:Browser,script:string;
 beforeAll(async()=>{
  script=(await build({stdin:{contents:bindingFixture,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'}})).outputFiles[0]!.text;
  browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});
 });
 afterAll(async()=>{await browser?.close();});
 async function open(){const page=await browser.newPage();await page.setContent('<div id="root"></div>');await page.addScriptTag({content:script});await page.getByRole('button',{name:'a.txt',exact:true}).waitFor();return page;}
 async function settled(page:import('@playwright/test').Page){await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));}
 it('ignores a cancelled file response before it can reset the accepted binding and pins',async()=>{
  const page=await open();try{
   await page.getByRole('button',{name:'a.txt',exact:true}).click();
   await expect.poll(()=>page.evaluate(()=>(window as any).bindingFixture.files.length)).toBe(1);
   await page.getByRole('button',{name:'b.txt',exact:true}).click();
   await expect.poll(()=>page.evaluate(()=>(window as any).bindingFixture.files.length)).toBe(2);
   await page.evaluate(()=>(window as any).bindingFixture.acceptFile('b.txt','accepted B'));
   await page.getByText('accepted B',{exact:true}).waitFor();
   await page.getByRole('button',{name:'Pin b.txt',exact:true}).click();
   expect(await page.evaluate(()=>(window as any).bindingFixture.files[0].signal.aborted)).toBe(true);
   await page.evaluate(()=>(window as any).bindingFixture.acceptFile('a.txt','obsolete A','obsolete-binding'));
   await settled(page);
   expect(await page.getByText('accepted B',{exact:true}).count()).toBe(1);
   expect(await page.getByRole('button',{name:'Open b.txt, pinned',exact:true}).count()).toBe(1);
  }finally{await page.close();}
 });
 for(const binding of ['binding-A','binding-B'])it(`revalidates the folder before resuming a pinned preview (${binding})`,async()=>{
  const page=await open();try{
   await page.getByRole('button',{name:'a.txt',exact:true}).click();
   await expect.poll(()=>page.evaluate(()=>(window as any).bindingFixture.files.length)).toBe(1);
   await page.evaluate(()=>(window as any).bindingFixture.acceptFile('a.txt','accepted A'));
   await page.getByText('accepted A',{exact:true}).waitFor();
   await page.getByRole('button',{name:'Pin a.txt',exact:true}).click();
   await page.evaluate(()=>(window as any).bindingFixture.setActive(false));
   await expect.poll(()=>page.locator('main').getAttribute('data-active')).toBe('false');
   await page.evaluate(()=>{(window as any).bindingFixture.holdFolders=true;(window as any).bindingFixture.setActive(true);});
   await expect.poll(()=>page.evaluate(()=>(window as any).bindingFixture.folders.length)).toBe(1);
   await settled(page);
   expect(await page.evaluate(()=>(window as any).bindingFixture.files.length)).toBe(1);
   expect(await page.getByText('accepted A',{exact:true}).count()).toBe(0);
   await page.evaluate(binding=>(window as any).bindingFixture.acceptFolders(binding),binding);
   if(binding==='binding-A'){
    await expect.poll(()=>page.evaluate(()=>(window as any).bindingFixture.files.length)).toBe(2);
    await page.evaluate(()=>(window as any).bindingFixture.acceptFile('a.txt','fresh A'));
    await page.getByText('fresh A',{exact:true}).waitFor();
    expect(await page.getByRole('button',{name:'Open a.txt, pinned',exact:true}).count()).toBe(1);
   }else{
    await settled(page);
    expect(await page.evaluate(()=>(window as any).bindingFixture.files.length)).toBe(1);
    expect(await page.getByRole('button',{name:'Open a.txt, pinned',exact:true}).count()).toBe(0);
    expect(await page.getByText('accepted A',{exact:true}).count()).toBe(0);
   }
  }finally{await page.close();}
 });

 for(const code of ['FILES_BINDING_CHANGED','CAPABILITY_DENIED','NOT_FOUND'])it(`handles an owned refresh ${code} without confusing file denial with binding loss`,async()=>{
  const page=await open();try{
   await page.getByRole('button',{name:'a.txt',exact:true}).click();
   await expect.poll(()=>page.evaluate(()=>(window as any).bindingFixture.files.length)).toBe(1);
   await page.evaluate(()=>(window as any).bindingFixture.acceptFile('a.txt','accepted A'));
   await page.getByText('accepted A',{exact:true}).waitFor();
   await page.getByRole('button',{name:'Pin a.txt',exact:true}).click();
   await page.getByRole('button',{name:'Refresh',exact:true}).click();
   await expect.poll(()=>page.evaluate(()=>(window as any).bindingFixture.files.length)).toBe(2);
   await page.evaluate(code=>(window as any).bindingFixture.rejectFile('a.txt',code),code);
   await settled(page);
   if(code==='FILES_BINDING_CHANGED'){
    expect(await page.getByText('accepted A',{exact:true}).count()).toBe(0);
    expect(await page.getByRole('button',{name:'Open a.txt, pinned',exact:true}).count()).toBe(0);
    expect(await page.getByText('Checkout changed. Retry folder.',{exact:true}).count()).toBe(1);
   }else expect(await page.getByRole('button',{name:'Open a.txt, pinned',exact:true}).count()).toBe(1);
   expect(await page.getByRole('button',{name:'Retry',exact:true}).count()).toBe(1);
   if(code==='FILES_BINDING_CHANGED'){
    await page.evaluate(()=>(window as any).bindingFixture.bindingId='binding-B');
    await page.getByRole('button',{name:'Retry',exact:true}).click();
    await page.getByRole('button',{name:'b.txt',exact:true}).waitFor();
    expect(await page.evaluate(()=>(window as any).bindingFixture.files.length)).toBe(2);
    await page.getByRole('button',{name:'b.txt',exact:true}).click();
    await expect.poll(()=>page.evaluate(()=>(window as any).bindingFixture.files.length)).toBe(3);
    await page.evaluate(()=>(window as any).bindingFixture.acceptFile('b.txt','new checkout B','binding-B'));
    await page.getByText('new checkout B',{exact:true}).waitFor();
    expect(await page.getByText('Checkout changed. Retry folder.',{exact:true}).count()).toBe(0);
   }
  }finally{await page.close();}
 });
 it('ignores a cancelled binding-loss error after a newer preview is accepted',async()=>{
  const page=await open();try{
   await page.getByRole('button',{name:'a.txt',exact:true}).click();
   await expect.poll(()=>page.evaluate(()=>(window as any).bindingFixture.files.length)).toBe(1);
   await page.getByRole('button',{name:'b.txt',exact:true}).click();
   await expect.poll(()=>page.evaluate(()=>(window as any).bindingFixture.files.length)).toBe(2);
   await page.evaluate(()=>(window as any).bindingFixture.acceptFile('b.txt','accepted B'));
   await page.getByText('accepted B',{exact:true}).waitFor();
   await page.getByRole('button',{name:'Pin b.txt',exact:true}).click();
   await page.evaluate(()=>(window as any).bindingFixture.rejectFile('a.txt','FILES_BINDING_CHANGED'));
   await settled(page);
   expect(await page.getByText('accepted B',{exact:true}).count()).toBe(1);
   expect(await page.getByRole('button',{name:'Open b.txt, pinned',exact:true}).count()).toBe(1);
   expect(await page.getByText('Checkout changed. Retry folder.',{exact:true}).count()).toBe(0);
  }finally{await page.close();}
 });
 it('removes scoped pins and retained bytes when an accepted refresh lacks binding metadata',async()=>{
  const page=await open();try{
   await page.getByRole('button',{name:'a.txt',exact:true}).click();
   await expect.poll(()=>page.evaluate(()=>(window as any).bindingFixture.files.length)).toBe(1);
   await page.evaluate(()=>(window as any).bindingFixture.acceptFile('a.txt','accepted A'));
   await page.getByText('accepted A',{exact:true}).waitFor();
   await page.getByRole('button',{name:'Pin a.txt',exact:true}).click();
   await page.evaluate(()=>(window as any).bindingFixture.holdFolders=true);
   await page.getByRole('button',{name:'Refresh',exact:true}).click();
   await expect.poll(()=>page.evaluate(()=>(window as any).bindingFixture.folders.length)).toBe(1);
   await page.evaluate(()=>(window as any).bindingFixture.acceptFolders(undefined));
   await settled(page);
   expect(await page.getByText('accepted A',{exact:true}).count()).toBe(0);
   expect(await page.getByRole('button',{name:'Open a.txt, pinned',exact:true}).count()).toBe(0);
   expect(await page.getByRole('button',{name:'Retry',exact:true}).count()).toBe(1);
  }finally{await page.close();}
 });
});
