import {test,expect,type Page} from '@playwright/test';
import {fileURLToPath} from 'node:url';

async function openFindFixture(page:Page,detached=false){
 const module='/@fs/'+encodeURI(fileURLToPath(new URL('./browser-find-fixture.tsx',import.meta.url)).replaceAll('\\','/'));
 await page.route('**/find-check*',route=>route.fulfill({contentType:'text/html',body:`<html><head><style>body{margin:0}#root{position:absolute;left:0;top:0;width:800px;height:600px;display:flex;flex-direction:column}.desktop-browser-surface{flex:1;display:flex;flex-direction:column}.desktop-browser-native{flex:1;min-height:0}.desktop-browser-dock{display:flex;flex-direction:column;flex:1}</style></head><body><div id="root"></div><script type="module">import RefreshRuntime from '/@react-refresh';RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;await import('${module}');</script></body></html>`}));
 await page.goto(detached?'/find-check?detached':'/find-check');
 await page.waitForFunction(()=>window.findCalls!==undefined);
}
const calls=(page:Page)=>page.evaluate(()=>window.findCalls.map(command=>command.type));

test('docked browser toolbar scopes Ctrl+F to the browser and the bar drives find commands',async({page})=>{
 await openFindFixture(page);
 // Focus outside the browser dock: the accelerator must not fire.
 await page.locator('body').click({position:{x:790,y:590}});await page.keyboard.press('Control+f');
 expect(await calls(page)).not.toContain('find-open');
 await page.getByRole('button',{name:'Find in page',exact:true}).click();
 await expect.poll(()=>calls(page)).toContain('find-open');
 const input=page.locator('.desktop-browser-find input');
 await expect(input).toBeFocused();
 await input.pressSequentially('need');
 await expect.poll(()=>calls(page)).toContain('find-query');
 expect(await page.evaluate(()=>window.findCalls.filter(command=>command.type==='find-query').at(-1))).toMatchObject({query:'need'});
 await input.press('Enter');await expect.poll(()=>calls(page)).toContain('find-next');
 await input.press('Shift+Enter');await expect.poll(()=>calls(page)).toContain('find-prev');
 await page.evaluate(()=>window.pushState({windows:[],dockedBrowser:{browserId:'owned-browser',state:{url:'https://reading.example/page',title:'Synthetic reading page',canGoBack:true,canGoForward:false,loading:false,find:{open:true,openRequest:1,query:'need',ordinal:2,matches:5,searching:false}}}}));
 await expect(page.locator('.desktop-browser-find-count')).toHaveText('2 of 5');
 await input.press('Escape');await expect.poll(()=>calls(page)).toContain('find-close');
});

test('detached browser surface measures its own slot and exposes the same find bar',async({page})=>{
 await openFindFixture(page,true);
 await expect.poll(()=>calls(page)).toContain('bounds');
 const measured=await page.evaluate(()=>window.findCalls.filter(command=>command.type==='bounds').at(-1));
 expect(measured).toMatchObject({type:'bounds'});
 expect((measured as {bounds:{height:number}}).bounds.height).toBeGreaterThan(400);
 await page.getByRole('button',{name:'Find in page',exact:true}).click();
 await expect.poll(()=>calls(page)).toContain('find-open');
 await expect(page.locator('.desktop-browser-find')).toBeVisible();
 await expect.poll(async()=>(await page.evaluate(()=>window.findCalls.filter(command=>command.type==='bounds').at(-1) as {bounds:{height:number}})).bounds.height).toBeLessThan(560);
});
