import {useState} from 'react';
import {Folder,Terminal,GitCompare,GitPullRequest,Link,Smartphone,ScrollText,ChartNoAxesCombined} from 'lucide-react';
import type {DataRecord,RuntimeUsage,Snapshot} from '../../../packages/contracts';
import {formatLocalClock} from './time-format';
import type {UiPreferences} from '../../../packages/contracts/preferences';
import type {WorkspacePanelKind} from '../../../packages/contracts/workspace';
import {useWorkspace,type WorkspaceTab} from './workspace-context';
import {usageCost,usagePercent} from './usage-presentation';
import {ContextMeter} from './ContextMeter';
import {annotateSnapshot,annotateUnified,type IntralineRange,type SnapshotAnnotation} from './intraline-diff';
import {DiffText} from './DiffText';

const countFormat = new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 });
const count = (value: number | null | undefined) => value == null ? 'Unavailable' : countFormat.format(value);
export function UsageSummary({ usage }: { usage?: RuntimeUsage }) {
  const ratio = usage?.contextTokens != null && usage.contextWindow != null && usage.contextWindow > 0 ? Math.min(100, Math.max(0, usage.contextTokens / usage.contextWindow * 100)) : null;
  return <div className="usage-summary"><div className="usage-context"><span>Context window</span><strong>{ratio == null ? 'Unavailable' : usagePercent(ratio)}</strong></div><ContextMeter usage={usage} /><p>{count(usage?.contextTokens)} of {count(usage?.contextWindow)} tokens</p><dl><dt>Input tokens</dt><dd>{count(usage?.inputTokens)}</dd><dt>Output tokens</dt><dd>{count(usage?.outputTokens)}</dd><dt>Reported cost</dt><dd>{usage?.cost == null ? 'Unavailable' : usageCost({amount:usage.cost})}</dd><dt>Session limit</dt><dd>{usage?.sessionPercent == null ? 'Unavailable' : usagePercent(usage.sessionPercent)}</dd><dt>Weekly limit</dt><dd>{usage?.weeklyPercent == null ? 'Unavailable' : usagePercent(usage.weeklyPercent)}</dd></dl></div>;
}

export function WorkspaceLauncher({onOpenTool}:{onOpenTool?:(kind:WorkspacePanelKind)=>void|Promise<void>}={}) {
  const workspace = useWorkspace();
  const [error,setError]=useState('');
  const openTool=(kind:WorkspacePanelKind)=>{setError('');try{const result=onOpenTool?onOpenTool(kind):workspace.setActiveTab(kind as WorkspaceTab);if(result)void result.catch(cause=>setError(cause instanceof Error?cause.message:'The surface could not open.'));}catch(cause){setError(cause instanceof Error?cause.message:'The surface could not open.');}};
  const unavailable = 'Unavailable in this local harness';
  return <section className="workspace-launcher" aria-label="Workspace launcher"><h3>Open a surface</h3>{error&&<p role="status" className="error-text">{error}</p>}
    <button type="button" aria-label="Terminal" onClick={()=>openTool('terminal')} title="Open an interactive host terminal"><Terminal size={18} /><span>Terminal</span><small>Interactive host session</small></button>
    <button type="button" aria-label="Files" onClick={() => openTool('files')}><Folder size={18} /><span>Files</span><small>Granted resources</small></button>
    <button type="button" aria-label="Diff" onClick={() => openTool('diff')}><GitCompare size={18} /><span>Diff</span><small>Prepared changes</small></button>
    <button type="button" aria-label="Pull request" onClick={()=>openTool('pull-request')} title="Open project pull requests"><GitPullRequest size={18} /><span>Pull request</span><small>Project pull requests</small></button>
    <button type="button" aria-label="Linked pull requests" onClick={()=>openTool('linked-pull-requests')} title="Open linked pull requests"><Link size={18} /><span>Linked pull requests</span><small>Connected reviews</small></button>
    <button type="button" aria-label="Device" disabled title="Phone and device automation is not connected."><Smartphone size={18} /><span>Device</span><small>{unavailable}</small></button>
    <button type="button" aria-label="Executor output" onClick={() => openTool('output')}><ScrollText size={18} /><span>Executor output</span><small>Recorded operations</small></button>
    <button type="button" aria-label="Usage" onClick={() => openTool('usage')}><ChartNoAxesCombined size={18} /><span>Usage</span><small>Runtime reports</small></button>
  </section>;
}

export {GrantedFiles} from './files/GrantedFiles';
function record(value: unknown): Record<string, unknown> { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
export function snapshotDiffs(snapshot: Snapshot, threadId?: string) {
  const diffs: { id: string; title: string; before?: string; after?: string; unified?: string; provenance: string }[] = [];
  for (const data of snapshot.data.filter(item => item.threadId === threadId)) {
    const value = record(data.value);
    if (typeof value.before === 'string' && typeof value.after === 'string') diffs.push({ id: data.id, title: typeof value.title === 'string' ? value.title : data.id, before: value.before, after: value.after, provenance: data.provenance });
    else if (/; git diff;/.test(data.provenance) && typeof value.stdout === 'string') diffs.push({ id: data.id, title: 'Repository diff', unified: value.stdout, provenance: data.provenance });
  }
  for (const artifact of snapshot.artifacts.filter(item => item.threadId === threadId && item.lifecycle === 'active')) for (const [id, element] of Object.entries(artifact.spec?.elements ?? {})) {
    if (element.type === 'Diff' && typeof element.props.before === 'string' && typeof element.props.after === 'string') diffs.push({ id: `${artifact.id}:${id}`, title: artifact.title, before: element.props.before, after: element.props.after, provenance: `Generated interface ${artifact.id}, revision ${artifact.revision}. This comparison is presentation data; it does not prove an executed change.` });
  }
  return diffs;
}
export function RecordedDiffPanel({ snapshot, threadId, preferences, active = true }: { snapshot: Snapshot; threadId?: string; preferences: UiPreferences; active?: boolean }) {
  return <RecordedDiffs diffs={snapshotDiffs(snapshot,threadId)} preferences={preferences} active={active}/>;
}
const MAX_ANNOTATED_FILES=16;
// Render one side of a snapshot comparison: kept source lines in order,
// changed runs marked, escaped text only.
function SnapshotSide({text,keep,annotation,tone}:{text:string;keep:number[]|undefined;annotation:SnapshotAnnotation;tone:'removed'|'added'}){
  const lines=text.split('\n'),marks=new Map<number,IntralineRange[]>((tone==='removed'?annotation.before:annotation.after).map(line=>[line.index,line.ranges]));
  const indexes=keep??lines.map((_,i)=>i);
  if(!indexes.length)return <pre>(empty)</pre>;
  return <pre>{indexes.map((index,i)=><span key={index}>{i>0?'\n':''}<DiffText text={lines[index]!} ranges={marks.get(index)} tone={tone}/></span>)}</pre>;
}
function UnifiedDiffText({patch,annotation}:{patch:string;annotation:Map<number,IntralineRange[]>|null}){
  if(!annotation||!patch)return <>{patch||'No changes reported.'}</>;
  return <>{patch.split('\n').map((line,index)=>{
    const ranges=annotation.get(index);
    if(!ranges||!line.length)return <span key={index}>{index>0?'\n':''}{line}</span>;
    const tone=line.startsWith('-')?'removed':'added';
    return <span key={index}>{index>0?'\n':''}{line.slice(0,1)}<DiffText text={line.slice(1)} ranges={ranges} tone={tone}/></span>;
  })}</>;
}
export function RecordedDiffs({diffs,preferences,active=true}:{diffs:ReturnType<typeof snapshotDiffs>;preferences:UiPreferences;active?:boolean}) {
  const [toggled,setToggled]=useState<Set<string>>(new Set());
  const pair = (before: string, after: string) => {
    if (!preferences.hideWhitespace) return { before, after };
    const left = before.split('\n'), right = after.split('\n'); const changed = Math.max(left.length, right.length);
    return { before: Array.from({ length: changed }, (_, index) => (left[index] ?? '').replace(/\s/g, '') === (right[index] ?? '').replace(/\s/g, '') ? null : left[index] ?? '').filter(line => line !== null).join('\n'), after: Array.from({ length: changed }, (_, index) => (left[index] ?? '').replace(/\s/g, '') === (right[index] ?? '').replace(/\s/g, '') ? null : right[index] ?? '').filter(line => line !== null).join('\n') };
  };
  const isOpen=(diff:ReturnType<typeof snapshotDiffs>[number])=>toggled.has(diff.id)?!preferences.diffDefaultExpanded:preferences.diffDefaultExpanded;
  // Enrich the first expanded files in display order, up to the cap.
  let enriched=0;
  const annotations=diffs.map(diff=>{
    if(!active||enriched>=MAX_ANNOTATED_FILES||!isOpen(diff))return null;
    enriched++;
    return diff.unified!==undefined?annotateUnified(diff.unified,{hideWhitespace:preferences.hideWhitespace}):annotateSnapshot(diff.before??'',diff.after??'',{hideWhitespace:preferences.hideWhitespace});
  });
  return <div className={`workspace-diffs diff-colors-${preferences.diffColors}`}>{diffs.length ? <>{diffs.map((diff,diffIndex) => { const annotation=annotations[diffIndex]; return <details className="workspace-diff" key={diff.id} open={preferences.diffDefaultExpanded} onToggle={event=>{const open=(event.currentTarget as HTMLDetailsElement).open;setToggled(previous=>{const next=new Set(previous);if(open!==preferences.diffDefaultExpanded)next.add(diff.id);else next.delete(diff.id);return next;});}}><summary>{diff.title}</summary><p className="panel-note">{diff.provenance}</p>{diff.unified !== undefined ? <pre className="unified-diff"><UnifiedDiffText patch={diff.unified} annotation={annotation instanceof Map?annotation:null}/></pre> : <SnapshotPair diff={diff} annotation={annotation as SnapshotAnnotation|null} preferences={preferences} pair={pair}/>}</details>; })}</> : <div className="panel-empty"><strong>No recorded diffs</strong></div>}</div>;
}
function SnapshotPair({diff,annotation,preferences,pair}:{diff:ReturnType<typeof snapshotDiffs>[number];annotation:SnapshotAnnotation|null;preferences:UiPreferences;pair:(before:string,after:string)=>{before:string;after:string}}){
  const before=diff.before??'',after=diff.after??'';
  if(annotation)return <div className={`workspace-diff-pair diff-${preferences.diffLayout}`}><section><h3>Before</h3><SnapshotSide text={before} keep={annotation.beforeKeep} annotation={annotation} tone="removed"/></section><section><h3>After</h3><SnapshotSide text={after} keep={annotation.afterKeep} annotation={annotation} tone="added"/></section></div>;
  const value=pair(before,after);
  return <div className={`workspace-diff-pair diff-${preferences.diffLayout}`}><section><h3>Before</h3><pre>{value.before || '(empty)'}</pre></section><section><h3>After</h3><pre>{value.after || '(empty)'}</pre></section></div>;
}
export function OutputPanel({ snapshot, threadId, preferences }: { snapshot: Snapshot; threadId?: string; preferences: UiPreferences }) {
  const operations = snapshot.operations.filter(item => item.threadId === threadId), data = snapshot.data.filter(item => item.threadId === threadId && !operations.some(operation => operation.id === item.id) && (typeof record(item.value).stdout === 'string' || typeof record(item.value).stderr === 'string'));
  const output = (item: DataRecord) => { const value = record(item.value); return <section key={item.id} className="executor-record"><header><strong>Executor output</strong><small>{formatLocalClock(item.createdAt, preferences.timeFormat)}</small></header><p className="panel-note">{item.provenance}</p>{typeof value.stdout === 'string' && <pre>{value.stdout || 'No stdout.'}</pre>}{typeof value.stderr === 'string' && value.stderr && <pre className="error-text">{value.stderr}</pre>}<p className="panel-note">Exit code: {value.exitCode == null ? 'Unavailable' : String(value.exitCode)}</p></section>; };
  return <div className="executor-output">{operations.map(operation => <section key={operation.id} className="executor-record"><header><strong>{operation.kind}</strong><span className="badge">{operation.status}</span></header><p>{operation.description}</p>{operation.error && <p className="error-text">{operation.error}</p>}{operation.result !== undefined ? <pre>{JSON.stringify(operation.result, null, 2)}</pre> : <p className="panel-note">No executor result reported.</p>}<small>Operation {operation.id}</small></section>)}{data.map(output)}{!operations.length && !data.length && <div className="panel-empty"><strong>No executor output yet</strong></div>}</div>;
}
