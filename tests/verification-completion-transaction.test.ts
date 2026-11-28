import {afterEach, beforeEach, expect, it, vi} from 'vitest';
import {lstatSync, mkdirSync, mkdtempSync, readSync, rmSync, utimesSync, writeFileSync} from 'node:fs';
import {open} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {Store} from '../packages/storage/store';
import {Service} from '../packages/core/service';
import {sourceDigestSync} from '../packages/core/project-verification';
import type {RuntimeAdapter, Thread} from '../packages/contracts';
import type {CheckObservationV1, DeliverableAssessmentV1, VerificationDeclarationV1} from '../packages/contracts/verification';

vi.mock('node:fs', async importOriginal => {
  const fs = await importOriginal<typeof import('node:fs')>();
  return {...fs, readSync: vi.fn(fs.readSync)};
});

vi.mock('node:fs/promises', async importOriginal => {
  const fs = await importOriginal<typeof import('node:fs/promises')>();
  return {...fs, open: vi.fn(fs.open)};
});

beforeEach(async () => {
  const fs = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises');
  vi.mocked(open).mockImplementation(fs.open);
});

const cleanup: (() => void | Promise<void>)[] = [];
afterEach(async () => {
  for (const dispose of cleanup.splice(0).reverse()) await dispose();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const ctx = {threadId: 't1', runId: 'run-current', epoch: 3};

function fixture() {
  vi.stubEnv('HARNESS_FLAG_VERIFICATION_WORKFLOW_V1', '1');
  const directory = mkdtempSync(join(tmpdir(), 'verification-completion-'));
  cleanup.push(() => rmSync(directory, {recursive: true, force: true}));
  const root = join(directory, 'project');
  mkdirSync(root);
  writeFileSync(join(root, 'app.ts'), 'export const version = 1;\n');
  writeFileSync(join(root, 'lock.yaml'), 'version: 1\n');
  const store = new Store(join(directory, 'state'));
  cleanup.push(() => store.close());
  const runtime: RuntimeAdapter = {configure: () => {}, models: async () => [], start: async () => {}, followUp: async () => {}, cancel: async () => {}, compact: async () => {}, history: async () => [], dispose: async () => {}};
  const service = new Service(store, runtime, {});
  cleanup.push(() => service.dispose());
  const stamp = new Date().toISOString();
  const physical = lstatSync(root, {bigint: true});
  const thread: Thread = {id: ctx.threadId, title: 'Verification', projectName: 'Project', projectId: 'p1', accountId: null, kind: 'main', mode: 'build', status: 'working', createdAt: stamp, updatedAt: stamp, modelId: 'test/model', sessionPath: null, runId: ctx.runId, epoch: ctx.epoch};
  const declaration: VerificationDeclarationV1 = {version: 1, rootPath: root, sourceFiles: ['app.ts'], dependencyFiles: ['lock.yaml'], environmentId: 'test/node/pnpm', requirements: [{id: 'app-works', checkRefs: ['execution-1']}]};
  const observation: CheckObservationV1 = {version: 1, checkId: 'check-1', executionId: 'execution-1', owner: {threadId: ctx.threadId, runId: 'run-evidence', epoch: 1, projectId: 'p1', workspaceId: null, accountBinding: null}, codeDigest: sourceDigestSync(root, declaration.sourceFiles), dependencyDigest: sourceDigestSync(root, declaration.dependencyFiles), recipeDigest: 'a'.repeat(64), environmentId: declaration.environmentId, argv: ['node', 'test.js'], cwdIdentity: root, phase: 'TEST', startedAt: stamp, endedAt: stamp, exitCode: 0, outcome: 'PASS', artifactRefs: [], observationKind: 'process'};
  store.internal('test.fixture', ctx.threadId, () => {
    store.put('thread', thread.id, thread.id, thread);
    store.put('workspaceProject', 'p1', null, {id: 'p1', name: 'Project', rootPath: root, authority: {kind: 'local'}, createdAt: stamp});
    store.put('workspaceProjectRoot', 'p1', null, {path: root, identity: {dev: String(physical.dev), ino: String(physical.ino)}});
    store.put('verificationDeclaration', thread.id, thread.id, declaration);
    store.put('checkObservation', observation.checkId, thread.id, observation);
  });
  const finish = async (commandId = 'finish-1') => {
    await service.tool({name: 'task_finish', args: {commandId, outcome: 'done'}}, ctx);
    return store.all<DeliverableAssessmentV1>('assessment', thread.id).at(-1)!;
  };
  return {root, store, service, thread, declaration, observation, finish};
}

it('prepares declared source digests outside the completion write transaction', async () => {
  const f = fixture();
  const originalOpen = (await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises')).open;
  const openedInTransaction: string[] = [];
  vi.mocked(open).mockImplementation(async (...args) => {
    if (f.store.inTransaction) openedInTransaction.push(String(args[0]));
    return originalOpen(...args);
  });
  vi.mocked(readSync).mockClear();

  const assessment = await f.finish();

  expect(assessment.label).toBe('VERIFIED');
  expect(assessment.sourceCut.codeDigest).toBe(f.observation.codeDigest);
  expect(assessment.sourceCut.dependencyDigest).toBe(f.observation.dependencyDigest);
  expect(readSync).not.toHaveBeenCalled();
  expect(openedInTransaction).toEqual([]);
});

it('marks completion evidence explicit when an ordinary edit lands before the write', async () => {
  const f = fixture();
  const originalCommand = f.store.command.bind(f.store);
  vi.spyOn(f.store, 'command').mockImplementation((command, apply) => originalCommand(command, () => {
    const edited = join(f.root, 'app.ts');
    writeFileSync(edited, 'export const version = 2; // ordinary edit\n');
    utimesSync(edited, 1_600_000_000, 1_600_000_000);
    return apply();
  }));

  const assessment = await f.finish();

  expect(assessment.label).toBe('COMPLETED_UNVERIFIED');
  expect(assessment.requirements[0].missing.join('\n')).toContain('completion source evidence changed before the completion write');
  expect(f.store.get('checkObservation', f.observation.checkId)).toEqual(f.observation);
});

it('does not reuse prepared evidence when the declaration changes before the write', async () => {
  const f = fixture();
  const originalCommand = f.store.command.bind(f.store);
  vi.spyOn(f.store, 'command').mockImplementation((command, apply) => originalCommand(command, () => {
    f.store.put('verificationDeclaration', ctx.threadId, ctx.threadId, {...f.declaration, requirements: [{id: 'replacement-requirement', checkRefs: ['execution-1']}]});
    return apply();
  }));

  const assessment = await f.finish();

  expect(assessment.label).toBe('COMPLETED_UNVERIFIED');
  expect(assessment.requirements[0].id).toBe('replacement-requirement');
  expect(assessment.requirements[0].missing.join('\n')).toContain('completion source evidence changed before the completion write');
});

it('keeps independent store work responsive while a completion digest read is pending', async () => {
  const f = fixture();
  const originalOpen = (await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises')).open;
  let enterRead!: () => void, releaseRead!: () => void;
  const entered = new Promise<void>(resolve => {enterRead = resolve;});
  const held = new Promise<void>(resolve => {releaseRead = resolve;});
  vi.mocked(open).mockImplementationOnce(async (...args) => {
    const file = await originalOpen(...args);
    const read = file.read.bind(file);
    vi.spyOn(file, 'read').mockImplementationOnce(async (...readArgs) => {
      enterRead();
      await held;
      return Reflect.apply(read, undefined, readArgs);
    });
    return file;
  });

  const pending = f.finish();
  try {
    await Promise.race([
      entered,
      new Promise<void>((_resolve, reject) => setTimeout(() => reject(new Error('completion did not begin an asynchronous digest read')), 500)),
    ]);
    const independent = f.store.internal('test.independent', ctx.threadId, () => {
      f.store.put('thread', f.thread.id, f.thread.id, {...f.thread, updatedAt: 'independent-store-write'});
      return 'written';
    });
    expect(independent).toBe('written');
  } finally {
    releaseRead();
  }

  const assessment = await pending;
  expect(assessment.label).toBe('VERIFIED');
  expect(f.store.get<Thread>('thread', f.thread.id)?.updatedAt).toBe('independent-store-write');
});

it('returns one completion receipt without duplicating the finish or assessment', async () => {
  const f = fixture();
  const first = await f.service.tool({name: 'task_finish', args: {commandId: 'finish-repeat', outcome: 'done'}}, ctx);
  const second = await f.service.tool({name: 'task_finish', args: {commandId: 'finish-repeat', outcome: 'done'}}, ctx);

  expect(second).toEqual(first);
  expect(f.store.all('finish', ctx.threadId)).toHaveLength(1);
  expect(f.store.all('assessment', ctx.threadId)).toHaveLength(1);
});

it('keeps unreadable completion evidence explicit', async () => {
  const f = fixture();
  rmSync(join(f.root, 'app.ts'));

  const assessment = await f.finish();

  expect(assessment.label).toBe('COMPLETED_UNVERIFIED');
  expect(assessment.requirements[0].missing.join('\n')).toContain('completion source evidence is unreadable or invalid');
});

it('keeps invalid completion source authority explicit', async () => {
  const f = fixture();
  f.store.internal('test.invalid-root', ctx.threadId, () => f.store.put('thread', ctx.threadId, ctx.threadId, {...f.thread, projectId: 'missing-project'}));

  const assessment = await f.finish();

  expect(assessment.label).toBe('COMPLETED_UNVERIFIED');
  expect(assessment.requirements[0].missing.join('\n')).toContain('completion source evidence authority is invalid');
});

it('aborts completion instead of writing evidence when the run is cancelled during preparation', async () => {
  const f = fixture();
  const controller = new AbortController();
  (f.service as unknown as {aborts: Map<string, AbortController>}).aborts.set(ctx.threadId, controller);
  controller.abort();

  await expect(f.service.tool({name: 'task_finish', args: {commandId: 'finish-cancelled', outcome: 'done'}}, ctx)).rejects.toMatchObject({name: 'AbortError'});
  expect(f.store.all('finish', ctx.threadId)).toHaveLength(0);
  expect(f.store.all('assessment', ctx.threadId)).toHaveLength(0);
});
