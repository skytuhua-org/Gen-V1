import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {build} from 'esbuild';
import {chromium, type Browser, type Page} from '@playwright/test';

const fixture = `
import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ArtifactActions, useTaskAction} from './apps/web/src/task-context';

window.actionCalls = [];
window.deferreds = [];
window.results = {};
const makeHost = () => (actionId, payload) => new Promise((resolve, reject) => {
  window.actionCalls.push({actionId, payload});
  window.deferreds.push({resolve, reject});
});
function OwnedProbe({owner}){
  const action = useTaskAction(owner);
  if (owner === 'A' && !window.firstA) window.firstA = action;
  window.currentHook = action;
  return <output id="owned" data-owner={String(owner)} data-busy={String(action.busy)} data-error={action.error}/>;
}
function LegacyProbe(){
  const action = useTaskAction();
  window.legacyHook = action;
  return <output id="legacy" data-busy={String(action.busy)} data-error={action.error}/>;
}
function Harness(){
  const [owner,setOwner] = useState('A');
  const [dispatch,setDispatch] = useState(() => makeHost());
  const [edits,setEdits] = useState(0);
  window.setOwner = setOwner;
  window.rotateAction = () => setDispatch(() => makeHost());
  window.editArtifact = () => setEdits(value => value + 1);
  return <ArtifactActions value={dispatch}><span hidden>{edits}</span>{owner === 'gone' ? null : <OwnedProbe owner={owner}/>}<LegacyProbe/></ArtifactActions>;
}
createRoot(document.getElementById('root')).render(<Harness/>);
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
    await expect.poll(() => page.evaluate('Boolean(window.currentHook && window.legacyHook)')).toBe(true);
    return page;
  }
  const calls = (page: Page) => page.evaluate('window.actionCalls.length');
  const result = (page: Page, name: string) => page.evaluate(`window.results[${JSON.stringify(name)}]`);

  it('preserves legacy undefined callers, duplicate suppression and current errors', async () => {
    const page = await open();
    await page.evaluate(`window.results.legacyFirst = undefined; window.legacyHook.run('legacy').then(value => { window.results.legacyFirst = value; }); window.results.legacyDuplicate = undefined; window.legacyHook.run('legacy').then(value => { window.results.legacyDuplicate = value; }); undefined;`);
    expect(await calls(page)).toBe(1);
    await expect.poll(() => result(page, 'legacyDuplicate')).toBe(false);
    await page.evaluate(`window.deferreds[0].resolve()`);
    await expect.poll(() => result(page, 'legacyFirst')).toBe(true);
    await page.evaluate(`window.results.legacyError = undefined; window.legacyHook.run('legacy').then(value => { window.results.legacyError = value; }); undefined;`);
    expect(await calls(page)).toBe(2);
    await page.evaluate(`window.deferreds[1].reject(new Error('Source failed exactly.'))`);
    await expect.poll(() => result(page, 'legacyError')).toBe(false);
    await expect.poll(() => page.locator('#legacy').getAttribute('data-error')).toBe('Source failed exactly.');
    await page.close();
  });

  it('returns false for an inactive null owner without dispatching', async () => {
    const page = await open();
    await page.evaluate(`window.setOwner(null)`);
    await expect.poll(() => page.locator('#owned').getAttribute('data-owner')).toBe('null');
    await page.evaluate(`window.results.inactive = undefined; window.currentHook.run('inactive').then(value => { window.results.inactive = value; }); undefined;`);
    await expect.poll(() => result(page, 'inactive')).toBe(false);
    expect(await calls(page)).toBe(0);
    await page.close();
  });

  it('invalidates a late prior-owner result without clearing the new owner request', async () => {
    const page = await open();
    await page.evaluate(`window.results.oldA = undefined; window.firstA.run('act').then(value => { window.results.oldA = value; }); undefined;`);
    expect(await calls(page)).toBe(1);
    await page.evaluate(`window.setOwner('B')`);
    await expect.poll(() => page.locator('#owned').getAttribute('data-owner')).toBe('B');
    await page.evaluate(`window.results.currentB = undefined; window.currentHook.run('act').then(value => { window.results.currentB = value; }); undefined;`);
    expect(await calls(page)).toBe(2);
    await expect.poll(() => page.locator('#owned').getAttribute('data-busy')).toBe('true');
    await page.evaluate(`window.deferreds[0].resolve()`);
    await expect.poll(() => result(page, 'oldA')).toBe(false);
    await expect.poll(() => page.locator('#owned').getAttribute('data-busy')).toBe('true');
    await expect.poll(() => page.locator('#owned').getAttribute('data-error')).toBe('');
    await page.evaluate(`window.deferreds[1].reject('not an Error object')`);
    await expect.poll(() => result(page, 'currentB')).toBe(false);
    await expect.poll(() => page.locator('#owned').getAttribute('data-error')).toBe('The request failed. Try again.');
    await expect.poll(() => page.locator('#owned').getAttribute('data-busy')).toBe('false');
    await page.evaluate(`window.results.currentError = undefined; window.currentHook.run('act').then(value => { window.results.currentError = value; }); undefined;`);
    expect(await calls(page)).toBe(3);
    await page.evaluate(`window.deferreds[2].reject(new Error('Owned source failed exactly.'))`);
    await expect.poll(() => result(page, 'currentError')).toBe(false);
    await expect.poll(() => page.locator('#owned').getAttribute('data-error')).toBe('Owned source failed exactly.');
    await page.close();
  });

  it('keeps the same-owner guard through callback identity and edit renders', async () => {
    const page = await open();
    await page.evaluate(`window.results.initial = undefined; window.currentHook.run('act').then(value => { window.results.initial = value; }); undefined;`);
    expect(await calls(page)).toBe(1);
    await page.evaluate(`window.rotateAction(); new Promise(requestAnimationFrame)`);
    await page.evaluate(`window.results.afterRotate = undefined; window.currentHook.run('act').then(value => { window.results.afterRotate = value; }); undefined;`);
    await expect.poll(() => result(page, 'afterRotate')).toBe(false);
    expect(await calls(page)).toBe(1);
    await page.evaluate(`window.editArtifact(); new Promise(requestAnimationFrame)`);
    await page.evaluate(`window.results.afterEdit = undefined; window.currentHook.run('act').then(value => { window.results.afterEdit = value; }); undefined;`);
    await expect.poll(() => result(page, 'afterEdit')).toBe(false);
    expect(await calls(page)).toBe(1);
    await page.evaluate(`window.deferreds[0].resolve()`);
    await expect.poll(() => result(page, 'initial')).toBe(true);
    expect(await calls(page)).toBe(1);
    await page.close();
  });

  it('treats A-B-A as a new generation and invalidates unmounted completion', async () => {
    const page = await open();
    await page.evaluate(`window.results.firstA = undefined; window.firstA.run('act').then(value => { window.results.firstA = value; }); undefined;`);
    await page.evaluate(`window.setOwner('B')`);
    await expect.poll(() => page.locator('#owned').getAttribute('data-owner')).toBe('B');
    await page.evaluate(`window.setOwner('A')`);
    await expect.poll(() => page.locator('#owned').getAttribute('data-owner')).toBe('A');
    await page.evaluate(`window.results.newA = undefined; window.currentHook.run('act').then(value => { window.results.newA = value; }); undefined;`);
    expect(await calls(page)).toBe(2);
    await page.evaluate(`window.deferreds[0].resolve()`);
    await expect.poll(() => result(page, 'firstA')).toBe(false);
    await expect.poll(() => page.locator('#owned').getAttribute('data-busy')).toBe('true');
    await page.evaluate(`window.setOwner('gone')`);
    await expect.poll(() => page.evaluate(`document.getElementById('owned') === null`)).toBe(true);
    await page.evaluate(`window.deferreds[1].resolve()`);
    await expect.poll(() => result(page, 'newA')).toBe(false);
    await page.close();
  });
});
