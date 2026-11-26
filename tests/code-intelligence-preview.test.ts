import { afterEach, expect, it, vi } from 'vitest';
import { lstat, mkdtemp, mkdir, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import Fastify from 'fastify';
import { Store } from '../packages/storage/store.ts';
import { Service } from '../packages/core/service.ts';
import type { RuntimeAdapter } from '../packages/contracts/index.ts';
import { registerCodeIntelligenceRoutes } from '../apps/server/code-intelligence-routes.ts';
import { CODE_INTELLIGENCE_LIMITS } from '../packages/contracts/code-intelligence.ts';

// M07 T02 route/service integration fixtures for issue #2021. The registry
// itself is proven by tests/edit-preview-v3.test.ts; these exercise the live
// POST /api/projects/:projectId/previews dispatch. The `it.fails` cases fail
// today for the stated route gaps and must be flipped to `it` by the fix:
// seal binds no preimage (beforeDigestFor returns null), settle trusts the
// client outcome, ownership is project-wide, and nothing discards on cancel.

const sha = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
const schemaDigest = sha('{"type":"object","properties":{"files":{}}}');
const args = (path: string, content: string) => JSON.stringify({ files: [{ path, content }] });
const projectId = 'project-1';
const url = `/api/projects/${projectId}/previews`;

const runtime: RuntimeAdapter = {
  configure: () => {}, models: vi.fn(async () => []), start: vi.fn(async () => {}),
  followUp: vi.fn(async () => {}), cancel: vi.fn(async () => {}), compact: vi.fn(async () => {}),
  history: vi.fn(async () => []), dispose: vi.fn(async () => {}),
};

const dirs: string[] = [];
const cleanups: Array<() => Promise<void>> = [];
const fixture = async () => {
  const dir = await mkdtemp(join(tmpdir(), 'harness-previews-'));
  dirs.push(dir);
  const app = Fastify();
  const store = new Store(dir);
  const service = new Service(store, runtime);
  // Seed the project binding the preview owner resolves against.
  const root = await realpath(dir);
  const info = await lstat(root, { bigint: true });
  const stamp = new Date().toISOString();
  store.internal('fixture.seed', null, () => {
    store.put('workspaceProject', projectId, null, { id: projectId, name: 'p', rootPath: root, authority: { kind: 'local' }, createdAt: stamp });
    store.put('workspaceProjectRoot', projectId, null, { path: root, identity: { dev: String(info.dev), ino: String(info.ino) } });
    for (const id of ['thread-a', 'thread-b'])
      store.put('thread', id, id, { id, title: id, projectName: 'p', projectId, kind: 'main', status: 'idle', epoch: 0, runId: null, modelId: null, sessionPath: null, createdAt: stamp, updatedAt: stamp });
  });
  cleanups.push(async () => {
    let failure: unknown;
    try { await app.close(); } catch (error) { failure ??= error; }
    try { await service.dispose(); } catch (error) { failure ??= error; }
    try { store.close(); } catch (error) { failure ??= error; }
    if (failure) throw failure;
  });
  registerCodeIntelligenceRoutes(app, service, { env: { HARNESS_FLAG_CODING_INTELLIGENCE_V1: '1' } });
  const post = (body: Record<string, unknown>) =>
    app.inject({ method: 'POST', url, payload: body });
  return { dir, root, post, service };
};

afterEach(async () => {
  while (cleanups.length) await cleanups.pop()!();
  while (dirs.length) await rm(dirs.pop()!, { recursive: true, force: true });
});

it('seal binds the current preimage of each real target so a post-seal mutation conflicts', async () => {
  const f = await fixture();
  await writeFile(join(f.dir, 'a.ts'), 'before');
  const previewId = (await f.post({ command: 'begin', schemaDigest })).json().previewId;
  await f.post({ command: 'append', previewId, chunk: args('a.ts', 'after') });
  const sealed = await f.post({ command: 'seal', previewId });
  // M07-S06/U02: the digest of the real pre-edit bytes must be recorded so a
  // post-seal mutation invalidates the approval instead of writing blindly.
  expect(sealed.json().targetFiles[0].beforeDigest).toBe(sha('before'));
  await writeFile(join(f.dir, 'a.ts'), 'third-party change');
  await f.post({ command: 'validate', previewId, finalArgumentsDigest: sha(args('a.ts', 'after')) });
  const settled = await f.post({ command: 'settle', previewId, outcome: 'APPLIED' });
  expect(settled.json().state).toBe('CONFLICT');
});

it('refuses a client-declared APPLIED without a host-verified write', async () => {
  const f = await fixture();
  const previewId = (await f.post({ command: 'begin', schemaDigest })).json().previewId;
  const raw = args('a.ts', 'after');
  await f.post({ command: 'append', previewId, chunk: raw });
  await f.post({ command: 'seal', previewId });
  await f.post({ command: 'validate', previewId, finalArgumentsDigest: sha(raw) });
  const settled = await f.post({ command: 'settle', previewId, outcome: 'APPLIED' });
  // M07-C02/U02: a client-supplied outcome is a claim, not an authorization.
  // The host may only reach APPLIED through an approved, verified write.
  const claimsApplied = settled.statusCode < 400 && settled.json().state === 'APPLIED';
  expect(claimsApplied).toBe(false);
});

it('scopes preview ownership to the streaming thread, not the whole project', async () => {
  const f = await fixture();
  const previewId = (await f.post({ command: 'begin', threadId: 'thread-a', schemaDigest })).json().previewId;
  await f.post({ command: 'append', threadId: 'thread-a', previewId, chunk: args('a.ts', 'x') });
  // A different thread under the same project is a different owner and must
  // never see, seal, validate or settle the preview (M07-S07).
  const foreignSeal = await f.post({ command: 'seal', threadId: 'thread-b', previewId });
  expect(foreignSeal.statusCode).toBeGreaterThanOrEqual(400);
});

it('settles APPLIED through an approved file.replace receipt that covers every target', async () => {
  const f = await fixture();
  await writeFile(join(f.dir, 'a.ts'), 'before');
  const previewId = (await f.post({ command: 'begin', threadId: 'thread-a', schemaDigest })).json().previewId;
  const raw = args('a.ts', 'after');
  await f.post({ command: 'append', threadId: 'thread-a', previewId, chunk: raw });
  await f.post({ command: 'seal', threadId: 'thread-a', previewId });
  await f.post({ command: 'validate', threadId: 'thread-a', previewId, finalArgumentsDigest: sha(raw) });
  // The approved write the receipt records, committed to the thread's ledger.
  const stamp = new Date().toISOString();
  f.service.store.internal('fixture.write', 'thread-a', () => {
    f.service.store.put('resource', 'res-1', 'thread-a', { id: 'res-1', threadId: 'thread-a', kind: 'project', path: f.root, label: 'p', writable: true, createdAt: stamp });
    f.service.store.put('operation', 'op-1', 'thread-a', { id: 'op-1', threadId: 'thread-a', revision: 1, kind: 'file.replace', description: 'replace a.ts', args: { resourceId: 'res-1', path: 'a.ts', content: 'after', expectedSha256: sha('before') }, resourceIds: ['res-1'], preconditions: { sha256: sha('before') }, status: 'succeeded', approved: true, createdAt: stamp });
  });
  await writeFile(join(f.dir, 'a.ts'), 'after');
  const settled = await f.post({ command: 'settle', threadId: 'thread-a', previewId, outcome: 'APPLIED', operationIds: ['op-1'] });
  expect(settled.statusCode).toBe(200);
  expect(settled.json().state).toBe('APPLIED');
});

it('rejects a receipt that resolves the same relative path under another grant', async () => {
  const f = await fixture();
  await writeFile(join(f.dir, 'a.ts'), 'before');
  const previewId = (await f.post({ command: 'begin', threadId: 'thread-a', schemaDigest })).json().previewId;
  const raw = args('a.ts', 'after');
  await f.post({ command: 'append', threadId: 'thread-a', previewId, chunk: raw });
  await f.post({ command: 'seal', threadId: 'thread-a', previewId });
  await f.post({ command: 'validate', threadId: 'thread-a', previewId, finalArgumentsDigest: sha(raw) });
  // Identical digests and path, but the grant resolves 'a.ts' under a
  // different root: the receipt never covered this workspace's file.
  const stamp = new Date().toISOString();
  const other = join(f.dir, 'other-root');
  await mkdir(other);
  await writeFile(join(other, 'a.ts'), 'after');
  f.service.store.internal('fixture.write', 'thread-a', () => {
    f.service.store.put('resource', 'res-2', 'thread-a', { id: 'res-2', threadId: 'thread-a', kind: 'project', path: other, label: 'q', writable: true, createdAt: stamp });
    f.service.store.put('operation', 'op-2', 'thread-a', { id: 'op-2', threadId: 'thread-a', revision: 1, kind: 'file.replace', description: 'replace a.ts', args: { resourceId: 'res-2', path: 'a.ts', content: 'after', expectedSha256: sha('before') }, resourceIds: ['res-2'], preconditions: { sha256: sha('before') }, status: 'succeeded', approved: true, createdAt: stamp });
  });
  const settled = await f.post({ command: 'settle', threadId: 'thread-a', previewId, outcome: 'APPLIED', operationIds: ['op-2'] });
  expect(settled.statusCode).toBeGreaterThanOrEqual(400);
});

it('does not fingerprint a target whose link escapes the project root', async () => {
  const f = await fixture();
  const outside = join(tmpdir(), `harness-preview-external-${Date.now()}.txt`);
  dirs.push(outside);
  await writeFile(outside, 'external preimage');
  await symlink(outside, join(f.dir, 'link.ts'));
  const previewId = (await f.post({ command: 'begin', threadId: 'thread-a', schemaDigest })).json().previewId;
  await f.post({ command: 'append', threadId: 'thread-a', previewId, chunk: args('link.ts', 'x') });
  const sealed = await f.post({ command: 'seal', threadId: 'thread-a', previewId });
  expect(sealed.statusCode).toBe(200);
  // A path leaving the granted root must keep its baseline unknown — never a
  // digest of bytes outside the project.
  expect(sealed.json().targetFiles[0].beforeDigest).toBeNull();
});

it('cancelling the streaming run discards every preview it opened', async () => {
  const f = await fixture();
  const previewId = (await f.post({ command: 'begin', threadId: 'thread-a', schemaDigest })).json().previewId;
  await f.post({ command: 'append', threadId: 'thread-a', previewId, chunk: args('a.ts', 'x') });
  // M07-S07: aborting the owning run must discard its previews; no append,
  // seal or settle may follow. Drive the real run.stop surface.
  f.service.store.internal('fixture.run', 'thread-a', () => f.service.store.put('thread', 'thread-a', 'thread-a', { ...f.service.store.get<import('../packages/contracts/index.ts').Thread>('thread', 'thread-a')!, runId: 'run-1', status: 'running' }));
  await f.service.command({ id: 'stop-1', type: 'run.stop', threadId: 'thread-a', payload: {} });
  const after = await f.post({ command: 'append', threadId: 'thread-a', previewId, chunk: 'x' });
  expect(after.statusCode).toBeGreaterThanOrEqual(400);
});

it('counts multi-byte characters toward the aggregate preview cap', async () => {
  const f = await fixture();
  const previewId = (await f.post({ command: 'begin', schemaDigest })).json().previewId;
  // 100 KiB of 'µ' is 200 KiB in UTF-8; a second 100 KiB chunk would exceed the
  // 256 KiB aggregate bound only when bytes, not characters, are counted.
  const first = await f.post({ command: 'append', previewId, chunk: 'µ'.repeat(100 * 1024) });
  expect(first.statusCode).toBe(200);
  const second = await f.post({
    command: 'append', previewId,
    chunk: 'x'.repeat(CODE_INTELLIGENCE_LIMITS.previewAggregateBytes - 200 * 1024 + 1),
  });
  expect(second.statusCode).toBeGreaterThanOrEqual(400);
  // The refusal is the byte bound, not malformed input.
  expect(JSON.stringify(second.json())).toMatch(/RESOURCE_LIMIT|byte bound/i);
});
