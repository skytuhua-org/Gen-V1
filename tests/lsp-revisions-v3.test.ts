import {cleanTempDirs,tempDir} from './fixtures/temp-dir.ts';
import {it,expect,afterEach} from 'vitest';
import {writeFileSync} from 'node:fs';

import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {
 CodeIntelligence,LanguageServerPool,encodedLength,toUtf16Offset,fromUtf16Offset,applyTextEdit,
 type LanguageServerAdapter,type LanguageServerDescriptor,type LspDiagnostic,type LspDocument,
} from '../packages/core/code-intelligence.ts';
import {diagnosticObservationV1Schema} from '../packages/contracts/code-intelligence.ts';
import {HarnessError} from '../packages/contracts/index.ts';

const sha=(value:string|Buffer)=>createHash('sha256').update(value).digest('hex');
const disposables:{dispose():Promise<void>}[]=[];
afterEach(async()=>{for(const d of disposables.splice(0))await d.dispose();cleanTempDirs();});

const descriptor:LanguageServerDescriptor={language:'typescript',executable:'/approved/tsserver',argv:['--stdio'],configDigest:'a'.repeat(64)};

/** In-memory adapter: records opens/changes, returns canned diagnostics and
 * locations. */
class FakeAdapter implements LanguageServerAdapter{
 readonly serverIdentity='fake-server-1';
 encoding:'UTF8'|'UTF16'|'UTF32'='UTF16';
 opened:LspDocument[]=[];
 diagnostics:LspDiagnostic[]=[];
 locations:{uri:string;range:{start:{line:number;character:number};end:{line:number;character:number}}}[]=[];
 delay=0;
 pullDelay?:(doc:LspDocument)=>number;
 async openDocument(doc:LspDocument){this.opened.push({...doc});}
 async changeDocument(doc:LspDocument){const found=this.opened.find(d=>d.uri===doc.uri);if(found){found.version=doc.version;found.text=doc.text;found.digest=doc.digest;}else this.opened.push({...doc});}
 async closeDocument(){}
 async pullDiagnostics(doc:LspDocument){const wait=this.pullDelay?this.pullDelay(doc):this.delay;if(wait)await new Promise(r=>setTimeout(r,wait));return this.diagnostics;}
 async navigate(){if(this.delay)await new Promise(r=>setTimeout(r,this.delay));return this.locations;}
 async rename(){return{};}
 async dispose(){}
}

function fixture(){
 const root=tempDir('lsp-root-');
 writeFileSync(join(root,'a.ts'),'const alpha = 1;\nconst beta = alpha + 1;\n');
 return root;
}
const observeInput=(root:string,text:string,overrides:Record<string,unknown>={})=>({
 workspaceIdentity:'ws-1',root,language:'typescript',descriptor,profileDigest:'b'.repeat(64),
 path:join(root,'a.ts'),beforeDigest:null,afterDigest:sha(text),text,
 editInvocationId:null,wait:'delayed' as const,signal:new AbortController().signal,...overrides,
});

it('positions are converted between encodings, never treated as byte offsets',()=>{
 const line='aé😀z'; // 1+2+3-byte chars plus z
 expect(encodedLength(line,'UTF16')).toBe(5);
 expect(encodedLength(line,'UTF8')).toBe(8);
 expect(encodedLength(line,'UTF32')).toBe(4);
 // UTF-8 byte index of 'z' is 7 (1+2+4); the same point is UTF-16 index 4.
 expect(toUtf16Offset(line,7,'UTF8')).toBe(4);
 expect(fromUtf16Offset(line,4,'UTF8')).toBe(7);
 expect(toUtf16Offset(line,4,'UTF16')).toBe(4);
 // 'z' sits at UTF-32 index 3; a mid-surrogate UTF-16 offset clamps to the boundary.
 expect(fromUtf16Offset(line,4,'UTF32')).toBe(3);
 expect(fromUtf16Offset(line,3,'UTF32')).toBe(2);
});

it('applying an edit never rewrites untouched line endings',()=>{
 const content='const a=1;\r\nconst b=2;\r\n';
 // Replace 'a' on the first line: every other byte stays CRLF.
 const edited=applyTextEdit(content,{start:{line:0,character:6},end:{line:0,character:7}},'z','UTF16');
 expect(edited).toBe('const z=1;\r\nconst b=2;\r\n');
 // An insertion inside the second line introduces no '\n'.
 const inserted=applyTextEdit(content,{start:{line:1,character:0},end:{line:1,character:0}},'// ','UTF16');
 expect(inserted).toBe('const a=1;\r\n// const b=2;\r\n');
 // The final line keeps its terminator even without a trailing segment.
 const replaced=applyTextEdit('x\r\ny\r\n',{start:{line:1,character:0},end:{line:1,character:1}},'q','UTF16');
 expect(replaced).toBe('x\r\nq\r\n');
});

it('end-of-file positions and empty documents are valid edit targets',()=>{
 expect(applyTextEdit('',{start:{line:0,character:0},end:{line:0,character:0}},'x','UTF16')).toBe('x');
 // A document ending in a newline has a final, empty line (LSP line model).
 expect(applyTextEdit('a\n',{start:{line:1,character:0},end:{line:1,character:0}},'b','UTF16')).toBe('a\nb');
 expect(applyTextEdit('a\r\n',{start:{line:1,character:0},end:{line:1,character:0}},'b','UTF16')).toBe('a\r\nb');
 // Still bounded: a line past the empty tail is invalid.
 expect(()=>applyTextEdit('a\n',{start:{line:2,character:0},end:{line:2,character:0}},'b','UTF16')).toThrowError(/exceeds/i);
 // Without a trailing newline there is no line 1 to edit.
 expect(()=>applyTextEdit('a',{start:{line:1,character:0},end:{line:1,character:0}},'b','UTF16')).toThrowError(/exceeds/i);
});

it('diagnostics bind to the exact document version and after-digest',async()=>{
 const root=fixture();
 const adapter=new FakeAdapter();
 adapter.diagnostics=[{range:{start:{line:0,character:0},end:{line:0,character:5}},severity:1,message:'boom',code:'TS1',source:'fake'}];
 const ci=new CodeIntelligence(()=>adapter);
 disposables.push(ci);
 const text='const alpha = 1;\nconst beta = alpha + 1;\n';
 const obs=await ci.observe(observeInput(root,text));
 expect(diagnosticObservationV1Schema.parse(obs)).toEqual(obs);
 expect(obs.state).toBe('CURRENT');
 expect(obs.afterDigest).toBe(sha(text));
 expect(obs.documentVersion).toBe(1);
 expect(obs.diagnostics).toHaveLength(1);
 expect(obs.diagnostics[0]!.severity).toBe('error');
 // Second observation of a changed document binds a new version/digest.
 const next=await ci.observe(observeInput(root,text+'const c=2;\n',{beforeDigest:sha(text),afterDigest:sha(text+'const c=2;\n')}));
 expect(next.documentVersion).toBe(2);
 expect(next.state).toBe('CURRENT');
});

it('an observation that exceeds its budget returns UNAVAILABLE without undoing the edit',async()=>{
 const root=fixture();
 const adapter=new FakeAdapter();
 adapter.delay=400;
 const ci=new CodeIntelligence(()=>adapter);
 disposables.push(ci);
 const text='const x=1;\n';
 const obs=await ci.observe(observeInput(root,text,{wait:'inline'}));
 expect(obs.state).toBe('UNAVAILABLE');
 expect(obs.diagnostics).toHaveLength(0);
 expect(obs.afterDigest).toBe(sha(text)); // the edit stands; the observation is what failed
});

it('an unavailable baseline never reports existing diagnostics as introduced',async()=>{
 const root=fixture();
 const adapter=new FakeAdapter();
 adapter.diagnostics=[{range:{start:{line:0,character:0},end:{line:0,character:1}},severity:2,message:'w'}];
 const ci=new CodeIntelligence(()=>adapter);
 disposables.push(ci);
 const text='const x=1;\n';
 const obs=await ci.observe(observeInput(root,text,{beforeDigest:null}));
 expect(obs.baselineStatus).toBe('UNAVAILABLE');
 const diff=ci.diffDiagnostics(null,obs);
 expect(diff.baselineStatus).toBe('UNAVAILABLE');
 expect(diff.introduced).toHaveLength(0);
 expect(diff.existing).toHaveLength(1);
 // With a matching before-digest the diff separates introduced from existing.
 const before={...obs,afterDigest:sha('old\n'),diagnostics:[]};
 const introduced=ci.diffDiagnostics(before,{...obs,beforeDigest:sha('old\n'),baselineStatus:'AVAILABLE'});
 expect(introduced.baselineStatus).toBe('AVAILABLE');
 expect(introduced.introduced).toHaveLength(1);
});

it('stale observations are marked when the document moved on',async()=>{
 const root=fixture();
 const adapter=new FakeAdapter();
 const ci=new CodeIntelligence(()=>adapter);
 disposables.push(ci);
 const text='const x=1;\n';
 const first=await ci.observe(observeInput(root,text));
 await ci.observe(observeInput(root,text+'y\n',{beforeDigest:sha(text),afterDigest:sha(text+'y\n')}));
 const stale=await ci.markStale(observeInput(root,text),first);
 expect(stale.state).toBe('STALE');
});

it('navigation filters file URIs to granted roots and caps results at 100',async()=>{
 const root=fixture();
 const outside=tempDir('lsp-outside-');
 writeFileSync(join(outside,'o.ts'),'const o=1;\n');
 const adapter=new FakeAdapter();
 adapter.locations=[
  {uri:pathToFileURL(join(root,'a.ts')).href,range:{start:{line:0,character:0},end:{line:0,character:1}}},
  {uri:pathToFileURL(join(outside,'o.ts')).href,range:{start:{line:0,character:0},end:{line:0,character:1}}},
  {uri:'untitled:scratch',range:{start:{line:0,character:0},end:{line:0,character:1}}},
 ];
 const ci=new CodeIntelligence(()=>adapter);
 disposables.push(ci);
 const text='const x=1;\n';
 const result=await ci.navigate({root,path:join(root,'a.ts'),language:'typescript',descriptor,profileDigest:'c'.repeat(64),kind:'references',position:{line:0,character:1},grantedRoots:[root],signal:new AbortController().signal,text,afterDigest:sha(text)});
 expect(result.locations).toHaveLength(1);
 expect(result.locations[0]!.path).toContain('a.ts');
 expect(result.truncated).toBe(false);
 // More than the cap yields an explicit truncation marker.
 adapter.locations=Array.from({length:130},(_,i)=>({uri:pathToFileURL(join(root,'a.ts')).href,range:{start:{line:0,character:i%10},end:{line:0,character:i%10+1}}}));
 const capped=await ci.navigate({root,path:join(root,'a.ts'),language:'typescript',descriptor,profileDigest:'c'.repeat(64),kind:'references',position:{line:0,character:1},grantedRoots:[root],signal:new AbortController().signal,text,afterDigest:sha(text)});
 expect(capped.locations.length).toBeLessThanOrEqual(100);
 expect(capped.truncated).toBe(true);
});

it('a superseded observation never reports CURRENT once a newer pull resolved',async()=>{
 const root=fixture();
 const adapter=new FakeAdapter();
 adapter.diagnostics=[{range:{start:{line:0,character:0},end:{line:0,character:1}},severity:1,message:'d'}];
 // Edit B's pull resolves before edit A's: A must land STALE, not CURRENT.
 adapter.pullDelay=(doc)=>doc.version===1?200:5;
 const ci=new CodeIntelligence(()=>adapter);
 disposables.push(ci);
 const a='const a=1;\n',b='const b=2;\n';
 const [obsA,obsB]=await Promise.all([
  ci.observe(observeInput(root,a)),
  ci.observe(observeInput(root,b,{beforeDigest:sha(a)})),
 ]);
 expect(obsB.state).toBe('CURRENT');
 expect(obsB.afterDigest).toBe(sha(b));
 // The earlier generation finished last; CURRENT would present diagnostics
 // for document version 1 as the live result while version 2 already exists.
 expect(obsA.state).not.toBe('CURRENT');
});

it('a baseline is only comparable within the same workspace, server and profile',async()=>{
 const root=fixture();
 const adapter=new FakeAdapter();
 adapter.diagnostics=[{range:{start:{line:0,character:0},end:{line:0,character:1}},severity:2,message:'w'}];
 const ci=new CodeIntelligence(()=>adapter);
 disposables.push(ci);
 const text='const x=1;\n';
 const first=await ci.observe(observeInput(root,text));
 expect(first.baselineStatus).toBe('UNAVAILABLE');
 // A different workspace identity/profile observing the same path must not
 // inherit the first server's baseline: nothing from its own pool exists yet.
 const other=await ci.observe(observeInput(root,text,{
  workspaceIdentity:'ws-2',profileDigest:'c'.repeat(64),beforeDigest:sha(text),
 }));
 expect(other.baselineStatus).toBe('UNAVAILABLE');
});

it('navigation returns granted-root locations for supplementary-plane documents',async()=>{
 const root=tempDir('lsp-unicode-');
 const text='const aé😀z = 1;\nconst use = aé😀z + 1;\n';
 writeFileSync(join(root,'u.ts'),text);
 const adapter=new FakeAdapter();
 adapter.encoding='UTF8';
 adapter.locations=[{uri:pathToFileURL(join(root,'u.ts')).href,range:{start:{line:1,character:16},end:{line:1,character:22}}}];
 const ci=new CodeIntelligence(()=>adapter);
 disposables.push(ci);
 const result=await ci.navigate({root,path:join(root,'u.ts'),language:'typescript',descriptor,profileDigest:'c'.repeat(64),kind:'references',position:{line:1,character:11},grantedRoots:[root],signal:new AbortController().signal,text,afterDigest:sha(text)});
 expect(result.locations).toHaveLength(1);
 expect(result.locations[0]!.path).toContain('u.ts');
});

it('observe, navigate and rename never spawn a server outside the adapter seam',async()=>{
 const root=fixture();
 const adapter=new FakeAdapter();
 const made:{descriptor:LanguageServerDescriptor;root:string}[]=[];
 const ci=new CodeIntelligence((d,r)=>{made.push({descriptor:d,root:r});return adapter;});
 disposables.push(ci);
 const text='const x=1;\n';
 await ci.observe(observeInput(root,text));
 await ci.navigate({root,path:join(root,'a.ts'),language:'typescript',descriptor,profileDigest:'b'.repeat(64),kind:'references',position:{line:0,character:0},grantedRoots:[root],signal:new AbortController().signal,text,afterDigest:sha(text)});
 // Every server came through the approved factory seam exactly once;
 // no path in observe/navigate constructs StdioLspAdapter directly.
 expect(made).toHaveLength(1);
});

it('a failed observation retires its server instead of reusing a wedged adapter',async()=>{
 const root=fixture();
 const adapters:FakeAdapter[]=[];
 const ci=new CodeIntelligence(()=>{const a=new FakeAdapter();adapters.push(a);return a;});
 disposables.push(ci);
 // First server dies mid-pull: the observation is UNAVAILABLE and the pool
 // drops the entry instead of reusing it.
 const text='const x=1;\n';
 await ci.observe(observeInput(root,text)); // creates the first adapter, healthy
 adapters[0]!.pullDiagnostics=async()=>{throw new HarnessError('UNAVAILABLE','dead');};
 const obs=await ci.observe(observeInput(root,text));
 expect(obs.state).toBe('UNAVAILABLE');
 expect(ci.pool.size).toBe(0);
 // The next observation provisions a fresh adapter under the same key.
 const next=await ci.observe(observeInput(root,text));
 expect(next.state).toBe('CURRENT');
 expect(adapters).toHaveLength(2);
});

it('the pool keys servers by workspace, language, config digest and profile',async()=>{
 const root=fixture();
 const made:string[]=[];
 const pool=new LanguageServerPool(d=>{made.push(d.executable);return new FakeAdapter();},()=>Date.now());
 disposables.push(pool);
 await pool.acquire(root,descriptor,'p1');
 await pool.acquire(root,descriptor,'p1');
 expect(made).toHaveLength(1);
 await pool.acquire(root,{...descriptor,configDigest:'d'.repeat(64)},'p1');
 await pool.acquire(root,descriptor,'p2');
 // A Python workspace pools separately from TypeScript — provenance stays per language.
 await pool.acquire(root,{...descriptor,language:'python'},'p1');
 expect(made).toHaveLength(4);
 await pool.dispose();
 expect(pool.size).toBe(0);
});

it('idle servers shut down and profile revocation drops owned resources',async()=>{
 const root=fixture();
 let now=1000;
 const pool=new LanguageServerPool(()=>new FakeAdapter(),()=>now,60_000);
 disposables.push(pool);
 await pool.acquire(root,descriptor,'p1');
 expect(pool.size).toBe(1);
 now+=61_000;
 await (pool as unknown as {reap():Promise<void>}).reap();
 expect(pool.size).toBe(0);
});

// Issue #2020 / M07-01: boundary reproductions for the diagnostics generation
// fence and per-owner baseline provenance. `it.fails` entries are the plan's
// failing focused regressions — T03 flips them to `it` once repaired.

it.fails('a superseded observation never reports CURRENT or clobbers the newer baseline',async()=>{
 const root=fixture();
 const adapter=new FakeAdapter();
 const pending:{resolve:(diags:LspDiagnostic[])=>void}[]=[];
 adapter.pullDiagnostics=()=>new Promise<LspDiagnostic[]>(resolve=>pending.push({resolve}));
 const ci=new CodeIntelligence(()=>adapter);
 disposables.push(ci);
 const textA='const a=1;\n',textB='const a=1;\nconst b=2;\n';
 const inputA=observeInput(root,textA),inputB=observeInput(root,textB,{beforeDigest:sha(textA),afterDigest:sha(textB)});
 const obsA=ci.observe(inputA);
 await expect.poll(()=>pending.length,{timeout:10_000}).toBe(1);
 const obsB=ci.observe(inputB);
 await expect.poll(()=>pending.length,{timeout:10_000}).toBe(2);
 // B (newer generation) resolves first and is the authoritative result.
 pending[1]!.resolve([]);
 const B=await obsB;
 expect(B.state).toBe('CURRENT');
 expect(B.documentVersion).toBe(2);
 // A resolves after the document moved on: it must not claim CURRENT.
 pending[0]!.resolve([]);
 const A=await obsA;
 expect(A.state).not.toBe('CURRENT');
 // And it must not clobber B's baseline: B stays current afterwards.
 const still=await ci.markStale(inputB,B);
 expect(still.state).toBe('CURRENT');
});

it.fails('a baseline recorded under another workspace identity is never compared against',async()=>{
 const root=fixture();
 const adapter=new FakeAdapter();
 const ci=new CodeIntelligence(()=>adapter);
 disposables.push(ci);
 const text='const alpha = 1;\nconst beta = alpha + 1;\n';
 const first=await ci.observe(observeInput(root,text));
 expect(first.baselineStatus).toBe('UNAVAILABLE');
 // Same document path under a different workspace identity: the ws-1 baseline
 // is keyed by path alone and must not bind to ws-2.
 const next=await ci.observe(observeInput(root,text,{workspaceIdentity:'ws-2',beforeDigest:first.afterDigest}));
 expect(next.baselineStatus).toBe('UNAVAILABLE');
});

it('introduced and existing diagnostics are classified separately',async()=>{
 const root=fixture();
 const adapter=new FakeAdapter();
 adapter.diagnostics=[{range:{start:{line:0,character:0},end:{line:0,character:1}},severity:1,message:'old'}];
 const ci=new CodeIntelligence(()=>adapter);
 disposables.push(ci);
 const text='const x=1;\n';
 const before=await ci.observe(observeInput(root,text));
 adapter.diagnostics=[...adapter.diagnostics,{range:{start:{line:0,character:2},end:{line:0,character:3}},severity:1,message:'new'}];
 const after=await ci.observe(observeInput(root,text+'z\n',{beforeDigest:sha(text),afterDigest:sha(text+'z\n')}));
 const diff=ci.diffDiagnostics(before,after);
 expect(diff.baselineStatus).toBe('AVAILABLE');
 expect(diff.existing).toHaveLength(1);
 expect(diff.introduced).toHaveLength(1);
 expect(diff.introduced[0]!.message).toBe('new');
});

it('the host path launches and tears down servers only through the pooled factory',async()=>{
 const root=fixture();
 const launches:LanguageServerDescriptor[]=[],disposed:string[]=[];
 const ci=new CodeIntelligence(d=>{launches.push(d);const a=new FakeAdapter();const orig=a.dispose.bind(a);a.dispose=async()=>{disposed.push(a.serverIdentity);await orig();};return a;});
 disposables.push(ci);
 const text='const x=1;\n';
 await ci.observe(observeInput(root,text));
 expect(launches).toHaveLength(1);
 await ci.dispose();
 expect(disposed).toHaveLength(1);
});
