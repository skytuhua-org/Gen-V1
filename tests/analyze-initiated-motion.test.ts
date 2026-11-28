import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { expect, it } from 'vitest';

const execute = promisify(execFile);
const script = resolve('scripts/analyze-initiated-motion.ts');
const loader = pathToFileURL(resolve('node_modules/tsx/dist/loader.mjs')).href;
const sourcesPath = 'docs/evidence/frontend-review/fidelity-20261030/analysis/originals-metadata.json';

async function fixture() {
  const directory = await mkdtemp(join(tmpdir(), 'harness-motion-analysis-'));
  await mkdir(join(directory, dirname(sourcesPath)), { recursive: true });
  await writeFile(join(directory, sourcesPath), '[]');
  return directory;
}
async function cleanup(directory: string) {
  if (dirname(directory) !== resolve(tmpdir()) || !basename(directory).startsWith('harness-motion-analysis-')) throw new Error('Refusing cleanup outside the owned fixture.');
  await rm(directory, { recursive: true, force: true });
}
const run = (directory: string) => execute(process.execPath, ['--import', loader, script, '.', '--inspect-only'], { cwd: directory, encoding: 'utf8', timeout: 60_000 });

it('fails clearly when the capture manifest is missing instead of writing an empty analysis', async () => {
  const directory = await fixture();
  try {
    await expect(run(directory)).rejects.toThrow(/Capture manifest is missing or unreadable.*manifest\.json/);
  } finally { await cleanup(directory); }
});

it('fails clearly when the capture manifest is malformed JSON', async () => {
  const directory = await fixture();
  await writeFile(join(directory, 'manifest.json'), '{captures');
  try {
    await expect(run(directory)).rejects.toThrow(/Capture manifest is missing or unreadable/);
  } finally { await cleanup(directory); }
});

it('fails clearly when the manifest has no captures array', async () => {
  const directory = await fixture();
  await writeFile(join(directory, 'manifest.json'), JSON.stringify({ captures: 'not-an-array' }));
  try {
    await expect(run(directory)).rejects.toThrow(/Capture manifest has no captures array/);
  } finally { await cleanup(directory); }
});

it('accepts a valid empty manifest and records zero observations', async () => {
  const directory = await fixture();
  await writeFile(join(directory, 'manifest.json'), JSON.stringify({ captures: [] }));
  try {
    const { stdout } = await run(directory);
    expect(JSON.parse(stdout)).toMatchObject({ captures: 0, observations: 0, inspectOnly: true });
    const evidence = JSON.parse(await readFile(join(directory, 'analysis/probe-observations.json'), 'utf8'));
    expect(evidence.observations).toEqual([]);
  } finally { await cleanup(directory); }
});
