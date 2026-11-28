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

// #1326 T07 — Fix sheet + send (DESIGN 4, 7.3–7.4).
const fixReport=()=>report([job('101','lint'),job('103','retention',{logState:'unavailable',excerpt:'',excerptLines:0,errorLines:[]})]);
const twoJobs=async(page:import('@playwright/test').Page,options?:Parameters<typeof panel>[1])=>{
 const region=await panel(page,options);
 await page.route('**/api/projects/project-one/pull-requests/12/failures?*',route=>route.fulfill({json:fixReport()}));
 return region;
};

test('fix launcher only with a failed check and a thread',async({page})=>{
 // All green -> nothing.
 const green=await twoJobs(page,{checks:[{name:'build',status:'COMPLETED',conclusion:'SUCCESS'}]});
 await expect(green.getByRole('button',{name:'Fix with agent'})).toHaveCount(0);
 await expect(green.getByText('Open this panel from a thread to send failures to its agent.')).toHaveCount(0);
 // Failed check + thread -> launcher.
 const region=await twoJobs(page);
 await expect(region.getByRole('button',{name:'Fix with agent'})).toBeVisible();
 // Failed check, no thread -> note instead of the button.
 await page.goto('/shared-panels-check?project=1&pr-panels=pull-request&nothread=1');
 const bare=page.getByRole('region',{name:'first PR panel'});
 await bare.getByRole('button',{name:'#12 PR 12',exact:true}).click();
 await expect(bare.getByRole('button',{name:'Fix with agent'})).toHaveCount(0);
 await expect(bare.getByText('Open this panel from a thread to send failures to its agent.')).toBeVisible();
});

test('sheet defaults: ready jobs checked, disabled rows carry the reason, stale note shown',async({page})=>{
 const region=await twoJobs(page);
 await region.getByRole('button',{name:'Fix with agent'}).click();
 const sheet=region.locator('.pr-fix-sheet');
 await expect(sheet).toBeVisible();
 await expect(sheet.getByText('Send failing checks to the agent')).toBeVisible();
 const lint=sheet.getByRole('checkbox',{name:/CI · lint/});
 await expect(lint).toBeChecked();
 const retention=sheet.getByRole('checkbox',{name:/CI · retention/});
 await expect(retention).not.toBeChecked();
 await expect(retention).toBeDisabled();
 await expect(sheet).toContainText('GitHub no longer has this log.');
 const instruction=sheet.getByRole('textbox',{name:'Instruction'});
 await expect(instruction).toHaveValue(/Fix the failing CI on PR #12: lint\./);
 // Report head (b) differs from local head (a) -> stale note.
 await expect(sheet).toContainText('Your local copy is on a different version, so your files may not match what was checked.');
 // Cancel restores the launcher state.
 await sheet.getByRole('button',{name:'Cancel'}).click();
 await expect(sheet).toHaveCount(0);
});

test('Ctrl+Enter sends one message.send command with checked jobIds and the instruction',async({page})=>{
 const sent:{type?:string;threadId?:string;payload?:Record<string,unknown>}[]=[];
 const region=await twoJobs(page);
 await page.route('**/api/commands',route=>{
  if(route.request().method()==='POST'){sent.push(route.request().postDataJSON());return route.fulfill({json:{commandId:'c1',result:{ok:true},eventSeq:1}});}
  return route.fallback();
 });
 await region.getByRole('button',{name:'Fix with agent'}).click();
 const instruction=region.locator('.pr-fix-sheet').getByRole('textbox',{name:'Instruction'});
 await instruction.press('Control+Enter');
 await expect.poll(()=>sent.length).toBe(1);
 expect(sent[0].type).toBe('message.send');
 expect(sent[0].threadId).toBe('task-thread');
 expect(sent[0].payload?.content).toBe('Fix the failing CI on PR #12: lint. Use the attached logs. Find the cause, make the smallest fix in this working copy, run the relevant checks locally, and tell me what you changed. Don\'t push unless I ask.');
 expect(sent[0].payload?.ciFailure).toEqual({reportId:'r'.repeat(64),jobIds:['101']});
 await expect(region.locator('.pr-fix-sheet')).toHaveCount(0);
 await expect(region.getByText('Sent to the thread.')).toBeVisible();
});

test('Escape cancels and returns focus to the launcher',async({page})=>{
 const region=await twoJobs(page);
 const launcher=region.getByRole('button',{name:'Fix with agent'});
 await launcher.click();
 await region.locator('.pr-fix-sheet').getByRole('textbox',{name:'Instruction'}).press('Escape');
 await expect(region.locator('.pr-fix-sheet')).toHaveCount(0);
 await expect(launcher).toBeFocused();
});

test('expired report keeps the draft and offers Refresh',async({page})=>{
 let refreshes=0;
 const region=await twoJobs(page);
 await page.route('**/api/commands',route=>route.fulfill({status:400,json:{error:{code:'CI_REPORT_EXPIRED',message:'The saved failure report expired.'}}}));
 await page.route('**/api/projects/project-one/pull-requests/12/failures?*refresh=1*',route=>{refreshes+=1;return route.fulfill({json:{...fixReport(),id:'s'.repeat(64)}});});
 await region.getByRole('button',{name:'Fix with agent'}).click();
 const sheet=region.locator('.pr-fix-sheet');
 await sheet.getByRole('button',{name:'Send to agent'}).click();
 await expect(sheet.getByText('These logs expired. Refresh and send again.')).toBeVisible();
 // Draft retained.
 await expect(sheet.getByRole('textbox',{name:'Instruction'})).toHaveValue(/Fix the failing CI on PR #12/);
 await sheet.getByRole('button',{name:'Refresh'}).click();
 await expect.poll(()=>refreshes).toBe(1);
 await expect(sheet.getByText('These logs expired.')).toHaveCount(0);
});

// #1326 T08 — thread chip + expansion (DESIGN 7.5).
test('stored failure chip shows, expands to excerpts, survives reload; other messages unchanged',async({page})=>{
 await page.route('**/api/**',route=>route.fulfill({status:404,json:{error:{message:'Unconfigured fixture request'}}}));
 await page.route('**/api/bootstrap',route=>route.fulfill({json:{csrfToken:'fixture'}}));
 await page.goto('/shared-panels-check?chip=1');
 const chip=page.getByRole('button',{name:'Failing CI · 2 jobs'});
 await expect(chip).toBeVisible();
 await expect(chip).toHaveAttribute('aria-expanded','false');
 // Excerpt collapsed by default.
 await expect(page.locator('.pr-check-log')).toHaveCount(0);
 await chip.click();
 await expect(chip).toHaveAttribute('aria-expanded','true');
 const logs=page.locator('.pr-check-log');
 await expect(logs).toHaveCount(2);
 await expect(logs.first()).toContainText('CI · lint · Run tests');
 await expect(logs.first().locator('mark.pr-check-log-error')).toHaveText('AssertionError: expected 1 to equal 2');
 await expect(logs.nth(1)).toContainText('CI · retention · Deploy');
 // Ordinary message carries no chip.
 await expect(page.locator('.message').nth(1).getByRole('button',{name:/Failing CI/})).toHaveCount(0);
 // Data is on the stored message — reload keeps the chip.
 await page.reload();
 const again=page.getByRole('button',{name:'Failing CI · 2 jobs'});
 await expect(again).toBeVisible();
 await again.click();
 await expect(page.locator('.pr-check-log')).toHaveCount(2);
});
