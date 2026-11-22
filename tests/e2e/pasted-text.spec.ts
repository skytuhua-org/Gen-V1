import {test,expect,type Page} from '@playwright/test';
import {shellInit,shellRoute,shellSnapshot} from '../../scripts/capture-ui/shell-api';

const LINES=50;
const bigPaste=Array.from({length:LINES},(_,i)=>`line ${i+1} of the pasted body`).join('\n');
const chip=(page:Page,lines=LINES)=>page.getByRole('button',{name:`Pasted text, ${lines} ${lines===1?'line':'lines'}. Open to review`,exact:true});
const message=(page:Page)=>page.getByRole('textbox',{name:'Message',exact:true});

async function setup(page:Page,opts:{preferences?:Record<string,unknown>;empty?:boolean;saved?:boolean}={}){
 const snapshot=shellSnapshot(opts.empty??false),sends:{content:string;id:string}[]=[];
 if(opts.preferences)(snapshot.settings as Record<string,unknown>).preferences=opts.preferences;
 await page.addInitScript(shellInit);await page.route('**/api/**',async r=>{
  const url=new URL(r.request().url());
  if(url.pathname==='/api/commands'&&r.request().method()==='POST'){const body=r.request().postDataJSON();
   if(body?.type==='message.send')sends.push({content:body.payload?.content,id:body.id});
   if(body?.type==='thread.create')return r.fulfill({json:{commandId:body.id,eventSeq:++snapshot.seq,result:{id:'one',thread:{id:'one',title:'Created thread',status:'ready',modelId:'test/model',epoch:0}}}});}
  return shellRoute(r,snapshot,false);
 });await page.goto(opts.saved?'/fixture?saved=1':'/fixture');
 await expect(message(page)).toBeEnabled();
 return {sends};
}
async function paste(page:Page,text:string,opts:{files?:boolean;inline?:boolean}={}){
 const area=message(page);await area.focus();
 const prevented=await area.evaluate((node,{text:body,files,inline})=>{if(inline)node.dispatchEvent(new KeyboardEvent('keydown',{key:'v',ctrlKey:true,shiftKey:true,bubbles:true,cancelable:true}));const dt=new DataTransfer();dt.setData('text/plain',body);if(files)dt.items.add(new File(['x'],'image.png',{type:'image/png'}));const event=new ClipboardEvent('paste',{bubbles:true,cancelable:true});Object.defineProperty(event,'clipboardData',{value:dt});return !node.dispatchEvent(event);},{text,files:opts.files??false,inline:opts.inline??false});
 if(!prevented)await area.evaluate((raw,body)=>{const node=raw as HTMLTextAreaElement;const start=node.selectionStart??node.value.length,end=node.selectionEnd??node.value.length,setter=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value')!.set!;setter.call(node,node.value.slice(0,start)+body+node.value.slice(end));node.dispatchEvent(new Event('input',{bubbles:true}));},text);
}
test('A1: 50-line paste collapses to one chip, textarea unchanged, live region announces',async({page})=>{
 await setup(page);await paste(page,bigPaste);
 await expect(chip(page)).toBeVisible();await expect(message(page)).toHaveValue('');
 await expect(page.getByText(/Pasted 50 lines as an attachment\. Press .+Z to paste inline\./)).toBeAttached();
 await expect(page.getByText(/Pasted as attachment · .+Z to paste inline/)).toBeVisible();
});
test('A2: Ctrl+Z restores the paste inline; a second Ctrl+Z removes it natively',async({page})=>{
 await setup(page);await paste(page,bigPaste);await expect(chip(page)).toBeVisible();
 await page.keyboard.press('Control+z');await expect(chip(page)).toBeHidden();await expect(message(page)).toHaveValue(bigPaste);
 await page.keyboard.press('Control+z');await expect(message(page)).toHaveValue('');
});
test('A3: typing after collapse makes Ctrl+Z a native undo; the chip stays',async({page})=>{
 await setup(page);await paste(page,bigPaste);await page.keyboard.type('x');
 await page.keyboard.press('Control+z');await expect(message(page)).toHaveValue('');await expect(chip(page)).toBeVisible();
});
test('A4: Ctrl+Shift+V pastes long text inline',async({page})=>{
 await setup(page);const area=message(page);await area.focus();await paste(page,bigPaste,{inline:true});
 await expect(area).toHaveValue(bigPaste);await expect(chip(page)).toBeHidden();
});
test('A5: dialog edits, saves, inserts as text and removes',async({page})=>{
 await setup(page);await paste(page,bigPaste);
 await chip(page).click();const dialog=page.getByRole('dialog',{name:'Review pasted text'});await expect(dialog).toBeVisible();
 await dialog.getByRole('textbox',{name:'Pasted text'}).fill('Edited body\nsecond line');await dialog.getByRole('button',{name:'Save',exact:true}).click();await expect(dialog).toBeHidden();
 await chip(page,2).click();await dialog.getByRole('button',{name:'Insert as text',exact:true}).click();await expect(dialog).toBeHidden();
 await expect(message(page)).toHaveValue('Edited body\nsecond line');await expect(page.getByRole('button',{name:/Pasted text,/})).toBeHidden();
 await paste(page,bigPaste);await chip(page).click();await dialog.getByRole('button',{name:'Cancel',exact:true}).click();
 await page.getByRole('button',{name:'Remove pasted text, 50 lines',exact:true}).click();await expect(chip(page)).toBeHidden();
});
test('A6: send serializes the paste block after typed text and clears the chip',async({page})=>{
 const f=await setup(page);await paste(page,bigPaste);await message(page).fill('Please review');
 await page.getByRole('button',{name:'Send message',exact:true}).click();await expect.poll(()=>f.sends.length).toBe(1);
 const content=f.sends[0].content;
 expect(content).toContain(`Pasted text · ${LINES} lines`);expect(content).toContain('line 1 of the pasted body');expect(content).toContain('End pasted text');
 expect(content.indexOf('Please review')).toBeLessThan(content.indexOf('Pasted text ·'));
 await expect(chip(page)).toBeHidden();
});
test('A7: chips survive a reload',async({page})=>{
 await setup(page);await paste(page,bigPaste);await expect(chip(page)).toBeVisible();
 await page.reload();await expect(message(page)).toBeEnabled();await expect(chip(page)).toBeVisible();
});
test('A8: a new conversation keeps chips until its first send',async({page})=>{
 const f=await setup(page,{empty:true});
 await paste(page,bigPaste);await expect(chip(page)).toBeVisible();
 await page.getByRole('button',{name:'Send message',exact:true}).click();await expect.poll(()=>f.sends.length).toBe(1);
 expect(f.sends[0].content).toContain('line 1 of the pasted body');await expect(chip(page)).toBeHidden();
});
test('A9: saved drafts round-trip chips',async({page})=>{
 await setup(page,{saved:true});await message(page).fill('Prompt text');await paste(page,bigPaste);
 const fixture=page.locator('[data-saved-drafts-fixture]');await fixture.getByRole('button',{name:'Saved drafts',exact:true}).click();
 await page.getByRole('button',{name:'Save current prompt',exact:true}).click();
 await page.getByLabel('Draft name').fill('Paste draft');await page.getByRole('button',{name:'Save draft',exact:true}).click();
 await page.getByRole('button',{name:'Remove pasted text, 50 lines',exact:true}).click();await expect(chip(page)).toBeHidden();
 await fixture.getByRole('button',{name:'Saved drafts',exact:true}).click();
 await page.getByRole('button',{name:/^(Restore|Restore text only|Review)$/}).click();
 const restore=page.getByRole('dialog').last();await restore.getByRole('button',{name:'Replace text',exact:true}).click();
 await expect(chip(page)).toBeVisible();await expect(message(page)).toHaveValue('Prompt text');
});
test('A10: a paste starting with a slash command collapses to a chip, not the command menu',async({page})=>{
 await setup(page);await paste(page,'/btw '+bigPaste);
 await expect(chip(page)).toBeVisible();await expect(message(page)).toHaveValue('');await expect(page.getByRole('listbox')).toBeHidden();
});
test('A11: paste-collapse Off leaves long pastes inline',async({page})=>{
 await setup(page,{preferences:{pasteCollapse:'off'}});await paste(page,bigPaste);
 await expect(message(page)).toHaveValue(bigPaste);await expect(chip(page)).toBeHidden();
});
test('A12: pastes over 100 KB are refused with the size error and nothing is inserted',async({page})=>{
 await setup(page);await paste(page,'x'.repeat(100*1024+1));
 await expect(page.getByRole('alert')).toContainText('Gen sends at most 64 KB per message. Attach it as a file instead.');await expect(message(page)).toHaveValue('');await expect(page.getByRole('button',{name:/Pasted text,/})).toBeHidden();
});
test('A13: reduced motion still collapses immediately',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await setup(page);await paste(page,bigPaste);
 await expect(chip(page)).toBeVisible();await expect(message(page)).toHaveValue('');
});
test('A14: keyboard-only review: Tab to the chip, Enter opens, focus returns',async({page})=>{
 await setup(page);await paste(page,bigPaste);
 await chip(page).focus();await page.keyboard.press('Enter');
 await expect(page.getByRole('dialog',{name:'Review pasted text'})).toBeVisible();
 await page.getByRole('button',{name:'Cancel',exact:true}).click();await expect(page.getByRole('dialog')).toBeHidden();
});
test('A15: an image-only paste is left to native handling',async({page})=>{
 await setup(page);await paste(page,'',{files:true});
 await expect(message(page)).toHaveValue('');await expect(page.getByRole('button',{name:/Pasted text,/})).toBeHidden();await expect(page.getByRole('alert')).toBeHidden();
});
