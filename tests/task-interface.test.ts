import {isTaskHistoryScrollKey} from '../apps/web/src/TaskHistory';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { build } from 'esbuild';
import { chromium, type Browser, type Page } from '@playwright/test';
import { CAPABILITIES, SURFACE_LIMITS, validateSurface } from '../packages/ui-catalog';
import { disclosureData, mapData, relationshipData, tableChangesData } from '../packages/ui-catalog/workflow';
import { HarnessError } from '../packages/contracts';

const surface = (type: string, props: Record<string, unknown>) => ({ root: 'view', elements: { view: { type, props } } });

describe('reusable source-bound task surfaces', () => {
  const tabs = (labels: string[]) => ({ root: 'tabs', elements: {
    tabs: { type: 'Tabs', props: { labels, stateKey: 'selectedTab' }, children: labels.map((_, i) => `input${i}`) },
    ...Object.fromEntries(labels.map((_, i) => [`input${i}`, { type: 'Input', props: { label: `Draft ${i}`, stateKey: `draft${i}` } }])),
  } });
  it('rejects duplicate Tabs labels with INVALID_SURFACE', () => {
    for (const labels of [['Details', 'Details'], ['A', 'B', 'A'], ['', '']]) {
      expect(() => validateSurface(tabs(labels))).toThrow(HarnessError);
      expect(() => validateSurface(tabs(labels))).toThrow(expect.objectContaining({ code: 'INVALID_SURFACE' }));
    }
  });
  it('preserves exact Tabs label identities and existing admission limits', () => {
    for (const labels of [['Details', 'details'], [' Details', 'Details'], ['é', 'e\u0301'], ['', 'Details'], ['Only'], Array.from({ length: 20 }, (_, i) => String(i))]) {
      expect(() => validateSurface(tabs(labels))).not.toThrow();
    }
    const mismatched = tabs(['A', 'B']); mismatched.elements.tabs.children.pop();
    delete (mismatched.elements as Record<string, unknown>).input1;
    expect(() => validateSurface(mismatched)).toThrow(/Tabs labels and children must match/);
    for (const labels of [[], Array.from({ length: 21 }, (_, i) => String(i)), ['x'.repeat(100_001)]]) expect(() => validateSurface(tabs(labels))).toThrow(HarnessError);
    expect(() => validateSurface(tabs(['x'.repeat(70_000), 'y'.repeat(70_000)]))).toThrow(/128 KiB/);
    const deep = tabs(['A']);
    for (let i = 0; i < 11; i++) {
      (deep.elements as Record<string, unknown>)[`stack${i}`] = { type: 'Stack', props: {}, children: [deep.root] };
      deep.root = `stack${i}`;
    }
    expect(() => validateSurface(deep)).toThrow(/depth 12/);
  });
  it('publishes the unique Tabs label requirement', () => {
    const capability = CAPABILITIES.find(item => item.name === 'Tabs')!;
    expect((capability.props.properties as Record<string, { uniqueItems?: boolean }>).labels.uniqueItems).toBe(true);
    expect(capability.description).toMatch(/unique labels/i);
  });
  it('admits independent graph layouts and bounded source metadata', () => {
    for (const orientation of ['vertical', 'horizontal']) expect(() => validateSurface(surface('RelationshipGraph', { dataBinding: 'history', orientation }))).not.toThrow();
    expect(relationshipData.safeParse({ nodes: [{ id: 'head', label: 'Release review', status: 'merged', hash: '04f8b23', author: 'Jules', time: '2m ago', branch: 'release', conflictCount: 2, excerpts: [{ label: 'Current', text: 'retry()' }, { label: 'Incoming', text: 'await retry()' }], checks: [{ label: 'Tests', status: 'success', detail: 'Synthetic: 24 assertions' }] }], edges: [] }).success).toBe(true);
    expect(relationshipData.safeParse({ nodes: [{ id: 'a', label: 'A', excerpts: Array.from({ length: 5 }, () => ({ label: 'x', text: 'x' })) }], edges: [] }).success).toBe(false);
    expect(() => validateSurface(surface('RelationshipGraph', { dataBinding: 'history', orientation: 'diagonal' }))).toThrow();
  });
  it('keeps disclosure loading and table changes source-bound', () => {
    expect(() => validateSurface(surface('Disclosure', { title: 'Can delivery be split?', stateKey: 'deliveryOpen', dataBinding: 'answer', onOpenActionId: 'expand', payload: { topic: 'delivery' } }))).not.toThrow();
    expect(disclosureData.safeParse({ status: 'ready', answer: 'Yes, choose destinations before confirming.' }).success).toBe(true);
    expect(disclosureData.safeParse({ status: 'ready', answer: 'yes', execute: 'fetch()' }).success).toBe(false);
    expect(() => validateSurface(surface('Table', { rowsBinding: 'rows', columns: [{ key: 'owner', label: 'Owner' }], changesBinding: 'changes' }))).not.toThrow();
    expect(tableChangesData.safeParse({ revision: 3, activeRowId: 'row-1', rows: [{ id: 'row-1', status: 'updated', cells: [{ key: 'owner', status: 'updated', before: null, detail: 'Bound source correction' }] }] }).success).toBe(true);
    expect(tableChangesData.safeParse({ rows: [{ id: 'row-1', cells: [{ key: '/inputs/secret' }] }] }).success).toBe(false);
  });
  it('admits a linked local map and rejects unbounded or executable map inputs', () => {
    expect(() => validateSurface(surface('MapView', { dataBinding: 'places', stateKey: 'selectedPlace', themeStateKey: 'mapTheme', feedbackActionId: 'feedback' }))).not.toThrow();
    expect(mapData.safeParse({ points: [{ id: 'north', label: 'North entrance', x: 25, y: 40 }, { id: 'east', label: 'East entrance', x: 80, y: 55 }], routes: [{ id: 'walk', pointIds: ['north', 'east'] }], source: 'Synthetic local plan' }).success).toBe(true);
    expect(mapData.safeParse({ points: [{ id: 'x', label: 'Outside', x: 101, y: 0 }] }).success).toBe(false);
    expect(mapData.safeParse({ points: [{ id: 'x', label: 'A', x: 1, y: 1 }], routes: [{ id: 'broken', pointIds: ['x', 'missing'] }] }).success).toBe(false);
    expect(() => validateSurface(surface('MapView', { dataBinding: 'places', stateKey: 'selectedPlace', tileUrl: 'https://example.test/{x}' }))).toThrow();
    expect(() => validateSurface(surface('Form', { actionId: 'ask', clearOnSuccess: ['question'] }))).not.toThrow();
  });
  it('publishes descriptions with composition guidance without relaxing graph custody limits', () => {
    expect(SURFACE_LIMITS).toEqual({ nodes: 200, depth: 12, bytes: 131072 });
    for (const name of ['Disclosure', 'RelationshipGraph', 'Table', 'MapView']) expect(CAPABILITIES.find(capability => capability.name === name)?.description.length).toBeGreaterThan(200);
  });
});

it('does not interrupt bounded-history follow for arrow and caret keys inside controls',()=>{
 const event={key:'Home',defaultPrevented:false,ctrlKey:false,metaKey:false,altKey:false,nativeEvent:{isComposing:false},target:{closest:()=>null}};
 expect(isTaskHistoryScrollKey(event)).toBe(true);
 expect(isTaskHistoryScrollKey({...event,key:'ArrowDown',target:{closest:()=>({})}})).toBe(false);
 expect(isTaskHistoryScrollKey({...event,ctrlKey:true})).toBe(false);
 expect(isTaskHistoryScrollKey({...event,defaultPrevented:true})).toBe(false);
 expect(isTaskHistoryScrollKey({...event,nativeEvent:{isComposing:true}})).toBe(false);
 expect(isTaskHistoryScrollKey({...event,key:'Enter'})).toBe(false);
});


const choiceFixture = `
import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {StateProvider, useStateStore} from '@json-render/react';
import {ChoiceValidationProvider, useChoiceValidation} from './apps/web/src/task-context';
import {ChoiceList} from './apps/web/src/task-interface';

function Probe(){
  const validation = useChoiceValidation();
  const store = useStateStore();
  window.choiceValidation = validation;
  window.stateStore = store;
  window.evaluateChoice = mappedKeys => {
    const result = validation.validate({mappedKeys});
    return {valid: result.valid, captures: result.captures};
  };
  return null;
}
const customChoice = {stateKey: 'delivery', label: 'Choose delivery', required: true, options: [{value: 'download', label: 'Prepare a local export'}], custom: {label: 'Other delivery method'}};
const hiddenChoice = {stateKey: 'requiredChoice', label: 'Required witness', required: true, options: [{value: 'yes', label: 'Include a witness'}]};
function Harness(){
  const [choiceDisabled, setChoiceDisabled] = useState(true);
  window.setChoiceDisabled = setChoiceDisabled;
  const dynamicChoice = {stateKey: 'dynamicChoice', label: 'Dynamic witness', required: true, disabled: choiceDisabled, options: [{value: 'yes', label: 'Include dynamic witness'}]};
  return <StateProvider initialState={{values: {delivery: 'Typed freeform value'}}}><ChoiceValidationProvider><Probe/><ChoiceList element={{props: customChoice}}/><div id="boundary"><ChoiceList element={{props: hiddenChoice}}/></div><div id="dynamic"><ChoiceList element={{props: dynamicChoice}}/></div></ChoiceValidationProvider></StateProvider>;
}
createRoot(document.getElementById('root')).render(<Harness/>);
`;

type ChoiceEvaluation = { valid: boolean; captures: Array<{ valueLabel: string; userEditVersion: number }> };

describe('required choice registration capture', () => {
  let browser: Browser, script: string;
  beforeAll(async () => {
    script = (await build({stdin: {contents: choiceFixture, resolveDir: process.cwd(), loader: 'tsx'}, bundle: true, write: false, format: 'iife', platform: 'browser', jsx: 'automatic', loader: {'.css': 'empty'}, define: {'process.env.NODE_ENV': '"production"'}})).outputFiles[0]!.text;
    browser = await chromium.launch({headless: true, ...(process.env.GEN_TEST_CHROMIUM_EXECUTABLE ? {executablePath: process.env.GEN_TEST_CHROMIUM_EXECUTABLE} : process.platform === 'win32' ? {channel: 'msedge'} : {})});
  });
  afterAll(async () => { await browser?.close(); });
  async function open(): Promise<Page> {
    const page = await browser.newPage();
    await page.setContent('<div id="root"></div>');
    await page.addScriptTag({content: script});
    await expect.poll(() => page.evaluate('Boolean(window.choiceValidation && window.stateStore)')).toBe(true);
    return page;
  }
  const evaluateChoice = async (page: Page, key: string) => (await page.evaluate(`window.evaluateChoice([${JSON.stringify(key)}])`)) as ChoiceEvaluation;

  it('captures renderer-approved custom labels and only user edit versions', async () => {
    const page = await open();
    const initial = await evaluateChoice(page, 'delivery');
    expect(initial.valid).toBe(true);
    expect(initial.captures).toHaveLength(1);
    expect(initial.captures[0].valueLabel).toBe('Other delivery method');
    expect(initial.captures[0].valueLabel).not.toBe('Typed freeform value');
    expect(initial.captures[0].userEditVersion).toBe(0);
    await page.locator('.task-choice-custom-input').fill('Typed replacement');
    const edited = await evaluateChoice(page, 'delivery');
    expect(edited.captures[0].userEditVersion).toBe(1);
    await page.evaluate(`window.stateStore.set('/values/delivery', 'Programmatic replacement')`);
    const programmatic = await evaluateChoice(page, 'delivery');
    expect(programmatic.captures[0].userEditVersion).toBe(1);
    await page.close();
  });



  it('re-enables an in-place choice when its disabled prop clears', async () => {
    const page = await open();
    await expect.poll(() => page.evaluate(`document.querySelector('#dynamic fieldset').disabled`)).toBe(true);
    await page.evaluate(`window.setChoiceDisabled(false)`);
    await expect.poll(() => page.evaluate(`document.querySelector('#dynamic fieldset').disabled`)).toBe(false);
    expect((await evaluateChoice(page, 'dynamicChoice')).valid).toBe(false);
    await page.getByRole('radio', { name: 'Include dynamic witness' }).click();
    expect((await evaluateChoice(page, 'dynamicChoice')).valid).toBe(true);
    await page.close();
  });

  it('excludes inert and aria-hidden required choices until their ancestor is usable', async () => {
    const page = await open();
    await page.evaluate(`document.getElementById('boundary').inert = true`);
    await expect.poll(() => page.evaluate(`document.querySelector('#boundary fieldset').disabled`)).toBe(true);
    expect(await evaluateChoice(page, 'requiredChoice')).toEqual({valid: true, captures: []});
    await page.evaluate(`document.getElementById('boundary').inert = false; document.getElementById('boundary').setAttribute('aria-hidden', 'true')`);
    await expect.poll(() => page.evaluate(`document.querySelector('#boundary fieldset').disabled`)).toBe(true);
    expect(await evaluateChoice(page, 'requiredChoice')).toEqual({valid: true, captures: []});
    await page.evaluate(`document.getElementById('boundary').removeAttribute('aria-hidden')`);
    await expect.poll(() => page.evaluate(`document.querySelector('#boundary fieldset').disabled`)).toBe(false);
    const active = await evaluateChoice(page, 'requiredChoice');
    expect(active.valid).toBe(false);
    expect(active.captures).toEqual([]);
    await expect.poll(() => page.locator('#boundary .task-choice-error').textContent()).toBe('Pick an option first.');
    await page.close();
  });
});
