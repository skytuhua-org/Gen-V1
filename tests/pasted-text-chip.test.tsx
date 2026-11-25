import {afterAll, beforeAll, describe, it} from 'vitest';
import {expect} from '@playwright/test';
import {build} from 'esbuild';
import {readFile} from 'node:fs/promises';
import {createServer, type Server} from 'node:http';
import {chromium, type Browser, type Page} from '@playwright/test';

const fixture = `
import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ComposerAttachments} from './apps/web/src/ComposerAttachments';

const paste=(id,text)=>({version:1,id,createdAt:'2026-01-01T00:00:00.000Z',text});
const lines=(n)=>Array.from({length:n},(_,i)=>'line '+(i+1)).join('\\n');

function Fixture(){
 const [pastes,setPastes]=useState([paste('p1',lines(240)),paste('p2','<b>literal</b>')]);
 const [inserted,setInserted]=useState('');
 window.__edits??=[];window.__removes??=[];window.__inserts??=[];
 window.addPaste=(id,text)=>setPastes(list=>[...list,paste(id,text)]);
 window.dropPastes=()=>setPastes([]);
 return <>
  <ComposerAttachments resources={[]} pastes={pastes}
   onEditPaste={async(id,text)=>{window.__edits.push([id,text]);setPastes(list=>list.map(p=>p.id===id?{...p,text}:p));}}
   onRemovePaste={async(id)=>{window.__removes.push(id);setPastes(list=>list.filter(p=>p.id!==id));}}
   onInsertPaste={(_id,text)=>{window.__inserts.push(text);setInserted(text);}}/>
  <output data-testid="inserted">{inserted}</output>
 </>;
}
createRoot(document.getElementById('root')).render(<Fixture/>);
`;

describe('pasted text chip', () => {
  let browser: Browser, server: Server, base: string;
  beforeAll(async () => {
    const script = (await build({stdin:{contents:fixture,resolveDir:process.cwd(),loader:'tsx'},loader:{'.css':'empty'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'}})).outputFiles[0]!.text;
    const css = await readFile('packages/ui-shell/tokens.css','utf8') + await readFile('packages/ui-shell/feedback.css','utf8') + await readFile('apps/web/src/styles.css','utf8') + await readFile('apps/web/src/composer-entry.css','utf8') + await readFile('apps/web/src/pasted-text.css','utf8');
    server = createServer((_request, response) => { response.setHeader('content-type', 'text/html'); response.end(`<style>${css}</style><div id="root"></div><script>${script}</script>`); });
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    const address = server.address(); base = `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;
    browser = await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});
  });
  afterAll(async () => { await browser?.close(); server?.close(); });
  async function open(): Promise<Page> { const page = await browser.newPage(); await page.goto(`${base}/`); return page; }

  it('renders the label, line count and tooltip', async () => {
    const page = await open();
    const openButton = page.locator('.pasted-text-chip .pasted-text-open').first();
    await expect(openButton).toBeVisible();
    await expect(openButton).toContainText('Pasted text');
    await expect(openButton).toContainText('· 240 lines');
    await expect(openButton).toHaveAttribute('title', 'line 1');
    await expect(openButton).toHaveAttribute('aria-label', 'Pasted text, 240 lines. Open to review');
    await expect(page.locator('.pasted-text-chip button[aria-label="Remove pasted text, 240 lines"]')).toBeVisible();
    await page.close();
  });
  it('opens the dialog, edits and saves; empty save removes the chip', async () => {
    const page = await open();
    await page.locator('.pasted-text-chip .pasted-text-open').first().click();
    const dialog = page.locator('dialog[open]');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('textarea')).toHaveValue(/line 1/);
    await expect(dialog.locator('.pasted-text-count')).toContainText('240 lines');
    await dialog.locator('textarea').fill('edited body');
    await dialog.getByRole('button', {name: 'Save'}).click();
    await expect(dialog).toBeHidden();
    expect(await page.evaluate(() => (window as unknown as Record<string, unknown>).__edits)).toEqual([['p1', 'edited body']]);
    // Save with an empty textarea removes the chip.
    await page.locator('.pasted-text-chip .pasted-text-open').first().click();
    await dialog.locator('textarea').fill('');
    await dialog.getByRole('button', {name: 'Save'}).click();
    expect(await page.evaluate(() => (window as unknown as Record<string, unknown>).__removes)).toEqual(['p1']);
    await page.close();
  });
  it('Insert as text calls onInsertPaste with the edited text', async () => {
    const page = await open();
    await page.locator('.pasted-text-chip .pasted-text-open').first().click();
    const dialog = page.locator('dialog[open]');
    await dialog.locator('textarea').fill('insert me');
    await dialog.getByRole('button', {name: 'Insert as text'}).click();
    await expect(dialog).toBeHidden();
    expect(await page.evaluate(() => (window as unknown as Record<string, unknown>).__inserts)).toEqual(['insert me']);
    await page.close();
  });
  it('renders pasted markup as literal text, not HTML', async () => {
    const page = await open();
    const chips = page.locator('.pasted-text-chip');
    expect(await chips.count()).toBe(2);
    await chips.nth(1).locator('.pasted-text-open').click();
    await expect(page.locator('dialog[open] textarea')).toHaveValue('<b>literal</b>');
    await expect(page.locator('dialog[open] b')).toHaveCount(0);
    await page.close();
  });
  it('marks chips leaving until the exit animation ends, and skips it under reduced motion', async () => {
    const page = await open();
    await page.locator('.pasted-text-chip button[aria-label="Remove pasted text, 1 line"]').click();
    const leaving = page.locator('.pasted-text-chip[data-leaving]');
    await expect(leaving).toBeVisible();
    await expect(leaving).toContainText('1 line');
    await leaving.evaluate(el => el.dispatchEvent(new AnimationEvent('animationend', {animationName: 'ui-item-out'})));
    await expect(leaving).toBeHidden();
    await page.close();
    const reduced = await browser.newPage({reducedMotion: 'reduce'});
    await reduced.goto(`${base}/`);
    await reduced.locator('.pasted-text-chip button[aria-label="Remove pasted text, 1 line"]').click();
    await expect(reduced.locator('.pasted-text-chip[data-leaving]')).toHaveCount(0);
    await reduced.close();
  });
});
