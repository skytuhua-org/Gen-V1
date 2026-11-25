import type { Message, RuntimeUsage, Snapshot, WorkspaceEvent } from '../../../packages/contracts';
import { MODEL_REQUEST_OBSERVATION_LIMIT, type ModelRequestObservationV1 } from '../../../packages/contracts/model-request';

// Patch the cached snapshot for the streaming-runtime event kinds whose
// payloads carry the upserted entity. Anything structural (thread status,
// artifacts, requests, outbox, settled) returns null so the caller refetches
// the whole snapshot once per real change instead of once per chunk.
export function applyRuntimeEvent(snapshot: Snapshot, event: WorkspaceEvent): Snapshot | null {
  if (!event.threadId || !event.type.startsWith('runtime.')) return null;
  // A snapshot already past this event carries its change. Patching anyway
  // would regress seq, letting an older refresh clobber a newer one.
  if (event.seq <= snapshot.seq) return snapshot;
  const result = (event.payload as { result?: unknown } | null)?.result;
  if (!result || typeof result !== 'object') return null;
  if (event.type === 'runtime.assistant.delta' || event.type === 'runtime.assistant.message' || event.type === 'runtime.activity') {
    const message = (result as { message?: Message }).message;
    if (!message || typeof message.id !== 'string' || message.threadId !== event.threadId) return null;
    const known = snapshot.messages.some(item => item.id === message.id);
    const messages = known ? snapshot.messages.map(item => item.id === message.id ? message : item) : insertByCreatedAt(snapshot.messages, message);
    // A stream append retains the current rows. Only a fresh host snapshot
    // replaces the window and can change how many older rows are hidden.
    // A late event for an earlier row is inserted in createdAt order so the
    // transcript stays ordered and paging does not develop a permanent gap.
    return { ...snapshot, seq: event.seq, messages };
  }
  if (event.type === 'runtime.usage' || event.type === 'runtime.context.request' || event.type === 'runtime.context.host' || event.type === 'runtime.compaction.start' || event.type === 'runtime.compaction.end') {
    const usage = (result as { usage?: RuntimeUsage }).usage;
    if (!usage || typeof usage !== 'object') return null;
    return { ...snapshot, seq: event.seq, usage: { ...snapshot.usage, [event.threadId]: usage } };
  }
  if (event.type === 'runtime.model.observation') {
    const observation = (result as { modelRequest?: ModelRequestObservationV1 }).modelRequest;
    if (!observation || observation.owner?.threadId !== event.threadId || typeof observation.requestId !== 'string') return null;
    const requests = { ...(snapshot.modelRequests ?? {}) };
    const list = requests[event.threadId] ?? [];
    const exists = list.some(item => item.requestId === observation.requestId);
    // SQLite updates the existing row in place. The event projection must
    // retain that order so the same request ages out on update and reload.
    requests[event.threadId] = exists
      ? list.map(item => item.requestId === observation.requestId ? observation : item)
      : [...list, observation].slice(-MODEL_REQUEST_OBSERVATION_LIMIT);
    return { ...snapshot, seq: event.seq, modelRequests: requests };
  }
  return null;
}

// Compare createdAt only. Ids are random, not chronological: tiebreaking on
// id would invert the stream order of same-timestamp appends. Ties insert
// after the existing row, which is the streaming order they arrived in.
const compareByCreatedAt = (left: Message, right: Message) =>
  left.createdAt < right.createdAt ? -1 : left.createdAt > right.createdAt ? 1 : 0;

function insertByCreatedAt(messages: Message[], message: Message): Message[] {
  let index = messages.length;
  while (index > 0 && compareByCreatedAt(messages[index - 1]!, message) > 0) index--;
  return [...messages.slice(0, index), message, ...messages.slice(index)];
}
