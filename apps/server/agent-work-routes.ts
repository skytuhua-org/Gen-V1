import type {FastifyInstance} from 'fastify';
import {z} from 'zod';
import {HarnessError, type DataRecord, type Thread} from '../../packages/contracts/index.ts';
import type {AgentWorkRole, AgentWorkV1} from '../../packages/contracts/agent-work.ts';
import {PLANNING_PROVENANCE} from '../../packages/contracts/planning.ts';
import type {Service} from '../../packages/core/service.ts';

const id = z.string().min(1).max(200).regex(/^[\w:.-]+$/);
const roles: AgentWorkRole[] = ['PLAN_READ', 'RESEARCH_READ', 'CODE_WORKTREE', 'QA'];

/** M09 read-model routes. Mutations go through /api/commands as agentWork.*
 * commands so they share the host's session, authority and dedupe plumbing.
 * Personal host only, beneath buildServer's existing gates. */
export function registerAgentWorkRoutes(app: FastifyInstance, service: Service) {
  const store = service.store;
  const taskThread = (taskId: string): Thread => {
    const thread = store.get<Thread>('thread', taskId);
    if (!thread || thread.kind === 'delegate') throw new HarnessError('NOT_FOUND', 'Task unavailable');
    return thread;
  };
  const outputState = (work: AgentWorkV1) => {
    const output = work.outputRef ? store.get<DataRecord>('data', work.outputRef.id) : null;
    const current = output !== null && output.revision === work.outputRef?.revision;
    const value = current ? (output.value ?? {}) as {outcome?: unknown; evidenceRefs?: {id: string; revision: number}[]; requirementIds?: unknown} : null;
    const reportedOutcome = value?.outcome === 'COMPLETED' || value?.outcome === 'INCOMPLETE' || value?.outcome === 'BLOCKED' ? value.outcome : null;
    const verification = work.state === 'VERIFIED' ? 'VERIFIED'
      : work.state !== 'COMPLETED_REPORTED' ? 'NOT_REPORTED'
      : reportedOutcome === 'BLOCKED' ? 'REPORTED_BLOCKED'
      : reportedOutcome === 'INCOMPLETE' ? 'REPORTED_INCOMPLETE'
      : 'REPORTED_UNVERIFIED';
    return {
      output, current, value, reportedOutcome, verification,
      outputStatus: work.outputRef ? output === null ? 'missing' : current ? 'current' : 'changed' : 'none',
    };
  };
  /** Evidence freshness: declared refs resolved against current durable
   * revisions — stale refs are counted, never hidden. */
  const freshness = (work: AgentWorkV1) => {
    const state = outputState(work);
    const refs = state.current ? state.value?.evidenceRefs ?? [] : [];
    const stale = refs.filter(ref => store.get<DataRecord>('data', ref.id)?.revision !== ref.revision).length;
    return {refs: refs.length, stale, outputRevision: state.current ? state.output!.revision : null};
  };
  const evidenceDetails = (work: AgentWorkV1) => {
    const state = outputState(work);
    if (!state.current) return [];
    const declaredRequirements = Array.isArray(state.value?.requirementIds) ? state.value.requirementIds.filter((item): item is string => typeof item === 'string') : [];
    return (state.value?.evidenceRefs ?? []).map(ref => {
      const record = store.get<DataRecord>('data', ref.id);
      const value = (record?.value ?? null) as {outcome?: unknown; requirementId?: unknown; requirementIds?: unknown} | null;
      const bound = value?.requirementId ?? value?.requirementIds;
      const requirementIds = Array.isArray(bound) ? bound.filter((item): item is string => typeof item === 'string') : typeof bound === 'string' ? [bound] : [];
      let status = 'current', reason: string | null = null;
      if (!record) { status = 'missing'; reason = 'no durable evidence record exists at the claimed reference'; }
      else if (record.threadId !== work.parentOwner.threadId) { status = 'wrong-owner'; reason = 'evidence belongs outside the parent task'; }
      else if (record.revision !== ref.revision) { status = 'stale'; reason = `durable revision is ${record.revision}, not claimed revision ${ref.revision}`; }
      else if (record.provenance !== 'harness:verification') reason = `untrusted provenance ${record.provenance}`;
      else if (typeof value?.outcome === 'string' && value.outcome !== 'PASS') reason = `check outcome ${value.outcome}`;
      else if (requirementIds.some(id => !declaredRequirements.includes(id))) reason = 'evidence is bound to a requirement outside the reported output';
      return {
        id: ref.id, revision: ref.revision, currentRevision: record?.revision ?? null, status,
        provenance: record?.provenance ?? null, outcome: typeof value?.outcome === 'string' ? value.outcome : null,
        requirementIds, reason,
      };
    });
  };
  const workRow = (work: AgentWorkV1) => {
    const grants = service.agentWork.dispatchedGrants(work.workId) ?? [];
    const output = outputState(work);
    return {
      workId: work.workId, role: work.role, state: work.state, failureReason: work.failureReason,
      reportedOutcome: output.reportedOutcome, verification: output.verification, outputStatus: output.outputStatus,
      owner: work.childOwner, parentThreadId: work.parentOwner.threadId,
      worktree: grants.find(grant => grant.writable)?.path ?? null,
      grants: grants.map(grant => ({id: grant.id, label: grant.label, writable: grant.writable})),
      budget: work.budget, outputRef: work.outputRef, repairAttempts: work.repairAttempts,
      evidence: freshness(work),
      steerSupported: work.state === 'RUNNING' && service.agentWork.supportsLiveSteer(work.workId),
      blockedReason: work.state === 'WAITING_HUMAN' ? 'waiting on human' : work.failureReason ?? null,
      updatedAt: work.updatedAt, revision: work.revision,
    };
  };
  app.get('/api/agent-work', async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    const {taskId} = z.strictObject({taskId: id}).parse(request.query);
    taskThread(taskId);
    return {
      enabled: true,
      roles: Object.fromEntries(roles.map(role => [role, service.agentWork.roleAvailability({threadId: taskId, runId: '', epoch: 0}, role)])),
      works: service.agentWork.listForParent(taskId).map(workRow),
      budget: service.agentWork.budgetLedger(),
      resources: store.all<{id: string; label: string; writable: boolean}>('resource', taskId).map(grant => ({id: grant.id, label: grant.label, writable: grant.writable})),
    };
  });
  app.get('/api/agent-work/output', async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    const {taskId, workId} = z.strictObject({taskId: id, workId: id}).parse(request.query);
    taskThread(taskId);
    const work = service.agentWork.inspect(workId);
    if (!work || work.parentOwner.threadId !== taskId) throw new HarnessError('NOT_FOUND', 'Work unavailable');
    const state = outputState(work);
    return {workId, outputRef: work.outputRef, output: state.current ? state.output!.value : null,
      reportedOutcome: state.reportedOutcome, verification: state.verification, outputStatus: state.outputStatus,
      evidence: evidenceDetails(work), lateArtifacts: service.agentWork.lateArtifacts(workId).length};
  });
  app.get('/api/agent-work/inputs', async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    const {taskId, targetThreadId} = z.strictObject({taskId: id, targetThreadId: id}).parse(request.query);
    taskThread(taskId);
    // Queued entries plus the recent non-queued history so the UI shows the
    // actual delivery status — never an optimistic Delivered.
    const all = (store.all<{inputId: string; taskId: string; targetOwner: {threadId: string}; kind: string; order: number; delivery: string; dedupeKey: string; error?: string; createdAt: string; updatedAt: string}>('agentInputV1'))
      .filter(record => record.taskId === taskId && record.targetOwner.threadId === targetThreadId)
      .sort((a, b) => a.order - b.order || a.inputId.localeCompare(b.inputId))
      .slice(-24);
    return {inputs: all.map(record => ({...record, text: service.agentWork.inbox.text(record.inputId), editable: record.delivery === 'ACCEPTED'}))};
  });
  app.get('/api/agent-work/messages', async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    const {taskId} = z.strictObject({taskId: id}).parse(request.query);
    taskThread(taskId);
    const title = (threadId: string) => store.get<Thread>('thread', threadId)?.title ?? threadId;
    return {messages: service.agentWork.inbox.messages(taskId).map(message => ({
      ...message, senderTitle: title(message.senderOwner.threadId), recipientTitle: title(message.recipientOwner.threadId),
    }))};
  });
  app.get('/api/agent-work/plan', async (request, reply) => {
    reply.header('Cache-Control', 'no-store');
    const {taskId} = z.strictObject({taskId: id}).parse(request.query);
    taskThread(taskId);
    const planId = `plan:${taskId}`;
    const extension = service.planExtensions.get(planId);
    if (!extension) return {extension: false, planId};
    const record = store.get<DataRecord>('data', planId);
    if (!record || record.provenance !== PLANNING_PROVENANCE || record.revision !== extension.canonicalRevision)
      return {extension: false, planId};
    const body = (record.value ?? {}) as {steps?: {id: string; status: string}[]; agents?: {id: string; status: string}[]};
    // Reported status stays verbatim: 'completed' here is reported completion,
    // not accepted verification, and an unlisted node is unknown — not pending.
    // Canonical step statuses: pending|working|completed|blocked; job statuses:
    // queued|working|completed|needs_review|failed|cancelled|interrupted.
    // Incomplete-and-continuable work is pending; 'cancelled' removes the work's
    // outcome, so those units are unknown until the plan re-allocates them.
    const continuable = ['pending', 'working', 'queued', 'in_progress', 'blocked', 'failed', 'interrupted', 'needs_review'];
    const statuses: Record<string, 'completed' | 'pending' | 'unknown'> = Object.fromEntries(
      [...(body.steps ?? []), ...(body.agents ?? [])]
        .map(node => [node.id, node.status === 'completed' || node.status === 'unknown' ? node.status
          : continuable.includes(node.status) ? 'pending' : 'unknown'] as const),
    ) as Record<string, 'completed' | 'pending' | 'unknown'>;
    const reported = Object.fromEntries([...(body.steps ?? []), ...(body.agents ?? [])].map(node => [node.id, node.status] as const));
    return {extension: true, planId, weights: extension.weights, parentRelationships: extension.parentRelationships,
      reportedStatuses: reported,
      progress: service.planExtensions.progress(planId, statuses)};
  });
}
