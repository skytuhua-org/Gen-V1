import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { createServer, type Server } from 'node:http';
import { chromium, expect as pw, type Browser, type Page } from '@playwright/test';
import { serveTaskFixture, taskFixture, type TaskSpec } from './e2e/task-interface-fixture';
import type { Snapshot } from '../packages/contracts';

// #1964 T01: a recovered artifact draft must never overwrite a newer saved
// revision. Two synthetic editor contexts share one state: the first saves a
// newer revision, the second remounts with an older recovered draft in the
// journal and must not silently clobber the newer content.

const fixture = `
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Artifact } from './apps/web/src/Artifact';
import { journalWrite, journalRead } from './apps/web/src/journal';
import './apps/web/src/styles.css';

(window as any).writeDraft = (key: string, value: unknown) => journalWrite(key, value);
(window as any).readDraft = (key: string) => journalRead(key);

function Fixture() {
  const [snapshot, setSnapshot] = useState<any>(null);
  const [visible, setVisible] = useState(false), [generation, setGeneration] = useState(0);
  useEffect(() => { void fetch('/api/snapshot', { credentials: 'same-origin' }).then(response => response.json()).then(setSnapshot); }, []);
  return <main style={{ maxWidth: 1040, margin: '0 auto', padding: 24 }}>
    <nav aria-label="Fixture controls">
      <button disabled={!snapshot} onClick={() => { setGeneration(value => value + 1); setVisible(true); }}>Mount artifact</button>
      <button onClick={() => setVisible(false)}>Unmount artifact</button>
    </nav>
    {visible && snapshot && <Artifact key={generation} artifact={snapshot.artifacts[0]} snapshot={snapshot} theme="dark" refresh={async next => { if (next) setSnapshot(next); }} />}
  </main>;
}
createRoot(document.getElementById('root')!).render(<Fixture />);
`;

const spec = (): TaskSpec => ({ root: 'body', elements: { body: { type: 'Stack', props: { gap: 'sm' }, children: ['note', 'records'] }, note: { type: 'Input', props: { stateKey: 'note', label: 'Artifact note' } }, records: { type: 'Table', props: { rowsBinding: 'rows', caption: 'Source records', columns: [{ key: 'name', label: 'Name' }, { key: 'detail', label: 'Detail' }] } } } });
const resetJournal = `indexedDB.deleteDatabase('generative-harness-journal');`;

let browser: Browser, server: Server, base: string;

describe('artifact draft recovery (#1964)', () => {
  beforeAll(async () => {
    const script = (await build({ stdin: { contents: fixture, resolveDir: process.cwd(), loader: 'tsx' }, loader: { '.css': 'empty' }, bundle: true, write: false, format: 'iife', platform: 'browser', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' } })).outputFiles[0]!.text;
    const cssFiles = ['packages/ui-shell/tokens.css', 'apps/web/src/styles.css', 'apps/web/src/task-motion.css', 'apps/web/src/task-interface.css', 'apps/web/src/task-table.css', 'apps/web/src/loading-state.css', 'apps/web/src/markdown.css', 'apps/web/src/sentence-reveal.css', 'apps/web/src/frontend-fidelity.css'];
    const css = (await Promise.all(cssFiles.map(file => readFile(file, 'utf8')))).join('\n');
    server = createServer((_request, response) => { response.setHeader('content-type', 'text/html; charset=utf-8'); response.end(`<style>${css}</style><div id="root"></div><script>${script}</script>`); });
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    const address = server.address(); base = `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;
    browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'msedge' } : {}) });
  }, 120_000);
  afterAll(async () => { await browser?.close(); server?.close(); });

  async function openPage(): Promise<{ page: Page; snapshot: Snapshot }> {
    const page = await browser.newPage();
    await page.addInitScript(resetJournal);
    const snapshot = taskFixture(spec(), { rows: [{ name: 'Record 1', detail: 'Synthetic detail' }] }, { note: 'Original content' });
    const host = await serveTaskFixture(page, snapshot);
    await page.setViewportSize({ width: 1024, height: 1000 });
    await page.goto(`${base}/`);
    return { page, snapshot: host.snapshot };
  }

  it('keeps the newer saved revision when an older recovered draft mounts', async () => {
    const { page, snapshot } = await openPage();
    await page.getByRole('button', { name: 'Mount artifact', exact: true }).click();
    await pw(page.getByLabel('Artifact note', { exact: true })).toHaveValue('Original content');
    // First editor context: save a newer revision on the host.
    await page.getByLabel('Artifact note', { exact: true }).fill('Newer saved content');
    await pw(page.getByText('Saved', { exact: true })).toBeVisible({ timeout: 15000 });
    expect(snapshot.userStates[0]!.revision).toBe(1);
    // Crash-window journal state: an older draft still sits in the journal.
    await page.evaluate(() => (window as any).writeDraft('state:task-state', { baseRevision: 0, values: { note: 'Stale recovered draft' } }));
    await page.getByRole('button', { name: 'Unmount artifact', exact: true }).click();
    // Second editor context remounts with the stale recovered draft.
    await page.getByRole('button', { name: 'Mount artifact', exact: true }).click();
    // The stale draft must not be applied on top of revision 1.
    await pw(page.getByLabel('Artifact note', { exact: true })).toHaveValue('Newer saved content', { timeout: 10000 });
    await pw(page.getByRole('button', { name: 'Newer state is saved · recovered draft kept' })).toBeVisible();
    // Even an explicit save must not overwrite the newer host revision.
    await page.getByRole('button', { name: /draft|save/i }).first().click();
    await page.waitForTimeout(2500);
    expect(snapshot.userStates[0]!.values.note).toBe('Newer saved content');
    // The recovered draft stays in the journal for user resolution.
    expect(await page.evaluate(() => (window as any).readDraft('state:task-state'))).toEqual({ baseRevision: 0, values: { note: 'Stale recovered draft' } });
    // Editing on top of the newer revision still saves normally.
    await page.getByLabel('Artifact note', { exact: true }).fill('Newest user edit');
    await pw(page.getByText('Saved', { exact: true })).toBeVisible({ timeout: 15000 });
    expect(snapshot.userStates[0]!.values.note).toBe('Newest user edit');
    expect(snapshot.userStates[0]!.revision).toBe(2);
  });

  it('applies a recovered draft whose base still matches the host revision', async () => {
    const { page, snapshot } = await openPage();
    await page.getByRole('button', { name: 'Mount artifact', exact: true }).click();
    await page.getByLabel('Artifact note', { exact: true }).fill('Newer saved content');
    await pw(page.getByText('Saved', { exact: true })).toBeVisible({ timeout: 15000 });
    expect(snapshot.userStates[0]!.revision).toBe(1);
    // A draft recovered on top of the current revision applies and saves normally.
    await page.evaluate(() => (window as any).writeDraft('state:task-state', { baseRevision: 1, values: { note: 'Legitimate recovery' } }));
    await page.getByRole('button', { name: 'Unmount artifact', exact: true }).click();
    await page.getByRole('button', { name: 'Mount artifact', exact: true }).click();
    await pw(page.getByLabel('Artifact note', { exact: true })).toHaveValue('Legitimate recovery', { timeout: 10000 });
    await page.getByRole('button', { name: 'Recovered draft · save to sync' }).click();
    await pw(page.getByText('Saved', { exact: true })).toBeVisible({ timeout: 15000 });
    expect(snapshot.userStates[0]!.values.note).toBe('Legitimate recovery');
  });
});
