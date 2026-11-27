import {afterAll, beforeAll, describe, it} from 'vitest';
import {build} from 'esbuild';
import {chromium, expect, type Browser, type Page} from '@playwright/test';

type FixtureWindow = Window & typeof globalThis & {__sent: {id: string; payload: Record<string, any>}[]; __failList: boolean; __failCreate: boolean};

// Issue #2041 T04: drive the production AgentWorkPanel caller in a browser and
// assert the exact admission command, stable retry identity, and visible empty/error states.
const fixture = `
import React from 'react';
import {createRoot} from 'react-dom/client';
import {AgentWorkPanel} from './apps/web/src/agents-workspace/AgentWorkPanel';

window.__sent = [];
window.__errors = [];
if (typeof crypto.randomUUID !== 'function') crypto.randomUUID = () => '00000000-1000-4000-8000-' + String(Math.floor(Math.random() * 0xffffffffffff)).padStart(12, '0');
window.addEventListener('error', event => window.__errors.push(String(event.error && event.error.stack || event.message)));
window.addEventListener('unhandledrejection', event => window.__errors.push(String(event.reason && event.reason.stack || event.reason)));
window.__failList = false;
(window as unknown as FixtureWindow).__failCreate = false;
window.fetch = async (url, init) => {
  const path = String(url);
  const json = (body, status = 200) => new Response(JSON.stringify(body), {status, headers: {'Content-Type': 'application/json'}});
  if (path.startsWith('/api/bootstrap')) return json({csrfToken: 'csrf', seq: 1, threads: [], messages: [], artifacts: [], userStates: [], data: [], requests: [], operations: [], resources: [], usage: {}, settings: {}, activeThreadId: null});
  if (path.startsWith('/api/agent-work/plan')) return json({extension: false, planId: 'plan-1'});
  if (path.startsWith('/api/agent-work/messages')) return json({messages: []});
  if (path.startsWith('/api/agent-work/inputs')) return json({inputs: []});
  if (path.startsWith('/api/agent-work')) {
    if (window.__failList) return json({error: {code: 'UNAVAILABLE', message: 'synthetic list failure'}}, 503);
    return json({enabled: true, works: [], budget: {reservedTokens: 0, spentTokens: 0, admitted: 0, completed: 0, failed: 0, cancelled: 0, interrupted: 0}, roles: {PLAN_READ: {available: true}, RESEARCH_READ: {available: true}, CODE_WORKTREE: {available: false, reason: 'no managed-worktree profile proof'}, QA: {available: false, reason: 'no verification capability proof'}}, resources: [{id: 'grant-1', label: 'fixture repo', writable: false}]});
  }
  if (path.startsWith('/api/commands')) {
    const body = JSON.parse(init.body);
    window.__sent.push(body);
    if (window.__failCreate) return json({error: {code: 'UNAVAILABLE', message: 'synthetic uncertain failure'}}, 503);
    return json({commandId: body.id, eventSeq: 1, result: {workId: body.payload.workId}});
  }
  return new Response('not found', {status: 404});
};
createRoot(document.getElementById('root')).render(<AgentWorkPanel threadId="thread-1" />);
`;

describe('AgentWorkPanel admission UI', () => {
  let browser: Browser, script: string;
  beforeAll(async () => {
    script = (await build({stdin: {contents: fixture, resolveDir: process.cwd(), loader: 'tsx'}, loader: {'.css': 'empty'}, bundle: true, write: false, format: 'iife', platform: 'browser', jsx: 'automatic', define: {'process.env.NODE_ENV': '"production"'}})).outputFiles[0]!.text;
    browser = await chromium.launch({headless: true, ...(process.platform === 'win32' ? {channel: 'msedge'} : {})});
  });
  afterAll(async () => { await browser?.close(); }, 45000);
  async function open(): Promise<Page> {
    const page = await browser.newPage();
    await page.setContent('<div id="root"></div>');
    await page.addScriptTag({content: script});
    return page;
  }

  it('keeps empty and failed states visible instead of hiding the panel', async () => {
    const page = await open();
    await expect(page.locator('.agents-disclosure')).toHaveText('Agent work · 0', {timeout: 8000});
    await page.locator('.agents-disclosure').click();
    await expect(page.getByText('No admitted agent work yet.')).toBeVisible();
    await page.evaluate(() => { (window as unknown as FixtureWindow).__failList = true; });
    await expect(page.getByRole('alert')).toContainText('synthetic list failure', {timeout: 8000});
    await expect(page.locator('.agents-work')).toBeVisible();
  });

  it('posts exactly one typed admission and retries uncertainty with the same durable identity', async () => {
    const page = await open();
    await page.locator('.agents-disclosure').click();
    await page.getByText('Admit agent work').click();
    await page.getByLabel('Resource access').getByRole('checkbox').check();
    await page.getByLabel('Token budget').fill('1000');
    await page.getByLabel('Minute budget').fill('10');
    await page.getByLabel('New work prompt').fill('Inspect the plan evidence');
    await page.evaluate(() => { (window as unknown as FixtureWindow).__failCreate = true; });
    await page.getByRole('button', {name: 'Admit work'}).click();
    await expect.poll(() => page.evaluate(() => (window as unknown as FixtureWindow).__sent.length), {timeout: 8000}).toBe(1);
    await page.evaluate(() => { (window as unknown as FixtureWindow).__failCreate = false; });
    await page.getByRole('button', {name: 'Admit work'}).click();
    await expect.poll(() => page.evaluate(() => (window as unknown as FixtureWindow).__sent.length)).toBe(2);
    const sent = await page.evaluate(() => (window as unknown as FixtureWindow).__sent);
    expect(sent[0]).toMatchObject({threadId: 'thread-1', type: 'agentWork.admit'});
    expect(sent[0].payload).toMatchObject({commandId: sent[0].id, role: 'PLAN_READ', prompt: 'Inspect the plan evidence', grantSubset: ['grant-1'], budget: {tokens: 1000, ms: 600000}});
    expect(sent[0].payload.expectedOutputSchema).toMatchObject({type: 'object'});
    expect(sent[0].payload.expectedOutputSchema.required).toEqual(expect.arrayContaining(['outcome', 'summary', 'evidenceRefs', 'requirementIds']));
    expect({id: sent[1].id, workId: sent[1].payload.workId, childThreadId: sent[1].payload.childThreadId}).toEqual({id: sent[0].id, workId: sent[0].payload.workId, childThreadId: sent[0].payload.childThreadId});
  });
});
