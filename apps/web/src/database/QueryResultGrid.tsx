import { memo, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import type { DatabaseQueryResultV1 } from '../../../../packages/contracts/database.ts';

export type ResultCell = DatabaseQueryResultV1['rows'][number][number];
export type GridDensity = 'compact' | 'comfortable' | 'touch';

export const formatBytes = (length: number) => length >= 1024 ? `${(length / 1024).toFixed(1)} KB` : `${length} B`;
export const cellText = (cell: ResultCell) =>
	cell === null ? 'NULL' : typeof cell === 'object' ? (cell.kind === 'bytes' ? `<bytes ${formatBytes(cell.length)}>` : cell.preview) : String(cell);
export const rowsTsv = (result: Pick<DatabaseQueryResultV1, 'columns' | 'rows'>) =>
	[result.columns.map(column => column.name).join('\t'), ...result.rows.map(row => row.map(cellText).join('\t'))].join('\n');

const HEADER_HEIGHT = 32, GUTTER = 44, MIN_COL_WIDTH = 48, OVERSCAN = 10, COLUMN_VIRTUALIZE_AT = 30;
const ROW_HEIGHTS: Record<GridDensity, number> = { compact: 28, comfortable: 32, touch: 44 };
const clampWidth = (value: number) => Math.min(320, Math.max(80, value));
const contentWidth = (result: DatabaseQueryResultV1, index: number) => {
	let longest = result.columns[index]!.name.length + result.columns[index]!.type.length / 2;
	for (const row of result.rows.slice(0, 50)) longest = Math.max(longest, cellText(row[index]!).length);
	return clampWidth(longest * 8 + 16);
};

export interface ResultDraft { edits: Record<string, string>; onEdit(rowIndex: number, columnIndex: number, value: string): void }

/** Virtualized results grid shared by the Database panel and the in-thread card.
 * Renders only visible rows + overscan; columns above 30 are windowed too.
 * `draft` is the T10 edit-mode seam: keyed `row:column` draft text, edited inline. */
export function QueryResultGrid({ result, density = 'comfortable', draft, readOnlyColumns, labelledBy, height }: { result: DatabaseQueryResultV1; density?: GridDensity; draft?: ResultDraft; readOnlyColumns?: ReadonlySet<number>; labelledBy?: string; height?: number }) {
	const scroll = useRef<HTMLDivElement>(null);
	const [top, setTop] = useState(0), [left, setLeft] = useState(0), [viewH, setViewH] = useState(320), [viewW, setViewW] = useState(640);
	const [widths, setWidths] = useState<Record<number, number>>({});
	useLayoutEffect(() => {
		const node = scroll.current;
		if (!node) return;
		const measure = () => { setViewH(node.clientHeight); setViewW(node.clientWidth); };
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(node);
		return () => observer.disconnect();
	}, []);

	const rowHeight = ROW_HEIGHTS[density];
	const naturalWidths = useMemo(() => result.columns.map((_, index) => contentWidth(result, index)), [result]);
	const columns = useMemo(() => {
		let left = GUTTER;
		return naturalWidths.map((naturalWidth, index) => {
			const width = widths[index] ?? naturalWidth;
			const style = { left, width };
			left += width;
			return style;
		});
	}, [naturalWidths, widths]);
	const tracks = useMemo(() => [GUTTER, ...columns.map(column => column.width)].map(width => width + 'px').join(' '), [columns]);
	const rows = result.rows;
	const totalH = rows.length * rowHeight;
	const start = Math.min(rows.length, Math.max(0, Math.floor(top / rowHeight) - OVERSCAN));
	const end = Math.min(rows.length, Math.ceil((top + viewH) / rowHeight) + OVERSCAN);
	const readOnlyPool = useRef<HTMLDivElement[]>([]);
	const virtualCols = result.columns.length > COLUMN_VIRTUALIZE_AT;
	const lastColumn = columns.at(-1);
	const totalW = lastColumn ? lastColumn.left + lastColumn.width - GUTTER : 0;
	const colStart = virtualCols ? Math.max(0, columns.findIndex(column => column.left - GUTTER + column.width > left) - 4) : 0;
	const firstPast = virtualCols ? columns.findIndex(column => column.left - GUTTER > left + viewW) : -1;
	const colEnd = virtualCols ? (firstPast < 0 ? result.columns.length : Math.min(result.columns.length, firstPast + 4)) : result.columns.length;

	const resize = useCallback((index: number) => (event: React.PointerEvent) => {
		event.preventDefault(); event.stopPropagation();
		const startX = event.clientX, startWidth = columns[index]!.width;
		const move = (moveEvent: PointerEvent) => setWidths(current => ({ ...current, [index]: Math.max(MIN_COL_WIDTH, startWidth + moveEvent.clientX - startX) }));
		const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
		window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
	}, [columns]);

	return <div className="query-result-grid" style={{ height, '--query-grid-tracks': tracks } as React.CSSProperties}>
		<div className="query-result-scroll" role="grid" aria-labelledby={labelledBy} aria-rowcount={rows.length + 1} aria-colcount={result.columns.length + 1}
			onScroll={event => { const element = event.currentTarget; setTop(element.scrollTop); setLeft(element.scrollLeft); }}
			ref={scroll}>
			<div style={{ height: totalH + HEADER_HEIGHT, width: GUTTER + totalW, position: 'relative' }}>
				<ResultHeader labels={result.columns} columns={columns} readOnlyColumns={readOnlyColumns}
					width={GUTTER + totalW} colStart={colStart} colEnd={colEnd} resize={resize}/>
				{rows.slice(start, end).map((row, offset) => !draft && !virtualCols
					? <ReadOnlyRow key={start + offset} pool={readOnlyPool} row={row} rowIndex={start + offset} rowHeight={rowHeight} columnCount={columns.length}/>
					: <ResultRow key={start + offset} row={row} rowIndex={start + offset} rowHeight={rowHeight} totalW={totalW}
						colStart={colStart} colEnd={colEnd} readOnlyColumns={readOnlyColumns} draft={draft}/>)}
			</div>
		</div>
		{rows.length === 0 && <p className="database-empty muted">No rows</p>}
	</div>;
}

const ResultHeader = memo(function ResultHeader({ labels, columns, readOnlyColumns, width, colStart, colEnd, resize }: {
	labels: DatabaseQueryResultV1['columns']; columns: { left: number; width: number }[]; readOnlyColumns?: ReadonlySet<number>;
	width: number; colStart: number; colEnd: number; resize: (index: number) => (event: React.PointerEvent) => void;
}) {
	return <div className="query-result-header" role="row" aria-rowindex={1} style={{ width }}>
		{labels.map((column, index) => index >= colStart && index < colEnd
			? <span key={index} role="columnheader" aria-colindex={index + 2} className="query-result-th" style={columns[index]}>
				<span className="query-result-th-label" title={`${column.name} · ${column.type}`}>{column.name} <span className="schema-type">{column.type}</span></span>
				{readOnlyColumns?.has(index) && <Lock size={12} aria-label="Read only"/>}
				<span className="query-result-col-resize" role="separator" aria-orientation="vertical" aria-label={`Resize ${column.name}`} onPointerDown={resize(index)}/>
			</span>
			: null)}
		<span className="row-number" role="columnheader" aria-colindex={1} style={{ width: GUTTER }}>#</span>
	</div>;
});

// Recycle detached read-only cell groups as rows leave the viewport. Logical row
// keys stay stable, so scrolling in either direction preserves visible focus.
const ReadOnlyRow = memo(function ReadOnlyRow({ row, rowIndex, rowHeight, columnCount, pool }: {
	row: DatabaseQueryResultV1['rows'][number]; rowIndex: number; rowHeight: number; columnCount: number; pool: React.RefObject<HTMLDivElement[]>;
}) {
	const host = useRef<HTMLDivElement>(null);
	const cells = useRef<HTMLDivElement>(null);
	useLayoutEffect(() => {
		const container = host.current;
		if (!container) return;
		const group = pool.current.pop() ?? document.createElement('div');
		group.className = 'query-result-cells';
		group.setAttribute('role', 'presentation');
		cells.current = group;
		container.appendChild(group);
		return () => {
			group.remove();
			cells.current = null;
			if (pool.current.length < OVERSCAN * 2) pool.current.push(group);
		};
	}, [pool]);
	useLayoutEffect(() => {
		const node = cells.current;
		if (!node) return;
		const length = Math.min(columnCount, row.length);
		const fragment = document.createDocumentFragment();
		for (let index = 0; index < length; index++) {
			const cell = row[index]!;
			let span = node.children[index] as HTMLSpanElement | undefined;
			if (!span) {
				span = document.createElement('span');
				span.setAttribute('role', 'gridcell');
				span.setAttribute('aria-colindex', String(index + 2));
				span.tabIndex = 0;
				fragment.appendChild(span);
			}
			const text = cellText(cell);
			span.className = cellClass(cell);
			if (text.length > 60) span.title = text;
			else span.removeAttribute('title');
			if (cell === null) {
				const italic = document.createElement('em');
				italic.textContent = text;
				span.replaceChildren(italic);
			} else span.textContent = text;
		}
		while (node.childElementCount > length) node.lastElementChild!.remove();
		node.appendChild(fragment);
	}, [row, columnCount]);
	return <div role="row" aria-rowindex={rowIndex + 2} className="query-result-tr" style={{ top: HEADER_HEIGHT + rowIndex * rowHeight, height: rowHeight, width: '100%' }}>
		<span className="row-number" role="rowheader" aria-colindex={1}>{rowIndex + 1}</span>
		<div ref={host} role="presentation" className="query-result-cell-host"/>
	</div>;
});

const cellClass = (cell: ResultCell) => 'query-result-td' + (typeof cell === 'number' ? ' numeric' : cell === null ? ' null-cell' : '');

const ResultRow = memo(function ResultRow({ row, rowIndex, rowHeight, totalW, colStart, colEnd, readOnlyColumns, draft }: {
	row: DatabaseQueryResultV1['rows'][number]; rowIndex: number; rowHeight: number; totalW: number;
	colStart: number; colEnd: number; readOnlyColumns?: ReadonlySet<number>; draft?: ResultDraft;
}) {
	return <div role="row" aria-rowindex={rowIndex + 2} className="query-result-tr" style={{ top: HEADER_HEIGHT + rowIndex * rowHeight, height: rowHeight, width: GUTTER + totalW }}>
		<span className="row-number" role="rowheader" aria-colindex={1}>{rowIndex + 1}</span>
		{row.slice(colStart, colEnd).map((cell, offset) => renderCell(cell, rowIndex, colStart + offset, draft, readOnlyColumns?.has(colStart + offset) === true, offset === 0 && colStart > 0 ? { gridColumnStart: colStart + 2 } : undefined))}
	</div>;
});

function renderCell(cell: ResultCell, rowIndex: number, columnIndex: number, draft: ResultDraft | undefined, readOnly: boolean, style: React.CSSProperties | undefined) {
	const text = cellText(cell), key = `${rowIndex}:${columnIndex}`, edited = draft !== undefined && Object.hasOwn(draft.edits, key);
	if (draft && !readOnly && edited)
		return <span key={columnIndex} role="gridcell" aria-colindex={columnIndex + 2} className="query-result-td editing draft" aria-description="Changed, not saved" style={style}><input aria-label={`Edit row ${rowIndex + 1} column ${columnIndex + 1}`} value={draft.edits[key]} onChange={event => draft.onEdit(rowIndex, columnIndex, event.target.value)}/></span>;
	return <span key={columnIndex} role="gridcell" aria-colindex={columnIndex + 2} tabIndex={0} aria-readonly={readOnly || undefined} className={cellClass(cell)} style={style} title={text.length > 60 ? text : undefined}>
		{draft && !readOnly && cell !== null ? <button type="button" className="query-result-cell-button" onClick={() => draft.onEdit(rowIndex, columnIndex, text)}>{text}</button> : (cell === null ? <em>NULL</em> : text)}
	</span>;
}

/** Structure-matched static skeleton for the initial load (spec: header + 8 rows). */
export function QueryResultSkeleton({ columns = 4 }: { columns?: number }) {
	return <div className="query-result-grid" aria-hidden="true"><div className="query-result-scroll"><div className="query-result-skeleton">
		<div className="query-result-header" style={{ display: 'flex' }}>{Array.from({ length: columns + 1 }, (_, index) => <span key={index} className="query-result-skeleton-cell" style={{ width: index ? 160 : GUTTER }}/>)}</div>
		{Array.from({ length: 8 }, (_, row) => <div key={row} className="query-result-skeleton-row">{Array.from({ length: columns + 1 }, (_, index) => <span key={index} className="query-result-skeleton-cell" style={{ width: index ? 160 : GUTTER }}/>)}</div>)}
	</div></div></div>;
}
