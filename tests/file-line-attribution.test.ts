import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { Store } from '../packages/storage/store.ts';
import { ProjectTools } from '../packages/workspace/tools.ts';
import { withPathGuard } from '../packages/core/file-access.ts';
import type { LineAttributionPreview } from '../packages/contracts/file-line-attribution.ts';

// The path guard is mocked to the real manifest entries it would capture; files,
// byte reads, Git and ProjectTools.binding are real.
vi.mock('../packages/core/file-access.ts', async original => ({
  ...await original<typeof import('../packages/core/file-access.ts')>(),
  withPathGuard: vi.fn<typeof withPathGuard>(async (paths, signal, action) => {
    signal.throwIfAborted();
    const manifest = [];
    const push = async (path: string) => {
      const stat = await fs.lstat(path, { bigint: true });
      manifest.push({ path, directory: stat.isDirectory(), dev: String(stat.dev), ino: String(stat.ino), size: Number(stat.size) });
    };
    for (const entry of paths) {
      try {
        // Tree captures (Git metadata imports) manifest every covered file;
        // other guards contribute only their own path.
        if (entry.leaf === false && (entry as { tree?: boolean }).tree !== true) continue;
        if (entry.leaf !== false) await push(entry.path);
        if (entry.leaf === false) {
          const walk = async (dir: string) => {
            for (const item of await fs.readdir(dir, { withFileTypes: true })) {
              const path = join(dir, item.name);
              await push(path);
              if (item.isDirectory()) await walk(path);
            }
          };
          if ((await fs.stat(entry.path)).isDirectory()) await walk(entry.path);
        }
      } catch { /* Missing leaves produce no manifest entry. */ }
    }
    return action(manifest);
  }),
}));

// The native directory guard is a host runtime fixture, not the custody under
// test; it is stubbed to admit the requested namespace.
vi.mock('../packages/core/linux-path-guard.ts', () => ({
  withLinuxDirectoryGuard: async (paths: { path: string; leaf: boolean }[], _signal: AbortSignal, action: (session: unknown, entries: unknown[]) => Promise<unknown>) =>
    action({ exited: false, loss: new Set(), rpc: async () => [] }, []),
}));

const cleanup: (() => Promise<void>)[] = [];
beforeEach(() => {
  vi.mocked(withPathGuard).mockClear();
});
afterEach(async () => {
  vi.restoreAllMocks();
  for (const close of cleanup.splice(0).reverse()) await close();
});

const git = (cwd: string, args: string[], env: NodeJS.ProcessEnv = {}) =>
  execFileSync('git', ['-c', 'core.autocrlf=false', ...args], { cwd, env: { ...process.env, ...env }, encoding: 'utf8' });

const ADA = { GIT_AUTHOR_NAME: 'Ada Fixture', GIT_AUTHOR_EMAIL: 'ada@fixture.test', GIT_AUTHOR_DATE: '2024-01-02T13:00:00+01:00', GIT_COMMITTER_NAME: 'Ada Fixture', GIT_COMMITTER_EMAIL: 'ada@fixture.test', GIT_COMMITTER_DATE: '2024-01-02T13:00:00+01:00' };
const BO = { GIT_AUTHOR_NAME: 'Bo Fixture', GIT_AUTHOR_EMAIL: 'bo@fixture.test', GIT_AUTHOR_DATE: '2024-01-03T02:30:00-05:00', GIT_COMMITTER_NAME: 'Bo Fixture', GIT_COMMITTER_EMAIL: 'bo@fixture.test', GIT_COMMITTER_DATE: '2024-01-03T02:30:00-05:00' };

async function fixture() {
  const root = await fs.mkdtemp(join(tmpdir(), 'gen-line-attribution-')), path = join(root, 'repo'), store = new Store(join(root, 'data'));
  await fs.mkdir(path);
  git(path, ['init']);
  await fs.writeFile(join(path, 'example.txt'), 'stable\nold\n\n');
  git(path, ['add', 'example.txt']);
  git(path, ['commit', '-m', 'Initial sample'], ADA);
  const sha1 = git(path, ['rev-parse', 'HEAD']).trim();
  await fs.writeFile(join(path, 'example.txt'), 'stable\nnew\n\n');
  git(path, ['add', 'example.txt']);
  git(path, ['commit', '-m', 'Revise sample'], BO);
  const sha2 = git(path, ['rev-parse', 'HEAD']).trim();
  const projects = new ProjectTools(store), receipt = await projects.connect({ id: 'connect', type: 'workspace.project.connect', payload: { name: 'Attribution', path } });
  const projectId = (receipt.result as { projects: { id: string }[] }).projects[0]!.id;
  cleanup.push(async () => { await projects.dispose(); store.close(); await fs.rm(root, { recursive: true, force: true }); });
  const preview = async (path2: string) => (await projects.file(projectId, undefined, path2)) as { sha256: string; lineAttribution: LineAttributionPreview };
  const lookup = async (path2: string, line: number, file?: Awaited<ReturnType<typeof preview>>) => {
    const read = file ?? (await preview(path2));
    const proof = read.lineAttribution.kind === 'eligible' ? read.lineAttribution.previewProof : 'missing';
    return projects.fileLineAttribution(projectId, { path: path2, previewSha256: read.sha256, previewProof: proof, line });
  };
  return { root, path, store, projects, projectId, sha1, sha2, preview, lookup };
}

describe('file line attribution host custody', () => {
  it('marks an eligible preview and attributes exact lines to their commits', async () => {
    const f = await fixture();
    const read = await f.preview('example.txt');
    expect(read.lineAttribution).toMatchObject({ kind: 'eligible', lineCount: 3, previewProof: expect.stringMatching(/^v1\.[A-Za-z0-9_-]{43}$/) });
    expect(await f.lookup('example.txt', 1, read)).toEqual({ kind: 'attributed', sha: f.sha1, author: 'Ada Fixture', authorDateUtc: '2024-01-02T12:00:00.000Z', subject: 'Initial sample' });
    expect(await f.lookup('example.txt', 2, read)).toEqual({ kind: 'attributed', sha: f.sha2, author: 'Bo Fixture', authorDateUtc: '2024-01-03T07:30:00.000Z', subject: 'Revise sample' });
    expect(await f.lookup('example.txt', 3, read)).toEqual({ kind: 'attributed', sha: f.sha1, author: 'Ada Fixture', authorDateUtc: '2024-01-02T12:00:00.000Z', subject: 'Initial sample' });
    expect(await f.lookup('example.txt', 4, read)).toEqual({ kind: 'unavailable', reason: 'line_unavailable' });
  });
  it('rejects a stale digest or wrong proof before running Git', async () => {
    const f = await fixture(), read = await f.preview('example.txt');
    expect(read.lineAttribution.kind).toBe('eligible');
    const proof = read.lineAttribution.kind === 'eligible' ? read.lineAttribution.previewProof : '';
    expect(await f.projects.fileLineAttribution(f.projectId, { path: 'example.txt', previewSha256: 'b'.repeat(64), previewProof: proof, line: 1 })).toEqual({ kind: 'unavailable', reason: 'stale' });
    expect(await f.projects.fileLineAttribution(f.projectId, { path: 'example.txt', previewSha256: read.sha256, previewProof: 'v1.' + 'a'.repeat(43), line: 1 })).toEqual({ kind: 'unavailable', reason: 'stale' });
    const replayed = await f.preview('example.txt');
    const other = new ProjectTools(f.store);
    cleanup.push(() => other.dispose());
    // A different process secret must not replay this preview's proof.
    const foreign = await other.file(f.projectId, undefined, 'example.txt');
    expect(foreign.lineAttribution.kind).toBe('eligible');
    if (replayed.lineAttribution.kind === 'eligible' && foreign.lineAttribution.kind === 'eligible') expect(foreign.lineAttribution.previewProof).not.toBe(replayed.lineAttribution.previewProof);
    expect(replayed.lineAttribution).toEqual(read.lineAttribution);
  });
  it('reports changed when the working copy no longer equals the pinned blob', async () => {
    const f = await fixture();
    await fs.writeFile(join(f.path, 'example.txt'), 'stable\nnew\n\nmore\n');
    expect(await f.lookup('example.txt', 1)).toEqual({ kind: 'unavailable', reason: 'changed' });
  });
  it('reports untracked for paths missing from the pinned HEAD tree', async () => {
    const f = await fixture();
    await fs.writeFile(join(f.path, 'draft.txt'), 'not committed\n');
    expect(await f.lookup('draft.txt', 1)).toEqual({ kind: 'unavailable', reason: 'untracked' });
  });
  it('reports binary and empty files without reaching Git blame', async () => {
    const f = await fixture();
    await fs.writeFile(join(f.path, 'blob.bin'), Buffer.from([0x01, 0x00, 0x02]));
    const binary = await f.preview('blob.bin');
    expect(binary.lineAttribution).toEqual({ kind: 'unavailable', reason: 'binary' });
    await fs.writeFile(join(f.path, 'empty.txt'), '');
    const empty = await f.preview('empty.txt');
    expect(empty.lineAttribution).toEqual({ kind: 'unavailable', reason: 'empty' });
  });
  it('leaves the source, index and refs untouched by a lookup', async () => {
    const f = await fixture();
    const refsBefore = git(f.path, ['show-ref']).trim(), statusBefore = git(f.path, ['status', '--porcelain=v1', '-z']).trim();
    await f.lookup('example.txt', 1);
    expect(git(f.path, ['show-ref']).trim()).toBe(refsBefore);
    expect(git(f.path, ['status', '--porcelain=v1', '-z']).trim()).toBe(statusBefore);
  });
});
