import {afterAll,beforeAll,describe,expect,it} from 'vitest';
import {build} from 'esbuild';
import {chromium,type Browser} from '@playwright/test';
import {createServer,type Server} from 'node:http';
import type {AddressInfo} from 'node:net';
import {formatNoteAge} from '../apps/web/src/TaskMemory';

describe('formatNoteAge relative buckets', () => {
  const now = new Date('2026-11-24T12:00:00Z').getTime();
  const iso = (ms: number) => new Date(now - ms).toISOString();
  it('reports just now under a minute and for invalid or future input', () => {
    expect(formatNoteAge(iso(59_000), now)).toBe('just now');
    expect(formatNoteAge(iso(0), now)).toBe('just now');
    expect(formatNoteAge('not-a-date', now)).toBe('');
    expect(formatNoteAge(new Date(now + 60_000).toISOString(), now)).toBe('just now');
  });
  it('reports minutes, hours and days at each boundary', () => {
    expect(formatNoteAge(iso(60_000), now)).toBe('1m ago');
    expect(formatNoteAge(iso(61_000), now)).toBe('1m ago');
    expect(formatNoteAge(iso(59 * 60_000), now)).toBe('59m ago');
    expect(formatNoteAge(iso(60 * 60_000), now)).toBe('1h ago');
    expect(formatNoteAge(iso(23 * 3_600_000), now)).toBe('23h ago');
    expect(formatNoteAge(iso(24 * 3_600_000), now)).toBe('1d ago');
    expect(formatNoteAge(iso(29 * 86_400_000), now)).toBe('29d ago');
  });
  it('falls back to a local-calendar date at and beyond 30 days', () => {
    const then = new Date(now - 40 * 86_400_000);
    const expected = `${then.getFullYear()}-${String(then.getMonth() + 1).padStart(2, '0')}-${String(then.getDate()).padStart(2, '0')}`;
    expect(formatNoteAge(then.toISOString(), now)).toBe(expected);
    expect(formatNoteAge(iso(30 * 86_400_000), now)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it('keeps the local date basis across local-midnight boundaries', () => {
    // A note saved 23:59 local yesterday and read 00:30 local today is 31
    // minutes old — '31m ago', not a date fallback.
    const localMidnight = new Date(); localMidnight.setHours(0, 30, 0, 0);
    const saved = new Date(localMidnight.getTime() - 31 * 60_000);
    expect(formatNoteAge(saved.toISOString(), localMidnight.getTime())).toBe('31m ago');
  });
});

let browser: Browser, server: Server, origin: string;
beforeAll(async () => {
  const bundle = await build({stdin: {resolveDir: process.cwd(), loader: 'tsx', contents: `
    import React from 'react';import {createRoot} from 'react-dom/client';
    import {TaskMemory} from './apps/web/src/TaskMemory';
    const note={id:'n1',threadId:'t1',key:'decision',content:'remember this',revision:2,author:'agent',updatedAt:new Date(Date.now()-2*3600*1000).toISOString()};
    const snapshot={memory:[note]};
    createRoot(document.getElementById('root')).render(<TaskMemory snapshot={snapshot} threadId="t1"/>);
  `}, bundle: true, write: false, platform: 'browser', format: 'iife', define: {'process.env.NODE_ENV': '"production"'}, loader: {'.css': 'empty'}});
  server = createServer((request, response) => { if (request.url === '/bundle.js') { response.setHeader('Content-Type', 'text/javascript'); response.end(bundle.outputFiles[0]!.text); } else { response.setHeader('Content-Type', 'text/html'); response.end('<!doctype html><div id="root"></div><script src="/bundle.js"></script>'); } });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve)); origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  browser = await chromium.launch({headless: true});
});
afterAll(async () => { await browser?.close(); if (server) await new Promise<void>(resolve => server.close(() => resolve())); });

it('renders author, separator and relative age with the ISO title on saved notes only', async () => {
  const page = await browser.newPage(); try {
    await page.goto(`${origin}/`);
    const header = page.locator('.memory-note header small');
    await expect.poll(() => header.innerText()).toContain('Agent note');
    expect(await header.innerText()).toContain('2h ago');
    const stamp = header.locator('span[title]');
    expect(await stamp.count()).toBe(1);
    expect(await stamp.getAttribute('title')).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    // Only the saved note renders a timestamp; the collapsed create form has none.
    expect(await page.locator('.memory-note').count()).toBe(1);
    expect(await page.locator('.memory-note header small span[title]').count()).toBe(1);
  } finally { await page.close(); }
});
