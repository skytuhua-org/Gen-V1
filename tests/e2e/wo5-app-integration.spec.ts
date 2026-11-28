import {expect,test,type Page} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import {EMPTY_USAGE} from '../../packages/contracts';
import {getPreferences,mergePreferences,type UiPreferences} from '../../packages/contracts/preferences';
import {shellInit,shellRoute,shellSnapshot} from '../../scripts/capture-ui/shell-api';
import {projectContext} from '../../scripts/capture-ui/browser-data';
import {serveTaskSplitLayout} from './task-interface-fixture';

async function host(page:Page,legacyTitle?:string){
 const snapshot=shellSnapshot(),commands:{type:string;threadId:string;payload:{content?:string}}[]=[],unexpected:string[]=[];
 const workingCopy={id:'copy-one',path:'/synthetic/copy-one'};
 if(legacyTitle!==undefined)snapshot.threads[0].title=legacyTitle;
 snapshot.threads[0].projectId='capture-project';snapshot.threads[0].projectName='Audit project';
 snapshot.messages=Array.from({length:125},(_,i)=>({...snapshot.messages[0],id:'message-'+i,content:'Workspace integration evidence '+i}));
 snapshot.memory=[{id:'note',threadId:'one',key:'decision',content:'Keep this owner note.',revision:1,author:'user',updatedAt:'2026-11-10T00:00:00Z'}];
 snapshot.usage.one={...EMPTY_USAGE,inputTokens:18321,outputTokens:791,cost:0.012345,sessionPercent:23.456,weeklyPercent:67.89,contextTokens:18000,contextWindow:100000};
 snapshot.data=[{id:'recorded',threadId:'one',revision:1,createdAt:'2026-11-10T00:00:00Z',provenance:'Synthetic executor record',value:{title:'Recorded comparison',before:'Old recorded value',after:'New recorded value'}}];
 await page.addInitScript(shellInit);
 await serveTaskSplitLayout(page,snapshot);
 await page.route('**/*',async route=>{
  const url=new URL(route.request().url()),path=url.pathname;
  snapshot.threads[0].workspaceId=workingCopy.id;
  if(url.origin!=='http://127.0.0.1:5527'){unexpected.push(url.origin+path);return route.abort('blockedbyclient');}
  if(!path.startsWith('/api/'))return route.continue();
  if(['/api/split-workspace','/api/split-workspace/profiles','/api/split-workspace/commands'].includes(path)){
   if(path!=='/api/split-workspace/commands')expect(url.searchParams.toString()).toBe('workspaceId=workspace');
   return route.fallback();
  }
  if(path.startsWith('/api/projects/capture-project/')){
   expect(url.searchParams.get('threadId')).toBe('one');
   if(path.endsWith('/checkpoints/capability'))return route.fulfill({json:{available:false,restore:false}});
   if(path.endsWith('/context'))return route.fulfill({json:{...projectContext,threadId:'one',workingCopy}});
   if(path.endsWith('/git'))return route.fulfill({json:{head:'a'.repeat(40),revision:'b'.repeat(64),branch:'audit',files:[{path:'capture.txt',added:4,removed:2,index:' ',worktree:'M',staged:false}],diff:'Live same-owner diff',stagedDiff:'',truncated:false,gitWrite:false}});
   if(path.endsWith('/files'))return route.fulfill({json:{path:'',entries:[{name:'capture.txt',path:'capture.txt',kind:'file',bytes:24}],truncated:false}});
   if(path.endsWith('/file'))return route.fulfill({json:{text:'Synthetic integration file preview',binary:false,sha256:'a'.repeat(64)}});
  }
  if(path==='/api/terminals'){
   const body=route.request().postDataJSON();expect(body.projectId).toBe('capture-project');expect(body.threadId).toBe('one');
   const output='FAIL workspace.test.ts\r\nExpected 3 panels; received 2 panels\r\n';
   return route.fulfill({json:{id:body.terminalId,projectId:body.projectId,threadId:body.threadId,output,start:0,cursor:output.length,exited:true,exitCode:1}});
  }
  if(path==='/api/commands')commands.push(route.request().postDataJSON());
  const workbenchMatch=path.match(/^\/api\/workbench\/threads\/([^/]+)(\/inputs)?$/);
  if(workbenchMatch)return route.fulfill({json:workbenchMatch[2]?{logicalOwner:{threadId:workbenchMatch[1],projectId:'capture-project',workspaceId:workingCopy.id},inputs:[]}:{logicalOwner:{threadId:workbenchMatch[1],projectId:'capture-project',workspaceId:workingCopy.id},enabled:false,sources:[],sourceCapabilities:[]}});
  const allowed=['/api/bootstrap','/api/snapshot','/api/shell-settings','/api/models','/api/workspace','/api/shell/navigation','/api/shell/settings','/api/shell/archive','/api/shell/resources','/api/plugins','/api/skills/available','/api/environment','/api/integrations','/api/commands','/api/split-workspace/profiles'];
  if(allowed.includes(path)||/^\/api\/shell\/navigation\/[^/]+$/.test(path))return shellRoute(route,snapshot,false);
  unexpected.push(path);return route.abort('blockedbyclient');
 });
 await page.goto('/');await expect(page.getByRole('textbox',{name:'Message',exact:true})).toBeEnabled();
 return {snapshot,commands,unexpected,workingCopy};
}
async function panel(page:Page,name:string){
 const open=page.getByRole('button',{name:'Open workspace panel',exact:true});if(await open.count())await open.click();
 const target=page.getByRole('tab',{name,exact:true});
 if(!await target.count()){await page.getByRole('button',{name:'Add surface',exact:true}).click();await page.getByRole('menuitemcheckbox',{name,exact:true}).click();}
 await target.click();
}
for(const width of [1440,1024,768])test(`actual App keeps Files, find, Changes and Memory owners at ${width}`,async({page},info)=>{
 await page.setViewportSize({width,height:1000});const h=await host(page);
 const draft=page.getByRole('textbox',{name:'Message',exact:true});await draft.fill('Keep my unsent integration draft');await draft.focus();await page.keyboard.press('Control+f');
 await page.getByRole('textbox',{name:'Find phrase'}).fill('workspace');await expect(page.getByRole('search')).toContainText('1 of 100');
 await page.getByRole('button',{name:'Load earlier messages',exact:true}).click();await expect(page.getByRole('search')).toContainText('26 of 125');
 await page.getByRole('textbox',{name:'Find phrase',exact:true}).press('Escape');await expect(draft).toBeFocused();await expect(draft).toHaveValue('Keep my unsent integration draft');
 await panel(page,'Files');await page.getByRole('button',{name:'capture.txt',exact:true}).click();await expect(page.locator('.files-preview')).toContainText('Synthetic integration file preview');
 await page.getByRole('button',{name:'Inspect changes',exact:true}).click();await expect(page.locator('.live-diff')).toContainText('Live same-owner diff');
 await page.getByRole('tab',{name:'Recorded',exact:true}).click();await expect(page.locator('.workspace-diffs')).toContainText('Recorded comparison');
 await page.getByRole('tab',{name:'History',exact:true}).click();await expect(page.getByRole('tabpanel').last()).toContainText('Checkpoint history unavailable.');
 await expect(page.getByRole('button',{name:'Restore selected files'})).toHaveCount(0);
 await panel(page,'Memory');const note=page.getByRole('textbox',{name:'Note decision',exact:true});await expect(note).toBeEnabled();await note.fill('Retain this unsaved owner note.');
 await panel(page,'Executor output');await expect(page.getByRole('region',{name:'Thread memory'})).toHaveCount(0);
 await panel(page,'Memory');await expect(note).toHaveValue('Retain this unsaved owner note.');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(h.unexpected).toEqual([]);expect(h.commands.filter(c=>c.type==='message.send')).toEqual([]);
 const out=info.outputPath('screenshots');await mkdir(out,{recursive:true});await page.screenshot({path:`${out}/notes-${width}.png`,fullPage:true});
});
test('actual terminal selection reaches the same unsent composer and is serialized once by normal Send',async({page})=>{
 const h=await host(page);await panel(page,'Terminal');await expect(page.locator('.xterm-screen')).toBeVisible();
 await page.locator('.xterm-helper-textarea').focus();await page.keyboard.press('Control+Shift+a');
 await page.getByRole('button',{name:'Add selection to prompt'}).click();
 const chip=page.getByRole('button',{name:/^Terminal selection ·/});await expect(chip).toBeVisible();expect(h.commands.filter(c=>c.type==='message.send')).toEqual([]);
 await chip.click();await page.getByLabel('Excerpt text').fill('Reviewed failure output');await page.getByRole('button',{name:'Save excerpt'}).click();
 await page.getByRole('button',{name:'Send message',exact:true}).click();await expect.poll(()=>h.commands.filter(c=>c.type==='message.send').length).toBe(1);
 const sent=h.commands.find(c=>c.type==='message.send')!;expect(sent.threadId).toBe('one');expect(sent.payload.content?.match(/Reviewed failure output/g)).toHaveLength(1);await expect(chip).toHaveCount(0);expect(h.unexpected).toEqual([]);
});
test('Settings Escape cancels shortcut capture and only records it for Stop',async({page})=>{
 const h=await host(page);
 await page.route('**/api/commands',async route=>{
  const command=route.request().postDataJSON();
  if(command.type!=='settings.update')return route.fallback();
  const preferences:Partial<UiPreferences>=command.payload.preferences??{};
  h.commands.push(command);
  h.snapshot.settings.preferences=mergePreferences(getPreferences(h.snapshot.settings),preferences);
  return route.fulfill({json:{commandId:command.id,eventSeq:++h.snapshot.seq,result:{}}});
 });
 const opener=page.getByRole('button',{name:'Settings',exact:true});
 await opener.click();
 const dialog=page.getByRole('dialog',{name:'Settings',exact:true});
 await dialog.getByRole('button',{name:'Keyboard Shortcuts',exact:true}).click();
 const capture=dialog.getByRole('textbox',{name:'Toggle sidebar shortcut',exact:true});
 const row=dialog.locator('[data-setting-id="harness-keybinding-toggleSidebar"]');
 const original=await capture.inputValue();
 await capture.focus();
 await page.keyboard.press('Escape');
 await expect(dialog).toBeVisible();
 await expect(row).toBeFocused();
 await expect(capture).toHaveValue(original);
 expect(h.commands.filter(command=>command.type==='settings.update')).toHaveLength(0);
 await capture.focus();
 expect(await dialog.evaluate(element=>element.dispatchEvent(new Event('cancel',{cancelable:true})))).toBe(false);
 await expect(row).toBeFocused();
 await expect(dialog).toBeVisible();

 const stop=dialog.getByRole('textbox',{name:'Stop active run shortcut',exact:true});
 await stop.focus();
 await page.keyboard.press('Alt+s');
 await expect(stop).toHaveValue('Alt+S');
 await stop.focus();
 await page.keyboard.press('Escape');
 await expect(stop).toHaveValue('Escape');
 expect(h.commands.at(-1)).toMatchObject({type:'settings.update',payload:{preferences:{keybindings:{stop:'Escape'}}}});
 await expect(dialog).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(dialog).toHaveCount(0);
 await expect(opener).toBeFocused();
});

test('production overview and compact usage retain their exact destinations under reduced motion and light zoom',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});const h=await host(page);
 await page.evaluate(()=>{document.documentElement.dataset.theme='light';document.documentElement.dataset.motion='off';document.documentElement.style.zoom='1.5';});
 await page.getByRole('button',{name:'Expand Project overview',exact:true}).click();await expect(page.locator('.project-context-card')).toContainText('Audit project');
 await expect(page.locator('.project-context-card').getByRole('button',{name:/^Changes/})).toHaveCount(0);
 await page.getByRole('button',{name:'Show live usage',exact:true}).click();
 await page.getByRole('button',{name:'Inspect live usage',exact:true}).click();await expect(page.locator('.floating-usage-details dl')).toHaveCount(0);
 const open=page.getByRole('button',{name:'Open Usage',exact:true});await open.focus();await page.keyboard.press('Enter');
 const usage=page.getByRole('dialog',{name:'Usage',exact:true});await expect(usage).toContainText('Audit the workspace');await expect(usage).toContainText('0.012345');
 await usage.getByRole('tab',{name:'Tokens',exact:true}).click();await expect(usage).toContainText('18,321');await usage.getByRole('tab',{name:'Limits',exact:true}).click();await expect(usage).toContainText('67.9%');
 await page.keyboard.press('Escape');await expect(open).toBeFocused();expect(h.unexpected).toEqual([]);
});

for(const width of [1440,1024,768])test(`QA r1 actual App saves, restores and deletes named drafts at ${width}`,async({page},info)=>{
 await page.setViewportSize({width,height:1000});const h=await host(page),input=page.getByRole('textbox',{name:'Message',exact:true});
 await input.fill('Saved original prompt');const drafts=page.getByRole('button',{name:'Saved drafts',exact:true});await expect(drafts).toBeEnabled();await drafts.click();
 await page.getByRole('button',{name:'Save current prompt',exact:true}).click();await page.getByRole('textbox',{name:'Draft name',exact:true}).fill('Integration prompt');await page.getByRole('button',{name:'Save draft',exact:true}).click();await expect(page.getByRole('dialog',{name:'Save prompt',exact:true})).toBeHidden();
 await input.fill('Keep my current prompt');await drafts.click();await expect(page.getByRole('dialog',{name:'Saved drafts',exact:true})).toContainText('Integration prompt');
 await page.getByRole('button',{name:'Restore',exact:true}).click();await expect(page.getByRole('dialog',{name:'Restore saved draft',exact:true})).toContainText('Saved original prompt');
 await page.screenshot({path:info.outputPath(`saved-drafts-${width}.png`),fullPage:true});await page.getByRole('button',{name:'Replace text',exact:true}).click();await expect(input).toHaveValue('Saved original prompt');await expect(input).toBeFocused();
 await drafts.click();await expect(page.getByRole('dialog',{name:'Saved drafts',exact:true})).toContainText('Keep my current prompt');await page.keyboard.press('Escape');await page.reload();await expect(input).toHaveValue('Saved original prompt');await drafts.click();
 await page.getByRole('button',{name:'Delete draft Integration prompt',exact:true}).click();await page.getByRole('button',{name:'Delete draft',exact:true}).click();await drafts.click();await expect(page.getByRole('dialog',{name:'Saved drafts',exact:true})).not.toContainText('Integration prompt');
 expect(h.commands.filter(command=>command.type==='message.send')).toEqual([]);expect(h.unexpected).toEqual([]);
});

test('QA r1 actual App fences named libraries by thread account and working copy',async({page})=>{
 const h=await host(page),input=page.getByRole('textbox',{name:'Message',exact:true}),drafts=page.getByRole('button',{name:'Saved drafts',exact:true});
 await input.fill('Private local owner text');await drafts.click();await page.getByRole('button',{name:'Save current prompt',exact:true}).click();await page.getByLabel('Draft name',{exact:true}).fill('Owner library');await page.getByRole('button',{name:'Save draft',exact:true}).click();await expect(page.getByRole('dialog',{name:'Save prompt',exact:true})).toBeHidden();
 h.workingCopy.id='copy-two';await page.reload();await expect(drafts).toBeEnabled();await drafts.click();await expect(page.getByRole('dialog',{name:'Saved drafts',exact:true})).toContainText('No saved drafts yet.');await page.keyboard.press('Escape');
 h.workingCopy.id='copy-one';h.snapshot.threads[0].accountId='other-account';await page.reload();await expect(drafts).toBeEnabled();await drafts.click();await expect(page.getByRole('dialog',{name:'Saved drafts',exact:true})).toContainText('No saved drafts yet.');await page.keyboard.press('Escape');
 h.snapshot.threads[0].accountId=null;await page.reload();await expect(drafts).toBeEnabled();await drafts.click();await expect(page.getByRole('dialog',{name:'Saved drafts',exact:true})).toContainText('Owner library');await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Review keyboard navigation Ready',exact:true}).click();await expect(drafts).toBeEnabled();await drafts.click();await expect(page.getByRole('dialog',{name:'Saved drafts',exact:true})).toContainText('No saved drafts yet.');expect(h.commands.filter(command=>command.type==='message.send')).toEqual([]);expect(h.unexpected).toEqual([]);
});

test('legacy thread title is a single line in navigation, the conversation and Rename',async({page})=>{
 const title='Legacy conversation with a multiline title';
 await host(page,'  Legacy conversation\nwith a\t multiline   title  ');
 const row=page.getByRole('button',{name:new RegExp('^'+title)});
 await expect(row).toHaveAttribute('aria-label',new RegExp('^'+title));
 const header=page.locator('.breadcrumb strong').first();
 await expect(header).toHaveText(title);
 expect(await header.textContent()).toBe(title);
 await expect(page.locator('.split-tab-strip [role=tab]').first()).toHaveAttribute('title',title);
 await page.getByRole('button',{name:'Options for '+title,exact:true}).click();
 await page.getByRole('menuitem',{name:'Rename thread',exact:true}).click();
 await expect(page.getByRole('dialog',{name:'Rename thread'}).getByRole('textbox')).toHaveValue(title);
});

test('wide viewport keeps the chat title readable at actual split pane widths',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await page.emulateMedia({reducedMotion:'reduce'});
 const title='Conversation title with enough words to exceed the available pane width';
 await host(page,title);
 const surface=page.locator('.chat-view-surface:visible').first();
 const header=surface.locator('.chat-view-header');
 const breadcrumb=header.locator('.breadcrumb');
 const name=breadcrumb.locator('strong');
 const project=breadcrumb.getByText('Audit project',{exact:true});
 const meta=header.locator('.conversation-metadata');
 for(const [width,showProject,showMeta] of [[700,true,true],[520,true,true],[500,false,true],[440,false,true],[400,false,false],[360,false,false],[345,false,false]] as const){
  await surface.evaluate((element,width)=>{(element as HTMLElement).style.width=width+'px';},width);
  await expect.poll(()=>surface.evaluate(element=>element.getBoundingClientRect().width)).toBe(width);
  await expect(name).toBeVisible();
  if(showProject)await expect(project).toBeVisible();else await expect(project).toBeHidden();
  if(showMeta)await expect(meta).toBeVisible();else await expect(meta).toBeHidden();
  const bounds=await name.boundingBox();
  expect(bounds!.width).toBeGreaterThanOrEqual(width>=360?96:1);
  expect(await name.evaluate(element=>getComputedStyle(element).textOverflow)).toBe('ellipsis');
  if(width===345)expect(await name.evaluate(element=>element.scrollWidth>element.clientWidth)).toBe(true);
  await expect(header).toHaveAttribute('aria-label','Audit project / '+title);
  await expect(name).toHaveAttribute('title',title);
 }
 await expect(page.getByRole('region',{name:'Audit project / '+title,exact:true})).toBeVisible();
 await expect(header.getByRole('button',{name:'Find in conversation'})).toBeEnabled();
});

for(const motion of ['no-preference','reduce'] as const)test(`chat header motion follows the ${motion} policy on a discrete split`,async({page})=>{
 await page.setViewportSize({width:1220,height:900});
 await page.emulateMedia({reducedMotion:motion});
 await page.addInitScript(()=>{
  const native=Element.prototype.animate;
  Element.prototype.animate=function(...args){
   if(this.matches('.chat-view-header .breadcrumb'))document.documentElement.dataset.testHeaderSplitMotion=String((args[1] as KeyframeAnimationOptions)?.duration);
   return native.apply(this,args);
  };
 });
 await host(page);
 const header=page.locator('.chat-view-header:visible').first();
 const project=header.getByText('Audit project',{exact:true});
 await expect(project).toBeVisible();
 await page.getByRole('button',{name:'Area actions',exact:true}).first().click();
 await page.getByRole('menuitem',{name:'Split left / right',exact:true}).click();
 await expect(page.getByRole('separator',{name:'Resize columns'})).toBeVisible();
 await expect(project).toBeHidden();
 const pageRoot=page.locator('html');
 if(motion==='reduce')await expect(pageRoot).not.toHaveAttribute('data-test-header-split-motion');
 else await expect(pageRoot).toHaveAttribute('data-test-header-split-motion','150');
});

test('fixture blocks foreign canonical workspace requests',async({page})=>{
 const h=await host(page),url='https://outside.invalid/api/split-workspace?workspaceId=workspace';
 expect(await page.evaluate(url=>fetch(url).then(()=>true,()=>false),url)).toBe(false);
 expect(h.unexpected).toEqual(['https://outside.invalid/api/split-workspace']);
});

test('live Current patch styles unified lines and announces the staged selection', async ({page}, info) => {
 await page.setViewportSize({width:390,height:850});
 await host(page);
 const diff=['--- a/capture.txt','+++ b/capture.txt','@@ -1 +1 @@','-Original line','+Replacement line with enough text to scroll at a narrow viewport width.'].join('\n');
 await page.route('**/api/projects/capture-project/git?*',route=>route.fulfill({json:{
  head:'a'.repeat(40),revision:'b'.repeat(64),branch:'audit',files:[],diff,stagedDiff:'',gitWrite:false,truncated:false,
 }}));
 await page.getByRole('button',{name:'Inspect changes',exact:true}).click();
 const patch=page.locator('.live-diff');
 await expect(patch.locator('[data-kind=hunk]')).toHaveText('@@ -1 +1 @@');
 await expect(patch.locator('[data-kind=remove]')).toHaveText('-Original line');
 const added=patch.locator('[data-kind=add]');
 await expect(added).toContainText('+Replacement line');
 await expect(patch.locator('[data-kind=header]')).toHaveCount(2);
 expect(await patch.evaluate(node=>node.scrollWidth>node.clientWidth)).toBe(true);
 const original=await added.evaluate(node=>getComputedStyle(node).backgroundColor);
 await page.evaluate(()=>document.documentElement.classList.add('diff-colors-blue-orange'));
 await expect.poll(()=>added.evaluate(node=>getComputedStyle(node).backgroundColor)).not.toBe(original);
 await page.screenshot({path:info.outputPath('live-current-diff.png')});
 const staged=page.getByRole('checkbox',{name:'Show staged changes',exact:true});
 await staged.check();
 await expect(page.locator('.live-diff-announcement')).toHaveText('Staged diff. No tracked changes in this view.');
 await expect(patch).toHaveCount(0);
 await expect(page.locator('.live-review .file-checkpoints-note')).toHaveText('No tracked changes in this view.');
 await staged.uncheck();
 await expect(page.locator('.live-diff-announcement')).toHaveText(/Unstaged diff/);
 await expect(patch).toBeVisible();
 await expect(staged).toBeFocused();
});

test('live Current file rows show readable status, known counts and blocked action reasons', async ({page},info) => {
 await page.setViewportSize({width:320,height:860});
 await host(page);
 let files=[{path:'new.txt',oldPath:'old.txt',index:'R',worktree:'M',removed:2,staged:true}];
 await page.route('**/api/projects/capture-project/git?*',route=>route.fulfill({json:{
  head:'a'.repeat(40),revision:'b'.repeat(64),branch:'audit',files,diff:'',stagedDiff:'',gitWrite:false,truncated:false,
 }}));
 await page.getByRole('button',{name:'Inspect changes',exact:true}).click();
 const list=page.locator('.live-change-list');
 const status=list.getByText('Renamed',{exact:true});
 await expect(status).toHaveAttribute('title','RM');
 await expect(list).toContainText('old.txt → new.txt');
 await expect(list).toContainText('−2');
 await expect(list).not.toContainText('?');
 await expect(list.getByRole('button',{name:'Unstage',exact:true})).toBeDisabled();
 await expect(list.getByRole('button',{name:'Unstage',exact:true})).toHaveAttribute('title','Git writes are disabled for this project');
 const current=page.locator('.live-review');
 await expect(current.locator('.review-revision')).toContainText('1 changed file');
 await expect(current.getByRole('checkbox',{name:'Show staged changes'})).toBeVisible();
 expect(await list.evaluate(node=>node.scrollWidth<=node.clientWidth)).toBe(true);
 await page.screenshot({path:info.outputPath('live-change-file-list.png')});

 files=[];
 const refresh=current.getByRole('button',{name:'Refresh',exact:true});
 await expect(refresh).toHaveAttribute('title','Refresh the changed-file list');
 await refresh.click();
 await expect(current.locator('.review-revision')).toContainText('no changed files');
 await expect(list.locator('li')).toHaveCount(0);
});
