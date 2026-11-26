import {afterAll,beforeAll,expect,it} from 'vitest';
import {build} from 'esbuild';
import {chromium,type Browser} from '@playwright/test';
import {createServer,type Server} from 'node:http';
import type {AddressInfo} from 'node:net';

let browser:Browser,server:Server,origin:string;
beforeAll(async()=>{
 const bundle=await build({stdin:{resolveDir:process.cwd(),loader:'tsx',contents:`
  import React from 'react';import {createRoot} from 'react-dom/client';
  import {UpdateControl} from './apps/web/src/UpdateControl';
  import {DesktopProvider} from './apps/web/src/desktop-context';
  const context={windowId:'main',surface:{kind:'main'},windows:[],update:{state:'idle',message:'Install Gen to receive automatic updates.'}};
  const bridge={onState:()=>()=>{},onCloseRequested:()=>()=>{}};
  const calls:string[]=[];(window as any).__calls=calls;
  const Fixture=({withUpdate}:{withUpdate:boolean})=><DesktopProvider bridge={withUpdate?{...bridge,update:async(what:string)=>{calls.push(what);return context.update;}}:bridge} context={context}><UpdateControl compact/></DesktopProvider>;
  const kind=new URLSearchParams(location.search).get('kind');
  createRoot(document.getElementById('root')).render(<Fixture withUpdate={kind==='enabled'}/>);
 `},bundle:true,write:false,platform:'browser',format:'iife',define:{'process.env.NODE_ENV':'"production"'},loader:{'.css':'empty'}});
 server=createServer((request,response)=>{if(request.url==='/bundle.js'){response.setHeader('Content-Type','text/javascript');response.end(bundle.outputFiles[0]!.text);}else{response.setHeader('Content-Type','text/html');response.end('<!doctype html><div id="root"></div><script src="/bundle.js"></script>');}});
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));origin=`http://127.0.0.1:${(server.address() as AddressInfo).port}`;
 browser=await chromium.launch({headless:true});
});
afterAll(async()=>{await browser?.close();if(server)await new Promise<void>(resolve=>server.close(()=>resolve()));});

it('keeps the inert Update button tabbable, described and inert',async()=>{
 const page=await browser.newPage();try{
  await page.goto(`${origin}/?kind=disabled`);
  const button=page.locator('button');
  await expect.poll(()=>button.getAttribute('disabled')).toBeNull();
  expect(await button.getAttribute('aria-disabled')).toBe('true');
  await button.focus();
  expect(await page.evaluate(()=>(document.activeElement as HTMLElement).innerText)).toContain('Update');
  expect(await button.getAttribute('aria-describedby')).toBe('update-control-reason');
  expect(await page.locator('#update-control-reason').innerText()).toBe('Install Gen to receive automatic updates.');
  await button.click({force:true});
  expect(await page.evaluate(()=>(window as any).__calls.length)).toBe(0);
 }finally{await page.close();}
});

it('activates normally when an updater is available',async()=>{
 const page=await browser.newPage();try{
  await page.goto(`${origin}/?kind=enabled`);
  const button=page.locator('button');
  expect(await button.getAttribute('aria-disabled')).toBeNull();
  await button.click();
  await expect.poll(()=>page.evaluate(()=>(window as any).__calls)).toEqual(['check']);
 }finally{await page.close();}
});
