import {describe,it,expect,vi} from 'vitest';
import {canLoadConversationHistory, coalescedTranscriptScan, conversationRanges, findTextOffsets, nextFindIndex, retainFindIndex} from '../apps/web/src/conversation-find';
describe('conversation find',()=>{
 it('finds literal phrases without interpreting regex or losing Unicode offsets',()=>{
  expect(findTextOffsets('😀 WorkSPACE workspace [a]. [a].','workspace')).toEqual([{start:3,end:12},{start:13,end:22}]);
  expect(findTextOffsets('a+b aab a+b','a+b')).toEqual([{start:0,end:3},{start:8,end:11}]);
  expect(findTextOffsets('İ test TEST','test')).toEqual([{start:2,end:6},{start:7,end:11}]);
  expect(findTextOffsets('anything','')).toEqual([]);
 });
 it('wraps in both directions and handles no results',()=>{
  expect(nextFindIndex(2,1,3)).toBe(0);expect(nextFindIndex(0,-1,3)).toBe(2);expect(nextFindIndex(0,1,0)).toBe(-1);
 });
 it('retains the active message offset through prepend and background arrivals',()=>{
  expect(retainFindIndex(['older:0','m:4','later:0'],'m:4')).toBe(1);
  expect(retainFindIndex(['new:0'],'removed:0')).toBe(0);expect(retainFindIndex([],null)).toBe(-1);
 });
});

it('maps non-overlapping matches across inline nodes without rescanning each prefix',()=>{
 const chunks=Array.from({length:100},()=>['x ','pr',' review ']).flat();
 let lengthReads=0;
 const nodes=chunks.map(textContent=>({textContent,get length(){lengthReads++;return textContent.length;}}));
 const ranges:{setStart:ReturnType<typeof vi.fn>;setEnd:ReturnType<typeof vi.fn>}[]=[];
 const walker={currentNode:null as unknown,nextNode(){this.currentNode=nodes.shift()??null;return this.currentNode;}};
 const originals=[...nodes];
 const block={dataset:{conversationText:'artifact:a'},closest:()=>({dataset:{messageId:'message-a'}})};
 const root={querySelectorAll:()=>[block],ownerDocument:{
  createTreeWalker:()=>walker,
  createRange:()=>{const range={setStart:vi.fn(),setEnd:vi.fn()};ranges.push(range);return range;},
 }};
 vi.stubGlobal('NodeFilter',{SHOW_TEXT:4});
 try{
  const matches=conversationRanges(root as unknown as HTMLElement,'pr review');
  expect(matches).toHaveLength(100);
  expect(matches[0]?.key).toBe('artifact:a:2');
  expect(ranges[0]?.setStart).toHaveBeenCalledExactlyOnceWith(originals[1],0);
  expect(ranges[0]?.setEnd).toHaveBeenCalledExactlyOnceWith(originals[2],7);
  expect(ranges.at(-1)?.setStart).toHaveBeenCalledExactlyOnceWith(originals[298],0);
  expect(ranges.at(-1)?.setEnd).toHaveBeenCalledExactlyOnceWith(originals[299],7);
  expect(lengthReads).toBeLessThanOrEqual(chunks.length*2);
 }finally{vi.unstubAllGlobals();}
});
it('offers older history at the end of the local window when the server still has rows',()=>{
 expect(canLoadConversationHistory(25,0,0)).toBe(true);
 expect(canLoadConversationHistory(0,120,100)).toBe(true);
 expect(canLoadConversationHistory(0,120,120)).toBe(false);
 expect(canLoadConversationHistory(0,0,0)).toBe(false);
});

it('coalesces transcript mutations into bounded scans with a trailing run', () => {
  const observers: ((records: unknown[]) => void)[] = [];
  vi.stubGlobal('MutationObserver', class {
    constructor(cb: (records: unknown[]) => void) { observers.push(cb); }
    observe() {} disconnect() {}
  });
  const rafQueue: FrameRequestCallback[] = []; const cancelled: number[] = [];
  const root = {ownerDocument: {defaultView: {
    requestAnimationFrame: (cb: FrameRequestCallback) => {rafQueue.push(cb); return rafQueue.length;},
    cancelAnimationFrame: (id: number) => {cancelled.push(id);},
  }}} as unknown as HTMLElement;
  let scans = 0; let active = true;
  const stop = coalescedTranscriptScan(root, () => active, () => {scans++;});
  // One observer per open find owner; bursts across separate tasks coalesce.
  for (let i = 0; i < 25; i++) observers[0]!([]);
  observers[0]!([]); observers[0]!([]);
  expect(scans).toBe(0);
  rafQueue.splice(0).forEach(cb => cb(0));
  expect(scans).toBe(1); // trailing run covers every queued mutation
  active = false; observers[0]!([]); // empty/inactive query schedules nothing
  stop(); expect(cancelled.length).toBeLessThanOrEqual(1);
});
