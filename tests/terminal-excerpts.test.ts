import {describe,it,expect} from 'vitest';
import {captureTerminalExcerpt,editTerminalExcerpt,readTerminalExcerpts,serializeTerminalExcerpts,TERMINAL_EXCERPT_MAX_BYTES} from '../apps/web/src/terminal-excerpts';
import {throttleLatest} from '../apps/web/src/coalesced-updates';
const owner={terminalId:'terminal',projectId:'p',threadId:'t'};
describe('terminal excerpts v1 frozen schema',()=>{
 it('bounds UTF-8 without splitting a scalar and freezes original text and provenance',()=>{
  const excerpt=captureTerminalExcerpt({...owner,selection:'😀'.repeat(10000)});
  expect(excerpt.version).toBe(1);expect(excerpt.originalBytes).toBe(40000);expect(excerpt.truncated).toBe(true);expect(new TextEncoder().encode(excerpt.text).length).toBeLessThanOrEqual(TERMINAL_EXCERPT_MAX_BYTES);expect(excerpt.text).not.toContain('\uFFFD');
  const edited=editTerminalExcerpt(excerpt,'Reviewed text');expect(edited.originalText).toBe(excerpt.originalText);expect(edited).toMatchObject({...owner,text:'Reviewed text'});
 });
 it('serializes reviewed text once as ordinary prompt text, never the original after editing',()=>{
  const excerpt=editTerminalExcerpt(captureTerminalExcerpt({...owner,selection:'private-original'}),'reviewed');
  const text=serializeTerminalExcerpts('Question',[excerpt]);expect(text).toContain('Question');expect(text).toContain('reviewed');expect(text).toContain('Terminal excerpt');expect(text).not.toContain('private-original');
 });
 it('rejects empty, wrong-owner, oversized and unknown persisted payloads',()=>{
  expect(()=>captureTerminalExcerpt({...owner,selection:''})).toThrow();const e=captureTerminalExcerpt({...owner,selection:'output'});
  expect(()=>readTerminalExcerpts([e],{projectId:'other',threadId:'t'})).toThrow();expect(()=>readTerminalExcerpts([{...e,version:2}],owner)).toThrow();expect(()=>readTerminalExcerpts([{...e,token:'secret'}],owner)).toThrow();expect(()=>editTerminalExcerpt(e,'a'.repeat(TERMINAL_EXCERPT_MAX_BYTES+1))).toThrow();
 });
});

it('caps count and the final transport payload without silently dropping reviewed text',()=>{
 const e=captureTerminalExcerpt({...owner,selection:'bounded'});expect(()=>readTerminalExcerpts(Array.from({length:5},()=>({...e,id:crypto.randomUUID()})))).toThrow();
 expect(()=>serializeTerminalExcerpts('a'.repeat(65536),[e])).toThrow(/message limit/);
});


it('accepts exactly 16 KB and truncates the next UTF-8 scalar without splitting it',()=>{
 expect(captureTerminalExcerpt({...owner,selection:'a'.repeat(15999)}).truncated).toBe(false);
 const exact=captureTerminalExcerpt({...owner,selection:'a'.repeat(16000)});expect(exact.text).toHaveLength(16000);expect(exact.truncated).toBe(false);
 const over=captureTerminalExcerpt({...owner,selection:'a'.repeat(16000)+'b'});expect(over.text).toHaveLength(16000);expect(over.truncated).toBe(true);
 const unicode=captureTerminalExcerpt({...owner,selection:'😀'.repeat(4000)+'a'});expect(new TextEncoder().encode(unicode.text).length).toBe(16000);expect(unicode.text).not.toContain('\uFFFD');
 expect(()=>editTerminalExcerpt(exact,'a'.repeat(16001))).toThrow();
});

it('bounds resize command sends with a leading+trailing latest-wins throttle', () => {
  const sends: number[] = []; const timers = new Map<number, {cb: () => void; ms: number}>(); let seq = 0;
  let clock = 0;
  const schedule = (cb: () => void, ms: number) => {const id = ++seq; timers.set(id, {cb, ms}); return id as unknown as ReturnType<typeof setTimeout>;};
  const cancel = (t: ReturnType<typeof setTimeout>) => {timers.delete(t as unknown as number);};
  const throttle = throttleLatest(150, () => sends.push(clock), () => clock, schedule, cancel);
  for (let i = 0; i < 50; i++) {clock += 10; throttle.queue();} // 500ms of continuous drag
  const during = sends.length;
  for (const {cb} of [...timers.values()]) cb(); // fire the trailing timer
  expect(during).toBeLessThanOrEqual(4); // ≤1 send per 150ms window
  expect(sends.at(-1)).toBe(500); // trailing send carries the latest state
  const total = sends.length;
  throttle.queue(); clock += 200; throttle.queue(); throttle.cancel();
  expect(sends.length).toBeLessThanOrEqual(total + 1); // cancel drops the pending trailing send
});
