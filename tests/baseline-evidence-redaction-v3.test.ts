import { afterEach, describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CommandEvidence } from '../packages/contracts/implementation-evidence.ts';
import { runRecordedCommand, statusFromObservation, writeCommandEvidence } from '../scripts/research-baseline.ts';
import type { RecordedObservation } from '../scripts/research-baseline.ts';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true, maxRetries: 5 });
});
const root = () => {
  const directory = mkdtempSync(join(tmpdir(), 'm01 evidence redaction '));
  roots.push(directory);
  return directory;
};
const digest = (text: string) => createHash('sha256').update(text).digest('hex');
const finalLogBytes = 544 * 1024;
const finalTruncationMarker = '[evidence truncated to final byte budget]';

function observation(overrides: Partial<RecordedObservation> = {}): RecordedObservation {
  return {
    argv: [process.execPath, 'fixture.js'], cwdIdentity: '/safe/workdir', executableIdentity: process.execPath,
    startedAt: '2026-11-25T00:00:00.000Z', endedAt: '2026-11-25T00:00:01.000Z', exitCode: 0,
    termination: 'NONE', stdout: '', stderr: '', truncated: false,
    ...overrides,
  };
}

async function write(value: RecordedObservation, directory: string, status = statusFromObservation(value), expectedNegative?: { assertedFailure: string; observed: true }): Promise<CommandEvidence> {
  return writeCommandEvidence(value, join(directory, 'evidence'), '00-command', status, expectedNegative);
}

describe('M01/M03 baseline evidence confidentiality projection', () => {
  it('redacts registered and structured synthetic secrets while retaining benign diagnostics and exact status', async () => {
    const directory = root();
    const script = join(directory, 'reproduce.cjs');
    const token = 'synthetic-line-one\nline-two+/=20261125';
    const jsonSecret = 'json-structured-secret-20261125';
    const bearerSecret = 'bearer-structured-secret-20261125';
    const passwordSecret = 'password-structured-secret-20261125';
    const urlSecret = 'url-structured-secret-20261125';
    const privateKeyBody = 'PRIVATEKEYBODYsynthetic20261125';
    writeFileSync(script, `
const token = process.env.M01_TEST_SECRET_TOKEN;
const jsonSecret = ${JSON.stringify(jsonSecret)};
const bearerSecret = ${JSON.stringify(bearerSecret)};
const passwordSecret = ${JSON.stringify(passwordSecret)};
const urlSecret = ${JSON.stringify(urlSecret)};
const privateKeyBody = ${JSON.stringify(privateKeyBody)};
const midpoint = Math.floor(token.length / 2);
const ansi = token.slice(0, midpoint) + '\\x1b[31m' + token.slice(midpoint) + '\\x1b[0m';
process.stdout.write([
  'ordinary public diagnostic',
  'raw=' + token,
  'json=' + JSON.stringify({ api_key: jsonSecret, note: 'public-neighbor' }),
  'ansi=' + ansi,
  'percent=' + encodeURIComponent(token),
  'base64=' + Buffer.from(token, 'utf8').toString('base64'),
  'multiline=' + token,
  ''
].join('\\n'));
process.stderr.write([
  'Authorization: Bearer ' + bearerSecret,
  'password=' + passwordSecret,
  'url=https://user:' + urlSecret + '@example.invalid/path',
  '-----BEGIN PRIVATE KEY-----',
  privateKeyBody,
  '-----END PRIVATE KEY-----',
  ''
].join('\\n'));
`);
    const value = await runRecordedCommand(process.execPath, [script], {
      cwd: directory, environment: { M01_TEST_SECRET_TOKEN: token },
    });
    expect(value.exitCode, value.stderr).toBe(0);
    const evidence = await write(value, directory, statusFromObservation(value, { expectedNegativeMarker: 'ordinary public diagnostic' }), { assertedFailure: 'ordinary public diagnostic', observed: true });
    const log = readFileSync(evidence.boundedLogRef, 'utf8');
    expect(evidence.status).toBe('EXPECTED_NEGATIVE');
    expect(log).toContain('ordinary public diagnostic');
    expect(log).toContain('public-neighbor');
    expect(log).toContain('[REDACTED]');
    for (const secret of [
      token,
      encodeURIComponent(token),
      Buffer.from(token, 'utf8').toString('base64'),
      jsonSecret, bearerSecret, passwordSecret, urlSecret, privateKeyBody,
    ]) expect(log).not.toContain(secret);
    expect(evidence.logDigest).toBe(digest(log));
    expect(evidence.argv).toEqual([process.execPath, script]);
  });

  it.each([
    ['argv', { argv: [process.execPath, 'password=argv-structured-secret-20261125'] }],
    ['cwd', { cwdIdentity: '/tmp/password=cwd-structured-secret-20261125' }],
    ['executable', { executableIdentity: '/tmp/password=executable-structured-secret-20261125' }],
  ])('refuses secret-bearing exact %s identity instead of publishing a falsely exact receipt', async (_name, patch) => {
    const directory = root();
    const value = observation(patch);
    await expect(write(value, directory)).rejects.toMatchObject({ code: 'EVIDENCE_ADMISSION_DENIED' });
    expect(existsSync(join(directory, 'evidence', '00-command.log'))).toBe(false);
  });

  it('rejects oversize exact command identity before creating an artifact', async () => {
    const directory = root();
    const value = observation({ argv: [process.execPath, 'x'.repeat(17 * 1024)] });
    await expect(write(value, directory)).rejects.toMatchObject({ code: 'EVIDENCE_ADMISSION_DENIED' });
    expect(existsSync(join(directory, 'evidence'))).toBe(false);
  });

  it('does not launch a child when an intentionally injected short secret is outside supported redaction scope', async () => {
    const directory = root();
    const script = join(directory, 'fixture.cjs');
    writeFileSync(script, "console.log('execution-canary');\n");
    const value = await runRecordedCommand(process.execPath, [script], {
      cwd: directory, environment: { M01_TEST_SECRET_TOKEN: 'short' },
    });
    expect(value.termination).toBe('SPAWN_ERROR');
    expect(value.exitCode).toBeNull();
    expect(value.spawnError).toBe('Evidence admission denied: sensitive value is outside supported redaction scope.');
    expect(value.stdout).not.toContain('execution-canary');
    const evidence = await write(value, directory, statusFromObservation(value));
    expect(evidence.status).toBe('BLOCKED');
    expect(readFileSync(evidence.boundedLogRef, 'utf8')).not.toContain('execution-canary');
  });

  it('redacts and bounds spawn diagnostics without exposing structured password material', async () => {
    const directory = root();
    const secret = 'spawn-password-secret-20261125';
    const value = observation({
      exitCode: null, termination: 'SPAWN_ERROR',
      spawnError: 'spawn failed password=' + secret + '\n' + 'x'.repeat(20 * 1024),
    });
    const evidence = await write(value, directory, 'BLOCKED');
    const log = readFileSync(evidence.boundedLogRef, 'utf8');
    expect(log).not.toContain(secret);
    expect(log).toContain('[diagnostic truncated to metadata budget]');
    expect(Buffer.byteLength(log, 'utf8')).toBeLessThanOrEqual(finalLogBytes);
    expect(evidence.logDigest).toBe(digest(log));
  });

  it('refuses unsafe exact command identity before launching the child', async () => {
    const directory = root();
    const secret = 'preflight-sensitive-value-20261125';
    const marker = join(directory, 'child-launched');
    const observed = await runRecordedCommand(process.execPath, [
      '-e', 'require("node:fs").writeFileSync(process.argv[1], "launched")', marker, 'password=' + secret,
    ], { cwd: directory, sensitiveValues: [secret] });
    expect(observed.termination).toBe('SPAWN_ERROR');
    expect(existsSync(marker)).toBe(false);
    await expect(write(observed, directory, 'BLOCKED')).rejects.toMatchObject({ code: 'EVIDENCE_ADMISSION_DENIED' });
  });

  it('redacts an explicit host-private sensitive value without publishing it through the receipt or log', async () => {
    const directory = root();
    const secret = 'explicit-sensitive-value-20261125';
    const evidence = await writeCommandEvidence(observation({ stdout: 'before ' + secret + ' after' }),
      join(directory, 'evidence'), '00-command', 'PASS', undefined, { sensitiveValues: [secret] });
    const log = readFileSync(evidence.boundedLogRef, 'utf8');
    expect(log).toContain('before [REDACTED] after');
    expect(log).not.toContain(secret);
    expect(JSON.stringify(evidence)).not.toContain(secret);
  });

  it('does not replace an existing command evidence log', async () => {
    const directory = root();
    const value = observation({ stdout: 'first immutable diagnostic' });
    const evidence = await write(value, directory, 'PASS');
    const before = readFileSync(evidence.boundedLogRef, 'utf8');
    await expect(write(observation({ stdout: 'replacement must not publish' }), directory, 'PASS'))
      .rejects.toMatchObject({ code: 'EVIDENCE_WRITE_FAILED' });
    expect(readFileSync(evidence.boundedLogRef, 'utf8')).toBe(before);
    expect(readFileSync(evidence.boundedLogRef, 'utf8')).not.toContain('replacement must not publish');
  });


  it('redacts canonical declared-scope variants that previously bypassed matching', async () => {
    const directory = root();
    const token = 'canonical-sensitive-token-20261125';
    const encodedLower = encodeURIComponent(token).replace(/%([0-9A-F]{2})/g, (_all, hex) => '%' + String(hex).toLowerCase());
    const base64 = Buffer.from(token, 'utf8').toString('base64');
    const base64UrlPadded = base64.replace(/\+/g, '-').replace(/\//g, '_');
    const wrappedBase64 = base64.replace(/(.{8})/g, '$1\n');
    const ansiSplit = token.slice(0, 8) + '\x1b7' + token.slice(8) + '\x1b8';
    const jsonUnicodeKeySecret = 'json-unicode-key-secret-20261125';
    const commaSecret = 'comma-prefix,comma-suffix-secret-20261125';
    const urlSecret = 'empty-user-url-secret-20261125';
    const pgpBody = 'PGPPRIVATEKEYBODYsynthetic20261125';
    const value = observation({
      stdout: [
        'ansi=' + ansiSplit,
        'lower-percent=' + encodedLower,
        'base64url-padded=' + base64UrlPadded,
        'wrapped-base64=' + wrappedBase64,
        '{"api\u005fkey":"' + jsonUnicodeKeySecret + '"}',
        'password=' + commaSecret,
        'url=https://:' + urlSecret + '@example.invalid/path',
        '-----BEGIN PGP PRIVATE KEY BLOCK-----',
        pgpBody,
        '-----END PGP PRIVATE KEY BLOCK-----',
      ].join('\n'),
    });
    const evidence = await writeCommandEvidence(value, join(directory, 'evidence'), '00-command', 'PASS', undefined, { sensitiveValues: [token] });
    const log = readFileSync(evidence.boundedLogRef, 'utf8');
    for (const secret of [token, encodedLower, base64UrlPadded, jsonUnicodeKeySecret, commaSecret, 'comma-prefix', ',comma-suffix-secret-20261125', urlSecret, pgpBody])
      expect(log).not.toContain(secret);
  });

  it('removes a proper prefix of a registered secret at a truncated pipe boundary', async () => {
    const directory = root();
    const secret = 'boundary-secret-20261125';
    const partial = secret.slice(0, secret.length - 1);
    const value = observation({ stdout: 'public diagnostic ' + partial, truncated: true });
    const evidence = await writeCommandEvidence(value, join(directory, 'evidence'), '00-command', 'PASS', undefined, { sensitiveValues: [secret] });
    const log = readFileSync(evidence.boundedLogRef, 'utf8');
    expect(log).toContain('public diagnostic');
    expect(log).not.toContain(partial);
  });

  it.each([
    ['an empty exact argv element', observation({ argv: [process.execPath, ''] }), 'PASS', undefined],
    ['a PASS status for an exit-seven observation', observation({ exitCode: 7 }), 'PASS', undefined],
    ['an unproven expected-negative status', observation(), 'EXPECTED_NEGATIVE', undefined],
  ])('rejects %s instead of writing invalid command evidence', async (_name, value, status, expectedNegative) => {
    const directory = root();
    await expect(writeCommandEvidence(value, join(directory, 'evidence'), '00-command', status as never, expectedNegative as never))
      .rejects.toMatchObject({ code: 'EVIDENCE_ADMISSION_DENIED' });
    expect(existsSync(join(directory, 'evidence'))).toBe(false);
  });

  it('rejects evidence id traversal and secret-shaped artifact paths', async () => {
    const directory = root();
    await expect(writeCommandEvidence(observation(), join(directory, 'evidence'), '../escape', 'PASS'))
      .rejects.toMatchObject({ code: 'EVIDENCE_ADMISSION_DENIED' });
    expect(existsSync(join(directory, 'escape.log'))).toBe(false);
    const secretPath = join(directory, 'password=artifact-path-secret-20261125', 'evidence');
    await expect(writeCommandEvidence(observation(), secretPath, '00-command', 'PASS'))
      .rejects.toMatchObject({ code: 'EVIDENCE_ADMISSION_DENIED' });
  });

  it('bounds the final combined serialized log with a deterministic UTF-8-safe marker and exact digest', async () => {
    const directory = root();
    const value = observation({
      stdout: 'stdout-public\n' + 'x'.repeat(300 * 1024),
      stderr: 'stderr-public\n' + '😀'.repeat(90 * 1024),
    });
    const evidence = await write(value, directory, 'PASS');
    const log = readFileSync(evidence.boundedLogRef, 'utf8');
    expect(Buffer.byteLength(log, 'utf8')).toBeLessThanOrEqual(finalLogBytes);
    expect(log).toContain(finalTruncationMarker);
    expect(log).toContain('argv: ');
    expect(log).toContain('cwd: ');
    expect(log).toContain('executable: ');
    expect(log).toContain('status: PASS');
    expect(log).toContain('termination: NONE');
    expect(log).toContain('exitCode: 0');
    expect(log).toContain('--- stdout ---');
    expect(log).toContain('--- stderr ---');
    expect(log).not.toContain('�');
    expect(evidence.logDigest).toBe(digest(log));
  });
});
