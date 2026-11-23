import {test,expect,type Page} from '@playwright/test';

const id=(n:number)=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;

async function open(page:Page,mode='docked'){
 await page.route('**/*',route=>new URL(route.request().url()).origin==='http://127.0.0.1:5812'?route.continue():route.abort());
 await page.goto(`/tests/e2e/fixtures/browser-action.html?mode=${mode}`);
 await expect(page.getByRole('textbox',{name:'Browser address'})).toBeVisible();
 if(mode!=='no-host')await page.waitForFunction(()=>window.browserActionFixture.subscribed);
}
async function commands(page:Page,type?:string){
 const actions=await page.evaluate(()=>window.browserActionFixture.actions.map(action=>action.command));
 return type?actions.filter(command=>command.type===type):actions;
}
async function finishAll(page:Page,result:'success'|'error'='success'){
 await page.evaluate(value=>{window.browserActionFixture.actions.forEach((action,index)=>{if(!action.settled)window.browserActionFixture.finish(index,value);});},result);
}
async function save(page:Page){
 await page.getByRole('button',{name:'Bookmark this page',exact:true}).click();
 await expect.poll(async()=>(await commands(page,'bookmark-add')).length).toBe(1);
 await finishAll(page);
 await page.evaluate(()=>window.browserActionFixture.bookmarks([{id:'00000000-0000-4000-8000-000000000001',url:'https://reading.example/one',title:'Synthetic reading page',createdAt:'2026-11-21T22:00:00.000Z',updatedAt:'2026-11-21T22:00:00.000Z'}]));
}

for(const mode of ['docked','detached'])test.describe(mode,()=>{
 test('the star saves the current page and the popover renames, toggles query and removes',async({page})=>{
  await open(page,mode);await save(page);
  const popover=page.getByRole('dialog',{name:'Edit bookmark'});
  await expect(popover).toBeVisible();await expect(popover.getByRole('textbox')).toHaveValue('Synthetic reading page');
  await expect(popover.locator('.bookmark-address')).toHaveText('https://reading.example/one');
  await expect(page.getByRole('button',{name:'Edit bookmark',exact:true})).toHaveAttribute('aria-pressed','true');
  await popover.getByRole('textbox').fill('Renamed page');await popover.getByRole('textbox').press('Enter');
  await expect.poll(async()=>(await commands(page,'bookmark-update')).map(c=>({...c,now:undefined}))).toEqual([{type:'bookmark-update',id:id(1),title:'Renamed page',now:undefined}]);
  await finishAll(page);
  await popover.getByRole('button',{name:'Remove',exact:true}).click();
  await expect.poll(async()=>(await commands(page,'bookmark-remove')).map(c=>({...c,now:undefined}))).toEqual([{type:'bookmark-remove',id:id(1),now:undefined}]);
  await finishAll(page);
  await expect(page.getByText('Bookmark removed.',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Undo',exact:true}).click();
  await expect.poll(async()=>(await commands(page,'bookmark-restore')).map(c=>({...c,now:undefined}))).toEqual([{type:'bookmark-restore',bookmark:{id:id(1),url:'https://reading.example/one',title:'Synthetic reading page',createdAt:'2026-11-21T22:00:00.000Z',updatedAt:'2026-11-21T22:00:00.000Z'},now:undefined}]);
 });

 test('the list opens, renames, removes and navigates bookmarks',async({page})=>{
  await open(page,mode);
  await page.evaluate(()=>window.browserActionFixture.bookmarks([{id:'00000000-0000-4000-8000-000000000002',url:'https://docs.example/guide',title:'Guide',createdAt:'2026-11-21T22:02:00.000Z',updatedAt:'2026-11-21T22:02:00.000Z'},{id:'00000000-0000-4000-8000-000000000003',url:'https://status.example/',title:'Status',createdAt:'2026-11-21T22:01:00.000Z',updatedAt:'2026-11-21T22:01:00.000Z'}]));
  await page.getByRole('button',{name:'Bookmarks',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'Bookmarks'});
  await expect(dialog).toBeVisible();await expect(dialog.getByText('2 of 200')).toBeVisible();
  await expect(dialog.getByRole('option')).toHaveCount(2);
  await dialog.getByRole('option',{name:/Guide/}).hover();
  await dialog.getByRole('button',{name:'Rename Guide'}).click();
  await dialog.getByRole('textbox').fill('Guide renamed');await dialog.getByRole('textbox').press('Enter');
  await expect.poll(async()=>(await commands(page,'bookmark-update')).map(c=>({...c,now:undefined}))).toEqual([{type:'bookmark-update',id:id(2),title:'Guide renamed',now:undefined}]);
  await finishAll(page);
  await dialog.getByRole('option',{name:/Status/}).click();
  await expect.poll(async()=>(await commands(page,'bookmark-open')).map(c=>({...c,now:undefined}))).toEqual([{type:'bookmark-open',id:id(3),now:undefined}]);
  await finishAll(page);
  await expect(page.getByRole('dialog',{name:'Bookmarks'})).toHaveCount(0);
 });

 test('the star is disabled on unsavable pages and at the limit, and the notice dismisses',async({page})=>{
  await open(page,mode);
  await page.evaluate(()=>window.browserActionFixture.page({url:'about:blank'}));
  const star=page.getByRole('button',{name:'Bookmark this page',exact:true});
  await expect(star).toBeDisabled();await expect(star).toHaveAttribute('title','Only public http or https pages can be bookmarked.');
  await page.evaluate(()=>window.browserActionFixture.page({url:'https://reading.example/one'}));
  await page.evaluate(()=>window.browserActionFixture.bookmarks(Array.from({length:200},(_,n)=>({id:`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`,url:`https://example.org/${n}`,title:`p${n}`,createdAt:'2026-11-21T22:00:00.000Z',updatedAt:'2026-11-21T22:00:00.000Z'})),'2 saved bookmarks could not be read and were removed.'));
  await expect(star).toBeDisabled();await expect(star).toHaveAttribute('title','Bookmark limit reached (200). Remove one to save another.');
  await page.getByRole('button',{name:'Bookmarks',exact:true}).click();
  const notice=page.locator('.bookmark-notice');
  await expect(notice).toContainText('2 saved bookmarks');
  await notice.getByRole('button',{name:'Dismiss bookmark notice'}).click();
  await expect.poll(async()=>(await commands(page,'bookmark-notice-dismiss')).length).toBe(1);
 });

 test('Ctrl+D saves and the keep-query checkbox updates the stored url',async({page})=>{
  await open(page,mode);
  await page.evaluate(()=>window.browserActionFixture.page({url:'https://reading.example/one?tab=api#frag'}));
  await page.getByRole('textbox',{name:'Browser address'}).click();
  await page.keyboard.press('Control+d');
  await expect.poll(async()=>(await commands(page,'bookmark-add')).length).toBe(1);
  await finishAll(page);
  await page.evaluate(()=>window.browserActionFixture.bookmarks([{id:'00000000-0000-4000-8000-000000000004',url:'https://reading.example/one',title:'Synthetic reading page',createdAt:'2026-11-21T22:00:00.000Z',updatedAt:'2026-11-21T22:00:00.000Z'}]));
  const checkbox=page.getByRole('dialog',{name:'Edit bookmark'}).getByRole('checkbox');
  await expect(checkbox).toBeVisible();await checkbox.check();
  await expect.poll(async()=>(await commands(page,'bookmark-update')).map(c=>({...c,now:undefined}))).toEqual([{type:'bookmark-update',id:id(4),keepQuery:true,now:undefined}]);
 });

 test('keyboard arrows and Delete drive the list and Escape restores focus',async({page})=>{
  await open(page,mode);
  await page.evaluate(()=>window.browserActionFixture.bookmarks([{id:'00000000-0000-4000-8000-000000000005',url:'https://reading.example/page-5',title:'Saved page 5',createdAt:'2026-11-21T22:05:00.000Z',updatedAt:'2026-11-21T22:05:00.000Z'},{id:'00000000-0000-4000-8000-000000000006',url:'https://reading.example/page-6',title:'Saved page 6',createdAt:'2026-11-21T22:06:00.000Z',updatedAt:'2026-11-21T22:06:00.000Z'}]));
  const trigger=page.getByRole('button',{name:'Bookmarks',exact:true});
  await trigger.click();
  const dialog=page.getByRole('dialog',{name:'Bookmarks'});
  await dialog.getByRole('option').first().focus();
  await page.keyboard.press('ArrowDown');
  await expect(dialog.getByRole('option').nth(1)).toBeFocused();
  await page.keyboard.press('Delete');
  await expect.poll(async()=>(await commands(page,'bookmark-remove')).map(c=>({...c,now:undefined}))).toEqual([{type:'bookmark-remove',id:id(6),now:undefined}]);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);await expect(trigger).toBeFocused();
 });
});

test('detached overlay bounds hide and restore the native view around popovers',async({page})=>{
 await open(page,'detached');
 await page.getByRole('button',{name:'Bookmarks',exact:true}).click();
 await expect.poll(async()=>(await commands(page,'overlay'))).toEqual([{type:'overlay',open:true}]);
 await page.keyboard.press('Escape');
 await expect.poll(async()=>(await commands(page,'overlay'))).toEqual([{type:'overlay',open:true},{type:'overlay',open:false}]);
});
