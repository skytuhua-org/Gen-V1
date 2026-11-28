import {afterAll,beforeAll,expect,it} from 'vitest';
import {build} from 'esbuild';
import {chromium,type Browser} from '@playwright/test';
import {createServer,type Server} from 'node:http';
import type {AddressInfo} from 'node:net';

let browser:Browser,server:Server,origin:string;
beforeAll(async()=>{
 const bundle=await build({stdin:{resolveDir:process.cwd(),loader:'tsx',contents:`
  import React,{useRef,useState} from 'react';import {createRoot} from 'react-dom/client';
  import {Modal} from './packages/ui-shell/Modal.tsx';
  const api=window;const kind=new URLSearchParams(location.search).get('kind');
  function App(){
   const [open,setOpen]=useState(kind!=='closed');
   const input=useRef(null),selected=useRef(false);
   api.openDialog=()=>{selected.current=false;setOpen(true);};
   if(kind==='rename')return <Modal open={open} title="Rename thread" initialFocusRef={input} onClose={()=>setOpen(false)}>
    <label>Thread name<input ref={el=>{input.current=el;if(el&&!selected.current){selected.current=true;el.select();}}} defaultValue="Explore the component catalog"/></label>
    <button>Save name</button>
   </Modal>;
   return <Modal open={open} title="Archive thread" onClose={()=>setOpen(false)}><p>Row title</p><button>Archive</button></Modal>;
  }
  const root=createRoot(document.getElementById('root'));root.render(<App/>);
 `},bundle:true,write:false,platform:'browser',format:'iife',define:{'process.env.NODE_ENV':'"production"'},loader:{'.css':'empty'}});
 server=createServer((request,response)=>{if(request.url==='/bundle.js'){response.setHeader('Content-Type','text/javascript');response.end(bundle.outputFiles[0]!.text);}else{response.setHeader('Content-Type','text/html');response.end('<!doctype html><div id="root"></div><script src="/bundle.js"></script>');}});
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));origin=`http://127.0.0.1:${(server.address() as AddressInfo).port}`;
 browser=await chromium.launch({headless:true});
});
afterAll(async()=>{await browser?.close();if(server)await new Promise<void>(resolve=>server.close(()=>resolve()));});

it('focuses the rename input with the full name selected on open',async()=>{
 const page=await browser.newPage();try{
  await page.goto(`${origin}/?kind=rename`);
  const state=await page.evaluate(()=>({tag:document.activeElement?.tagName,label:(document.activeElement as HTMLElement)?.getAttribute('aria-label'),start:(document.activeElement as HTMLInputElement).selectionStart,end:(document.activeElement as HTMLInputElement).selectionEnd}));
  expect(state.tag).toBe('INPUT');
  expect(state.start).toBe(0);
  expect(state.end).toBe('Explore the component catalog'.length);
 }finally{await page.close();}
});

it('keeps first-focusable behavior for dialogs without initialFocusRef',async()=>{
 const page=await browser.newPage();try{
  await page.goto(`${origin}/?kind=plain`);
  const state=await page.evaluate(()=>({tag:document.activeElement?.tagName,label:(document.activeElement as HTMLElement)?.getAttribute('aria-label')}));
  expect(state).toEqual({tag:'BUTTON',label:'Close dialog'});
 }finally{await page.close();}
});
