import {test,expect} from '@playwright/test';
import {taskFixture,serveTaskFixture} from './task-interface-fixture';
const spec={root:'text',elements:{text:{type:'Text',props:{text:'Checkout review'}}}};

test('a completed resume clears the interrupted banner and never repeats the last message',async({page})=>{
 const snapshot=taskFixture(spec);snapshot.threads[0].status='interrupted';
 const host=await serveTaskFixture(page,snapshot);
 await page.goto('/');
 const strip=page.locator('.resume-strip');
 await expect(strip).toContainText('This session was interrupted.',{timeout:15000});
 const resume=strip.getByRole('button',{name:'Resume',exact:true});
 await expect(resume).toBeEnabled();
 await resume.click();
 await expect.poll(()=>host.commands.filter(command=>command.type==='run.resume')).toHaveLength(1);
 // The host resumes the thread and replays its last frame with a fresh id.
 snapshot.threads[0].status='ready';
 snapshot.messages.push({id:'reply-replay',threadId:'task-thread',role:'assistant',content:'Synthetic local source data for the reusable renderer.',runId:null,createdAt:snapshot.messages[snapshot.messages.length-1]!.createdAt});
 await host.publish();
 await expect(strip).toHaveCount(0);
 await expect(page.getByText('Synthetic local source data for the reusable renderer.',{exact:true})).toHaveCount(1);
});

test('a failed resume restores the control and reports a toast with retry',async({page})=>{
 const snapshot=taskFixture(spec);snapshot.threads[0].status='interrupted';
 const host=await serveTaskFixture(page,snapshot);
 await page.route('**/api/commands',route=>{
  const command=route.request().postDataJSON() as Parameters<typeof host.commands.push>[0];
  if(command.type==='run.resume'){host.commands.push(command);return route.fulfill({status:500,json:{error:{code:'FAILED',message:'Synthetic resume failure'}}});}
  return route.fallback();
 });
 await page.goto('/');
 const strip=page.locator('.resume-strip');
 const resume=strip.getByRole('button',{name:'Resume',exact:true});
 await expect(resume).toBeVisible({timeout:15000});
 await resume.click();
 const notice=page.getByRole('alert').filter({hasText:"Couldn't resume — try again"});
 await expect(notice).toBeVisible();
 await expect(strip.getByRole('button',{name:'Resume',exact:true})).toBeEnabled();
 await notice.getByRole('button',{name:'Retry',exact:true}).click();
 await expect.poll(()=>host.commands.filter(command=>command.type==='run.resume').length).toBe(2);
});
