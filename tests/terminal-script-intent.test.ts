import { afterEach, expect, it, vi } from 'vitest';
import { lstat, mkdir, mkdtemp, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildServer } from '../apps/server/server.ts';
import { workspaceHost } from '../apps/server/workspace-host.ts';
import type { RuntimeAdapter } from '../packages/contracts/index.ts';
import { environmentSettingsFor } from '../packages/core/environment-settings.ts';
import { Service } from '../packages/core/service.ts';
import { TerminalHost } from '../packages/workspace/terminal.ts';
import { Store } from '../packages/storage/store.ts';
import { deferred } from './fixtures/deferred.ts';

const native = vi.hoisted(() => ({ spawn: vi.fn(), write: vi.fn() }));
vi.mock('node-pty', () => ({ spawn: native.spawn }));

const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const close of cleanup.splice(0)) await close();
  vi.restoreAllMocks();
  native.spawn.mockReset();
  native.write.mockReset();
});

async function fixture() {
  const dir = await mkdtemp(join(tmpdir(), 'gen-terminal-script-'));
  const projectPath = join(await realpath(dir), 'project');
  await mkdir(projectPath);
  const identity = await lstat(projectPath, { bigint: true });
  const store = new Store(join(dir, 'profile'));
  const runtime: RuntimeAdapter = {
    configure() {}, async models() { return []; }, async start() {}, async followUp() {},
    async cancel() {}, async compact() {}, async dispose() {}, async history() { return []; },
  };
  const service = new Service(store, runtime);
  store.internal('fixture', null, () => {
    store.put('workspaceProject', 'project-a', null, {
      id: 'project-a', name: 'Fixture project', rootPath: projectPath, authority: { kind: 'local' },
      createdAt: '2026-01-01T00:00:00Z',
    });
    store.put('workspaceProjectRoot', 'project-a', null, {
      path: projectPath, identity: { dev: String(identity.dev), ino: String(identity.ino) },
    });
    for (const id of ['thread-a', 'thread-b']) {
      store.put('thread', id, id, { id, projectId: 'project-a', kind: 'main', epoch: 1 });
    }
    store.put('projectScript', 'script-a', null, { projectId: 'project-a', command: 'echo fixture' });
  });
  vi.spyOn(environmentSettingsFor(store.dataDir), 'resolve').mockResolvedValue({});
  native.spawn.mockImplementation(() => {
    let exit: ((event: { exitCode: number }) => void) | undefined;
    return {
      onData() {}, onExit(callback: typeof exit) { exit = callback; },
      write: native.write, kill() { exit?.({ exitCode: 0 }); },
    };
  });
  const app = await buildServer(service, { port: 4317, dev: true });
  cleanup.push(async () => {
    try { await app.close(); await service.dispose(); }
    finally { store.close(); await rm(dir, { recursive: true, force: true, maxRetries: 5 }); }
  });
  const host = '127.0.0.1:4317';
  const bootstrap = await app.inject({ url: '/api/bootstrap', headers: { host } });
  const headers = { host, cookie: String(bootstrap.headers['set-cookie']).split(';')[0], 'x-harness-csrf': bootstrap.json().csrfToken };
  const run = (threadId = 'thread-a') => app.inject({
    method: 'POST', url: '/api/projects/project-a/actions', headers,
    payload: { id: 'operation-a', type: 'run-script', threadId, payload: { scriptId: 'script-a' } },
  });
  const advanceThread = () => store.internal('fixture.thread-advance', 'thread-a', () => {
    store.put('thread', 'thread-a', 'thread-a', { id: 'thread-a', projectId: 'project-a', kind: 'main', epoch: 2 });
  });
  return { run, advanceThread, store, host: workspaceHost(service) };
}

it('replays a settled run-script operation without starting or writing a second terminal', async () => {
  const { run } = await fixture();
  const first = await run();
  const repeated = await run();
  expect(first.statusCode).toBe(200);
  expect(first.json()).toMatchObject({ projectId: 'project-a', threadId: 'thread-a' });
  expect(repeated.statusCode).toBe(200);
  expect(repeated.json().id).toBe(first.json().id);
  expect(native.spawn).toHaveBeenCalledOnce();
  expect(native.write.mock.calls).toEqual([['echo fixture\r']]);
});

it('rejects an operation id reused by a different thread without sending another write', async () => {
  const { run } = await fixture();
  expect((await run()).statusCode).toBe(200);
  const foreign = await run('thread-b');
  expect(foreign.json().error).toMatchObject({ code: 'DUPLICATE_COMMAND' });
  expect(native.write).toHaveBeenCalledOnce();
});

it('rejects a changed thread generation before opening or writing the terminal', async () => {
  const { run, store, advanceThread } = await fixture();
  const preparing = deferred<void>(), release = deferred<Record<string, string>>();
  vi.mocked(environmentSettingsFor(store.dataDir).resolve).mockImplementationOnce(() => {
    preparing.resolve();
    return release.promise;
  });
  const request = run();
  await preparing.promise;
  advanceThread();
  release.resolve({});
  expect((await request).json().error).toMatchObject({ code: 'CAPABILITY_DENIED' });
  expect(native.spawn).not.toHaveBeenCalled();
  expect(native.write).not.toHaveBeenCalled();
});

it('does not retry a run-script operation whose terminal write could not be confirmed', async () => {
  const { run } = await fixture();
  native.write.mockImplementationOnce(() => { throw new Error('Synthetic PTY write failure'); });
  expect((await run()).json().error).toMatchObject({ code: 'ACTION_UNCERTAIN' });
  expect((await run()).json().error).toMatchObject({ code: 'ACTION_UNCERTAIN' });
  expect(native.spawn).toHaveBeenCalledOnce();
  expect(native.write).toHaveBeenCalledOnce();
});


it('resolves a settled operation after the terminal host restarts without another write', async () => {
  const { run, host } = await fixture();
  const first = await run();
  expect(first.statusCode).toBe(200);
  await host.terminals.dispose();
  const restarted = new TerminalHost(host.projects);
  const receipt = await restarted.runScript('project-a', 'thread-a', 'script-a', 'operation-a');
  expect(receipt).toMatchObject({ id: first.json().id, exited: true });
  expect(native.spawn).toHaveBeenCalledOnce();
  expect(native.write).toHaveBeenCalledOnce();
});

it('blocks an in-flight duplicate and settles the original operation once', async () => {
  const { run, store } = await fixture();
  const preparing = deferred<void>(), release = deferred<Record<string, string>>();
  vi.mocked(environmentSettingsFor(store.dataDir).resolve).mockImplementationOnce(() => {
    preparing.resolve();
    return release.promise;
  });
  const first = run();
  await preparing.promise;
  try {
    expect((await run()).json().error).toMatchObject({ code: 'ACTION_UNCERTAIN' });
    expect(native.write).not.toHaveBeenCalled();
  } finally {
    release.resolve({});
  }
  const settled = await first;
  expect(settled.statusCode).toBe(200);
  expect((await run()).json().id).toBe(settled.json().id);
  expect(native.spawn).toHaveBeenCalledOnce();
  expect(native.write).toHaveBeenCalledOnce();
});

it('rechecks the thread generation after native startup and before sending the script', async () => {
  const { run, advanceThread } = await fixture();
  const spawn = native.spawn.getMockImplementation()!;
  native.spawn.mockImplementationOnce((...args) => {
    const pty = spawn(...args);
    advanceThread();
    return pty;
  });
  expect((await run()).json().error).toMatchObject({ code: 'CAPABILITY_DENIED' });
  expect(native.spawn).toHaveBeenCalledOnce();
  expect(native.write).not.toHaveBeenCalled();
});

it('keeps a pending stored script fenced when terminal host shutdown starts', async () => {
  const { run, store, host } = await fixture();
  const preparing = deferred<void>(), release = deferred<Record<string, string>>();
  vi.mocked(environmentSettingsFor(store.dataDir).resolve).mockImplementationOnce(() => {
    preparing.resolve();
    return release.promise;
  });
  const pending = run();
  await preparing.promise;
  try {
    await host.terminals.dispose();
  } finally {
    release.resolve({});
  }
  const first = await pending;
  expect(first.json().error).toMatchObject({ code: 'HOST_CLOSING' });
  expect((await run()).json().error).toEqual(first.json().error);
  expect(native.spawn).not.toHaveBeenCalled();
  expect(native.write).not.toHaveBeenCalled();
});


it('replays a confirmed spawn rejection without exposing native details or retrying', async () => {
  const { run, host } = await fixture();
  native.spawn.mockImplementationOnce(() => { throw new Error('synthetic native detail'); });
  const first = await run(), replay = await run();
  expect(first.json().error).toEqual({
    code: 'TERMINAL_START_FAILED', message: 'The terminal could not start. The script was not sent.',
  });
  expect(replay.json().error).toEqual(first.json().error);
  await host.terminals.dispose();
  const restarted = new TerminalHost(host.projects);
  await expect(restarted.runScript('project-a', 'thread-a', 'script-a', 'operation-a')).rejects.toMatchObject(first.json().error);
  expect(native.spawn).toHaveBeenCalledOnce();
  expect(native.write).not.toHaveBeenCalled();
});

it('replays a confirmed exit before write as a terminal-ended result', async () => {
  const { run } = await fixture();
  native.spawn.mockReturnValueOnce({
    onExit(callback: (event: { exitCode: number }) => void) { callback({ exitCode: 0 }); },
    onData() {},
  });
  const first = await run(), replay = await run();
  expect(first.json().error).toMatchObject({ code: 'TERMINAL_ENDED' });
  expect(replay.json().error).toEqual(first.json().error);
  expect(native.spawn).toHaveBeenCalledOnce();
  expect(native.write).not.toHaveBeenCalled();
});

it('keeps a confirmed rejection uncertain when its durable settlement fails', async () => {
  const { run, store } = await fixture();
  const internal = store.internal.bind(store);
  vi.spyOn(store, 'internal').mockImplementation((type, ...args) => {
    if (type === 'project.script.not-applied') throw new Error('synthetic store failure');
    return internal(type, ...args);
  });
  native.spawn.mockImplementationOnce(() => { throw new Error('synthetic spawn failure'); });
  expect((await run()).json().error).toMatchObject({ code: 'ACTION_UNCERTAIN' });
  expect((await run()).json().error).toMatchObject({ code: 'ACTION_UNCERTAIN' });
  expect(native.spawn).toHaveBeenCalledOnce();
  expect(native.write).not.toHaveBeenCalled();
});
