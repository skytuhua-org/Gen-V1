import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Store } from '../packages/storage/store.ts';
import type { ProjectTools } from '../packages/workspace/tools.ts';
import { TerminalHost } from '../packages/workspace/terminal.ts';
import { normalizeTerminalName, terminalNameHasForbidden, TERMINAL_NAME_MAX, TERMINAL_NAME_RAW_MAX } from '../packages/contracts/terminal-session.ts';
import { HarnessError } from '../packages/contracts/index.ts';

const cleanups: (() => void)[] = [];
afterEach(() => { for (const cleanup of cleanups.splice(0)) cleanup(); });

const spawned = vi.hoisted(() => [] as { onData: (cb: (data: string) => void) => void; onExit: (cb: (event: { exitCode: number }) => void) => void; write: ReturnType<typeof vi.fn>; resize: ReturnType<typeof vi.fn>; kill: ReturnType<typeof vi.fn>; emitExit: (code: number) => void }[]);

vi.mock('node-pty', () => ({
  spawn: vi.fn(() => {
    const exitCallbacks: ((event: { exitCode: number }) => void)[] = [];
    const pty = {
      onData: () => {},
      onExit: (cb: (event: { exitCode: number }) => void) => { exitCallbacks.push(cb); },
      write: vi.fn(), resize: vi.fn(),
      kill: vi.fn(() => { for (const cb of exitCallbacks) cb({ exitCode: 0 }); }),
      emitExit: (exitCode: number) => { for (const cb of exitCallbacks) cb({ exitCode }); },
    };
    spawned.push(pty);
    return pty;
  }),
}));

function fixture() {
  const dataDir = mkdtempSync(join(tmpdir(), 'harness-termname-')), root = mkdtempSync(join(tmpdir(), 'harness-termname-proj-'));
  const store = new Store(dataDir);
  cleanups.push(() => { store.close(); rmSync(dataDir, { recursive: true, force: true }); rmSync(root, { recursive: true, force: true }); });
  const projects = { store, binding: vi.fn(async () => ({ project: { id: 'project-a', name: 'Project', rootPath: root, authority: { kind: 'local' as const }, createdAt: '2026-01-01T00:00:00Z' }, path: root })) };
  spawned.length = 0;
  const host = new TerminalHost(projects as unknown as ProjectTools);
  cleanups.push(() => void host.dispose().catch(() => {}));
  return { host, store, projects, root };
}

const openInput = { projectId: 'project-a', threadId: 'thread-a', environment: {} as Record<string, string> };
const rename = (name: unknown) => ({ type: 'rename', name });

describe('terminal-session contract normalization (#1640 T02)', () => {
  it('trims and accepts interior spaces, emoji and CJK; maps blank to null', () => {
    expect(normalizeTerminalName('  API  ')).toBe('API');
    expect(normalizeTerminalName('My  Tests  🚀')).toBe('My  Tests  🚀');
    expect(normalizeTerminalName('   ')).toBeNull();
    expect(normalizeTerminalName('')).toBeNull();
    expect(normalizeTerminalName('Terminal')).toBe('Terminal');
  });
  it('enforces the 64 code point normalized boundary, not UTF-16 units', () => {
    expect(normalizeTerminalName('a'.repeat(TERMINAL_NAME_MAX))).toBe('a'.repeat(TERMINAL_NAME_MAX));
    expect(normalizeTerminalName('a'.repeat(TERMINAL_NAME_MAX + 1))).toBeUndefined();
    expect(normalizeTerminalName('🚀'.repeat(TERMINAL_NAME_MAX))).toBe('🚀'.repeat(TERMINAL_NAME_MAX));
  });
  it('rejects raw input over 256 UTF-16 units', () => {
    expect(normalizeTerminalName(' '.repeat(TERMINAL_NAME_RAW_MAX - TERMINAL_NAME_MAX) + 'b'.repeat(TERMINAL_NAME_MAX))).toBe('b'.repeat(TERMINAL_NAME_MAX));
    expect(normalizeTerminalName('b'.repeat(TERMINAL_NAME_RAW_MAX + 1))).toBeUndefined();
  });
  it('rejects forbidden code points anywhere, generated not embedded', () => {
    const cases = [0x00, 0x09, 0x0a, 0x1f, 0x7f, 0x85, 0x9f, 0x2028, 0x2029, 0x202a, 0x202d, 0x202e, 0x2066, 0x2068, 0x2069];
    for (const cp of cases) {
      const bad = `x${String.fromCodePoint(cp)}y`;
      expect(terminalNameHasForbidden(bad), `cp ${cp.toString(16)}`).toBe(true);
      expect(normalizeTerminalName(bad), `cp ${cp.toString(16)}`).toBeUndefined();
      expect(normalizeTerminalName(`  ${String.fromCodePoint(cp)}  `), `edge cp ${cp.toString(16)}`).toBeUndefined();
    }
  });
  it('rejects lone surrogates, accepts valid pairs', () => {
    expect(normalizeTerminalName('bad\uD800')).toBeUndefined();
    expect(normalizeTerminalName('bad\uDC00')).toBeUndefined();
    expect(normalizeTerminalName('ok 𝄞')).toBe('ok 𝄞');
  });
  it('does not accept non-strings', () => {
    expect(normalizeTerminalName(42 as unknown as string)).toBeUndefined();
    expect(normalizeTerminalName(null as unknown as string)).toBeUndefined();
  });
});

describe('TerminalHost rename command (#1640 T02)', () => {
  it('renames, revises, persists and reports on read; no PTY calls', async () => {
    const { host, store } = fixture();
    const opened = await host.open(openInput);
    expect(opened).toMatchObject({ name: null, nameRevision: 0 });
    const saved = await host.command(opened.id, 'project-a', 'thread-a', rename('API'));
    expect(saved).toMatchObject({ name: 'API', nameRevision: 1 });
    const pty = spawned[0];
    expect(pty.write).not.toHaveBeenCalled();
    expect(pty.resize).not.toHaveBeenCalled();
    expect(pty.kill).not.toHaveBeenCalled();
    const row = store.get<{ name?: string; nameRevision?: number }>('terminalSession', opened.id);
    expect(row).toMatchObject({ name: 'API', nameRevision: 1 });
    const read = await host.read(opened.id, 'project-a', 'thread-a');
    expect(read).toMatchObject({ name: 'API', nameRevision: 1 });
  });
  it('treats a same-name save as a no-op without incrementing the revision', async () => {
    const { host } = fixture();
    const opened = await host.open(openInput);
    await host.command(opened.id, 'project-a', 'thread-a', rename('API'));
    const again = await host.command(opened.id, 'project-a', 'thread-a', rename('API'));
    expect(again).toMatchObject({ name: 'API', nameRevision: 1 });
  });
  it('blank name resets to null with one revision bump', async () => {
    const { host } = fixture();
    const opened = await host.open(openInput);
    await host.command(opened.id, 'project-a', 'thread-a', rename('API'));
    const reset = await host.command(opened.id, 'project-a', 'thread-a', rename('   '));
    expect(reset).toMatchObject({ name: null, nameRevision: 2 });
  });
  it('rejects invalid names without mutating metadata', async () => {
    const { host } = fixture();
    const opened = await host.open(openInput);
    await expect(host.command(opened.id, 'project-a', 'thread-a', rename('x'.repeat(65)))).rejects.toBeInstanceOf(HarnessError);
    await expect(host.command(opened.id, 'project-a', 'thread-a', rename('a\nb'))).rejects.toBeInstanceOf(HarnessError);
    await expect(host.command(opened.id, 'project-a', 'thread-a', rename(12))).rejects.toThrow();
    const read = await host.read(opened.id, 'project-a', 'thread-a');
    expect(read).toMatchObject({ name: null, nameRevision: 0 });
  });
  it('rejects rename on ended and foreign sessions', async () => {
    const { host } = fixture();
    const opened = await host.open(openInput);
    spawned[0].emitExit(0);
    await expect(host.command(opened.id, 'project-a', 'thread-a', rename('API'))).rejects.toMatchObject({ code: 'TERMINAL_ENDED' });
    const live = await host.open(openInput);
    await expect(host.command(live.id, 'other-project', 'thread-a', rename('API'))).rejects.toMatchObject({ code: 'CAPABILITY_DENIED' });
    await expect(host.command('missing-id', 'project-a', 'thread-a', rename('API'))).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
  it('preserves name through exit and host recovery', async () => {
    const { host, store, root } = fixture();
    const opened = await host.open(openInput);
    await host.command(opened.id, 'project-a', 'thread-a', rename('API'));
    spawned[0].emitExit(7);
    const row = store.get<{ name?: string; nameRevision?: number }>('terminalSession', opened.id);
    expect(row).toMatchObject({ exited: true, name: 'API', nameRevision: 1 });
    // restart: recovered rows keep metadata
    const host2 = new TerminalHost({ store, binding: async () => ({ project: {}, path: root }) } as unknown as ProjectTools);
    cleanups.push(() => void host2.dispose().catch(() => {}));
    await expect(host2.command(opened.id, 'project-a', 'thread-a', rename('Other'))).rejects.toMatchObject({ code: 'TERMINAL_ENDED' });
  });
});
