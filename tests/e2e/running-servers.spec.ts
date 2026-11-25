import {test,expect,type Page,type Route} from '@playwright/test';
import type {RunningServersFixture} from './fixtures/running-servers';

declare global{interface Window{runningServersFixture:RunningServersFixture}}
type Row={id:string;projectId:string;threadId:string|null;threadTitle:string|null;terminalId:string;url:string;port:number;label:string;source:string;scriptName:string|null;startedAt:string;detectedAt:string};
const row=(id:string,port:number,label:string,extra:Partial<Row>={}):Row=>({id:`${id}:${port}`,projectId:'project-a',threadId:'thread-a',threadTitle:'Alpha',terminalId:id,url:`http://localhost:${port}/`,port,label,source:'terminal',scriptName:null,startedAt:'2026-01-01T00:00:00Z',detectedAt:'2026-01-01T00:00:01Z',...extra});
const json=(route:Route,body:unknown,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});

async function mount(page:Page,servers:Row[]){
 const items=[...servers],stops:Record<string,unknown>[]=[];
 await page.route('**/*',async route=>{
  const request=route.request(),url=new URL(request.url());
  if(url.origin!=='http://127.0.0.1:5815'){await route.abort();return;}
  if(!url.pathname.startsWith('/api/')){await route.continue();return;}
  if(url.pathname==='/api/bootstrap'){await json(route,{csrfToken:'synthetic-csrf'});return;}
  if(url.pathname==='/api/projects/project-a/dev-servers'){await json(route,{items:[...items]});return;}
  const stop=/^\/api\/terminals\/([^/]+)\/commands$/.exec(url.pathname);
  if(stop&&request.method()==='POST'){
   stops.push(request.postDataJSON() as Record<string,unknown>);
   const index=items.findIndex(item=>item.terminalId===stop[1]);
   if(index>=0)items.splice(index,1);
   await json(route,{id:stop[1],projectId:'project-a',output:'',start:0,cursor:0,exited:true,exitCode:0});
   return;
  }
  await route.abort();
 });
 return{items,stops,add:(entry:Row)=>{items.push(entry);}};
}
const refresh=(page:Page)=>page.evaluate(()=>window.runningServersFixture.refresh());

test('rows appear with enter motion; a confirmed stop removes the row and moves focus',async({page})=>{
 const state=await mount(page,[row('term-1',5173,'dev')]);
 await page.goto('/tests/e2e/fixtures/running-servers.html');
 const rows=page.locator('.running-servers-row');
 await expect(rows).toHaveCount(1);
 // A newly inserted row animates in.
 state.add(row('term-2',3000,'npm start',{threadTitle:'Beta'}));
 await refresh(page);
 await expect(rows).toHaveCount(2);
 expect(await rows.nth(1).evaluate(el=>el.getAnimations().length)).toBeGreaterThan(0);
 // Confirm-stop sends the terminal command; the row is removed and focus lands on the next row.
 const armed=rows.first().locator('.running-servers-stop');
 await armed.click();
 await expect(armed).toHaveAccessibleName('Confirm stop dev');
 await armed.click();
 await expect.poll(()=>state.stops.length).toBe(1);
 expect(state.stops[0]).toMatchObject({projectId:'project-a',threadId:'thread-a',type:'stop'});
 await refresh(page);
 await expect(rows).toHaveCount(1);
 await expect(rows.first().locator('button').first()).toBeFocused();
});

test('reduced-motion emulation removes the row enter animation',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await mount(page,[row('term-1',5173,'dev')]);
 await page.goto('/tests/e2e/fixtures/running-servers.html');
 const rowEl=page.locator('.running-servers-row');
 await expect(rowEl).toHaveCount(1);
 expect(await rowEl.evaluate(el=>el.getAnimations().length)).toBe(0);
});

test('renders light and dark variants at desktop and phone widths',async({page},info)=>{
 await mount(page,[row('term-1',5173,'dev'),row('term-2',3000,'npm start',{threadTitle:'Beta'})]);
 await page.goto('/tests/e2e/fixtures/running-servers.html');
 await expect(page.locator('.running-servers-row')).toHaveCount(2);
 await page.screenshot({path:info.outputPath('dark-1280.png'),fullPage:true});
 await page.goto('/tests/e2e/fixtures/running-servers.html?theme=light');
 await expect(page.locator('.running-servers-row')).toHaveCount(2);
 await page.screenshot({path:info.outputPath('light-1280.png'),fullPage:true});
 await page.setViewportSize({width:390,height:844});
 await page.goto('/tests/e2e/fixtures/running-servers.html');
 await expect(page.locator('.running-servers-row')).toHaveCount(2);
 await page.screenshot({path:info.outputPath('dark-390.png'),fullPage:true});
 await page.goto('/tests/e2e/fixtures/running-servers.html?theme=light');
 await expect(page.locator('.running-servers-row')).toHaveCount(2);
 await page.screenshot({path:info.outputPath('light-390.png'),fullPage:true});
});

test('empty list renders no section; a failed stop keeps the row and shows the error',async({page})=>{
 const state=await mount(page,[]);
 await page.route('**/api/terminals/term-1/commands',route=>route.fulfill({status:500,contentType:'application/json',body:JSON.stringify({error:{code:'HTTP_ERROR',message:'Terminal termination was not confirmed.'}})}));
 await page.goto('/tests/e2e/fixtures/running-servers.html');
 await expect(page.locator('.running-servers')).toHaveCount(0);
 state.add(row('term-1',5173,'dev'));
 await refresh(page);
 await expect(page.locator('.running-servers-row')).toHaveCount(1);
 const stop=page.locator('.running-servers-stop');
 await stop.click();await stop.click();
 await expect.poll(()=>page.locator('.running-servers-error').count()).toBe(1);
 await expect(page.getByRole('alert')).toHaveText('Terminal termination was not confirmed.');
 await expect(page.locator('.running-servers-row')).toHaveCount(1);
 expect(state.stops.length).toBe(0);
});
