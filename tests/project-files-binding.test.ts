import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { lstat, mkdir, mkdtemp, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { Store } from '../packages/storage/store.ts';
import { ProjectTools, type WorkspaceBinding } from '../packages/workspace/tools.ts';
import { withPathGuard } from '../packages/core/file-access.ts';
import type { Thread } from '../packages/contracts/index.ts';

// Portable binding-protocol tests. Store, ordinary files, reads and identity
// checks are real. The native custody guard is mocked, not qualified here.
vi.mock('../packages/core/file-access.ts', async original => ({
  ...await original<typeof import('../packages/core/file-access.ts')>(),
  withPathGuard: vi.fn<typeof withPathGuard>(async (_paths, signal, action) => {
    signal.throwIfAborted(); return action([]);
  }),
}));
const cleanup: (() => Promise<void>)[] = [];
beforeEach(() => {
  vi.mocked(withPathGuard).mockImplementation(async (_paths, signal, action) => {
    signal.throwIfAborted(); return action([]);
  });
});
afterEach(async () => { for (const close of cleanup.splice(0).reverse()) await close(); });
const identity = async (path: string) => {
  const info = await lstat(path, { bigint: true });
  return { dev: String(info.dev), ino: String(info.ino) };
};
async function fixture(managed = false) {
  const root = await mkdtemp(join(tmpdir(), 'gen-files-binding-'));
  const path = join(root, 'a'), next = join(root, 'b');
  await mkdir(path); await mkdir(next);
  await writeFile(join(path, 'one.txt'), 'old checkout');
  await writeFile(join(next, 'one.txt'), 'new checkout');
  const store = new Store(join(root, 'data')), tools = new ProjectTools(store);
  cleanup.push(async () => { await tools.dispose(); store.close(); await rm(root, { recursive: true, force: true }); });
  const receipt = await tools.connect({ id: 'connect', type: 'workspace.project.connect', payload: { name: 'Files', path } });
  const projectId = (receipt.result as { projects: { id: string }[] }).projects[0]!.id;
  const thread = (id: string): Thread => ({ id, title: id, projectId, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', status: 'ready', epoch: 0, runId: null, modelId: null, sessionPath: null, kind: 'main' });
  store.internal('fixture', null, () => { store.put('thread', 'one', 'one', thread('one')); store.put('thread', 'two', 'two', thread('two')); });
  const bind = async (boundPath: string) => {
    const captured = await identity(boundPath);
    store.internal('fixture', null, () => {
      if (!managed) store.put('workspaceProjectRoot', projectId, null, { path: boundPath, identity: captured });
      else {
        const binding: WorkspaceBinding = { id: 'copy-one', threadId: 'one', projectId, path: boundPath, branch: 'fixture', gitDirectory: join(boundPath, '.git'), commonDirectory: join(boundPath, '.git'), identity: captured, gitDirectoryIdentity: captured, commonDirectoryIdentity: captured };
        store.put('workspaceBinding', binding.id, 'one', binding);
        store.put('thread', 'one', 'one', { ...thread('one'), workspaceId: binding.id });
      }
    });
  };
  if (managed) await bind(path);
  return { root, path, next, store, tools, projectId, bind };
}

it('keeps the binding stable across content edits and folder browsing', async () => {
  const f = await fixture(); await mkdir(join(f.path, 'nested'));
  const first = await f.tools.files(f.projectId, 'one');
  await writeFile(join(f.path, 'one.txt'), 'updated bytes');
  expect((await f.tools.file(f.projectId, 'one', 'one.txt')).bindingId).toBe(first.bindingId);
  expect((await f.tools.files(f.projectId, 'one', 'nested')).bindingId).toBe(first.bindingId);
});
it('binds the opaque preview identity to the admitted thread', async () => {
  const f = await fixture();
  expect((await f.tools.files(f.projectId, 'one')).bindingId).not.toBe((await f.tools.files(f.projectId, 'two')).bindingId);
});
it('changes the binding when the enrolled path changes without changing its inode', async () => {
  const f = await fixture(), first = await f.tools.files(f.projectId, 'one');
  const moved = join(f.root, 'moved'); await rename(f.path, moved); await f.bind(moved);
  expect((await f.tools.files(f.projectId, 'one')).bindingId).not.toBe(first.bindingId);
});
for (const managed of [false, true]) for (const read of ['file', 'folder'] as const) {
  it(`refuses a ${managed ? 'managed' : 'legacy'} ${read} response when binding changes during the guarded read`, async () => {
    const f = await fixture(managed);
    vi.mocked(withPathGuard).mockImplementationOnce(async (_paths, signal, action) => {
      signal.throwIfAborted(); const result = await action([]); await f.bind(f.next); return result;
    });
    const pending = read === 'file' ? f.tools.file(f.projectId, 'one', 'one.txt') : f.tools.files(f.projectId, 'one');
    await expect(pending).rejects.toMatchObject({ code: 'FILES_BINDING_CHANGED' });
  });
}
