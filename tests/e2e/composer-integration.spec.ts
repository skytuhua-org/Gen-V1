import {test,expect} from '@playwright/test';
import {taskFixture,serveTaskFixture} from './task-interface-fixture';
const spec={root:'text',elements:{text:{type:'Text',props:{text:'Checkout review'}}}};
test('Resume explicitly resets a saved nondefault effort when Default is chosen',async({page})=>{const snapshot=taskFixture(spec);snapshot.threads[0].status='stopped';snapshot.threads[0].thinkingLevel='high';const host=await serveTaskFixture(page,snapshot);await page.route('**/api/models*',route=>route.fulfill({json:{models:[{id:'test/model',name:'Fixture',provider:'test',thinkingLevels:['low','high']}]}}));await page.goto('/');const trigger=page.getByRole('combobox',{name:'Model',exact:true});await expect(trigger).toContainText('High',{timeout:15000});await trigger.click();const picker=page.getByRole('dialog',{name:'Model and reasoning',exact:true});await expect(picker.getByRole('radio',{name:'High',exact:true})).toHaveAttribute('aria-checked','true');await picker.getByRole('radio',{name:'Default',exact:true}).click();await trigger.click();await page.getByRole('button',{name:'Resume',exact:true}).click();await expect.poll(()=>host.commands.find(command=>command.type==='run.resume')?.payload).toMatchObject({thinkingLevel:null});});
test('Resume uses the visible effort choice for a stopped task',async({page})=>{const snapshot=taskFixture(spec);snapshot.threads[0].status='stopped';snapshot.threads[0].thinkingLevel='low';const host=await serveTaskFixture(page,snapshot);await page.route('**/api/models*',route=>route.fulfill({json:{models:[{id:'test/model',name:'Fixture',provider:'test',thinkingLevels:['low','high']}]}}));await page.goto('/');const trigger=page.getByRole('combobox',{name:'Model',exact:true});await expect(trigger).toContainText('Low');await trigger.click();const picker=page.getByRole('dialog',{name:'Model and reasoning',exact:true});await expect(picker.getByRole('radio',{name:'Low',exact:true})).toHaveAttribute('aria-checked','true');await picker.getByRole('radio',{name:'High',exact:true}).click();await trigger.click();await page.getByRole('button',{name:'Resume',exact:true}).click();await expect.poll(()=>host.commands.find(command=>command.type==='run.resume')?.payload).toMatchObject({thinkingLevel:'high',modelId:'test/model'});});
test('a RESUME_REQUIRED send failure offers Resume in the error banner and recovers the thread',async({page})=>{
 const snapshot=taskFixture(spec);snapshot.threads[0].status='stopped';
 const host=await serveTaskFixture(page,snapshot);
 await page.route('**/api/models*',route=>route.fulfill({json:{models:[{id:'test/model',name:'Fixture',provider:'test',thinkingLevels:['low','high']}]}}));
 await page.route('**/api/commands',async route=>{
  const command=route.request().postDataJSON() as {type:string};
  if(command.type==='message.send')return route.fulfill({status:409,json:{error:{code:'RESUME_REQUIRED',message:'Resume this thread before sending more work'}}});
  if(command.type==='run.resume'){snapshot.threads[0].status='working';snapshot.threads[0].runId='resumed-run';}
  return route.fallback();
 });
 await page.goto('/');
 await page.getByRole('textbox',{name:'Message',exact:true}).fill('Continue the repair');
 await page.getByRole('button',{name:'Send message',exact:true}).click();
 const banner=page.locator('.composer-error',{hasText:'Resume this thread before sending more work'});
 await expect(banner).toBeVisible();
 await banner.getByRole('button',{name:'Resume thread',exact:true}).click();
 await expect.poll(()=>host.commands.some(command=>command.type==='run.resume')).toBe(true);
 await expect(banner).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Resume',exact:true})).toHaveCount(0);
 await expect(page.getByText('Working…',{exact:true})).toBeVisible();
});
test('the resume strip stays reachable above the composer while reading earlier messages',async({page})=>{
 const snapshot=taskFixture(spec);snapshot.threads[0].status='stopped';
 for(let index=0;index<80;index++)snapshot.messages.push({id:`history-${index}`,threadId:'task-thread',role:index%2?'assistant':'user',content:`Earlier exchange ${index}.`,runId:null,createdAt:new Date(Date.UTC(2026,9,29,23,0,index)).toISOString()});
 await serveTaskFixture(page,snapshot);
 await page.route('**/api/models*',route=>route.fulfill({json:{models:[{id:'test/model',name:'Fixture',provider:'test',thinkingLevels:['low','high']}]}}));
 await page.goto('/');
 const resume=page.getByRole('button',{name:'Resume',exact:true});
 await expect(resume).toBeVisible();
 await page.getByLabel('Conversation',{exact:true}).evaluate(node=>{node.scrollTop=0;});
 await expect(resume).toBeInViewport();
});
test('integrated composer preserves a PR draft and displays only recorded diff counts',async({page})=>{
 const snapshot=taskFixture(spec);snapshot.data.push({id:'diff',threadId:'task-thread',revision:1,createdAt:new Date().toISOString(),provenance:'resource fixture; git diff; exact source',value:{stdout:'diff --git a/a b/a\n--- a/a\n+++ b/a\n@@ -1 +1,2 @@\n-old\n+new\n+next\n'}});
 const host=await serveTaskFixture(page,snapshot);await page.goto('/');const draft=page.getByRole('textbox',{name:'Message',exact:true});await draft.fill('Keep my context');
 await expect(page.getByRole('button',{name:'Inspect changes',exact:true})).toContainText('+2');await page.getByRole('button',{name:'Create PR',exact:true}).click();await expect(draft).toHaveValue('Create a pull request for the current changes.\n\nKeep my context');expect(host.commands.filter(command=>command.type==='message.send')).toHaveLength(0);
 await page.reload();await expect(draft).toHaveValue('Create a pull request for the current changes.\n\nKeep my context');await page.getByRole('button',{name:'Inspect changes',exact:true}).click();await expect(page.getByRole('tab',{name:'Diff',exact:true})).toHaveAttribute('aria-selected','true');
});
test('integrated voice appends to the latest draft and thinking selection reaches the message command',async({page})=>{
 await page.addInitScript(()=>{class Recognition{onstart:(()=>void)|null=null;onend:(()=>void)|null=null;onresult:((event:unknown)=>void)|null=null;constructor(){Object.assign(window,{testRecognition:this});}start(){this.onstart?.();}stop(){this.onend?.();}abort(){this.onend?.();}}Object.assign(window,{SpeechRecognition:Recognition});});
 const host=await serveTaskFixture(page,taskFixture(spec));await page.route('**/api/models*',route=>route.fulfill({json:{models:[{id:'test/model',name:'Fixture',provider:'test',thinkingLevels:['low','high']}]}}));await page.goto('/');
 const draft=page.getByRole('textbox',{name:'Message',exact:true});await draft.fill('Original');await page.getByRole('button',{name:'Start voice input',exact:true}).click();await draft.fill('Newer draft');await page.evaluate(()=>(window as unknown as {testRecognition:{onresult:(event:unknown)=>void}}).testRecognition.onresult({resultIndex:0,results:[{isFinal:true,length:1,0:{transcript:'with dictated text'}}]}));await expect(draft).toHaveValue('Newer draft with dictated text');expect(host.commands.some(command=>command.type==='message.send')).toBe(false);
 await page.getByRole('combobox',{name:'Model',exact:true}).click();await page.getByRole('dialog',{name:'Model and reasoning',exact:true}).getByRole('radio',{name:'High',exact:true}).click();await page.getByRole('combobox',{name:'Model',exact:true}).click();await page.reload();await expect(page.locator('.model-picker-trigger-effort')).toHaveText('High');await page.getByRole('button',{name:'Send message',exact:true}).click();await expect.poll(()=>host.commands.find(command=>command.type==='message.send')?.payload).toMatchObject({content:'Newer draft with dictated text',thinkingLevel:'high',modelId:'test/model'});
});
test('fresh assistant messages reveal, while restored history and unchanged snapshots remain quiet',async({page})=>{
 await page.addInitScript(()=>{const animate=Element.prototype.animate;Object.assign(window,{sentenceStarts:0});Element.prototype.animate=function(...args){if((this as HTMLElement).dataset.revealStart!==undefined)(window as unknown as {sentenceStarts:number}).sentenceStarts++;return animate.apply(this,args);};});
 const snapshot=taskFixture(spec),host=await serveTaskFixture(page,snapshot);await page.goto('/');await expect(page.getByText(snapshot.messages[0].content,{exact:true})).toBeVisible();expect(await page.evaluate(()=>(window as unknown as {sentenceStarts:number}).sentenceStarts)).toBe(0);
 snapshot.messages.push({id:'new-answer',threadId:'task-thread',runId:null,role:'assistant',content:'The checkout failure comes from the quantity calculation. The public API can stay unchanged.',createdAt:new Date().toISOString()});await host.publish();await expect(page.getByText(snapshot.messages[1].content,{exact:true})).toBeVisible();await expect.poll(()=>page.evaluate(()=>(window as unknown as {sentenceStarts:number}).sentenceStarts)).toBeGreaterThan(0);const count=await page.evaluate(()=>(window as unknown as {sentenceStarts:number}).sentenceStarts);await host.publish();expect(await page.evaluate(()=>(window as unknown as {sentenceStarts:number}).sentenceStarts)).toBe(count);await page.reload();await expect(page.getByText(snapshot.messages[1].content,{exact:true})).toBeVisible();expect(await page.evaluate(()=>(window as unknown as {sentenceStarts:number}).sentenceStarts)).toBe(0);
});

test('the composer textarea is focused on a new conversation and on an empty thread',async({page})=>{
 const empty=taskFixture(spec);empty.threads=[];empty.activeThreadId=null;empty.messages=[];empty.artifacts=[];empty.userStates=[];
 await serveTaskFixture(page,empty);
 await page.goto('/');
 await expect(page.getByRole('textbox',{name:'Message',exact:true})).toBeFocused({timeout:15000});
 const blank=taskFixture(spec);blank.messages=[];blank.artifacts=[];blank.userStates=[];
 await serveTaskFixture(page,blank);
 await page.goto('/');
 const draft=page.getByRole('textbox',{name:'Message',exact:true});
 await expect(draft).toBeFocused({timeout:15000});
 await draft.pressSequentially('hello');
 await expect(draft).toHaveValue('hello');
});
test('the composer does not steal focus on a conversation with history',async({page})=>{
 const snapshot=taskFixture(spec);
 await serveTaskFixture(page,snapshot);
 await page.goto('/');
 const draft=page.getByRole('textbox',{name:'Message',exact:true});
 await expect(draft).toBeVisible();
 await page.waitForTimeout(300);
 expect(await page.evaluate(()=>document.activeElement instanceof HTMLElement?document.activeElement.getAttribute('aria-label'):null)).not.toBe('Message');
});

test('an open dialog at mount suppresses composer autofocus',async({page})=>{
 const empty=taskFixture(spec);empty.messages=[];
 await serveTaskFixture(page,empty);
 await page.route(url=>url.pathname==='/'||url.pathname==='/index.html',async route=>{
  const response=await route.fetch();const html=await response.text();
  await route.fulfill({response,body:html.replace('</body>','<div role="dialog" aria-modal="true" id="fixture-modal"></div></body>')});
 });
 await page.goto('/');
 const textarea=page.getByRole('textbox',{name:'Message',exact:true});await textarea.waitFor();
 await expect(textarea).toBeEnabled();
 expect(await page.evaluate(()=>document.activeElement?.tagName)).not.toBe('TEXTAREA');
});

test('successful send consumes only the accepted files and presents them in the sent message after reload',async({page})=>{
 await page.setViewportSize({width:450,height:900});
 await page.emulateMedia({reducedMotion:'reduce'});
 const snapshot=taskFixture(spec);
 const host=await serveTaskFixture(page,snapshot);
 const attemptIds:string[][]=[];
 let nextId=0,reject=true;
 await page.route('**/api/commands',async route=>{
  const cmd=route.request().postDataJSON();
  if(cmd.type==='resource.upload'){
   const grant={id:'attachment-'+ ++nextId,threadId:'task-thread',kind:'attachment' as const,path:'/synthetic/'+cmd.payload.name,label:cmd.payload.name,writable:false,createdAt:new Date().toISOString()};
   snapshot.resources.push(grant);
   await host.publish();
   return route.fulfill({json:{commandId:cmd.id,seq:snapshot.seq,result:grant}});
  }
  if(cmd.type!=='message.send')return route.fallback();
  attemptIds.push(cmd.payload.attachmentIds);
  if(reject){
   reject=false;
   return route.fulfill({status:409,json:{error:{code:'FIXTURE_REJECTED',message:'Fixture declined the send',details:{sendAccepted:false}}}});
  }
  const messageId='accepted-attachment-message';
  const attachments=snapshot.resources.filter(grant=>cmd.payload.attachmentIds.includes(grant.id));
  for(const grant of attachments)grant.draftAttachmentConsumedBy=messageId;
  snapshot.messages.push({id:messageId,threadId:'task-thread',role:'user',content:cmd.payload.content,runId:null,createdAt:new Date().toISOString(),attachments:attachments.map(({id,label,writable})=>({id,label,writable}))});
  await host.publish();
  return route.fulfill({json:{commandId:cmd.id,seq:snapshot.seq,result:{messageId,inputId:cmd.id}}});
 });
 await page.goto('/');
 const composer=page.locator('.composer:visible');
 const names=['review-notes-with-a-long-file-name.txt','fixture-guide-with-a-long-file-name.txt'];
 const [fileChooser]=await Promise.all([
  page.waitForEvent('filechooser'),
  composer.getByRole('button',{name:'Attach files',exact:true}).click(),
 ]);
 await fileChooser.setFiles(names.map((name,index)=>({name,mimeType:'text/plain',buffer:Buffer.from(String(index))})));
 const tray=composer.getByRole('group',{name:'Attachments',exact:true});
 for(const name of names)await expect(tray.getByText(name,{exact:true})).toBeVisible();
 const draft=composer.getByRole('textbox',{name:'Message',exact:true});
 const send=composer.getByRole('button',{name:'Send message',exact:true});
 await draft.fill('Review these two files');
 await send.click();
 await expect(page.locator('.composer-error')).toContainText('Fixture declined the send');
 await expect(tray.getByRole('button')).toHaveCount(2);
 await expect(page.getByRole('list',{name:'2 attachments',exact:true})).toHaveCount(0);
 await send.click();
 await expect(draft).toHaveValue('');
 const history=page.locator('.message-user').filter({hasText:'Review these two files'});
 const sent=history.getByRole('list',{name:'2 attachments',exact:true});
 for(const name of names)await expect(sent.getByRole('link',{name:name+', read only',exact:true})).toBeVisible();
 await expect(tray).toHaveCount(0);
 await expect(sent.getByRole('button')).toHaveCount(0);
 expect(attemptIds).toEqual([['attachment-1','attachment-2'],['attachment-1','attachment-2']]);
 await sent.getByRole('link').first().focus();
 await page.keyboard.press('Tab');
 await expect(sent.getByRole('link').last()).toBeFocused();
 await page.reload();
 await expect(sent.getByRole('link')).toHaveCount(2);
 await expect(tray).toHaveCount(0);
});
