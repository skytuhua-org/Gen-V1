import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {build} from 'esbuild';
import {chromium, type Browser, type Page} from '@playwright/test';

declare global {
  interface Window {
    hostCalls: Array<{actionId:string;payload:unknown;epoch:number}>;
    hostPending: Array<{actionId:string;resolve:(value?:unknown)=>void;reject:(reason?:unknown)=>void}>;
    results: Record<string,Promise<boolean>>;
    runs: Record<string,(actionId:string,payload:unknown)=>Promise<boolean>>;
    start: (resultKey:string,ownerKey:string,actionId:string)=>void;
    settle: (index:number,kind?:string,value?:string)=>void;
    result: (key:string)=>Promise<boolean>;
    setOwner: (owner:string|null)=>void;
    unmount: ()=>void;
    changeCallbackIdentity: ()=>void;
    editPresentation: ()=>void;
  }
}

const fixture = `
import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ArtifactActions, useTaskAction} from './apps/web/src/task-context';

window.hostCalls = [];
window.hostPending = [];
window.results = {};
window.runs = {};
window.start = (resultKey, ownerKey, actionId) => {
  window.results[resultKey] = window.runs[ownerKey](actionId, {source: resultKey});
};
window.settle = (index, kind = 'success', value = '') => {
  const item = window.hostPending.splice(index, 1)[0];
  if (!item) throw new Error('missing deferred host action');
  if (kind === 'success') item.resolve();
  else if (kind === 'error') item.reject(new Error(value));
  else item.reject(value);
};
window.result = async key => await window.results[key];

function Probe({owner}) {
  const [editRevision, setEditRevision] = useState(0);
  window.editPresentation = () => setEditRevision(value => value + 1);
  const action = useTaskAction(owner);
  const key = owner ?? 'null';
  window.runs[key] = action.run;
  return <>
    <span id="owner">{key}</span>
    <span id="edit-revision">{editRevision}</span>
    <span id="busy">{String(action.busy)}</span>
    <span id="error">{action.error}</span>
  </>;
}

function LegacyProbe() {
  const action = useTaskAction();
  window.runs.legacy = action.run;
  return <span id="legacy-error">{action.error}</span>;
}

function Fixture() {
  const [owner, setOwner] = useState('A');
  const [mounted, setMounted] = useState(true);
  const [epoch, setEpoch] = useState(0);
  window.setOwner = setOwner;
  window.unmount = () => setMounted(false);
  window.changeCallbackIdentity = () => setEpoch(value => value + 1);
  const hostAction = (actionId, payload) => {
    window.hostCalls.push({actionId, payload, epoch});
    return new Promise((resolve, reject) => {
      window.hostPending.push({actionId, resolve, reject});
    });
  };
  return <ArtifactActions.Provider value={hostAction}><LegacyProbe/>{mounted ? <Probe owner={owner}/> : null}</ArtifactActions.Provider>;
}

createRoot(document.getElementById('root')).render(<Fixture/>);
`;

describe('task action ownership', () => {
  let browser: Browser, script: string;
  beforeAll(async () => {
    script = (await build({stdin:{contents:fixture,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'}})).outputFiles[0]!.text;
    browser = await chromium.launch({headless:true,...(process.env.GEN_TEST_CHROMIUM_EXECUTABLE?{executablePath:process.env.GEN_TEST_CHROMIUM_EXECUTABLE}:process.platform==='win32'?{channel:'msedge'}:{})});
  });
  afterAll(async () => { await browser?.close(); });
  async function open(): Promise<Page> {
    const page = await browser.newPage();
    await page.setContent('<div id="root"></div>');
    await page.addScriptTag({content: script});
    await page.locator('#owner').waitFor();
    return page;
  }
  const busy = (page: Page) => page.locator('#busy').innerText();
  const error = (page: Page) => page.locator('#error').innerText();
  const calls = (page: Page) => page.evaluate(() => window.hostCalls.length);
  async function start(page: Page, resultKey: string, ownerKey: string, actionId = resultKey) {
    await page.evaluate(([result, owner, action]) => window.start(result, owner, action), [resultKey, ownerKey, actionId]);
  }
  async function settle(page: Page, index: number, kind: 'success'|'error'|'raw' = 'success', value = '') {
    await page.evaluate(([i, k, v]) => window.settle(i as number, k as string, v as string), [index, kind, value]);
  }

  it('preserves legacy no-argument duplicates, success and rejection messages', async () => {
    const page = await open();
    await start(page, 'legacy-current', 'legacy', 'legacy-current');
    expect(await calls(page)).toBe(1);
    await start(page, 'legacy-duplicate', 'legacy', 'legacy-duplicate');
    expect(await page.evaluate(async () => await window.result('legacy-duplicate'))).toBe(false);
    expect(await calls(page)).toBe(1);
    await settle(page, 0);
    expect(await page.evaluate(async () => await window.result('legacy-current'))).toBe(true);
    await start(page, 'legacy-rejection', 'legacy');
    expect(await calls(page)).toBe(2);
    await settle(page, 0, 'error', 'legacy request failed');
    expect(await page.evaluate(async () => await window.result('legacy-rejection'))).toBe(false);
    expect(await page.locator('#legacy-error').innerText()).toBe('legacy request failed');
    await page.close();
  });

  it('blocks stale owner results while a new owner remains pending', async () => {
    const page = await open();
    await start(page, 'a', 'A', 'first');
    expect(await calls(page)).toBe(1);
    expect(await busy(page)).toBe('true');
    await page.evaluate(() => window.setOwner('B'));
    await expect.poll(() => page.locator('#owner').innerText()).toBe('B');
    expect(await busy(page)).toBe('false');
    await start(page, 'b', 'B', 'second');
    expect(await calls(page)).toBe(2);
    expect(await busy(page)).toBe('true');
    await settle(page, 0, 'error', 'old owner failed');
    expect(await page.evaluate(async () => await window.result('a'))).toBe(false);
    expect(await busy(page)).toBe('true');
    expect(await error(page)).toBe('');
    await settle(page, 0, 'error', 'new owner failed');
    expect(await page.evaluate(async () => await window.result('b'))).toBe(false);
    expect(await busy(page)).toBe('false');
    expect(await error(page)).toBe('new owner failed');
    await page.close();
  });

  it('treats A-B-A as a new generation', async () => {
    const page = await open();
    await start(page, 'a1', 'A', 'first-a');
    await page.evaluate(() => window.setOwner('B'));
    await expect.poll(() => page.locator('#owner').innerText()).toBe('B');
    await page.evaluate(() => window.setOwner('A'));
    await expect.poll(() => page.locator('#owner').innerText()).toBe('A');
    await start(page, 'a2', 'A', 'second-a');
    expect(await calls(page)).toBe(2);
    await settle(page, 0);
    expect(await page.evaluate(async () => await window.result('a1'))).toBe(false);
    expect(await busy(page)).toBe('true');
    await settle(page, 0);
    expect(await page.evaluate(async () => await window.result('a2'))).toBe(true);
    expect(await busy(page)).toBe('false');
    await page.close();
  });

  it('returns false without dispatch while null and suppresses duplicates across callback and presentation changes', async () => {
    const page = await open();
    await page.evaluate(() => window.setOwner(null));
    await expect.poll(() => page.locator('#owner').innerText()).toBe('null');
    await start(page, 'inactive', 'null', 'inactive');
    expect(await page.evaluate(async () => await window.result('inactive'))).toBe(false);
    expect(await calls(page)).toBe(0);
    await page.evaluate(() => window.setOwner('A'));
    await expect.poll(() => page.locator('#owner').innerText()).toBe('A');
    await start(page, 'current', 'A', 'current');
    expect(await calls(page)).toBe(1);
    await page.evaluate(() => window.changeCallbackIdentity());
    await page.waitForTimeout(0);
    await start(page, 'duplicate', 'A', 'duplicate');
    expect(await page.evaluate(async () => await window.result('duplicate'))).toBe(false);
    expect(await calls(page)).toBe(1);
    await page.evaluate(() => window.editPresentation());
    await expect.poll(() => page.locator('#edit-revision').innerText()).toBe('1');
    await start(page, 'edit-duplicate', 'A');
    expect(await page.evaluate(async () => await window.result('edit-duplicate'))).toBe(false);
    expect(await calls(page)).toBe(1);
    await settle(page, 0);
    expect(await page.evaluate(async () => await window.result('current'))).toBe(true);
    await page.close();
  });

  it('invalidates the request token on unmount without cancelling the host promise', async () => {
    const page = await open();
    await start(page, 'unmounted', 'A', 'unmounted');
    expect(await calls(page)).toBe(1);
    await page.evaluate(() => window.unmount());
    await expect.poll(() => page.locator('#owner').count()).toBe(0);
    await settle(page, 0);
    expect(await page.evaluate(async () => await window.result('unmounted'))).toBe(false);
    expect(await page.evaluate(() => window.hostPending.length)).toBe(0);
    await page.close();
  });

  it('uses source Error messages and the fallback for non-Error rejection in current owners', async () => {
    const page = await open();
    await start(page, 'error', 'A', 'error');
    await settle(page, 0, 'error', 'source failure');
    expect(await page.evaluate(async () => await window.result('error'))).toBe(false);
    expect(await error(page)).toBe('source failure');
    await start(page, 'raw', 'A', 'raw');
    await settle(page, 0, 'raw', 'not an Error');
    expect(await page.evaluate(async () => await window.result('raw'))).toBe(false);
    expect(await error(page)).toBe('The request failed. Try again.');
    await page.close();
  });
});
