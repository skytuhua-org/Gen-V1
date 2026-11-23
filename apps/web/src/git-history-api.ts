import {z} from 'zod';
import {ApiError,authenticated,read} from './api';
import type {GitCommitComparison,GitCommitPatch,GitHistoryPage} from '../../../packages/contracts/code-review';

const get=<T,>(url:string,signal?:AbortSignal)=>authenticated(()=>fetch(url,{credentials:'same-origin',cache:'no-store',signal})).then(read<T>);

const oid=z.string().regex(/^[0-9a-f]{40}$/),hash=z.string().regex(/^[a-f0-9]{64}$/);
const pageSchema=z.object({snapshotId:hash,branch:z.string().nullable(),headOid:oid.nullable(),upstreamRef:z.string().nullable(),commits:z.array(z.object({oid,subject:z.string(),author:z.string(),authoredAt:z.string(),filesChanged:z.number().nullable(),pushState:z.enum(['unpushed','notMarked','unknown'])})),nextCursor:z.string().nullable()});
const detailSchema=z.object({comparisonId:hash,oid,parentOid:oid.nullable(),basis:z.enum(['first-parent','root']),files:z.array(z.object({path:z.string(),oldPath:z.string().optional(),status:z.string(),untracked:z.boolean(),additions:z.number().nullable(),deletions:z.number().nullable()})),filesTruncated:z.boolean()});
const patchSchema=z.object({identity:z.object({kind:z.literal('commit'),id:hash,oid,parentOid:oid.nullable(),basis:z.enum(['first-parent','root']),snapshotId:hash}),file:z.object({path:z.string(),oldPath:z.string().optional(),status:z.string(),untracked:z.boolean(),additions:z.number().nullable(),deletions:z.number().nullable()}),state:z.enum(['text','empty','untracked','binary','truncated','unavailable']),text:z.string().nullable(),reason:z.string().optional()});
const readSchema=z.object({state:z.enum(['ready','empty']),value:pageSchema});

/** Read-only committed-history adapter; the server pins and scopes every snapshot. */
export interface GitHistoryAdapter {
  page(cursor:string|undefined,signal:AbortSignal):Promise<GitHistoryPage>;
  commit(snapshotId:string,oid:string,signal:AbortSignal):Promise<GitCommitComparison>;
  file(comparisonId:string,path:string,signal:AbortSignal):Promise<GitCommitPatch>;
}
const query=(threadId:string|undefined,extra:Record<string,string>={})=>{const q=new URLSearchParams(threadId?{threadId,...extra}:extra);return q.toString();};
export function createHttpGitHistoryAdapter(base:string,threadId:string|undefined):GitHistoryAdapter{
 return {
  page:async(cursor,signal)=>{
   const read=await get<unknown>(base+'/git/history?'+query(threadId,cursor?{cursor}:{})+'',signal)as {state:string;value?:unknown;error?:{code:string;message:string}};
   if(read.state==='error')throw new ApiError(read.error?.code??'HISTORY_UNAVAILABLE',read.error?.message??'Commit history is unavailable.');
   const parsed=readSchema.safeParse(read);if(!parsed.success)throw new ApiError('HISTORY_UNAVAILABLE','Commit history is unavailable.');
   return parsed.data.value as GitHistoryPage;
  },
  commit:async(snapshotId,oidValue,signal)=>detailSchema.parse(await get(base+'/git/history/commit?'+query(threadId,{snapshotId,oid:oidValue}),signal)) as GitCommitComparison,
  file:async(comparisonId,path,signal)=>patchSchema.parse(await get(base+'/git/history/file?'+query(threadId,{comparisonId,path}),signal)) as GitCommitPatch,
 };
}
export const disabledGitHistoryAdapter:GitHistoryAdapter={page:async()=>{throw new ApiError('HISTORY_UNAVAILABLE','Commit history is unavailable.');},commit:async()=>{throw new ApiError('HISTORY_UNAVAILABLE','Commit history is unavailable.');},file:async()=>{throw new ApiError('HISTORY_UNAVAILABLE','Commit history is unavailable.');}};
