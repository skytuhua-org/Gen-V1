import {z} from 'zod';
import {journalReadRecord,journalCompareAndSwap} from './journal.ts';

export type FileReviewIdentity={fingerprint:string}|{unavailable:string};
export type ViewedRowState='viewed'|'changed'|'unviewed'|'unavailable';
export type ViewedView='staged'|'unstaged';
export const VIEWED_CAPACITY=1000;

const pathRule=z.string().min(1).max(1024).refine(value=>!value.includes('\0')&&!value.includes(':')&&!/^[\\/]|(?:^|[\\/])\.\.(?:[\\/]|$)/.test(value),'invalid path');
const entrySchema=z.strictObject({path:pathRule,fingerprint:z.string().regex(/^v1:[0-9a-f]{64}$/),changedSinceViewed:z.boolean()});
export const viewedRecordSchema=z.strictObject({version:z.literal(1),entries:z.array(entrySchema).max(VIEWED_CAPACITY)});
export type ViewedRecord=z.infer<typeof viewedRecordSchema>;
export const emptyViewedRecord=():ViewedRecord=>({version:1,entries:[]});

/** The journal is profile- and origin-local already; the discriminator records that decision. */
export const viewedKey=(owner:string,view:ViewedView)=>'changes-viewed:v1:'+JSON.stringify(['local',owner,view]);
export function parseViewedRecord(raw:unknown):ViewedRecord{return raw===undefined?emptyViewedRecord():viewedRecordSchema.parse(raw);}

/** Reconcile one side's complete snapshot against stored marks: match stays viewed,
 * a fingerprint change becomes a reopen tombstone, absent/unavailable entries drop. */
export function reconcileViewed(record:ViewedRecord,members:ReadonlyMap<string,FileReviewIdentity|undefined>):{record:ViewedRecord;states:Map<string,ViewedRowState>}{
 const states=new Map<string,ViewedRowState>(),saved=new Map(record.entries.map(entry=>[entry.path,entry])),entries:ViewedRecord['entries']=[];
 for(const [path,identity]of members){
  const mark=saved.get(path);
  if(!identity||'unavailable'in identity){states.set(path,'unavailable');continue;}
  if(!mark){states.set(path,'unviewed');continue;}
  if(mark.fingerprint===identity.fingerprint&&!mark.changedSinceViewed){entries.push(mark);states.set(path,'viewed');continue;}
  entries.push({path,fingerprint:identity.fingerprint,changedSinceViewed:true});states.set(path,'changed');
 }
 return{record:{version:1,entries},states};
}

export function markViewed(record:ViewedRecord,path:string,fingerprint:string):ViewedRecord{
 const entries=record.entries.filter(entry=>entry.path!==path);
 entries.push({path,fingerprint,changedSinceViewed:false});
 if(entries.length>VIEWED_CAPACITY)throw new Error('The viewed checklist is full. Clear viewed marks and try again.');
 return{version:1,entries};
}
export function unmarkViewed(record:ViewedRecord,path:string):ViewedRecord{return{version:1,entries:record.entries.filter(entry=>entry.path!==path)};}

/** Merge-and-commit one mutation through the durable CAS, bounded to three attempts. */
export async function mutateViewed(key:string,mutate:(record:ViewedRecord)=>ViewedRecord):Promise<boolean>{
 for(let attempt=0;attempt<3;attempt++){
  const record=await journalReadRecord(key),current=parseViewedRecord(record?.value);
  if(await journalCompareAndSwap(key,record?.generation,mutate(current)))return true;
 }
 return false;
}
