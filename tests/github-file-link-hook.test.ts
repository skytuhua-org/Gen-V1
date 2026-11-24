import {afterAll,beforeAll,describe,expect,it} from 'vitest';
import {build} from 'esbuild';
import {chromium,type Browser} from '@playwright/test';
const fixture=`
window.fetch=async(url)=>{const u=String(url);if(u.endsWith('/api/bootstrap'))return new Response(JSON.stringify({csrfToken:'t'}),{status:200,headers:{'Content-Type':'application/json'}});const r=window.__responder(u);if(r instanceof Promise)return r.then(v=>v.status===404?new Response('x',{status:404}):new Response(JSON.stringify(v.body),{status:v.status,headers:{'Content-Type':'application/json'}}));if(r.status===404)return new Response('x',{status:404});return new Response(JSON.stringify(r.body),{status:r.status,headers:{'Content-Type':'application/json'}});};
import React,{useState} from 'react';import {createRoot} from 'react-dom/client';import {useGitHubFileLink} from './apps/web/src/files/useGitHubFileLink';
function Probe({k}){const link=useGitHubFileLink('/api/projects/p1','threadId=t1',k);window.__last=link;return <div><span data-testid="state">{link.value?link.value.state:''}</span><span data-testid="reason">{link.value&&link.value.state==='unavailable'?link.value.reason:''}</span><span data-testid="url">{link.value&&link.value.state==='ready'?link.value.url:''}</span><span data-testid="pending">{String(link.pending)}</span><span data-testid="err">{link.error}</span><span data-testid="hidden">{String(link.hidden)}</span><button data-testid="bump" onClick={()=>link.refresh()}>r</button></div>;}
function App(){const[k,setK]=useState({projectId:'p1',threadId:'t1',path:'a.txt',sha256:'a'.repeat(64)});window.__setK=setK;return <Probe k={k}/>;}
createRoot(document.getElementById('root')).render(<App/>);
`;
const ready={state:'ready',url:'https://github.com/acme/widgets/blob/'+'b'.repeat(40)+'/a.txt',commit:'b'.repeat(40),repository:'acme/widgets',upstream:'origin/main',path:'a.txt'};
async function mount(browser:Browser,responder:string){
 const page=await browser.newPage();
 await page.setContent('<base href="https://gen.test/"><div id="root"></div>');
 await page.addScriptTag({content:'window.__responder='+responder});
 return page;
}
describe('useGitHubFileLink',()=>{
 let browser:Browser,script:string;
 beforeAll(async()=>{script=(await build({stdin:{contents:fixture,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'}})).outputFiles[0]!.text;browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});});
 afterAll(async()=>{await browser?.close();});
 it('exposes a ready permalink for an accepted key',async()=>{
  const page=await mount(browser,`url=>({status:200,body:${JSON.stringify(ready)}})`);
  await page.addScriptTag({content:script});
  await expect.poll(()=>page.getByTestId('state').textContent()).toBe('ready');
  expect(await page.getByTestId('url').textContent()).toBe(ready.url);
  expect(await page.getByTestId('pending').textContent()).toBe('false');
  expect(await page.getByTestId('hidden').textContent()).toBe('false');
  await page.close();
 });
 it('exposes the unavailable reason from the server',async()=>{
  const page=await mount(browser,`url=>({status:200,body:{state:'unavailable',reason:'detached-head'}})`);
  await page.addScriptTag({content:script});
  await expect.poll(()=>page.getByTestId('state').textContent()).toBe('unavailable');
  expect(await page.getByTestId('reason').textContent()).toBe('detached-head');
  await page.close();
 });
 it('hides the control for the session after a 404',async()=>{
  const page=await mount(browser,`()=>({status:404})`);
  await page.addScriptTag({content:script});
  await expect.poll(()=>page.getByTestId('hidden').textContent()).toBe('true');
  await page.close();
 });
 it('drops a late response for a superseded key',async()=>{
  const page=await mount(browser,`url=>{window.__calls=(window.__calls||0)+1;if(window.__calls===1)return new Promise(resolve=>{window.__resolveFirst=()=>resolve({status:200,body:${JSON.stringify(ready)}});});return {status:200,body:{state:'unavailable',reason:'detached-head'}};}`);
  await page.addScriptTag({content:script});
  await expect.poll(()=>page.getByTestId('pending').textContent()).toBe('true');
  await page.evaluate(()=>(window as any).__setK({projectId:'p1',threadId:'t1',path:'b.txt',sha256:'c'.repeat(64)}));
  await expect.poll(()=>page.getByTestId('reason').textContent()).toBe('detached-head');
  await page.evaluate(()=>(window as any).__resolveFirst());
  await page.waitForTimeout(300);
  expect(await page.getByTestId('state').textContent()).toBe('unavailable');
  expect(await page.getByTestId('reason').textContent()).toBe('detached-head');
  await page.close();
 });
});
