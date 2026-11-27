import {test, expect, type Page} from '@playwright/test';

async function fixture(page: Page) {
  const requests: string[] = [], errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== 'http://127.0.0.1:5802' || url.pathname.startsWith('/api/') || url.pathname.startsWith('/widget-runtime')) {
      requests.push(url.href); return route.abort();
    }
    return route.continue();
  });
  await page.goto('/tests/e2e/fixtures/inbox-controls.html');
  await expect(page.locator('.ui-list-row')).toHaveCount(5);
  return {requests, errors};
}
const filter = (page: Page) => page.getByRole('combobox', {name: 'Inbox filter', exact: true});
const rows = (page: Page) => page.locator('.ui-list-row-main');
const calls = (page: Page) => page.evaluate(() => window.inboxControls.calls);
async function choose(page: Page, label: string) {
  await filter(page).click(); await page.getByRole('option', {name: label, exact: true}).click();
  await expect(filter(page)).toBeFocused(); await expect(filter(page)).toHaveText(label);
}

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
  await expect(page.getByRole('listbox')).toHaveCount(0); await expect(page.getByRole('button', {name: 'Refresh inbox', exact: true})).toBeFocused();
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
    await expect(page.getByRole('status').filter({hasText:mode === 'source-error' ? 'Inbox could not load.' : 'Refresh failed.'})).toBeVisible();
    await expect(filter(page)).toHaveText('Unread'); await expect(rows(page)).toHaveCount(3);
    expect(await calls(page)).toEqual([{type: 'refresh'}]); expect(errors).toEqual([]);
  });
}

test('reading and failed canonical navigation never approve or falsely mark an unread item read', async ({page}) => {
  const {requests, errors} = await fixture(page);
  await rows(page).filter({hasText: 'Question'}).first().click();
  await expect(page.getByRole('button', {name: 'Question, Needs your input', exact: true})).toBeVisible();
  await page.getByRole('button', {name: 'Mark unread'}).click();
  await page.evaluate(() => {window.inboxControls.openMode = 'reject';});
  await page.getByRole('button', {name: 'Open conversation'}).click();
  await expect(page.getByRole('status').filter({hasText:'Navigation failed.'})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Question, Needs your input, unread', exact: true})).toHaveAttribute('aria-current', 'true');
  expect(await calls(page)).toEqual([{type: 'read', id: 'question'}, {type: 'unread', id: 'question'}, {type: 'open', id: 'thread-question'}]);
  expect(await page.evaluate(() => window.inboxControls.items.find(item => item.id === 'question'))).toMatchObject({read: false, state: 'needs-input', actionable: true});
  expect(requests).toEqual([]); expect(errors).toEqual([]);
});

test('read-state rejection remains visible without changing read state or invoking navigation', async ({page}) => {
  await fixture(page); await page.evaluate(() => {window.inboxControls.readMode = 'reject';});
  await rows(page).filter({hasText: 'Question'}).first().click();
  await expect(page.getByRole('status').filter({hasText:'Read state could not save.'})).toBeVisible();
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


test('Mark unread cancels the selected Inbox item’s delayed automatic read', async ({page}) => {
  await fixture(page);
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 100));
  await rows(page).filter({hasText: 'Question'}).first().click();
  expect(await calls(page)).toEqual([]);
  await page.getByRole('button', {name: 'Mark unread', exact: true}).click();
  await page.clock.runFor(600);
  expect(await calls(page)).toEqual([{type: 'unread', id: 'question'}]);
  await expect(page.getByRole('button', {name: 'Question, Needs your input, unread', exact: true})).toBeVisible();
});

test('Mark unread wins over an automatic read already in flight for that Inbox item', async ({page}) => {
  await fixture(page);
  await page.evaluate(() => {
    window.inboxControls.holdRead = new Promise(resolve => window.addEventListener('fixture-release-read', () => resolve(), {once:true}));
  });
  await rows(page).filter({hasText: 'Question'}).first().click();
  await expect.poll(() => calls(page)).toEqual([{type: 'read', id: 'question'}]);
  await page.getByRole('button', {name: 'Mark unread', exact: true}).click();
  const beforeRelease=await calls(page);
  await page.evaluate(() => window.dispatchEvent(new Event('fixture-release-read')));
  expect(beforeRelease).toEqual([{type: 'read', id: 'question'}]);
  await expect.poll(() => calls(page)).toEqual([{type: 'read', id: 'question'}, {type: 'unread', id: 'question'}]);
  await expect(page.getByRole('button', {name: 'Question, Needs your input, unread', exact: true})).toBeVisible();
});


for(const action of ['refresh','unread','open'] as const){
  test(`successful ${action} retry clears only its current failure`,async({page})=>{
    await fixture(page);await rows(page).filter({hasText:'Review'}).click();
    const button=page.getByRole('button',{name:action==='refresh'?'Refresh inbox':action==='unread'?'Mark unread':'Open conversation',exact:true});
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
    await page.getByRole('button',{name:'Mark unread',exact:true}).click();
    await expect.poll(()=>calls(page)).toEqual([{type:'unread',id:'review'}]);
    await page.evaluate(()=>{window.inboxControls.readMode='reject';});
    await rows(page).filter({hasText:'Failed task'}).click();
    await expect(page.locator('.agent-inbox-error')).toHaveText('Read state could not save.');
    await page.evaluate(()=>window.dispatchEvent(new Event('release-unread')));
    await page.evaluate(async()=>{await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);});
    await expect(page.locator('.agent-inbox-error')).toHaveText('Read state could not save.');
  });
  test(`late refresh ${outcome} cannot overwrite a newer refresh result`,async({page})=>{
    await fixture(page);
    await page.evaluate(outcome=>{window.inboxControls.refreshMode=outcome;window.inboxControls.holdRefresh=new Promise(resolve=>window.addEventListener('release-refresh',()=>resolve(),{once:true}));},outcome);
    const refresh=page.getByRole('button',{name:'Refresh inbox',exact:true});await refresh.click();
    await expect.poll(()=>calls(page)).toEqual([{type:'refresh'}]);
    await page.evaluate(outcome=>{window.inboxControls.holdRefresh=undefined;window.inboxControls.refreshMode=outcome==='success'?'reject':'success';},outcome);
    await refresh.click();
    if(outcome==='success')await expect(page.locator('.agent-inbox-error')).toContainText('Refresh failed.');else await expect(page.locator('.agent-inbox-error')).toHaveCount(0);
    await page.evaluate(()=>window.dispatchEvent(new Event('release-refresh')));
    await page.evaluate(async()=>{await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);});
    if(outcome==='success')await expect(page.locator('.agent-inbox-error')).toContainText('Refresh failed.');else await expect(page.locator('.agent-inbox-error')).toHaveCount(0);
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
