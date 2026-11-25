import {test,expect,type Page} from '@playwright/test';
import {EMPTY_USAGE} from '../../packages/contracts';
import {PLANNING_PROVENANCE,planDataId} from '../../packages/contracts/planning';
import {clampFloatingLayout} from '../../apps/web/src/floating-layout';
import {serveTaskFixture,taskFixture} from './task-interface-fixture';
const now='2026-10-30T05:00:00.000Z';
function fixture(){const snapshot=taskFixture({root:'text',elements:{text:{type:'Text',props:{text:'Investigating the checkout boundary.'}}}});snapshot.threads[0].projectId='overview-project';snapshot.data.push({id:planDataId('task-thread'),threadId:'task-thread',revision:1,provenance:PLANNING_PROVENANCE,createdAt:now,value:{version:1,title:'Repair checkout failures',steps:[{id:'investigate',title:'Find the failing boundary',status:'working',requirements:[{id:'reproduce',label:'Reproduce the failure',completed:true},{id:'locate',label:'Locate the assertion',completed:false}],agentIds:[]}],agents:[]}});snapshot.usage['task-thread']={...EMPTY_USAGE,inputTokens:12640,outputTokens:820,contextTokens:35000,contextWindow:200000};return snapshot;}
async function settledWindow(panel:ReturnType<Page['getByRole']>){await expect.poll(()=>panel.evaluate(node=>node.getAnimations().filter(animation=>animation.playState==='running').length)).toBe(0);}
async function openPlan(page:Page){await expect(page.getByRole('textbox',{name:'Message',exact:true})).toBeEnabled({timeout:30000});const panel=page.getByRole('region',{name:'Project overview',exact:true});await page.getByRole('button',{name:'Select project',exact:true}).click();await expect(panel).toBeVisible();await settledWindow(page.getByRole('dialog',{name:'Select project',exact:true}));return panel;}
async function openUsage(page:Page){const usage=page.getByRole('region',{name:'Live usage',exact:true}),launcher=page.getByRole('button',{name:'Show live usage',exact:true});await launcher.click();await expect(usage).toBeVisible();return usage;}

test('floating geometry rejects nonfinite storage and confines windows to a narrow viewport',()=>{
 const result=clampFloatingLayout({x:9000,y:-400,width:4000,height:5000,collapsed:false},{width:390,height:844,top:60,bottom:620},{width:280,height:180});
 expect(result.x).toBeGreaterThanOrEqual(8);expect(result.y).toBeGreaterThanOrEqual(60);expect(result.x+result.width).toBeLessThanOrEqual(382);expect(result.y+result.height).toBeLessThanOrEqual(620);
 const invalid=clampFloatingLayout({x:NaN,y:Infinity,width:-400,height:NaN,collapsed:false},{width:1000,height:800},{width:280,height:180});expect(Object.values(invalid).filter(value=>typeof value==='number').every(Number.isFinite)).toBe(true);
});
test('picker overview dismisses and preserves the composer draft on reload',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await serveTaskFixture(page,fixture());await page.goto('/');const panel=await openPlan(page);
 await expect(page.getByRole('tab',{name:'Plan',exact:true})).toHaveCount(0);await expect(panel.getByRole('button',{name:/^Move |^Resize |^Close |^Detach |^Reset /})).toHaveCount(0);
 await page.keyboard.press('Escape');await expect(panel).toBeHidden();await page.getByRole('textbox',{name:'Message',exact:true}).fill('Keep this composer draft.');
 await page.reload();await expect(page.getByRole('region',{name:'Project overview',exact:true})).toBeHidden();await openPlan(page);await expect(page.getByRole('textbox',{name:'Message',exact:true})).toHaveValue('Keep this composer draft.');
});
test('picker Escape retains task content without a separate overview control',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await serveTaskFixture(page,fixture());await page.goto('/');const panel=await openPlan(page),body=panel.getByRole('region',{name:'Plan summary',exact:true});
 await expect(body.getByText('Repair checkout failures',{exact:true})).toBeVisible();await expect(page.getByRole('region',{name:'Task plan: Repair checkout failures',exact:true}).getByText('Find the failing boundary',{exact:true})).toBeVisible();await expect(panel.getByRole('separator')).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Project overview',exact:true})).toHaveCount(0);await page.keyboard.press('Escape');await expect(panel).toBeHidden();await expect(page.getByRole('button',{name:'Select project',exact:true})).toBeFocused();
 await openPlan(page);await expect(body.getByText('Repair checkout failures',{exact:true})).toBeVisible();
});
test('live usage stays available and remembers its minimized state without close or resize controls',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await serveTaskFixture(page,fixture());await page.goto('/');let usage=await openUsage(page);await expect(usage).toHaveAttribute('data-collapsed','true');
 await expect(usage.getByRole('button',{name:/^Move |^Resize |^Close Live usage$|^Detach |^Reset /})).toHaveCount(0);
 await usage.getByRole('button',{name:'Inspect live usage',exact:true}).click();await expect(usage).toHaveAttribute('data-collapsed','false');
 await page.keyboard.press('Escape');await expect(usage).toHaveAttribute('data-collapsed','true');await expect(usage.getByRole('button',{name:'Inspect live usage',exact:true})).toBeFocused();
 await page.reload();usage=await openUsage(page);await expect(usage).toBeVisible();await expect(usage).toHaveAttribute('data-collapsed','true');
});
test('picker and usage fit a narrow viewport and leave Stop available after dismissal',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});const snapshot=fixture();snapshot.threads[0].status='working';snapshot.threads[0].runId='fixture-run';await serveTaskFixture(page,snapshot);await page.goto('/');
 const usage=await openUsage(page);await usage.getByRole('button',{name:'Inspect live usage',exact:true}).click();await openPlan(page);
 for(const tool of [page.getByRole('dialog',{name:'Select project',exact:true}),usage]){const bounds=await tool.boundingBox();expect(bounds!.x).toBeGreaterThanOrEqual(0);expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(390);expect(bounds!.y).toBeGreaterThanOrEqual(0);expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(844);}
 await page.keyboard.press('Escape');const stop=page.getByRole('button',{name:'Stop agent',exact:true});expect(await stop.evaluate(node=>{const r=node.getBoundingClientRect();return node.contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2));})).toBe(true);await expect(stop).toBeEnabled();expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
});
