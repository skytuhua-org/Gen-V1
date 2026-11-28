import {test,expect,type Page,type Route} from '@playwright/test';
import {projectContext} from '../../scripts/capture-ui/browser-data';
import {taskFixture,serveTaskFixture,serveTaskSplitLayout} from './task-interface-fixture.ts';

const p={id:'project-a',name:'Alpha',authority:{kind:'local'},rootPath:'C:/Synthetic/Alpha',createdAt:'2026-01-01T00:00:00.000Z'};

const connected={...p,id:'project-connected',name:'New local project',rootPath:'/canonical/new-local'};
type ConnectionFixture={mode:'empty'|'unprojected'|'bound';hold?:Promise<void>};

async function host(page:Page,fixture?:ConnectionFixture){
  const s=taskFixture({root:'text',elements:{text:{type:'Text',props:{text:'Synthetic project flow'}}}});
  s.artifacts=[];s.data=[];s.messages=[];s.userStates=[];
  const initial={...s.threads[0],sessionPath:null};
  if(fixture?.mode==='empty'){s.threads=[];s.activeThreadId=null;}
  else if(fixture?.mode==='bound')s.threads=[{...initial,projectId:p.id,projectName:p.name}];
  else if(fixture?.mode==='unprojected')s.threads=[{...initial,projectName:null}];
  const h=await serveTaskFixture(page,s);
  await serveTaskSplitLayout(page,fixture?s:undefined);
  const workspace={state:{version:1,revision:1,activeCanvasId:'main',canvases:[{id:'main',version:1,name:'Workspace',preset:'workspace',viewport:{x:0,y:0,zoom:1},panels:[],filter:'all',projectIds:[]}],disabledKinds:[],integrations:{},profiles:[]},projects:[p]};
  await page.route('**/api/workspace',(r:Route)=>r.fulfill({json:workspace}));
  await page.route('**/api/workspace/commands',async(r:Route)=>{
    const c=r.request().postDataJSON();h.commands.push(c);
    if(c.type!=='workspace.project.connect')return r.fulfill({json:{result:workspace}});
    if(!fixture)return r.fulfill({status:500,json:{error:{code:'UNAVAILABLE',message:'The selected path is unavailable'}}});
    await fixture.hold;
    if(!workspace.projects.some(project=>project.id===connected.id))workspace.projects.push(connected);
    workspace.state.revision++;s.seq++;
    const owner=s.threads.find(thread=>thread.id===c.payload.threadId);
    if(owner){owner.projectId=connected.id;owner.projectName=connected.name;}
    await r.fulfill({json:{result:{...workspace,connectedProjectId:connected.id}}});
    if(owner)await h.publish();
  });
  await page.route(/\/api\/projects\/[^/]+\/context(?:\?|$)/,r=>{
    const url=new URL(r.request().url()),threadId=url.searchParams.get('threadId'),project=workspace.projects.find(item=>url.pathname.split('/')[3]===item.id);
    return r.fulfill(project?{json:{...projectContext,project,threadId,workingCopy:null}}:{status:404,json:{error:{code:'NOT_FOUND'}}});
  });
  await page.route('**/api/commands',async(r:Route)=>{
    const c=r.request().postDataJSON();h.commands.push(c);s.seq++;
    if(c.type==='thread.create'){
      const project=workspace.projects.find(item=>item.id===c.payload.projectId);
      const thread={...initial,id:'created-thread-'+s.seq,title:'New thread',projectId:project?.id,projectName:project?.name??null};
      s.threads.push(thread);s.activeThreadId=thread.id;
      return r.fulfill({json:{commandId:c.id,seq:s.seq,result:thread}});
    }
    return r.fulfill({json:{commandId:c.id,seq:s.seq,result:{}}});
  });
  await page.goto('/');await expect(page.getByRole('textbox',{name:'Message',exact:true})).toBeVisible({timeout:15000});
  return h;
}

async function openDialog(page:Page){
  await page.getByRole('button',{name:'Expand Project overview',exact:true}).click();
  await page.locator('.project-context-card').getByRole('button',{name:'Connect project',exact:true}).click();
  return page.getByRole('dialog',{name:'Connect project',exact:true});
}

test('Connect project opens from Project overview with POSIX placeholder and name hint',async({page})=>{
  await host(page);
  const dialog=await openDialog(page);
  await expect(dialog).toBeVisible();
  const folder=dialog.getByLabel('Local folder',{exact:true});
  await expect(folder).toHaveAttribute('placeholder','/Users/you/Projects/my-project');
  const name=dialog.getByLabel('Project name',{exact:true});
  await expect(name).toHaveAttribute('aria-describedby','connect-project-name-hint');
  await expect(dialog.locator('#connect-project-name-hint')).toHaveText('Shown in the project picker · up to 100 characters');
});

test('Connect project focuses and selects the retained name on reopen',async({page})=>{
 await host(page);
 const opener=page.getByRole('complementary',{name:'Thread navigation'}).getByRole('button',{name:'Connect project',exact:true});
 await opener.click();
 const dialog=page.getByRole('dialog',{name:'Connect project',exact:true});
 const name=dialog.getByLabel('Project name',{exact:true});
 await expect(name).toHaveAttribute('placeholder','My project');
 await expect(name).toBeFocused();
 expect(await name.evaluate((input:HTMLInputElement)=>input.selectionStart)).toBe(0);
 await page.keyboard.type('Draft project name');
 await page.keyboard.press('Escape');
 await expect(opener).toBeFocused();
 await opener.press('Enter');
 await expect(name).toBeFocused();
 expect(await name.evaluate((input:HTMLInputElement)=>[input.selectionStart,input.selectionEnd])).toEqual([0,'Draft project name'.length]);
 await page.keyboard.type('Replacement');
 await expect(name).toHaveValue('Replacement');
 await page.keyboard.press('Tab');
 await expect(dialog.getByLabel('Local folder',{exact:true})).toBeFocused();
});

test('Connect project name field caps input at 100 characters',async({page})=>{
  await host(page);
  const dialog=await openDialog(page);
  const name=dialog.getByLabel('Project name',{exact:true});
  await name.fill('x'.repeat(120));
  await expect(name).toHaveValue('x'.repeat(100));
});

test('Connect project failure reports the folder error with aria-invalid',async({page})=>{
  const h=await host(page);
  const dialog=await openDialog(page);
  const name=dialog.getByLabel('Project name',{exact:true});
  const folder=dialog.getByLabel('Local folder',{exact:true});
  await name.fill('Gamma');await folder.fill('/synthetic/gamma');
  await dialog.getByRole('button',{name:'Connect project',exact:true}).click();
  const error=dialog.locator('#connect-project-path-error');
  await expect(error).toHaveText('Couldn\'t connect that folder: The selected path is unavailable');
  await expect(folder).toHaveAttribute('aria-invalid','true');
  await expect(folder).toBeFocused();
  await expect(folder).toHaveAttribute('aria-describedby','connect-project-path-error');
  expect(h.commands.filter(c=>c.type==='workspace.project.connect')).toHaveLength(1);
  await folder.fill('/synthetic/gamma-fixed');
  await expect(error).toHaveCount(0);
  await expect(folder).toHaveAttribute('aria-invalid','false');
});

test('Connect project conversation-level failure stays form-level and off the folder field',async({page})=>{
  await host(page);
  await page.unroute('**/api/workspace/commands');
  await page.route('**/api/workspace/commands',(r:Route)=>{
    const c=r.request().postDataJSON();
    if(c.type==='workspace.project.connect')return r.fulfill({status:409,json:{error:{code:'PROJECT_BUSY',message:'Connect a project before starting this thread.'}}});
    return r.fulfill({json:{result:{state:{version:1,revision:2,activeCanvasId:'main',canvases:[],disabledKinds:[],integrations:{},profiles:[]},projects:[]}}});
  });
  const dialog=await openDialog(page);
  const name=dialog.getByLabel('Project name',{exact:true});
  const folder=dialog.getByLabel('Local folder',{exact:true});
  await name.fill('Gamma');await folder.fill('/synthetic/gamma');
  await dialog.getByRole('button',{name:'Connect project',exact:true}).click();
  const alert=dialog.getByRole('alert');
  await expect(alert).toHaveText('Connect a project before starting this thread.');
  await expect(name).toBeFocused();
  await expect(folder).toHaveAttribute('aria-invalid','false');
  await expect(dialog.locator('#connect-project-path-error')).toHaveCount(0);
  await folder.fill('/synthetic/gamma-fixed');
  await expect(alert).toHaveText('Connect a project before starting this thread.');
});


async function enterProject(dialog:ReturnType<Page['getByRole']>){
  await dialog.getByLabel('Project name',{exact:true}).fill(connected.name);
  await dialog.getByLabel('Local folder',{exact:true}).fill('/local/新 project');
}

for(const [width,motion] of [[1280,'reduce'],[420,'off']] as const)test(`Connect project creates the empty owner and restores composer focus at ${width}`,async({page})=>{
  await page.setViewportSize({width,height:800});
  if(motion==='reduce')await page.emulateMedia({reducedMotion:'reduce'});
  let finish!:()=>void;
  const hold=new Promise<void>(resolve=>{finish=resolve;});
  const h=await host(page,{mode:'empty',hold});
  if(motion==='off')await page.evaluate(()=>{document.documentElement.dataset.motion='off';});
  const dialog=await openDialog(page);
  await enterProject(dialog);
  await dialog.getByLabel('Local folder',{exact:true}).press('Enter');
  await expect(dialog.locator('form')).toHaveAttribute('aria-busy','true');
  await expect(dialog.getByRole('button',{name:'Connecting…'})).toBeDisabled();
  await expect(dialog.getByRole('button',{name:'Cancel'})).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Tab');
  expect(await dialog.evaluate(element=>element.contains(document.activeElement))).toBe(true);
  finish();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Select project',exact:true})).toHaveText(connected.name);
  await expect(page.getByRole('textbox',{name:'Message',exact:true})).toBeFocused();
  const overview=page.getByRole('button',{name:'Expand Project overview',exact:true});
  if(await overview.count())await overview.click();
  await expect(page.locator('.project-context-card')).toContainText(connected.name);
  expect(h.commands.filter(command=>command.type==='workspace.project.connect')).toHaveLength(1);
  expect(h.commands.find(command=>command.type==='thread.create')?.payload).toMatchObject({projectId:connected.id});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('Connect project from the picker continues its empty draft into the new project',async({page})=>{
  const h=await host(page,{mode:'empty'});
  const message=page.getByRole('textbox',{name:'Message',exact:true});
  await message.fill('My unsubmitted draft');
  await page.getByRole('button',{name:'Select project',exact:true}).click();
  await page.getByRole('dialog',{name:'Select project',exact:true}).getByRole('button',{name:'Add project'}).click();
  const connect=page.getByRole('dialog',{name:'Connect project',exact:true});
  await enterProject(connect);
  await connect.getByRole('button',{name:'Connect project',exact:true}).click();
  await expect(connect).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Select project',exact:true})).toHaveText(connected.name);
  await expect(message).toHaveValue('My unsubmitted draft');
  await expect(message).toBeFocused();
  expect(await message.evaluate((element:HTMLTextAreaElement)=>element.selectionStart)).toBe('My unsubmitted draft'.length);
  expect(h.commands.filter(command=>command.type==='thread.create')).toHaveLength(1);
  expect(h.commands.filter(command=>command.type==='message.send')).toHaveLength(0);
});

test('Connect project attaches the overview owner without creating a second conversation',async({page})=>{
  const h=await host(page,{mode:'unprojected'});
  const message=page.getByRole('textbox',{name:'Message',exact:true});
  await message.fill('Keep this draft');
  const dialog=await openDialog(page);
  await enterProject(dialog);
  await dialog.getByRole('button',{name:'Connect project',exact:true}).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Select project',exact:true})).toHaveText(connected.name);
  await expect(message).toHaveValue('Keep this draft');
  await expect(message).toBeFocused();
  expect(h.commands.find(command=>command.type==='workspace.project.connect')?.payload.threadId).toBe('task-thread');
  expect(h.commands.filter(command=>command.type==='thread.create')).toHaveLength(0);
});

test('global Connect project keeps an already bound owner and offers the new project',async({page})=>{
  const h=await host(page,{mode:'bound'});
  await page.getByRole('complementary',{name:'Thread navigation'}).getByRole('button',{name:'Connect project',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'Connect project',exact:true});
  await enterProject(dialog);
  await dialog.getByRole('button',{name:'Connect project',exact:true}).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('.composer').getByRole('button',{name:'Select project',exact:true})).toHaveText(p.name);
  const notice=page.getByRole('region',{name:'Notifications'}).getByRole('status');
  await expect(notice).toContainText('Project connected');
  const select=notice.getByRole('button',{name:'Select project',exact:true});
  await expect(select).toBeFocused();
  await select.press('Enter');
  await expect(page.getByRole('option',{name:connected.name,exact:true})).toHaveAttribute('data-active','true');
  expect(h.commands.filter(command=>command.type==='thread.create')).toHaveLength(0);
});
