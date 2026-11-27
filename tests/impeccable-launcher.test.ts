import {afterEach, expect, it} from 'vitest';
import {spawnSync} from 'node:child_process';
import {copyFileSync, cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cleanup: string[] = [];
afterEach(() => {for (const path of cleanup.splice(0)) rmSync(path, {recursive: true, force: true});});

function fixture(engine: 'valid' | 'missing' | 'mismatched') {
  const root = mkdtempSync(join(tmpdir(), 'impeccable-launcher-')); cleanup.push(root);
  const scripts = join(root, 'layout', 'skills', 'impeccable', 'scripts');
  mkdirSync(join(root, 'layout', 'engine'), {recursive: true}); mkdirSync(join(root, 'project'), {recursive: true});
  cpSync(join(repo, 'third-party/integrations/impeccable/skills/impeccable/scripts'), scripts, {recursive: true});
  if (engine === 'valid') copyFileSync(join(repo, 'third-party/integrations/impeccable/engine/impeccable.exe'), join(root, 'layout', 'engine', 'impeccable.exe'));
  if (engine === 'mismatched') writeFileSync(join(root, 'layout', 'engine', 'impeccable.exe'), 'not the pinned engine');
  return {root, launcher: join(scripts, 'impeccable.cmd'), project: join(root, 'project')};
}

function run(f: ReturnType<typeof fixture>, command: string) {
  return spawnSync(process.env.ComSpec ?? 'cmd.exe', ['/c', f.launcher, command], {cwd: f.project, encoding: 'utf8', timeout: 30000, env: {
    SystemRoot: process.env.SystemRoot ?? 'C:\\Windows', WINDIR: process.env.WINDIR ?? 'C:\\Windows', COMSPEC: process.env.ComSpec ?? 'C:\\Windows\\System32\\cmd.exe',
    PATH: 'C:\\Windows\\System32', TEMP: f.root, TMP: f.root, USERPROFILE: f.root, IMPECCABLE_HOME: join(f.root, 'cache'), IMPECCABLE_DOWNLOAD_BASE: 'http://127.0.0.1:9'
  }});
}

it.runIf(process.platform === 'win32')('runs the documented context command through the verified packaged engine without network access', () => {
  const result = run(fixture('valid'), 'context');
  expect(result.status).toBe(0); expect(result.stdout).toContain('NO_PRODUCT_MD'); expect(result.stderr).toBe('');
});

it.runIf(process.platform === 'win32')('does not use a missing or mismatched packaged engine and fails closed without network access', () => {
  for (const kind of ['missing', 'mismatched'] as const) {
    const result = run(fixture(kind), 'engine-probe');
    expect(result.status).toBe(127); expect(result.stdout).not.toContain('impeccable-engine');
    if (kind === 'mismatched') expect(result.stderr).toContain('cannot verify the packaged engine');
    expect(result.stderr).toMatch(/could not download engine|no engine binary found/);
  }
});
