import { test, expect } from '@playwright/test';
import { branchGraphData, branchGraphSpec, growingQaSpec, linkedMapData, linkedMapSpec, migrationTableSpec, serveTaskFixture, taskFixture, type TaskSpec } from './task-interface-fixture';
import { validateSurface } from '../../packages/ui-catalog';
import { mkdir, writeFile } from 'node:fs/promises';
import { openApp } from './app-ready';

test('a hidden artifact status announces directly in its header and clears only on reveal or expiry',async({page})=>{
 const spec:TaskSpec={root:'views',elements:{
  views:{type:'Tabs',props:{labels:['Content','Controls','Details'],stateKey:'statusView'},children:['status','save','details']},
  status:{type:'Status',props:{dataBinding:'result'}},
  save:{type:'Button',props:{label:'Save choice',actionId:'ask'}},
  details:{type:'Text',props:{text:'Other details'}},
 }};
 const snapshot=taskFixture(spec,{result:{status:'neutral',label:'Waiting for a choice'}});
 let saved=0;
 const fixture=await serveTaskFixture(page,snapshot,async command=>{
  if(command.payload.actionId==='ask')fixture.setInput('result',{status:'success',label:'Choice saved locally '+(++saved)});
 });
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:560,height:800});
 await openApp(page);
 const artifact=page.getByRole('region',{name:'Task surface',exact:true});
 await expect(artifact.getByText('Waiting for a choice',{exact:true})).toBeVisible();
 const chip=artifact.locator('.artifact-header').getByRole('status');
 await expect(artifact.locator('.artifact-header .artifact-flash')).toHaveCount(0);
 await artifact.getByRole('tab',{name:'Controls',exact:true}).click();
 await page.clock.install();
 const save=artifact.getByRole('button',{name:'Save choice',exact:true});
 await save.click();
 await expect(chip).toHaveText('Choice saved locally 1');
 expect(await chip.locator('.artifact-flash').evaluate(node=>parseFloat(getComputedStyle(node).animationDuration))).toBeLessThanOrEqual(.001);
 expect(await artifact.locator('.artifact-header').evaluate(node=>node.scrollWidth<=node.clientWidth)).toBe(true);
 await page.clock.runFor(2500);
 await save.click();
 await expect(chip).toHaveText('Choice saved locally 2');
 await page.clock.runFor(2000);
 await expect(chip).toHaveText('Choice saved locally 2');
 await artifact.getByRole('tab',{name:'Details',exact:true}).click();
 await expect(chip).toHaveText('Choice saved locally 2');
 await artifact.getByRole('tab',{name:'Content',exact:true}).click();
 await expect(chip).toHaveText('');
 await expect(artifact.getByText('Choice saved locally 2',{exact:true})).toBeVisible();
 fixture.setInput('result',{status:'error',label:'Choice needs another attempt'});
 await fixture.publish();
 await expect(artifact.getByText('Choice needs another attempt',{exact:true})).toBeVisible();
 await expect(chip).toHaveText('');
 await artifact.getByRole('tab',{name:'Controls',exact:true}).click();
 await save.click();
 await expect(chip).toHaveText('Choice saved locally 3');
 await page.clock.runFor(4100);
 await expect(chip).toHaveText('');
 expect(errors).toEqual([]);
});

test('settings writes broadcast a named workspace event and refresh the app', async ({ page }) => {
  const snapshot = taskFixture(branchGraphSpec('vertical'), { graph: branchGraphData });
  snapshot.settings.theme = 'light';
  await serveTaskFixture(page, snapshot);
  await openApp(page);
  await expect(page.locator('.task-graph')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  const frames = await page.evaluateHandle(after => {
    const received: { name: string; lastEventId: string; data: unknown }[] = [];
    const stream = new EventSource(`/api/events?after=${after}`);
    const record = (event: Event) => {
      const frame = event as MessageEvent<string>;
      received.push({ name: frame.type, lastEventId: frame.lastEventId, data: JSON.parse(frame.data) });
    };
    stream.addEventListener('workspace', record);
    stream.onmessage = record;
    return received;
  }, snapshot.seq);
  const receipt = await page.evaluate(async () => {
    const response = await fetch('/api/commands', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'fixture-settings', type: 'settings.update', payload: { theme: 'dark' } }),
    });
    return response.json();
  });
  expect(receipt).toEqual({ commandId: 'fixture-settings', seq: snapshot.seq, result: {} });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await frames.jsonValue()).toEqual([{
    name: 'workspace', lastEventId: String(snapshot.seq),
    data: {
      seq: snapshot.seq, id: expect.any(String), type: 'settings.update', threadId: null,
      payload: { result: snapshot.settings }, occurredAt: expect.stringMatching(/^\d{4}-\d\d-\d\dT/),
    },
  }]);
});

test('a workspace stream error refreshes the snapshot and resumes named updates', async ({ page }) => {
  const snapshot = taskFixture(branchGraphSpec('vertical'), { graph: branchGraphData });
  const fixture = await serveTaskFixture(page, snapshot);
  let bootstraps = 0;
  let releaseBootstrap!: () => void;
  const renew = new Promise<void>(resolve => { releaseBootstrap = resolve; });
  await page.route('**/api/bootstrap', async route => {
    if (++bootstraps > 1) await renew;
    await route.fallback();
  });

  await openApp(page);
  const graph = page.locator('.task-graph');
  await expect(graph).toHaveAttribute('data-orientation', 'vertical');
  const reconnecting = page.getByTitle('Reconnecting', { exact: true });
  await expect(reconnecting).toHaveCount(0);
  try {
    await page.evaluate(() => window.dispatchEvent(new Event('task-fixture-disconnect')));
    await expect(reconnecting).toBeVisible();
    snapshot.artifacts[0].spec = branchGraphSpec('horizontal');
    snapshot.artifacts[0].revision++;
    await fixture.publish();
    await expect(graph).toHaveAttribute('data-orientation', 'vertical');
  } finally {
    releaseBootstrap();
  }
  await expect(graph).toHaveAttribute('data-orientation', 'horizontal');
  await expect(reconnecting).toHaveCount(0);
  expect(bootstraps).toBe(2);

  snapshot.artifacts[0].spec = branchGraphSpec('vertical');
  snapshot.artifacts[0].revision++;
  await fixture.publish();
  await expect(graph).toHaveAttribute('data-orientation', 'vertical');
});

test('vertical history and horizontal lanes are distinct accessible source views', async ({ page }) => {
  const fixture = await serveTaskFixture(page, taskFixture(branchGraphSpec('vertical'), { graph: branchGraphData }));
  await page.goto('/');
  await expect(page.locator('.task-graph')).toHaveAttribute('data-orientation', 'vertical');
  await expect(page.locator('.task-node-hash').first()).toHaveText('7fe91ac');
  await page.getByRole('button', { name: /Keep retries ordered/ }).focus();
  await expect(page.getByRole('tooltip').filter({ hasText: 'Current' })).toBeVisible();
  await expect(page.getByRole('tooltip').filter({ hasText: 'Current' })).toContainText('await retry(source)');
  const vertical = await page.locator('.task-graph-dot').evaluateAll(nodes => nodes.map(node => ({ x: node.getBoundingClientRect().x, y: node.getBoundingClientRect().y })));
  expect(vertical[2].y).toBeGreaterThan(vertical[0].y + 40);
  fixture.snapshot.artifacts[0].spec = branchGraphSpec('horizontal'); fixture.snapshot.artifacts[0].revision++; await fixture.publish();
  await expect(page.locator('.task-graph')).toHaveAttribute('data-orientation', 'horizontal');
  await expect.poll(async () => {
    const horizontal = await page.locator('.task-graph-dot').evaluateAll(nodes => nodes.map(node => ({ x: node.getBoundingClientRect().x, y: node.getBoundingClientRect().y })));
    return horizontal[2].x - horizontal[0].x;
  }).toBeGreaterThan(100);
  await page.getByRole('button', { name: /Keep retries ordered/ }).click();
  await expect.poll(() => fixture.snapshot.userStates[0].values.selectedCommit).toBe('topic');
});

test('progressive Q&A keeps branches, edit identity and focus while deduplicating pending actions', async ({ page }) => {
  let release: () => void = () => {};
  const gate = new Promise<void>(resolve => { release = resolve; });
  const snapshot = taskFixture(structuredClone(growingQaSpec), { answer: { status: 'idle' } });
  const fixture = await serveTaskFixture(page, snapshot, async command => {
    if (command.payload.actionId === 'expand') await gate;
    if (command.payload.actionId === 'ask') {
      const question = (command.payload.payload as { question: string }).question;
      const spec = structuredClone(snapshot.artifacts[0].spec!);
      spec.elements.history.children!.push('newRoot');
      spec.elements.newRoot = { type: 'Disclosure', props: { title: question, stateKey: 'newQuestionOpen', defaultOpen: true, text: 'Choose Friday while reviewing the destination, before confirming.' } };
      snapshot.artifacts[0].spec = spec; snapshot.artifacts[0].revision++;
    }
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Can delivery be split?', exact: true }).click();
  await expect(page.locator('.disclosure-pending')).toBeVisible();
  await page.getByRole('button', { name: 'Can delivery be split?', exact: true }).click();
  await page.getByRole('button', { name: 'Can delivery be split?', exact: true }).click();
  await expect.poll(() => fixture.commands.filter(command => command.type === 'action.submit').length).toBe(1);
  await page.getByRole('textbox', { name: 'Destination note' }).fill('Keep the labels separate');
  await page.getByRole('textbox', { name: 'Destination note' }).focus();
  const identity = await page.getByRole('textbox', { name: 'Destination note' }).evaluate(node => { (node as HTMLInputElement).dataset.identity = 'retained'; return node.dataset.identity; });
  fixture.setInput('answer', { status: 'pending', answer: 'Yes. Choose a destination' }); await fixture.publish();
  await expect(page.getByText('Yes. Choose a destination', { exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Destination note' })).toBeFocused();
  fixture.setInput('answer', { status: 'ready', answer: 'Yes. Choose a destination for each package before confirming.' }); await fixture.publish();
  await expect(page.locator('.disclosure-pending')).toHaveCount(0);
  release();
  await expect(page.getByText('Yes. Choose a destination for each package before confirming.', { exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Destination note' })).toHaveAttribute('data-identity', identity!);
  await expect(page.getByRole('textbox', { name: 'Destination note' })).toHaveValue('Keep the labels separate');
  await page.getByRole('button', { name: 'Can each destination use a different date?' }).click();
  await page.getByRole('button', { name: 'Where can I see the final fee?' }).click();
  await expect(page.getByText('Yes, choose a date for each destination before confirming.')).toBeVisible();
  await expect(page.getByText('Your confirmation shows the fee before you submit.')).toBeVisible();
  const question = page.getByRole('textbox', { name: 'Ask another question' });
  // Measure both controls in the same frame while the answer-region height
  // is animating; separate protocol calls observe different layout positions.
  const { fieldBox, submitBox } = await question.evaluate(input => {
    const field = input.getBoundingClientRect(), submit = input.closest('form')!.querySelector('button[type=submit]')!.getBoundingClientRect();
    return { fieldBox: { y: field.y, height: field.height }, submitBox: { y: submit.y, height: submit.height, width: submit.width } };
  });
  expect(submitBox!.y + submitBox!.height).toBeLessThanOrEqual(fieldBox!.y + fieldBox!.height);
  expect(submitBox!.width).toBeLessThan(45);
  await question.fill('Could the package wait until Friday?');
  await question.dispatchEvent('compositionstart');
  await question.press('Enter');
  expect(fixture.commands.filter(command => command.type === 'action.submit' && command.payload.actionId === 'ask')).toHaveLength(0);
  await question.dispatchEvent('compositionend');
  await question.press('Enter');
  await expect.poll(() => fixture.commands.filter(command => command.type === 'action.submit' && command.payload.actionId === 'ask').length).toBe(1);
  await expect(question).toBeFocused(); await expect(question).toHaveValue('');
  await expect(page.getByRole('button', { name: 'Could the package wait until Friday?' })).toBeVisible();
  await expect(page.getByText('Choose Friday while reviewing the destination, before confirming.')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Destination note' })).toHaveValue('Keep the labels separate');
  // a pending follow-up branch resolves into exactly one new interactive row
  fixture.setInput('answer', { status: 'ready', answer: 'Yes. Choose a destination for each package before confirming.', followupsPending: true }); await fixture.publish();
  await expect(page.locator('.disclosure-followups-pending[data-phase="pending"]')).toBeVisible();
  const grown = structuredClone(snapshot.artifacts[0].spec!);
  grown.elements.delivery.children!.push('insurance');
  grown.elements.insurance = { type: 'Disclosure', props: { title: 'Is insurance included?', stateKey: 'insuranceOpen', text: 'Insurance is listed per destination.' } };
  snapshot.artifacts[0].spec = grown; snapshot.artifacts[0].revision++;
  await page.evaluate(() => {
    const w = window as unknown as { branchAnimations: number; originalAnimate?: typeof Element.prototype.animate };
    w.branchAnimations = 0;
    if (!w.originalAnimate) {
      w.originalAnimate = Element.prototype.animate;
      const original = w.originalAnimate;
      Element.prototype.animate = function (...args) {
        if ((this as HTMLElement).classList?.contains('disclosure-node')) w.branchAnimations++;
        return original.apply(this, args);
      };
    }
  });
  fixture.setInput('answer', { status: 'ready', answer: 'Yes. Choose a destination for each package before confirming.', followupsPending: false }); await fixture.publish();
  const newBranch = page.getByRole('button', { name: 'Is insurance included?', exact: true });
  await expect.poll(() => page.evaluate(() => (window as unknown as { branchAnimations: number }).branchAnimations)).toBe(1);
  await expect(newBranch).toBeVisible(); await expect(newBranch).toBeEnabled();
  await expect.poll(() => page.locator('.disclosure-followups-pending').count()).toBe(0);
  expect(fixture.commands.filter(command => command.type === 'action.submit' && command.payload.actionId === 'ask')).toHaveLength(1);
  await expect(page.getByRole('textbox', { name: 'Destination note' })).toHaveAttribute('data-identity', identity!);
  await expect(page.getByRole('textbox', { name: 'Destination note' })).toHaveValue('Keep the labels separate');
  // a repeat publication of the same data never replays the child
  fixture.setInput('answer', { status: 'ready', answer: 'Yes. Choose a destination for each package before confirming.', followupsPending: false }); await fixture.publish();
  expect(await page.evaluate(() => (window as unknown as { branchAnimations: number }).branchAnimations)).toBe(1);
  // close while a placeholder exits, reopen with keyboard, and tab into the real answer
  fixture.setInput('answer', { status: 'ready', answer: 'Yes. Choose a destination for each package before confirming.', followupsPending: true }); await fixture.publish();
  await expect(page.locator('.disclosure-followups-pending[data-phase="pending"]')).toBeVisible();
  const trigger = page.getByRole('button', { name: 'Can delivery be split?', exact: true });
  fixture.setInput('answer', { status: 'ready', answer: 'Yes. Choose a destination for each package before confirming.', followupsPending: false }); await fixture.publish();
  await expect(page.locator('.disclosure-followups-pending[data-phase="resolving"]')).toHaveCount(1);
  await trigger.dispatchEvent('click');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await trigger.focus(); await page.keyboard.press('Enter');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Tab');
  const tabbed = await page.evaluate(() => { const el = document.activeElement as HTMLElement; return { tag: el.tagName, visible: el.offsetParent !== null, inert: el.closest('[inert]') !== null }; });
  expect(tabbed.inert).toBe(false); expect(tabbed.visible).toBe(true);
  await expect.poll(() => page.locator('.disclosure-followups-pending').count()).toBe(0);
  await expect(page.locator('[role="status"]').filter({ hasText: 'Preparing related questions' })).toHaveCount(0);
});

test('a pending question cannot duplicate or erase a newer draft and source errors can retry', async ({ page }) => {
  let release: () => void = () => {};
  const gate = new Promise<void>(resolve => { release = resolve; });
  const snapshot = taskFixture(growingQaSpec, { answer: { status: 'error', error: 'The delivery source needs another attempt.' } });
  const fixture = await serveTaskFixture(page, snapshot, async command => {
    if (command.payload.actionId === 'ask') await gate;
    if (command.payload.actionId === 'expand') { snapshot.data[0].value = { status: 'ready', answer: 'Use a separate destination for each package.' }; snapshot.data[0].revision++; }
  });
  await page.goto('/'); await page.getByRole('button', { name: 'Can delivery be split?', exact: true }).click();
  await expect(page.getByRole('status').filter({hasText:'The delivery source needs another attempt.'})).toContainText('The delivery source needs another attempt.');
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByText('Use a separate destination for each package.')).toBeVisible();
  const question = page.getByRole('textbox', { name: 'Ask another question' });
  await question.fill('Can I change the date?'); await question.press('Enter');
  const submit = page.getByRole('button', { name: 'Ask question', exact: true });
  await expect(submit).toBeDisabled();
  await expect(submit).toHaveAttribute('aria-busy', 'true');
  // Busy feedback precedes draft flush and HTTP delivery. Exercise duplicate
  // input only after the first request actually reaches the held host fixture.
  await expect.poll(() => fixture.commands.filter(command => command.type === 'action.submit' && command.payload.actionId === 'ask').length).toBe(1);
  await question.press('Enter'); await question.fill('A newer question I am still writing');
  expect(fixture.commands.filter(command => command.type === 'action.submit' && command.payload.actionId === 'ask')).toHaveLength(1);
  release(); await expect(page.getByRole('button', { name: 'Ask question', exact: true })).toBeEnabled();
  await expect(question).toHaveValue('A newer question I am still writing'); await expect(question).toBeFocused();
});

test('a differently worded nested composition uses the same registry without scenario routing', async ({ page }) => {
  const novel = { root: 'review', elements: {
    review: { type: 'Stack', props: { gap: 'md' }, children: ['intro', 'views'] },
    intro: { type: 'Text', props: { text: 'Choose a studio visit, then inspect the related release.', size: 'sm' } },
    views: { type: 'Tabs', props: { labels: ['Visit plan', 'Release notes'], stateKey: 'novelTab' }, children: ['place', 'notes'] },
    place: { type: 'MapView', props: { dataBinding: 'destinations', stateKey: 'placeChoice', label: 'A different visit plan' } },
    notes: { type: 'Stack', props: { gap: 'sm' }, children: ['network', 'explanation'] },
    network: { type: 'RelationshipGraph', props: { dataBinding: 'releases', orientation: 'horizontal', label: 'Collection dependencies' } },
    explanation: { type: 'Disclosure', props: { stateKey: 'whyOpen', title: 'Why visit the print room first?', text: 'Its samples inform the later ceramics discussion.' }, children: ['nested'] },
    nested: { type: 'Disclosure', props: { stateKey: 'bringOpen', title: 'What should I bring?', text: 'Bring the accepted sample list.' } },
  } };
  expect(() => validateSurface(novel)).not.toThrow();
  await serveTaskFixture(page, taskFixture(novel, { destinations: linkedMapData, releases: branchGraphData })); await page.goto('/');
  await page.getByRole('button', { name: 'Next place' }).click(); await expect(page.getByRole('region', { name: 'Selected place' })).toContainText('Ceramics room');
  await page.getByRole('tab', { name: 'Release notes' }).click(); await expect(page.locator('.task-graph')).toHaveAttribute('data-orientation', 'horizontal');
  await page.getByRole('button', { name: 'Why visit the print room first?' }).click(); await page.getByRole('button', { name: 'What should I bring?' }).click(); await expect(page.getByText('Bring the accepted sample list.')).toBeVisible();
  await page.getByRole('tab', { name: 'Visit plan' }).click(); await expect(page.getByRole('region', { name: 'Selected place' })).toContainText('Ceramics room');
});

test('a linked map retains selected source identity through themes and sends a scoped feedback action', async ({ page }) => {
  const fixture = await serveTaskFixture(page, taskFixture(linkedMapSpec, { places: linkedMapData })); await page.goto('/');
  await expect(page.locator('.task-map')).toBeVisible();
  await page.getByRole('button', { name: 'Select Ceramics room', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Selected place' })).toContainText('3 Garden Lane');
  await page.getByRole('button', { name: 'Night', exact: true }).click();
  await expect(page.locator('.task-map')).toHaveAttribute('data-map-theme', 'night');
  await expect(page.getByRole('button', { name: 'Select Ceramics room', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Next place' }).click();
  await expect(page.getByRole('region', { name: 'Selected place' })).toContainText('Garden cafe');
  await page.getByRole('button', { name: 'Send feedback request' }).click();
  await expect.poll(() => fixture.commands.find(command => command.type === 'action.submit')?.payload.payload).toEqual({ scope: 'walking-plan', pointId: 'cafe' });
  await page.reload(); await expect(page.locator('.task-map')).toHaveAttribute('data-map-theme', 'night');
  await expect(page.getByRole('region', { name: 'Selected place' })).toContainText('Garden cafe');
  const carousel = page.locator('.task-map-carousel');
  await carousel.dispatchEvent('pointerdown', { pointerId: 9, pointerType: 'mouse' });
  await carousel.evaluate(node => { node.scrollLeft = node.clientWidth; });
  await expect(page.getByRole('region', { name: 'Selected place' })).toContainText('Ceramics room');
  await carousel.dispatchEvent('pointerup', { pointerId: 9, pointerType: 'mouse' });
  await expect(page.getByRole('button', { name: 'Select Ceramics room', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('an explicitly expanded table follows accepted changes locally until the user takes over', async ({ page }) => {
  const rows = Array.from({ length: 40 }, (_, index) => ({ id: `row-${index}`, name: `Person ${index + 1}`, workspace_id: index ? null : 'studio' }));
  const snapshot=taskFixture(migrationTableSpec, { rows, projects: [{ name: 'New collection' }], changes: { revision: 1, activeRowId: 'row-0', rows: [{ id: 'row-0', cells: [{ key: 'workspace_id', status: 'updated', before: null }] }] } });
  snapshot.artifacts[0].placement='expanded';
  const fixture = await serveTaskFixture(page, snapshot); await page.goto('/');
  await expect(page.locator('td[data-change="updated"]')).toHaveAttribute('data-before', 'null');
  const pageScroll = await page.locator('.conversation-scroll').evaluate(node => node.scrollTop);
  fixture.setInput('changes', { revision: 2, activeRowId: 'row-35', rows: [{ id: 'row-35', cells: [{ key: 'workspace_id', status: 'updated', before: null }] }] }); await fixture.publish();
  await expect.poll(() => page.locator('.task-table-scroll').first().evaluate(node => node.scrollTop)).toBeGreaterThan(200);
  expect(await page.locator('.conversation-scroll').evaluate(node => node.scrollTop)).toBe(pageScroll);
  await page.locator('.task-table-scroll').first().evaluate(node => { node.dispatchEvent(new WheelEvent('wheel', { deltaY: -200, bubbles: true })); node.scrollTop = 0; });
  fixture.setInput('changes', { revision: 3, activeRowId: 'row-39', rows: [{ id: 'row-39', status: 'updated' }] }); await fixture.publish();
  await expect(page.locator('.task-table-scroll').first()).toHaveAttribute('data-following', 'false');
  await expect.poll(() => page.locator('.task-table-scroll').first().evaluate(node => node.scrollTop)).toBe(0);
  await page.getByRole('tab', { name: 'Projects', exact: true }).click(); await expect(page.getByText('New collection', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'People', exact: true }).click(); await expect(page.locator('.task-table-scroll').first()).toHaveAttribute('data-following', 'false');
});

test('capture one batched desktop, narrow and theme inspection of reusable task surfaces', async ({ page }) => {
  test.skip(process.env.HARNESS_CAPTURE_TASK_INTERFACES !== '1', 'Opt-in single batched visual inspection.');
  const correction = process.env.HARNESS_TASK_CAPTURE_CORRECTION === '1';
  const path = `.harness-task-interface-results/${correction ? 'visual-correction' : 'visual'}`; await mkdir(path, { recursive: true });
  const dense = { ...branchGraphData, nodes: Array.from({ length: 9 }, (_, index) => ({ id: `commit-${index}`, label: ['Merge into main', 'Keep retries ordered', 'Read current retry key', 'Rotate retry keys', 'Refresh work queue', 'Add consent state', 'Read queue expiry', 'Track completion events', 'Bump next version'][index], hash: ['7fe91ac', 'bf2c00d', 'a405ac3'][index % 3], author: ['Sam', 'Mira', 'Jules'][index % 3], time: `${index * 4}m`, lane: index > 4 ? 2 : index === 0 || index === 8 ? 0 : 1, status: index < 3 ? 'pending' : 'neutral', branch: index === 1 ? 'ordered-retries' : index === 5 ? 'consent-state' : undefined, dimmed: index === 8 })), edges: Array.from({ length: 8 }, (_, index) => ({ from: `commit-${index}`, to: `commit-${index + 1}`, status: index < 2 ? 'pending' : 'neutral' })) };
  const rows = Array.from({ length: 14 }, (_, index) => ({ id: `person-${index}`, name: ['Zoe Park', 'Omar Haddad', 'Ella Brooks', 'Kai Tanaka'][index % 4], workspace_id: index < 8 ? 'studio-collection' : null }));
  const scenarios = [
    { name: 'vertical', spec: branchGraphSpec('vertical'), inputs: { graph: dense }, values: {} },
    { name: 'horizontal', spec: branchGraphSpec('horizontal'), inputs: { graph: branchGraphData }, values: {} },
    { name: 'migration', spec: migrationTableSpec, inputs: { rows, projects: [{ name: 'New collection' }], changes: { revision: 1, activeRowId: 'person-5', rows: [{ id: 'person-5', cells: [{ key: 'workspace_id', status: 'updated', before: null }] }] } }, values: {} },
    { name: 'questions', spec: growingQaSpec, inputs: { answer: { status: 'ready', answer: 'Yes. Choose a destination for each package before confirming. Each destination can use its own delivery date.' } }, values: { deliveryOpen: true, datesOpen: true, costOpen: true } },
    { name: 'map', spec: linkedMapSpec, inputs: { places: linkedMapData }, values: { selectedPlace: 'ceramic' } },
  ];
  const metrics = [];
  for (const scenario of correction ? scenarios.filter(scenario => scenario.name === 'horizontal') : scenarios) {
    await page.unrouteAll({ behavior: 'wait' }); const snapshot = taskFixture(scenario.spec, scenario.inputs, scenario.values); await serveTaskFixture(page, snapshot);
    for (const variant of [{ width: 1536, height: 1000, theme: 'light' }, { width: 1280, height: 900, theme: 'dark' }, { width: 840, height: 900, theme: 'light' }, { width: 390, height: 844, theme: 'light' }] as const) {
      await page.setViewportSize({ width: variant.width, height: variant.height }); await page.emulateMedia({ colorScheme: variant.theme, reducedMotion: 'reduce' }); await page.goto('/');
      await expect(page.locator('.artifact-content')).toBeVisible(); await expect(page.locator('.save-state')).toHaveText('Saved'); await page.mouse.move(0, 0);
      const bounds = await page.evaluate(() => ({ pageOverflow: document.documentElement.scrollWidth > innerWidth, artifactWidth: document.querySelector('.artifact')!.getBoundingClientRect().width, proseWidth: document.querySelector('.message-content')!.getBoundingClientRect().width }));
      expect(bounds.pageOverflow).toBe(false);
      await page.screenshot({ path: `${path}/${scenario.name}-${variant.width}-${variant.theme}.png`, fullPage: true }); metrics.push({ scenario: scenario.name, ...variant, ...bounds });
    }
  }
  await writeFile(`${path}/manifest.json`, JSON.stringify({ provenance: 'Authored synthetic local renderer fixtures. No live model, GitHub, database, geographic provider, or external feedback delivery.', reducedMotion: true, references: ['merge-16.png', 'graph-14.png', 'migration-16.png', 'faq-24.png'], metrics }, null, 2));
});

test('map source disclosure hides blank source', async ({ page }) => {
  await serveTaskFixture(page, taskFixture(linkedMapSpec, { places: { ...linkedMapData, source: '   ' } }));
  await page.goto('/');
  await expect(page.locator('.task-map')).toBeVisible();
  await expect(page.locator('.task-map-source')).toHaveCount(0);
});

test('map source disclosure renders URL source as a link', async ({ page }) => {
  await serveTaskFixture(page, taskFixture(linkedMapSpec, { places: { ...linkedMapData, source: '  https://example.com/places ' } }));
  await page.goto('/');
  const details = page.locator('.task-map-source');
  await expect(details).toHaveCount(1);
  await details.locator('summary').click();
  const link = details.locator('a.task-map-source-link');
  await expect(link).toHaveText('https://example.com/places');
  await expect(link).toHaveAttribute('href', 'https://example.com/places');
  await expect(link).toHaveAttribute('target', '_blank');
});


const requiredChoiceSpec = { root: 'form', elements: {
  form: { type: 'Form', props: { actionId: 'ask', submitLabel: 'Continue', payloadFromState: { choice: 'delivery' } }, children: ['choice'] },
  choice: { type: 'ChoiceList', props: { stateKey: 'delivery', label: 'Choose delivery', required: true, options: [{ value: 'download', label: 'Prepare a local export' }, { value: 'review', label: 'Review first' }] } },
} };

test('a required choice blocks dispatch with an exact inline error and correction clears it', async ({ page }) => {
  const fixture = await serveTaskFixture(page, taskFixture(requiredChoiceSpec));
  await openApp(page);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  expect(fixture.commands.filter(command => command.type === 'action.submit')).toHaveLength(0);
  await expect(page.getByText('Pick an option first.', { exact: true })).toBeVisible();
  await expect(page.locator('.task-choices')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('.task-choices input[aria-invalid="true"]').first()).toBeFocused();
  await page.getByRole('radio', { name: 'Prepare a local export' }).click();
  await expect(page.getByText('Pick an option first.', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect.poll(() => fixture.commands.filter(command => command.type === 'action.submit').length).toBe(1);
  expect(fixture.commands.find(command => command.type === 'action.submit')?.payload.payload).toEqual({ choice: 'download' });
});

test('an inactive required choice neither blocks nor loses its retained selection', async ({ page }) => {
  const spec = { root: 'form', elements: {
    form: { type: 'Form', props: { actionId: 'ask', submitLabel: 'Send', payloadFromState: { choice: 'delivery' } }, children: ['steps'] },
    steps: { type: 'Steps', props: { stateKey: 'choiceStep', steps: [{ key: 'start', label: 'Start' }, { key: 'choice', label: 'Choice' }] }, children: ['note', 'choice'] },
    note: { type: 'Input', props: { stateKey: 'note', label: 'Optional note' } },
    choice: { type: 'ChoiceList', props: { stateKey: 'delivery', label: 'Choose delivery', required: true, options: [{ value: 'download', label: 'Prepare a local export' }, { value: 'review', label: 'Review first' }] } },
  } };
  const fixture = await serveTaskFixture(page, taskFixture(spec));
  await openApp(page);
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await expect.poll(() => fixture.commands.filter(command => command.type === 'action.submit').length).toBe(1);
  await expect(page.getByText('Pick an option first.', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(page.getByText('Pick an option first.', { exact: true })).toBeVisible();
  expect(fixture.commands.filter(command => command.type === 'action.submit')).toHaveLength(1);
  await page.getByRole('radio', { name: 'Review first' }).click();
  await page.getByRole('button', { name: 'Previous step', exact: true }).click();
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await expect(page.getByRole('radio', { name: 'Review first' })).toBeChecked();
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await expect.poll(() => fixture.commands.filter(command => command.type === 'action.submit').length).toBe(2);
});


test('a required custom choice uses native text validity without weakening optional or unrelated fields', async ({ page }) => {
  const spec = { root: 'form', elements: {
    form: { type: 'Form', props: { actionId: 'ask', submitLabel: 'Continue', payloadFromState: { choice: 'delivery' } }, children: ['choice', 'optional'] },
    choice: { type: 'ChoiceList', props: { stateKey: 'delivery', label: 'Choose delivery', required: true, options: [{ value: 'download', label: 'Prepare a local export' }], custom: { label: 'Another arrangement', placeholder: 'Describe it' } } },
    optional: { type: 'ChoiceList', props: { stateKey: 'witness', label: 'Optional witness', options: [{ value: 'yes', label: 'Include a witness' }] } },
  } };
  const fixture = await serveTaskFixture(page, taskFixture(spec));
  await openApp(page);
  await page.getByRole('radio', { name: 'Another arrangement' }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  expect(fixture.commands.filter(command => command.type === 'action.submit')).toHaveLength(0);
  await expect(page.getByText('Pick an option first.', { exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'Another arrangement' }).fill('Pick up in person');
  await expect(page.getByText('Pick an option first.', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect.poll(() => fixture.commands.filter(command => command.type === 'action.submit').length).toBe(1);
  expect(fixture.commands.find(command => command.type === 'action.submit')?.payload.payload).toEqual({ choice: 'Pick up in person' });
});


test('a disabled required choice does not block submission', async ({ page }) => {
  const spec = { root: 'form', elements: {
    form: { type: 'Form', props: { actionId: 'ask', submitLabel: 'Continue', payloadFromState: { choice: 'delivery' } }, children: ['choice'] },
    choice: { type: 'ChoiceList', props: { stateKey: 'delivery', label: 'Choose delivery', required: true, disabled: true, options: [{ value: 'download', label: 'Prepare a local export' }] } },
  } };
  const fixture = await serveTaskFixture(page, taskFixture(spec));
  await openApp(page);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect.poll(() => fixture.commands.filter(command => command.type === 'action.submit').length).toBe(1);
  await expect(page.getByText('Pick an option first.', { exact: true })).toHaveCount(0);
});

test.describe('ACT04 artifact submission feedback', () => {
  function deliveryForm(required = false) {
    return { root: 'form', elements: {
      form: { type: 'Form', props: { actionId: 'inspect', submitLabel: 'Save choice', payloadFromState: { delivery: 'delivery', note: 'note' }, clearOnSuccess: ['delivery', 'note'] }, children: ['choice', 'note'] },
      choice: { type: 'ChoiceList', props: { stateKey: 'delivery', label: 'Delivery', required, options: [{ value: 'pickup', label: 'Pick up locally' }, { value: 'review', label: 'Review first' }], custom: { label: 'Another arrangement', placeholder: 'Describe it' } } },
      note: { type: 'Input', props: { stateKey: 'note', label: 'Delivery note' } },
    } };
  }

  const submissionFixture = (spec: Parameters<typeof taskFixture>[0]) => {
    const snapshot = taskFixture(spec);
    snapshot.artifacts[0].actions.inspect = { kind: 'agent' };
    return snapshot;
  };

  test('keeps the original Form name and editable input while an approval request is pending', async ({ page }) => {
    let release = () => {};
    const gate = new Promise<void>(resolve => { release = resolve; });
    const fixture = await serveTaskFixture(page, submissionFixture(deliveryForm()), async () => {
      await gate;
      return { approvalRequired: true, operation: { id: 'delivery-approval' } };
    });
    await openApp(page);
    const note = page.getByRole('textbox', { name: 'Delivery note' });
    const submit = page.getByRole('button', { name: 'Save choice', exact: true });
    const payloads = () => fixture.commands.filter(command => command.type === 'action.submit').map(command => command.payload.payload);
    await note.fill('Initial draft');
    await note.dispatchEvent('compositionstart');
    await note.press('Enter');
    expect(payloads()).toEqual([]);
    await note.dispatchEvent('compositionend');
    await note.press('Enter');
    try {
      await expect.poll(payloads).toEqual([{ note: 'Initial draft' }]);
      await expect(submit, 'the pending Form keeps its original accessible name').toBeDisabled({ timeout: 2500 });
      await expect(submit).toHaveAttribute('aria-busy', 'true');
      await expect(page.getByRole('status').filter({ hasText: /^Submitting request$/ })).toBeVisible();
      await expect(note).toBeFocused();
      await expect(note).toBeEditable();
      await note.press('Enter');
      await note.fill('Newer draft');
      expect(payloads()).toEqual([{ note: 'Initial draft' }]);
    } finally {
      release();
    }
    await expect(submit).toBeEnabled();
    await expect(note).toBeFocused();
    await expect(note).toHaveValue('Newer draft');
    await expect(page.getByRole('status').filter({ hasText: /^Request submitted$/ })).toHaveCount(1);
    await expect(page.getByText(/^(Saved|Done|Request completed)$/)).toHaveCount(0);
    await expect(page.getByText(/^Submitted choice:/)).toHaveCount(0);
  });

  test('keeps the captured choice label after clearing and removes it on a user edit or after four seconds', async ({ page }) => {
    const fixture = await serveTaskFixture(page, submissionFixture(deliveryForm()));
    await openApp(page);
    const submit = page.getByRole('button', { name: 'Save choice', exact: true });
    const pickup = page.getByRole('radio', { name: 'Pick up locally' });
    const review = page.getByRole('radio', { name: 'Review first' });
    const summary = page.getByText('Submitted choice: Pick up locally', { exact: true });
    await pickup.check();
    await submit.click();
    await expect(summary, 'acknowledgment retains the submitted display label').toBeVisible({ timeout: 2500 });
    await expect(pickup).not.toBeChecked();
    await expect(submit).toBeEnabled();
    await expect(page.getByText('Submitted choice: pickup', { exact: true })).toHaveCount(0);
    await review.check();
    await expect(summary).toHaveCount(0);
    await expect(review).toBeChecked();

    await page.clock.install();
    await pickup.check();
    await submit.click();
    await expect(summary).toBeVisible();
    await page.clock.fastForward(3500);
    await expect(summary).toBeVisible();
    await page.clock.fastForward(500);
    await expect(summary).toHaveCount(0);
    expect(fixture.commands.filter(command => command.type === 'action.submit')).toHaveLength(2);
  });

  test('shows the source failure once and Retry validates and sends the current payload once', async ({ page }) => {
    let firstRequest = true;
    const payloads: unknown[] = [];
    await serveTaskFixture(page, submissionFixture(deliveryForm(true)));
    await page.route('**/api/commands', async route => {
      const command = route.request().postDataJSON();
      if (command.type !== 'action.submit') return route.fallback();
      payloads.push(command.payload.payload);
      if (!firstRequest) return route.fallback();
      firstRequest = false;
      await route.fulfill({ status: 500, json: { error: { code: 'ACTION_FAILED', message: 'Synthetic request failed. Try again.' } } });
    });
    await openApp(page);
    const submit = page.getByRole('button', { name: 'Save choice', exact: true });
    const note = page.getByRole('textbox', { name: 'Delivery note' });
    await submit.click();
    await expect(page.getByText('Pick an option first.', { exact: true })).toBeVisible();
    expect(payloads).toEqual([]);
    await page.getByRole('radio', { name: 'Another arrangement' }).check();
    const custom = page.getByRole('textbox', { name: 'Another arrangement' });
    await custom.fill('Original arrangement');
    await note.fill('Original note');
    await note.press('Enter');
    const error = page.getByRole('alert').filter({ hasText: 'Synthetic request failed. Try again.' });
    await expect(error).toHaveCount(1);
    await expect(note).toBeFocused();
    await expect(page.getByText('Request submitted', { exact: true })).toHaveCount(0);
    const retry = page.locator('[data-artifact-id="task-surface"]').getByRole('button', { name: 'Retry', exact: true });
    await expect(retry, 'a failed submission offers a quiet Retry').toBeVisible({ timeout: 2500 });
    await custom.fill('');
    await retry.click();
    await expect(page.getByText('Pick an option first.', { exact: true })).toBeVisible();
    expect(payloads).toEqual([{ delivery: 'Original arrangement', note: 'Original note' }]);
    await custom.fill('Current arrangement');
    await note.fill('Current note');
    await retry.click();
    await expect(page.getByText('Request submitted', { exact: true })).toBeVisible();
    await expect(page.getByText('Submitted choice: Another arrangement', { exact: true })).toBeVisible();
    await expect(error).toHaveCount(0);
    expect(payloads).toEqual([{ delivery: 'Original arrangement', note: 'Original note' }, { delivery: 'Current arrangement', note: 'Current note' }]);
  });

  test('standalone Button preserves its name and acknowledges one Space activation', async ({ page }) => {
    let release = () => {};
    const gate = new Promise<void>(resolve => { release = resolve; });
    const spec = { root: 'action', elements: {
      action: { type: 'Button', props: { label: 'Inspect delivery', actionId: 'inspect', payload: { scope: 'delivery' } } },
    } };
    const fixture = await serveTaskFixture(page, submissionFixture(spec), async () => { await gate; });
    await openApp(page);
    const submit = page.getByRole('button', { name: 'Inspect delivery', exact: true });
    const payloads = () => fixture.commands.filter(command => command.type === 'action.submit').map(command => command.payload.payload);
    await submit.press('Space');
    try {
      await expect.poll(payloads).toEqual([{ scope: 'delivery' }]);
      await expect(submit, 'the pending Button keeps its original accessible name').toBeDisabled({ timeout: 2500 });
      await expect(submit).toHaveAttribute('aria-busy', 'true');
      await expect(page.getByRole('status').filter({ hasText: /^Submitting request$/ })).toBeVisible();
    } finally {
      release();
    }
    await expect(submit).toBeEnabled();
    await expect(page.getByRole('status').filter({ hasText: /^Request submitted$/ })).toHaveCount(1);
    expect(payloads()).toEqual([{ scope: 'delivery' }]);
  });
});

test('a standalone button validates only its keyed associated choice', async ({ page }) => {
  const spec = { root: 'stack', elements: {
    stack: { type: 'Stack', props: {}, children: ['choice', 'unrelated', 'action'] },
    choice: { type: 'ChoiceList', props: { stateKey: 'delivery', label: 'Choose delivery', required: true, options: [{ value: 'download', label: 'Prepare a local export' }] } },
    unrelated: { type: 'ChoiceList', props: { stateKey: 'witness', label: 'Optional witness', required: true, options: [{ value: 'yes', label: 'Include a witness' }] } },
    action: { type: 'Button', props: { label: 'Continue', actionId: 'ask', payloadFromState: { choice: 'delivery' } } },
  } };
  const fixture = await serveTaskFixture(page, taskFixture(spec));
  await openApp(page);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  expect(fixture.commands.filter(command => command.type === 'action.submit')).toHaveLength(0);
  await expect(page.locator('fieldset', { hasText: 'Choose delivery' }).getByText('Pick an option first.', { exact: true })).toBeVisible();
  await expect(page.locator('fieldset', { hasText: 'Optional witness' }).getByText('Pick an option first.', { exact: true })).toHaveCount(0);
  await page.getByRole('radio', { name: 'Prepare a local export' }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect.poll(() => fixture.commands.filter(command => command.type === 'action.submit').length).toBe(1);
});

test('Artifact secondary tools transfer help without dispatching commands',async({page})=>{
  const snapshot=taskFixture({root:'text',elements:{text:{type:'Text',props:{text:'Synthetic tooltip pilot'}}}});
  const artifact=snapshot.artifacts[0];
  const host=await serveTaskFixture(page,snapshot);
  await page.route('**/api/commands',route=>{
    const command=route.request().postDataJSON();
    if(command.type==='artifact.pin'&&command.threadId===artifact.threadId&&command.payload.artifactId===artifact.id){
      artifact.pinned=command.payload.pinned;
    }
    return route.fallback();
  });
  await openApp(page);
  await expect(page.getByText('Synthetic tooltip pilot',{exact:true})).toBeVisible();
  const toolbar=page.locator('.artifact-secondary-tools:visible');
  const source=toolbar.getByRole('button',{name:'View artifact source'}),pin=toolbar.getByRole('button',{name:'Pin artifact'});
  const archive=toolbar.getByRole('button',{name:'Archive artifact'}),tooltip=page.getByRole('tooltip');
  await expect(source).toBeVisible();
  await expect(toolbar).not.toHaveAttribute('inert','');
  await page.mouse.move(20,20);
  await expect(toolbar).toHaveCSS('opacity','0');
  const commandCount=host.commands.length;
  await source.hover();
  await expect(tooltip).toHaveText('View source');
  await expect(tooltip).toHaveAttribute('data-opening','pointer-cold');
  await pin.hover();
  await expect(tooltip).toHaveText('Pin artifact');
  await expect(tooltip).toHaveAttribute('data-opening','pointer-warm');
  await archive.hover();
  await expect(tooltip).toHaveText('Archive artifact');
  await expect(tooltip).toHaveAttribute('data-opening','pointer-warm');
  expect(await tooltip.evaluate(node=>node.getAnimations().length)).toBe(0);
  expect(host.commands).toHaveLength(commandCount);
  await source.click();
  await expect(source).toHaveAttribute('aria-expanded','true');
  await expect(page.locator('.artifact-source')).toContainText('Immutable source · revision 1');
  expect(host.commands).toHaveLength(commandCount);
  await page.keyboard.press('Tab');
  await expect(pin).toBeFocused();
  await page.keyboard.press('Space');
  await expect(toolbar.getByRole('button',{name:'Unpin artifact'})).toHaveAttribute('aria-pressed','true');
  expect(host.commands.slice(commandCount)).toEqual([expect.objectContaining({
    type:'artifact.pin',threadId:artifact.threadId,payload:{artifactId:artifact.id,pinned:true},
  })]);
});

test('Artifact tooltip group stays with the rendered revision until a held draft saves',async({page})=>{
  const spec={root:'draft',elements:{draft:{type:'Input',props:{label:'Pilot draft',stateKey:'draft'}}}};
  const snapshot=taskFixture(spec,{}, {draft:''});
  const host=await serveTaskFixture(page,snapshot);
  let release!:()=>void,started!:()=>void;
  const held=new Promise<void>(resolve=>{release=resolve;});
  const saving=new Promise<void>(resolve=>{started=resolve;});
  await page.route('**/api/commands',async route=>{
    if(route.request().postDataJSON().type==='state.save'){started();await held;}
    return route.fallback();
  });
  try{
    await openApp(page);
    const toolbar=page.locator('.artifact-secondary-tools:visible');
    await expect(toolbar).toHaveAttribute('data-tooltip-group',JSON.stringify(['task-thread','task-surface',1]));
    await page.getByRole('textbox',{name:'Pilot draft'}).fill('Hold the rendered owner');
    await saving;
    snapshot.artifacts[0]={...snapshot.artifacts[0],revision:2,title:'Updated tooltip owner'};
    await host.publish();
    await expect(page.getByText('An updated interface is ready. Save your edits to load it; this version remains open.')).toBeVisible();
    await expect(toolbar).toHaveAttribute('data-tooltip-group',JSON.stringify(['task-thread','task-surface',1]));
    const pin=toolbar.getByRole('button',{name:'Pin artifact'});
    await pin.hover();
    const tooltip=page.getByRole('tooltip');
    await expect(tooltip).toHaveText('Pin artifact');
    release();
    await expect(toolbar).toHaveAttribute('data-tooltip-group',JSON.stringify(['task-thread','task-surface',2]));
    await expect(tooltip).toHaveCount(0);
    await expect(page.getByText('Updated tooltip owner',{exact:true})).toBeVisible();
  }finally{
    release();
  }
});

test('Artifact toolbar keeps its owner across expanded and workspace placements',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  const snapshot=taskFixture({root:'text',elements:{text:{type:'Text',props:{text:'Placement fixture'}}}});
  const artifact=snapshot.artifacts[0],host=await serveTaskFixture(page,snapshot);
  await page.route('**/api/commands',route=>{
    const command=route.request().postDataJSON();
    if(command.type==='artifact.expand'&&command.threadId===artifact.threadId&&command.payload.artifactId===artifact.id){
      artifact.placement=command.payload.expanded?'expanded':'inline';
    }
    return route.fallback();
  });
  await openApp(page);
  const inline=page.locator('.artifact:visible');
  const marker=JSON.stringify([artifact.threadId,artifact.id,artifact.revision]);
  const tools=inline.locator('.artifact-secondary-tools');
  await expect(tools).toHaveAttribute('data-tooltip-group',marker);
  await inline.getByRole('button',{name:'Expand artifact',exact:true}).click();
  const expanded=page.locator('.artifact-expanded[aria-modal="true"]');
  await expect(expanded).toBeVisible();
  const modalTools=expanded.locator('.artifact-secondary-tools');
  await expect(modalTools).toHaveAttribute('data-tooltip-group',marker);
  const afterExpand=host.commands.length;
  const tooltip=page.getByRole('tooltip');
  const hoverSettled=async(target:ReturnType<typeof modalTools.getByRole>)=>{
    await target.scrollIntoViewIfNeeded();
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const box=await target.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(box!.x+box!.width/2,box!.y+box!.height/2);
  };
  await hoverSettled(modalTools.getByRole('button',{name:'View artifact source'}));
  await expect(tooltip).toHaveAttribute('data-opening','pointer-cold');
  await hoverSettled(modalTools.getByRole('button',{name:'Pin artifact'}));
  await expect(tooltip).toHaveText('Pin artifact');
  await expect(tooltip).toHaveAttribute('data-opening','pointer-warm');
  expect(host.commands).toHaveLength(afterExpand);
  await expanded.getByRole('button',{name:'Collapse artifact',exact:true}).click();
  await expect(expanded).toHaveCount(0);
  await inline.getByRole('button',{name:'Open artifact in workspace',exact:true}).click();
  const panel=page.locator('.artifact-in-workspace:visible .artifact-secondary-tools');
  await expect(panel).toHaveAttribute('data-tooltip-group',marker);
  await hoverSettled(panel.getByRole('button',{name:'Archive artifact'}));
  await expect(tooltip).toHaveText('Archive artifact');
  await expect(tooltip).toHaveAttribute('data-opening','pointer-cold');
  expect(host.commands.filter(command=>command.type==='artifact.archive')).toHaveLength(0);
});

test('a second Artifact owns an independent tooltip group',async({page})=>{
  await page.setViewportSize({width:1440,height:960});
  const snapshot=taskFixture({root:'text',elements:{text:{type:'Text',props:{text:'Two artifact groups'}}}});
  const first=snapshot.artifacts[0];
  snapshot.messages.push({...snapshot.messages[0],id:'second-reply',content:'Second owner message',createdAt:'2026-10-29T23:01:00.000Z'});
  snapshot.artifacts.push({...first,id:'second-surface',messageId:'second-reply',title:'Second surface',stateId:'second-state'});
  snapshot.userStates.push({...snapshot.userStates[0],id:'second-state'});
  const host=await serveTaskFixture(page,snapshot);
  await openApp(page);
  const alpha=page.locator('[data-artifact-id="task-surface"] .artifact-secondary-tools');
  const beta=page.locator('[data-artifact-id="second-surface"] .artifact-secondary-tools');
  await expect(alpha).toHaveAttribute('data-tooltip-group',JSON.stringify(['task-thread','task-surface',1]));
  await expect(beta).toHaveAttribute('data-tooltip-group',JSON.stringify(['task-thread','second-surface',1]));
  const tooltip=page.getByRole('tooltip');
  const count=host.commands.length;
  await alpha.getByRole('button',{name:'Pin artifact'}).hover();
  await expect(tooltip).toHaveText('Pin artifact');
  await beta.getByRole('button',{name:'View artifact source'}).hover();
  await expect(tooltip).toHaveText('View source');
  await expect(tooltip).toHaveAttribute('data-opening','pointer-cold');
  await beta.getByRole('button',{name:'Archive artifact'}).hover();
  await expect(tooltip).toHaveText('Archive artifact');
  await expect(tooltip).toHaveAttribute('data-opening','pointer-warm');
  expect(host.commands).toHaveLength(count);
});

test('artifact unified diff distinguishes file headers, hunks and prefixed content', async ({page}) => {
  await page.setViewportSize({width:320,height:840});
  const lines = [
    'diff --git a/first.txt b/first.txt',
    'index abcd123..bcde234 100644',
    '--- a/first.txt',
    '+++ b/first.txt',
    '@@ -1,2 +1,2 @@',
    '--- literal removed line',
    '+++ literal added line',
    ' A shared context line wide enough to scroll on a narrow panel.',
    '\\ No newline at end of file',
    '--- /dev/null',
    '+++ b/second.txt',
    '@@ -0,0 +1 @@',
    '+ created',
  ];
  const snapshot=taskFixture({root:'compare',elements:{compare:{type:'Diff',props:{dataBinding:'patch'}}}}, {patch:lines.join('\n')});
  await serveTaskFixture(page,snapshot);
  await openApp(page);
  const diff=page.locator('pre.diff');
  await expect(diff).toBeVisible();
  await expect(diff.locator(':scope > *')).toHaveText(lines);
  expect(await diff.locator(':scope > *').evaluateAll(rows=>rows.map(row=>row.className))).toEqual([
    'diff-header','diff-header','diff-header','diff-header','diff-hunk','removed','added','','diff-hunk','diff-header','diff-header','diff-hunk','added',
  ]);
  expect(await diff.evaluate(node=>node.scrollWidth>node.clientWidth)).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await test.info().attach('Unified diff at 320 px with synthetic data',{body:await page.screenshot(),contentType:'image/png'});
});
