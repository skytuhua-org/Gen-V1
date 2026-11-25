import {afterAll,beforeAll,describe,expect,it} from 'vitest';
import {build} from 'esbuild';
import {readFile} from 'node:fs/promises';
import {chromium,type Browser,type Page} from '@playwright/test';
import {formatServerUptime} from '../apps/web/src/RunningServers.tsx';

const fixture=`
import React from 'react';
import {createRoot} from 'react-dom/client';
import {RunningServersView} from './apps/web/src/RunningServers.tsx';
window.stopped=[];
function Fixture(){
 const items=[
  {id:'t1:5173',projectId:'p1',threadId:'a',threadTitle:'Alpha',terminalId:'t1',url:'http://localhost:5173/',port:5173,label:'dev',source:'script',scriptName:'dev',startedAt:new Date(Date.now()-4*60*1000).toISOString(),detectedAt:new Date().toISOString()},
  {id:'t2:3000',projectId:'p1',threadId:'b',threadTitle:'Beta',terminalId:'t2',url:'http://localhost:3000/',port:3000,label:'npm start',source:'terminal',scriptName:null,startedAt:new Date().toISOString(),detectedAt:new Date().toISOString()},
 ];
 return <RunningServersView items={items} onStop={row=>window.stopped.push(row.id)}/>;
}
createRoot(document.getElementById('root')).render(<Fixture/>);
`;

describe('dev servers view',()=>{
 let browser:Browser,script:string,css:string;
 beforeAll(async()=>{
  script=(await build({stdin:{contents:fixture,resolveDir:process.cwd(),loader:'tsx'},loader:{'.css':'empty'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'}})).outputFiles[0]!.text;
  css=await readFile('packages/ui-shell/tokens.css','utf8')+await readFile('apps/web/src/running-servers.css','utf8');
  browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});
 });
 afterAll(async()=>{await browser?.close();});
 async function open():Promise<Page>{
  const page=await browser.newPage();
  await page.setContent(`<style>${css}</style><div id="root"></div>`);
  await page.addScriptTag({content:script});
  await page.locator('.running-servers').waitFor();
  return page;
 }

 it('renders one row per server with accessible names and the count',async()=>{
  const page=await open();
  expect(await page.locator('.running-servers-heading').innerText()).toContain('2');
  const rows=page.locator('.running-servers-row');
  await expect.poll(()=>rows.count()).toBe(2);
  expect(await rows.first().getAttribute('aria-label')).toBe('dev on port 5173');
  expect(await rows.nth(1).getAttribute('aria-label')).toBe('npm start on port 3000');
  expect(await rows.first().locator('.running-servers-uptime').innerText()).toBe('4m');
  await page.close();
 });

 it('arms stop on first click and stops only on a second click within 3 s',async()=>{
  const page=await open();
  const stop=page.locator('.running-servers-row').first().locator('.running-servers-stop');
  expect(await stop.getAttribute('aria-label')).toBe('Stop dev');
  await stop.click();
  expect(await stop.getAttribute('aria-label')).toBe('Confirm stop dev');
  expect(await page.evaluate(`window.stopped.length`)).toBe(0);
  await stop.click();
  await expect.poll(()=>page.evaluate(`window.stopped.length`)).toBe(1);
  expect(await page.evaluate(`window.stopped[0]`)).toBe('t1:5173');
  await page.close();
 });

 it('disarms stop on Escape and after the 3 s timeout',async()=>{
  const page=await open();
  const stop=page.locator('.running-servers-row').nth(1).locator('.running-servers-stop');
  await stop.click();
  expect(await stop.getAttribute('aria-label')).toBe('Confirm stop npm start');
  await stop.press('Escape');
  expect(await stop.getAttribute('aria-label')).toBe('Stop npm start');
  await stop.click();
  expect(await stop.getAttribute('aria-label')).toBe('Confirm stop npm start');
  await page.waitForTimeout(3200);
  expect(await stop.getAttribute('aria-label')).toBe('Stop npm start');
  expect(await page.evaluate(`window.stopped.length`)).toBe(0);
  await page.close();
 });
});

describe('formatServerUptime',()=>{
 const now=Date.parse('2026-01-01T12:00:00Z');
 it('formats the documented cases',()=>{
  expect(formatServerUptime('2026-01-01T11:59:30Z',now)).toBe('<1m');
  expect(formatServerUptime('2026-01-01T11:56:00Z',now)).toBe('4m');
  expect(formatServerUptime('2026-01-01T09:55:00Z',now)).toBe('2h 5m');
  expect(formatServerUptime('2025-12-29T12:00:00Z',now)).toBe('3d');
 });
 it('clamps future starts to <1m',()=>{
  expect(formatServerUptime('2026-01-01T12:05:00Z',now)).toBe('<1m');
 });
});
