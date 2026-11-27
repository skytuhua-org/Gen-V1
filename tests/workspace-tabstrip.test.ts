import path from 'path';

declare global { interface Window { setTab?: (id: string) => void } }
import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {build} from 'esbuild';
import {chromium, type Browser, type Page} from '@playwright/test';

const fixture = `
import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {WorkspaceProvider} from './apps/web/src/workspace-context';
import {WorkspacePanel} from './apps/web/src/WorkspacePanel';
import {DEFAULT_PREFERENCES} from './packages/contracts/preferences';

const layout = {sidebarCollapsed:false,sidebarWidth:248,rightPanelOpen:true,rightPanelWidth:280,rightPanelMaximized:false,activeTab:'artifact',openTabs:['artifact'],activeArtifactId:null,folded:{}};
function Fixture(){
  const [openTabs,setOpenTabs]=useState(['artifact','plan','diff','files','terminal','notes','output','usage']);
  const [activeTab,setActiveTab]=useState('artifact');
  window.setTab=(id)=>setActiveTab(id);
  const value={activeArtifactId:null,requestOpenArtifact:()=>{},closeArtifact:()=>{},rightPanelOpen:true,activeTab,setActiveTab,openTabs,openTab:(t)=>setOpenTabs(o=>o.includes(t)?o:[...o,t]),closeTab:(t)=>setOpenTabs(o=>o.filter(x=>x!==t))};
  return <div style={{width:280,overflow:'hidden'}}><WorkspaceProvider value={value}><WorkspacePanel snapshot={{artifacts:[],threads:[],counts:{}} as never} preferences={DEFAULT_PREFERENCES} layout={layout} setWidth={()=>{}}/></WorkspaceProvider></div>;
}
createRoot(document.getElementById('root')).render(<Fixture/>);
`;

describe('Workspace tab strip (#1741)', () => {
  let browser: Browser, page: Page;
  beforeAll(async () => {
    const script = (await build({stdin: {contents: fixture, resolveDir: process.cwd(), loader: 'tsx'}, loader: {'.css': 'empty'}, plugins: [{name: 'stub-surface', setup(api) { api.onResolve({filter: /WorkspaceSurfaceBody$/}, () => ({path: path.resolve('tests/workspace-tabstrip-surface-stub.tsx')})); }}], bundle: true, write: false, format: 'iife', platform: 'browser', jsx: 'automatic', define: {'process.env.NODE_ENV': '"production"'}})).outputFiles[0]!.text;
    browser = await chromium.launch({headless: true, ...(process.platform === 'win32' ? {channel: 'msedge'} : {})});
    page = await browser.newPage();
    await page.setViewportSize({width: 400, height: 800});
    await page.setContent('<style>.workspace-right-header{display:flex;overflow:hidden}.workspace-right-header [role=tablist]{display:flex;overflow-x:auto;scrollbar-width:none}.workspace-right-header [role=tab]{white-space:nowrap;flex:0 0 auto}</style><div id="root"></div>');
    await page.addScriptTag({content: 'if(!crypto.randomUUID)crypto.randomUUID=()=>"00000000-0000-4000-8000-000000000000";'});
    await page.addScriptTag({content: script});
    await page.locator('role=tab').first().waitFor();
  });
  afterAll(async () => { await browser?.close(); }, 45000);
  const strip = () => page.locator('[role=tablist]');
  const active = () => page.locator('[role=tab][aria-selected="true"]');

  it('scrolls an activated offscreen tab into view', async () => {
    expect(await strip().evaluate(el => el.scrollWidth > el.clientWidth)).toBe(true);
    const before = await strip().evaluate(el => el.scrollLeft);
    await page.evaluate(() => window.setTab!('usage'));
    await expect.poll(async () => {
      const tab = page.locator('#workspace-tab-usage');
      const tr = await tab.evaluate(el => el.getBoundingClientRect());
      const sr = await strip().evaluate(el => el.getBoundingClientRect());
      return tr.right <= sr.right + 1;
    }).toBe(true);
    expect(await strip().evaluate(el => el.scrollLeft)).toBeGreaterThan(before);
  });

  it('does not scroll when the active tab is already fully visible', async () => {
    await page.evaluate(() => window.setTab!('artifact'));
    await expect.poll(async () => strip().evaluate(el => el.scrollLeft)).toBe(0);
    await page.evaluate(() => window.setTab!('plan'));
    await page.waitForTimeout(200);
    expect(await strip().evaluate(el => el.scrollLeft)).toBe(0);
  });

  it('arrow keys move focus+selection with wrap-around; Tab exits the strip', async () => {
    await page.evaluate(() => window.setTab!('artifact'));
    await page.locator('#workspace-tab-artifact').focus();
    const activeId = async () => active().getAttribute('id');
    await page.keyboard.press('ArrowRight');
    await expect.poll(activeId).toBe('workspace-tab-plan');
    await expect.poll(async () => page.evaluate(() => document.activeElement?.id)).toBe('workspace-tab-plan');
    await page.keyboard.press('End');
    await expect.poll(activeId).toBe('workspace-tab-usage');
    await page.keyboard.press('ArrowRight');
    await expect.poll(activeId).toBe('workspace-tab-artifact');
    await page.keyboard.press('ArrowLeft');
    await expect.poll(activeId).toBe('workspace-tab-usage');
    await page.keyboard.press('Home');
    await expect.poll(activeId).toBe('workspace-tab-artifact');
    // Roving tabindex: only the selected tab is tabbable.
    expect(await page.locator('[role=tab][tabindex="0"]').count()).toBe(1);
    expect(await page.locator('[role=tab][tabindex="-1"]').count()).toBe(7);
  });
});
