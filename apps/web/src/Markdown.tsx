import { Fragment, memo, useId, useMemo, useState, type ReactNode } from 'react';
import {SentenceReveal} from './SentenceReveal';
import {CopyButton} from './CopyButton';
import {MarkdownMath, useMathRenderOwner, type MarkdownMathProps} from './MarkdownMath';
import {admitMath, createDisplayMathScanner, findInlineMath, mathScanAllowed, type MathSpan} from './markdown-math';
import './markdown.css';

type MathOwner = Pick<MarkdownMathProps, 'owner' | 'ownerKey' | 'sourceRevision'>;
type Location = {start: number; offset: number};
type LocatedSpan = {span: MathSpan; offset: number};
type MathCandidate = {span: MathSpan; offset: number; admitted: boolean};

interface MathParsing {
  owner: MathOwner;
  lineStarts: readonly number[];
  candidates: MathCandidate[];
  displayAt: (line: number) => ReturnType<ReturnType<typeof createDisplayMathScanner>>;
}

const INLINE_LITERAL_TOKEN = /`[^`]+`|\[[^\]]+\]\((?:https?:\/\/[^\s)]+|#[^\s)]+)\)/g;
const INLINE_TOKEN = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\((?:https?:\/\/[^\s)]+|#[^\s)]+)\))/g;

function renderCandidate(context: MathParsing, key: string, {span, offset}: LocatedSpan, literal?: string) {
  const candidate = {span, offset, admitted:false};
  context.candidates.push(candidate);
  return <FormulaCandidate key={key} candidate={candidate} literal={literal} leafKey={key} {...context.owner} />;
}

function FormulaCandidate({candidate, literal, ...owner}: Omit<MarkdownMathProps, 'span'> & {candidate: MathCandidate; literal?: string}) {
  return candidate.admitted
    ? <MarkdownMath {...owner} span={candidate.span} />
    : literal === undefined ? candidate.span.raw : <p>{literal}</p>;
}

function inlineWithMath(text: string, context: MathParsing, key: string, located: readonly LocatedSpan[]) {
  // Keep offsets stable while hiding TeX punctuation from the inline grammar.
  // Complete code/link tokens already take precedence in the recognizer.
  const chunks: string[] = [];
  let offset = 0;
  for (const {span} of located) {
    chunks.push(text.slice(offset, span.start), ' '.repeat(span.end - span.start));
    offset = span.end;
  }
  chunks.push(text.slice(offset));

  let formula = 0;
  function range(start: number, end: number): ReactNode {
    const nodes: ReactNode[] = [];
    for (let item = located[formula]; item && item.span.start < end; item = located[formula]) {
      nodes.push(text.slice(start, item.span.start), renderCandidate(context, key + ':' + formula, item));
      start = item.span.end;
      formula++;
    }
    nodes.push(text.slice(start, end));
    return nodes;
  }

  const nodes: ReactNode[] = [];
  let start = 0;
  for (const token of chunks.join('').matchAll(INLINE_TOKEN)) {
    const end = token.index + token[0].length;
    nodes.push(range(start, token.index));
    const original = text.slice(token.index, end);
    if (token[0].startsWith('**')) {
      nodes.push(<strong key={token.index}>{range(token.index + 2, end - 2)}</strong>);
    } else {
      nodes.push(inline(original));
    }
    start = end;
  }
  nodes.push(range(start, text.length));
  return nodes;
}

function proseMathSpans(text: string) {
  const spans = findInlineMath(text);
  if (!spans.length) return spans;
  const literals = text.matchAll(INLINE_LITERAL_TOKEN);
  let literal = literals.next().value;
  const inLiteral = (index: number) => {
    while (literal && literal.index + literal[0].length <= index) literal = literals.next().value;
    return literal !== undefined && literal.index <= index;
  };
  // An unmatched opener cannot borrow a closing delimiter from an existing
  // code span or link. A literal token wholly inside a formula stays opaque.
  return spans.filter(span => !inLiteral(span.start) && !inLiteral(span.end - 1));
}

function inlineAt(text: string, math: MathParsing | undefined, key: string, locations: readonly Location[], known?: readonly LocatedSpan[]) {
  if (!math) return inline(text);
  let line = 0;
  const spans = known ?? proseMathSpans(text).map(span => {
    while (locations[line + 1] && locations[line + 1]!.start <= span.start) line++;
    const location = locations[line]!;
    return {span, offset:location.offset + span.start - location.start};
  });
  return spans.length ? inlineWithMath(text, math, key, spans) : inline(text);
}

function inline(text: string): ReactNode {
  return text.split(INLINE_TOKEN).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`')) return <code key={index}>{part.slice(1, -1)}</code>;
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+|#[^\s)]+)\)$/);
    if (link) return <a key={index} href={link[2]} target={link[2].startsWith('#') ? undefined : '_blank'} rel="noreferrer">{link[1]}</a>;
    return <Fragment key={index}>{part}</Fragment>;
  });
}

export interface ReplyHeading {key:string;level:number;label:string}
/** Visible text of a heading label, from the same inline grammar the renderer uses. */
function inlineLabel(text:string):string{
  const label=text.replaceAll(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\((?:https?:\/\/[^\s)]+|#[^\s)]+)\))/g,part=>part.startsWith('**')?part.slice(2,-2):part.startsWith('`')?part.slice(1,-1):(part.match(/^\[([^\]]+)\]\(/)?.[1]??part));
  return label.replace(/\s+/g,' ').trim()||'Untitled section';
}

type Alignment='left'|'center'|'right'|undefined;
type TableCell = {text: string; spans: readonly LocatedSpan[]};
const EMPTY_CELL: TableCell = {text:'', spans:[]};
const MAX_TABLE_COLUMNS=24,MAX_TABLE_ROWS=200,MAX_TABLE_CELLS=4096;
function tableRow(line: string, math?: MathParsing, lineIndex = 0) {
  const source = line.trim(), cells: TableCell[] = [];
  const lineOffset = math ? math.lineStarts[lineIndex]! + line.length - line.trimStart().length : 0;
  const formulas = math ? proseMathSpans(source) : [];
  let formula = 0, value = '', spans: LocatedSpan[] = [], ticks = 0, pipes = 0;
  function finishCell() {
    const indent = spans.length ? value.length - value.trimStart().length : 0;
    cells.push({
      text:value.trim(),
      spans:spans.length ? spans.map(({span, offset}) => ({span:{...span, start:span.start - indent, end:span.end - indent}, offset})) : EMPTY_CELL.spans,
    });
    value = '';
    spans = [];
  }
  for (let index = 0; index < source.length; index++) {
    while (formulas[formula] && formulas[formula]!.start < index) formula++;
    const span = formulas[formula];
    if (!ticks && span?.start === index) {
      spans.push({span:{...span, start:value.length, end:value.length + span.raw.length}, offset:lineOffset + span.start});
      value += span.raw;
      index = span.end - 1;
      formula++;
      continue;
    }
    const character=source[index]!;
    if(character==='\\'&&source[index+1]==='|'&&!ticks){value+='|';index++;continue;}
    if(character==='\\'&&source[index+1]==='\\'&&!ticks){value+='\\';index++;continue;}
    if(character==='`'){
      let end=index+1;while(source[end]==='`')end++;const count=end-index;
      if(!ticks)ticks=count;else if(ticks===count)ticks=0;
      value+=source.slice(index,end);index=end-1;continue;
    }
    if(character==='|'&&!ticks){finishCell();pipes++;}else value+=character;
  }
  finishCell();
  if(source.startsWith('|'))cells.shift();
  if(source.endsWith('|')&&cells.at(-1)?.text==='')cells.pop();
  return {cells,pipes};
}
function tableStart(lines:string[],index:number,math?:MathParsing){
  if(!lines[index]?.includes('|')||!lines[index+1]?.includes('-'))return null;
  const header=tableRow(lines[index]!,math,index),separator=tableRow(lines[index+1]!);
  if(!header.pipes||!header.cells.length||header.cells.length!==separator.cells.length||!separator.cells.every(cell=>/^:?-{3,}:?$/.test(cell.text)))return null;
  return {header:header.cells,oversized:header.cells.length>MAX_TABLE_COLUMNS,align:header.cells.length>MAX_TABLE_COLUMNS?[]:separator.cells.map<Alignment>(({text})=>text.startsWith(':')?text.endsWith(':')?'center':'left':text.endsWith(':')?'right':undefined)};
}
function marker(line:string){
  const match=/^([ \t]*)([-+*]|\d{1,9}[.)])[ \t]+(.*)$/.exec(line);
  return match?{indent:match[1]!.replaceAll('\t','    ').length,ordered:/^\d/.test(match[2]!),start:Number.parseInt(match[2]!,10),text:match[3]!}:null;
}
const heading=(line:string)=>/^ {0,3}(#{1,6})[ \t]+(.*)$/.exec(line);
const fence=(line:string)=>/^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
const numeric=(value:string)=>/^[+\-−]?\d[\d,]*(?:\.\d+)?(?:\s*(?:%|ms|s|bytes?|[kmg]i?b))?$/i.test(value);
const startsList=(line:string)=>{const item=marker(line);return item!==null&&item.indent<4;};

function list(lines:string[],start:number,key:string,depth=0,math?:MathParsing):{node:ReactNode;next:number}{
  const first=marker(lines[start]!)!,items:ReactNode[]=[];let index=start;
  while(index<lines.length){
    const current=marker(lines[index]!);if(!current||current.indent!==first.indent||current.ordered!==first.ordered)break;
    let text=current.text;const children:ReactNode[]=[];
    const locations = math ? [{start:0, offset:math.lineStarts[index]! + lines[index]!.length - text.length}] : [];
    index++;
    while(index<lines.length){
      const line=lines[index]!,next=marker(line);
      if(!line.trim()){
        let after=index+1;while(after<lines.length&&!lines[after]!.trim())after++;
        const following=marker(lines[after]??'');
        if(following&&following.indent===first.indent&&following.ordered===first.ordered)index=after;
        break;
      }
      if(next){
        if(next.indent<=first.indent)break;
        if(depth<12){const nested=list(lines,index,`${key}-${items.length}-${children.length}`,depth+1,math);children.push(nested.node);index=nested.next;continue;}
      }
      if(heading(line)||fence(line)||math?.displayAt(index)||tableStart(lines,index,math))break;
      if (math) locations.push({start:text.length + 1, offset:math.lineStarts[index]! + line.length - line.trimStart().length});
      text+='\n'+line.trim();index++;
    }
    items.push(<li key={items.length}>{inlineAt(text,math,`list:${key}:${items.length}`,locations)}{children}</li>);
  }
  return {node:first.ordered?<ol key={key} className="markdown-list" start={first.start}>{items}</ol>:<ul key={key} className="markdown-list">{items}</ul>,next:index};
}

function createMathParsing(text: string, owner: MathOwner): MathParsing {
  const lineStarts = [0];
  for (let index = text.indexOf('\n'); index !== -1; index = text.indexOf('\n', index + 1)) {
    lineStarts.push(index + 1);
  }
  const scan = createDisplayMathScanner(text, lineStarts);
  const displays = new Map<number, ReturnType<typeof scan>>();
  return {
    lineStarts,
    owner,
    candidates: [],
    displayAt(line) {
      if (!displays.has(line)) displays.set(line, scan(line));
      return displays.get(line) ?? null;
    },
  };
}

/** A small safe block renderer; malformed table rows remain visible as prose.
 * When `headings` is supplied (opt-in reply outline), each emitted heading also
 * records a descriptor and gains a local target marker; prose output and keys
 * are otherwise unchanged. */
function blocks(text:string,headings?:ReplyHeading[], owner?:MathOwner):ReactNode[]{
  const math = owner ? createMathParsing(text, owner) : undefined;
  const lines=text.replaceAll('\r\n','\n').split('\n'),nodes:ReactNode[]=[];let index=0,tableCells=0;
  while(index<lines.length){
    if(!lines[index]!.trim()){index++;continue;}
    const key=String(index),opening=fence(lines[index]!);
    if(opening){
      const start=++index,character=opening[1]![0]!,minimum=opening[1]!.length;
      while(index<lines.length&&!new RegExp(`^ {0,3}${character}{${minimum},}[ \\t]*$`).test(lines[index]!))index++;
      const code=lines.slice(start,index).join('\n')+(index<lines.length&&index>start?'\n':'');
      nodes.push(<div key={key} className="markdown-code"><CopyButton text={code} label="Copy code"/><pre><code>{code}</code></pre></div>);if(index<lines.length)index++;continue;
    }
    const display = math?.displayAt(index);
    if (math && display) {
      const literal = lines.slice(index, display.nextLine).join('\n');
      nodes.push(renderCandidate(math, 'display:' + key, {span:display.span, offset:display.span.start}, literal));
      index = display.nextLine;
      continue;
    }
    const title=heading(lines[index]!);
    if(title){
      const Heading=`h${title[1]!.length}` as 'h1'|'h2'|'h3'|'h4'|'h5'|'h6';
      const label = title[2]!;
      const locations = math ? [{start:0, offset:math.lineStarts[index]! + lines[index]!.length - label.length}] : [];
      const content = inlineAt(label, math, 'heading:' + key, locations);
      nodes.push(headings?<Heading key={key} data-outline-key={key} tabIndex={-1}>{content}</Heading>:<Heading key={key}>{content}</Heading>);
      headings?.push({key,level:title[1]!.length,label:inlineLabel(label)});
      index++;
      continue;
    }
    const table=tableStart(lines,index,math);
    if(table){
      const start=index,rows:TableCell[][]=[];let rowCount=0,oversized=table.oversized||tableCells+table.header.length>MAX_TABLE_CELLS;index+=2;
      while(index<lines.length&&lines[index]!.trim()){
        const row=tableRow(lines[index]!,math,index);
        if(!row.pipes||row.cells.length>table.header.length)break;
        rowCount++;
        oversized ||= rowCount>MAX_TABLE_ROWS||tableCells+(rowCount+1)*table.header.length>MAX_TABLE_CELLS;
        if(!oversized)rows.push([...row.cells,...Array<TableCell>(table.header.length-row.cells.length).fill(EMPTY_CELL)]);index++;
      }
      if(oversized){nodes.push(<p key={key} className="markdown-table-fallback">{lines.slice(start,index).join('\n')}</p>);continue;}
      tableCells+=(rowCount+1)*table.header.length;
      const align=table.align.map((value,column)=>value??(
        rows.some(row=>row[column]!.text) && rows.every(row=>!row[column]!.text || numeric(row[column]!.text)) ? 'right' : undefined
      ));
      const cellContent = (cell: TableCell, row: string, column: number) =>
        inlineAt(cell.text, math, `table:${key}:${row}:${column}`, [], cell.spans);
      nodes.push(<div key={key} className="markdown-table-scroll" role="region" aria-label="Table" tabIndex={0}>
        <table className="markdown-table">
          <thead><tr>{table.header.map((cell,column)=><th key={column} scope="col" style={{textAlign:align[column]}}>{cellContent(cell,'head',column)}</th>)}</tr></thead>
          <tbody>{rows.map((row,item)=><tr key={item}>{row.map((cell,column)=><td key={column} style={{textAlign:align[column]}}>{cellContent(cell,String(item),column)}</td>)}</tr>)}</tbody>
        </table>
      </div>);
      continue;
    }
    const first=marker(lines[index]!);
    if(first&&first.indent<4){const rendered=list(lines,index,key,0,math);nodes.push(rendered.node);index=rendered.next;continue;}
    const start = index;
    const paragraph=[lines[index++]!];
    while(index<lines.length&&lines[index]!.trim()&&!fence(lines[index]!)&&!heading(lines[index]!)&&!math?.displayAt(index)&&!tableStart(lines,index,math)&&!startsList(lines[index]!))paragraph.push(lines[index++]!);
    let position = 0;
    const locations = math ? paragraph.map((line, part) => {
      const current = {start:position, offset:math.lineStarts[start + part]!};
      position += line.length + 1;
      return current;
    }) : [];
    nodes.push(<p key={key}>{inlineAt(paragraph.join('\n'),math,'paragraph:' + key,locations)}</p>);
  }
  if (math) {
    const budget = {expressions:64, sourceUnits:32768};
    // Nested-list children can be constructed before their parent's inline
    // nodes. Order admission by original position, independent of construction.
    math.candidates.sort((left, right) => left.offset - right.offset);
    for (const candidate of math.candidates) candidate.admitted = admitMath(candidate.span, budget);
  }
  return nodes;
}

interface MarkdownProps {
  text: string;
  animate?: boolean;
  initialReveal?: boolean;
  math?: boolean;
  renderOwner?: string;
}

function useMarkdownMath(text: string, math: boolean, renderOwner?: string) {
  const id = useId();
  const ownerKey = renderOwner === undefined ? id : id + ':' + renderOwner;
  const enabled = mathScanAllowed(text, math);
  const [source, setSource] = useState({text:enabled ? text : null, revision:0});
  // Derive revision during render so children and the queue receive the same
  // committed identity even when React batches or abandons an update.
  if (enabled && source.text !== text) setSource({text, revision:source.revision + 1});
  const sourceRevision = source.revision;
  const owner = useMathRenderOwner(ownerKey, sourceRevision, enabled);
  return useMemo(() => enabled ? {owner, ownerKey, sourceRevision} : undefined, [enabled, owner, ownerKey, sourceRevision]);
}

export const Markdown = memo(function Markdown({text, animate=false, initialReveal=false, math=false, renderOwner}: MarkdownProps) {
  const mathOwner = useMarkdownMath(text, math, renderOwner);
  const rendered = useMemo(() => blocks(text, undefined, mathOwner), [text, mathOwner]);
  return <SentenceReveal className="markdown" text={text} animate={animate} initialReveal={initialReveal}>{rendered}</SentenceReveal>;
});

/** Main-reply adapter: shares one memoized block walk between the prose and an
 * opt-in outline composed outside the prose root. Equal labels gain a
 * positional suffix in source order. */
export const ReplyMarkdown = memo(function ReplyMarkdown({text, animate=false, initialReveal=false, math=false, renderOwner, renderOutline}: MarkdownProps & {renderOutline?:(headings:ReplyHeading[])=>ReactNode}) {
  const mathOwner = useMarkdownMath(text, math, renderOwner);
  const parsed = useMemo(() => {
    const headings:ReplyHeading[]=[];
    const nodes=blocks(text,renderOutline?headings:undefined,mathOwner);
    if(renderOutline){
      const counts=new Map<string,number>(),seen=new Map<string,number>();
      for(const heading of headings)counts.set(heading.label,(counts.get(heading.label)??0)+1);
      for(const heading of headings){
        const total=counts.get(heading.label)!;
        if(total>1){const order=(seen.get(heading.label)??0)+1;seen.set(heading.label,order);heading.label=`${heading.label} (${order} of ${total})`;}
      }
    }
    return {nodes,headings};
  }, [text,renderOutline,mathOwner]);
  return <>{renderOutline?.(parsed.headings)}<SentenceReveal className="markdown" text={text} animate={animate} initialReveal={initialReveal}>{parsed.nodes}</SentenceReveal></>;
});
