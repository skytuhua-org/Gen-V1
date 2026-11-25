import {describe,expect,it} from 'vitest';
import {captureTerminalOutput,terminalOutputFilename,TerminalOutputBufferUnavailable,TerminalOutputTooLarge,TERMINAL_OUTPUT_MAX_BYTES,type TerminalSaveOutcome,saveTerminalOutput} from '../apps/web/src/terminal-output-export';

function fakeBuffer(rows:{text:string;wrapped?:boolean}[],cursorY=0){
 const normal={
  type:'normal' as const,length:rows.length,baseY:0,cursorY,
  getLine:(index:number)=>{const row=rows[index];return row===undefined?undefined:{isWrapped:row.wrapped===true,translateToString:(trim?:boolean)=>trim?row.text.replace(/ +$/,''):row.text};},
 };
 return {buffer:{normal,active:normal}};
}

describe('terminalOutputFilename',()=>{
 it('builds a deterministic UTC name',()=>{
  expect(terminalOutputFilename(new Date('2026-11-23T01:02:03.456Z'))).toBe('terminal-output-20261123-010203Z.txt');
 });
 it('rejects an invalid date',()=>{expect(()=>terminalOutputFilename(new Date(Number.NaN))).toThrow();});
});

describe('captureTerminalOutput',()=>{
 it('joins physical rows with LF and keeps blank rows',()=>{
  const snapshot=captureTerminalOutput(fakeBuffer([{text:'one'},{text:''},{text:'three'}]));
  expect(snapshot.text).toBe('one\n\nthree');expect(snapshot.rows).toBe(3);expect(snapshot.lines).toBe(3);
 });
 it('concatenates wrapped rows without a line feed',()=>{
  const snapshot=captureTerminalOutput(fakeBuffer([{text:'long ',wrapped:false},{text:'tail',wrapped:true},{text:'next'}]));
  expect(snapshot.text).toBe('long tail\nnext');expect(snapshot.rows).toBe(3);expect(snapshot.lines).toBe(2);
 });
 it('preserves a trailing line feed when the cursor sits on an empty row',()=>{
  const snapshot=captureTerminalOutput(fakeBuffer([{text:'done'},{text:''}],1));
  expect(snapshot.text).toBe('done\n');
 });
 it('serializes an empty buffer to an empty string',()=>{
  const snapshot=captureTerminalOutput(fakeBuffer([{text:''}]));
  expect(snapshot.text).toBe('');expect(snapshot.bytes).toBe(0);
 });
 it('excludes unused blank rows below the last text row',()=>{
  const snapshot=captureTerminalOutput(fakeBuffer([{text:'a'},{text:''},{text:''}],1));
  expect(snapshot.text).toBe('a\n');expect(snapshot.rows).toBe(2);
 });
 it('rejects an alternate active buffer',()=>{
  const fake=fakeBuffer([{text:'x'}]);
  (fake.buffer as {active:{type:string}}).active={type:'alternate'};
  expect(()=>captureTerminalOutput(fake as never)).toThrow(TerminalOutputBufferUnavailable);
 });
 it('refuses output above the byte cap',()=>{
  const rows=Array.from({length:10},()=>({text:'x'.repeat(TERMINAL_OUTPUT_MAX_BYTES)}));
  expect(()=>captureTerminalOutput(fakeBuffer(rows))).toThrow(TerminalOutputTooLarge);
 });
 it('keeps unicode and computes UTF-8 bytes',()=>{
  const snapshot=captureTerminalOutput(fakeBuffer([{text:' 🌍'}]));
  expect(snapshot.bytes).toBe(new TextEncoder().encode(' 🌍').length);
 });
});

describe('saveTerminalOutput',()=>{
 it('returns cancelled when the native chooser cancels',async()=>{
  const outcome:TerminalSaveOutcome=await saveTerminalOutput({text:'x',bytes:1,capturedAt:'',rows:1,lines:1,filename:'terminal-output-20261123-000000Z.txt'},{saveTerminalOutput:async()=>({status:'cancelled'})});
  expect(outcome).toBe('cancelled');
 });
 it('reports saved only on a saved receipt',async()=>{
  await expect(saveTerminalOutput({text:'x',bytes:1,capturedAt:'',rows:1,lines:1,filename:'f'},{saveTerminalOutput:async()=>({status:'saved'})})).resolves.toBe('saved');
 });
 it('fails when the desktop bridge lacks the channel instead of falling back',async()=>{
  await expect(saveTerminalOutput({text:'x',bytes:1,capturedAt:'',rows:1,lines:1,filename:'f'},{})).rejects.toThrow('cannot save terminal output');
 });
});
