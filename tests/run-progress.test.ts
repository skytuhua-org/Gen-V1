import {chromium} from '@playwright/test';
import {build} from 'esbuild';
import {resolve} from 'node:path';
import {readFile} from 'node:fs/promises';
import {describe, expect, it} from 'vitest';
import {formatElapsed, threadWorking, RUN_ACTIVITY_LABELS} from '../apps/web/src/run-progress';
import type {Thread} from '../packages/contracts';

const thread = (patch: Partial<Thread>): Thread => ({
  id: 't1', projectId: 'p1', title: 'Run', status: 'ready', runId: null, createdAt: '0', updatedAt: '0', ...patch,
} as Thread);

describe('formatElapsed', () => {
  it('formats mm:ss, no hours clamp', () => {
    expect(formatElapsed(0)).toBe('0:00');
    expect(formatElapsed(59_999)).toBe('0:59');
    expect(formatElapsed(60_000)).toBe('1:00');
    expect(formatElapsed(72_000)).toBe('1:12');
    expect(formatElapsed(3_661_000)).toBe('61:01');
  });
  it('clamps negative to 0:00', () => {
    expect(formatElapsed(-500)).toBe('0:00');
  });
});

describe('threadWorking', () => {
  it('true on runId or working status', () => {
    expect(threadWorking(thread({runId: 'r1'}))).toBe(true);
    expect(threadWorking(thread({status: 'working'}))).toBe(true);
    expect(threadWorking(thread({status: 'ready'}))).toBe(false);
    expect(threadWorking(undefined)).toBe(false);
  });
});

describe('RUN_ACTIVITY_LABELS', () => {
  it('maps each activity to a label', () => {
    expect(RUN_ACTIVITY_LABELS.generating).toBe('Generating…');
    expect(RUN_ACTIVITY_LABELS.tool).toBe('Running tool…');
    expect(RUN_ACTIVITY_LABELS.queued).toBe('Queued for account…');
  });
});

it('suppresses every run progress animation for reduced motion while retaining normal motion', async () => {
  const css = await readFile('packages/ui-shell/tokens.css', 'utf8') + await readFile('apps/web/src/styles.css', 'utf8');
  const browser = await chromium.launch({headless:true});
  try {
    const page = await browser.newPage({reducedMotion:'no-preference'});
    await page.setContent(`<style>${css}</style><span class="run-spinner"></span><div class="run-progress-card">Working</div><div class="working-status run-strip">Working</div><span class="thread-run-badge"></span>`);
    const animations = () => page.evaluate(() => ['run-spinner','run-progress-card','run-strip','thread-run-badge'].map(name => getComputedStyle(document.querySelector('.'+name)!).animationName));
    expect(await animations()).toEqual(['spin','ui-item-in','run-strip-in','spin']);
    await page.emulateMedia({reducedMotion:'reduce'});
    expect(await animations()).toEqual(['none','none','none','none']);
    await page.emulateMedia({reducedMotion:'no-preference'});
    expect(await animations()).toEqual(['spin','ui-item-in','run-strip-in','spin']);
  } finally { await browser.close(); }
});


it('retains live run clocks across views and releases completed identities from accepted snapshots', async () => {
  const bundle = await build({
    stdin: {resolveDir:process.cwd(), loader:'tsx', contents:`
      import React from 'react';
      import {createRoot} from 'react-dom/client';
      import {flushSync} from 'react-dom';
      import {RunProgressCard,RunStrip,threadWorking} from './apps/web/src/run-progress';
      let clock=100000;
      Date.now=()=>clock;
      const root=createRoot(document.getElementById('root'));
      const thread=(runId)=>({id:'t1',projectId:'p1',title:'Run',status:runId?'working':'ready',runId,createdAt:'0',updatedAt:'0'});
      window.paintRun=({seq,runId,visible=true,strip=false,at=clock,removed=false})=>{
        clock=at;
        const current=thread(runId), snapshot={seq,threads:removed?[]:[current],usage:{},messages:[]};
        window.runProgressTest.reconcile?.(snapshot);
        flushSync(()=>root.render(visible&&threadWorking(current)?React.createElement(strip?RunStrip:RunProgressCard,{thread:current,snapshot,onStop:()=>{}}):null));
        return {entries:window.runProgressTest.entries(),elapsed:document.querySelector('.run-progress-elapsed,.run-strip-elapsed')?.textContent??null};
      };
    `}, bundle:true, write:false, format:'iife', platform:'browser', jsx:'automatic',
    plugins:[{name:'observe-run-clock-lifetime',setup(builder){builder.onLoad({filter:/[\\/]run-progress\.tsx$/},async args=>({loader:'tsx',resolveDir:resolve(args.path,'..'),contents:await readFile(args.path,'utf8')+`
      Object.assign(globalThis,{runProgressTest:{entries:()=>[...firstSeen],reconcile:typeof reconcileRunProgress==='function'?reconcileRunProgress:undefined}});
    `}));}}],
  });
  const browser = await chromium.launch({headless:true});
  try {
    const page = await browser.newPage();
    await page.setContent('<div id="root"></div>');
    await page.addScriptTag({content:bundle.outputFiles[0].text});
    const paint = (input: {seq:number;runId:string|null;visible?:boolean;strip?:boolean;at?:number;removed?:boolean}) => page.evaluate(value => (window as unknown as {paintRun:(input:typeof value)=>{entries:[string,number][];elapsed:string|null}}).paintRun(value),input);
    expect(await paint({seq:1,runId:'live',at:100000})).toEqual({entries:[['t1:live',100000]],elapsed:'0:00'});
    expect((await paint({seq:2,runId:'live',visible:false,at:105000})).entries).toEqual([['t1:live',100000]]);
    expect(await paint({seq:3,runId:'live',strip:true,at:107000})).toEqual({entries:[['t1:live',100000]],elapsed:'0:07'});
    expect(await paint({seq:4,runId:null,at:108000})).toEqual({entries:[],elapsed:null});
    expect(await paint({seq:5,runId:'next',at:110000})).toEqual({entries:[['t1:next',110000]],elapsed:'0:00'});
    // Another mounted workspace can still render an older complete snapshot.
    expect((await paint({seq:3,runId:'live',at:111000})).entries).toEqual([['t1:next',110000]]);
    expect((await paint({seq:6,runId:null,removed:true,at:112000})).entries).toEqual([]);
    expect((await paint({seq:5,runId:'next',at:113000})).entries).toEqual([]);
    for(let index=0;index<100;index++){
      await paint({seq:7+index*2,runId:'run-'+index,at:120000+index*2000});
      expect((await paint({seq:8+index*2,runId:null,at:121000+index*2000})).entries).toEqual([]);
    }
  } finally { await browser.close(); }
});
