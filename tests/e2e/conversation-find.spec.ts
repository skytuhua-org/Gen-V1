import {test,expect,type Page} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import {shellInit,shellRoute,shellSnapshot} from '../../scripts/capture-ui/shell-api';


import {scopedContext,scopedEnvelope,scopedMessage} from '../scoped-conversation-fixture';
import {growingQaSpec,serveTaskFixture,serveTaskSplitLayout,taskFixture} from './task-interface-fixture';
async function setup(page:Page,count=3){
 const snapshot=shellSnapshot();snapshot.messages=Array.from({length:count},(_,i)=>({...snapshot.messages[0],id:'m'+i,content:i===0?'Review the **work**space, sidebar and composer.':i===1?'I reviewed the workspace and found two areas to check.':'The workspace panel starts closed.',role:i===0?'user':'assistant'}));
 await page.addInitScript(shellInit);await page.route('**/api/**',r=>shellRoute(r,snapshot,false));await serveTaskSplitLayout(page,snapshot);await page.goto('/fixture');await page.locator('.composer textarea').waitFor();return snapshot;
}
const phrase=(p:Page)=>p.getByRole('textbox',{name:'Find phrase'});
async function open(p:Page){await p.locator('.composer textarea').focus();await p.keyboard.press('Control+f');await expect(phrase(p)).toBeFocused();}
test('literal ranges cross formatting without modifying markup or copied code',async({page})=>{
 await setup(page);const before=await page.locator('.message-content').first().innerHTML();await open(page);await phrase(page).fill('workspace');await expect(page.getByRole('status').filter({hasText:'1 of 3'})).toBeVisible();
 expect(await page.locator('.message-content').first().innerHTML()).toBe(before);expect(await page.evaluate(()=>CSS.highlights.get('conversation-find-all')?.size)).toBe(3);
 await phrase(page).fill('[a].');await expect(page.getByRole('status').filter({hasText:'0 results'})).toBeVisible();await expect(page.getByLabel('Next match')).toBeDisabled();
});
test('find skips screen-reader-only labels without removing them from the transcript',async({page})=>{
 await setup(page);
 await page.locator('.message-content').first().evaluate(el=>{
  const role=document.createElement('span');role.className='sr-only';role.textContent='Assistant role label';el.prepend(role);
 });
 await open(page);
 await phrase(page).fill('Assistant role label');
 await expect(page.getByRole('status').filter({hasText:'0 results'})).toBeVisible();
 await expect(page.locator('.message-content .sr-only').first()).toHaveText('Assistant role label');
 await phrase(page).fill('workspace');
 await expect(page.getByRole('status').filter({hasText:'1 of 3'})).toBeVisible();
});
for(const [width,theme] of [[1280,'dark'],[560,'light']] as const){
 test(`indexes and scrolls to visible artifact text at ${width}px in ${theme} mode`,async({page})=>{
  await page.setViewportSize({width,height:640});
  await page.emulateMedia({reducedMotion:width===560?'reduce':'no-preference'});
  const spec=structuredClone(growingQaSpec);
  for(let i=0;i<12;i++){
   const id='before-'+i;
   spec.elements.history.children!.splice(i,0,id);
   spec.elements[id]={type:'Disclosure',props:{title:'Previous item '+i,text:'Detailed notes for an earlier item.',defaultOpen:true}};
  }
  spec.elements.tracking.props.text='Payment receipt for this package.';
  const snapshot=taskFixture(spec,{}, {trackingOpen:true});
  snapshot.settings.theme=theme;
  snapshot.messages[0].content='Payment information in the conversation.';
  await serveTaskFixture(page,snapshot);
  await page.goto('/fixture');
  const target=page.getByText('Payment receipt for this package.',{exact:true});
  const body=page.getByLabel('Delivery questions',{exact:true});
  await expect(target).toBeAttached();
  // The inline app expands this region by default. Force a bounded body to exercise nested scrolling too.
  await body.evaluate(el=>{el.style.maxHeight='180px';el.style.overflow='auto';el.scrollTop=0;});
  expect(await body.evaluate(el=>el.scrollHeight>el.clientHeight)).toBe(true);
  await open(page);
  await phrase(page).fill('payment');
  await expect(page.getByRole('status').filter({hasText:'1 of 2'})).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status').filter({hasText:'2 of 2'})).toBeVisible();
  await expect(target).toBeInViewport();
  expect(await body.evaluate(el=>el.scrollTop)).toBeGreaterThan(0);
  expect(await page.evaluate(()=>[...CSS.highlights.get('conversation-find-current')??[]].map(range=>range.startContainer.parentElement?.closest('.artifact')!==null))).toEqual([true]);
  await page.keyboard.press('Shift+Enter');
  await expect(page.getByRole('status').filter({hasText:'1 of 2'})).toBeVisible();
  for(const excluded of ['Can delivery be split?','Your confirmation shows the fee','Task surface']){
   await phrase(page).fill(excluded);
   await expect(page.getByRole('status').filter({hasText:'0 results'})).toBeVisible();
  }
 });
}
test('a rendered artifact is searchable when no transcript messages are loaded',async({page})=>{
 const snapshot=taskFixture(growingQaSpec,{}, {trackingOpen:true});
 snapshot.messages=[];
 await serveTaskFixture(page,snapshot);
 await page.goto('/fixture');
 await page.getByRole('button',{name:'Find in conversation',exact:true}).click();
 await phrase(page).fill('tracking entry');
 await expect(page.getByRole('status').filter({hasText:'1 of 1'})).toBeVisible();
});
test('wraps both directions; Escape restores opener and draft caret',async({page})=>{
 await setup(page);const draft=page.locator('.composer textarea');await draft.fill('Retained draft workspace');await draft.evaluate((el:HTMLTextAreaElement)=>el.setSelectionRange(3,3));await open(page);await phrase(page).fill('workspace');await page.keyboard.press('Enter');await expect(page.getByRole('status').filter({hasText:'2 of 3'})).toBeVisible();await page.keyboard.press('Shift+Enter');await page.keyboard.press('Shift+Enter');await expect(page.getByRole('status').filter({hasText:'3 of 3'})).toBeVisible();await page.keyboard.press('Escape');await expect(draft).toBeFocused();await expect(draft).toHaveValue('Retained draft workspace');expect(await draft.evaluate((el:HTMLTextAreaElement)=>el.selectionStart)).toBe(3);
});
test('ignores composing keyboard events',async({page})=>{
 await setup(page);await open(page);await phrase(page).fill('workspace');await phrase(page).dispatchEvent('keydown',{key:'Enter',isComposing:true});await expect(page.getByRole('status').filter({hasText:'1 of 3'})).toBeVisible();await phrase(page).dispatchEvent('keydown',{key:'Escape',isComposing:true});await expect(phrase(page)).toBeVisible();
});
test('extends loaded history beyond 100; keeps the selected range when older messages mount',async({page})=>{
 await setup(page,125);await open(page);await phrase(page).fill('workspace');await expect(page.getByRole('status').filter({hasText:'1 of 100'})).toBeVisible();await page.getByRole('button',{name:'Load older messages',exact:true}).click();await expect(page.locator('.message')).toHaveCount(125);await expect(page.getByRole('status').filter({hasText:'26 of 125'})).toBeVisible();await expect(page.getByText('Loaded messages',{exact:true})).toBeVisible();
});
test('scoped reader keeps partial scope and exposes real loading and retry errors',async({page})=>{
 let older=false,hold:()=>void=()=>{};let fail=false;const gate=new Promise<void>(resolve=>{hold=resolve;});await page.route('**/api/**',async r=>{const url=new URL(r.request().url());if(url.pathname==='/api/bootstrap')return r.fulfill({json:{csrfToken:'fixture'}});if(url.pathname.endsWith('/transcript')){if(url.searchParams.has('cursor')){await gate;older=true;if(fail)return r.fulfill({status:503,json:{error:{code:'UNAVAILABLE'}}});}return r.fulfill({json:{...scopedEnvelope,messages:[scopedMessage(older?'old':'m','workspace')],nextCursor:older?null:'older'}});}if(url.pathname.endsWith('/updates'))return r.fulfill({json:{...scopedEnvelope,fromSequence:scopedContext.sequence,owner:null,transcriptChanged:false}});return r.fulfill({json:scopedContext});});
 await page.goto('/fixture?scoped=1');await expect(page.locator('[data-message-id]')).toHaveCount(1);await page.getByLabel('Find in conversation',{exact:true}).click();await phrase(page).fill('workspace');await page.getByRole('search').getByText('Load older messages').click();await expect(page.getByRole('search').getByText('Loading older messages…')).toBeVisible();fail=true;hold();await expect(page.getByRole('search').getByRole('alert')).toContainText('Could not load');await expect(page.getByText('Loaded messages',{exact:true})).toBeVisible();
});
test('keyboard and reduced/off motion find paths are immediate at desktop and smoke widths',async({page},info)=>{
 await setup(page);await page.emulateMedia({reducedMotion:'reduce'});await open(page);await phrase(page).fill('workspace');await page.keyboard.press('Enter');
 const out=info.outputPath('screenshots');await mkdir(out,{recursive:true});
 for(const width of [1440,1024,768]){await page.setViewportSize({width,height:900});await expect(phrase(page)).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(await page.getByRole('search').evaluate(el=>el.getAnimations({subtree:true}).length)).toBe(0);await page.screenshot({path:`${out}/4-after-${width}.png`});}
 await page.evaluate(()=>{document.documentElement.dataset.theme='light';document.documentElement.style.setProperty('--ui-motion-scale','0');});await phrase(page).fill('no-matches');await expect(page.getByRole('status').filter({hasText:'0 results'})).toBeVisible();
});

test('owner switch clears find and excluded composer text is never counted',async({page})=>{
 await setup(page);await page.locator('.composer textarea').fill('unique-draft-phrase');await open(page);await phrase(page).fill('unique-draft-phrase');await expect(page.getByRole('status').filter({hasText:'0 results'})).toBeVisible();
 await phrase(page).fill('workspace');await page.getByRole('button',{name:'Review keyboard navigation Ready',exact:true}).click();await expect(phrase(page)).toBeHidden();expect(await page.evaluate(()=>CSS.highlights.get('conversation-find-all')?.size??0)).toBe(0);
});
test('retains active match and reading position on rendered background additions',async({page})=>{
 await setup(page,125);await open(page);await phrase(page).fill('workspace');await page.keyboard.press('Enter');const top=await page.locator('.conversation-scroll').evaluate(el=>el.scrollTop);
 await page.locator('.conversation').evaluate(el=>{const message=document.createElement('div');message.className='message';message.innerHTML='<div class="message-content">New workspace update</div>';el.append(message);});
 await expect(page.getByRole('status').filter({hasText:'2 of 101'})).toBeVisible();expect(await page.locator('.conversation-scroll').evaluate(el=>el.scrollTop)).toBe(top);
});

test('Enter activates the focused previous, close and history buttons',async({page})=>{
 await setup(page,125);await open(page);await phrase(page).fill('workspace');
 await page.getByRole('button',{name:'Previous match',exact:true}).focus();await page.keyboard.press('Enter');await expect(page.getByRole('status').filter({hasText:'100 of 100'})).toBeVisible();
 await page.getByRole('button',{name:'Load older messages',exact:true}).focus();await page.keyboard.press('Enter');await expect(page.locator('.message')).toHaveCount(125);
 await page.getByRole('button',{name:'Close find',exact:true}).focus();await page.keyboard.press('Enter');await expect(phrase(page)).toBeHidden();
});
test('Escape and Close restore the rendered Find trigger',async({page})=>{
 await setup(page);const trigger=page.getByRole('button',{name:'Find in conversation',exact:true});await trigger.focus();await page.keyboard.press('Enter');await expect(phrase(page)).toBeFocused();await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
 await page.keyboard.press('Enter');await page.getByRole('button',{name:'Close find',exact:true}).click();await expect(trigger).toBeFocused();
});
test('empty transcript disables the trigger and the Ctrl+F shortcut',async({page})=>{
 await setup(page,0);
 const trigger=page.getByRole('button',{name:'Find in conversation',exact:true});
 await expect(trigger).toBeDisabled();await expect(trigger).toHaveAttribute('title','No messages to search');
 await page.locator('.composer textarea').focus();await page.keyboard.press('Control+f');
 await expect(phrase(page)).toHaveCount(0);
});

test('find trigger re-enables when the transcript has messages',async({page})=>{
 await setup(page,1);
 const trigger=page.getByLabel('Find in conversation',{exact:true});
 await expect(trigger).toBeEnabled();
 await expect(trigger).toHaveAttribute('title','Find in conversation (Ctrl+F)');
 await trigger.click();
 await expect(phrase(page)).toBeFocused();
});

test('find follows live transcript availability and restores focus after clearance',async({page})=>{
 await page.setViewportSize({width:420,height:760});
 const snapshot=shellSnapshot(), initial=snapshot.messages;
 snapshot.messages=[];
 const host=await serveTaskFixture(page,snapshot);
 await page.goto('/fixture');
 const trigger=page.getByRole('button',{name:'Find in conversation',exact:true});
 const draft=page.getByRole('textbox',{name:'Message',exact:true});
 await expect(trigger).toBeDisabled();
 snapshot.messages=initial;await host.publish();
 await expect(trigger).toBeEnabled();
 await draft.focus();await page.keyboard.press('Control+f');await expect(phrase(page)).toBeFocused();
 snapshot.messages=[];await host.publish();
 await expect(trigger).toBeDisabled();await expect(phrase(page)).toHaveCount(0);
 await expect(draft).toBeFocused();
 snapshot.messages=initial;await host.publish();
 await trigger.click();await expect(phrase(page)).toBeFocused();
 snapshot.messages=[];await host.publish();
 await expect(trigger).toBeDisabled();await expect(page.locator('.conversation-scroll:visible')).toBeFocused();
});

test('find input keeps a readable width at desktop and narrow widths',async({page})=>{
 await setup(page);await open(page);
 expect(await phrase(page).evaluate(el=>el.getBoundingClientRect().width)).toBeGreaterThanOrEqual(160);
 for(const width of [400,360]){await page.setViewportSize({width,height:900});await expect(phrase(page)).toBeVisible();expect(await phrase(page).evaluate(el=>el.getBoundingClientRect().width)).toBeGreaterThanOrEqual(96);}
});

test('the Find shortcut opens from workspace chrome and restores the original focus',async({page})=>{
 await setup(page);
 const outside=page.getByRole('button',{name:'Collapse sidebar',exact:true});
 await outside.focus();await page.keyboard.press('Control+f');
 const find=phrase(page);
 await expect(find).toBeFocused();
 await find.fill('workspace');
 await page.keyboard.press('Control+f');
 await expect(find).toBeFocused();
 expect(await find.evaluate((input:HTMLInputElement)=>[input.selectionStart,input.selectionEnd])).toEqual([0,9]);
 await page.keyboard.press('Escape');
 await expect(find).toHaveCount(0);await expect(outside).toBeFocused();
});

test('the shortcut remains inactive from chrome when the conversation is empty',async({page})=>{
 await setup(page,0);
 const outside=page.getByRole('button',{name:'Collapse sidebar',exact:true});
 await outside.focus();await page.keyboard.press('Control+f');
 await expect(phrase(page)).toHaveCount(0);await expect(outside).toBeFocused();
});

test('the shortcut leaves an active modal in control',async({page})=>{
 await setup(page);
 await page.getByRole('button',{name:'Settings',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'Settings',exact:true});
 await expect(dialog).toBeVisible();
 await page.keyboard.press('Control+f');
 await expect(phrase(page)).toHaveCount(0);await expect(dialog).toBeVisible();
});

test('retains Find during interrupted exit while restoring the composer immediately',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await setup(page);
 const composer=page.locator('.composer textarea');
 await composer.fill('Keep this draft');
 await composer.evaluate((node:HTMLTextAreaElement)=>node.setSelectionRange(5,5));
 await open(page);
 const presence=page.locator('.conversation-find-presence');
 await expect(presence).toHaveAttribute('data-open','true');
 await phrase(page).fill('workspace');
 await expect(page.getByRole('status').filter({hasText:'1 of 3'})).toBeVisible();
 const node=await phrase(page).elementHandle();
 await presence.evaluate(async element=>{await Promise.allSettled(element.getAnimations().map(animation=>animation.finished));});
 await page.keyboard.press('Escape');
 await expect(composer).toBeFocused();
 await expect(composer).toHaveJSProperty('selectionStart',5);
 await expect(page.getByRole('search')).toHaveCount(0);
 const exit=await presence.evaluate(element=>element.getAnimations().map(animation=>(animation as CSSTransition).transitionProperty));
 expect(exit).toContain('grid-template-rows');
 await page.keyboard.press('Control+f');
 await expect(phrase(page)).toBeFocused();
 expect(await phrase(page).evaluate((current,original)=>current===original,node)).toBe(true);
 await expect(phrase(page)).toHaveValue('workspace');
 await page.keyboard.press('Escape');
 await expect(presence).toHaveCount(0);
});

test('controller settles Find when motion is turned off during exit',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await setup(page);
 await open(page);
 const presence=page.locator('.conversation-find-presence');
 await presence.evaluate(async element=>{await Promise.allSettled(element.getAnimations().map(animation=>animation.finished));});
 await page.keyboard.press('Escape');
 await page.evaluate(()=>document.documentElement.dataset.motion='off');
 await expect(presence).toHaveCount(0);
 await page.keyboard.press('Control+f');
 await expect(phrase(page)).toBeFocused();
});

test('Find uses the effective timings once and removes grid travel in reduced motion',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await setup(page);
 const presence=page.locator('.conversation-find-presence');
 for(const speed of [.75,1,1.25]){
  await page.evaluate(value=>{
   const root=document.documentElement;
   root.style.setProperty('--ui-motion-insert',(180/value)+'ms');
   root.style.setProperty('--ui-motion-remove',(140/value)+'ms');
  },speed);
  await open(page);
  const enter=await presence.evaluate(element=>getComputedStyle(element).transitionDuration);
  expect(parseFloat(enter)*1000).toBeCloseTo(180/speed,2);
  await presence.evaluate(async element=>{await Promise.allSettled(element.getAnimations().map(animation=>animation.finished));});
  await page.keyboard.press('Escape');
  const exit=await presence.evaluate(element=>getComputedStyle(element).transitionDuration);
  expect(parseFloat(exit)*1000).toBeCloseTo(140/speed,2);
  await expect(presence).toHaveCount(0);
 }
 await page.evaluate(()=>document.documentElement.dataset.motion='reduced');
 await open(page);
 const properties=await presence.evaluate(element=>element.getAnimations().map(animation=>(animation as CSSTransition).transitionProperty));
 expect(properties).not.toContain('grid-template-rows');
 await page.keyboard.press('Escape');
 await expect(presence).toHaveCount(0);
});
