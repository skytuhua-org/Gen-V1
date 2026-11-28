import {expect,test,type Page} from '@playwright/test';
import {applySplitWorkspaceCommand,createSplitWorkspaceLayout} from '../../packages/core/split-workspace-layout';
import {shellInit,shellRoute,shellSnapshot} from '../../scripts/capture-ui/shell-api';
import {projectContext} from '../../scripts/capture-ui/browser-data';
import {serveTaskSplitLayout} from './task-interface-fixture';

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('harness:summary:usage:v1',JSON.stringify({collapsed:false})));
 await page.addInitScript(()=>{const requests:unknown[]=[];Object.defineProperty(window,'wo5Requests',{value:requests});window.addEventListener('redundant-request',event=>requests.push((event as CustomEvent).detail));});
 await page.route('**/api/**',route=>route.abort('blockedbyclient'));
});
async function ownerApp(page:Page,mode:'chat'|'split'|'desktop'|'loading'='chat'){
 const snapshot=shellSnapshot();snapshot.threads[0].projectId='capture-project';
 let layout=applySplitWorkspaceCommand(createSplitWorkspaceLayout(),'view.open',{paneId:'pane-main',view:{id:'owner-thread',kind:'thread',binding:{authority:{kind:'local'},threadId:'one',projectId:'capture-project'}}});
 let releaseSend:()=>void=()=>{};
 const sendGate=new Promise<void>(resolve=>{releaseSend=resolve;});
 await page.addInitScript(shellInit);
 if(mode==='split')await page.addInitScript(()=>localStorage.setItem('harness:workspace-mode:v3','split'));
 if(mode==='loading')await page.addInitScript(()=>{
  const get=IDBObjectStore.prototype.get,held:(()=>void)[]=[];
  Object.assign(window,{wo5ReleaseComposerDraft:()=>held.splice(0).forEach(release=>release())});
  IDBObjectStore.prototype.get=function(key){const request=get.call(this,key);if(key==='draft:one')request.addEventListener('success',event=>{event.stopImmediatePropagation();held.push(()=>request.dispatchEvent(new Event('success')));},{once:true});return request;};
 });
 if(mode==='desktop')await page.addInitScript(()=>{
  let detached=false;const state=()=>({windows:[{id:'main',surface:{kind:'main'},ready:true,minimized:false},...(detached?[{id:'child',surface:{kind:'thread',threadId:'one'},ready:true,minimized:false}]:[])]});
  Object.assign(window,{harnessDesktop:{getContext:async()=>({windowId:'main',surface:{kind:'main'},...state()}),ready:async()=>{},onCloseRequested:()=>()=>{},focus:async()=>{},onState:(listener:(value:ReturnType<typeof state>)=>void)=>{Object.assign(window,{wo5SetDetached:(value:boolean)=>{detached=value;listener(state());}});return()=>{};}}});
 });
 await page.route('**/api/**',async route=>{
  const url=new URL(route.request().url()),path=url.pathname;
  if(path==='/api/projects/capture-project/context')return route.fulfill({json:{...projectContext,threadId:'one'}});
  if(path==='/api/projects/capture-project/git'){
   expect(url.searchParams.get('threadId')).toBe('one');
   return route.fulfill({json:{head:'a'.repeat(40),revision:'b'.repeat(64),branch:'audit',files:[],diff:'Owner fallback diff',stagedDiff:'',truncated:false,gitWrite:false}});
  }
  if(path==='/api/split-workspace')return route.fulfill({json:layout});
  if(path==='/api/split-workspace/profiles')return route.fulfill({json:[]});
  if(path==='/api/split-workspace/commands'){
   const command=route.request().postDataJSON();layout=applySplitWorkspaceCommand(layout,command.type,command.payload);
   return route.fulfill({json:{commandId:command.id,eventSeq:snapshot.seq,result:layout}});
  }
  if(path==='/api/commands'&&route.request().postDataJSON().type==='message.send')await sendGate;
  return shellRoute(route,snapshot,false);
 });
 await page.goto('/actual-app');
 if(mode==='loading')await expect(page.getByRole('button',{name:'Inspect changes',exact:true})).toBeDisabled();else await expect(page.getByRole('button',{name:'Inspect changes',exact:true})).toBeEnabled();
 const overview=page.locator('.summary-overview:visible').first();
 await overview.getByRole('button',{name:'Expand Project overview',exact:true}).click();
 await expect(overview.locator('.project-context-card')).toContainText('Audit project');
 return {overview,fallback:overview.getByRole('button',{name:/^Changes/}),releaseSend};
}
test('actual detached composer restores overview Changes until its owner docks again',async({page},info)=>{
 const {fallback}=await ownerApp(page,'desktop');await expect(fallback).toHaveCount(0);
 await page.evaluate(()=>(window as unknown as {wo5SetDetached:(value:boolean)=>void}).wo5SetDetached(true));
 await expect(page.getByRole('button',{name:'Focus chat',exact:true})).toBeVisible();await expect(fallback).toBeVisible();
 await page.screenshot({path:info.outputPath('r2-detached.png'),fullPage:true});
 await fallback.focus();await page.keyboard.press('Enter');await expect(page.locator('.live-diff')).toContainText('Owner fallback diff');
 await page.evaluate(()=>(window as unknown as {wo5SetDetached:(value:boolean)=>void}).wo5SetDetached(false));
 await expect(page.getByRole('button',{name:'Inspect changes',exact:true})).toBeEnabled();await expect(fallback).toHaveCount(0);
});
test('a parked conversation float resizes with the focused keyboard handle',async({page})=>{
 await ownerApp(page,'split');
 await page.getByRole('button',{name:'Area actions',exact:true}).click();
 await page.getByRole('menuitem',{name:'Detach conversation',exact:true}).click();
 const surface=page.locator('[data-split-view="owner-thread"][data-floating="true"]');
 const handle=surface.getByRole('button',{name:/^Resize /});
 await expect(handle).toBeVisible();
 const geometry=()=>surface.evaluate(node=>({
  x:parseFloat((node as HTMLElement).style.left), y:parseFloat((node as HTMLElement).style.top),
  width:parseFloat((node as HTMLElement).style.width),height:parseFloat((node as HTMLElement).style.height),
 }));
 const start=await geometry();
 await handle.focus();
 await page.keyboard.press('ArrowRight');
 await expect.poll(geometry).toEqual({...start,width:start.width+8});
 await page.keyboard.press('Shift+ArrowDown');
 await expect.poll(geometry).toEqual({...start,width:start.width+8,height:start.height+24});
 await page.keyboard.press('ArrowLeft');await page.keyboard.press('ArrowUp');
 const resized={...start,height:start.height+16};
 await expect.poll(geometry).toEqual(resized);
 await page.keyboard.press('Enter');await page.keyboard.press('Space');
 expect(await geometry()).toEqual(resized);
 await expect(handle).toBeFocused();
 await expect(handle).toHaveAttribute('title','Resize. Arrow keys adjust size; Shift for larger steps.');
 for(let step=0;step<20;step++){await page.keyboard.press('Shift+ArrowLeft');await page.keyboard.press('Shift+ArrowUp');}
 await expect.poll(geometry).toEqual({...start,width:320,height:300});
 await expect(handle).toBeFocused();
 const box=(await handle.boundingBox())!;
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
 await page.mouse.down();await page.mouse.move(box.x+box.width/2+18,box.y+box.height/2+20);
 await page.mouse.up();
 await expect.poll(geometry).toEqual({...start,width:338,height:320});
 await handle.focus();await page.keyboard.press('ArrowRight');
 await expect.poll(geometry).toEqual({...start,width:346,height:320});
 const persisted=()=>surface.evaluate(node=>{
  const workspaceId=node.closest<HTMLElement>('[data-workspace-id]')?.dataset.workspaceId;
  const record=JSON.parse(localStorage.getItem('harness:conversation-placement:v1:'+workspaceId)??'{}');
  return record.floating?.['owner-thread']?.rect;
 });
 await expect.poll(persisted).toEqual({...start,width:346,height:320});
});

for(const state of ['parked','minimized'] as const)test(`actual ${state} split composer retains its same-owner overview Changes route`,async({page},info)=>{
 const {fallback}=await ownerApp(page,'split');await expect(fallback).toHaveCount(0);
 if(state==='parked'){
  await page.getByRole('button',{name:'Area actions',exact:true}).click();await page.getByRole('menuitem',{name:'Park current view',exact:true}).click();
 }else await page.getByRole('button',{name:'Minimize area',exact:true}).click();
 await expect(page.getByRole('button',{name:'Inspect changes',exact:true})).toHaveCount(0);await expect(fallback).toBeVisible();
 await page.screenshot({path:info.outputPath(`r2-${state}.png`),fullPage:true});
 if(state==='minimized'){
  await page.getByRole('button',{name:'Restore area',exact:true}).click();await expect(page.getByRole('button',{name:'Inspect changes',exact:true})).toBeEnabled();await expect(fallback).toHaveCount(0);
  await page.getByRole('button',{name:'Minimize area',exact:true}).click();await expect(fallback).toBeVisible();
 }
 await fallback.focus();await page.keyboard.press('Enter');await expect(page.locator('.live-diff')).toContainText('Owner fallback diff');
});
test('actual loading composer keeps overview Changes until its draft is ready',async({page})=>{
 const {fallback}=await ownerApp(page,'loading');await expect(fallback).toBeVisible();
 await page.evaluate(()=>(window as unknown as {wo5ReleaseComposerDraft:()=>void}).wo5ReleaseComposerDraft());
 await expect(page.getByRole('button',{name:'Inspect changes',exact:true})).toBeEnabled();await expect(fallback).toHaveCount(0);
});
test('actual busy composer restores overview Changes until its action is enabled again',async({page})=>{
 const {fallback,releaseSend}=await ownerApp(page);await expect(fallback).toHaveCount(0);
 await page.getByRole('textbox',{name:'Message',exact:true}).fill('Hold this ordinary send');
 try{
  await page.getByRole('button',{name:'Send message',exact:true}).click();await expect(page.getByRole('button',{name:'Inspect changes',exact:true})).toBeDisabled();await expect(fallback).toBeVisible();
 }finally{releaseSend();}
 await expect(page.getByRole('button',{name:'Inspect changes',exact:true})).toBeEnabled();await expect(fallback).toHaveCount(0);
});
test('production App hides the equivalent overview route and opens same-owner Changes from its composer',async({page})=>{
 const snapshot=shellSnapshot();snapshot.threads[0].projectId='capture-project';
 await page.addInitScript(shellInit);
 await page.route('**/api/**',async route=>{
  const path=new URL(route.request().url()).pathname;
  if(path==='/api/projects/capture-project/context')return route.fulfill({json:{...projectContext,threadId:'one'}});
  if(path==='/api/projects/capture-project/git'){
   expect(new URL(route.request().url()).searchParams.get('threadId')).toBe('one');
   return route.fulfill({json:{projectId:'capture-project',threadId:'one',head:'a'.repeat(40),revision:'b'.repeat(64),branch:'audit',files:[],diff:'Same-owner production diff',stagedDiff:'',gitWrite:false}});
  }
  return shellRoute(route,snapshot,false);
 });
 await serveTaskSplitLayout(page,snapshot);
 await page.goto('/actual-app');
 await page.getByRole('button',{name:'Expand Project overview',exact:true}).click();
 await expect(page.locator('.project-context-card')).toContainText('Audit project');
 await expect(page.locator('.project-context-card').getByRole('button',{name:/^Changes/})).toHaveCount(0);
 await page.getByRole('button',{name:'Inspect changes',exact:true}).click();
 await expect(page.locator('.live-diff')).toContainText('Same-owner production diff');
});
for(const width of [1440,1024,768])test(`reduced UI keeps its destinations at ${width}`,async({page},info)=>{
 await page.setViewportSize({width,height:1000});await page.goto('/redundant-ui');
 await expect(page.getByRole('button',{name:'work/layout',exact:true})).toBeVisible();
 await expect(page.locator('.project-context-card').getByRole('button',{name:/^Changes/})).toHaveCount(0);
 await expect(page.locator('.floating-usage-details dl')).toHaveCount(0);
 const changes=page.getByRole('button',{name:'Inspect changes',exact:true});await changes.focus();await page.keyboard.press('Enter');
 await expect(page.getByRole('region',{name:'Tool destination'})).toContainText('new live value');
 await expect(page.getByRole('region',{name:'Tool destination'})).toContainText('+4 −2');
 expect(await page.evaluate(()=>(window as unknown as {wo5Requests:unknown[]}).wo5Requests)).toContainEqual({path:'/api/projects/project-one/git',threadId:'thread-a',method:'GET'});
 const open=page.getByRole('button',{name:'Open Usage',exact:true});await open.focus();await page.keyboard.press('Enter');
 const dialog=page.getByRole('dialog',{name:'Usage',exact:true});await expect(dialog).toContainText('Audit the workspace');await expect(dialog).not.toContainText('Another owner');
 await expect(dialog).toContainText('0.012345');
 await page.screenshot({path:info.outputPath(`6-usage-${width}.png`),fullPage:true});
 await dialog.getByRole('tab',{name:'Tokens',exact:true}).click();await expect(dialog).toContainText('18,321');await expect(dialog).toContainText('791');
 await dialog.getByRole('tab',{name:'Limits',exact:true}).click();await expect(dialog).toContainText('23.5%');await expect(dialog).toContainText('67.9%');
 await page.keyboard.press('Escape');await expect(open).toBeFocused();
 await page.getByRole('button',{name:'Usage panel',exact:true}).click();await expect(page.locator('.usage-context')).toContainText('18.0%');
 await page.getByRole('button',{name:'Recorded changes',exact:true}).click();await expect(page.getByRole('region',{name:'Tool destination'})).toContainText('new recorded value');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await expect(page.getByRole('textbox',{name:'Prompt',exact:true})).toHaveValue('Keep my composer draft');
});
for(const mode of ['custom','scoped','detached'])test(`retains the overview route for unproven ${mode} owners`,async({page})=>{
 await page.goto('/redundant-ui?mode='+mode);
 const overview=page.locator('.project-context-card').getByRole('button',{name:/^Changes/});await expect(overview).toBeVisible();await overview.focus();await page.keyboard.press('Enter');
 await expect(page.getByRole('region',{name:'Tool destination'})).toContainText('new live value');
 await expect(page.getByRole('button',{name:'Inspect changes',exact:true})).toHaveCount(0);
 if(mode==='detached'){
  await expect(page.locator('.floating-usage-details')).toContainText('18,321');await expect(page.locator('.floating-usage-details')).toContainText('67.9%');
  await expect(page.getByRole('button',{name:'Open Usage',exact:true})).toHaveCount(0);
 }
});
test('a proven custom owner can use the equivalent composer action',async({page})=>{
 await page.goto('/redundant-ui?mode=custom-proven');await expect(page.getByRole('button',{name:'work/layout',exact:true})).toBeVisible();
 await expect(page.locator('.project-context-card').getByRole('button',{name:/^Changes/})).toHaveCount(0);
 await page.getByRole('button',{name:'Inspect changes',exact:true}).click();await expect(page.locator('.live-diff')).toContainText('new live value');
});
test('ownerless usage retains details rather than assuming a destination',async({page})=>{
 await page.goto('/redundant-ui?mode=ownerless');await expect(page.locator('.floating-usage-details dl')).toContainText('Input tokens');
});
test('Memory preserves its unsaved draft through navigation and reload',async({page})=>{
 await page.goto('/redundant-ui');await page.getByRole('button',{name:'Memory',exact:true}).click();
 const editor=page.getByRole('textbox',{name:'Note decision',exact:true});await expect(editor).toBeEnabled();await editor.fill('Keep this unsaved owner A note.');
 await page.getByRole('button',{name:'Usage panel',exact:true}).click();
 await expect(page.getByRole('region',{name:'Thread memory',exact:true})).toHaveCount(0);
 await expect(editor).toHaveCount(0);
 await page.getByRole('button',{name:'Memory',exact:true}).click();await expect(editor).toHaveValue('Keep this unsaved owner A note.');
 await page.reload();await page.getByRole('button',{name:'Memory',exact:true}).click();await expect(editor).toHaveValue('Keep this unsaved owner A note.');
 await expect(page.getByRole('region',{name:'Thread memory',exact:true})).toHaveCount(1);
});
test('retained destinations surface actual loading/error/empty boundaries',async({page})=>{
 await page.goto('/redundant-ui?state=loading');await expect(page.locator('.project-context-card')).toContainText('Loading project');
 await page.evaluate(()=>window.dispatchEvent(new Event('redundant-release')));await expect(page.getByRole('button',{name:'work/layout',exact:true})).toBeVisible();
 await page.goto('/redundant-ui?state=error');await expect(page.locator('.project-context-card').getByRole('alert')).toContainText('could not load');
 await page.goto('/redundant-ui?state=empty');await expect(page.locator('.project-context-card')).toContainText('No project connected.');
 await page.goto('/redundant-ui?state=usage-loading');await page.getByRole('button',{name:'Open Usage',exact:true}).click();await expect(page.getByRole('dialog').getByRole('status')).toContainText('Refreshing usage');
 await page.goto('/redundant-ui?state=usage-error');await page.getByRole('button',{name:'Open Usage',exact:true}).click();await expect(page.getByRole('dialog').getByRole('alert')).toContainText('Usage refresh failed');
});
for(const motion of ['reduced','off'])test(`light/zoom keyboard destinations respect ${motion} motion`,async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/redundant-ui');
 await page.evaluate(motion=>{document.documentElement.dataset.theme='light';document.documentElement.dataset.motion=motion;document.documentElement.style.zoom='1.25';},motion);
 const opener=page.getByRole('button',{name:'Open Usage',exact:true});await opener.focus();
 expect(await opener.evaluate(el=>getComputedStyle(el).outlineStyle)).not.toBe('none');await page.keyboard.press('Enter');await expect(page.getByRole('dialog',{name:'Usage',exact:true})).toBeVisible();
 await page.keyboard.press('Escape');await expect(opener).toBeFocused();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

for(const width of [1440,620])test(`keyboard moves a conversation between areas at ${width}px`,async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 await ownerApp(page,'split');
 const panes=page.locator('.split-root-workarea [data-split-pane]');
 const sourceId=await panes.first().getAttribute('data-split-pane');
 const source=panes.and(page.locator(`[data-split-pane="${sourceId}"]`));
 const actions=source.getByRole('button',{name:'Area actions',exact:true});
 const move=page.getByRole('menuitem',{name:'Move to Empty area',exact:true});
 await actions.focus();await page.keyboard.press('Enter');
 await expect(move).toHaveCount(0);
 await page.keyboard.press('Home');
 await expect(page.getByRole('menuitem',{name:'Split left / right',exact:true})).toBeFocused();
 await page.keyboard.press('Enter');
 await expect(panes).toHaveCount(2);
 const targetId=await panes.last().getAttribute('data-split-pane');
 const target=panes.and(page.locator(`[data-split-pane="${targetId}"]`));
 await expect(target).toHaveAttribute('aria-label','Empty area');
 await page.setViewportSize({width,height:1000});
 if(width===620){
  const area=page.getByRole('combobox',{name:'Active workspace area',exact:true});
  await area.focus();await page.keyboard.press('Enter');
  await page.keyboard.press('Home');
  await expect(page.getByRole('option',{name:'Audit the workspace',exact:true})).toBeFocused();
  await page.keyboard.press('Enter');
 }
 await actions.focus();await page.keyboard.press('Enter');
 await expect(move).toBeEnabled();
 await page.keyboard.press('Home');
 for(let step=0;step<4 && !await move.evaluate(node=>node===document.activeElement);step++) await page.keyboard.press('ArrowDown');
 await expect(move).toBeFocused();
 await page.keyboard.press('Enter');
 if(width===620)await expect(source).toHaveCount(0);else await expect(source).toHaveAttribute('aria-label','Empty area');
 await expect(target.getByRole('tab',{name:'Audit the workspace',exact:true})).toHaveAttribute('aria-selected','true');
 await expect(target.getByRole('button',{name:'Area actions',exact:true})).toBeVisible();
});
