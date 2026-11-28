import { expect, test } from '@playwright/test';
import { resolve } from 'node:path';
import type { DatabaseSchemaV1, DatabaseQueryResultV1 } from '../../packages/contracts/database';

const fixture = '/@fs/' + resolve('tests/e2e/database-browser-fixture.tsx').replaceAll('\\', '/');
test.beforeEach(async ({ page }) => {
	await page.route(url => url.pathname === '/database-browser', route => route.fulfill({
		contentType: 'text/html', body: `<html data-theme="dark"><body><div id="root"></div><script type="module">import RefreshRuntime from '/@react-refresh';RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;await import('${encodeURI(fixture)}');</script></body></html>`,
	}));
});

test('attach-scoped query shows rows, then grid edit prepares one UPDATE per row', async ({ page }) => {
	await page.goto('/database-browser');
	// Attachment is preselected; schema loads automatically.
	await expect(page.getByText('Changes need approval')).toBeVisible();
	await expect(page.getByRole('treegrid').or(page.locator('.schema-tree'))).toBeVisible();
	// Interaction 1: pick the orders table (fills the editor).
	await page.locator('.schema-tree').getByText('orders').click();
	// Interaction 2: run.
	await page.getByRole('button', { name: 'Run' }).click();
	const grid = page.locator('.query-result-grid');
	await expect(grid.getByText('Ada')).toBeVisible();
	// Interaction 3: edit mode; PK column shows the lock affordance.
	await page.getByRole('button', { name: 'Edit' }).click();
	await expect(page.getByLabel('Read only')).toBeVisible();
	const key = grid.getByRole('gridcell', { name: '2', exact: true });
	await expect(key).toHaveAttribute('aria-readonly', 'true');
	await expect(key.getByRole('button')).toHaveCount(0);
	// Interaction 4: edit a cell and review.
	await page.getByRole('button', { name: 'Ben' }).click();
	await page.getByLabel('Edit row 2 column 2').fill('Benjamin');
	await expect(page.getByRole('button', { name: 'Review changes (1)' })).toBeVisible();
	await page.getByRole('button', { name: 'Review changes (1)' }).click();
	await expect(page.getByText('Prepared for approval')).toBeVisible();
	const body = JSON.parse(await page.evaluate(() => (window as never as { __lastPrepare: string }).__lastPrepare) as string) as { mode: string; statements: { sql: string; params: unknown[]; expectedChanges: number }[] };
	expect(body.mode).toBe('transaction');
	expect(body.statements).toHaveLength(1);
	expect(body.statements[0]!.sql).toBe('UPDATE "main"."orders" SET "customer"=? WHERE "id"=?');
	expect(body.statements[0]!.params).toEqual(['Benjamin', 2]);
	expect(body.statements[0]!.expectedChanges).toBe(1);
});

test('switching connections keeps delayed schema and query responses with their owner', async ({ page }) => {
	const attachments = ['A', 'B'].map(id => ({ id, connectionId: id, writable: true }));
	const connections = attachments.map(({ id }) => ({ id, label: `Connection ${id}` }));
	const schema = (id: string): DatabaseSchemaV1 => ({
		version: 1, engine: 'sqlite', truncated: false, digest: 'b'.repeat(64),
		schemas: [{ name: 'main', objects: [{ kind: 'table', name: `table_${id}`, approxRows: 1, columns: [{ name: 'id', type: 'INTEGER' }], foreignKeys: [], indexes: [] }] }],
	});
	const result = (id: string): DatabaseQueryResultV1 => ({
		version: 1, engine: 'sqlite', connectionLabel: id, sqlSha256: '', columns: [{ name: 'id', type: 'TEXT' }],
		rows: [[`row_${id}`]], rowCount: 1, truncated: false, elapsedMs: 1, executedAt: '2026-11-21T16:00:00Z',
		source: { table: { schema: 'main', name: `table_${id}`, primaryKey: ['id'] } },
	});
	let releasePrevious!: () => void, releaseCurrent!: () => void;
	const previous = new Promise<void>(resolve => { releasePrevious = resolve; });
	const current = new Promise<void>(resolve => { releaseCurrent = resolve; });
	await page.route(/\/api\/threads\/[^/]+\/databases(?:\/|$)/, async route => {
		const url = new URL(route.request().url()), [, id, operation] = url.pathname.split('/databases')[1]!.split('/');
		if (!id) return route.fulfill({ json: { connections, attachments } });
		if (id === 'A' && (operation === 'query' || url.searchParams.has('refresh'))) await previous;
		if (id === 'B' && operation === 'query') await current;
		if (operation === 'schema') return route.fulfill({ json: schema(id) });
		if (operation === 'query') return route.fulfill({ json: { requestId: id, dataId: id, result: result(id) } });
		return route.fulfill({ status: 404, json: {} });
	});
	await page.goto('/database-browser?view=connections');
	const tree = page.locator('.schema-tree'), grid = page.getByRole('grid');
	await tree.getByText('table_A', { exact: true }).click();
	const oldSchema = page.waitForRequest('**/databases/A/schema?refresh=true');
	await page.getByRole('button', { name: 'Refresh schema' }).click();
	await oldSchema;
	const oldQuery = page.waitForRequest('**/databases/A/query');
	await page.getByRole('button', { name: 'Run', exact: true }).click();
	await oldQuery;
	await page.getByRole('combobox', { name: 'Attached connection' }).click();
	await page.getByRole('option', { name: 'Connection B' }).click();
	await tree.getByText('table_B', { exact: true }).click();
	const currentQuery = page.waitForRequest('**/databases/B/query');
	await page.getByRole('button', { name: 'Run', exact: true }).click();
	await currentQuery;

	const lateSchema = page.waitForResponse('**/databases/A/schema?refresh=true');
	const lateQuery = page.waitForResponse('**/databases/A/query');
	releasePrevious();
	for (const response of await Promise.all([lateSchema, lateQuery])) await response.finished();
	await page.evaluate(() => new Promise<void>(done => requestAnimationFrame(() => requestAnimationFrame(() => done()))));
	await expect(tree.getByText('table_B', { exact: true })).toBeVisible();
	await expect(tree.getByText('table_A', { exact: true })).toHaveCount(0);
	await expect(grid.getByRole('gridcell', { name: 'row_A' })).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Edit', exact: true })).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Cancel', exact: true })).toBeVisible();
	releaseCurrent();
	await expect(grid.getByRole('gridcell', { name: 'row_B' })).toBeVisible();
});

test('a table without a primary key disables editing with a tooltip', async ({ page }) => {
	await page.goto('/database-browser?nopk=1');
	await page.locator('.schema-tree').getByText('logs').click();
	await page.getByRole('button', { name: 'Run' }).click();
	await page.locator('.query-result-grid').getByText('boot').waitFor();
	const edit = page.getByRole('button', { name: 'Edit' });
	await expect(edit).toBeDisabled();
	await expect(edit).toHaveAttribute('title', 'Editing needs a primary key');
});

test('1000x20 grid mounts under 150ms scripting and scrolls at 50fps', async ({ page }) => {
	await page.goto('/database-browser?view=perf');
	await page.locator('.schema-tree').getByText('orders').click();
	await page.getByRole('button', { name: 'Run' }).click();
	const grid = page.locator('.query-result-grid');
	await expect(grid).toBeVisible();
	const mountMs = await page.evaluate(async () => {
		const start = performance.now();
		document.querySelector('.query-result-scroll')!.scrollTop = 0;
		await new Promise<void>(done => requestAnimationFrame(() => done()));
		return performance.now() - start;
	});
	expect(mountMs).toBeLessThan(150);
	const frameMs = await page.evaluate(async () => {
		const scroller = document.querySelector('.query-result-scroll') as HTMLElement;
		const frames: number[] = [];
		let last = performance.now(), steps = 0;
		await new Promise<void>(done => {
			const tick = (now: number) => {
				frames.push(now - last); last = now;
				scroller.scrollTop += 240;
				if (++steps < 40) requestAnimationFrame(tick); else done();
			};
			requestAnimationFrame(tick);
		});
		return frames.slice(2).reduce((sum, value) => sum + value, 0) / (frames.length - 2);
	});
	expect(frameMs).toBeLessThanOrEqual(20);
});

test('scrolling preserves cell focus, tab order, and resized column geometry', async ({ page }) => {
	await page.goto('/database-browser?view=perf');
	await page.locator('.schema-tree').getByText('orders').click();
	await page.getByRole('button', { name: 'Run' }).click();
	const scroller = page.getByRole('grid');
	await expect(scroller).toHaveAttribute('aria-colcount', '21');
	// Enter from either side while the grid is still moving horizontally.
	for (const backward of [false, true]) {
		await page.getByRole('button', { name: backward ? 'Send to chat' : 'Run', exact: true }).focus();
		await scroller.evaluate(async (node, fromEnd) => {
			node.scrollLeft = fromEnd ? 0 : node.scrollWidth;
			let steps = 0;
			const move = () => {
				if (node.contains(document.activeElement) || ++steps > 60) return;
				node.scrollTop += 1;
				requestAnimationFrame(move);
			};
			move();
			await new Promise<void>(done => requestAnimationFrame(() => requestAnimationFrame(() => done())));
		}, backward);
		await page.keyboard.press(backward ? 'Shift+Tab' : 'Tab');
		await expect(scroller.locator(':focus')).toHaveAttribute('aria-colindex', backward ? '21' : '2');
	}

	await scroller.evaluate(node => { node.scrollTop = 500 * 32; node.scrollLeft = node.scrollWidth; });
	const row = scroller.locator('[role="row"][aria-rowindex="502"]');
	const lastCell = row.getByRole('gridcell', { name: 'r500c19', exact: true });
	await expect(lastCell).toBeInViewport();
	await lastCell.focus();
	// Move the focused cell out of view during a scroll, before its idle window settles.
	const keptFocus = await scroller.evaluate(async node => {
		const cell = document.activeElement;
		node.scrollLeft = 0;
		node.scrollTop -= 64;
		await new Promise<void>(done => requestAnimationFrame(() => requestAnimationFrame(() => done())));
		return cell !== null && document.activeElement === cell && node.contains(cell);
	});
	expect(keptFocus).toBe(true);
	await page.keyboard.press('Tab');
	await expect(scroller.getByRole('gridcell', { name: 'r501c0', exact: true })).toBeFocused();
	await page.keyboard.press('Shift+Tab');
	await expect(lastCell).toBeFocused();

	const header = scroller.getByRole('columnheader', { name: /c18\b/ });
	const handle = header.getByRole('separator');
	await handle.scrollIntoViewIfNeeded();
	const width = await header.evaluate(node => node.getBoundingClientRect().width);
	const grip = await handle.boundingBox();
	if (!grip) throw new Error('Missing column resize handle');
	await page.mouse.move(grip.x + 1, grip.y + grip.height / 2);
	await page.mouse.down();
	await page.mouse.move(grip.x + 37, grip.y + grip.height / 2);
	await page.mouse.up();
	await expect.poll(() => header.evaluate(node => node.getBoundingClientRect().width)).toBe(width + 36);
	await expect.poll(() => row.getByRole('gridcell', { name: 'r500c18', exact: true }).evaluate(node => node.getBoundingClientRect().width)).toBe(width + 36);
});

test('wide result rows stay aligned with their headers after two-axis scrolling', async ({ page }) => {
	await page.goto('/database-browser?view=perf&wide=1');
	await page.locator('.schema-tree').getByText('orders').click();
	await page.getByRole('button', { name: 'Run' }).click();
	const scroller = page.getByRole('grid');
	await expect(scroller).toHaveAttribute('aria-colcount', '41');
	await scroller.evaluate(node => { node.scrollTop = 750 * 32; node.scrollLeft = node.scrollWidth; });
	const cell = scroller.getByRole('gridcell', { name: 'r750c39', exact: true });
	const header = scroller.getByRole('columnheader', { name: /c39\b/ });
	await expect(cell).toBeInViewport();
	await expect(header).toBeInViewport();
	const position = (node: Element) => {
		const { x, width } = node.getBoundingClientRect();
		return { x, width };
	};
	expect(await cell.evaluate(position)).toEqual(await header.evaluate(position));
});
