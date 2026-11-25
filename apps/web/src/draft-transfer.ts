import type {Snapshot} from '../../../packages/contracts';
import type {DraftTransferReferences} from '../../../packages/contracts/shell-read-models';
import {journalCompareAndSwap,journalCompareAndSwapMany,journalEntries,journalReadRecord,type JournalRecord} from './journal';
import {hasPendingDocumentAssets} from './signature-assets';
import {readPastedTexts} from './pasted-text';
import {logicalOwnerV1Schema,type LogicalOwnerV1} from '../../../packages/contracts/source-selection';
import {parseSourceDraftMetadata,sourceDraftKey} from './workbench-recovery';
export const DRAFT_TRANSFER_LIMIT=2*1024*1024;
export type DraftReferenceSource = (keys: string[]) => Promise<DraftTransferReferences>;
type ReferenceInput = (Omit<DraftTransferReferences, 'skills'> & {skills?: DraftTransferReferences['skills']}) | DraftReferenceSource;
export function snapshotDraftReferences(snapshot: Pick<Snapshot, 'threads' | 'skills' | 'userStates' | 'requests'>): DraftTransferReferences {
 return {threads: snapshot.threads.map(({id}) => ({id})), skills: (snapshot.skills ?? []).map(({name, revision}) => ({name, revision})), userStates: snapshot.userStates.map(({id, revision}) => ({id, revision})), requests: snapshot.requests.map(({id, revision, presentation, responseSchema}) => ({id, revision, presentation: Boolean(presentation), responseSchema}))};
}
const transferableKey = (key: string) => key.length <= 2048 && /^(draft|draft-pastes|thinking|skill-draft|state|request|source-context):.+/.test(key);
const sourceKey = (key: string) => key.startsWith('source-context:');
function sourceOwner(key: string): LogicalOwnerV1 {
 const parts=key.slice('source-context:'.length).split(':').map(decodeURIComponent);
 if(!sourceKey(key)||parts.length!==3)throw Error('Invalid source context owner key.');
 const owner=logicalOwnerV1Schema.parse({threadId:parts[0],projectId:parts[1]||null,workspaceId:parts[2]||null});
 if(sourceDraftKey(owner)!==key)throw Error('Source context owner key is not canonical.');
 return owner;
}
// Even a malformed companion must prevent its prompt from being imported alone.
function sourceThread(key:string):string|undefined {
 try{return logicalOwnerV1Schema.parse({threadId:decodeURIComponent(key.slice('source-context:'.length).split(':')[0]),projectId:null,workspaceId:null}).threadId;}catch{return undefined;}
}
async function references(input: ReferenceInput, keys: string[], signal?: AbortSignal): Promise<DraftTransferReferences> {
 signal?.throwIfAborted();
 if (typeof input !== 'function') return {threads: input.threads, skills: input.skills ?? [], userStates: input.userStates, requests: input.requests};
 const all: DraftTransferReferences = {threads: [], skills: [], userStates: [], requests: []};
 const selected = [...new Set(keys.filter(transferableKey))];
 // Even zero draft keys need the complete visible-thread list for signature checks.
 for (let offset = 0; offset < Math.max(1, selected.length); offset += 500) {
  const page = await input(selected.slice(offset, offset + 500)); signal?.throwIfAborted();
  all.threads.push(...page.threads); all.skills.push(...page.skills); all.userStates.push(...page.userStates); all.requests.push(...page.requests);
 }
 return all;
}
const record=(value:unknown):value is Record<string,unknown>=>Boolean(value&&typeof value==='object'&&!Array.isArray(value));
function bounded(value:unknown,depth=0,budget={nodes:0}):boolean{if(depth>20||++budget.nodes>50000)return false;if(value===null||typeof value==='boolean'||typeof value==='number'&&Number.isFinite(value))return true;if(typeof value==='string')return value.length<=100000;if(Array.isArray(value))return value.length<=2000&&value.every(item=>bounded(item,depth+1,budget));if(!record(value))return false;const keys=Object.keys(value);return keys.length<=2000&&keys.every(key=>key.length<=512&&!['__proto__','prototype','constructor'].includes(key)&&bounded(value[key],depth+1,budget));}
function referenceError(key:string,value:unknown,snapshot:DraftTransferReferences,importing:boolean):string|undefined{
 if(sourceKey(key)){
  try{const owner=sourceOwner(key);parseSourceDraftMetadata(value,owner);return snapshot.threads.some(thread=>thread.id===owner.threadId)?undefined:'Source conversation is unavailable';}
  catch{return 'Invalid source context or mismatched conversation, project or working copy';}
 }
 if(key.startsWith('skill-draft:')){const skill=snapshot.skills?.find(skill=>key===`skill-draft:${skill.name}`);if(!skill)return 'Skill is unavailable';if(!record(value)||typeof value.content!=='string'||typeof value.description!=='string'||value.description.length>1024||!Number.isSafeInteger(value.baseRevision)||Number(value.baseRevision)<1)return 'Invalid skill draft';return importing&&value.baseRevision!==skill.revision?'Skill revision changed; resolve this draft manually':undefined;}
 if(key.startsWith('draft:')||key.startsWith('thinking:')){const id=key.slice(key.indexOf(':')+1);if(id!=='new'&&!snapshot.threads.some(thread=>thread.id===id))return 'Conversation is unavailable';return typeof value==='string'&&value.length<=100000?undefined:'Invalid draft text';}
 if(key.startsWith('draft-pastes:')){const id=key.slice('draft-pastes:'.length);if(id!=='new'&&!snapshot.threads.some(thread=>thread.id===id))return 'Conversation is unavailable';try{readPastedTexts(value);return undefined;}catch{return 'Invalid pasted text draft';}}
 if(key.startsWith('state:')){const state=snapshot.userStates.find(state=>state.id===key.slice(6));if(!state)return 'Artifact state is unavailable';if(!record(value)||!record(value.values)||!Number.isSafeInteger(value.baseRevision)||Number(value.baseRevision)<0)return 'Invalid artifact draft';return importing&&value.baseRevision!==state.revision?'Artifact revision changed; resolve this draft manually':undefined;}
 if(key.startsWith('request:')){const request=snapshot.requests.find(request=>key===`request:${request.id}:${request.presentation?'planning':request.revision}`);if(!request)return 'Decision is unavailable or changed';return record(value)&&value.schema===JSON.stringify(request.responseSchema)&&Object.hasOwn(value,'response')?undefined:'Decision schema changed';}
 return 'Not a transferable draft';
}
export async function exportDraftTransfer(input:ReferenceInput,signal?:AbortSignal){
 signal?.throwIfAborted();
 const rows=await journalEntries(),candidates=rows.filter(({key,record})=>transferableKey(key)&&record.value!==null&&bounded(record.value));
 const snapshot=await references(input,candidates.map(row=>row.key),signal);
 signal?.throwIfAborted();
 if(snapshot.threads.some(thread=>hasPendingDocumentAssets(thread.id)))throw Error('Save or clear the pending signature mark before exporting drafts. The original mark stays in this browser.');
 const entries=candidates.filter(({key,record})=>!sourceKey(key)&&!referenceError(key,record.value,snapshot,false));
 for(const row of rows.filter(row=>sourceKey(row.key))){
  const threadId=sourceThread(row.key);
  if(threadId&&!snapshot.threads.some(thread=>thread.id===threadId))continue;
  if(!transferableKey(row.key)||!bounded(row.record.value)||referenceError(row.key,row.record.value,snapshot,false))throw Error('Source context could not be read. The original draft was retained; repair its source context before exporting.');
  const key='draft:'+sourceOwner(row.key).threadId,active=rows.find(row=>row.key===key);
  if(active&&(!bounded(active.record.value)||referenceError(key,active.record.value,snapshot,false)))throw Error('The text paired with source context could not be read. The original draft was retained.');
  // Source-only drafts still need a text record so import cannot join them to a
  // different local prompt. This empty snapshot does not write the local journal.
  if(!entries.some(row=>row.key===key))entries.push(active??{key,record:{...row.record,value:''}});
  entries.push(row);
 }
 if(entries.length>500)throw Error('Draft backup exceeds 500 entries. Save or clear some drafts before exporting.');
 // Older importers must reject source bundles as a whole, rather than import
 // their text while silently omitting an unknown companion record.
 const text=JSON.stringify({app:'generative-harness-drafts',version:entries.some(row=>sourceKey(row.key))?2:1,exportedAt:new Date().toISOString(),entries});
 if(new TextEncoder().encode(text).length>DRAFT_TRANSFER_LIMIT)throw Error('Draft backup exceeds 2 MiB. Save or clear some drafts before exporting.');
 return text;
}

type TransferRow={key:string;record:JournalRecord};
type TransferResult={key:string;status:'imported'|'retained'|'blocked';reason?:string};
export async function importDraftTransfer(text:string,input:ReferenceInput,signal?:AbortSignal){
 signal?.throwIfAborted();
 if(new TextEncoder().encode(text).length>DRAFT_TRANSFER_LIMIT)throw Error('Choose a draft backup no larger than 2 MiB.');
 const value:unknown=JSON.parse(text);
 if(!record(value)||value.app!=='generative-harness-drafts'||value.version!==1&&value.version!==2||!Array.isArray(value.entries)||value.entries.length>500)throw Error('This is not a supported harness draft backup.');
 const seen=new Set<string>();
 for(const row of value.entries){if(!record(row)||typeof row.key!=='string'||row.key.length>2048||seen.has(row.key)||!record(row.record)||typeof row.record.generation!=='string'||row.record.generation.length>128||!Number.isFinite(row.record.updatedAt)||!Object.hasOwn(row.record,'value')||!bounded(row.record.value))throw Error('The backup contains an invalid or duplicate draft.');seen.add(row.key);}
 const snapshot=await references(input,[...seen],signal),rows=value.entries as TransferRow[],results=new Map<string,TransferResult>();
 const localSources=(await journalEntries()).filter(row=>sourceKey(row.key));
 const finish=(group:TransferRow[],status:TransferResult['status'],reason?:string)=>{for(const row of group)results.set(row.key,{key:row.key,status,...(reason?{reason}:{})});};
 const promptKeys=(threadId:string)=>['draft:'+threadId,'draft-pastes:'+threadId];
 const missingCompanions=(threadId:string,group:TransferRow[])=>promptKeys(threadId).filter(key=>!group.some(row=>row.key===key)).map(key=>({key,generation:undefined}));
 const groups=new Map<string,TransferRow[]>();
 for(const row of rows.filter(row=>sourceKey(row.key))){
  const threadId=sourceThread(row.key);
  if(!threadId){finish([row,...rows.filter(row=>/^draft(?:-pastes)?:/.test(row.key))],'blocked','Source context has an invalid owner; its prompt was not imported');continue;}
  const group=groups.get(threadId)??[];group.push(row);groups.set(threadId,group);
 }
 for(const [threadId,companions]of groups){
  signal?.throwIfAborted();
  const active=rows.find(row=>row.key==='draft:'+threadId),group=[...rows.filter(row=>promptKeys(threadId).includes(row.key)),...companions];
  if(group.some(row=>results.has(row.key))){finish(group,'blocked','A source context owner could not be validated');continue;}
  const error=!active?'Source context must be paired with its prompt in the backup':group.map(row=>referenceError(row.key,row.record.value,snapshot,true)).find(Boolean);
  if(error){finish(group,'blocked',error);continue;}
  const checks=missingCompanions(threadId,group);
  const existing=await Promise.all([...group,...checks].map(row=>journalReadRecord(row.key)));
  signal?.throwIfAborted();
  if(existing.some(Boolean)||localSources.some(row=>sourceThread(row.key)===threadId)){finish(group,'retained','A local prompt, pasted text or source context already exists; the draft was retained');continue;}
  // A failed generation or write leaves text, pasted text and every full-owner companion
  // untouched. Source identities remain inert until the host validates them.
  const saved=await journalCompareAndSwapMany(group.map(row=>({key:row.key,generation:undefined,value:row.record.value})),checks,{acknowledgeHandoffRetry:true});
  finish(group,saved?'imported':'retained',saved?undefined:'A local edit arrived during import');
 }
 // A prompt's text and pasted-text chips are one draft: import or retain them
 // together so a local draft never mixes with chips from the backup.
 const promptGroups=new Map<string,TransferRow[]>();
 for(const row of rows){
  const match=/^draft(?:-pastes)?:(.+)$/.exec(row.key);
  if(!match)continue;
  const list=promptGroups.get(match[1])??[];list.push(row);promptGroups.set(match[1],list);
 }
 for(const row of rows){
  signal?.throwIfAborted();if(results.has(row.key))continue;
  const match=/^draft(?:-pastes)?:(.+)$/.exec(row.key);
  const group=match?(promptGroups.get(match[1])??[row]):[row];
  const error=group.map(member=>referenceError(member.key,member.record.value,snapshot,true)).find(Boolean);
  if(error){finish(group,'blocked',error);continue;}
  if(match&&localSources.some(source=>sourceThread(source.key)===match[1])){finish(group,'retained','Local source context already exists; its prompt was not replaced');continue;}
  const checks=match?missingCompanions(match[1],group):[];
  const existing=await Promise.all([...group,...checks].map(member=>journalReadRecord(member.key)));signal?.throwIfAborted();
  if(existing.some(Boolean)){finish(group,'retained','A local entry already exists; it was not replaced');continue;}
  const saved=match?await journalCompareAndSwapMany(group.map(member=>({key:member.key,generation:undefined,value:member.record.value})),checks):await journalCompareAndSwap(row.key,undefined,row.record.value);
  finish(group,saved?'imported':'retained',saved?undefined:'A local edit arrived during import');
 }
 return rows.map(row=>results.get(row.key)!);
}
