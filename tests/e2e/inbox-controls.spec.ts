import {test, expect, type Page} from '@playwright/test';
import type {AttentionItem} from '../../packages/contracts/attention';

async function fixture(page: Page, long = false) {
  const requests: string[] = [], errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== 'http://127.0.0.1:5802' || url.pathname.startsWith('/api/') || url.pathname.startsWith('/widget-runtime')) {
      requests.push(url.href); return route.abort();
    }
    return route.continue();
  });
  await page.goto('/tests/e2e/fixtures/inbox-controls.html'+(long?'?long':''));
  await expect(page.locator('.ui-list-row')).toHaveCount(long?40:5);
  return {requests, errors};
}
const filter = (page: Page) => page.getByRole('combobox', {name: 'Inbox filter', exact: true});
const rows = (page: Page) => page.locator('.ui-list-row-main');
const readToolbar = (page: Page) => page.locator('.inbox-item-toolbar');
const calls = (page: Page) => page.evaluate(() => window.inboxControls.calls);
async function choose(page: Page, label: string) {
  await filter(page).click(); await page.getByRole('option', {name: label, exact: true}).click();
  await expect(filter(page)).toBeFocused(); await expect(filter(page)).toHaveText(label);
}

for(const motion of ['no-preference','reduce','off'] as const)test(`inbox status and new arrivals respect ${motion} motion`,async({page})=>{
  await page.setViewportSize({width:1116,height:720});
  await page.emulateMedia({reducedMotion:motion==='reduce'?'reduce':'no-preference'});
  if(motion==='off')await page.addInitScript(()=>{
    const apply=()=>{document.documentElement.dataset.motion='off';};
    if(document.documentElement){apply();return;}
    const observer=new MutationObserver(()=>{if(document.documentElement){observer.disconnect();apply();}});
    observer.observe(document,{childList:true});
  });
  await page.addInitScript(()=>{
    const events:string[]=[];
    Object.defineProperty(window,'inboxMotionEvents',{value:events});
    document.addEventListener('animationstart',event=>{
      if(event.target instanceof Element&&event.target.closest('.agent-inbox'))events.push(event.animationName);
    });
    document.addEventListener('transitionrun',event=>{
      if(event.target instanceof Element&&event.target.matches('.ui-unread-dot'))events.push(event.propertyName);
    });
  });
  const events=()=>page.evaluate(()=>Reflect.get(window,'inboxMotionEvents') as string[]);
  await fixture(page);
  const row=page.getByRole('listitem').filter({has:page.getByRole('button',{name:/^Review, Review change/})});
  const dot=row.locator('.ui-unread-dot');
  await expect(dot).toHaveCSS('opacity','0');
  const originalDot=await dot.elementHandle();
  await row.hover();
  await row.getByRole('button',{name:'Mark as unread'}).click();
  await expect(dot).toHaveCSS('opacity','1');
  expect(await dot.evaluate((node,prior)=>node===prior,originalDot)).toBe(true);
  expect(await events()).not.toContain('inbox-row-in');
  await page.evaluate(()=>window.inboxControls.arrive?.());
  await expect(rows(page).first()).toContainText('New result');
  await page.getByRole('button',{name:/^New result,/}).click();
  await expect(page.getByRole('heading',{name:'New result',exact:true})).toBeVisible();
  await page.getByRole('button',{name:/^Review, Review change/}).click();
  await expect(page.getByRole('heading',{name:'Review',exact:true})).toBeVisible();
  await choose(page,'Needs you');
  await choose(page,'All');
  await expect(rows(page).first()).toContainText('New result');
  if(motion!=='no-preference'){
    expect(await events()).toEqual([]);
    await expect(dot).toHaveCSS('transition-property','none');
  }else{
    expect(await events()).toEqual(expect.arrayContaining(['opacity','inbox-count-in','inbox-row-in','inbox-item-in']));
    expect((await events()).filter(name=>name==='inbox-row-in')).toHaveLength(1);
    expect((await events()).filter(name=>name==='inbox-item-in')).toHaveLength(2);
  }
});

test('the first asynchronous attention snapshot establishes the row animation baseline',async({page})=>{
  const stamp='2026-11-06T12:00:00.000Z';
  const initial:AttentionItem={id:'initial',threadId:'initial',kind:'thread-completed',title:'Existing result',
    summary:'Loaded from the incoming snapshot',state:'completed',createdAt:stamp,updatedAt:stamp,read:false,
    popupDismissed:false,actionable:false,notificationKey:'initial',destination:{threadId:'initial'}};
  const items=[initial];
  await page.addInitScript(()=>{
    window.EventSource=class extends EventTarget{onopen:()=>void=()=>{};constructor(){super();queueMicrotask(()=>this.onopen());}close(){}} as unknown as typeof EventSource;
    document.addEventListener('animationstart',event=>{
      if(event.animationName==='inbox-row-in')document.documentElement.dataset.arrivedRow=event.target instanceof Element?event.target.textContent??'':'';
    });
  });
  await page.route('**/api/bootstrap',route=>route.fulfill({json:{csrfToken:'fixture-csrf',widgetOrigin:'http://127.0.0.1:5802'}}));
  await page.route('**/api/attention',route=>route.fulfill({json:{items,unread:items.length,sequence:items.length}}));
  await page.goto('/tests/e2e/fixtures/inbox-controls.html?network');
  await expect(rows(page).first()).toContainText('Existing result');
  expect(await page.locator('.ui-list-row').first().evaluate(node=>getComputedStyle(node).animationName)).toBe('none');
  items.unshift({...initial,id:'after',title:'Arrived later',notificationKey:'after'});
  await page.getByRole('button',{name:'Refresh inbox'}).click();
  await expect(rows(page).first()).toContainText('Arrived later');
  await expect(page.locator('html')).toHaveAttribute('data-arrived-row',/Arrived later/);
});

for(const width of [280,1100])test(`short Inbox controls remain reachable at ${width} pixels`,async({page})=>{
  await page.setViewportSize({width:width+16,height:720});
  await fixture(page);
  const host=page.locator('.fixture-inbox');
  await host.evaluate(element=>{(element as HTMLElement).style.height='120px';});
  const inbox=page.getByRole('region',{name:'Agent inbox',exact:true});
  await expect.poll(()=>inbox.evaluate(node=>node.getBoundingClientRect().height)).toBe(120);
  await expect(inbox).toHaveAttribute('data-columns',width===280?'list':'both');
  const hit=(control:ReturnType<Page['getByRole']>)=>control.evaluate(node=>{
    const {x,y,width,height}=node.getBoundingClientRect();
    return node.contains(document.elementFromPoint(x+width/2,y+height/2));
  });
  for(const control of [filter(page),page.getByRole('button',{name:'Refresh inbox'}),page.getByRole('searchbox',{name:'Search Inbox'})]){
    await control.scrollIntoViewIfNeeded();
    await expect.poll(()=>hit(control)).toBe(true);
  }
  const row=rows(page).filter({hasText:'Review'});
  await row.scrollIntoViewIfNeeded();
  await expect.poll(()=>hit(row)).toBe(true);
  await row.click();
  await expect(inbox).toHaveAttribute('data-columns',width===280?'item':'both');
  await host.evaluate(element=>{
    const wrapper=element as HTMLElement;
    wrapper.style.position='relative';
    const summary=document.createElement('div');
    Object.assign(summary.style,{position:'absolute',left:'0',right:'0',bottom:'0',height:'56px',zIndex:'2',background:'var(--surface)'});
    summary.textContent='Project overview';
    wrapper.append(summary);
  });
  const open=page.getByRole('button',{name:'Open conversation',exact:true});
  await open.evaluate(node=>node.scrollIntoView({block:'end'}));
  await expect.poll(()=>hit(open)).toBe(true);
  await open.click();
  expect(await calls(page)).toEqual([{type:'open',id:'thread-review'}]);
});

test('an Inbox action failure reserves space below the list and reader',async({page})=>{
 await page.setViewportSize({width:1100,height:380});
 await fixture(page,true);
 await page.evaluate(()=>{window.inboxControls.refreshMode='reject';});
 await page.getByRole('button',{name:'Refresh inbox',exact:true}).click();
 const error=page.getByRole('alert').filter({hasText:'Refresh failed.'});
 await expect(error).toHaveAttribute('data-tone','danger');
 const scroll=page.locator('.inbox-tasks-scroll');
 const reader=page.locator('.inbox-view-items');
 const last=rows(page).last();
 await last.scrollIntoViewIfNeeded();
 const bottom=async(locator:typeof scroll)=>(await locator.boundingBox())!.y+(await locator.boundingBox())!.height;
 const errorTop=(await error.boundingBox())!.y;
 expect(await bottom(scroll)).toBeLessThanOrEqual(errorTop);
 expect(await bottom(reader)).toBeLessThanOrEqual(errorTop);
 expect(await last.evaluate(node=>{const {x,y,width,height}=node.getBoundingClientRect();return node.contains(document.elementFromPoint(x+width/2,y+height/2));})).toBe(true);
});

test('Inbox reconnect is polite and clears when the real client resynchronizes',async({page})=>{
 await page.addInitScript(()=>{
  window.EventSource=class extends EventTarget{
   onopen:()=>void=()=>{};
   onerror:()=>void=()=>{};
   constructor(){super();queueMicrotask(()=>this.onopen());window.addEventListener('fixture-disconnect',()=>this.onerror(),{once:true});}
   close(){}
  } as unknown as typeof EventSource;
 });
 await page.route('**/api/bootstrap',route=>route.fulfill({json:{csrfToken:'fixture-csrf',widgetOrigin:'http://127.0.0.1:5802'}}));
 let snapshots=0, release!:()=>void;
 const gate=new Promise<void>(resolve=>{release=resolve;});
 await page.route('**/api/attention',async route=>{
  if(++snapshots>1)await gate;
  return route.fulfill({json:{items:[],unread:0,sequence:snapshots}});
 });
 await page.goto('/tests/e2e/fixtures/inbox-controls.html?network');
 await expect.poll(()=>snapshots).toBe(1);
 await page.evaluate(()=>window.dispatchEvent(new Event('fixture-disconnect')));
 const status=page.getByRole('status').filter({hasText:'Inbox is reconnecting…'});
 try{
  await expect(status).toHaveAttribute('data-tone','info');
  await expect(status).toHaveAttribute('aria-atomic','true');
  await expect.poll(()=>snapshots).toBe(2);
 }finally{release();}
 await expect(status).toHaveCount(0);
});

test('the rendered Inbox is capped while search and unread use all 1000 results',async({page})=>{
 await page.setViewportSize({width:1100,height:560});
 await page.goto('/tests/e2e/fixtures/inbox-controls.html?long=1000');
 await expect(rows(page)).toHaveCount(200);
 const note=page.getByText('Showing 200 of 1000. Refine search or filter to see more.',{exact:true});
 await expect(note).toBeAttached();
 await expect(page.locator('.inbox-unread-count')).toHaveText('4');
 // Isolate filtering/capping from the selected row's asynchronous read policy.
 await page.evaluate(()=>{window.inboxControls.holdRead=new Promise(()=>{});});
 const first=rows(page).first(),last=rows(page).last();
 await first.focus();await page.keyboard.press('End');
 await expect(last).toBeFocused();await expect(last).toBeInViewport();
 await page.keyboard.press('ArrowDown');await expect(last).toBeFocused();
 await page.keyboard.press('Home');await expect(first).toBeFocused();
 const search=page.getByRole('searchbox',{name:'Search Inbox'});
 await search.fill('Result 994');
 await expect(rows(page)).toHaveCount(1);await expect(rows(page).first()).toContainText('Result 994');
 await expect(note).toHaveCount(0);
 await expect(page.locator('.inbox-unread-count')).toHaveText('4');
});

test('overflowing Inbox list and reader expose native scrollbars', async ({page}) => {
  await page.setViewportSize({width: 1100, height: 350});
  await fixture(page);
  await page.locator('.fixture-inbox').evaluate(node => { (node as HTMLElement).style.height = '240px'; });
  const list = page.locator('.inbox-tasks-scroll');
  const reader = page.locator('.desktop-inbox');
  await rows(page).filter({hasText: 'Review'}).click();
  await reader.locator('.inbox-canonical-message > p').evaluate(node => { node.textContent = 'A long Inbox result. '.repeat(250); });
  for (const scroller of [list, reader]) {
    await expect(scroller).toHaveCSS('scrollbar-width', 'thin');
    await expect(scroller).toHaveCSS('scrollbar-gutter', 'auto');
    const scrollTop = await scroller.evaluate(node => {
      node.scrollTop = node.scrollHeight;
      return node.scrollTop;
    });
    expect(scrollTop).toBeGreaterThan(0);
  }
  await test.info().attach('Overflowing Inbox list and reader with synthetic items', {body: await page.screenshot(), contentType: 'image/png'});
});

test('filter keyboard owns its listbox without selecting or reading Inbox rows', async ({page}) => {
  const {requests, errors} = await fixture(page);
  await filter(page).focus(); await page.keyboard.press('Home'); await page.keyboard.press('End');
  await filter(page).dispatchEvent('keydown', {key: 'j', isComposing: true});
  expect(await calls(page)).toEqual([]);
  await page.keyboard.press('ArrowDown');
  const list = page.getByRole('listbox', {name: 'Inbox filter', exact: true});
  await expect(list).toBeVisible(); await expect(list.getByRole('option', {selected: true})).toHaveText('All');
  await expect(page.getByRole('option', {name: 'All', exact: true})).toBeFocused();
  expect(await calls(page)).toEqual([]);
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter');
  await expect(filter(page)).toHaveText('Needs you'); await expect(filter(page)).toBeFocused();
  await expect(rows(page)).toHaveCount(3);
  await filter(page).press('ArrowUp'); await expect(page.getByRole('option', {name: 'Completed', exact: true})).toBeFocused();
  await expect(list.getByRole('option', {selected: true})).toHaveText('Needs you');
  await page.keyboard.press('Home'); await page.keyboard.press('End'); await page.keyboard.press('Escape');
  await expect(list).toHaveCount(0); await expect(filter(page)).toBeFocused();
  await expect(filter(page)).toHaveText('Needs you');
  await filter(page).press('u'); await page.keyboard.press('Enter');
  await expect(filter(page)).toHaveText('Unread'); await expect(rows(page)).toHaveCount(3);
  await expect(page.locator('.ui-list-row[data-current=true]')).toHaveCount(0);
  expect(await calls(page)).toEqual([]); expect(requests).toEqual([]); expect(errors).toEqual([]);
});

test('exclusive filters keep the reader honest to the visible list', async ({page}) => {
  await fixture(page);
  await rows(page).filter({hasText: 'Review'}).click();
  const reader = page.getByRole('region', {name: 'Review', exact: true});
  await expect(reader).toBeVisible();
  for (const [label, titles, readerShown] of [
    ['Needs you', ['Question', 'Review', 'Failed task'], true],
    ['Unread', ['Question', 'Failed task', 'Completed task'], false],
    ['Completed', ['Completed task', 'Resolved question'], false],
    ['All', ['Question', 'Review', 'Failed task', 'Completed task', 'Resolved question'], true],
  ] as const) {
    await choose(page, label); await expect(page.locator('.ui-list-row-title')).toHaveText(titles.map(title => title === 'Question' || title === 'Failed task' || title === 'Completed task' ? 'Unread. ' + title : title));
    if (readerShown) {
      await expect(reader).toBeVisible(); await expect(reader.getByRole('button', {name: 'Open conversation'})).toBeVisible();
    } else {
      await expect(reader).toHaveCount(0); await expect(page.getByRole('heading', {name: 'Select an item', exact: true})).toBeVisible();
    }
    await filter(page).click(); await expect(page.getByRole('option', {selected: true})).toHaveText(label); await page.keyboard.press('Escape');
  }
  await page.getByRole('searchbox', {name: 'Search Inbox'}).fill('Failed');
  await choose(page, 'Completed'); await expect(page.getByText('Nothing matches', {exact: true})).toBeVisible();
  await choose(page, 'Needs you'); await expect(rows(page)).toHaveCount(1);
  await page.getByRole('searchbox').press('Escape'); await expect(rows(page)).toHaveCount(3);
  expect(await calls(page)).toEqual([]);
  expect(await page.evaluate(() => window.inboxControls.items.map(item => [item.id, item.state, item.actionable]))).toEqual([
    ['question', 'needs-input', true], ['review', 'needs-review', true], ['failed', 'failed', false], ['completed', 'completed', false], ['resolved', 'resolved', false],
  ]);
});

test('Escape, outside click, focus departure and Tab dismiss without changing the filter', async ({page}) => {
  await fixture(page); await choose(page, 'Completed');
  await filter(page).click(); await page.keyboard.press('ArrowUp'); await page.keyboard.press('Escape');
  await expect(filter(page)).toBeFocused(); await expect(filter(page)).toHaveText('Completed');
  await filter(page).click(); await page.getByRole('heading', {name: 'Inbox', exact: true}).click();
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await filter(page).click(); await page.getByRole('searchbox').focus();
  await expect(page.getByRole('listbox')).toHaveCount(0); await expect(page.getByRole('searchbox')).toBeFocused();
  await filter(page).click(); await page.keyboard.press('Tab');
  await expect(page.getByRole('listbox')).toHaveCount(0); await expect(page.getByRole('button', {name: 'Mark all as read', exact: true})).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', {name: 'Refresh inbox', exact: true})).toBeFocused();
  await expect(filter(page)).toHaveText('Completed');
  expect(await calls(page)).toEqual([]);
});

test('refresh succeeds through the supplied handler while retaining filter, selection and unread state', async ({page}) => {
  const {requests, errors} = await fixture(page);
  await rows(page).filter({hasText: 'Review'}).click(); await choose(page, 'Needs you');
  const refresh = page.getByRole('button', {name: 'Refresh inbox', exact: true});
  await refresh.focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('region', {name: 'Review', exact: true})).toContainText('Refreshed.');
  await expect(filter(page)).toHaveText('Needs you'); await expect(rows(page)).toHaveCount(3); await expect(refresh).toBeFocused();
  expect(await calls(page)).toEqual([{type: 'refresh'}]);
  expect(await page.evaluate(() => window.inboxControls.items.filter(item => !item.read).map(item => item.id))).toEqual(['question', 'failed', 'completed']);
  expect(requests).toEqual([]); expect(errors).toEqual([]);
});

for (const mode of ['reject', 'throw', 'source-error'] as const) {
  test(`refresh ${mode} retains records and reports the existing failure`, async ({page}) => {
    const {errors} = await fixture(page);
    await page.evaluate(mode => {window.inboxControls.refreshMode = mode;}, mode);
    await choose(page, 'Unread'); await page.getByRole('button', {name: 'Refresh inbox', exact: true}).click();
    await expect(page.locator('.inbox-refresh-status')).toHaveText('Refresh failed');
    await expect(page.getByRole('alert').filter({hasText:mode === 'source-error' ? 'Inbox could not load.' : 'Refresh failed.'})).toBeVisible();
    await expect(filter(page)).toHaveText('Unread'); await expect(rows(page)).toHaveCount(3);
    expect(await calls(page)).toEqual([{type: 'refresh'}]); expect(errors).toEqual([]);
  });
}

test('reading and failed canonical navigation never approve or falsely mark an unread item read', async ({page}) => {
  const {requests, errors} = await fixture(page);
  await rows(page).filter({hasText: 'Question'}).first().click();
  await expect(page.getByRole('button', {name: 'Question, Needs your input', exact: true})).toBeVisible();
  await readToolbar(page).getByRole('button', {name: 'Mark as unread'}).click();
  await page.evaluate(() => {window.inboxControls.openMode = 'reject';});
  await page.getByRole('button', {name: 'Open conversation'}).click();
  await expect(page.getByRole('alert').filter({hasText:'Navigation failed.'})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Question, Needs your input, unread', exact: true})).toHaveAttribute('aria-current', 'true');
  expect(await calls(page)).toEqual([{type: 'read', id: 'question'}, {type: 'unread', id: 'question'}, {type: 'open', id: 'thread-question'}]);
  expect(await page.evaluate(() => window.inboxControls.items.find(item => item.id === 'question'))).toMatchObject({read: false, state: 'needs-input', actionable: true});
  expect(requests).toEqual([]); expect(errors).toEqual([]);
});

test('read-state rejection remains visible without changing read state or invoking navigation', async ({page}) => {
  await fixture(page); await page.evaluate(() => {window.inboxControls.readMode = 'reject';});
  await rows(page).filter({hasText: 'Question'}).first().click();
  await expect(page.getByRole('alert').filter({hasText:'Read state could not save.'})).toBeVisible();
  expect(await calls(page)).toEqual([{type: 'read', id: 'question'}]);
  expect(await page.evaluate(() => window.inboxControls.items[0])).toMatchObject({read: false, state: 'needs-input', actionable: true});
});

test('narrow themed controls and popup fit without overflow and retain list/reader Escape ownership', async ({page}, info) => {
  await fixture(page); await page.emulateMedia({reducedMotion: 'reduce'});
  for (const [theme, width] of [['dark', 320], ['light', 390], ['light', 1100], ['dark', 1100]] as const) {
    await page.setViewportSize({width, height: 620}); await page.evaluate(theme => {document.documentElement.dataset.theme = theme;}, theme);
    await choose(page, 'Completed'); await filter(page).click();
    const popup = page.getByRole('listbox'); await expect(popup).toBeVisible();
    for (const control of [filter(page), page.getByRole('button', {name: 'Refresh inbox', exact: true}), popup]) {
      const box = await control.boundingBox(); expect(box).not.toBeNull(); expect(box!.x).toBeGreaterThanOrEqual(0); expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({path: info.outputPath(`${theme}-${width}.png`)});
    await page.keyboard.press('Escape'); await expect(filter(page)).toBeFocused();
  }
  await page.setViewportSize({width: 390, height: 620}); await choose(page, 'All');
  await rows(page).first().click(); await expect(page.locator('.agent-inbox')).toHaveAttribute('data-columns', 'item');
  await page.keyboard.press('Escape'); await expect(page.locator('.agent-inbox')).toHaveAttribute('data-columns', 'list'); await expect(rows(page).first()).toBeFocused();
});


test('explicit Mark read cancels the delayed write and reverses with keyboard focus intact', async ({page}) => {
  await page.setViewportSize({width:320,height:620});
  await fixture(page);
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 100));
  await rows(page).filter({hasText:'Question'}).first().click();
  await page.clock.runFor(25);
  expect(await calls(page)).toEqual([]);
  const read=readToolbar(page).getByRole('button',{name:'Mark as read',exact:true});
  await expect(read).toHaveText('Mark read');
  await read.focus();
  await page.keyboard.press('Enter');
  await page.clock.runFor(600);
  expect(await calls(page)).toEqual([{type:'read',id:'question'}]);
  const unread=readToolbar(page).getByRole('button',{name:'Mark as unread',exact:true});
  await expect(unread).toHaveText('Mark unread');
  await expect(unread).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(read).toBeFocused();
  await expect(page.locator('.inbox-item-toolbar')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(await calls(page)).toEqual([{type:'read',id:'question'},{type:'unread',id:'question'}]);
});

test('held automatic read disables the control until the reverse write is valid', async ({page}) => {
  await fixture(page);
  await page.evaluate(() => {
    window.inboxControls.holdRead = new Promise(resolve => window.addEventListener('fixture-release-read', () => resolve(), {once:true}));
    window.inboxControls.holdUnread = new Promise(resolve => window.addEventListener('fixture-release-unread', () => resolve(), {once:true}));
  });
  await rows(page).filter({hasText:'Question'}).first().click();
  await expect.poll(() => calls(page)).toEqual([{type:'read',id:'question'}]);
  const read=readToolbar(page).getByRole('button',{name:'Mark as read',exact:true});
  await expect(read).toBeDisabled();
  await expect(read).toHaveAttribute('title','Updating read state');
  await expect(read).toHaveAttribute('aria-disabled','true');
  await read.evaluate(button=>(button as HTMLButtonElement).click());
  expect(await calls(page)).toHaveLength(1);
  await page.evaluate(() => window.dispatchEvent(new Event('fixture-release-read')));
  const unread=readToolbar(page).getByRole('button',{name:'Mark as unread',exact:true});
  await expect(unread).toBeEnabled();
  await unread.click();
  await expect(unread).toBeDisabled();
  await unread.evaluate(button=>(button as HTMLButtonElement).click());
  expect(await calls(page)).toEqual([{type:'read',id:'question'},{type:'unread',id:'question'}]);
  await page.evaluate(() => window.dispatchEvent(new Event('fixture-release-unread')));
  await expect(read).toBeEnabled();
  await expect(read).toBeFocused();
  await expect(page.getByRole('button',{name:'Question, Needs your input, unread',exact:true})).toBeVisible();
});

for(const action of ['refresh','unread','open'] as const){
  test(`successful ${action} retry clears only its current failure`,async({page})=>{
    await fixture(page);await rows(page).filter({hasText:'Review'}).click();
    const owner=action==='unread'?readToolbar(page):page;
    const button=owner.getByRole('button',{name:action==='refresh'?'Refresh inbox':action==='unread'?'Mark as unread':'Open conversation',exact:true});
    await page.evaluate(action=>{const state=window.inboxControls;if(action==='refresh')state.refreshMode='reject';else if(action==='unread')state.unreadMode='reject';else state.openMode='reject';},action);
    await button.click();await expect(page.locator('.agent-inbox-error')).toContainText(action==='refresh'?'Refresh failed.':action==='unread'?'Unread state could not save.':'Navigation failed.');
    await page.evaluate(action=>{const state=window.inboxControls;if(action==='refresh')state.refreshMode='success';else if(action==='unread')state.unreadMode='success';else state.openMode='success';},action);
    await button.click();await expect(page.locator('.agent-inbox-error')).toHaveCount(0);
  });
}
for(const outcome of ['success','reject'] as const){
  test(`late ${outcome} for item A cannot replace item B's current error`,async({page})=>{
    await fixture(page);await rows(page).filter({hasText:'Review'}).click();
    await page.evaluate(outcome=>{window.inboxControls.unreadMode=outcome;window.inboxControls.holdUnread=new Promise(resolve=>window.addEventListener('release-unread',()=>resolve(),{once:true}));},outcome);
    await readToolbar(page).getByRole('button',{name:'Mark as unread',exact:true}).click();
    await expect.poll(()=>calls(page)).toEqual([{type:'unread',id:'review'}]);
    await page.evaluate(()=>{window.inboxControls.readMode='reject';});
    await rows(page).filter({hasText:'Failed task'}).click();
    await expect(page.locator('.agent-inbox-error')).toHaveText('Read state could not save.');
    await page.evaluate(()=>window.dispatchEvent(new Event('release-unread')));
    await page.evaluate(async()=>{await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);});
    await expect(page.locator('.agent-inbox-error')).toHaveText('Read state could not save.');
  });
  test(`a held refresh blocks repeats and reports ${outcome} before clearing`,async({page})=>{
    await fixture(page);
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.evaluate(outcome=>{window.inboxControls.refreshMode=outcome;window.inboxControls.holdRefresh=new Promise(resolve=>window.addEventListener('release-refresh',()=>resolve(),{once:true}));},outcome);
    const refresh=page.getByRole('button',{name:'Refresh inbox',exact:true});
    const feedback=page.locator('.inbox-refresh-status');
    await refresh.click();
    await expect(refresh).toBeDisabled();
    await expect(refresh).toHaveAttribute('aria-busy','true');
    await expect(refresh.locator('svg')).toHaveCSS('animation-name','none');
    await page.keyboard.press('Enter');
    await expect.poll(()=>calls(page)).toEqual([{type:'refresh'}]);
    await page.evaluate(()=>window.dispatchEvent(new Event('release-refresh')));
    await expect(refresh).toBeEnabled();
    await expect(feedback).toHaveText(outcome==='success'?/^Updated \d{2}:\d{2}$/:/^Refresh failed$/);
    await expect(feedback).toBeEmpty({timeout:3500});
    expect(await calls(page)).toEqual([{type:'refresh'}]);
  });
}


test('a deferred automatic read cannot clear a newer navigation failure',async({page})=>{
  await fixture(page);await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+100));
  await rows(page).filter({hasText:'Question'}).first().click();
  await page.evaluate(()=>{window.inboxControls.openMode='reject';});
  await page.getByRole('button',{name:'Open conversation',exact:true}).click();
  await expect(page.locator('.agent-inbox-error')).toHaveText('Navigation failed.');
  await page.clock.runFor(600);
  await expect.poll(()=>calls(page)).toEqual([{type:'open',id:'thread-question'},{type:'read',id:'question'}]);
  await expect(page.locator('.agent-inbox-error')).toHaveText('Navigation failed.');
});

test('reselecting an item observes its held read failure without another write',async({page})=>{
  await fixture(page);await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+100));
  await page.evaluate(()=>{window.inboxControls.readMode='reject';window.inboxControls.holdRead=new Promise(resolve=>window.addEventListener('release-read',()=>resolve(),{once:true}));});
  const question=rows(page).filter({hasText:'Question'}).first();await question.click();await page.clock.runFor(600);
  await expect.poll(()=>calls(page)).toEqual([{type:'read',id:'question'}]);
  await question.click();await page.clock.runFor(600);
  expect(await calls(page)).toEqual([{type:'read',id:'question'}]);
  await page.evaluate(()=>window.dispatchEvent(new Event('release-read')));
  await expect(page.locator('.agent-inbox-error')).toHaveText('Read state could not save.');
  expect(await calls(page)).toEqual([{type:'read',id:'question'}]);
});

async function twoFrames(page: Page) {
  await page.evaluate(async() => {await new Promise(requestAnimationFrame); await new Promise(requestAnimationFrame);});
}

async function controlFrames(page: Page) {
  await page.evaluate(() => {
    type Entry = {callback: FrameRequestCallback; cancelled: boolean};
    const entries: Entry[] = [];
    (window as unknown as {inboxRafEntries: Entry[]}).inboxRafEntries = entries;
    window.requestAnimationFrame = callback => {entries.push({callback, cancelled: false}); return entries.length;};
    window.cancelAnimationFrame = id => {const entry = entries[id - 1]; if (entry) entry.cancelled = true;};
  });
}

async function flushFrames(page: Page) {
  await page.evaluate(() => {
    const entries = (window as unknown as {inboxRafEntries: Array<{callback: FrameRequestCallback; cancelled: boolean}>}).inboxRafEntries.splice(0);
    for (const entry of entries) if (!entry.cancelled) entry.callback(performance.now());
  });
}

test('row read state toggles without opening the reader and follows its row in Tab order',async({page})=>{
  await fixture(page);
  await page.emulateMedia({reducedMotion:'reduce'});
  const question=rows(page).filter({hasText:'Question'}).first();
  const entry=question.locator('..');
  const toggle=entry.getByRole('button',{name:'Mark as read',exact:true});
  await expect(toggle).toHaveCSS('opacity','0');
  await question.hover();
  await expect(toggle).toHaveCSS('opacity','1');
  const bounds=(await toggle.boundingBox())!;
  expect([bounds.width,bounds.height]).toEqual([26,26]);
  await question.focus();
  await page.keyboard.press('Tab');
  await expect(toggle).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(toggle).toBeFocused();
  await page.keyboard.press('Space');
  await expect(entry.getByRole('button',{name:'Mark as unread',exact:true})).toBeFocused();
  await expect(question).not.toHaveAttribute('aria-current');
  await expect(page.getByRole('region',{name:'Question',exact:true})).toHaveCount(0);
  await expect(page.getByRole('heading',{name:'Select an item'})).toBeVisible();
  expect(await calls(page)).toEqual([{type:'read',id:'question'}]);
  await page.keyboard.press('Tab');
  await expect(rows(page).filter({hasText:'Review'})).toBeFocused();
});

test('Mark all read retains partial successes and refreshes once per attempt',async({page})=>{
  await fixture(page);
  await choose(page,'Completed');
  await page.evaluate(()=>{
    window.inboxControls.rejectReadId='failed';
    window.inboxControls.holdRead=new Promise(resolve=>window.addEventListener('release-bulk-read',()=>resolve(),{once:true}));
  });
  const bulk=page.getByRole('button',{name:'Mark all as read',exact:true});
  await expect(bulk).toBeVisible();
  expect(await bulk.evaluate(button=>button.nextElementSibling?.getAttribute('aria-label'))).toBe('Refresh inbox');
  await bulk.click();
  await expect(bulk).toBeDisabled();
  await expect(bulk).toHaveText('Marking…');
  await bulk.evaluate(button=>(button as HTMLButtonElement).click());
  await expect.poll(()=>calls(page)).toEqual([{type:'read',id:'question'},{type:'read',id:'failed'},{type:'read',id:'completed'}]);
  await page.evaluate(()=>window.dispatchEvent(new Event('release-bulk-read')));
  await expect(page.locator('.agent-inbox-error')).toHaveText('Read state could not save.');
  await expect(bulk).toBeEnabled();
  expect(await page.evaluate(()=>window.inboxControls.items.filter(item=>!item.read).map(item=>item.id))).toEqual(['failed']);
  expect(await calls(page)).toHaveLength(4);
  expect((await calls(page)).at(-1)).toEqual({type:'refresh'});
  await page.evaluate(()=>{window.inboxControls.rejectReadId=undefined;});
  await bulk.click();
  await expect(bulk).toHaveCount(0);
  await expect(page.locator('.agent-inbox-error')).toHaveCount(0);
  expect((await calls(page)).slice(-2)).toEqual([{type:'read',id:'failed'},{type:'refresh'}]);
});

test('bulk read uses the existing attention command for every unread id and loads one snapshot',async({page})=>{
  const stamp='2026-11-06T12:00:00.000Z';
  const items:AttentionItem[]=['one','two','three'].map(id=>({
    id,threadId:id,kind:'thread-completed',title:'Result '+id,summary:'Synthetic result',state:'completed',
    createdAt:stamp,updatedAt:stamp,read:false,popupDismissed:false,actionable:false,notificationKey:id,destination:{threadId:id},
  }));
  const writes:string[]=[];
  let snapshots=0;
  await page.addInitScript(()=>{
    window.EventSource=class extends EventTarget{
      onopen:()=>void=()=>{};
      constructor(){super();queueMicrotask(()=>this.onopen());}
      close(){}
    } as unknown as typeof EventSource;
  });
  await page.route('**/api/bootstrap',route=>route.fulfill({json:{csrfToken:'fixture-csrf',widgetOrigin:'http://127.0.0.1:5802'}}));
  await page.route('**/api/attention',route=>{
    snapshots++;
    return route.fulfill({json:{items,unread:items.filter(item=>!item.read).length,sequence:snapshots}});
  });
  await page.route('**/api/attention/*/commands',route=>{
    const id=new URL(route.request().url()).pathname.split('/')[3];
    expect(route.request().postDataJSON()).toMatchObject({type:'read',id:expect.any(String)});
    expect(route.request().headers()['x-harness-csrf']).toBe('fixture-csrf');
    writes.push(id);
    const item=items.find(entry=>entry.id===id);
    expect(item).toBeDefined();
    item!.read=true;
    return route.fulfill({json:{result:{id}}});
  });
  await page.goto('/tests/e2e/fixtures/inbox-controls.html?network');
  const bulk=page.getByRole('button',{name:'Mark all as read',exact:true});
  await expect(bulk).toBeEnabled();
  const before=snapshots;
  await bulk.click();
  await expect(bulk).toHaveCount(0);
  expect(writes.toSorted()).toEqual(['one','three','two']);
  expect(snapshots-before).toBe(1);
});

test.describe('using touch',()=>{
  test.use({hasTouch:true,viewport:{width:320,height:620}});
  test('row read toggle is exposed without hover',async({page})=>{
    await fixture(page);
    const entry=rows(page).filter({hasText:'Question'}).first().locator('..');
    const read=entry.getByRole('button',{name:'Mark as read',exact:true});
    await expect(read).toHaveCSS('opacity','1');
    const bounds=(await read.boundingBox())!;
    expect([bounds.width,bounds.height]).toEqual([26,26]);
    await read.tap();
    await expect(entry.getByRole('button',{name:'Mark as unread',exact:true})).toBeVisible();
    await expect(page.locator('.agent-inbox')).toHaveAttribute('data-columns','list');
  });
});

test('wide Inbox keyboard moves directly between a selected row and its reader',async({page})=>{
  await fixture(page,true);
  const inbox=page.getByRole('region',{name:'Agent inbox',exact:true});
  const review=rows(page).filter({hasText:'Review'}).first();
  await review.click();
  const reader=page.getByRole('region',{name:'Review',exact:true});
  await expect(inbox).toHaveAttribute('data-columns','both');
  await expect(reader).toHaveAttribute('tabindex','-1');
  await page.keyboard.press('ArrowRight');
  await expect(reader).toBeFocused();
  await expect(reader).toHaveCSS('outline-style','solid');
  await page.keyboard.press('Tab');
  await expect(reader.getByRole('button',{name:'Mark as unread',exact:true})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(review).toBeFocused();
  await expect(review).toHaveAttribute('aria-current','true');
  await expect(reader).toBeVisible();
  await page.keyboard.press('l');
  await expect(reader).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(review).toBeFocused();
  await expect(reader).toBeVisible();

  const search=page.getByRole('searchbox',{name:'Search Inbox'});
  await search.focus();
  await search.press('ArrowRight');
  await search.press('l');
  await expect(search).toBeFocused();
  await expect(search).toHaveValue('l');
  await search.press('Escape');
  await expect(review).toHaveAttribute('aria-current','true');
});

test('narrow Inbox Right advances inside the reader and Escape returns to the list',async({page})=>{
  await page.setViewportSize({width:390,height:760});
  await fixture(page);
  const inbox=page.getByRole('region',{name:'Agent inbox',exact:true});
  const review=rows(page).filter({hasText:'Review'}).first();
  await review.focus();
  await page.keyboard.press('ArrowRight');
  await expect(review).toBeFocused();
  await expect(inbox).toHaveAttribute('data-columns','list');
  await review.click();
  await expect(page.getByRole('region',{name:'Review',exact:true})).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('region',{name:'Failed task',exact:true})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(rows(page).filter({hasText:'Failed task'})).toBeFocused();
  await expect(inbox).toHaveAttribute('data-columns','list');
});

test('wide Escape dismisses the reader to a full list and returns focus to the same row', async ({page}) => {
  await fixture(page); await page.setViewportSize({width: 1100, height: 760});
  const review = rows(page).filter({hasText: 'Review'}).first();
  await review.click(); await expect(page.getByRole('region', {name: 'Review', exact: true})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.agent-inbox')).toHaveAttribute('data-columns', 'list');
  await expect(page.getByRole('region', {name: 'Review', exact: true})).toHaveCount(0);
  await expect(page.getByRole('region', {name: 'Selected inbox item', exact: true})).toHaveCount(0);
  await expect(review).toBeFocused();
});

test('after explicit dismissal j traverses from the focused row instead of reselecting the first row', async ({page}) => {
  await fixture(page); await page.setViewportSize({width: 1100, height: 760});
  const review = rows(page).filter({hasText: 'Review'}).first(), failed = rows(page).filter({hasText: 'Failed task'}).first();
  await review.click(); await page.keyboard.press('Escape'); await expect(review).toBeFocused();
  await page.keyboard.press('j');
  await expect(failed).toBeFocused();
  await expect(page.locator('.ui-list-row[data-current=true]').filter({hasText: 'Failed task'})).toHaveCount(1);
});

test('explicit dismissal survives resize until the next explicit choose restores measured columns', async ({page}) => {
  await fixture(page); await page.setViewportSize({width: 1100, height: 760});
  const review = rows(page).filter({hasText: 'Review'}).first();
  await review.click(); await page.keyboard.press('Escape'); await expect(page.locator('.agent-inbox')).toHaveAttribute('data-columns', 'list');
  await page.setViewportSize({width: 390, height: 760}); await expect(page.locator('.agent-inbox')).toHaveAttribute('data-columns', 'list');
  await page.setViewportSize({width: 1100, height: 760}); await expect(page.locator('.agent-inbox')).toHaveAttribute('data-columns', 'list');
  await review.click(); await expect(page.locator('.agent-inbox')).toHaveAttribute('data-columns', 'both');
  await page.setViewportSize({width: 390, height: 760}); await expect(page.locator('.agent-inbox')).toHaveAttribute('data-columns', 'item');
});

test('Escape ownership is limited to chosen reader dismissal and non-composing search clearing', async ({page}) => {
  await fixture(page);
  await page.evaluate(() => {
    (window as unknown as {escapeBubbles: number}).escapeBubbles = 0;
    document.addEventListener('keydown', event => {if (event.key === 'Escape') (window as unknown as {escapeBubbles: number}).escapeBubbles++;});
  });
  await rows(page).first().focus(); await page.keyboard.press('Escape');
  expect(await page.evaluate(() => (window as unknown as {escapeBubbles: number}).escapeBubbles)).toBe(1);
  await rows(page).filter({hasText: 'Review'}).first().click(); await page.keyboard.press('Escape');
  expect(await page.evaluate(() => (window as unknown as {escapeBubbles: number}).escapeBubbles)).toBe(1);
  const search = page.getByRole('searchbox', {name: 'Search Inbox'}); await search.fill('failed');
  await search.dispatchEvent('keydown', {key: 'Escape', isComposing: true}); await expect(search).toHaveValue('failed');
  await search.dispatchEvent('keydown', {key: 'Escape', keyCode: 229}); await expect(search).toHaveValue('failed');
  await search.press('Escape'); await expect(search).toHaveValue('');
  const review = rows(page).filter({hasText: 'Review'}).first();
  await review.click(); await expect(page.getByRole('region', {name: 'Review', exact: true})).toBeVisible();
  await search.focus(); await search.press('Escape'); await expect(page.getByRole('region', {name: 'Review', exact: true})).toBeVisible();
  await review.evaluate(node => node.addEventListener('keydown', event => event.preventDefault(), {capture: true, once: true}));
  await review.focus(); await page.keyboard.press('Escape'); await expect(page.getByRole('region', {name: 'Review', exact: true})).toBeVisible();
});

async function setInboxWidth(page: Page, target: number) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const actual = await page.locator('.agent-inbox').evaluate(node => node.getBoundingClientRect().width), viewport = page.viewportSize();
    if (!viewport || Math.abs(actual - target) < 0.5) break;
    await page.setViewportSize({width: Math.max(320, Math.round(viewport.width + target - actual)), height: 760});
  }
  await expect.poll(() => page.locator('.agent-inbox').evaluate(node => node.getBoundingClientRect().width)).toBeCloseTo(target, 0);
}

test('choose restores measured 860/892 container hysteresis after explicit dismissal', async ({page}) => {
  await fixture(page); await setInboxWidth(page, 1100);
  const review = rows(page).filter({hasText: 'Review'}).first();
  await review.click(); await page.keyboard.press('Escape'); await expect(page.locator('.agent-inbox')).toHaveAttribute('data-columns', 'list');
  await setInboxWidth(page, 859); await expect(page.locator('.agent-inbox')).toHaveAttribute('data-columns', 'list');
  await setInboxWidth(page, 1100); await expect(page.locator('.agent-inbox')).toHaveAttribute('data-columns', 'list');
  await review.click(); await expect(page.locator('.agent-inbox')).toHaveAttribute('data-columns', 'both');
  await setInboxWidth(page, 859); await expect(page.locator('.agent-inbox')).toHaveAttribute('data-columns', 'item');
  await setInboxWidth(page, 880); await expect(page.locator('.agent-inbox')).toHaveAttribute('data-columns', 'item');
  await setInboxWidth(page, 892); await expect(page.locator('.agent-inbox')).toHaveAttribute('data-columns', 'both');
  await setInboxWidth(page, 860); await expect(page.locator('.agent-inbox')).toHaveAttribute('data-columns', 'both');
  await setInboxWidth(page, 859); await expect(page.locator('.agent-inbox')).toHaveAttribute('data-columns', 'item');
});

test('newer Back cancels a pending choose-to-reader focus request', async ({page}) => {
  await fixture(page); await page.setViewportSize({width: 390, height: 760}); await controlFrames(page);
  const review = rows(page).filter({hasText: 'Review'}).first();
  await page.evaluate(() => {
    (window as unknown as {readerFocuses: number}).readerFocuses = 0;
    document.addEventListener('focusin', event => {if ((event.target as HTMLElement).classList.contains('inbox-view-items')) (window as unknown as {readerFocuses: number}).readerFocuses++;});
  });
  await review.click(); await expect(page.getByRole('button', {name: 'Inbox', exact: true})).toBeVisible();
  await page.getByRole('button', {name: 'Inbox', exact: true}).click();
  await flushFrames(page);
  await expect(page.locator('.agent-inbox')).toHaveAttribute('data-columns', 'list');
  await expect(review).toBeFocused();
  await expect(page.getByRole('region', {name: 'Review', exact: true})).toHaveCount(0);
  expect(await page.evaluate(() => (window as unknown as {readerFocuses: number}).readerFocuses)).toBe(0);
});

test('a list mutation cancels a pending same-row return without stealing newer focus', async ({page}) => {
  await fixture(page); await page.setViewportSize({width: 1100, height: 760}); await controlFrames(page);
  const refresh = page.getByRole('button', {name: 'Refresh inbox', exact: true}), review = rows(page).filter({hasText: 'Review'}).first();
  await review.click();
  await page.evaluate(() => {window.inboxControls.holdRefresh = new Promise(resolve => window.addEventListener('release-refresh', () => resolve(), {once: true}));});
  await refresh.click(); await expect.poll(() => calls(page)).toEqual([{type: 'refresh'}]);
  await page.keyboard.press('Escape');
  await page.evaluate(() => window.dispatchEvent(new Event('release-refresh')));
  await expect(rows(page).filter({hasText: 'Refreshed.'})).toHaveCount(5);
  await flushFrames(page);
  await expect(page.locator('.agent-inbox')).toHaveAttribute('data-columns', 'list');
  await expect(refresh).toBeFocused();
  await expect(review).not.toBeFocused();
});

test('a newer focus intent fences a pending same-row return', async ({page}) => {
  await fixture(page); await page.setViewportSize({width: 1100, height: 760});
  await rows(page).filter({hasText: 'Review'}).first().click();
  await page.evaluate(() => {
    document.querySelector('.inbox-view-items')?.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true, cancelable: true}));
    (document.querySelector('button[aria-label="Refresh inbox"]') as HTMLElement | null)?.focus();
  });
  await twoFrames(page);
  await expect(page.getByRole('button', {name: 'Refresh inbox', exact: true})).toBeFocused();
});

// #1712 T02: the reader must never show an item that left the filtered list.
test('filtering out the open item clears the reader until it re-enters the list', async ({page}) => {
  await fixture(page);
  await rows(page).filter({hasText: 'Review'}).click();
  await expect(page.getByRole('region', {name: 'Review', exact: true})).toBeVisible();
  await choose(page, 'Completed');
  await expect(page.getByRole('region', {name: 'Review', exact: true})).toHaveCount(0);
  await expect(page.getByRole('heading', {name: 'Select an item', exact: true})).toBeVisible();
  await choose(page, 'Needs you');
  await expect(page.getByRole('region', {name: 'Review', exact: true})).toBeVisible();
});

test('single-column: a filtered-out open item does not linger when the pane narrows', async ({page}) => {
  await fixture(page);
  await rows(page).filter({hasText: 'Review'}).click();
  await expect(page.getByRole('region', {name: 'Review', exact: true})).toBeVisible();
  await choose(page, 'Completed');
  await expect(page.getByRole('region', {name: 'Review', exact: true})).toHaveCount(0);
  await page.setViewportSize({width: 400, height: 800});
  await expect(page.getByRole('region', {name: 'Review', exact: true})).toHaveCount(0);
  await expect(rows(page)).toHaveCount(2);
});

test('search and filter reset controls restore results and focus', async ({page}) => {
  await page.setViewportSize({width: 320, height: 760});
  await page.emulateMedia({reducedMotion: 'reduce'});
  await fixture(page);
  const search = page.getByRole('searchbox', {name: 'Search Inbox'});
  const clear = page.getByRole('button', {name: 'Clear search', exact: true});
  const reset = page.getByRole('button', {name: 'Clear search and filter'});
  await choose(page, 'Unread');
  await search.fill('no matching inbox item');
  await expect(page.getByRole('heading', {name: 'Nothing matches'})).toBeVisible();
  await search.press('Tab');
  await expect(clear).toBeFocused();
  await clear.press('Enter');
  await expect(search).toBeFocused();
  await expect(search).toHaveValue('');
  await expect(filter(page)).toHaveText('Unread');
  await expect(rows(page)).toHaveCount(3);
  await search.fill('no matching inbox item');
  await test.info().attach('Filtered Inbox at 320 px with synthetic items', {body: await page.screenshot(), contentType: 'image/png'});
  await reset.click();
  await expect(search).toBeFocused();
  await expect(search).toHaveValue('');
  await expect(filter(page)).toHaveText('All');
  await expect(rows(page)).toHaveCount(5);
  await expect(clear).toHaveCount(0);
  await expect(reset).toHaveCount(0);
  expect(await calls(page)).toEqual([]);
});

test('a genuinely empty Inbox offers search clear without a filter reset', async ({page}) => {
  await page.goto('/tests/e2e/fixtures/inbox-controls.html?empty');
  await page.getByRole('searchbox', {name: 'Search Inbox'}).fill('no matching inbox item');
  await expect(page.getByRole('heading', {name: 'You are all caught up'})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Clear search', exact: true})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Clear search and filter'})).toHaveCount(0);
});
