import {afterAll,beforeAll,describe,expect,it} from 'vitest';
import {chromium,type Browser,type Page} from '@playwright/test';
import {createServer,type ViteDevServer} from 'vite';
import {mkdtemp,rm} from 'node:fs/promises';
import {resolve} from 'node:path';

describe('math renderer',()=>{
 let browser:Browser,page:Page,server:ViteDevServer,cacheDir:string|undefined;
 beforeAll(async()=>{
  cacheDir=await mkdtemp(resolve('node_modules/.vite-math-'));
  server=await createServer({configFile:false,root:'apps/web',logLevel:'silent',cacheDir,
   optimizeDeps:{include:['katex'],noDiscovery:true},
   server:{host:'127.0.0.1',port:0,strictPort:true},
  });
  await server.listen(0);
  const address=server.httpServer?.address();
  if(!address||typeof address==='string')throw Error('Vite test server did not bind a port.');
  const fixture=`http://127.0.0.1:${address.port}/math-renderer-test`;
  browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});
  page=await browser.newPage();
  // The isolated entry needs an origin and DOM. Booting the app would let
  // unrelated dependency discovery reload the first render's execution context.
  await page.route(fixture,route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html lang="en"><body><script type="module">import {renderMath} from "/src/math-renderer.ts"; window.fixtureRenderMath=renderMath;</script></body></html>'}));
  await page.goto(fixture);
  await page.waitForFunction(()=>typeof Reflect.get(window,'fixtureRenderMath')==='function');
 });
 afterAll(async()=>{
  await browser?.close();
  await server?.close();
  if(cacheDir)await rm(cacheDir,{recursive:true,force:true});
 });
 async function render(tex:string,mode:'inline'|'display',remaining=8192,connect=false){
  return page.evaluate(({tex,mode,remaining,connect})=>{
   const target=document.createElement('div');if(connect)document.body.append(target);
   const renderMath=Reflect.get(window,'fixtureRenderMath') as typeof import('../apps/web/src/math-renderer').renderMath;
   const result=renderMath(tex,mode,target,remaining);
   return {result,html:target.innerHTML,connected:target.isConnected,elements:target.querySelectorAll('*').length};
  },{tex,mode,remaining,connect});
 }
 it.each([String.raw`\frac{a}{b}`,String.raw`\sum_{i=0}^{n} i`,String.raw`\int_0^1 x^2\,dx`,String.raw`\begin{matrix}a&b\\c&d\end{matrix}`])('renders supported formula %s with the public engine',async tex=>{
  const out=await render(tex,'inline');expect(out.result.kind).toBe('rendered');expect(out.elements).toBeGreaterThan(10);expect(out.html).toContain('katex');
 });
 it('renders display math and repeated equal formulas independently',async()=>{
  const first=await render('x+1','display'),second=await render('x+1','display');
  expect(first.result.kind).toBe('rendered');expect(second.result.kind).toBe('rendered');expect(first.html).toBe(second.html);expect(first.html).toContain('katex-display');
 });
 it.each([String.raw`\href{https://evil.example}{x}`,String.raw`\url{https://evil.example}`,String.raw`\includegraphics{x}`,String.raw`\htmlClass{evil}{x}`,String.raw`\htmlStyle{color:red}{x}`,String.raw`\htmlData{x}{y}`])('preserves source for hostile trust-gated command %s',async tex=>{
  const out=await render(tex,'inline');expect(out.result).toEqual({kind:'source',reason:'parse'});expect(out.html).toBe('');expect(out.html).not.toContain('error');
 });
 it('rejects malformed TeX without raw error markup',async()=>{
  const out=await render(String.raw`\frac{`,'inline');expect(out.result).toEqual({kind:'source',reason:'parse'});expect(out.html).toBe('');
 });
 it('does not leak global definitions across expressions',async()=>{
  const first=await render(String.raw`\gdef\mthtwoleak{x}\mthtwoleak`,'inline'),second=await render(String.raw`\mthtwoleak`,'inline');
  expect(first.result.kind).not.toBe('engine');expect(second.result).toEqual({kind:'source',reason:'parse'});
 });
 it('enforces caller and per-expression element budgets and discards rejected output',async()=>{
  expect((await render('x','inline',0)).result).toEqual({kind:'source',reason:'budget'});
  const out=await render(String.raw`\sum_{i=0}^{n} i`,'inline',3);expect(out.result).toEqual({kind:'source',reason:'budget'});expect(out.html).toBe('');
 });
 it('requires a detached target',async()=>{
  const out=await render('x','inline',8192,true);expect(out.result).toEqual({kind:'source',reason:'engine'});expect(out.connected).toBe(true);
 });
});
