import {test,expect,type Page,type Route} from '@playwright/test';
import {taskFixture,serveTaskFixture,serveTaskSplitLayout} from './task-interface-fixture.ts';

const p={id:'project-a',name:'Alpha',authority:{kind:'local'},rootPath:'C:/Synthetic/Alpha',createdAt:'2026-01-01T00:00:00.000Z'};

async function host(page:Page){
  const s=taskFixture({root:'text',elements:{text:{type:'Text',props:{text:'Synthetic project flow'}}}});
  s.artifacts=[];s.data=[];s.messages=[];s.userStates=[];
  const h=await serveTaskFixture(page,s);
  await serveTaskSplitLayout(page);
  const workspace={state:{version:1,revision:1,activeCanvasId:'main',canvases:[{id:'main',version:1,name:'Workspace',preset:'workspace',viewport:{x:0,y:0,zoom:1},panels:[],filter:'all',projectIds:[]}],disabledKinds:[],integrations:{},profiles:[]},projects:[p]};
  await page.route('**/api/workspace',(r:Route)=>r.fulfill({json:workspace}));
  await page.route('**/api/workspace/commands',(r:Route)=>{
    const c=r.request().postDataJSON();h.commands.push(c);
    if(c.type==='workspace.project.connect')return r.fulfill({status:500,json:{error:{code:'UNAVAILABLE',message:'The selected path is unavailable'}}});
    return r.fulfill({json:{result:workspace}});
  });
  await page.route('**/api/commands',async(r:Route)=>{const c=r.request().postDataJSON();h.commands.push(c);s.seq++;return r.fulfill({json:{commandId:c.id,seq:s.seq,result:{}}});});
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
  await expect(folder).toHaveAttribute('aria-invalid','false');
  await expect(dialog.locator('#connect-project-path-error')).toHaveCount(0);
  await folder.fill('/synthetic/gamma-fixed');
  await expect(alert).toHaveText('Connect a project before starting this thread.');
});
