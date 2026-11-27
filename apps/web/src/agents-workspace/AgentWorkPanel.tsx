import {useCallback, useEffect, useRef, useState} from 'react';
import {Ban, Eye, Play, Square} from 'lucide-react';
import {Select} from '../../../../packages/ui-shell/Select';
import {
  getAgentWork, getAgentWorkInputs, getAgentWorkMessages, getAgentWorkOutput, getAgentWorkPlan,
  createAgentWork, sendAgentInput, stopAgentWork, resumeAgentWork, cancelAgentInput, postAgentMessage,
  type AgentWorkList, type AgentInputRow, type AgentMessageRow, type PlanProgress, type AgentWorkRow,
} from '../agent-work-api.ts';

/** M09 agent work surface: typed child work list with role/owner/worktree/
 * state/budget/evidence freshness, Send now vs After current input modes,
 * real delivery status (never optimistic), task tree progress and the
 * task-scoped message board. Parent stop/archive revokes dispatch. */
export function AgentWorkPanel({threadId}: {threadId: string}) {
  const [list, setList] = useState<AgentWorkList | null>(null);
  const [inputs, setInputs] = useState<AgentInputRow[]>([]);
  const [messages, setMessages] = useState<AgentMessageRow[]>([]);
  const [plan, setPlan] = useState<PlanProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<Awaited<ReturnType<typeof getAgentWorkOutput>> | null>(null);
  const [drafts, setDrafts] = useState<Record<string, {text: string}>>({});
  const [pendingInputs, setPendingInputs] = useState<ReadonlySet<string>>(() => new Set());
  const [post, setPost] = useState({recipientThreadId: '', topic: '', text: ''});
  const [posting, setPosting] = useState(false);
  const [open, setOpen] = useState(false);
  const [create, setCreate] = useState({role: 'PLAN_READ' as AgentWorkRow['role'], prompt: '', tokens: '', minutes: ''});
  const [createIds, setCreateIds] = useState<{commandId: string; workId: string; childThreadId: string} | null>(null);
  const [selectedGrants, setSelectedGrants] = useState<ReadonlySet<string>>(() => new Set());
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const busy = useRef(false);
  const evidenceRequest = useRef(0);
  const refresh = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const next = await getAgentWork(threadId);
      setList(next); setPlan(await getAgentWorkPlan(threadId)); setMessages((await getAgentWorkMessages(threadId)).messages);
      // Every active child's queue is shown — inputs to any child get real
      // delivery status and cancellation controls.
      const targets = next.works.filter(work => work.state === 'RUNNING' || work.state === 'QUEUED').map(work => work.owner.threadId);
      setInputs((await Promise.all(targets.map(owner => getAgentWorkInputs(threadId, owner)))).flatMap(batch => batch.inputs));
      setError(null);
    } catch (e) { setError(e instanceof Error ? e.message : 'Agent work unavailable'); }
    finally { busy.current = false; }
  }, [threadId]);
  useEffect(() => { void refresh(); const timer = setInterval(() => void refresh(), 4000); return () => clearInterval(timer); }, [refresh]);
  const progress = plan?.extension ? plan.progress : undefined;
  const progressLabel = progress ? `${progress.total ? Math.round(progress.completed / progress.total * 100) : 0}% known complete · ${progress.total ? Math.round(progress.unknown / progress.total * 100) : 0}% unknown` : undefined;

  const openEvidence = (workId: string) => {
    const request = ++evidenceRequest.current;
    void getAgentWorkOutput(threadId, workId)
      .then(next => {if (request === evidenceRequest.current) setOutput(next);})
      .catch(e => {if (request === evidenceRequest.current) setError(e instanceof Error ? e.message : 'Evidence unavailable');});
  };
  const closeEvidence = () => {
    evidenceRequest.current++;
    setOutput(null);
  };

  const send = (work: AgentWorkRow, kind: 'STEER' | 'FOLLOW_UP') => {
    const {workId} = work;
    const submitted = drafts[workId];
    const text = submitted?.text.trim();
    if (!text || pendingInputs.has(workId)) return;
    setPendingInputs(current => new Set(current).add(workId));
    void sendAgentInput(threadId, {workId, kind, text})
      .then(() => {
        // An acknowledgement owns only the draft it submitted, even if a later edit has the same text.
        setDrafts(current => current[workId] === submitted ? {...current, [workId]: {text: ''}} : current);
        return refresh();
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Send failed'))
      .finally(() => setPendingInputs(current => {
        const next = new Set(current);
        next.delete(workId);
        return next;
      }));
  };
  const submitCreate = () => {
    if (!list || creating) return;
    const prompt = create.prompt.trim();
    const tokens = create.tokens.trim() ? Number(create.tokens) : null;
    const ms = create.minutes.trim() ? Number(create.minutes) * 60_000 : null;
    const validTokens = tokens === null || Number.isInteger(tokens) && tokens > 0;
    const validMs = ms === null || Number.isInteger(ms) && ms > 0;
    if (!prompt || !validTokens || !validMs || tokens === null && ms === null) {
      setCreateError('Enter a prompt and at least one positive whole token budget or positive minute budget.');
      return;
    }
    setCreateError(null);
    const ids = createIds ?? {commandId: crypto.randomUUID(), workId: crypto.randomUUID(), childThreadId: crypto.randomUUID()};
    setCreateIds(ids);
    setCreating(true);
    void createAgentWork(threadId, {
      role: create.role, prompt, grantSubset: list.resources.filter(grant => selectedGrants.has(grant.id)).map(grant => grant.id),
      budget: {tokens, ms}, workId: ids.workId, childThreadId: ids.childThreadId,
    }, ids.commandId)
      .then(() => {
        setCreate(current => current.prompt === prompt ? {...current, prompt: ''} : current);
        setCreateIds(null);
        return refresh();
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Create failed'))
      .finally(() => setCreating(false));
  };
  const submitPost = () => {
    if (posting || !post.recipientThreadId || !post.topic || !post.text) return;
    const submitted = post;
    setPosting(true);
    void postAgentMessage(threadId, submitted)
      .then(() => {
        setPost(current => current === submitted ? {recipientThreadId: '', topic: '', text: ''} : current);
        return refresh();
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Post failed'))
      .finally(() => setPosting(false));
  };
  const stateLabel = (work: AgentWorkRow) => {
    if (work.verification === 'VERIFIED') return 'verified — host evidence accepted';
    if (work.verification === 'REPORTED_BLOCKED') return 'reported blocked — not verified';
    if (work.verification === 'REPORTED_INCOMPLETE') return 'reported incomplete — not verified';
    if (work.verification === 'REPORTED_UNVERIFIED') return 'reported complete — not verified';
    return work.state.replaceAll('_', ' ');
  };
  const evidenceLabel = (work: AgentWorkRow) => {
    if (work.outputStatus === 'missing') return 'reported output missing';
    if (work.outputStatus === 'changed') return 'reported output changed';
    return work.evidence.refs ? `${work.evidence.stale}/${work.evidence.refs} refs stale` : 'no evidence yet';
  };
  return <section className="agents-work" aria-label="Agent work">
    <button type="button" className="agents-disclosure" aria-expanded={open} onClick={() => setOpen(!open)}>Agent work · {list ? list.works.length : '…'}</button>
    {open && <div className="agents-work-body">
      {!list && !error && <p className="agents-work-meta">Loading agent work…</p>}
      {list && <div className="agents-work-meta">roles: {Object.entries(list.roles).map(([role, r]) => `${role}${r.available ? '' : ` (unavailable${r.reason ? `: ${r.reason}` : ''})`}`).join(', ')} · budget reserved {list.budget.reservedTokens}tok</div>}
      {progress && <div className="agents-work-progress">
        <progress aria-label="Task progress" aria-valuetext={progressLabel} max={progress.total || 1} value={progress.completed}/><span>{progressLabel}</span>
        <PlanTree plan={plan!}/>
      </div>}
      {list && list.works.length === 0 && <p className="agents-empty">No admitted agent work yet.</p>}
      {list && <details className="agents-work-create">
        <summary>Admit agent work</summary>
        <div className="agents-board-post">
          <Select aria-label="New work role" value={create.role} onValueChange={value => setCreate(current => ({...current, role: value as AgentWorkRow['role']}))}
            options={(['PLAN_READ', 'RESEARCH_READ', 'CODE_WORKTREE', 'QA'] as const).filter(role => list.roles[role]?.available).map(role => ({value: role, label: role}))}/>
          <input aria-label="Token budget" placeholder="Tokens" inputMode="numeric" value={create.tokens} onChange={e => setCreate(current => ({...current, tokens: e.target.value}))}/>
          <input aria-label="Minute budget" placeholder="Minutes" inputMode="numeric" value={create.minutes} onChange={e => setCreate(current => ({...current, minutes: e.target.value}))}/>
        </div>
        <textarea aria-label="New work prompt" placeholder="Task for the child…" value={create.prompt} onChange={e => setCreate(current => ({...current, prompt: e.target.value}))}/>
        {list.resources.length > 0 && <div className="agents-work-grants" aria-label="Resource access">
          {list.resources.map(grant => <label key={grant.id} className="agents-work-meta"><input type="checkbox" checked={selectedGrants.has(grant.id)} onChange={event => setSelectedGrants(current => {
            const next = new Set(current);
            if (event.target.checked) { if (next.size < 16) next.add(grant.id); } else next.delete(grant.id);
            return next;
          })}/>{grant.label}{grant.writable ? ' (writable parent grant)' : ''}</label>)}
        </div>}
        <p className="agents-work-meta">No resources are shared unless selected here; at most 16 fit one admission. Retrying keeps the same admission identity.</p>
        {createError && <p className="agents-error" role="alert">{createError}</p>}
        <button type="button" disabled={creating || !create.prompt.trim() || !(list.roles[create.role]?.available)} onClick={submitCreate}>{creating ? 'Admitting…' : 'Admit work'}</button>
      </details>}
      {list?.works.map(work => <article key={work.workId} className="agents-work-row" data-state={work.state}>
        <header>
          <strong>{work.role}</strong>
          <span className="agents-work-meta" title={work.owner.threadId}>owner {work.owner.threadId.slice(0, 8)}</span>
          {work.worktree && <span className="agents-work-meta" title={work.worktree}>{work.worktree.split(/[\\/]/).pop()}</span>}
          <span className="agents-work-state" data-state={work.state} data-verification={work.verification}>{stateLabel(work)}{work.blockedReason ? ` — ${work.blockedReason}` : ''}</span>
          <span className="agents-work-meta">{work.budget.tokens !== null ? `${work.budget.tokens}tok ` : ''}{evidenceLabel(work)}</span>
          <button type="button" className="agents-icon" aria-label={`Open evidence for ${work.workId}`} onClick={() => openEvidence(work.workId)}><Eye size={14}/></button>
          {(work.state === 'RUNNING' || work.state === 'QUEUED') && <button type="button" className="agents-icon" aria-label={`Stop ${work.workId}`} onClick={() => { void stopAgentWork(threadId, work.workId).then(refresh).catch(e => setError(e instanceof Error ? e.message : 'Stop failed')); }}><Square size={13}/></button>}
          {work.state === 'INTERRUPTED' && <button type="button" className="agents-icon" aria-label={`Resume ${work.workId}`} onClick={() => { void resumeAgentWork(threadId, work.workId).then(refresh).catch(e => setError(e instanceof Error ? e.message : 'Resume failed')); }}><Play size={13}/></button>}
        </header>
        <div className="agents-work-send">
          <input aria-label={`Message work ${work.workId}`} placeholder="Steer or queue a follow-up…" value={drafts[work.workId]?.text ?? ''} onChange={e => {const text = e.target.value; setDrafts(d => ({...d, [work.workId]: {text}}));}} disabled={work.state !== 'RUNNING' && work.state !== 'QUEUED'}/>
          <button type="button" disabled={pendingInputs.has(work.workId) || work.state !== 'RUNNING' || !work.steerSupported} title={work.steerSupported ? 'Delivered to the running child immediately' : 'This work does not support live steering'} onClick={() => send(work, 'STEER')}>Steer now</button>
          <button type="button" disabled={pendingInputs.has(work.workId) || (work.state !== 'RUNNING' && work.state !== 'QUEUED')} onClick={() => send(work, 'FOLLOW_UP')}>Queue next</button>
        </div>
      </article>)}
      {inputs.length > 0 && <div className="agents-work-queue" aria-label="Queued inputs">
        {inputs.filter(input => input.delivery === 'ACCEPTED' || input.delivery === 'ENTERED_RUNTIME').map(input => <div key={input.inputId} className="agents-work-input" data-delivery={input.delivery}>
          <span className="agents-work-meta">#{input.order}</span><span className="agents-input-kind">{input.kind}</span><span className="agents-input-text">{input.text}</span>
          <span className="agents-input-delivery">{input.delivery.replaceAll('_', ' ').toLowerCase()}</span>
          {input.editable && <button type="button" className="agents-icon" aria-label="Cancel input" onClick={() => { void cancelAgentInput(threadId, input.targetOwner.threadId, input.inputId).then(refresh).catch(e => setError(e instanceof Error ? e.message : 'Cancel failed')); }}><Ban size={13}/></button>}
        </div>)}
      </div>}
      {output && <section className="agents-work-output" aria-label="Work output evidence">
        <div className="agents-work-output-header"><strong>Evidence for {output.workId}</strong><button type="button" className="agents-disclosure" onClick={closeEvidence}>Close evidence</button></div>
        <p className="agents-work-meta">
          {output.verification === 'VERIFIED' ? 'Verified — host evidence accepted.' :
            output.verification === 'REPORTED_BLOCKED' ? 'Reported blocked — not verified.' :
            output.verification === 'REPORTED_INCOMPLETE' ? 'Reported incomplete — not verified.' :
            output.verification === 'REPORTED_UNVERIFIED' ? 'Reported complete — not verified.' : 'No completed output reported.'}
        </p>
        {output.outputStatus !== 'current' && output.outputStatus !== 'none' && <p className="agents-error" role="alert">The durable reported output is {output.outputStatus}; raw output and evidence are unavailable rather than verified.</p>}
        {output.evidence.length > 0 ? <ul aria-label="Evidence references" className="agents-work-evidence-list">
          {output.evidence.map(item => <li key={`${item.id}:${item.revision}`} data-status={item.status}>
            <strong>{item.id}</strong><span>{item.status.replaceAll('-', ' ')}</span>
            <span className="agents-work-meta">claimed r{item.revision}{item.currentRevision === null ? ' · no durable revision' : ` · current r${item.currentRevision}`}</span>
            {item.outcome && <span className="agents-work-meta">outcome {item.outcome}</span>}
            {item.requirementIds.length > 0 && <span className="agents-work-meta">requirements {item.requirementIds.join(', ')}</span>}
            <p className="agents-work-meta">{item.reason ?? 'Current trusted evidence reference. Verification remains a separate host decision.'}</p>
          </li>)}
        </ul> : <p className="agents-work-meta">No usable evidence references are attached to this report.</p>}
        <pre>{JSON.stringify(output.output, null, 2).slice(0, 4000)}</pre>
      </section>}
      {list && (messages.length > 0 || list.works.length) ? <details className="agents-work-board">
        <summary>Message board · {messages.length}</summary>
        {messages.map(message => <div key={message.messageId} className="agents-board-row">
          <span className="agents-work-meta">{message.senderTitle} → {message.recipientTitle}</span>
          <strong>{message.topic}</strong><span className="agents-input-text">{message.text ?? '[artifact]'}</span>
          <span className="agents-input-delivery">{message.receipt.status.toLowerCase()}</span>
        </div>)}
        {list.works.length > 0 && <div className="agents-board-post">
          <Select aria-label="Recipient" value={post.recipientThreadId} onValueChange={value => setPost(p => ({...p, recipientThreadId: value}))}
            options={[{value: '', label: 'Choose recipient…', disabled: true}, ...list.works.map(work => ({value: work.owner.threadId, label: `${work.role} ${work.owner.threadId.slice(0, 8)}`}))]}/>
          <input aria-label="Topic" placeholder="Topic" value={post.topic} onChange={e => setPost(p => ({...p, topic: e.target.value}))}/>
          <input aria-label="Message" placeholder="Message…" value={post.text} onChange={e => setPost(p => ({...p, text: e.target.value}))}/>
          <button type="button" disabled={posting || !post.recipientThreadId || !post.topic || !post.text} onClick={submitPost}>Post</button>
        </div>}
      </details> : null}
      {error && <p className="agents-error" role="alert">{error}</p>}
    </div>}
  </section>;
}

/** M09-U03: weighted task tree. Each node shows its allocated units and its
 * verbatim reported status — absent from the report means unknown work, and a
 * reported "completed" is not accepted verification. */
function PlanTree({plan}: {plan: PlanProgress}) {
  const weights = plan.weights ?? [];
  const children = new Map<string, string[]>();
  for (const rel of plan.parentRelationships ?? []) children.set(rel.parentId, [...(children.get(rel.parentId) ?? []), rel.childId]);
  const childSet = new Set([...children.values()].flat());
  const units = new Map(weights.map(weight => [weight.nodeId, weight.units]));
  const roots = weights.map(weight => weight.nodeId).filter(id => !childSet.has(id));
  const render = (nodeId: string, depth: number) => {
    const status = plan.reportedStatuses?.[nodeId];
    return <li key={nodeId}><span className="agents-work-meta" style={{paddingLeft: depth * 12}}>{nodeId} · {units.get(nodeId) ?? 0} units · {status ?? 'unreported'}{status === 'completed' ? ' (reported)' : ''}</span>
      {(children.get(nodeId) ?? []).length > 0 && <ul>{children.get(nodeId)!.map(child => render(child, depth + 1))}</ul>}
    </li>;
  };
  if (roots.length === 0) return null;
  return <ul className="agents-plan-tree" aria-label="Task tree">{roots.map(root => render(root, 0))}</ul>;
}
