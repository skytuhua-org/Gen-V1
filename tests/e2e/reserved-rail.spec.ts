import {test,expect,type Page} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {EMPTY_USAGE} from '../../packages/contracts';
import {PLANNING_PROVENANCE,planDataId} from '../../packages/contracts/planning';
import {serveTaskFixture,taskFixture} from './task-interface-fixture';

const project={id:'overview-project',name:'Fieldwork',rootPath:'C:/Projects/fieldwork',authority:{kind:'local'} as const,createdAt:'2026-11-04T00:00:00Z'};
const snapshot=()=>{
 const value=taskFixture({root:'text',elements:{text:{type:'Text',props:{text:'Inspect the checkout calculation.'}}}});
 value.threads[0].projectId=project.id;value.threads[0].projectName=project.name;
 value.data.push({id:planDataId('task-thread'),threadId:'task-thread',revision:1,provenance:PLANNING_PROVENANCE,createdAt:'2026-10-30T00:00:00Z',value:{version:1,title:'Repair checkout failures',steps:[{id:'inspect',title:'Find the failing boundary',status:'working',requirements:[{id:'first',label:'Reproduce the exact quantity assertion',completed:true},{id:'second',label:'Compare the existing implementation',completed:false}],agentIds:['reader']}],agents:[{id:'reader',commandId:'batch',taskId:'inspect',reportedPercent:null,createdAt:'2026-10-30T00:00:00Z',updatedAt:'2026-10-30T00:00:00Z',name:'Test investigator',task:'Trace the quantity assertion and compare both affected caller paths.',status:'working',completedRequirementIds:['one'],requirements:[{id:'one',label:'Locate the quantity assertion'},{id:'two',label:'Compare the empty-basket boundary'}]}]}});
 value.usage['task-thread']={...EMPTY_USAGE,inputTokens:12640,outputTokens:820,contextTokens:35000,contextWindow:200000};return value;
};
const captureDirectory=process.env.PROJECT_OVERVIEW_CAPTURE_DIR;
async function serve(page:Page,value=snapshot()){
 const host=await serveTaskFixture(page,value);
 await page.route('**/api/workspace',route=>route.fulfill({json:{projects:[project,{...project,id:'other-project',name:'Other project',rootPath:'C:/Projects/other'}],state:{version:1,revision:0,activeCanvasId:'workspace',canvases:[{id:'workspace',name:'Workspace',preset:'workspace',version:1,panels:[],filter:'active',projectIds:[],viewport:{x:0,y:0,zoom:1}}],profiles:[],disabledKinds:[],integrations:{}}}}));
 await page.route('**/api/projects/*/context*',route=>route.fulfill({json:{project,threadId:'task-thread',machineName:'Local workspace',editor:{available:true,label:'VS Code'},branch:'main',head:'fixture-head',revision:'fixture-revision',changes:{added:18,removed:4,files:3},lineage:[],scripts:[{id:'test',name:'Run tests',command:'pnpm test'}],capabilities:{git:true,terminal:true,pullRequests:false}}}));
 return host;
}
async function showPlan(page:Page){
 await expect(page.locator('[data-split-view="thread:task-thread"]').getByRole('textbox',{name:'Message',exact:true})).toBeEnabled({timeout:30000});
 const panel=page.getByRole('region',{name:'Project overview',exact:true});
 if(!await panel.isVisible())await page.getByRole('button',{name:'Select project',exact:true}).click();
 await expect(panel).toBeVisible();await expect(page.getByRole('combobox',{name:'Search projects',exact:true})).toBeFocused();return panel;
}
async function showUsage(page:Page){
 if(await page.getByRole('dialog',{name:'Select project',exact:true}).isVisible())await page.keyboard.press('Escape');
 const owner=page.locator('[data-split-view="thread:task-thread"]');await expect(owner.getByRole('textbox',{name:'Message',exact:true})).toBeEnabled({timeout:30000});
 const usage=page.getByRole('region',{name:'Live usage',exact:true});if(!await usage.isVisible())await owner.getByRole('button',{name:'Show live usage',exact:true}).click();await expect(usage).toBeVisible();return usage;
}
async function open(page:Page,value=snapshot()){
 await serve(page,value);await page.goto('/');await showUsage(page);return showPlan(page);
}

test('workspace artifact stays inside its panel while summaries yield space and keeps the same renderer',async({page})=>{
 await page.setViewportSize({width:1920,height:1080});await open(page);await page.keyboard.press('Escape');
 const text=await page.getByText('Inspect the checkout calculation.',{exact:true}).elementHandle();await page.getByRole('button',{name:'Open artifact in workspace',exact:true}).click();
 const panel=page.getByRole('complementary',{name:'Workspace panel',exact:true}),artifact=page.locator('.artifact-in-workspace');await expect(panel).toBeVisible();await expect(artifact).toBeVisible();
 await expect(page.getByRole('region',{name:'Project overview',exact:true})).toBeHidden();await expect(page.getByRole('region',{name:'Live usage',exact:true})).toBeHidden();
 await expect.poll(async()=>{const w=await panel.boundingBox(),a=await artifact.boundingBox();return Boolean(w&&a&&Math.abs(w.x+w.width-1920)<1&&a.x>=w.x&&a.x+a.width<=w.x+w.width+1);}).toBe(true);
 expect(await page.getByText('Inspect the checkout calculation.',{exact:true}).evaluate((node,old)=>node===old,text)).toBe(true);
});
test('expanded usage stays compact and readable instead of reserving an oversized tool',async({page})=>{
 await page.setViewportSize({width:1600,height:1080});await open(page);await page.keyboard.press('Escape');const usage=page.getByRole('region',{name:'Live usage',exact:true});await usage.getByRole('button',{name:'Inspect live usage',exact:true}).click();await expect(usage).toHaveAttribute('data-collapsed','false');await expect(usage.getByRole('button',{name:'Open Usage',exact:true})).toBeVisible();await expect.poll(async()=>Math.round((await usage.boundingBox())!.height)).toBeLessThanOrEqual(280);
});
test('usage minimizes to a compact flow region without a separate overview control on narrow screens',async({page})=>{
 await page.setViewportSize({width:390,height:844});const value=snapshot();value.data=[];await serve(page,value);await page.goto('/');await showUsage(page);
 await expect(page.getByRole('button',{name:'Project overview',exact:true})).toHaveCount(0);
 await expect.poll(async()=>Math.round((await page.getByRole('complementary',{name:'Conversation summaries',exact:true}).boundingBox())!.height)).toBeLessThanOrEqual(110);
 await expect.poll(async()=>Math.round((await page.getByRole('region',{name:'Live usage',exact:true}).boundingBox())!.height)).toBe(38);
});
test('minimized usage retains its rail until an explicit artifact panel takes over',async({page})=>{
 const frame=page.locator('.split-root-workarea .split-workspace');
 await page.setViewportSize({width:1600,height:1000});const plan=await open(page);await page.keyboard.press('Escape');await expect(plan).toBeHidden();const main=(await frame.boundingBox())!,dock=(await page.getByRole('complementary',{name:'Conversation summaries',exact:true}).boundingBox())!;expect(dock.y).toBeGreaterThanOrEqual(main.y+main.height-1);expect(dock.x+dock.width).toBeCloseTo(main.x+main.width,0);expect(dock.height).toBeLessThanOrEqual(110);
 await page.getByRole('button',{name:'Open artifact in workspace',exact:true}).click();await expect(plan).toBeHidden();await expect.poll(async()=>{const main=await frame.boundingBox(),panel=await page.locator('.workspace-right').boundingBox();return panel&&main?panel.x>main.x+main.width-1&&panel.x+panel.width>1580&&main.width<1100:null;}).toBe(true);
});
test('picker overview sits above the project list without changing workspace geometry',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await serve(page);await page.goto('/');await expect(page.getByRole('textbox',{name:'Message',exact:true})).toBeEnabled();
 const before=(await page.locator('main.workspace').boundingBox())!,panel=await showPlan(page),picker=page.getByRole('dialog',{name:'Select project',exact:true});
 const list=picker.getByRole('listbox',{name:'Projects',exact:true});expect((await panel.boundingBox())!.y+(await panel.boundingBox())!.height).toBeLessThanOrEqual((await list.boundingBox())!.y);
 await expect(list.getByRole('option',{name:project.name,exact:true})).toHaveAttribute('aria-selected','true');await expect(list.getByRole('option',{name:'Other project',exact:true})).toBeVisible();
 expect((await page.locator('main.workspace').boundingBox())!.width).toBeCloseTo(before.width,0);
 await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Select project',exact:true})).toBeFocused();expect((await page.locator('main.workspace').boundingBox())!.width).toBeCloseTo(before.width,0);
});
test('overview dismissal keeps the composer draft and exposes no floating-window controls',async({page})=>{
 await page.setViewportSize({width:1600,height:1100});const plan=await open(page);await page.keyboard.press('Escape');
 await page.getByRole('textbox',{name:'Message',exact:true}).fill('Keep composing');await showPlan(page);
 await expect(plan.getByRole('button',{name:/^Move |^Resize |^Detach |^Close |^Reset /})).toHaveCount(0);await page.keyboard.press('Escape');await expect(plan).toBeHidden();await showPlan(page);await expect(page.getByRole('textbox',{name:'Message',exact:true})).toHaveValue('Keep composing');
});
test('picker polling preserves overview identity and search; reopening keeps the artifact renderer stable',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});const host=await serve(page);await page.goto('/');const plan=await showPlan(page),body=await plan.elementHandle(),artifact=await page.getByText('Inspect the checkout calculation.',{exact:true}).elementHandle();
 const search=page.getByRole('combobox',{name:'Search projects',exact:true});await search.fill('Other');await host.publish();await expect(search).toHaveValue('Other');expect(await plan.evaluate((node,old)=>node===old,body)).toBe(true);
 await page.keyboard.press('Escape');await showPlan(page);expect(await page.getByText('Inspect the checkout calculation.',{exact:true}).evaluate((node,old)=>node===old,artifact)).toBe(true);
});
test('overview actions retain their bound project, report failures, and remain keyboard reachable',async({page})=>{
 await serve(page);await page.goto('/');const plan=await showPlan(page),search=page.getByRole('combobox',{name:'Search projects',exact:true});
 await expect(plan.getByRole('button',{name:'main',exact:true})).toBeEnabled();await search.press('Shift+Tab');await expect(plan.getByRole('button',{name:'Project memory',exact:true})).toBeFocused();
 await plan.getByRole('button',{name:'main',exact:true}).click();await plan.getByRole('textbox',{name:'New branch',exact:true}).fill('review-picker');
 let action:unknown;await page.route('**/api/projects/*/actions',async route=>{action=route.request().postDataJSON();expect(new URL(route.request().url()).pathname).toBe('/api/projects/overview-project/actions');await route.fulfill({status:500,json:{error:{code:'INTERNAL',message:'Synthetic branch failure'}}});});
 await plan.getByRole('button',{name:'Create branch',exact:true}).click();await expect(plan.getByRole('alert')).toContainText('Synthetic branch failure');expect(action).toMatchObject({type:'branch',threadId:'task-thread',payload:{name:'review-picker',expectedHead:'fixture-head',revision:'fixture-revision'}});
 await expect(search).toBeEnabled();await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Select project',exact:true})).toBeFocused();
 await showPlan(page);await expect(plan.getByRole('button',{name:'Open full plan',exact:true})).toHaveCount(0);
 await plan.getByRole('button',{name:/^Changes/}).click();await expect(page.getByRole('dialog',{name:'Select project',exact:true})).toBeHidden();await expect(page.locator('[data-split-view="diff:task-thread"]')).toBeVisible();
});
test('narrow picker stays within the viewport and returns keyboard access to composer and Stop',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});const value=snapshot();value.threads[0].status='working';value.threads[0].runId='fixture-run';await serve(page,value);await page.goto('/');await showPlan(page);
 const picker=page.getByRole('dialog',{name:'Select project',exact:true}),bounds=(await picker.boundingBox())!;expect(bounds.x).toBeGreaterThanOrEqual(0);expect(bounds.y).toBeGreaterThanOrEqual(0);expect(bounds.x+bounds.width).toBeLessThanOrEqual(390);expect(bounds.y+bounds.height).toBeLessThanOrEqual(844);
 await expect(picker.getByRole('option',{name:project.name,exact:true})).toBeVisible();await picker.getByRole('button',{name:'Cancel',exact:true}).focus();await page.keyboard.press('Tab');await expect(picker.getByRole('button',{name:'Close dialog',exact:true})).toBeFocused();
 await page.keyboard.press('Escape');for(const name of ['Message','Stop agent']){const el=name==='Message'?page.getByRole('textbox',{name,exact:true}):page.getByRole('button',{name,exact:true});expect(await el.evaluate(node=>{const r=node.getBoundingClientRect();return node.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));})).toBe(true);}expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
});
if(captureDirectory)for(const mode of ['light','dark','mobile']as const)test('capture project picker '+mode,async({page})=>{
 await page.setViewportSize(mode==='mobile'?{width:390,height:844}:{width:1440,height:900});const value=snapshot();value.settings.theme=mode==='light'?'light':'dark';await serve(page,value);await page.goto('/');await showPlan(page);
 const picker=page.getByRole('dialog',{name:'Select project',exact:true});await expect(picker.getByRole('button',{name:'main',exact:true})).toBeEnabled();
 await picker.evaluate(node=>Promise.all(node.getAnimations().map(a=>a.finished.catch(()=>{}))));await mkdir(captureDirectory,{recursive:true});await page.screenshot({path:resolve(captureDirectory,'project-picker-'+mode+'.png')});
});
