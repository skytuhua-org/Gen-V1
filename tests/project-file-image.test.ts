import { afterEach, expect, it, vi } from 'vitest';
import { link, mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { type RuntimeAdapter } from '../packages/contracts/index.ts';
import { Store } from '../packages/storage/store.ts';
import { Service } from '../packages/core/service.ts';
import { withPathGuard } from '../packages/core/file-access.ts';
import { buildServer } from '../apps/server/server.ts';
import { workspaceHost } from '../apps/server/workspace-host.ts';
import { ProjectTools } from '../packages/workspace/tools.ts';

// The real authenticated Fastify server, host binding and filesystem reads are used.
// The native guard edge is simulated here; platform behavior is tested in the host suite.
vi.mock('../packages/core/file-access.ts', async original => ({
  ...await original<typeof import('../packages/core/file-access.ts')>(),
  withPathGuard: vi.fn<typeof withPathGuard>(async (_paths, signal, action) => { signal.throwIfAborted(); return action([]); }),
}));
vi.mock('node-pty', () => ({ spawn: () => { throw new Error('Image reads must not spawn a terminal.'); } }));
const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => { vi.restoreAllMocks(); for (const close of cleanup.splice(0).reverse()) await close(); });

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const pngChunk = (type: string, data: Buffer) => { const head = Buffer.alloc(8); head.writeUInt32BE(data.length, 0); head.write(type, 4, 'latin1'); return Buffer.concat([head, data, Buffer.alloc(4)]); };
const png = (width = 2, height = 2, extra: Buffer[] = []) => {
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([PNG_MAGIC, pngChunk('IHDR', ihdr), ...extra, pngChunk('IEND', Buffer.alloc(0))]);
};
const jpeg = (width = 2, height = 2, sof = 0xc0) => {
  const segment = Buffer.alloc(13); segment[0] = 0xff; segment[1] = sof; segment.writeUInt16BE(11, 2); segment[4] = 8;
  segment.writeUInt16BE(height, 5); segment.writeUInt16BE(width, 7); segment[9] = 1; segment[10] = 1; segment[11] = 0x11;
  return Buffer.concat([Buffer.from([0xff, 0xd8]), segment, Buffer.from([0xff, 0xd9])]);
};

async function server() {
  const root = await mkdtemp(join(tmpdir(), 'gen-file-image-')), repo = join(root, 'repo'); await mkdir(repo); await mkdir(join(repo, 'docs'), { recursive: true });
  const store = new Store(join(root, 'data'));
  const runtime: RuntimeAdapter = { configure: () => {}, models: async () => [], start: async () => {}, followUp: async () => {}, cancel: async () => {}, compact: async () => {}, history: async () => [], dispose: async () => {} };
  const service = new Service(store, runtime), app = await buildServer(service, { port: 4317, dev: false });
  const projects = workspaceHost(service).projects, receipt = await projects.connect({ id: 'connect', type: 'workspace.project.connect', payload: { name: 'Images', path: repo } });
  const projectId = (receipt.result as { projects: { id: string }[] }).projects[0]!.id;
  cleanup.push(async () => { await app.close(); await service.dispose(); store.close(); await rm(root, { recursive: true, force: true }); });
  const bootstrap = await app.inject({ url: '/api/bootstrap', headers: { host: '127.0.0.1:4317' } });
  const headers = { host: '127.0.0.1:4317', cookie: String(bootstrap.headers['set-cookie']).split(';')[0]! };
  const image = (path: string, extra = '') => app.inject({ url: `/api/projects/${projectId}/file/image?path=${encodeURIComponent(path)}${extra}`, headers });
  return { root, repo, store, service, projects, projectId, app, headers, image };
}
// A bound reader with the real filesystem; the route tests above already cover binding.
async function reader() {
  const root = await mkdtemp(join(tmpdir(), 'gen-image-fs-')), repo = join(root, 'repo'), outside = join(root, 'outside.png');
  await mkdir(repo);
  const store = new Store(join(root, 'data')), tools = new ProjectTools(store);
  vi.spyOn(tools, 'binding').mockResolvedValue({ path: repo } as unknown as Awaited<ReturnType<ProjectTools['binding']>>);
  cleanup.push(async () => { store.close(); await rm(root, { recursive: true, force: true }); });
  return { root, repo, outside, tools };
}

it('serves a verified PNG and JPEG with the fixed media response policy', async () => {
  const f = await server(), pngBytes = png(2, 2), jpegBytes = jpeg(2, 2);
  await writeFile(join(f.repo, 'docs/logo.png'), pngBytes); await writeFile(join(f.repo, 'photo.JPEG'), jpegBytes);
  const first = await f.image('docs/logo.png');
  expect(first.statusCode).toBe(200); expect(first.headers['content-type']).toBe('image/png');
  expect(first.headers['cache-control']).toBe('no-store'); expect(first.headers['x-content-type-options']).toBe('nosniff');
  expect(first.headers['content-security-policy']).toBe('sandbox'); expect(first.rawPayload.equals(pngBytes)).toBe(true);
  const second = await f.image('photo.JPEG');
  expect(second.statusCode).toBe(200); expect(second.headers['content-type']).toBe('image/jpeg'); expect(second.rawPayload.equals(jpegBytes)).toBe(true);
});

it('keeps the existing text contract unchanged on the sibling route', async () => {
  const f = await server(); await writeFile(join(f.repo, 'readme.txt'), 'plain text\n');
  const response = await f.app.inject({ url: `/api/projects/${f.projectId}/file?path=readme.txt`, headers: f.headers });
  expect(response.statusCode).toBe(200); expect(response.json()).toMatchObject({ text: 'plain text\n', binary: false });
});

it('requires the existing session auth and rejects wrong-owner requests', async () => {
  const f = await server(); await writeFile(join(f.repo, 'docs/logo.png'), png());
  const anonymous = await f.app.inject({ url: `/api/projects/${f.projectId}/file/image?path=docs/logo.png`, headers: { host: '127.0.0.1:4317' } });
  expect(anonymous.statusCode).toBe(401); expect(anonymous.json().error.code).toBe('AUTH_REQUIRED');
  const wrong = await f.app.inject({ url: `/api/projects/other-project/file/image?path=docs/logo.png`, headers: f.headers });
  expect(wrong.statusCode).toBeGreaterThanOrEqual(400); expect(wrong.json().error.code).toBeTruthy();
});

it('rejects unsupported, mislabeled, animated and oversized payloads without bytes', async () => {
  const f = await server();
  await writeFile(join(f.repo, 'notes.txt'), 'text'); await writeFile(join(f.repo, 'icon.svg'), '<svg/>');
  await writeFile(join(f.repo, 'fake.png'), jpeg()); await writeFile(join(f.repo, 'anim.png'), png(2, 2, [pngChunk('acTL', Buffer.alloc(8))]));
  await writeFile(join(f.repo, 'huge.png'), png(3000, 2000)); await writeFile(join(f.repo, 'wide.jpg'), jpeg(4000, 1500));
  await writeFile(join(f.repo, 'empty.png'), Buffer.alloc(0)); await writeFile(join(f.repo, 'truncated.png'), png().subarray(0, 20));
  await writeFile(join(f.repo, 'nosof.jpg'), Buffer.from([0xff, 0xd8, 0xff, 0xd9]));
  await mkdir(join(f.repo, '.git')); await writeFile(join(f.repo, '.git/config.png'), png());
  for (const path of ['notes.txt', 'icon.svg', 'fake.png', 'anim.png', 'empty.png', 'truncated.png', 'nosof.jpg', 'missing.png']) {
    const response = await f.image(path); expect(response.statusCode, path).toBeGreaterThanOrEqual(400);
    expect(response.headers['content-type'], path).toContain('json'); expect(String(response.body), path).not.toContain(f.repo);
  }
  for (const path of ['huge.png', 'wide.jpg']) { const response = await f.image(path); expect(response.json().error.code, path).toBe('RESOURCE_LIMIT'); }
  const traversal = await f.image('../outside.png'); expect(traversal.statusCode).toBeGreaterThanOrEqual(400);
  const git = await f.image('.git/config.png'); expect(git.statusCode).toBe(403); expect(git.json().error.code).toBe('CAPABILITY_DENIED');
});

it('fails closed on symlink escape, hard links and non-regular targets', async () => {
  const { repo, outside, tools } = await reader();
  await writeFile(join(repo, 'inside.png'), png()); await writeFile(outside, png());
  await expect(tools.fileImage('p', undefined, 'inside.png')).resolves.toMatchObject({ mediaType: 'image/png' });
  await symlink(outside, join(repo, 'escape.png'));
  await expect(tools.fileImage('p', undefined, 'escape.png')).rejects.toMatchObject({ code: 'CAPABILITY_DENIED' });
  await link(join(repo, 'inside.png'), join(repo, 'linked.png'));
  await expect(tools.fileImage('p', undefined, 'linked.png')).rejects.toMatchObject({ code: 'CAPABILITY_DENIED' });
  await expect(tools.fileImage('p', undefined, 'inside.png')).rejects.toMatchObject({ code: 'CAPABILITY_DENIED' });
  await expect(tools.fileImage('p', undefined, 'missing.png')).rejects.toThrow();
});

it('never broadens the authorized-path check beyond the existing file authority', async () => {
  const { repo, tools } = await reader();
  await mkdir(join(repo, 'sub')); await writeFile(join(repo, 'sub/img.png'), png());
  for (const path of ['../escape.png', '/etc/passwd', 'sub/../../x.png', '.git/img.png', 'sub/.git/x.png', 'a:b.png']) {
    await expect(tools.fileImage('p', undefined, path), path).rejects.toThrow();
    await expect(tools.file('p', undefined, path), 'file ' + path).rejects.toThrow();
  }
});
