import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {EventEmitter} from 'node:events';
import {createHash} from 'node:crypto';
import {runInNewContext} from 'node:vm';
import type {DesktopSettingsExportResult, DesktopSurface} from '../packages/desktop-contract/index.ts';
import {parseDesktopSettingsExportRequest} from '../packages/desktop-contract/index.ts';
import {buildSettingsFile, SETTINGS_FILE_LIMIT} from '../packages/contracts/settings-transfer.ts';
import {DEFAULT_PREFERENCES} from '../packages/contracts/preferences.ts';
import {createMemoryExportDownloads} from '../apps/desktop/memory-export.ts';
import {createSettingsExportDownloads} from '../apps/desktop/settings-export.ts';

const documentUrl = 'http://127.0.0.1:4317/?desktopWindow=main-1#launch=owned';
const filename = 'gen-settings-2026-11-22.json';
const serialized = () => buildSettingsFile({theme: 'dark', preferences: {...DEFAULT_PREFERENCES, composerPredictions: true}, now: new Date('2026-11-22T00:00:00Z'), appVersion: '0.6.5'});
type Outcome = {result?: DesktopSettingsExportResult; error?: Error};

class NativeContents extends EventEmitter {
  mainFrame = {url: documentUrl};
  session = new EventEmitter();
  url = documentUrl;
  destroyed = false;
  scripts: {worldId: number; code: string}[] = [];
  requests: {url: string; filename: string}[] = [];
  getURL() {return this.url;}
  isDestroyed() {return this.destroyed;}
  async executeJavaScriptInIsolatedWorld(worldId: number, scripts: {code: string}[]) {
    for (const {code} of scripts) {
      this.scripts.push({worldId, code});
      const anchor = {href: '', download: '', remove() {}, click: () => this.requests.push({url: anchor.href, filename: anchor.download})};
      runInNewContext(code, {document: {createElement: (tag: string) => {if (tag !== 'a') throw Error('Unexpected element'); return anchor;}, body: {append: () => {}}}});
    }
  }
}
class NativeDownload extends EventEmitter {
  dialog: Record<string, unknown> | undefined;
  origin = 'http://127.0.0.1:4317';
  chain: string[];
  received: number;
  cancelled = false;
  constructor(public url: string, public name: string) {
    super(); this.chain = [url]; this.received = url.startsWith('data:') ? Buffer.from(url.split(',', 2)[1], 'base64').length : 0;
  }
  getURL() {return this.url;}
  getURLChain() {return this.chain;}
  getFilename() {return this.name;}
  getInitiatorOrigin() {return this.origin;}
  getReceivedBytes() {return this.received;}
  setSaveDialogOptions(options: Record<string, unknown>) {this.dialog = options;}
  cancel() {this.cancelled = true;}
}
async function fixture(surface: DesktopSurface = {kind: 'main'}, share = true) {
  const memory = createMemoryExportDownloads(), policy = share ? createSettingsExportDownloads(memory) : createSettingsExportDownloads();
  const contents = new NativeContents(); let current = true;
  const owner = {contents, documentUrl, surface, isCurrent: () => current};
  if (!share) policy.guard(contents.session as never);
  const request = (input: unknown = serialized(), name: unknown = filename): Promise<Outcome> => policy.export(owner as never, input, name).then(result => ({result}), error => ({error: error as Error}));
  const download = (changes: Partial<NativeDownload> = {}, from = contents, frame: unknown = contents.mainFrame) => {
    const requested = contents.requests.at(-1) ?? {url: 'https://example.com/unrelated.exe', filename: 'unrelated.exe'};
    const item = Object.assign(new NativeDownload(requested.url, requested.filename), changes), event = {preventDefault: vi.fn()};
    contents.session.emit('will-download', event, item, from, frame); return {item, event};
  };
  return {policy, owner, contents, request, download, revoke: () => {current = false;}};
}
beforeEach(() => vi.useFakeTimers());
afterEach(() => {vi.useRealTimers(); vi.unstubAllGlobals();});

describe('parseDesktopSettingsExportRequest', () => {
  it('accepts a bounded serialized file and generated filename', () => {
    expect(parseDesktopSettingsExportRequest({serialized: serialized(), filename})).toEqual({serialized: serialized(), filename});
  });
  it.each([{serialized: 1, filename}, {serialized: serialized(), filename: 'other.json'}, {serialized: serialized(), filename: 'gen-settings-2026-1-2.json'}, {serialized: 'x'.repeat(SETTINGS_FILE_LIMIT + 1), filename}, {serialized: serialized(), filename, extra: 1}, 'plain'])('rejects %j', value => {
    expect(() => parseDesktopSettingsExportRequest(value)).toThrow('Invalid settings export');
  });
});

describe('createSettingsExportDownloads', () => {
  it('keeps an ordinary download denied without an export request', async () => {
    const f = await fixture(), event = {preventDefault: vi.fn()};
    f.policy.guard(f.contents.session as never);
    f.contents.session.emit('will-download', event, new NativeDownload('https://example.com/x', 'x'), f.contents, f.contents.mainFrame);
    expect(event.preventDefault).toHaveBeenCalledOnce();
  });
  it('admits the owned download once through the shared listener and acknowledges a completed save', async () => {
    const f = await fixture(), pending = f.request(); let settled = false; void pending.then(() => {settled = true;});
    await Promise.resolve();
    const request = f.contents.requests[0], text = Buffer.from(request.url.split(',', 2)[1], 'base64').toString('utf8');
    expect(JSON.parse(text).format).toBe('gen.settings'); expect(request.filename).toBe(filename);
    const {item, event} = f.download(); expect(event.preventDefault).not.toHaveBeenCalled();
    expect(item.dialog).toMatchObject({title: 'Export settings', defaultPath: filename, filters: [{name: 'JSON', extensions: ['json']}]});
    await Promise.resolve(); expect(settled).toBe(false);
    const replay = f.download(); expect(replay.event.preventDefault).toHaveBeenCalledOnce();
    item.emit('done', {}, 'completed');
    expect(await pending).toEqual({result: {status: 'saved', admitted: true, filename, bytes: Buffer.byteLength(text), sha256: createHash('sha256').update(text).digest('hex')}});
    expect(f.contents.listenerCount('destroyed')).toBe(0); expect(vi.getTimerCount()).toBe(0);
  });
  it('resolves cancelled when the native save is cancelled', async () => {
    const f = await fixture(), pending = f.request(); await Promise.resolve();
    const {item} = f.download(); item.emit('done', {}, 'cancelled');
    expect((await pending).result?.status).toBe('cancelled');
  });
  it.each<DesktopSurface>([{kind: 'thread', threadId: 'a'}, {kind: 'plugin', pluginId: 'p', scopeId: 's', surfaceId: 'v'}, {kind: 'browser', browserId: 'b'}, {kind: 'navigation'}])('refuses a non-main surface: %j', async surface => {
    const f = await fixture(surface); expect((await f.request()).error).toBeInstanceOf(Error); expect(f.contents.requests).toHaveLength(0);
  });
  it.each([{serialized: '{', filename}, {serialized: JSON.stringify({format: 'other', version: 1}), filename}, {serialized: serialized(), filename: 'settings.json'}])('rejects an invalid payload %j', async bad => {
    const f = await fixture(); expect((await f.request(bad.serialized, bad.filename)).error).toBeInstanceOf(Error); expect(f.contents.requests).toHaveLength(0);
  });
  it('does not consume the permit for a foreign download then admits the owned one', async () => {
    const f = await fixture(), pending = f.request(); await Promise.resolve();
    expect(f.download({name: 'other.json'}).event.preventDefault).toHaveBeenCalledOnce();
    const admitted = f.download(); expect(admitted.event.preventDefault).not.toHaveBeenCalled();
    admitted.item.emit('done', {}, 'cancelled'); expect((await pending).result?.status).toBe('cancelled');
  });
  it('revokes a pending export when the owner navigates', async () => {
    const f = await fixture(), pending = f.request(); await Promise.resolve();
    f.contents.emit('did-start-navigation', {isMainFrame: true});
    expect((await pending).error).toBeInstanceOf(Error); expect(f.download().event.preventDefault).toHaveBeenCalledOnce();
  });
  it('denies unrelated downloads in standalone mode too', async () => {
    const f = await fixture({kind: 'main'}, false); expect(f.download().event.preventDefault).toHaveBeenCalledOnce();
  });
});
