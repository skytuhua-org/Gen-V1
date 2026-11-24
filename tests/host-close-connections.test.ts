import { afterEach, expect, it } from 'vitest';
import { Agent, request } from 'node:http';
import { connect, type Socket } from 'node:net';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Store } from '../packages/storage/store.ts';
import { Service } from '../packages/core/service.ts';
import { buildServer } from '../apps/server/server.ts';
import type { RuntimeAdapter } from '../packages/contracts/index.ts';

const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => { for (const cleanup of cleanups.splice(0)) await cleanup(); });

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'harness-host-close-')), store = new Store(root);
  const runtime: RuntimeAdapter = { configure: () => {}, models: async () => [], start: async () => {}, followUp: async () => {}, cancel: async () => {}, compact: async () => {}, history: async () => [], dispose: async () => {} };
  const service = new Service(store, runtime), app = await buildServer(service, { port: 4317, dev: false });
  let release = () => {};
  const held = new Promise<void>(done => { release = done; });
  let arrived = () => {};
  const received = new Promise<void>(done => { arrived = done; });
  app.get('/test/held', async () => { arrived(); await held; return { ok: true }; });
  await app.listen({ host: '127.0.0.1', port: 0 });
  // Fastify runs its own onClose hooks before server.close(); record when the
  // HTTP server itself starts closing so a response can finish after that.
  let serverClosing = () => {};
  const serverClosed = new Promise<void>(done => { serverClosing = done; });
  const serverClose = app.server.close.bind(app.server);
  app.server.close = ((callback?: (error?: Error) => void) => { serverClosing(); return serverClose(callback); }) as typeof app.server.close;
  const { port } = app.server.address() as { port: number };
  const sockets: Socket[] = [];
  let closed: Promise<void> | undefined;
  const close = () => closed ??= app.close().then(() => {});
  cleanups.push(async () => {
    release(); for (const socket of sockets) socket.destroy();
    await close(); await service.dispose(); store.close();
    await rm(root, { recursive: true, force: true });
  });
  const raw = async (bytes?: string) => {
    const socket = connect(port, '127.0.0.1'); sockets.push(socket); socket.on('error', () => {});
    await new Promise<void>(done => socket.once('connect', () => done()));
    if (bytes) socket.write(bytes);
    // Let the server accept the connection and parse any partial request.
    await new Promise(done => setTimeout(done, 50));
    return socket;
  };
  return { app, port, raw, close, release, received, serverClosed };
}

// A bounded observation, not a wider timeout: shutdown must not wait on clients.
const settlesWithin = (promise: Promise<unknown>, ms: number) =>
  Promise.race([promise.then(() => true), new Promise<boolean>(done => setTimeout(done, ms, false).unref())]);
const ended = (socket: Socket) => new Promise<void>(done => { if (socket.destroyed) done(); else socket.once('close', () => done()); });

it('closes a connection that has not sent a request without waiting for the client', async () => {
  const x = await fixture(), socket = await x.raw();
  expect(await settlesWithin(x.close(), 2000)).toBe(true);
  expect(await settlesWithin(ended(socket), 2000)).toBe(true);
});

it('closes a connection holding an incomplete request header', async () => {
  const x = await fixture(), socket = await x.raw('GET /health HTTP/1.1\r\nHost: 127.0.0.1:4317\r\n');
  expect(await settlesWithin(x.close(), 2000)).toBe(true);
  expect(await settlesWithin(ended(socket), 2000)).toBe(true);
});

it('delivers an in-flight response, then ends its keep-alive connection so close completes', async () => {
  const x = await fixture(), agent = new Agent({ keepAlive: true });
  cleanups.push(async () => { agent.destroy(); });
  let socket: Socket | undefined;
  const response = new Promise<{ status?: number; connection?: string; body: string }>((done, fail) => {
    const req = request({ host: '127.0.0.1', port: x.port, path: '/test/held', agent, headers: { host: '127.0.0.1:4317' } }, res => {
      let body = ''; res.setEncoding('utf8'); res.on('data', chunk => { body += chunk; });
      res.on('end', () => done({ status: res.statusCode, connection: res.headers.connection, body }));
    });
    req.on('socket', value => { socket = value; }); req.on('error', fail); req.end();
  });
  await x.received;
  const closing = x.close();
  await x.serverClosed;
  x.release();
  expect(await response).toMatchObject({ status: 200, body: '{"ok":true}' });
  expect(await settlesWithin(closing, 2000)).toBe(true);
  expect(await settlesWithin(ended(socket!), 2000)).toBe(true);
});

it('still closes an idle keep-alive connection after a completed request', async () => {
  const x = await fixture(), socket = await x.raw('GET /health HTTP/1.1\r\nHost: 127.0.0.1:4317\r\n\r\n');
  await new Promise<void>(done => socket.once('data', () => done()));
  expect(await settlesWithin(x.close(), 2000)).toBe(true);
  expect(await settlesWithin(ended(socket), 2000)).toBe(true);
});
