// Test-only spec: #1326 T06 — .pr-checks log disclosure with route mocks on the
// shared-panels fixture (DESIGN 7.1–7.2). The report endpoint is mocked; no gh on this box.
import {expect,test} from '@playwright/test';

const job=(id:string,checkName:string,over:Record<string,unknown>={})=>({id,checkName,workflowName:'CI',failedStep:'Run tests',conclusion:'FAILURE',url:`https://github.com/fixture/project/actions/runs/55/job/${id}`,logState:'ready',excerpt:`▸ Build\nsome output ${id}\nAssertionError: expected 1 to equal 2\nmore context`,excerptLines:4,errorLines:[2],truncated:false,...over});
const report=(jobs:Record<string,unknown>[])=>({id:'r'.repeat(64),repo:'fixture/project',number:12,headOid:'b'.repeat(40),localHead:'a'.repeat(40),observedAt:'2026-11-21T00:00:00.000Z',jobs,omittedJobs:0});

async function panel(page:import('@playwright/test').Page,{flag=true,checks=[
 {name:'build',status:'COMPLETED',conclusion:'SUCCESS'},
 {name:'lint',status:'COMPLETED',conclusion:'FAILURE',detailsUrl:'https://github.com/fixture/project/actions/runs/55/job/101'},
 {name:'coverage',status:'COMPLETED',conclusion:'FAILURE',detailsUrl:'https://codecov.io/fixture/project/commit/abc'},
 {name:'retention',status:'COMPLETED',conclusion:'FAILURE',detailsUrl:'https://github.com/fixture/project/actions/runs/55/job/103'},
]}={}){
 await page.route('**/api/**',route=>route.fulfill({status:404,json:{error:{message:'Unconfigured fixture request'}}}));
 await page.route('**/api/bootstrap',route=>route.fulfill({json:{csrfToken:'fixture'}}));
 await page.route('**/api/shell-settings',route=>route.fulfill({json:{theme:'dark',flags:{'workspace.ciFixV1':flag}}}));
 await page.route('**/api/projects/project-one/git?*',route=>route.fulfill({json:{head:'a'.repeat(40),revision:'c'.repeat(64),branch:'gen/review',mode:'managed',gitWrite:true,files:[],diff:'',stagedDiff:'',truncated:false}}));
 await page.route('**/api/projects/project-one/pull-requests?*',route=>route.fulfill({json:{repo:'fixture/project',items:[{number:12,title:'PR 12',url:'https://github.com/fixture/project/pull/12',state:'OPEN'}]}}));
 await page.route('**/api/projects/project-one/pull-requests/12?*',route=>route.fulfill({json:{item:{number:12,title:'PR 12',headRefOid:'b'.repeat(40),state:'OPEN',files:[],statusCheckRollup:checks},head:'a'.repeat(40),revision:'c'.repeat(64),canReview:true}}));
 await page.goto('/shared-panels-check?project=1&pr-panels=pull-request');
 const region=page.getByRole('region',{name:'first PR panel'});
 await region.getByRole('button',{name:'#12 PR 12',exact:true}).click();
 return region;
}

test('failed Actions row toggles the log region; external check links out; loads once',async({page})=>{
 let calls=0;
 const region=await panel(page);
 await page.route('**/api/projects/project-one/pull-requests/12/failures?*',route=>{calls+=1;return route.fulfill({json:report([job('101','lint'),job('103','retention',{logState:'unavailable',excerpt:'',excerptLines:0,errorLines:[]})])});});
 const rows=region.locator('.pr-check-list li');
 await expect(rows).toHaveCount(4);
 const lintToggle=region.getByRole('button',{name:/log for lint/});
 await expect(lintToggle).toBeVisible();
 await expect(lintToggle).toHaveAttribute('aria-expanded','false');
 await expect(region.getByRole('link',{name:'Open on GitHub',exact:true})).toHaveAttribute('href','https://codecov.io/fixture/project/commit/abc');
 await lintToggle.click();
 await expect(lintToggle).toHaveAttribute('aria-expanded','true');
 const log=region.locator('.pr-check-log');
 await expect(log).toContainText('Step: Run tests');
 const body=log.locator('.pr-check-log-body');
 await expect(body).toContainText('AssertionError: expected 1 to equal 2');
 await expect(body.locator('mark.pr-check-log-error')).toHaveText('AssertionError: expected 1 to equal 2');
 await expect(body.locator('.pr-check-log-group')).toHaveText('▸ Build');
 await lintToggle.click();
 await expect(lintToggle).toHaveAttribute('aria-expanded','false');
 // Second row expansion reuses the same loaded report; the region shows its state.
 await region.getByRole('button',{name:'Show log for retention'}).click();
 await expect(region.locator('.pr-check-log-note')).toContainText('GitHub no longer has this log.');
 expect(calls).toBe(1);
});

test('copy writes the excerpt to the clipboard',async({page,context})=>{
 await context.grantPermissions(['clipboard-read','clipboard-write']);
 const region=await panel(page);
 await page.route('**/api/projects/project-one/pull-requests/12/failures?*',route=>route.fulfill({json:report([job('101','lint')])}));
 await region.getByRole('button',{name:/log for lint/}).click();
 await region.getByRole('button',{name:'Copy',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>navigator.clipboard.readText())).toBe('▸ Build\nsome output 101\nAssertionError: expected 1 to equal 2\nmore context');
});

test('keyboard toggles the disclosure and flips aria-expanded',async({page})=>{
 const region=await panel(page);
 await page.route('**/api/projects/project-one/pull-requests/12/failures?*',route=>route.fulfill({json:report([job('101','lint')])}));
 const toggle=region.getByRole('button',{name:/log for lint/});
 await toggle.focus();
 await page.keyboard.press('Enter');
 await expect(toggle).toHaveAttribute('aria-expanded','true');
 await page.keyboard.press('Space');
 await expect(toggle).toHaveAttribute('aria-expanded','false');
});

test('flag off renders no toggle and no GitHub link',async({page})=>{
 const region=await panel(page,{flag:false});
 await expect(region.locator('.pr-check-log-toggle')).toHaveCount(0);
 await expect(region.locator('.pr-check-github')).toHaveCount(0);
});
