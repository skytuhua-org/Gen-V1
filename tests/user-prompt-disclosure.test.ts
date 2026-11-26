import {afterAll,beforeAll,describe,it,expect} from 'vitest';
import {build} from 'esbuild';
import {readFile} from 'node:fs/promises';
import {chromium,type Browser,type Page} from '@playwright/test';
import {promptCapPx,promptOverflows} from '../apps/web/src/UserPromptDisclosure';
import {isPromptClipBoundary,promptClipBoundary,rangeClippedBy,registerPromptClip} from '../apps/web/src/prompt-clips';

const CAP=184.8; // 14px * 1.65 line-height * 8 lines

describe('user prompt disclosure threshold',()=>{
 it('caps the preview at eight rendered line heights',()=>{
  expect(promptCapPx(23.1)).toBeCloseTo(184.8);
  expect(promptCapPx(18)).toBe(144);
  expect(promptCapPx(31.2)).toBe(249.6);
 });
 it('keeps prompts at or under the cap uncollapsed, including subpixel tolerance',()=>{
  expect(promptOverflows(100,CAP)).toBe(false);
  expect(promptOverflows(CAP-0.4,CAP)).toBe(false);
  expect(promptOverflows(CAP,CAP)).toBe(false);
  expect(promptOverflows(CAP+0.9,CAP)).toBe(false);
  expect(promptOverflows(CAP+1,CAP)).toBe(false);
 });
 it('collapses prompts taller than cap + 1px',()=>{
  expect(promptOverflows(CAP+1.01,CAP)).toBe(true);
  expect(promptOverflows(CAP+2,CAP)).toBe(true);
  expect(promptOverflows(400,CAP)).toBe(true);
 });
});

describe('prompt clip registry',()=>{
 const boundary={parentElement:null} as unknown as Element;
 it('registers and unregisters a clip boundary',()=>{
  const release=registerPromptClip(boundary,{clip:()=>null,collapsed:()=>true,reveal:()=>{}});
  expect(isPromptClipBoundary(boundary)).toBe(true);
  release();
  expect(isPromptClipBoundary(boundary)).toBe(false);
 });
 it('finds the containing registered boundary for a node and ignores unregistered ancestors',()=>{
  const inner={parentElement:boundary} as unknown as Element;
  const text={parentElement:inner} as unknown as Text;
  const release=registerPromptClip(boundary,{clip:()=>null,collapsed:()=>true,reveal:()=>{}});
  expect(promptClipBoundary(text)).toBe(boundary);
  expect(promptClipBoundary(inner)).toBe(boundary);
  release();
  expect(promptClipBoundary(text)).toBeNull();
  expect(promptClipBoundary({parentElement:{parentElement:null} as unknown as Element} as unknown as Node)).toBeNull();
 });
});

describe('range clipped by cap minus fade',()=>{
 const clip={getBoundingClientRect:()=>({top:0,bottom:CAP,left:0,right:200,width:200,height:CAP,x:0,y:0,toJSON:()=>({})})} as unknown as Element;
 const range=(rects:{top:number;bottom:number;width:number;height:number}[])=>({getClientRects:()=>rects.map(r=>({...r,left:0,right:100,x:0,y:r.top,toJSON:()=>({})}))}) as unknown as Range;
 it('treats rects fully inside the usable area as visible',()=>{
  expect(rangeClippedBy(clip,range([{top:20,bottom:40,width:80,height:20}]))).toBe(false);
  expect(rangeClippedBy(clip,range([{top:140,bottom:160.7,width:80,height:20}]))).toBe(false);
 });
 it('treats a rect crossing or below the usable edge as clipped',()=>{
  expect(rangeClippedBy(clip,range([{top:150,bottom:165,width:80,height:15}]))).toBe(true);
  expect(rangeClippedBy(clip,range([{top:200,bottom:220,width:80,height:20}]))).toBe(true);
 });
 it('ignores empty rects but reveals an unmeasurable range inside a collapsed clip',()=>{
  expect(rangeClippedBy(clip,range([{top:0,bottom:0,width:0,height:0},{top:20,bottom:40,width:80,height:20}]))).toBe(false);
  expect(rangeClippedBy(clip,range([]))).toBe(true);
  expect(rangeClippedBy(clip,range([{top:0,bottom:0,width:0,height:0}]))).toBe(true);
 });
});

const disclosureFixture = `
import {createRoot} from 'react-dom/client';
import {UserPromptDisclosure} from './apps/web/src/UserPromptDisclosure';
import {promptClipEntry} from './apps/web/src/prompt-clips';
const animate=Element.prototype.animate;
Element.prototype.animate=function(...args){const animation=animate.apply(this,args);if(window.holdDisclosureAnimations&&this.matches('.up-disclosure-clip'))animation.pause();return animation;};
window.resizePrompt=width=>document.getElementById('prompt-owner').style.width=width+'px';
window.revealPrompt=()=>promptClipEntry(document.querySelector('.up-disclosure-content')).reveal(()=>{const clip=document.querySelector('.up-disclosure-clip');window.revealDone={animations:clip.getAnimations().length,settling:clip.hasAttribute('data-settling'),inert:document.querySelector('.up-disclosure-content').inert};});
createRoot(document.getElementById('root')).render(<><div id="prompt-owner" style={{width:300}}><UserPromptDisclosure text={'Ordinary wrapped source text. '.repeat(40)}/></div><button type="button">Other control</button></>);
`;

describe('mounted user prompt disclosure ownership',()=>{
 let browser:Browser,script:string,css:string;
 beforeAll(async()=>{
  script=(await build({stdin:{contents:disclosureFixture,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'}})).outputFiles[0]!.text;
  css=(await Promise.all(['packages/ui-shell/tokens.css','apps/web/src/styles.css','apps/web/src/user-prompt-disclosure.css'].map(path=>readFile(path,'utf8')))).join('\n');
  browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});
 });
 afterAll(async()=>{await browser?.close();});
 async function settled(page:Page){await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));}
 async function open(reducedMotion:'reduce'|'no-preference'='reduce'){
  const page=await browser.newPage({viewport:{width:1600,height:1000},reducedMotion});
  await page.setContent('<div id="root"></div>');await page.addStyleTag({content:css});await page.addScriptTag({content:script});
  await page.getByRole('button',{name:'Show more',exact:true}).waitFor();await settled(page);return page;
 }
 for(const focus of ['toggle','outside'])it(`keeps ${focus} focus when resize removes a previously toggled rail`,async()=>{
  const page=await open();try{
   await page.getByRole('button',{name:'Show more',exact:true}).click();
   const button=page.getByRole('button',{name:'Show less',exact:true});await button.waitFor();
   if(focus==='outside')await page.getByRole('button',{name:'Other control',exact:true}).focus();
   else expect(await button.evaluate(node=>node===document.activeElement)).toBe(true);
   await page.evaluate(()=>(window as any).resizePrompt(1400));
   await expect.poll(()=>button.count()).toBe(0);
   const target=focus==='toggle'?page.locator('.up-disclosure'):page.getByRole('button',{name:'Other control',exact:true});
   expect(await target.evaluate(node=>node===document.activeElement)).toBe(true);
  }finally{await page.close();}
 });
 for(const reason of ['app policy','OS policy','remeasure'])it(`settles a real paused height animation on ${reason}`,async()=>{
  const page=await open('no-preference');try{
   await page.evaluate(()=>(window as any).holdDisclosureAnimations=true);
   await page.getByRole('button',{name:'Show more',exact:true}).click();
   await expect.poll(()=>page.locator('.up-disclosure-clip').evaluate(node=>node.getAnimations().length)).toBe(1);
   if(reason==='app policy')await page.evaluate(()=>document.documentElement.dataset.motion='off');
   else if(reason==='OS policy')await page.emulateMedia({reducedMotion:'reduce'});
   else await page.evaluate(()=>(window as any).resizePrompt(400));
   await settled(page);
   await expect.poll(()=>page.locator('.up-disclosure-clip').evaluate(node=>node.getAnimations().length)).toBe(0);
   expect(await page.locator('.up-disclosure-clip').getAttribute('data-settling')).toBeNull();
   expect(await page.locator('.up-disclosure-content').evaluate(node=>(node as HTMLElement).inert)).toBe(false);
  }finally{await page.close();}
 });
 it('settles an interrupted collapse before acknowledging the registered Find reveal',async()=>{
  const page=await open('no-preference');try{
   await page.getByRole('button',{name:'Show more',exact:true}).click();
   await expect.poll(()=>page.locator('.up-disclosure-clip').getAttribute('data-settling')).toBeNull();
   await page.evaluate(()=>(window as any).holdDisclosureAnimations=true);
   await page.getByRole('button',{name:'Show less',exact:true}).click();
   await expect.poll(()=>page.locator('.up-disclosure-clip').evaluate(node=>node.getAnimations().length)).toBe(1);
   await page.evaluate(()=>(window as any).revealPrompt());
   await expect.poll(()=>page.evaluate(()=>(window as any).revealDone)).toEqual({animations:0,settling:false,inert:false});
  }finally{await page.close();}
 });

 it('drops the old animation when a rapid reversal already matches the presented cap',async()=>{
  const page=await open('no-preference');try{
   await page.evaluate(()=>(window as any).holdDisclosureAnimations=true);
   await page.getByRole('button',{name:'Show more',exact:true}).click();
   await expect.poll(()=>page.locator('.up-disclosure-clip').evaluate(node=>node.getAnimations().length)).toBe(1);
   await page.getByRole('button',{name:'Show less',exact:true}).click();
   expect(await page.locator('.up-disclosure-clip').evaluate(node=>node.getAnimations().length)).toBe(0);
   expect(await page.locator('.up-disclosure-clip').getAttribute('data-settling')).toBeNull();
   expect(await page.locator('.up-disclosure-content').evaluate(node=>(node as HTMLElement).inert)).toBe(true);
  }finally{await page.close();}
 });
});
