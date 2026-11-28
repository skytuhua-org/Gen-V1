import { spawn, type ChildProcess } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import type { BrowserServer, Page } from '@playwright/test';
import { beforeEach, expect, it, vi } from 'vitest';
import { recordWindow } from '../../scripts/review-capture.ts';

vi.mock('node:child_process', () => ({ spawn: vi.fn() }));
beforeEach(() => vi.resetAllMocks());

function mockCaptureProcesses() {
  vi.mocked(spawn).mockImplementation((executable) => {
    const child = Object.assign(new EventEmitter(), {
      stdin: new PassThrough(),
      stdout: new PassThrough(),
      stderr: new PassThrough(),
    }) as EventEmitter & { stdin: PassThrough; stdout: PassThrough; stderr: PassThrough };
    if (executable === 'ffprobe') {
      child.stdin.resume();
      queueMicrotask(() => {
        child.stdout.end(JSON.stringify({ streams: [], format: {} }));
        child.emit('close', 0);
      });
    } else {
      child.stdin.resume();
      child.stdin.once('finish', () => child.emit('close', 0));
    }
    return child as unknown as ChildProcess;
  });
}

function fixturePage(options: { existingCursor?: boolean } = {}) {
  const calls: string[] = [];
  const session = {
    on() {},
    async send(method: string) { calls.push(method); },
    async detach() { calls.push('detach'); },
  };
  const page = {
    async bringToFront() {},
    context() { return { async newCDPSession() { calls.push('newCDPSession'); return session; } }; },
    async screenshot() { return Buffer.from('fixture'); },
    async addInitScript() { calls.push('install-init-script'); },
    async evaluate() { calls.push('evaluate'); return options.existingCursor === true; },
  } as unknown as Page;
  return { page, calls };
}

async function finish(stop: () => Promise<unknown>) {
  await stop();
}

it('preserves synthetic cursor installation for callers that omit options', async () => {
  mockCaptureProcesses();
  const { page, calls } = fixturePage();
  const stop = await recordWindow({} as BrowserServer, page, 'fixture.mp4');
  await finish(stop);
  expect(calls).toContain('install-init-script');
  expect(calls.filter(call => call === 'evaluate')).toHaveLength(1);
});

it('installs no cursor init script or cursor evaluation in none mode', async () => {
  mockCaptureProcesses();
  const { page, calls } = fixturePage();
  const stop = await recordWindow({} as BrowserServer, page, 'fixture.mp4', { cursor: 'none' });
  await finish(stop);
  expect(calls).not.toContain('install-init-script');
  expect(calls.filter(call => call === 'evaluate')).toHaveLength(1);
});

it('rejects a none-mode recording when the page already has the review cursor', async () => {
  mockCaptureProcesses();
  const { page, calls } = fixturePage({ existingCursor: true });
  await expect(recordWindow({} as BrowserServer, page, 'fixture.mp4', { cursor: 'none' })).rejects.toThrow('already instrumented');
  expect(calls).not.toContain('newCDPSession');
  expect(spawn).not.toHaveBeenCalled();
});

it('rejects none mode on a page already used for synthetic recording', async () => {
  mockCaptureProcesses();
  const { page, calls } = fixturePage();
  const stop = await recordWindow({} as BrowserServer, page, 'first.mp4');
  await finish(stop);
  await expect(recordWindow({} as BrowserServer, page, 'second.mp4', { cursor: 'none' })).rejects.toThrow('already instrumented');
  expect(calls.filter(call => call === 'newCDPSession')).toHaveLength(1);
});
