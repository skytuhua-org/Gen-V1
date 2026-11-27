import { describe, expect, it } from 'vitest';
import type { BenchmarkMeasurement, BenchmarkRecord, BenchmarkRun } from '../packages/contracts/implementation-evidence.ts';
import { benchmarkReportHtml } from '../scripts/research-baseline.ts';
import {startupBudgetFailures} from '../scripts/bench-startup.ts';

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

const measurement=(name:string,value:number,samples_ms=[value])=>({name,samples_ms,p50:value,p95:value});
const host=()=>[measurement('review_host_boot_ms',100),measurement('snapshot_serialize_ms',10),measurement('store_snapshot_ms',10)];
const browser=()=>[measurement('first_render_ms',600),measurement('split_interaction_ms',150)];

describe('startup benchmark budget gate',()=>{
 it('refuses both zero-sample and omitted required metrics',()=>{
  const reports=[...host(),measurement('first_render_ms',0,[])];
  expect(startupBudgetFailures(reports,false)).toEqual(['BUDGET first_render_ms has no samples.','BUDGET split_interaction_ms has no samples.']);
 });

 it('does not treat a host or browser arm as measured just because its zero summary meets the ceiling',()=>{
  const reports=[...host().slice(1),...browser()];
  expect(startupBudgetFailures(reports,false)).toEqual(['BUDGET review_host_boot_ms has no samples.']);
 });

 it('excludes browser budgets only for an explicit host-only run',()=>{
  expect(startupBudgetFailures(host(),true)).toEqual([]);
  expect(startupBudgetFailures(host(),false)).toHaveLength(2);
 });

 it('preserves performance checks on observed metrics and ignores unbudgeted arms',()=>{
  expect(startupBudgetFailures([...host(),...browser(),measurement('host_boot_ms',0,[])],false)).toEqual([]);
  expect(startupBudgetFailures([...host(),measurement('first_render_ms',755),browser()[1]!],false)).toEqual(['BUDGET first_render_ms p95 755ms > 754.51ms']);
 });
});
