import {beforeAll,afterAll,describe,expect,it} from 'vitest';
import {build} from 'esbuild';
import {chromium,type Browser,type Page} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

describe.runIf(process.env.GEN_SPLIT_RENDERER_BROWSER==='1')('split renderer browser interaction',()=>{
let browser:Browser,script:string,css:string;
const fixture=`
import React,{useContext,useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {WorkspaceSplitLayout,PaneCompactContext} from './apps/web/src/WorkspaceSplitLayout.tsx';
import {SessionBranchMenu} from './apps/web/src/SessionBranchMenu.tsx';
import {createSplitWorkspaceLayout,applySplitWorkspaceCommand} from './packages/core/split-workspace-layout.ts';
let initial=createSplitWorkspaceLayout('test-layout');
initial=applySplitWorkspaceCommand(initial,'view.open',{view:{id:'one',kind:'thread',binding:{authority:{kind:'local'},threadId:'one'}}});
initial=applySplitWorkspaceCommand(initial,'pane.split',{paneId:'pane-main',newPaneId:'right',splitId:'columns',axis:'horizontal',view:{id:'two',kind:'thread',binding:{authority:{kind:'local'},threadId:'two'}}});
window.mounts={};window.commands=[];window.editorChoices=[];window.flushRejected=false;window.deferEditorChoice=false;
function Editor({id,active}){const[value,setValue]=useState('');const compact=useContext(PaneCompactContext);useEffect(()=>{window.mounts[id]=(window.mounts[id]||0)+1;},[]);return <div>{window.compactProbe&&<><output aria-label={'Compact '+id}>{compact?'compact':'wide'}</output><div className="breadcrumb"><span>Project</span><span>/</span><strong>{id}</strong></div><SessionBranchMenu thread={{id}} messages={[]} overview={{enabled:{branch:true,import:false},capabilities:{nativeFork:'UNPROVEN'},captures:[],imports:[]}} reloadOverview={()=>{}} onOpenThread={()=>{}}/></>}<label>{id}<input aria-label={'Draft '+id} value={value} onChange={e=>setValue(e.target.value)}/></label><iframe title={'Frame '+id} srcDoc='<input value="same renderer"/>'/><span>{active?'visible':'hidden'}</span></div>}
function Fixture(){const[layout,setLayout]=useState(initial);window.currentLayout=layout;window.issue=(type,payload)=>setLayout(current=>applySplitWorkspaceCommand(current,type,payload));return <WorkspaceSplitLayout layout={layout} showHistory={false} emptyMainPaneId={window.emptyMain?'pane-main':undefined} editorOptions={[{id:'thread',title:'Conversation'},{id:'diff',title:'Diff'}]} onSelectEditor={async(kind,paneId)=>{window.editorChoices.push({kind,paneId});if(window.deferEditorChoice)await new Promise(resolve=>{window.finishEditorChoice=resolve;});}} onDropThread={async()=>{window.threadDrops=(window.threadDrops||0)+1;}} title={view=>view.id} prepare={async()=>{if(window.flushRejected)throw Error('Draft flush failed. Keep this view open.');}} onCommand={async(type,payload)=>{window.commands.push({type,payload});if(window.commandFault)throw Error(window.commandFault);if(type==='pane.resize'&&window.holdResize)await new Promise(resolve=>{window.finishResize=resolve;});setLayout(current=>applySplitWorkspaceCommand(current,type,payload));}} renderView={(view,active)=><Editor id={view.id} active={active}/>}/>}
const fixtureRoot=createRoot(document.getElementById('root'));window.unmountSplit=()=>fixtureRoot.unmount();fixtureRoot.render(<Fixture/>);
`;
beforeAll(async()=>{
 const root=fileURLToPath(new URL('../',import.meta.url));
 const bundled=await build({stdin:{contents:fixture,resolveDir:root,sourcefile:'split-renderer-fixture.tsx',loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},loader:{'.css':'empty'},logLevel:'silent'});
 script=bundled.outputFiles[0]!.text;css=(await Promise.all(['packages/ui-shell/tokens.css','packages/ui-shell/controls.css','apps/web/src/workspace-split.css','apps/web/src/session-branch.css'].map(path=>readFile(new URL('../'+path,import.meta.url),'utf8')))).join('\n').replace("@import './tokens.css';",'');
 browser=await chromium.launch({headless:true,...(process.env.GEN_TEST_BROWSER_CHANNEL?{channel:process.env.GEN_TEST_BROWSER_CHANNEL}:{})});
});
afterAll(async()=>{await browser?.close();});
async function page(compactProbe=false){const page=await browser.newPage({viewport:{width:1440,height:900}});await page.evaluate(value=>{(window as any).compactProbe=value;},compactProbe);await page.setContent('<html><head></head><body style="margin:0"><div id="root" style="display:flex;height:100vh"></div></body></html>');await page.addStyleTag({content:css});await page.addScriptTag({content:script});await page.getByRole('textbox',{name:'Draft one'}).waitFor({state:'visible'});return page;}
async function issue(page:Page,type:string,payload:Record<string,unknown>){await page.evaluate(({type,payload})=>(window as unknown as {issue:(type:string,payload:Record<string,unknown>)=>void}).issue(type,payload),{type,payload});}

it('uses the shared area menu for keyboard editor selection, Escape and outside dismissal',async()=>{
 const tab=await page();try{
  await tab.evaluate(()=>window.deferEditorChoice=true);
  const trigger=tab.locator('[data-split-pane="right"]').getByLabel('Area actions',{exact:true});await trigger.click();
  expect(await tab.getByRole('menu',{name:'Area actions',exact:true}).count()).toBe(1);
  expect((await trigger.boundingBox())!.width).toBeLessThanOrEqual(34);
  const choice=tab.getByRole('menuitem',{name:'Editor: Diff',exact:true});await choice.focus();await choice.press('Enter');
  await tab.waitForFunction(()=>window.editorChoices.length===1);
  expect(await tab.evaluate(()=>window.editorChoices)).toEqual([{kind:'diff',paneId:'right'}]);
  expect(await tab.getByRole('menu').count()).toBe(0);expect(await trigger.isDisabled()).toBe(true);
  await tab.evaluate(()=>window.finishEditorChoice());
  await expect.poll(()=>trigger.evaluate(node=>node===document.activeElement)).toBe(true);
  expect(await tab.getByRole('menu').count()).toBe(0);expect(await trigger.evaluate(node=>node===document.activeElement)).toBe(true);
  await trigger.press('ArrowDown');await tab.getByRole('menu').waitFor();await tab.keyboard.press('Escape');
  await tab.waitForFunction(()=>!document.querySelector('[role="menu"][data-state="open"]')&&(document.activeElement as HTMLElement)?.getAttribute('aria-label')==='Area actions');
  expect(await tab.getByRole('menu').count()).toBe(0);expect(await trigger.evaluate(node=>node===document.activeElement)).toBe(true);
  await trigger.click();await tab.getByRole('menu').waitFor();await tab.getByRole('textbox',{name:'Draft two'}).click();await tab.waitForFunction(()=>!document.querySelector('[role="menu"][data-state="open"]'));expect(await tab.getByRole('menu').count()).toBe(0);
 }finally{await tab.close();}
});

it('mounts a tool view opened in the empty main pane',async()=>{
 const tab=await page();try{
  await tab.evaluate(()=>window.emptyMain=true);
  await issue(tab,'view.open',{paneId:'pane-main',view:{id:'tool:files',kind:'files',binding:{authority:{kind:'local'},projectId:'p1'}}});
  await tab.locator('[data-split-view="tool:files"] span',{hasText:'visible'}).waitFor();
  expect(await tab.locator('[data-split-view="tool:files"]').evaluate(node=>getComputedStyle(node).display)).not.toBe('none');
  expect(await tab.locator('[data-split-pane="pane-main"] .split-empty').count()).toBe(0);
  await issue(tab,'view.activate',{paneId:'pane-main',viewId:'one'});
  await tab.locator('[data-split-pane="pane-main"] .split-empty').waitFor();
  expect(await tab.locator('[data-split-view="one"]').evaluate(node=>getComputedStyle(node).display)).toBe('none');
 }finally{await tab.close();}
});

it('keeps editor focus when a pending area action completes',async()=>{
 const tab=await page();try{
  await tab.evaluate(()=>window.deferEditorChoice=true);
  const trigger=tab.locator('[data-split-pane="right"]').getByLabel('Area actions',{exact:true});await trigger.click();
  await tab.getByRole('menuitem',{name:'Editor: Diff',exact:true}).click();
  await tab.waitForFunction(()=>typeof window.finishEditorChoice==='function');expect(await trigger.isDisabled()).toBe(true);
  const draft=tab.getByRole('textbox',{name:'Draft two'});await draft.fill('Keep typing during the pending action');
  await tab.evaluate(()=>window.finishEditorChoice());await expect.poll(()=>trigger.isDisabled()).toBe(false);
  expect(await draft.evaluate(node=>node===document.activeElement)).toBe(true);expect(await draft.inputValue()).toBe('Keep typing during the pending action');
 }finally{await tab.close();}
});

it('uses a shared narrow-area chooser without remounting either editor',async()=>{
 const tab=await page();try{
  await tab.getByRole('textbox',{name:'Draft one'}).fill('Retained narrow draft');
  await tab.setViewportSize({width:500,height:270});
  const trigger=tab.getByRole('combobox',{name:'Active workspace area',exact:true});await trigger.click();
  expect(await tab.getByRole('listbox',{name:'Active workspace area',exact:true}).count()).toBe(1);
  await tab.getByRole('option',{name:'one',exact:true}).click();await tab.getByRole('textbox',{name:'Draft one'}).waitFor({state:'visible'});
  expect(await tab.getByRole('textbox',{name:'Draft one'}).inputValue()).toBe('Retained narrow draft');
  expect(await tab.evaluate(()=>window.mounts)).toEqual({one:1,two:1});
 }finally{await tab.close();}
});

it('does not reopen a menu after responsive layout removes its owning pane',async()=>{
 const tab=await page();try{
  await tab.locator('[data-split-pane="pane-main"]').getByLabel('Area actions',{exact:true}).click();await tab.getByRole('menu').waitFor();
  await tab.setViewportSize({width:500,height:900});await tab.getByRole('menu').waitFor({state:'hidden'});
  await tab.setViewportSize({width:1440,height:900});await tab.waitForFunction(()=>document.querySelectorAll('[data-split-pane]').length===2);
  expect(await tab.getByRole('menu').count()).toBe(0);
 }finally{await tab.close();}
});

it('keeps editor DOM, values and iframe instance when moving and parking views',async()=>{
 const tab=await page();try{
  await tab.getByRole('textbox',{name:'Draft one'}).fill('keep this draft');
  await tab.evaluate(()=>{const globals=window as unknown as {savedInput:Element|null;savedFrame:Window|null};globals.savedInput=document.querySelector('[aria-label="Draft one"]');globals.savedFrame=(document.querySelector('[title="Frame one"]') as HTMLIFrameElement).contentWindow;});
  await issue(tab,'view.move',{viewId:'one',paneId:'right'});await tab.getByRole('textbox',{name:'Draft one'}).waitFor({state:'visible'});
  expect(await tab.getByRole('textbox',{name:'Draft one'}).inputValue()).toBe('keep this draft');
  expect(await tab.evaluate(()=>{const globals=window as unknown as {savedInput:Element|null;savedFrame:Window|null;mounts:Record<string,number>};return globals.savedInput===document.querySelector('[aria-label="Draft one"]')&&globals.savedFrame===(document.querySelector('[title="Frame one"]') as HTMLIFrameElement).contentWindow&&globals.mounts.one===1;})).toBe(true);
  await issue(tab,'view.park',{viewId:'one'});await tab.getByRole('textbox',{name:'Draft one'}).waitFor({state:'hidden'});
  await issue(tab,'view.move',{viewId:'one',paneId:'pane-main'});await tab.getByRole('textbox',{name:'Draft one'}).waitFor({state:'visible'});expect(await tab.getByRole('textbox',{name:'Draft one'}).inputValue()).toBe('keep this draft');
 }finally{await tab.close();}
});
it('supports keyboard divider movement and cancels pointer previews without a command',async()=>{
 const tab=await page();try{
  const divider=tab.getByRole('separator',{name:'Resize columns'});await divider.focus();await divider.press('ArrowRight');await tab.waitForFunction(()=>(window as unknown as {currentLayout:{root:{ratio:number}}}).currentLayout.root.ratio>.5);
  const before=await tab.evaluate(()=>(window as unknown as {commands:unknown[]}).commands.length),box=await divider.boundingBox();if(!box)throw Error('Missing divider bounds');
  await tab.mouse.move(box.x+box.width/2,box.y+120);await tab.mouse.down();await tab.mouse.move(box.x+100,box.y+120);await tab.keyboard.press('Escape');await tab.mouse.up();
  expect(await tab.evaluate(()=>(window as unknown as {commands:unknown[]}).commands.length)).toBe(before);
  expect(await divider.getAttribute('aria-valuenow')).toBe('51');
 }finally{await tab.close();}
});
it('opens the area menu from the corner button and marks the focused pane',async()=>{
 const tab=await page();try{
  const main=tab.locator('[data-split-pane="pane-main"]'),right=tab.locator('[data-split-pane="right"]');
  expect(await right.getAttribute('class')).toContain('is-focused');
  const mainBorder=await main.evaluate(el=>getComputedStyle(el).borderColor),rightBorder=await right.evaluate(el=>getComputedStyle(el).borderColor);
  expect(rightBorder).not.toBe(mainBorder);
  const corner=main.getByRole('button',{name:'Split or open area menu'});await corner.press('Enter');
  await tab.getByRole('menu').waitFor({state:'visible'});
  await tab.keyboard.press('Escape');await tab.getByRole('menu').waitFor({state:'detached'});
  await tab.waitForFunction(()=>document.activeElement?.classList.contains('split-corner'));
 }finally{await tab.close();}
});
it('dedupes identical command errors into one dismissible banner',async()=>{
 const tab=await page();try{
  await tab.evaluate(()=>{(window as unknown as {commandFault?:string}).commandFault='Synthetic command fault';});
  const divider=tab.getByRole('separator',{name:'Resize columns'});await divider.focus();
  await divider.press('ArrowRight');await tab.getByRole('alert').waitFor({state:'visible'});
  await divider.press('ArrowRight');await tab.waitForFunction(()=>(window as unknown as {commands:unknown[]}).commands.length>=2);
  expect(await tab.getByRole('alert').count()).toBe(1);expect(await tab.getByRole('alert').innerText()).toContain('Synthetic command fault');
  await tab.getByRole('button',{name:'Dismiss'}).click();expect(await tab.getByRole('alert').count()).toBe(0);
 }finally{await tab.close();}
});
it('retries a revision conflict once then shows one friendly banner',async()=>{
 const tab=await page();try{
  await tab.evaluate(()=>{(window as unknown as {commandFault?:string}).commandFault='The layout revision changed. Refresh before applying this operation.';});
  const divider=tab.getByRole('separator',{name:'Resize columns'});await divider.focus();await divider.press('ArrowRight');
  await tab.getByRole('alert').waitFor({state:'visible'});
  expect(await tab.evaluate(()=>(window as unknown as {commands:unknown[]}).commands.length)).toBe(2);
  expect(await tab.getByRole('alert').count()).toBe(1);
  const text=await tab.getByRole('alert').innerText();expect(text).toContain("Couldn't apply that change");expect(text).not.toContain('revision changed');
 }finally{await tab.close();}
});
it('accumulates rapid keyboard divider presses into one debounced commit',async()=>{
 const tab=await page();try{
  const divider=tab.getByRole('separator',{name:'Resize columns'});await divider.focus();
  for(let i=0;i<10;i++)await divider.press('ArrowRight');
  // Optimistic: aria-valuenow and the % tooltip already reflect the preview.
  expect(await divider.getAttribute('aria-valuenow')).toBe('60');
  await tab.locator('.split-divider span').waitFor({state:'visible'});expect(await tab.locator('.split-divider span').innerText()).toMatch(/60% width/);
  await tab.waitForFunction(()=>Math.abs((window as unknown as {currentLayout:{root:{ratio:number}}}).currentLayout.root.ratio-.6)<.001);
  const resizes=await tab.evaluate(()=>(window as unknown as {commands:{type:string;payload:{ratio:number}}[]}).commands.filter(command=>command.type==='pane.resize'));
  expect(resizes).toHaveLength(1);expect(resizes[0]!.payload.ratio).toBeCloseTo(.6,3);
  expect(await divider.getAttribute('aria-valuenow')).toBe('60');
 }finally{await tab.close();}
});
it('cancels a pending keyboard resize preview on Escape without a command',async()=>{
 const tab=await page();try{
  const divider=tab.getByRole('separator',{name:'Resize columns'});await divider.focus();
  const before=await tab.evaluate(()=>(window as unknown as {commands:unknown[]}).commands.length);
  await divider.press('ArrowRight');await divider.press('ArrowRight');
  await tab.keyboard.press('Escape');
  expect(await divider.getAttribute('aria-valuenow')).toBe('50');
  await tab.waitForTimeout(400);
  expect(await tab.evaluate(()=>(window as unknown as {commands:unknown[]}).commands.length)).toBe(before);
 }finally{await tab.close();}
});
it('cancels unsent keyboard resize when focus leaves the divider',async()=>{
 const tab=await page();try{
  await tab.clock.install();await tab.clock.pauseAt(new Date());
  const divider=tab.getByRole('separator',{name:'Resize columns'});await divider.focus();await divider.press('ArrowRight');
  await tab.getByRole('textbox',{name:'Draft one'}).focus();await tab.clock.runFor(300);
  expect(await tab.evaluate(()=>(window as unknown as {commands:unknown[]}).commands)).toEqual([]);
  expect(await divider.getAttribute('aria-valuenow')).toBe('50');
  expect(await divider.getAttribute('class')).not.toContain('is-dragging');
 }finally{await tab.close();}
});
it('cancels unsent keyboard resize when the component unmounts',async()=>{
 const tab=await page();try{
  await tab.clock.install();await tab.clock.pauseAt(new Date());
  const divider=tab.getByRole('separator',{name:'Resize columns'});await divider.focus();await divider.press('ArrowRight');
  await tab.evaluate(()=>(window as unknown as {unmountSplit:()=>void}).unmountSplit());await tab.clock.runFor(300);
  expect(await tab.evaluate(()=>(window as unknown as {commands:unknown[]}).commands)).toEqual([]);
 }finally{await tab.close();}
});
it('cancels unsent keyboard resize when its split is removed from the layout',async()=>{
 const tab=await page();try{
  await tab.clock.install();await tab.clock.pauseAt(new Date());
  const divider=tab.getByRole('separator',{name:'Resize columns'});await divider.focus();await divider.press('ArrowRight');
  await issue(tab,'pane.join',{paneId:'right',targetPaneId:'pane-main'});
  await expect.poll(()=>divider.count()).toBe(0);await tab.clock.runFor(300);
  expect(await tab.evaluate(()=>(window as unknown as {commands:unknown[]}).commands)).toEqual([]);
 }finally{await tab.close();}
});
it('cancels unsent keyboard resize before a pointer resize takes ownership',async()=>{
 const tab=await page();try{
  await tab.clock.install();await tab.clock.pauseAt(new Date());
  const divider=tab.getByRole('separator',{name:'Resize columns'});await divider.focus();await divider.press('ArrowRight');
  const box=(await divider.boundingBox())!;await tab.mouse.move(box.x+box.width/2,box.y+120);await tab.mouse.down();
  await tab.clock.runFor(300);
  expect(await tab.evaluate(()=>(window as unknown as {commands:unknown[]}).commands)).toEqual([]);
  await tab.mouse.move(box.x+35,box.y+120);await tab.mouse.up();
  await expect.poll(()=>tab.evaluate(()=>(window as unknown as {commands:unknown[]}).commands.length)).toBe(1);
 }finally{await tab.close();}
});
it('a settled cancelled keyboard resize cannot clear a newer equal-ratio preview',async()=>{
 const tab=await page();try{
  await tab.clock.install();await tab.clock.pauseAt(new Date());
  await tab.evaluate(()=>(window as unknown as {holdResize:boolean}).holdResize=true);
  const divider=tab.getByRole('separator',{name:'Resize columns'});await divider.focus();await divider.press('ArrowRight');await tab.clock.runFor(150);
  await expect.poll(()=>tab.evaluate(()=>(window as unknown as {commands:unknown[]}).commands.length)).toBe(1);
  await divider.press('Escape');await divider.press('ArrowRight');
  await tab.evaluate(()=>(window as unknown as {finishResize:()=>void}).finishResize());
  await expect.poll(()=>tab.evaluate(()=>document.querySelector('.split-workspace')?.getAttribute('aria-busy'))).toBe('false');
  expect(await divider.getAttribute('class')).toContain('is-dragging');
  await divider.press('Escape');await tab.clock.runFor(300);
  expect(await tab.evaluate(()=>(window as unknown as {commands:unknown[]}).commands.length)).toBe(1);
 }finally{await tab.close();}
});
it('retains layout when draft flush fails and restores desktop geometry after narrow mode',async()=>{
 const tab=await page();try{
  await tab.evaluate(()=>(window as unknown as {flushRejected:boolean}).flushRejected=true);
  await tab.locator('[data-split-pane="right"]').getByLabel('Area actions',{exact:true}).click();await tab.getByRole('menuitem',{name:'Join adjacent area'}).click();
  await tab.getByRole('alert').waitFor({state:'visible'});expect(await tab.locator('[data-split-pane]').count()).toBe(2);
  await tab.setViewportSize({width:500,height:900});await tab.getByRole('combobox',{name:'Active workspace area'}).waitFor({state:'visible'});expect(await tab.locator('[data-split-pane]').count()).toBe(1);
  await tab.setViewportSize({width:1440,height:900});await tab.waitForFunction(()=>document.querySelectorAll('[data-split-pane]').length===2);
  expect(await tab.evaluate(()=>(window as unknown as {mounts:Record<string,number>}).mounts)).toEqual({one:1,two:1});
 }finally{await tab.close();}
});
it('moves a dragged tab to the center target and minimizes to a reachable strip',async()=>{
 const tab=await page();try{
  const dataTransfer=await tab.evaluateHandle(()=>new DataTransfer());
  await tab.locator('[data-split-pane="right"] [role="tab"]').dispatchEvent('dragstart',{dataTransfer});
  const target=await tab.locator('[data-split-pane="pane-main"] .split-pane-slot').boundingBox();if(!target)throw Error('Missing target area');
  await tab.locator('.split-workspace').dispatchEvent('dragover',{dataTransfer,clientX:target.x+target.width/2,clientY:target.y+target.height/2});
  await tab.locator('.split-workspace').dispatchEvent('drop',{dataTransfer,clientX:target.x+target.width/2,clientY:target.y+target.height/2});
  await tab.waitForFunction(()=>(window as unknown as {currentLayout:{panes:Record<string,{activeViewId:string}>}}).currentLayout.panes['pane-main']!.activeViewId==='two');
  expect(await tab.evaluate(()=>(window as unknown as {mounts:Record<string,number>}).mounts)).toEqual({one:1,two:1});
  await tab.locator('[data-split-pane="right"]').getByRole('button',{name:'Minimize area'}).click();
  await tab.waitForFunction(()=>document.querySelector('[data-split-pane="right"]')!.getBoundingClientRect().width<=37);
  const restore=tab.locator('[data-split-pane="right"]').getByRole('button',{name:'Restore area'});expect(await restore.isVisible()).toBe(true);await restore.click();await tab.waitForFunction(()=>document.querySelector('[data-split-pane="right"]')!.getBoundingClientRect().width>100);
 }finally{await tab.close();}
});
it('rejects an incoming conversation that cannot fit its actual minimum',async()=>{
 const tab=await page();try{
  await issue(tab,'pane.join',{paneId:'right'});await tab.setViewportSize({width:600,height:700});await tab.waitForFunction(()=>document.querySelector('.split-workspace.is-narrow')?.getBoundingClientRect().width===600);
  const target=await tab.locator('[data-split-pane="pane-main"] .split-pane-slot').boundingBox();if(!target)throw Error('Missing pane');
  const dataTransfer=await tab.evaluateHandle(()=>{const data=new DataTransfer();data.setData('application/x-gen-thread',JSON.stringify({threadId:'two',binding:{authority:{kind:'local'},threadId:'two'}}));return data;});
  await tab.locator('.split-workspace').dispatchEvent('drop',{dataTransfer,clientX:target.x+target.width-1,clientY:target.y+target.height/2});
  await tab.waitForTimeout(30);expect(await tab.evaluate(()=>(window as unknown as {threadDrops?:number}).threadDrops??0)).toBe(0);
  expect(await tab.getByRole('alert').textContent()).toContain('larger');
 }finally{await tab.close();}
});
it('keeps editor and recovery controls reachable inside a short pane',async()=>{
 const tab=await page();try{
  await issue(tab,'pane.join',{paneId:'right'});await tab.setViewportSize({width:900,height:270});await tab.locator('[data-split-pane="pane-main"]').getByLabel('Area actions',{exact:true}).click();
  const bounds=await tab.getByRole('menu',{name:'Area actions',exact:true}).boundingBox(),pane=await tab.locator('[data-split-pane="pane-main"]').boundingBox();
  expect(bounds).not.toBeNull();expect(pane).not.toBeNull();expect(bounds!.y).toBeGreaterThanOrEqual(0);expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(270);
  const recovery=tab.getByRole('menuitem',{name:'Recover: two',exact:true});await recovery.focus();await recovery.scrollIntoViewIfNeeded();expect(await recovery.isVisible()).toBe(true);await recovery.press('Enter');await tab.getByRole('textbox',{name:'Draft two'}).waitFor({state:'visible'});expect(await tab.evaluate(()=>window.mounts)).toEqual({one:1,two:1});
 }finally{await tab.close();}
});

for(const check of ['breadcrumb','History'] as const)it(`compacts only the narrow owning view's ${check} and restores it without remounting`,async()=>{
 const tab=await page(true);try{
  const narrow=tab.locator('[data-split-view="one"]'),wide=tab.locator('[data-split-view="two"]');
  const span=await tab.locator('.split-node').evaluate(node=>node.getBoundingClientRect().width-6);
  await tab.getByRole('textbox',{name:'Draft one'}).fill('Retained compact draft');
  await issue(tab,'pane.resize',{splitId:'columns',ratio:332/span,span});
  await expect.poll(()=>narrow.getByLabel('Compact one').textContent()).toBe('compact');
  expect(await narrow.evaluate(node=>node.getBoundingClientRect().width)).toBeCloseTo(330,0);
  expect(await wide.getByLabel('Compact two').textContent()).toBe('wide');
  if(check==='breadcrumb'){
   expect(await narrow.locator('.breadcrumb>span').first().evaluate(node=>getComputedStyle(node).display)).toBe('none');
   expect(await narrow.locator('.breadcrumb>strong').isVisible()).toBe(true);
   expect(await wide.locator('.breadcrumb>span').first().isVisible()).toBe(true);
  }else{
   const trigger=narrow.getByRole('button',{name:'History',exact:true});
   expect(await trigger.getAttribute('aria-label')).toBe('History');
   expect(await trigger.innerText()).toBe('');
   const rect=await trigger.boundingBox();expect(rect?.width).toBe(32);expect(rect?.height).toBe(32);
   expect(await wide.getByRole('button',{name:'History',exact:true}).innerText()).toBe('History');
   await trigger.click();await tab.getByRole('menu',{name:'History',exact:true}).waitFor();
   await tab.keyboard.press('Escape');await expect.poll(()=>trigger.evaluate(node=>node===document.activeElement)).toBe(true);
  }
  await issue(tab,'pane.resize',{splitId:'columns',ratio:483/span,span});
  await expect.poll(()=>narrow.getByLabel('Compact one').textContent()).toBe('wide');
  expect(await narrow.evaluate(node=>node.getBoundingClientRect().width)).toBeCloseTo(481,0);
  expect(await narrow.locator('.breadcrumb>span').first().isVisible()).toBe(true);
  expect(await narrow.getByRole('button',{name:'History',exact:true}).innerText()).toBe('History');
  expect(await tab.getByRole('textbox',{name:'Draft one'}).inputValue()).toBe('Retained compact draft');
  expect(await tab.evaluate(()=>(window as any).mounts)).toEqual({one:1,two:1});
 }finally{await tab.close();}
});

});
