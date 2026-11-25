import { afterEach, expect, it, vi } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
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
  return { dir, post };
};

afterEach(async () => {
  while (cleanups.length) await cleanups.pop()!();
  while (dirs.length) await rm(dirs.pop()!, { recursive: true, force: true });
});

it.fails('seal binds the current preimage of each real target so a post-seal mutation conflicts', async () => {
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

it.fails('refuses a client-declared APPLIED without a host-verified write', async () => {
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

it.fails('scopes preview ownership to the streaming thread, not the whole project', async () => {
  const f = await fixture();
  const previewId = (await f.post({ command: 'begin', threadId: 'thread-a', schemaDigest })).json().previewId;
  await f.post({ command: 'append', previewId, chunk: args('a.ts', 'x') });
  // A different thread under the same project is a different owner and must
  // never see, seal, validate or settle the preview (M07-S07).
  const foreignSeal = await f.post({ command: 'seal', threadId: 'thread-b', previewId });
  expect(foreignSeal.statusCode).toBeGreaterThanOrEqual(400);
});

it.fails('cancelling the streaming run discards every preview it opened', async () => {
  const f = await fixture();
  const previewId = (await f.post({ command: 'begin', threadId: 'thread-a', schemaDigest })).json().previewId;
  await f.post({ command: 'append', previewId, chunk: args('a.ts', 'x') });
  // M07-S07: aborting the owning run must discard its previews; no append,
  // seal or settle may follow. No cancellation surface is wired today.
  await runtime.cancel({} as Parameters<RuntimeAdapter['cancel']>[0]);
  const after = await f.post({ command: 'append', previewId, chunk: 'x' });
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
