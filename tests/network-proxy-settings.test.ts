import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  parseProxyUrl, parseBypassEntry, canonicalizeBypass, bypassesHost,
  NetworkProxySettings, MANDATORY_LOCAL_BYPASS,
} from '../packages/core/network-proxy-settings.ts';

// #1531 T02 — parser/validator + revisioned atomic storage.
// A stub codec stands in for DPAPI so credential paths are testable off-Windows.
const stubCodec = { protect: async (v: string) => `enc(${v})`, unprotect: async (v: string) => v.slice(4, -1) };
const noCodec = { protect: async () => { throw new Error('no codec'); }, unprotect: async () => { throw new Error('no codec'); } };

let dir: string;
beforeEach(async () => { dir = await mkdtemp(join(tmpdir(), 'gen-proxy-')); });
afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

describe('parseProxyUrl', () => {
  it('accepts http/https endpoint and splits userinfo out of the url', () => {
    expect(parseProxyUrl('http://proxy.corp:8080')).toEqual({ url: 'http://proxy.corp:8080', credentials: null });
    expect(parseProxyUrl('https://user:p%40ss@proxy.corp')).toEqual({ url: 'https://proxy.corp', credentials: 'user:p%40ss' });
  });
  it('rejects non-http schemes, paths, query, fragment, bad ports', () => {
    for (const bad of ['socks5://h', 'http://h/p', 'http://h?q=1', 'http://h#f', 'http://h:0', 'http://h:70000', 'http://', 'ftp://h:21']) {
      expect(() => parseProxyUrl(bad), bad).toThrowError();
    }
  });
  it('rejects malformed percent escapes in userinfo', () => {
    expect(() => parseProxyUrl('http://u%zz:p@h')).toThrowError();
  });
  it.each(['http://pro\txy.example:8080', 'http://proxy.example\r\n:8080', 'http://proxy.example?', 'http://proxy.example#'])('rejects raw controls and empty query/fragment delimiters: %j', raw => {
    expect(() => parseProxyUrl(raw)).toThrowError();
  });
});

describe('parseBypassEntry / canonicalizeBypass', () => {
  it('accepts exact host, .suffix, host:port, IPv4, bracketed IPv6', () => {
    expect(parseBypassEntry(' CORP.local ')).toBe('corp.local');
    expect(parseBypassEntry('.Internal.Corp:8443')).toBe('.internal.corp:8443');
    expect(parseBypassEntry('10.0.0.1')).toBe('10.0.0.1');
    expect(parseBypassEntry('[FD00::1]:3128')).toBe('[fd00::1]:3128');
  });
  it('rejects wildcard, CIDR, scheme, path entries', () => {
    for (const bad of ['*.corp', '10.0.0.0/24', 'http://h', 'h/path', 'a:b:c', '10.0.0.999']) {
      expect(() => parseBypassEntry(bad), bad).toThrowError();
    }
  });
  it('canonicalizes: trims, dedups, sorts', () => {
    expect(canonicalizeBypass(['B.corp', ' a.corp ', 'b.corp'])).toEqual(['a.corp', 'b.corp']);
  });
  it.each(['[::::]', '[1:2:3]:80', '[12345::1]', '[::1]:0', 'example.test:0'])('rejects malformed IPv6 and zero ports: %s', raw => {
    expect(() => parseBypassEntry(raw)).toThrowError();
  });
  it('canonicalizes equivalent IPv6 literals and numeric ports before deduplication', () => {
    expect(canonicalizeBypass(['[FD00:0:0:0:0:0:0:1]:00443', '[fd00::1]:443'])).toEqual(['[fd00::1]:443']);
    expect(parseBypassEntry('fd00::1')).toBe('[fd00::1]');
    expect(parseBypassEntry('[::ffff:127.0.0.1]')).toBe('[::ffff:7f00:1]');
    expect(parseBypassEntry('example.test:00443')).toBe('example.test:443');
  });
  it.each(['https://synthetic-marker.example/path', 'synthetic-marker*.example', 'synthetic marker.example'])('keeps invalid bypass input out of errors: %s', raw => {
    try { parseBypassEntry(raw); throw new Error('Unexpected acceptance'); }
    catch (cause) {
      expect(cause).toMatchObject({code: 'NETWORK_PROXY_INVALID'});
      expect((cause as Error).message).not.toContain(raw);
    }
  });
});

describe('bypassesHost', () => {
  const entries = canonicalizeBypass(['.corp.local', 'exact.host:8080', '[fd00::1]']);
  it('suffix matches apex and label-boundary subdomains only', () => {
    expect(bypassesHost(entries, 'corp.local', 443)).toBe(true);
    expect(bypassesHost(entries, 'a.b.corp.local', 443)).toBe(true);
    expect(bypassesHost(entries, 'notcorp.local', 443)).toBe(false);
    expect(bypassesHost(entries, 'corp.loca', 443)).toBe(false);
  });
  it('honors explicit port rules', () => {
    expect(bypassesHost(entries, 'exact.host', 8080)).toBe(true);
    expect(bypassesHost(entries, 'exact.host', 443)).toBe(false);
    expect(bypassesHost(entries, 'fd00::1', 443)).toBe(true);
  });
  it('mandatory local bypass wins', () => {
    const all = [...MANDATORY_LOCAL_BYPASS];
    expect(bypassesHost(all, 'localhost', 8080)).toBe(true);
    expect(bypassesHost(all, 'app.localhost', 8080)).toBe(true);
    expect(bypassesHost(all, '127.4.5.6', 8080)).toBe(true);
    expect(bypassesHost(all, '::1', 8080)).toBe(true);
    expect(bypassesHost(all, 'example.com', 8080)).toBe(false);
  });
  it('matches equivalent IPv6 spellings while preserving explicit port restrictions', () => {
    const entries = canonicalizeBypass(['[0:0:0:0:0:0:0:1]:8080', '[fd00::1]:443']);
    expect(bypassesHost(entries, '[::1]', 8080)).toBe(true);
    expect(bypassesHost(entries, '0:0:0:0:0:0:0:1', 8080)).toBe(true);
    expect(bypassesHost(entries, '[::1]', 80)).toBe(false);
    expect(bypassesHost(entries, '[fd00:0:0:0:0:0:0:1]', 443)).toBe(true);
  });
  it('keeps every normalized mapped-loopback address direct without admitting other mapped addresses', () => {
    const all = [...MANDATORY_LOCAL_BYPASS];
    for (const address of ['::ffff:127.0.0.1', '::ffff:127.255.255.255', '0:0:0:0:0:ffff:7f00:1']) {
      expect(bypassesHost(all, new URL('http://[' + address + ']:8080').hostname, 8080), address).toBe(true);
    }
    for (const address of ['::ffff:126.255.255.255', '::ffff:128.0.0.1', '::ffff:10.0.0.1', '2001:db8::7f00:1']) {
      expect(bypassesHost(all, new URL('http://[' + address + ']:8080').hostname, 8080), address).toBe(false);
    }
  });
});

describe('NetworkProxySettings storage', () => {
  it('round-trips save/read/remove with revisions and no plaintext credentials', async () => {
    const s = new NetworkProxySettings(dir, stubCodec);
    expect((await s.read()).revision).toBe(0);
    const r1 = await s.save({ baseRevision: 0, url: 'http://u:p@proxy.corp:3128', bypass: ['.corp'] });
    expect(r1.revision).toBe(1);
    expect(r1.url).toBe('http://proxy.corp:3128'); // userinfo stripped
    expect(r1.hasCredentials).toBe(true);
    expect(JSON.stringify(r1)).not.toContain('u:p');
    // persisted doc keeps only the protected blob
    const fs = await import('node:fs/promises');
    const raw = await fs.readFile(join(dir, 'network-proxy', 'policy.json'), 'utf8');
    expect(raw).toContain('enc(u:p)');
    expect(raw).not.toContain('"u:p"');
    // stale revision conflicts
    await expect(s.save({ baseRevision: 0, url: 'http://x', bypass: [] })).rejects.toMatchObject({ code: 'NETWORK_PROXY_CHANGED' });
    const r2 = await s.remove({ baseRevision: 1 });
    expect(r2.revision).toBe(2);
    expect(r2.url).toBeNull();
    expect(r2.hasCredentials).toBe(false);
  });
  it('drops credentials when the endpoint changes and honors clearCredentials', async () => {
    const s = new NetworkProxySettings(dir, stubCodec);
    await s.save({ baseRevision: 0, url: 'http://u:p@a.corp:1', bypass: [] });
    const r = await s.save({ baseRevision: 1, url: 'http://b.corp:2', bypass: [] });
    expect(r.hasCredentials).toBe(false);
    await s.save({ baseRevision: 2, url: 'http://u:p@b.corp:2', bypass: [] });
    const r3 = await s.save({ baseRevision: 3, url: 'http://b.corp:2', bypass: [], clearCredentials: true });
    expect(r3.hasCredentials).toBe(false);
    // explicit clear wins over userinfo supplied in the same save
    const r4 = await s.save({ baseRevision: 4, url: 'http://u:p@b.corp:2', bypass: [], clearCredentials: true });
    expect(r4.hasCredentials).toBe(false);
  });
  it('refuses credentials when no secret codec exists (no plaintext fallback)', async () => {
    const s = new NetworkProxySettings(dir, noCodec);
    // codec.protect throws → the error propagates and nothing is written
    await expect(s.save({ baseRevision: 0, url: 'http://u:p@a.corp', bypass: [] })).rejects.toThrowError();
    expect((await s.read()).url).toBeNull();
  });
  it('policy() returns host-private snapshot incl. mandatory bypass', async () => {
    const s = new NetworkProxySettings(dir, stubCodec);
    await s.save({ baseRevision: 0, url: 'http://u:p@a.corp', bypass: ['mine.local'] });
    const p = await s.policy();
    expect(p.credentials).toBe('u:p');
    expect(p.bypass).toContain('mine.local');
    expect(p.bypass).toContain('localhost');
    expect(p.bypass).toContain('127.0.0.0/8');
  });
});
