import {expect,it,vi} from 'vitest';

vi.mock('../apps/web/src/journal.ts',()=>({
 journalReadRecord:vi.fn(),
 journalCompareAndSwap:vi.fn(),
}));

const {journalReadRecord,journalCompareAndSwap}=await import('../apps/web/src/journal.ts');
const {VIEWED_CAPACITY,emptyViewedRecord,markViewed,mutateViewed,parseViewedRecord,reconcileViewed,unmarkViewed,viewedKey}=await import('../apps/web/src/changes-viewed-state.ts');

const fp=(tag:string)=>`v1:${tag.padEnd(64,'0')}`.slice(0,67) as string;
const members=(entries:[string,{fingerprint:string}|{unavailable:string}|undefined][])=>new Map(entries);

it('keys are scoped to owner and view with the local discriminator',()=>{
 expect(viewedKey('owner-a','staged')).toBe('changes-viewed:v1:["local","owner-a","staged"]');
 expect(viewedKey('owner-a','staged')).not.toBe(viewedKey('owner-a','unstaged'));
 expect(viewedKey('owner-a','staged')).not.toBe(viewedKey('owner-b','staged'));
});

it('parses an empty or missing record and rejects corrupt values',()=>{
 expect(parseViewedRecord(undefined)).toEqual(emptyViewedRecord());
 expect(parseViewedRecord({version:1,entries:[{path:'a.txt',fingerprint:fp('a'),changedSinceViewed:false}]})).toBeTruthy();
 expect(()=>parseViewedRecord({version:2,entries:[]})).toThrow();
 expect(()=>parseViewedRecord({version:1,entries:[{path:'../evil',fingerprint:fp('a'),changedSinceViewed:false}]})).toThrow();
});

it('reconciles match, mismatch tombstone, absence and unavailable identities',()=>{
 const record={version:1 as const,entries:[
  {path:'same.txt',fingerprint:fp('1'),changedSinceViewed:false},
  {path:'edited.txt',fingerprint:fp('2'),changedSinceViewed:false},
  {path:'reverted.txt',fingerprint:fp('3'),changedSinceViewed:true},
  {path:'gone.txt',fingerprint:fp('4'),changedSinceViewed:false},
 ]};
 const {record:next,states}=reconcileViewed(record,members([
  ['same.txt',{fingerprint:fp('1')}],
  ['edited.txt',{fingerprint:fp('9')}],
  ['reverted.txt',{fingerprint:fp('3')}],
  ['blocked.txt',{unavailable:'Conflicted'}],
  ['fresh.txt',{fingerprint:fp('5')}],
  ['gone.txt',undefined],
 ]));
 expect(states.get('same.txt')).toBe('viewed');
 expect(states.get('edited.txt')).toBe('changed');
 expect(states.get('reverted.txt')).toBe('changed');
 expect(states.get('blocked.txt')).toBe('unavailable');
 expect(states.get('fresh.txt')).toBe('unviewed');
 expect(states.get('gone.txt')).toBe('unavailable');
 expect(next.entries).toEqual([
  {path:'same.txt',fingerprint:fp('1'),changedSinceViewed:false},
  {path:'edited.txt',fingerprint:fp('9'),changedSinceViewed:true},
  {path:'reverted.txt',fingerprint:fp('3'),changedSinceViewed:true},
 ]);
});

it('a reverted fingerprint keeps the tombstone instead of reviving the old mark',()=>{
 const record={version:1 as const,entries:[{path:'a.txt',fingerprint:fp('new'),changedSinceViewed:true}]};
 const {states}=reconcileViewed(record,members([['a.txt',{fingerprint:fp('old')}]]));
 expect(states.get('a.txt')).toBe('changed');
});

it('mark replaces the entry, unmark removes it, capacity is enforced',()=>{
 const record={version:1 as const,entries:[{path:'a.txt',fingerprint:fp('1'),changedSinceViewed:true}]};
 expect(markViewed(record,'a.txt',fp('2')).entries).toEqual([{path:'a.txt',fingerprint:fp('2'),changedSinceViewed:false}]);
 expect(unmarkViewed(record,'a.txt').entries).toEqual([]);
 const full={version:1 as const,entries:Array.from({length:VIEWED_CAPACITY},(_,index)=>({path:'f'+index,fingerprint:fp('x'),changedSinceViewed:false}))};
 expect(()=>markViewed(full,'overflow',fp('y'))).toThrow(/full/i);
});

it('mutateViewed retries CAS conflicts and stops after three attempts',async()=>{
 vi.mocked(journalReadRecord).mockResolvedValue({value:{version:1,entries:[]},updatedAt:1,generation:'g'} as never);
 vi.mocked(journalCompareAndSwap).mockResolvedValue(false as never);
 await expect(mutateViewed('key',record=>markViewed(record,'a.txt',fp('1')))).resolves.toBe(false);
 expect(vi.mocked(journalCompareAndSwap)).toHaveBeenCalledTimes(3);
});

it('mutateViewed commits the merged record once CAS succeeds',async()=>{
 vi.mocked(journalReadRecord).mockResolvedValue({value:{version:1,entries:[{path:'b.txt',fingerprint:fp('b'),changedSinceViewed:false}]},updatedAt:1,generation:'g'} as never);
 vi.mocked(journalCompareAndSwap).mockResolvedValue(true as never);
 vi.mocked(journalCompareAndSwap).mockResolvedValueOnce(false as never);
 await expect(mutateViewed('key',record=>markViewed(record,'a.txt',fp('a')))).resolves.toBe(true);
 expect(vi.mocked(journalCompareAndSwap).mock.calls.at(-1)?.[2]).toEqual({version:1,entries:[{path:'b.txt',fingerprint:fp('b'),changedSinceViewed:false},{path:'a.txt',fingerprint:fp('a'),changedSinceViewed:false}]});
});
