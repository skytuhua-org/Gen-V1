import {describe,it,expect} from 'vitest';
import {pastedTextSchema,readPastedTexts,normalizePaste,countLines,shouldCollapse,firstLine,serializeComposerPrompt,PASTED_TEXT_MAX_COUNT,PASTED_TEXT_MAX_BYTES,PASTE_COLLAPSE_CHARS,type PastedText} from '../apps/web/src/pasted-text';
import {serializeTerminalExcerpts,type TerminalExcerpt} from '../apps/web/src/terminal-excerpts';

const paste=(text:string):PastedText=>({version:1,id:crypto.randomUUID(),createdAt:new Date().toISOString(),text});
const lines=(n:number)=>Array.from({length:n},(_,i)=>`line ${i+1}`).join('\n');
const excerpt:TerminalExcerpt={version:1,id:crypto.randomUUID(),terminalId:'t',projectId:'p',threadId:'th',capturedAt:'2026-01-01T00:00:00.000Z',originalText:'out',text:'out',truncated:false,originalBytes:3};

describe('collapse thresholds',()=>{
 it('collapses over the line threshold but not at it',()=>{
  expect(shouldCollapse(lines(40),'40')).toBe(false);expect(shouldCollapse(lines(41),'40')).toBe(true);
  expect(shouldCollapse(lines(21),'20')).toBe(true);expect(shouldCollapse(lines(100),'100')).toBe(false);expect(shouldCollapse(lines(101),'100')).toBe(true);
 });
 it('collapses past the character cap on a single line',()=>{
  expect(shouldCollapse('a'.repeat(PASTE_COLLAPSE_CHARS),'40')).toBe(false);expect(shouldCollapse('a'.repeat(PASTE_COLLAPSE_CHARS+1),'40')).toBe(true);
 });
 it('never collapses when the setting is off',()=>{expect(shouldCollapse(lines(500),'off')).toBe(false);expect(shouldCollapse('a'.repeat(20000),'off')).toBe(false);});
 it('does not count one trailing newline',()=>{expect(countLines(lines(40)+'\n')).toBe(40);expect(shouldCollapse(lines(40)+'\n','40')).toBe(false);});
 it('normalizes CRLF and lone CR before counting',()=>{expect(normalizePaste('a\r\nb\rc')).toBe('a\nb\nc');expect(countLines(normalizePaste('a\r\nb\rc'))).toBe(3);});
});

describe('schema and reader',()=>{
 it('accepts a paste and validates version, id and text',()=>{
  const p=paste('hello');expect(pastedTextSchema.parse(p)).toEqual(p);
  expect(readPastedTexts(undefined)).toEqual([]);expect(readPastedTexts([p])).toEqual([p]);
 });
 it('rejects over-byte, empty, duplicate, unknown-key and over-count payloads',()=>{
  expect(()=>pastedTextSchema.parse(paste('a'.repeat(PASTED_TEXT_MAX_BYTES+1)))).toThrow();
  expect(()=>pastedTextSchema.parse(paste(''))).toThrow();
  const p=paste('x');expect(()=>readPastedTexts([p,p])).toThrow();
  expect(()=>pastedTextSchema.parse({...p,token:'secret'})).toThrow();
  expect(()=>readPastedTexts(Array.from({length:PASTED_TEXT_MAX_COUNT+1},()=>paste('x')))).toThrow();
 });
});

describe('firstLine tooltip text',()=>{
 it('returns the first non-empty line truncated to 80 characters',()=>{
  expect(firstLine('\n\n  hello  \nrest')).toBe('hello');
  expect(firstLine('x'.repeat(100))).toBe('x'.repeat(80)+'…');
  expect(firstLine('\n \n')).toBe('');
 });
});

describe('serializeComposerPrompt',()=>{
 it('is byte-identical to the baseline when there are no chips',()=>{
  expect(serializeComposerPrompt('Question',[ ],[excerpt])).toBe(serializeTerminalExcerpts('Question',[excerpt]));
  expect(serializeComposerPrompt('Question',[],[])).toBe(serializeTerminalExcerpts('Question',[]));
 });
 it('orders typed text, paste blocks, then excerpts and keeps pasted text untrimmed',()=>{
  const p1=paste('  padded\nsecond  '),p2=paste('single');
  const result=serializeComposerPrompt('Typed',[p1,p2],[excerpt]);
  const typed=result.indexOf('Typed'),b1=result.indexOf('Pasted text · 2 lines'),b2=result.indexOf('Pasted text · 1 line'),ex=result.indexOf('Terminal excerpt');
  expect(typed).toBeGreaterThanOrEqual(0);expect(typed).toBeLessThan(b1);expect(b1).toBeLessThan(b2);expect(b2).toBeLessThan(ex);
  expect(result).toContain('Pasted text · 2 lines\n  padded\nsecond  \nEnd pasted text');
  expect(result).toContain('Pasted text · 1 line\nsingle\nEnd pasted text');
 });
 it('throws the pasted-text limit message over 64 KiB',()=>{
  const p=paste('a'.repeat(65536));expect(()=>serializeComposerPrompt('t',[p],[])).toThrow(/Shorten or remove a pasted text/);
 });
});
