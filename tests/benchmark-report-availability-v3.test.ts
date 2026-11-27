import { describe, expect, it } from 'vitest';
import type { BenchmarkMeasurement, BenchmarkRecord, BenchmarkRun } from '../packages/contracts/implementation-evidence.ts';
import { benchmarkReportHtml } from '../scripts/research-baseline.ts';

const unavailable: BenchmarkMeasurement = {
  elapsedMs: null, coldStartMs: null, firstPublicResponseMs: null, requests: null,
  inputBytes: null, outputBytes: null, cacheInputBytes: null, cacheOutputBytes: null,
  totalCostBytes: null, backgroundCostBytes: null, completionQuality: null,
};
const record = (baseline: BenchmarkRun | null, candidate: BenchmarkRun | null): BenchmarkRecord => ({
  fixture: 'unexecuted paired fixture', model: null, account: null,
  config: 'No provider configured', seed: 42, baseline, candidate,
  notes: ['Report rendering fixture only; no model workload executed.'],
});
const rows = (html: string): string[][] => [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)]
  .map(match => [...match[1]!.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map(cell => cell[1]!))
  .filter(cells => cells.length > 0);

function expectUnavailable(row: string[] | undefined, role: 'baseline' | 'candidate') {
  expect(row).toBeDefined();
  expect(row!.slice(0, 6)).toEqual([
    'unexecuted paired fixture', 'No provider configured', 'unavailable', role, 'UNAVAILABLE', '42',
  ]);
  expect(row!.slice(6, 17)).toEqual(Array(11).fill('unavailable'));
  expect(row![17]).toContain('no model workload executed');
}

describe('M01 unavailable paired benchmark evidence', () => {
  it('keeps both unavailable arms and the named fixture visible', () => {
    const result = rows(benchmarkReportHtml([record(null, null)]));
    expect(result).toHaveLength(2);
    expectUnavailable(result[0], 'baseline');
    expectUnavailable(result[1], 'candidate');
  });

  it.each(['open', 'close'])('removes owned review directories when review host %s fails', async phase => {
    const [{ execFile }, { mkdtemp, readdir, rm }, { tmpdir }, { join }, { promisify }] = await Promise.all([
      import('node:child_process'), import('node:fs/promises'), import('node:os'), import('node:path'), import('node:util'),
    ]);
    const scratch = await mkdtemp(join(tmpdir(), 'startup-review-test-'));
    try {
      const source = `
        import { registerHooks } from 'node:module';
        const phase = ${JSON.stringify(phase)};
        const sources = {
          './review-host.ts': phase === 'open'
            ? 'export async function openReviewHost() { throw Error("injected review open failure"); }'
            : 'export async function openReviewHost() { return { async close() { throw Error("injected review close failure"); } }; }',
          '../apps/desktop/backend-policy.ts': 'export function nodeSidecarArguments() { return ["-e", "process.exit(1)"]; }',
        };
        registerHooks({ resolve(specifier, context, next) {
          if (context.parentURL?.endsWith('/scripts/bench-startup.ts') && Object.hasOwn(sources, specifier)) {
            return { shortCircuit: true, url: 'data:text/javascript,' + encodeURIComponent(sources[specifier]) };
          }
          return next(specifier, context);
        } });
        process.argv.splice(1, 0, 'scripts/bench-startup.ts');
        await import('./scripts/bench-startup.ts');
      `;
      await expect(promisify(execFile)(process.execPath, [
        '--import', 'tsx', '--input-type=module', '--eval', source, '--', '--runs', '1', '--skip-browser',
      ], { encoding: 'utf8', windowsHide: true, timeout: 15_000, env: { ...process.env, TMPDIR: scratch, TEMP: scratch, TMP: scratch } })).rejects.toMatchObject({
        code: 1, stdout: '', stderr: expect.stringContaining('injected review ' + phase + ' failure'),
      });
      expect((await readdir(scratch)).filter(name => name.startsWith('bench-review-'))).toEqual([]);
    } finally { await rm(scratch, { recursive: true, force: true }); }
  }, 20_000);

  it('keeps an unavailable candidate beside an observed baseline', () => {
    const baseline: BenchmarkRun = { role: 'baseline', status: 'PASS', measurement: { ...unavailable, inputBytes: 123 } };
    const result = rows(benchmarkReportHtml([record(baseline, null)]));
    expect(result).toHaveLength(2);
    expect(result[0]![3]).toBe('baseline');
    expect(result[0]![4]).toBe('PASS');
    expect(result[0]![10]).toBe('123 B');
    expectUnavailable(result[1], 'candidate');
  });

  it('keeps an unavailable baseline beside an observed failed candidate', () => {
    const candidate: BenchmarkRun = { role: 'candidate', status: 'FAIL', measurement: unavailable };
    const result = rows(benchmarkReportHtml([record(null, candidate)]));
    expect(result).toHaveLength(2);
    expectUnavailable(result[0], 'baseline');
    expect(result[1]![3]).toBe('candidate');
    expect(result[1]![4]).toBe('FAIL');
  });

  it('preserves distinct present outcomes and unavailable counters', () => {
    const baseline: BenchmarkRun = { role: 'baseline', status: 'SETUP_FAILED', measurement: unavailable };
    const candidate: BenchmarkRun = { role: 'candidate', status: 'EXPECTED_NEGATIVE', measurement: unavailable };
    const result = rows(benchmarkReportHtml([record(baseline, candidate)]));
    expect(result.map(row => row[4])).toEqual(['SETUP_FAILED', 'EXPECTED_NEGATIVE']);
    for (const row of result) expect(row.slice(6, 17)).toEqual(Array(11).fill('unavailable'));
  });
});
