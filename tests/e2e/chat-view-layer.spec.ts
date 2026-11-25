import {test,expect,type Page} from '@playwright/test';
import {resolve} from 'node:path';

const fixture='/@fs/'+resolve('tests/e2e/chat-view-layer-fixture.tsx').replaceAll('\\','/');
async function open(page:Page){
 await page.route('**/chat-view-layer-check',route=>route.fulfill({contentType:'text/html',body:`<html data-theme="dark"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module">import RefreshRuntime from '/@react-refresh';RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;await import('${encodeURI(fixture)}');</script></body></html>`}));
 await page.goto('/chat-view-layer-check');
 await expect(page.getByRole('textbox',{name:'Message',exact:true})).toBeEnabled();
}

// Regression for #1720: the detached chat is a sibling of .workspace-right, and
// the slot's isolation:isolate trapped the surface's z-index so the panel won
// hit-testing. The layer must be raised on the slot, not the child.
test('the detached chat wins hit-testing over the right workspace panel',async({page})=>{
 await open(page);
 await page.getByRole('button',{name:'Detach chat',exact:true}).click();
 const chat=page.getByRole('main',{name:'Chat',exact:true});
 await expect(chat).toHaveAttribute('data-chat-mode','popup');
 await expect.poll(()=>chat.evaluate(element=>element.getAnimations().filter(effect=>effect.playState==='running').length)).toBe(0);
 const result=await page.evaluate(()=>{
  const surface=document.querySelector('.chat-view-surface')!,panel=document.querySelector('.workspace-right')!;
  const a=surface.getBoundingClientRect(),b=panel.getBoundingClientRect();
  const x=Math.max(a.left,b.left),y=Math.max(a.top,b.top),right=Math.min(a.right,b.right),bottom=Math.min(a.bottom,b.bottom);
  if(right-x<=4||bottom-y<=4)return 'no-overlap';
  return surface.contains(document.elementFromPoint((x+right)/2,(y+bottom)/2))?'chat':'other';
 });
 expect(result).toBe('chat');
 // Centered (full) mode keeps the slot at its plain layer — the :has() guard
 // must not match without a floating surface.
 await page.getByRole('button',{name:'Dock chat to side drawer',exact:true}).click();
 await expect(page.getByRole('button',{name:'Detach chat',exact:true})).toBeVisible();
});
