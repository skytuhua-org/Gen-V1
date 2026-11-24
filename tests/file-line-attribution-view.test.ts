import {afterAll,beforeAll,describe,expect,it} from 'vitest';
import {build} from 'esbuild';
import {chromium,type Browser,type Page} from '@playwright/test';

// Drives the real useLineAttribution hook in a browser. lookup is window-owned
// so the test resolves/rejects requests and checks the generation fence.
const fixture=`
import React,{useState} from 'react';import {createRoot} from 'react-dom/client';
import {useLineAttribution} from './apps/web/src/files/line-attribution';
const waits=[];window.calls=[];window.waits=waits;
const lookup=(line,signal)=>new Promise((resolve,reject)=>{window.calls.push(line);waits.push({line,resolve,reject,signal});});
const attributed=(line)=>({kind:'attributed',sha:'a'.repeat(40),author:'Ada Fixture',authorDateUtc:'2024-01-02T12:00:00.000Z',subject:'S'+line});
window.attributed=attributed;
function Probe(){const[elig,setElig]=useState(true),[fence,setFence]=useState('f1'),[lines,setLines]=useState([]);
window.setFence=setFence;window.setElig=setElig;
const c=useLineAttribution({eligible:elig,reason:'binary',lineCount:3,fence,lookup,onLine:l=>setLines(v=>[...v,l]),onRefreshPreview:()=>window.refreshCalled=(window.refreshCalled||0)+1});
window.control=c;return <div>{c.action}<div id="inspector-slot">{c.inspector}</div><span data-testid="lines">{JSON.stringify(lines)}</span></div>;}
createRoot(document.getElementById('root')).render(<Probe/>);
`;
const click=async(page:Page,label:string)=>{await page.getByRole('button',{name:label}).click();};
const text=(page:Page,sel:string)=>page.locator(sel).innerText();

describe('line attribution view ownership',()=>{
 let browser:Browser,script:string;
 beforeAll(async()=>{script=(await build({stdin:{contents:fixture,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'}})).outputFiles[0]!.text;browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});});
 afterAll(async()=>{await browser?.close();});
 const page=()=>browser.newPage().then(async p=>{await p.setContent('<div id="root"></div>');await p.addScriptTag({content:script});await expect.poll(()=>p.evaluate(()=>typeof (window as any).control)).toBe('object');return p;});

 it('submits a typed line and renders the attributed result',async()=>{
  const p=await page();
  await click(p,'Line attribution');
  await p.locator('.files-attribution input').fill('2');
  await click(p,'Look up');
  expect(await p.evaluate(()=>(window as any).calls)).toEqual([2]);
  await p.evaluate(()=>{const g=globalThis as any;g.waits[0].resolve(g.attributed(2));});
  await expect.poll(()=>text(p,'.files-attribution-result strong')).toBe('Line 2');
  expect(await text(p,'.files-attribution-sha')).toBe('aaaaaaaa');
  expect(await text(p,'.files-attribution-author')).toBe('Ada Fixture');
  await p.close();
 });
 it('rejects out-of-range input without sending a request',async()=>{
  const p=await page();
  await click(p,'Line attribution');
  await p.locator('.files-attribution input').fill('9');
  await click(p,'Look up');
  expect(await text(p,'.files-attribution-error')).toBe('Enter a line from 1 to 3.');
  expect(await p.evaluate(()=>(window as any).calls)).toEqual([]);
  await p.close();
 });
 it('fences a pending result when the fence changes before it resolves',async()=>{
  const p=await page();
  await click(p,'Line attribution');
  await p.locator('.files-attribution input').fill('1');
  await click(p,'Look up');
  await p.evaluate(()=>(window as any).setFence('f2'));
  await p.evaluate(()=>{const g=globalThis as any;g.waits[0].resolve(g.attributed(1));});
  await new Promise(r=>setTimeout(r,50));
  expect(await p.locator('.files-attribution-result').count()).toBe(0);
  expect(await p.locator('.files-attribution').count()).toBe(0);
  await p.close();
 });
 it('closes on Escape and drops the selected line',async()=>{
  const p=await page();
  await click(p,'Line attribution');
  await p.locator('.files-attribution input').fill('3');
  await click(p,'Look up');
  await p.evaluate(()=>{const g=globalThis as any;g.waits[0].resolve(g.attributed(3));});
  await expect.poll(()=>text(p,'.files-attribution-result strong')).toBe('Line 3');
  await p.locator('.files-attribution').press('Escape');
  expect(await p.locator('.files-attribution').count()).toBe(0);
  expect(await text(p,'[data-testid="lines"]')).toBe('[null,3,null]');
  await p.close();
 });
 it('opens to a read-only explanation when ineligible',async()=>{
  const p=await page();
  await p.evaluate(()=>(window as any).setElig(false));
  await click(p,'Line attribution');
  expect(await p.locator('.files-attribution input').count()).toBe(0);
  expect(await text(p,'.files-attribution-hint')).toBe('Binary files do not have line attribution.');
  await p.close();
 });
});
