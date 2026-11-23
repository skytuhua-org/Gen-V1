import {afterEach, expect, it, vi} from 'vitest';
import {mkdtempSync, readSync, renameSync, rmSync, utimesSync, writeFileSync, lstatSync} from 'node:fs';
import {open, type FileHandle} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {Store} from '../packages/storage/store';
import {verificationPanelModel} from '../packages/core/verification-read-models';
import {computeAssessment} from '../packages/core/verification-gate';
import {sourceDigestSync} from '../packages/core/project-verification';
import type {CheckObservationV1, VerificationDeclarationV1, VisualObservationV1} from '../packages/contracts/verification';
import type {ToolEffectRecord, ToolOwner} from '../packages/contracts/tool-effects';

const cleanup: (() => void)[] = [];
afterEach(() => { for (const dispose of cleanup.splice(0).reverse()) dispose(); });
const owner: ToolOwner = {threadId: 't1', runId: 'r1', epoch: 1, projectId: 'p1', workspaceId: null, accountBinding: null};

vi.mock('node:fs', async importOriginal => {
  const fs = await importOriginal<typeof import('node:fs')>();
  return {...fs, readSync: vi.fn(fs.readSync)};
});

vi.mock('node:fs/promises', async importOriginal => {
  const fs = await importOriginal<typeof import('node:fs/promises')>();
  return {...fs, open: vi.fn(fs.open)};
});

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'verification-panel-'));
  cleanup.push(() => rmSync(root, {recursive: true, force: true}));
  const store = new Store(join(root, 'state'));
  cleanup.push(() => store.close());
  writeFileSync(join(root, 'app.ts'), 'export const version = 1;\n');
  writeFileSync(join(root, 'lock.yaml'), 'version: 1\n');
  const stamp = new Date().toISOString();
  const info = lstatSync(root, {bigint: true});
  store.internal('test.project', 't1', () => {
    store.put('workspaceProject', 'p1', null, {id: 'p1', name: 'Project', rootPath: root, authority: {kind: 'local'}, createdAt: stamp});
    store.put('workspaceProjectRoot', 'p1', null, {path: root, identity: {dev: String(info.dev), ino: String(info.ino)}});
    store.put('thread', 't1', 't1', {id: 't1', title: 'T', projectName: 'Project', projectId: 'p1', kind: 'main', createdAt: stamp, updatedAt: stamp, status: 'ready', modelId: 'test/model', sessionPath: null, runId: null, epoch: 1});
  });
  const declaration: VerificationDeclarationV1 = {version: 1, rootPath: root, sourceFiles: ['app.ts'], dependencyFiles: ['lock.yaml'], environmentId: 'test-host/node/pnpm', requirements: [{id: 'tests-pass', checkRefs: ['exec-1']}]};
  const observation: CheckObservationV1 = {version: 1, checkId: 'check-1', executionId: 'exec-1', owner, codeDigest: sourceDigestSync(root, declaration.sourceFiles), dependencyDigest: sourceDigestSync(root, declaration.dependencyFiles), recipeDigest: 'a'.repeat(64), environmentId: declaration.environmentId, argv: ['node', 'test.js'], cwdIdentity: root, phase: 'TEST', startedAt: stamp, endedAt: stamp, exitCode: 0, outcome: 'PASS', artifactRefs: [], observationKind: 'process'};
  const save = (observations = [observation], declared = true) => {
    const assessment = computeAssessment({threadId: 't1', sourceCut: {headSha: null, codeDigest: observation.codeDigest, dependencyDigest: observation.dependencyDigest, environmentId: declaration.environmentId}, requirements: declaration.requirements, observations, unresolvedEffects: [], verifierIdentity: 'service/r1', provenance: 'test fixture'});
    store.internal('test.fixture', 't1', () => {
      if (declared) store.put('verificationDeclaration', 't1', 't1', declaration);
      for (const value of observations) store.put('checkObservation', value.checkId, 't1', value);
      store.put('assessment', assessment.assessmentId, 't1', assessment);
    });
    return assessment;
  };
  return {root, store, declaration, observation, stamp, save};
}

it('reads declared source and dependencies without synchronous file reads', async () => {
  const f = fixture(); f.save();
  vi.mocked(readSync).mockClear();
  vi.mocked(open).mockClear();
  const model = await verificationPanelModel(f.store, 't1');
  expect(model.label).toBe('VERIFIED');
  expect(readSync).not.toHaveBeenCalled();
  expect(vi.mocked(open).mock.calls.map(([path]) => path)).toEqual([join(f.root, 'app.ts'), join(f.root, 'lock.yaml')]);
});

it.each(['app.ts', 'lock.yaml'])('discards a cut if %s is edited while a later dependency read is pending', async edited => {
  const f = fixture();
  writeFileSync(join(f.root, 'z-lock.yaml'), 'version: 1\n');
  f.declaration.dependencyFiles.push('z-lock.yaml');
  f.observation.dependencyDigest = sourceDigestSync(f.root, f.declaration.dependencyFiles);
  f.save();

  const originalOpen = (await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises')).open;
  let enterRead!: () => void, releaseRead!: () => void;
  const entered = new Promise<void>(resolve => {enterRead = resolve;});
  const held = new Promise<void>(resolve => {releaseRead = resolve;});
  vi.mocked(open).mockImplementationOnce(originalOpen).mockImplementationOnce(originalOpen).mockImplementationOnce(async (...args) => {
    const file = await originalOpen(...args);
    const read = file.read.bind(file);
    vi.spyOn(file, 'read').mockImplementationOnce(async (...readArgs) => {
      enterRead();
      await held;
      return Reflect.apply(read, undefined, readArgs);
    });
    return file;
  });

  const pending = verificationPanelModel(f.store, 't1');
  try {
    await Promise.race([entered, pending.then(() => {throw new Error('The panel returned before the dependency read was held.');})]);
    const path = join(f.root, edited);
    writeFileSync(path, edited === 'app.ts' ? 'export const version = 2;\n' : 'version: 2\n');
    utimesSync(path, 1_600_000_000, 1_600_000_000);
  } finally {
    releaseRead();
  }
  const model = await pending;
  expect(model.label).toBe('COMPLETED_UNVERIFIED');
  expect(model.rows[0]).toMatchObject({outcome: 'PASS', freshness: 'INDETERMINATE'});
  expect((await verificationPanelModel(f.store, 't1')).rows[0].freshness).toBe('STALE');
});

it('stops before hashing a source file replaced between path inspection and open', async () => {
  const f = fixture(); f.save();
  const originalOpen = (await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises')).open;
  const replacement = join(f.root, 'replacement.ts');
  writeFileSync(replacement, 'export const version = 1;\n');
  let read: ReturnType<typeof vi.spyOn> | undefined;
  vi.mocked(open).mockClear().mockImplementationOnce(async (...args) => {
    renameSync(replacement, join(f.root, 'app.ts'));
    const file = await originalOpen(...args);
    read = vi.spyOn(file, 'read');
    return file;
  });

  const model = await verificationPanelModel(f.store, 't1');
  expect(model.label).toBe('COMPLETED_UNVERIFIED');
  expect(model.rows[0].freshness).toBe('INDETERMINATE');
  expect(read).not.toHaveBeenCalled();
  expect(open).toHaveBeenCalledTimes(1);
});

it('rejects a source that changes during its own chunk read before opening dependencies', async () => {
  const f = fixture(); f.save();
  const originalOpen = (await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises')).open;
  vi.mocked(open).mockClear().mockImplementationOnce(async (...args) => {
    const file = await originalOpen(...args);
    const read = file.read.bind(file);
    vi.spyOn(file, 'read').mockImplementationOnce(async (...readArgs) => {
      const chunk = await Reflect.apply(read, undefined, readArgs);
      const path = join(f.root, 'app.ts');
      writeFileSync(path, 'export const version = 2;\n');
      utimesSync(path, 1_600_000_000, 1_600_000_000);
      return chunk;
    });
    return file;
  });

  const model = await verificationPanelModel(f.store, 't1');
  expect(model.label).toBe('COMPLETED_UNVERIFIED');
  expect(model.rows[0].freshness).toBe('INDETERMINATE');
  expect(open).toHaveBeenCalledTimes(1);
});

it('closes the current file and skips the dependency pass when cancelled after a chunk', async () => {
  const f = fixture(); f.save();
  const controller = new AbortController();
  const originalOpen = (await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises')).open;
  let handle: FileHandle | undefined;
  const afterRead = vi.fn(() => controller.abort());
  vi.mocked(open).mockClear().mockImplementationOnce(async (...args) => {
    handle = await originalOpen(...args);
    const read = handle.read.bind(handle);
    vi.spyOn(handle, 'read').mockImplementation(async (...readArgs) => {
      const chunk = await Reflect.apply(read, undefined, readArgs);
      afterRead();
      return chunk;
    });
    return handle;
  });
  await expect(verificationPanelModel(f.store, 't1', controller.signal)).rejects.toMatchObject({name: 'AbortError'});
  expect(afterRead).toHaveBeenCalledTimes(1);
  expect(handle?.fd).toBe(-1);
  expect(open).toHaveBeenCalledTimes(1);
});

it('keeps the current declaration unverified if its source basis changes during a read', async () => {
  const f = fixture(); f.save();
  const originalOpen = (await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises')).open;
  writeFileSync(join(f.root, 'alternate.ts'), 'export const version = 2;\n');
  vi.mocked(open).mockImplementationOnce(async (...args) => {
    const file = await originalOpen(...args);
    f.store.internal('test.new-basis', 't1', () => f.store.put('verificationDeclaration', 't1', 't1', {
      ...f.declaration, sourceFiles: ['alternate.ts'], requirements: [{id: 'new-requirement', checkRefs: ['exec-1']}],
    }));
    return file;
  });
  const model = await verificationPanelModel(f.store, 't1');
  expect(model.label).toBe('COMPLETED_UNVERIFIED');
  expect(model.rows[0]).toMatchObject({requirement: 'new-requirement', freshness: 'INDETERMINATE'});
  expect((await verificationPanelModel(f.store, 't1')).rows[0].freshness).toBe('STALE');
});

it('stops between passes when the thread loses its attested source authority', async () => {
  const f = fixture(); f.save();
  const originalOpen = (await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises')).open;
  vi.mocked(open).mockClear().mockImplementationOnce(async (...args) => {
    const file = await originalOpen(...args);
    f.store.internal('test.archive', 't1', () => f.store.put('archivedThread', 't1', null, true));
    return file;
  });
  const model = await verificationPanelModel(f.store, 't1');
  expect(model.label).toBe('COMPLETED_UNVERIFIED');
  expect(model.rows[0].freshness).toBe('INDETERMINATE');
  expect(open).toHaveBeenCalledTimes(1);
});

it('shows every check from a bound execution under its actual requirement', async () => {
  const f = fixture();
  f.save([{...f.observation, checkId: 'failed-build', phase: 'BUILD', outcome: 'FAIL', exitCode: 1}, {...f.observation, checkId: 'passed-cleanup', phase: 'TEARDOWN'}]);
  const model = await verificationPanelModel(f.store, 't1');
  expect(model.rows.filter(row => row.requirement === 'tests-pass').map(row => row.checkId)).toEqual(['failed-build', 'passed-cleanup']);
  expect(model.rows.filter(row => row.requirement === '—')).toEqual([]);
  expect(model.label).toBe('FAILED');
});

it('retains the recorded outcome while reporting changed source freshness separately', async () => {
  const f = fixture(); f.save();
  expect((await verificationPanelModel(f.store, 't1')).rows[0].freshness).toBe('CURRENT');
  writeFileSync(join(f.root, 'app.ts'), 'export const version = 2;\n');
  const model = await verificationPanelModel(f.store, 't1');
  expect(model.label).toBe('COMPLETED_UNVERIFIED');
  expect(model.rows[0]).toMatchObject({outcome: 'PASS', freshness: 'STALE'});
  expect(f.store.get<CheckObservationV1>('checkObservation', 'check-1')?.outcome).toBe('PASS');
});

it('does not infer current source freshness from a historical assessment without a declaration', async () => {
  const f = fixture(); const saved = f.save(undefined, false);
  expect(saved.label).toBe('VERIFIED');
  const model = await verificationPanelModel(f.store, 't1');
  expect(model.label).toBe('COMPLETED_UNVERIFIED');
  expect(model.rows[0]).toMatchObject({outcome: 'PASS', freshness: 'INDETERMINATE'});
  expect(model.summary.verified).toBe(0);
  expect(f.store.get<typeof saved>('assessment', saved.assessmentId)?.label).toBe('VERIFIED');
});

it('keeps an unavailable live source unverified even when a historical digest equals the fallback value', async () => {
  const f = fixture();
  f.observation.codeDigest = f.observation.dependencyDigest = '0'.repeat(64);
  f.save(); rmSync(join(f.root, 'app.ts'));
  const model = await verificationPanelModel(f.store, 't1');
  expect(model.label).toBe('COMPLETED_UNVERIFIED');
  expect(model.summary.verified).toBe(0);
  expect(model.rows[0].freshness).toBe('INDETERMINATE');
});

it('recomputes unresolved external effects instead of trusting the earlier completion snapshot', async () => {
  const f = fixture(); f.save();
  const effect: ToolEffectRecord = {effectId: 'effect-1', invocationId: 'effect-1', attemptId: 1, parentInvocationId: null, owner, toolId: 'external_write', definitionDigest: 'definition', privateArgumentCommitment: 'arguments', publicRedactedSummary: 'Write is not settled', targetPreconditions: [], approvalId: null, state: 'UNKNOWN_EXTERNAL_OUTCOME', providerReceiptRef: null, createdAt: f.stamp, updatedAt: f.stamp, threadId: 't1', transitions: [{from: 'DISPATCHED', to: 'UNKNOWN_EXTERNAL_OUTCOME', at: f.stamp}]};
  f.store.internal('test.effect', 't1', () => f.store.put('toolEffect', effect.invocationId, 't1', effect));
  expect((await verificationPanelModel(f.store, 't1')).label).toBe('BLOCKED');
  f.store.internal('test.effect', 't1', () => f.store.put('toolEffect', effect.invocationId, 't1', {...effect, state: 'SUCCEEDED'}));
  expect((await verificationPanelModel(f.store, 't1')).label).toBe('VERIFIED');
});

it('shows a missing reference even when another reference already has an observation', async () => {
  const f = fixture(); f.declaration.requirements[0].checkRefs.push('missing-check'); f.save();
  const model = await verificationPanelModel(f.store, 't1');
  expect(model.rows.some(row => row.requirement === 'tests-pass' && row.checkId === null && row.missing.some(value => value.includes('missing-check')))).toBe(true);
});

it('does not duplicate a check when both its check and execution are bound', async () => {
  const f = fixture(); f.declaration.requirements[0].checkRefs.push('check-1'); f.save();
  expect((await verificationPanelModel(f.store, 't1')).rows.filter(row => row.checkId === 'check-1')).toHaveLength(1);
});

it('retains exact execution details for bound and unbound observations without joining arguments', async () => {
  const f = fixture();
  f.observation.argv = ['node', 'checks/with spaces.mjs', '', 'a b', '"quoted"', 'line\nbreak', 'tail'.repeat(80)];
  f.observation.cwdIdentity = '/physical/workspace with spaces/dev=5/ino=39';
  f.observation.detail = 'Bounded recorded process detail.';
  f.save([f.observation, {...f.observation, checkId: 'unbound-check', executionId: 'unbound-execution'}]);
  const model = await verificationPanelModel(f.store, 't1');
  expect(model.rows).toHaveLength(2);
  for (const row of model.rows) expect(row.details).toEqual({
    argv: f.observation.argv, cwdIdentity: f.observation.cwdIdentity, codeDigest: f.observation.codeDigest,
    dependencyDigest: f.observation.dependencyDigest, recipeDigest: f.observation.recipeDigest,
    environmentId: f.observation.environmentId, startedAt: f.observation.startedAt, endedAt: f.observation.endedAt,
    exitCode: 0, observationKind: 'process', detail: f.observation.detail, visual: null,
  });
});

it('projects browser assertion details by their fields even when the observation kind is browser', async () => {
  const f = fixture();
  const visual = {checklistItemId: 'button-save', actionTraceId: 'trace-save', origin: 'http://127.0.0.1:4100', viewport: {width: 390, height: 844}, assertion: 'The save state is visible.', observed: 'The save state is hidden.', screenshotDigest: null};
  const observation: VisualObservationV1 = {...f.observation, observationKind: 'browser', phase: 'BROWSER', outcome: 'FAIL', exitCode: null, ...visual};
  f.save([]);
  f.store.internal('test.visual', 't1', () => f.store.put('visualObservation', observation.checkId, 't1', observation));
  const model = await verificationPanelModel(f.store, 't1');
  expect(model.rows[0].details).toMatchObject({observationKind: 'browser', exitCode: null, detail: null, visual});
  expect(model.rows[0]).toMatchObject({outcome: 'FAIL', freshness: 'CURRENT'});
});
