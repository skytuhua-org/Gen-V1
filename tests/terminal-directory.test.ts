import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Store } from '../packages/storage/store.ts';
import type { ProjectTools } from '../packages/workspace/tools.ts';
import { TerminalHost } from '../packages/workspace/terminal.ts';
import {
	containsGuardMarker,
	terminalDirectoryPathSchema,
	terminalDirectoryProofs,
	type DirectoryProofSubject,
} from '../packages/workspace/terminal-directory.ts';

const cleanups: (() => void)[] = [];
afterEach(() => { for (const cleanup of cleanups.splice(0)) cleanup(); });

const spawnMock = vi.hoisted(() => vi.fn());
vi.mock('node-pty', () => ({
	spawn: spawnMock,
}));

// The native directory guard (Linux broker / Windows PowerShell) is platform
// custody; unit tests pin the seam and verify our orchestration inside it.
vi.mock('../packages/core/file-access.ts', () => ({
	withPathGuard: vi.fn(async (_paths: unknown, _signal: unknown, action: (m: readonly unknown[]) => Promise<unknown>) => action([])),
}));

function fakePty() {
	const exitCallbacks: ((event: { exitCode: number }) => void)[] = [];
	return {
		onData: vi.fn(),
		onExit: (cb: (event: { exitCode: number }) => void) => { exitCallbacks.push(cb); },
		write: vi.fn(), resize: vi.fn(),
		kill: vi.fn(() => { for (const cb of exitCallbacks) cb({ exitCode: 0 }); }),
	};
}

function fixture() {
	const dataDir = mkdtempSync(join(tmpdir(), 'harness-terminal-'));
	const root = mkdtempSync(join(tmpdir(), 'harness-project-'));
	mkdirSync(join(root, 'packages', 'demo app'), { recursive: true });
	mkdirSync(join(root, 'katalog-żółw'), { recursive: true });
	mkdirSync(join(root, '.git', 'objects'), { recursive: true });
	symlinkSync(join(root, 'packages'), join(root, 'linked'));
	const store = new Store(dataDir);
	cleanups.push(() => { store.close(); rmSync(dataDir, { recursive: true, force: true }); rmSync(root, { recursive: true, force: true }); });
	const binding = { project: { id: 'project-a' }, path: root };
	const projects = {
		store,
		binding: vi.fn(async () => binding),
		terminalDirectoryStamp: vi.fn(() => 'stamp-1'),
	};
	spawnMock.mockReset();
	spawnMock.mockImplementation(() => fakePty());
	const host = new TerminalHost(projects as unknown as ProjectTools);
	cleanups.push(() => void host.dispose().catch(() => {}));
	return { host, store, projects, root, binding };
}

const owner = { projectId: 'project-a', threadId: 'thread-a' };
async function mint(root: string, path: string, overrides: Partial<DirectoryProofSubject> = {}) {
	const { lstatSync } = await import('node:fs');
	const info = lstatSync(join(root, path || '.'), { bigint: true });
	return terminalDirectoryProofs().mint({
		projectId: 'project-a', threadId: 'thread-a', bindingStamp: 'stamp-1',
		path, dev: String(info.dev), ino: String(info.ino), ...overrides,
	});
}

describe('terminalDirectoryPathSchema', () => {
	it('accepts root, nested, space and Unicode paths; rejects traversal and metadata', () => {
		for (const ok of ['', 'packages', 'packages/demo app', 'katalog-żółw', "o'clock/dir"]) {
			expect(terminalDirectoryPathSchema.safeParse(ok).success, ok).toBe(true);
		}
		for (const bad of ['../etc', '/abs', 'a//b', 'a/./b', 'a/../b', '.git', '.git/x', '.GIT/x', '.harness-directory-guard', 'a\\b', 'a:b', 'aux', 'name.', 'name ', ' a', '\u202ax', '\u2066x']) {
			expect(terminalDirectoryPathSchema.safeParse(bad).success, bad).toBe(false);
		}
		expect(terminalDirectoryPathSchema.safeParse('a'.repeat(1025)).success).toBe(false);
	});
	it('marks guard metadata regardless of case and depth', () => {
		expect(containsGuardMarker('x/.Git/y')).toBe(true);
		expect(containsGuardMarker('x/plain/y')).toBe(false);
	});
});

describe('terminalDirectoryProofs', () => {
	const subject = { projectId: 'p', threadId: 't', bindingStamp: 's', path: 'a', dev: '1', ino: '2' };
	it('verifies a minted proof and rejects tampering and expiry', () => {
		const proofs = terminalDirectoryProofs();
		const proof = proofs.mint(subject);
		expect(proof.length).toBeLessThanOrEqual(128);
		expect(proofs.verify(proof, subject)).toBe(true);
		expect(proofs.verify(proof + 'x', subject)).toBe(false);
		expect(proofs.verify(proof, { ...subject, path: 'b' })).toBe(false);
		expect(proofs.verify(proof, { ...subject, projectId: 'p2' })).toBe(false);
		expect(proofs.verify(proof, { ...subject, threadId: undefined })).toBe(false);
		expect(proofs.verify(proof, { ...subject, dev: '9' })).toBe(false);
		expect(proofs.verify(proof, { ...subject, bindingStamp: 'other' })).toBe(false);
		const old = proofs.mint(subject, Date.now() - 11 * 60 * 1000);
		expect(proofs.verify(old, subject)).toBe(false);
		expect(proofs.verify('v1.zzzz.' + 'a'.repeat(43), subject)).toBe(false);
	});
});

describe('TerminalHost directory launch', () => {
	const dir = (path: string, proof: string) => ({ ...owner, terminalId: 'term-dir-1', directory: { path, proof } });

	it('spawns exactly once with the selected folder as native cwd and zero injected bytes', async () => {
		const { host, root } = fixture();
		const proof = await mint(root, 'packages/demo app');
		const result = await host.open(dir('packages/demo app', proof));
		expect(result.id).toBe('term-dir-1');
		expect(spawnMock).toHaveBeenCalledTimes(1);
		const [call] = spawnMock.mock.calls;
		expect(call?.[2]?.cwd).toBe(join(root, 'packages/demo app'));
		expect(call?.[2]?.name).toBe('xterm-256color');
		expect(spawnMock.mock.results[0]!.value.write).not.toHaveBeenCalled();
		// identical retry returns the same session without a second spawn
		const again = await host.open(dir('packages/demo app', proof));
		expect(again.id).toBe(result.id);
		expect(spawnMock).toHaveBeenCalledTimes(1);
	});

	it('opens the root through a proof for the empty relative path', async () => {
		const { host, root } = fixture();
		const proof = await mint(root, '');
		await host.open(dir('', proof));
		expect(spawnMock.mock.calls[0]?.[2]?.cwd).toBe(root);
	});

	it('supports Unicode directories', async () => {
		const { host, root } = fixture();
		const proof = await mint(root, 'katalog-żółw');
		await host.open(dir('katalog-żółw', proof));
		expect(spawnMock.mock.calls[0]?.[2]?.cwd).toBe(join(root, 'katalog-żółw'));
	});

	it('spawns nothing for missing, linked, escaped or metadata paths', async () => {
		const { host, root } = fixture();
		await expect(host.open(dir('missing-dir', 'v1.x.y'))).rejects.toMatchObject({ code: 'CAPABILITY_DENIED' });
		const linkedProof = await mint(root, 'linked');
		await expect(host.open(dir('linked', linkedProof))).rejects.toMatchObject({ code: 'CAPABILITY_DENIED' });
		await expect(host.open(dir('../escape', 'v1.x.y'))).rejects.toThrow();
		await expect(host.open(dir('.git/objects', 'v1.x.y'))).rejects.toThrow();
		expect(spawnMock).not.toHaveBeenCalled();
	});

	it('rejects forged, foreign-owner and expired proofs', async () => {
		const { host, root } = fixture();
		const good = await mint(root, 'packages/demo app');
		await expect(host.open(dir('packages/demo app', good.slice(0, -1) + (good.endsWith('A') ? 'B' : 'A')))).rejects.toMatchObject({ code: 'CAPABILITY_DENIED' });
		const foreign = await mint(root, 'packages/demo app', { projectId: 'project-b' });
		await expect(host.open(dir('packages/demo app', foreign))).rejects.toMatchObject({ code: 'CAPABILITY_DENIED' });
		const stale = await (async () => {
			const { lstatSync } = await import('node:fs');
			const info = lstatSync(join(root, 'packages/demo app'), { bigint: true });
			return terminalDirectoryProofs().mint({ projectId: 'project-a', threadId: 'thread-a', bindingStamp: 'stamp-1', path: 'packages/demo app', dev: String(info.dev), ino: String(info.ino) }, Date.now() - 11 * 60 * 1000);
		})();
		await expect(host.open(dir('packages/demo app', stale))).rejects.toMatchObject({ code: 'CAPABILITY_DENIED' });
		expect(spawnMock).not.toHaveBeenCalled();
	});

	it('denies the same ID with a different selection and joins identical concurrent starts', async () => {
		const { host, root } = fixture();
		const proof = await mint(root, 'packages/demo app');
		const [a, b] = await Promise.all([host.open(dir('packages/demo app', proof)), host.open(dir('packages/demo app', proof))]);
		expect(a.id).toBe(b.id);
		expect(spawnMock).toHaveBeenCalledTimes(1);
		const other = await mint(root, 'katalog-żółw');
		await expect(host.open({ ...dir('katalog-żółw', other), terminalId: 'term-dir-1' })).rejects.toMatchObject({ code: 'CAPABILITY_DENIED' });
		// and a plain open must not attach to the directory session
		await expect(host.open({ ...owner, terminalId: 'term-dir-1' })).rejects.toMatchObject({ code: 'CAPABILITY_DENIED' });
	});

	it('fails closed when the binding changes before spawn', async () => {
		const { host, root, projects, binding } = fixture();
		const proof = await mint(root, 'packages/demo app');
		let calls = 0;
		projects.binding.mockImplementation(async () => (++calls > 1 ? { ...binding, path: root + '-moved' } : binding) as never);
		await expect(host.open(dir('packages/demo app', proof))).rejects.toMatchObject({ code: 'WORKSPACE_CHANGED' });
		expect(spawnMock).not.toHaveBeenCalled();
	});

	it('kills the spawned process and frees the ID when registration fails', async () => {
		const { host, root, store } = fixture();
		const proof = await mint(root, 'packages/demo app');
		vi.spyOn(store, 'put').mockImplementationOnce(() => { throw new Error('disk full'); });
		await expect(host.open(dir('packages/demo app', proof))).rejects.toThrow();
		const pty = spawnMock.mock.results[0]!.value;
		expect(pty.kill).toHaveBeenCalled();
		// the id is not stuck: a fresh identical attempt starts cleanly
		await host.open(dir('packages/demo app', proof));
		expect(spawnMock).toHaveBeenCalledTimes(2);
	});

	it('reads and stops a directory session by owner like a normal terminal', async () => {
		const { host, root } = fixture();
		const proof = await mint(root, 'packages/demo app');
		await host.open(dir('packages/demo app', proof));
		const read = await host.read('term-dir-1', 'project-a', 'thread-a');
		expect(read.exited).toBe(false);
		const stopped = await host.command('term-dir-1', 'project-a', 'thread-a', { type: 'stop' });
		expect(stopped.exited).toBe(true);
		await expect(host.open(dir('packages/demo app', proof))).rejects.toMatchObject({ code: 'TERMINAL_ENDED' });
	});
});
