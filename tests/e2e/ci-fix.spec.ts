// #1326 T09 — browser regression, motion and visual acceptance for the
// failing-CI feature (panel disclosure + fix sheet + thread chip).
// Screenshots land in /tmp/ci-fix-shots for the issue checkpoint.
import {expect,test} from '@playwright/test';
import {mkdirSync} from 'node:fs';

const job=(id:string,checkName:string,over:Record<string,unknown>={})=>({id,checkName,workflowName:'CI',failedStep:'Run tests',conclusion:'FAILURE',url:`https://github.com/fixture/project/actions/runs/55/job/${id}`,logState:'ready',excerpt:`▸ Build\nsome output ${id}\nAssertionError: expected 1 to equal 2\nmore context`,excerptLines:4,errorLines:[2],truncated:false,...over});
const report=(jobs:Record<string,unknown>[])=>({id:'r'.repeat(64),repo:'fixture/project',number:12,headOid:'b'.repeat(40),localHead:'a'.repeat(40),observedAt:'2026-11-21T00:00:00.000Z',jobs,omittedJobs:0});
const checks=[
 {name:'build',status:'COMPLETED',conclusion:'SUCCESS'},
 {name:'lint',status:'COMPLETED',conclusion:'FAILURE',detailsUrl:'https://github.com/fixture/project/actions/runs/55/job/101'},
 {name:'coverage',status:'COMPLETED',conclusion:'FAILURE',detailsUrl:'https://codecov.io/fixture/project/commit/abc'},
 {name:'retention',status:'COMPLETED',conclusion:'FAILURE',detailsUrl:'https://github.com/fixture/project/actions/runs/55/job/103'}];

async function panel(page:import('@playwright/test').Page,theme='dark'){
 await page.route('**/api/**',route=>route.fulfill({status:404,json:{error:{message:'Unconfigured fixture request'}}}));
 await page.route('**/api/bootstrap',route=>route.fulfill({json:{csrfToken:'fixture'}}));
 await page.route('**/api/shell-settings',route=>route.fulfill({json:{theme,flags:{'workspace.ciFixV1':true}}}));
 await page.route('**/api/projects/project-one/git?*',route=>route.fulfill({json:{head:'a'.repeat(40),revision:'c'.repeat(64),branch:'gen/review',mode:'managed',gitWrite:true,files:[],diff:'',stagedDiff:'',truncated:false}}));
 await page.route('**/api/projects/project-one/pull-requests?*',route=>route.fulfill({json:{repo:'fixture/project',items:[{number:12,title:'PR 12',url:'https://github.com/fixture/project/pull/12',state:'OPEN'}]}}));
 await page.route('**/api/projects/project-one/pull-requests/12?*',route=>route.fulfill({json:{item:{number:12,title:'PR 12',headRefOid:'b'.repeat(40),state:'OPEN',files:[],statusCheckRollup:checks},head:'a'.repeat(40),revision:'c'.repeat(64),canReview:true}}));
 await page.route('**/api/projects/project-one/pull-requests/12/failures?*',route=>route.fulfill({json:report([job('101','lint'),job('103','retention')])}));
 await page.goto('/shared-panels-check?project=1&pr-panels=pull-request');
 const region=page.getByRole('region',{name:'first PR panel'});
 await region.getByRole('button',{name:'#12 PR 12',exact:true}).click();
 return region;
}

const SHOTS='/tmp/ci-fix-shots';
try{mkdirSync(SHOTS,{recursive:true});}catch{}

for(const theme of ['dark','light']){
 for(const zoom of [1,1.25,1.5]){
  test(`visual: ${theme} theme at ${zoom*100}% — log disclosure + fix sheet`,async({page})=>{
   const region=await panel(page,theme);
   await page.evaluate((z)=>{document.documentElement.dataset.theme=z>1?'dark':document.documentElement.dataset.theme;document.body.style.zoom=String(z);},zoom);
   if(theme==='light')await page.evaluate(()=>{document.documentElement.dataset.theme='light';});
   await region.getByRole('button',{name:/log for lint/}).click();
   await region.getByRole('button',{name:'Fix with agent'}).click();
   await expect(region.locator('.pr-fix-sheet')).toBeVisible();
   await page.screenshot({path:`${SHOTS}/${theme}-${Math.round(zoom*100)}-sheet.png`,fullPage:true});
   await expect(region.locator('.pr-check-log-body')).toContainText('AssertionError');
  });
 }
}

test('motion: data-motion=reduced removes height/grid transitions, off removes all',async({page})=>{
 const region=await panel(page);
 await region.getByRole('button',{name:/log for lint/}).click();
 const anim=region.locator('.pr-check-log-anim');
 await expect(anim).toBeVisible();
 // Normal motion: grid-template-rows transition is present.
 await expect.poll(()=>anim.evaluate(el=>getComputedStyle(el).transitionProperty)).toContain('grid-template-rows');
 await page.evaluate(()=>{document.documentElement.dataset.motion='reduced';});
 await expect.poll(()=>anim.evaluate(el=>getComputedStyle(el).transitionProperty)).not.toContain('grid-template-rows');
 await expect.poll(()=>anim.evaluate(el=>getComputedStyle(el).transitionProperty)).toContain('opacity');
 await page.evaluate(()=>{document.documentElement.dataset.motion='off';});
 await expect.poll(()=>anim.evaluate(el=>getComputedStyle(el).transitionDuration)).toBe('0s');
});

test('280px tool width keeps the disclosure and sheet usable',async({page})=>{
 await page.setViewportSize({width:340,height:800});
 const region=await panel(page);
 await region.getByRole('button',{name:/log for lint/}).click();
 await expect(region.locator('.pr-check-log')).toBeVisible();
 await region.getByRole('button',{name:'Fix with agent'}).click();
 const sheet=region.locator('.pr-fix-sheet');
 await expect(sheet).toBeVisible();
 const box=await sheet.boundingBox();
 expect(box!.width).toBeLessThanOrEqual(340);
 await page.screenshot({path:`${SHOTS}/dark-280px-sheet.png`,fullPage:true});
});

test('thread chip visuals under both motion settings',async({page})=>{
 await page.route('**/api/**',route=>route.fulfill({status:404,json:{error:{message:'Unconfigured fixture request'}}}));
 await page.route('**/api/bootstrap',route=>route.fulfill({json:{csrfToken:'fixture'}}));
 await page.goto('/shared-panels-check?chip=1');
 const chip=page.getByRole('button',{name:'Failing CI · 2 jobs'});
 await chip.click();
 await expect(page.locator('.pr-check-log')).toHaveCount(2);
 await page.screenshot({path:`${SHOTS}/dark-chip-expanded.png`,fullPage:true});
 await page.evaluate(()=>{document.documentElement.dataset.motion='reduced';});
 await expect(page.locator('.pr-check-log')).toHaveCount(2);
});
