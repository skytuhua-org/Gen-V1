import { EventEmitter } from 'node:events';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { SpawnOptions } from 'node:child_process';
import { afterEach, expect, it, vi } from 'vitest';
import { DESKTOP_CHANNELS as channels } from '../packages/desktop-contract/index.ts';
import { deferred } from './fixtures/deferred.ts';

const desktop = vi.hoisted(() => ({
  appOn: vi.fn(), appExit: vi.fn(), handle: vi.fn(), loaded: vi.fn(),
  spawn: vi.fn(), events: vi.fn(), proxy: vi.fn(),
}));
vi.mock('node:child_process', async original => ({
  ...await original<typeof import('node:child_process')>(), spawn: desktop.spawn,
}));
vi.mock('../apps/desktop/workspace-events.ts', () => ({ workspaceEvents: desktop.events }));
vi.mock('../apps/desktop/browser-proxy.ts', () => ({ createBrowserProxy: desktop.proxy }));
vi.mock('../apps/desktop/attention-popups.ts', () => ({
  createAttentionPopups: () => ({ start() {}, stop() {} }),
}));

class FixtureWindow extends EventEmitter {
  private destroyed = false;
  readonly initialBounds: { x: number; y: number; width: number; height: number };
  private bounds: FixtureWindow['initialBounds'];
  constructor(options: { x: number; y: number; width: number; height: number }) {
    super();
    this.initialBounds = { x: options.x, y: options.y, width: options.width, height: options.height };
    this.bounds = { ...this.initialBounds };
  }
  readonly contentView = { addChildView() {}, removeChildView() {} };
  readonly closeRequest = deferred<string>();
  readonly sent: { channel: string; value: unknown }[] = [];
  readonly webContents = Object.assign(new EventEmitter(), {
    id: 1, mainFrame: { url: '' }, getURL: () => this.webContents.mainFrame.url,
    send: (channel: string, value: unknown) => {
      this.sent.push({ channel, value });
      if (channel === channels.closeRequest) this.closeRequest.resolve(value as string);
    },
    setWindowOpenHandler() {},
    session: Object.assign(new EventEmitter(), { setPermissionRequestHandler() {}, setPermissionCheckHandler() {} }),
  });
  async loadURL(url: string) {
    this.webContents.mainFrame.url = url;
    desktop.loaded(this);
  }
  isDestroyed() { return this.destroyed; }
  isMinimized() { return false; }
  isMaximized() { return false; }
  isFullScreen() { return false; }
  isAlwaysOnTop() { return false; }
  getNormalBounds() { return { ...this.bounds }; }
  moveTo(bounds: FixtureWindow['initialBounds']) {
    if (process.platform === 'win32' || process.platform === 'darwin') this.emit('will-move', {}, bounds);
    this.bounds = { ...bounds };
    this.emit('move');
  }
  getContentSize() { return [900, 700]; }
  show() {}
  destroy() { this.destroyed = true; this.emit('closed'); }
}

class FixtureView {
  private destroyed = false;
  readonly webContents = Object.assign(new EventEmitter(), {
    setWebRTCIPHandlingPolicy() {}, setWindowOpenHandler() {}, async loadURL() {}, focus() {},
    isDestroyed: () => this.destroyed,
    close: () => { this.destroyed = true; },
  });
  setBounds() {}
}

vi.mock('electron', () => {
  const display = { id: 1, workArea: { x: 0, y: 0, width: 1024, height: 768 }, scaleFactor: 1 };
  const browserSession = Object.assign(new EventEmitter(), {
    setPermissionRequestHandler() {}, setPermissionCheckHandler() {},
    webRequest: { onBeforeRequest() {} },
    async setProxy() {}, async closeAllConnections() {},
  });
  return {
    app: {
      setName() {}, getPath: () => process.env.HARNESS_DESKTOP_TEST_DATA_DIR, setPath() {},
      commandLine: { appendSwitch() {} }, requestSingleInstanceLock: () => true,
      on: desktop.appOn, whenReady: async () => {}, exit: desktop.appExit,
    },
    BrowserWindow: FixtureWindow, ipcMain: { handle: desktop.handle }, powerMonitor: { on() {} },
    screen: { getAllDisplays: () => [display], getPrimaryDisplay: () => display, on() {} },
    Menu: { setApplicationMenu() {}, buildFromTemplate() {} },
    nativeImage: { createFromDataURL: () => ({ addRepresentation() {} }) },
    Tray: class { on() {} setToolTip() {} setContextMenu() {} destroy() {} },
    WebContentsView: FixtureView, session: { fromPartition: () => browserSession }, dialog: {}, shell: {},
  };
});

class Sidecar extends EventEmitter {
  connected = true;
  exitCode: number | null = null;
  signalCode = null;
  failNextLayoutSave = false;
  holdNextLayoutSave = false;
  releaseLayoutSave: (() => void) | undefined;
  readonly layoutSaves: unknown[] = [];
  readonly shutdown = deferred();
  constructor(readonly pid: number, readonly token: string) { super(); }
  send(message: { type: string; token: string; requestId?: string; layout?: unknown }) {
    if (message.type === 'harness.shutdown') { this.shutdown.resolve(); return; }
    if (message.type === 'harness.layout.save') {
      this.layoutSaves.push(message.layout);
      const fail = this.failNextLayoutSave;
      this.failNextLayoutSave = false;
      if (this.holdNextLayoutSave) {
        this.holdNextLayoutSave = false;
        this.releaseLayoutSave = () => queueMicrotask(() => this.emit('message', { ...message, type: 'harness.layout.saved', idle: true }));
        return;
      }
      queueMicrotask(() => this.emit('message', { ...message, type: 'harness.layout.saved', ...(fail ? { error: 'injected host layout save failure' } : { idle: true }) }));
      return;
    }
    queueMicrotask(() => this.emit('message', { ...message, type: message.type + '.result', idle: true }));
  }
  finishShutdown() {
    this.emit('message', { type: 'harness.stopped', token: this.token });
    this.stop(0);
  }
  stop(code: number) { this.exitCode = code; this.connected = false; this.emit('exit', code, null); }
}

let directory: string | undefined;
afterEach(async () => {
  vi.useRealTimers(); vi.unstubAllEnvs(); vi.resetModules(); vi.resetAllMocks();
  if (directory) await rm(directory, { recursive: true, force: true });
  directory = undefined;
});

async function launch(nativeLayout?: unknown, reuseDirectory?: string) {
  directory = reuseDirectory ?? await mkdtemp(join(tmpdir(), 'gen-restart-quit-'));
  vi.stubEnv('HARNESS_DESKTOP_TEST_DATA_DIR', directory);
  vi.stubEnv('HARNESS_DESKTOP_NODE_PATH', process.execPath);
  vi.stubEnv('HARNESS_DESKTOP_PORT', '4357');
  vi.stubEnv('HARNESS_DESKTOP_WIDGET_PORT', '4358');
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  const loaded = deferred<FixtureWindow>();
  const exited = deferred<number>();
  const relayClosing = deferred();
  const relayClosed = deferred();
  const proxyClosing = deferred();
  const proxyClosed = deferred();
  const sidecars: Sidecar[] = [];
  desktop.loaded.mockImplementation(loaded.resolve);
  desktop.appExit.mockImplementation(exited.resolve);
  desktop.events.mockImplementation(() => ({ close: async () => {} }));
  desktop.events.mockImplementationOnce(() => ({ close: () => {
    relayClosing.resolve();
    return relayClosed.promise;
  } }));
  desktop.proxy.mockResolvedValue({ port: 4359, close: () => {
    proxyClosing.resolve();
    return proxyClosed.promise;
  } });
  desktop.spawn.mockImplementation((_file: string, _args: string[], options: SpawnOptions) => {
    const child = new Sidecar(100 + sidecars.length, options.env!.HARNESS_DESKTOP_LAUNCH_TOKEN!);
    sidecars.push(child);
    queueMicrotask(() => child.emit('message', { type: 'harness.ready', token: child.token, pid: child.pid, origin: 'http://127.0.0.1:4357', ...(nativeLayout === undefined ? {} : { nativeLayout }) }));
    return child;
  });
  await import('../apps/desktop/main.ts');
  const window = await loaded.promise;
  function invoke(channel: string, value?: unknown) {
    const handler = desktop.handle.mock.calls.find(([name]) => name === channel)?.[1];
    if (!handler) throw Error('Desktop IPC handler was not registered');
    const sender = window.webContents;
    return handler({ sender, senderFrame: sender.mainFrame }, value) as Promise<unknown>;
  }
  await invoke(channels.ready);
  async function beginQuit() {
    const handler = desktop.appOn.mock.calls.find(([event]) => event === 'before-quit')?.[1];
    if (!handler) throw Error('Desktop quit handler was not registered');
    handler({ preventDefault() {} });
    const requestId = await window.closeRequest.promise;
    await invoke(channels.closeAnswer, { requestId, allow: true });
  }
  return {
    sidecars, beginQuit, exited: exited.promise, window, invoke,
    relayClosing: relayClosing.promise, closeRelay: () => relayClosed.resolve(),
    openBrowser: () => invoke(channels.browser, { type: 'open' }),
    proxyClosing: proxyClosing.promise, closeProxy: () => proxyClosed.resolve(),
  };
}

async function eventually(assertion: () => void | Promise<void>) {
  await vi.waitFor(assertion, { timeout: 1500, interval: 10 });
}

function persistenceWindow() {
  return new Promise(resolve => setTimeout(resolve, 250));
}

it('resumes host layout persistence after a transient save failure', async () => {
  const fixture = await launch();
  vi.useRealTimers();
  const sidecar = fixture.sidecars[0]!;
  const lastState = () => fixture.window.sent.filter(({ channel }) => channel === channels.state).at(-1)?.value as { layoutError?: string };
  fixture.window.moveTo({ x: 10, y: 10, width: 800, height: 600 });
  await eventually(() => expect(sidecar.layoutSaves.length).toBeGreaterThan(0));
  const initialSaves = sidecar.layoutSaves.length;

  sidecar.failNextLayoutSave = true;
  fixture.window.moveTo({ x: 24, y: 24, width: 800, height: 600 });
  await eventually(() => {
    expect(sidecar.layoutSaves).toHaveLength(initialSaves + 1);
    expect(lastState().layoutError).toContain('Workspace layout could not be saved');
  });

  sidecar.failNextLayoutSave = true;
  fixture.window.moveTo({ x: 40, y: 32, width: 810, height: 610 });
  await eventually(() => {
    expect(sidecar.layoutSaves).toHaveLength(initialSaves + 2);
    expect(lastState().layoutError).toContain('Workspace layout could not be saved');
  });

  fixture.window.moveTo({ x: 64, y: 48, width: 820, height: 620 });
  await eventually(() => {
    expect(sidecar.layoutSaves).toHaveLength(initialSaves + 3);
    const lastLayout = sidecar.layoutSaves.at(-1) as { windows: { bounds: { x: number } }[] };
    expect(lastLayout.windows[0]?.bounds.x).toBe(64);
    expect(lastState().layoutError).toBeUndefined();
  });

  const reopenedLayout = sidecar.layoutSaves.at(-1);
  const reusedDirectory = directory!;
  vi.resetModules();
  vi.clearAllMocks();
  const reopened = await launch(reopenedLayout, reusedDirectory);
  expect(reopened.window.initialBounds.x).toBe(64);
});

it('keeps newer geometry behind an older in-flight host save', async () => {
  const fixture = await launch();
  vi.useRealTimers();
  const sidecar = fixture.sidecars[0]!;
  fixture.window.moveTo({ x: 10, y: 10, width: 800, height: 600 });
  await eventually(() => expect(sidecar.layoutSaves.length).toBeGreaterThan(0));
  const initialSaves = sidecar.layoutSaves.length;

  sidecar.holdNextLayoutSave = true;
  fixture.window.moveTo({ x: 24, y: 24, width: 800, height: 600 });
  await eventually(() => expect(sidecar.layoutSaves).toHaveLength(initialSaves + 1));

  fixture.window.moveTo({ x: 64, y: 48, width: 820, height: 620 });
  await persistenceWindow();
  expect(sidecar.layoutSaves).toHaveLength(initialSaves + 1);

  sidecar.releaseLayoutSave!();
  await eventually(() => {
    expect(sidecar.layoutSaves).toHaveLength(initialSaves + 2);
    const lastLayout = sidecar.layoutSaves.at(-1) as { windows: { bounds: { x: number } }[] };
    expect(lastLayout.windows[0]?.bounds.x).toBe(64);
  });
});

it('does not overwrite invalid saved host layout silently', async () => {
  const fixture = await launch({ version: 1, windows: 'invalid' });
  vi.useRealTimers();
  const sidecar = fixture.sidecars[0]!;

  fixture.window.moveTo({ x: 96, y: 72, width: 820, height: 620 });
  await eventually(async () => {
    const backup = JSON.parse(await readFile(join(directory!, 'desktop-windows.json'), 'utf8')) as { windows: { bounds: { x: number } }[] };
    expect(backup.windows[0]?.bounds.x).toBe(96);
  });

  await persistenceWindow();
  expect(sidecar.layoutSaves).toHaveLength(0);
  const errored = fixture.window.sent.map(({ channel, value }) => channel === channels.state ? value : undefined).find(value => value && typeof value === 'object' && 'layoutError' in value) as { layoutError?: string };
  expect(errored.layoutError).toContain('saved host workspace layout is invalid');
});

it('does not leave a scheduled replacement running after desktop quit', async () => {
  const fixture = await launch();
  await fixture.openBrowser();
  fixture.closeRelay();
  fixture.sidecars[0]!.stop(1);
  await fixture.beginQuit();
  // Proxy cleanup runs after sidecar shutdown has selected and settled its child.
  await fixture.proxyClosing;

  await vi.advanceTimersByTimeAsync(700);
  fixture.closeProxy();
  await expect(fixture.exited).resolves.toBe(0);
  expect(fixture.sidecars.filter(child => child.connected)).toHaveLength(0);
  expect(fixture.sidecars).toHaveLength(1);
});

it('stops an in-flight replacement without activating its relay during quit', async () => {
  const fixture = await launch();
  fixture.sidecars[0]!.stop(1);
  await vi.advanceTimersByTimeAsync(700);
  await fixture.relayClosing;
  const replacement = fixture.sidecars[1]!;

  await fixture.beginQuit();
  await replacement.shutdown.promise;
  fixture.closeRelay();
  await vi.advanceTimersByTimeAsync(0);
  replacement.finishShutdown();
  await expect(fixture.exited).resolves.toBe(0);
  expect(replacement.exitCode).toBe(0);
  expect(desktop.events).toHaveBeenCalledOnce();
});

it('activates a replacement outside shutdown and later stops it on quit', async () => {
  const fixture = await launch();
  fixture.sidecars[0]!.stop(1);
  await vi.advanceTimersByTimeAsync(700);
  await fixture.relayClosing;
  fixture.closeRelay();
  await vi.advanceTimersByTimeAsync(0);
  const replacement = fixture.sidecars[1]!;
  expect(desktop.events).toHaveBeenCalledTimes(2);

  await fixture.beginQuit();
  await replacement.shutdown.promise;
  replacement.finishShutdown();
  await expect(fixture.exited).resolves.toBe(0);
  expect(replacement.exitCode).toBe(0);
});
