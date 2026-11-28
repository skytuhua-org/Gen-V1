import {afterAll,beforeAll,expect,it} from 'vitest';
import {build} from 'esbuild';
import {chromium,type Browser} from '@playwright/test';
import {createServer,type Server} from 'node:http';
import type {AddressInfo} from 'node:net';

let browser:Browser,server:Server,origin:string;
beforeAll(async()=>{
 const bundle=await build({stdin:{resolveDir:process.cwd(),loader:'tsx',contents:`
  import React,{useRef,useState} from 'react';import {createRoot} from 'react-dom/client';
  import {ShellSidebar} from './apps/web/src/ShellSidebar';
  import {DesktopProvider} from './apps/web/src/desktop-context';
  import {WorkspaceProvider} from './apps/web/src/workspace-context';
  import {DEFAULT_PREFERENCES} from './packages/contracts/preferences';
  const context={windowId:'main',surface:{kind:'main'},windows:[],update:{state:'idle',message:'Up to date'}};
  const bridge={onState:()=>()=>{},onCloseRequested:()=>()=>{},update:async()=>context.update};
  const threads=[
   {id:'t1',title:'Working item',projectId:'p',projectName:'P',status:'working',runId:'r1',createdAt:'2026-11-04T10:00:00Z',updatedAt:'2026-11-04T10:00:00Z'},
   {id:'t2',title:'Ready item',projectId:'p',projectName:'P',status:'ready',runId:null,createdAt:'2026-11-04T10:00:00Z',updatedAt:'2026-11-04T10:00:00Z'},
  ];
  function Fixture(){
   const elementRef=useRef(null),searchRef=useRef(null),[collapsed,setCollapsed]=useState(false);
   const layout={sidebarCollapsed:collapsed,sidebarWidth:248,rightPanelOpen:false,rightPanelWidth:520,rightPanelMaximized:false,activeTab:'artifact',openTabs:['artifact'],activeArtifactId:null,folded:{}};
   return <DesktopProvider bridge={bridge} context={context}><WorkspaceProvider value={{activeArtifactId:null,requestOpenArtifact:()=>{},closeArtifact:()=>{},rightPanelOpen:false,activeTab:'artifact',setActiveTab:()=>{}}}><div className="app-shell" data-theme="dark"><ShellSidebar elementRef={elementRef} searchRef={searchRef} mobile={false} open layout={layout} preferences={{...DEFAULT_PREFERENCES,showWorkingSection:true,panelAnimations:false}} matching={threads} selectedId="t1" loaded creating={false} search="" setSearch={()=>{}} close={()=>{}} toggleCollapsed={()=>setCollapsed(v=>!v)} setFolded={()=>{}} select={()=>{}} create={()=>{}} settings={()=>{}} presentation={async()=>true} rename={()=>{}} archive={()=>{}}/></div></WorkspaceProvider></DesktopProvider>;
  }
  createRoot(document.getElementById('root')).render(<Fixture/>);
 `},bundle:true,write:false,platform:'browser',format:'iife',define:{'process.env.NODE_ENV':'"production"'},loader:{'.css':'empty'}});
 server=createServer((request,response)=>{if(request.url==='/bundle.js'){response.setHeader('Content-Type','text/javascript');response.end(bundle.outputFiles[0]!.text);}else{response.setHeader('Content-Type','text/html');response.end('<!doctype html><div id="root"></div><script src="/bundle.js"></script>');}});
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));origin=`http://127.0.0.1:${(server.address() as AddressInfo).port}`;
 browser=await chromium.launch({headless:true});
});
afterAll(async()=>{await browser?.close();if(server)await new Promise<void>(resolve=>server.close(()=>resolve()));});

it('exposes the tri-state filter as a labeled cycle and announces changes',async()=>{
 const page=await browser.newPage();try{
  await page.goto(`${origin}/`);
  const filter=page.locator('button.sidebar-filter');
  await expect.poll(()=>filter.getAttribute('aria-pressed')).toBeNull();
  await expect.poll(()=>filter.getAttribute('aria-label')).toBe('Thread filter: all');
  await filter.click();
  await expect.poll(()=>filter.getAttribute('aria-label')).toBe('Thread filter: working');
  const status=page.locator('.sr-only[role="status"]');
  await expect.poll(()=>status.count()).toBe(1); // persistent region, mounted before any change
  expect(await status.getAttribute('aria-atomic')).toBe('true');
  expect(await status.innerText()).toBe('Showing working threads');
  await expect.poll(()=>page.locator('.sidebar-filter-chip').count()).toBe(1);
  await filter.click();
  await expect.poll(()=>filter.getAttribute('aria-label')).toBe('Thread filter: waiting');
  expect(await status.innerText()).toBe('No threads waiting for your input.');
  await expect.poll(()=>page.locator('.sidebar-empty').count()).toBe(1);
  await filter.click(); // clear back to 'all': the return is announced too
  await expect.poll(()=>filter.getAttribute('aria-label')).toBe('Thread filter: all');
  expect(await status.innerText()).toBe('Showing all threads');
 }finally{await page.close();}
});

it('wires the collapse control to the thread nav and announces the empty state',async()=>{
 const page=await browser.newPage();try{
  await page.goto(`${origin}/`);
  const close=page.locator('button.sidebar-close');
  expect(await close.getAttribute('aria-expanded')).toBe('true');
  expect(await close.getAttribute('aria-controls')).toBe('threads-nav');
  await expect.poll(()=>page.locator('nav#threads-nav').count()).toBe(1);
  expect(await page.locator('.sr-only[role="status"]').innerText()).toBe('Showing all threads');
 }finally{await page.close();}
});

it('clears the search with Escape or the clear button and announces match counts',async()=>{
 const bundle=await build({stdin:{resolveDir:process.cwd(),loader:'tsx',contents:`
  import React,{useRef,useState} from 'react';import {createRoot} from 'react-dom/client';
  import {ShellSidebar} from './apps/web/src/ShellSidebar';
  import {DesktopProvider} from './apps/web/src/desktop-context';
  import {WorkspaceProvider} from './apps/web/src/workspace-context';
  import {DEFAULT_PREFERENCES} from './packages/contracts/preferences';
  const context={windowId:'main',surface:{kind:'main'},windows:[],update:{state:'idle',message:'Up to date'}};
  const bridge={onState:()=>()=>{},onCloseRequested:()=>()=>{},update:async()=>context.update};
  const threads=[
   {id:'t1',title:'Working item',projectId:'p',projectName:'P',status:'working',runId:'r1',createdAt:'2026-11-04T10:00:00Z',updatedAt:'2026-11-04T10:00:00Z'},
   {id:'t2',title:'Ready item',projectId:'p',projectName:'P',status:'ready',runId:null,createdAt:'2026-11-04T10:00:00Z',updatedAt:'2026-11-04T10:00:00Z'},
  ];
  function Fixture(){
   const elementRef=useRef(null),searchRef=useRef(null),[collapsed,setCollapsed]=useState(false),[search,setSearch]=useState('');
   const layout={sidebarCollapsed:collapsed,sidebarWidth:248,rightPanelOpen:false,rightPanelWidth:520,rightPanelMaximized:false,activeTab:'artifact',openTabs:['artifact'],activeArtifactId:null,folded:{}};
   const matching=threads.filter(t=>t.title.toLowerCase().includes(search.trim().toLowerCase()));
   return <DesktopProvider bridge={bridge} context={context}><WorkspaceProvider value={{activeArtifactId:null,requestOpenArtifact:()=>{},closeArtifact:()=>{},rightPanelOpen:false,activeTab:'artifact',setActiveTab:()=>{}}}><div className="app-shell" data-theme="dark"><ShellSidebar elementRef={elementRef} searchRef={searchRef} mobile={false} open layout={layout} preferences={{...DEFAULT_PREFERENCES,showWorkingSection:true,panelAnimations:false}} matching={matching} selectedId="t1" loaded creating={false} search={search} setSearch={setSearch} close={()=>{}} toggleCollapsed={()=>setCollapsed(v=>!v)} setFolded={()=>{}} select={()=>{}} create={()=>{}} settings={()=>{}} presentation={async()=>true} rename={()=>{}} archive={()=>{}}/></div></WorkspaceProvider></DesktopProvider>;
  }
  createRoot(document.getElementById('root')).render(<Fixture/>);
 `},bundle:true,write:false,platform:'browser',format:'iife',define:{'process.env.NODE_ENV':'"production"'},loader:{'.css':'empty'}});
 const page=await browser.newPage();try{
  await page.route('**/bundle.js',route=>route.fulfill({contentType:'text/javascript',body:bundle.outputFiles[0]!.text}));
  await page.goto(`${origin}/`);
  const input=page.locator('input[aria-label="Search threads"]');
  const clear=page.locator('button.sidebar-search-clear');
  const status=page.locator('.sr-only[role="status"]');
  await input.click();
  await input.pressSequentially('work');
  // One row matches: the clear button appears and the count is announced.
  await expect.poll(()=>clear.count()).toBe(1);
  await expect.poll(()=>status.innerText()).toBe('1 matching thread');
  // Escape clears the query, keeps focus, hides the button.
  await input.press('Escape');
  await expect.poll(()=>clear.count()).toBe(0);
  expect(await input.inputValue()).toBe('');
  await expect.poll(()=>page.evaluate(()=>document.activeElement?.getAttribute('aria-label'))).toBe('Search threads');
  // A second Escape with an empty query blurs the input.
  await input.press('Escape');
  await expect.poll(()=>page.evaluate(()=>document.activeElement?.getAttribute('aria-label'))).not.toBe('Search threads');
  // Zero matches announce as such.
  await input.click();
  await input.pressSequentially('zzzz');
  await expect.poll(()=>status.innerText()).toBe('No matching threads.');
  // The clear button clears and refocuses.
  await clear.click();
  expect(await input.inputValue()).toBe('');
  await expect.poll(()=>page.evaluate(()=>document.activeElement?.getAttribute('aria-label'))).toBe('Search threads');
 }finally{await page.close();}
});
