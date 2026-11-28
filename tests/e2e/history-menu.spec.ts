import {test,expect} from '@playwright/test';
import {taskFixture,serveTaskFixture} from './task-interface-fixture';
const spec={root:'text',elements:{text:{type:'Text',props:{text:'Checkout review'}}}};
const overview=(nativeFork:string)=>({enabled:{branch:true,import:true},capabilities:{inspect:'SUPPORTED',quote:'SUPPORTED',nativeFork},captures:[],imports:[]});

test('the History menu omits Fork when the engine can never support it',async({page})=>{
 const snapshot=taskFixture(spec);
 await serveTaskFixture(page,snapshot);
 await page.route('**/api/session-branches/*',route=>route.fulfill({json:overview('UNPROVEN')}));
 await page.goto('/');
 const menu=page.getByRole('button',{name:'History',exact:true});
 await expect(menu).toBeVisible({timeout:15000});
 await menu.click();
 const list=page.getByRole('menu');
 await expect(list.getByRole('menuitem',{name:'Inspect point'})).toBeVisible();
 await expect(list.getByRole('menuitem',{name:/Start new task with quoted context/})).toBeVisible();
 await expect(list.getByRole('menuitem',{name:/Import ArchiveV1 JSON/})).toBeVisible();
 await expect(list.getByRole('menuitem',{name:/Fork conversation/})).toHaveCount(0);
});

test('the History menu shows an enabled Fork when the engine supports it',async({page})=>{
 const snapshot=taskFixture(spec);
 await serveTaskFixture(page,snapshot);
 await page.route('**/api/session-branches/*',route=>route.fulfill({json:overview('SUPPORTED')}));
 await page.goto('/');
 await page.getByRole('button',{name:'History',exact:true}).click();
 const fork=page.getByRole('menu').getByRole('menuitem',{name:'Fork conversation',exact:true});
 await expect(fork).toBeVisible();
 await expect(fork).toBeEnabled();
});
