import {afterAll,beforeAll,describe,expect,it} from 'vitest';
import {build} from 'esbuild';
import {chromium,type Browser} from '@playwright/test';
// Issue #1976: shared UI controls must not keep stale generated content after the
// owning control changes — a caller-provided accessible name must survive a title
// removal, Enter with no selectable command must behave like normal typing, and
// removing a focused toast must move focus to a remaining control.
const fixture=`
import React,{useRef,useState} from 'react';import {createRoot} from 'react-dom/client';
import {TooltipLayer} from './packages/ui-shell/Tooltip';import {Toaster,toast,dismissToast} from './packages/ui-shell/Toast';import {ComposerCommands} from './apps/web/src/ComposerCommands';
function App(){const[named,setNamed]=useState(false),[draft,setDraft]=useState('');const input=useRef<HTMLTextAreaElement>(null),commands=useRef(null);
window.setNamed=setNamed;window.setDraftValue=setDraft;window.toast=toast;window.dismissToast=dismissToast;window.commands=commands;window.inputRef=input;
return <><TooltipLayer/><Toaster/>
<button id="tip-target" {...(named?{'aria-label':'Caller name'}:{title:'Original help'})}></button>
<textarea id="composer" ref={input} value={draft} onChange={event=>setDraft(event.target.value)} onKeyDown={event=>{if(commands.current?.keyDown(event))return;if(event.key==='Enter'){event.preventDefault();window.sentCount=(window.sentCount??0)+1;}}}/>
<ComposerCommands ref={commands} input={input} draft={draft} disabled={false} onDraft={setDraft} onModel={async()=>{}} onMode={async()=>{}}/></>;}
createRoot(document.getElementById('root')).render(<App/>);
`;
const stubs:Record<string,string>={'skill-catalog-api':`export const getSkillCatalog=async()=>({skills:[],sources:[],nextCursor:null});export const mergeSkillCatalogPages=(a,b)=>a;`,'composer-commands':`export const commandToken=(draft,caret)=>{const before=draft.slice(0,caret);const start=before.lastIndexOf('/');if(start<0||/\\s/.test(before.slice(start+1)))return null;const token=before.slice(start);return {start,end:caret,query:token.slice(1),token};};export const replaceCommandToken=(text,current)=>({text:text.slice(0,current.start),caret:current.start});`};
describe('shared UI lifecycle (#1976)',()=>{
 let browser:Browser,script:string;
 beforeAll(async()=>{script=(await build({stdin:{contents:fixture,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'ui-fixture',setup(b){b.onResolve({filter:/composer-commands$/},()=>({path:'composer-commands',namespace:'stub'}));b.onResolve({filter:/skill-catalog-api$/},()=>({path:'skill-catalog-api',namespace:'stub'}));b.onLoad({filter:/.*/,namespace:'stub'},args=>({contents:stubs[args.path],loader:'js',resolveDir:process.cwd()}));}}]})).outputFiles[0]!.text;browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});});
 afterAll(async()=>{await browser?.close();});
 const page0=async()=>{const page=await browser.newPage();await page.setContent('<div id="root"></div>');await page.evaluate(()=>{if(!crypto.randomUUID)Object.defineProperty(crypto,'randomUUID',{value:()=>'synthetic-id'});});await page.addScriptTag({content:script});await expect.poll(()=>page.locator('#tip-target').count()).toBe(1);return page;};
 it('keeps a caller-provided accessible name after the tooltip title is removed',async()=>{const page=await page0();try{
   await page.hover('#tip-target');
   await expect.poll(()=>page.locator('#tip-target').getAttribute('aria-label')).toBe('Original help');
   // The caller re-renders: title removed, its own aria-label supplied.
   await page.evaluate(()=>window.setNamed(true));
   await expect.poll(()=>page.locator('#tip-target').getAttribute('aria-label')).toBe('Caller name');
   await expect.poll(()=>page.locator('#tip-target').getAttribute('title')).toBeNull();
   // A second mutation flush must not strip the caller's name.
   await page.evaluate(()=>document.querySelector('#tip-target')!.setAttribute('data-probe','1'));
   await page.waitForTimeout(50);
   expect(await page.locator('#tip-target').getAttribute('aria-label')).toBe('Caller name');
 }finally{await page.close();}});
 it('treats Enter as normal typing when the command list has no selection',async()=>{const page=await page0();try{
   await page.locator('#composer').click();
   await page.locator('#composer').fill('/zz');
   await expect.poll(()=>page.locator('.composer-command-list').count()).toBe(1);
   await page.locator('#composer').press('Enter');
   expect(await page.evaluate(()=>window.sentCount??0)).toBe(1);
 }finally{await page.close();}});
 it('moves focus to a remaining toast when the focused entry is removed',async()=>{const page=await page0();try{
   await page.evaluate(()=>{window.toast('first');window.toast('second');});
   await expect.poll(()=>page.locator('.ui-toast').count()).toBe(2);
   await page.locator('.ui-toast').first().locator('.ui-toast-close').focus();
   await page.evaluate(()=>window.dismissToast(1));
   await expect.poll(()=>page.locator('.ui-toast').count()).toBe(1);
   const owner=await page.evaluate(()=>document.activeElement?.closest('.ui-toast')?.textContent);
   expect(owner).toContain('second');
 }finally{await page.close();}});
});
