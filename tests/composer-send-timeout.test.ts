import {afterEach, beforeEach, expect, it, vi} from 'vitest';
import {createSharedAgentComposers, type ParentSend} from '../apps/web/src/agents-workspace/composer';
import type {AgentSummary} from '../packages/contracts/agent-inventory';
const agent = (id: string, patch: Partial<AgentSummary> = {}): AgentSummary => ({agentId: id, parentId: null, rootId: id, jobId: null, threadId: id, projectId: 'p', projectName: 'Project', title: id, status: 'working', modelId: 'model', currentAction: null, reportedPercent: null, createdAt: '', updatedAt: '', orderKey: id, revision: 1, archived: false, readOnly: false, metadata: 'thread', ...patch});
const records = vi.hoisted(() => new Map<string, {value: unknown; generation: string}>());
const persistence = vi.hoisted(() => ({pending: undefined as undefined | (() => Promise<void>)}));
vi.mock('../apps/web/src/journal', () => ({
 journalEntries: async () => [...records].map(([key, record]) => ({key, record})),
 journalReadRecord: async (key: string) => records.get(key),
 journalWrite: async (key: string, value: unknown) => {const generation = crypto.randomUUID(); records.set(key, {value, generation}); if (key.startsWith('agents-pending:') && value) await persistence.pending?.(); return generation;},
 journalGeneration: (key: string) => records.get(key)?.generation,
 journalSubscribe: () => () => {},
 journalCompareAndSwap: async (key: string, generation: string, value: unknown) => {if (records.get(key)?.generation !== generation) return false; records.set(key, {value, generation: crypto.randomUUID()}); return true;},
}));
beforeEach(() => {records.clear(); persistence.pending = undefined; vi.useFakeTimers();});
afterEach(() => {vi.useRealTimers();});
const stalled = () => new Promise<void>(() => {});
it('times out a stalled send at 120 seconds with a retryable error and keeps the draft and pending record', async () => {
 const send = vi.fn((_input: ParentSend) => stalled()), owner = createSharedAgentComposers({sendParent: send, stopParent: async () => {}}), a = agent('a');
 await owner.prepare(a); await owner.edit(a, 'First');
 const sending = owner.submit(a);
 await vi.waitFor(() => expect(send).toHaveBeenCalledTimes(1));
 expect(owner.getSnapshot(a)).toMatchObject({busy: true, error: ''});
 await vi.advanceTimersByTimeAsync(120000); await sending;
 expect(owner.getSnapshot(a)).toMatchObject({busy: false, error: 'Send timed out after 2 minutes. Retry this message.', retry: true, draft: 'First'});
 expect(records.get('agents-pending:a')?.value).toMatchObject({content: 'First'});
 owner.dispose();
});
it('cancels an in-flight send, keeps the draft and pending record, and retries with the same command id', async () => {
 const send = vi.fn((_input: ParentSend) => stalled()), owner = createSharedAgentComposers({sendParent: send, stopParent: async () => {}}), a = agent('a');
 await owner.prepare(a); await owner.edit(a, 'First');
 const sending = owner.submit(a);
 await vi.waitFor(() => expect(send).toHaveBeenCalledTimes(1));
 owner.cancel(a); await sending;
 expect(owner.getSnapshot(a)).toMatchObject({busy: false, error: 'Send canceled. Your draft was kept.', retry: true, draft: 'First'});
 expect(records.get('agents-pending:a')?.value).toMatchObject({content: 'First'});
 send.mockImplementation(async () => {});
 await owner.submit(a);
 expect(send.mock.calls[1][0].commandId).toBe(send.mock.calls[0][0].commandId);
 expect(owner.getSnapshot(a)).toMatchObject({error: '', retry: false});
 owner.dispose();
});
it('forwards an AbortSignal to the parent transport', async () => {
 const send = vi.fn((_input: ParentSend) => stalled()), owner = createSharedAgentComposers({sendParent: send, stopParent: async () => {}}), a = agent('a');
 await owner.prepare(a); await owner.edit(a, 'First');
 const sending = owner.submit(a);
 await vi.waitFor(() => expect(send).toHaveBeenCalledTimes(1));
 const signal = send.mock.calls[0][0].signal;
 expect(signal).toBeInstanceOf(AbortSignal); expect(signal!.aborted).toBe(false);
 owner.cancel(a); expect(signal!.aborted).toBe(true); await sending; owner.dispose();
});
it('is a no-op when no send is in flight', async () => {
 const owner = createSharedAgentComposers({sendParent: async () => {}, stopParent: async () => {}}), a = agent('a');
 await owner.prepare(a); owner.cancel(a);
 expect(owner.getSnapshot(a)).toMatchObject({busy: false, error: ''}); owner.dispose();
});
it.each(['cancel', 'timeout'] as const)('%s during pending persistence retains the draft and never dispatches the cancelled send', async kind => {
 let finishWrite!: () => void;
 const heldWrite = new Promise<void>(resolve => {finishWrite = resolve;}), entered = vi.fn(() => heldWrite);
 persistence.pending = entered;
 const send = vi.fn(async (_input: ParentSend) => {}), owner = createSharedAgentComposers({sendParent: send, stopParent: async () => {}}), a = agent('a');
 await owner.prepare(a); await owner.edit(a, 'Retained message');
 const sending = owner.submit(a);
 try {
  await vi.waitFor(() => expect(entered).toHaveBeenCalledTimes(1));
  const commandId = (records.get('agents-pending:a')?.value as {commandId: string}).commandId;
  if (kind === 'cancel') owner.cancel(a); else await vi.advanceTimersByTimeAsync(120000);
  await vi.waitFor(() => expect(owner.getSnapshot(a).busy).toBe(false));
  expect(owner.getSnapshot(a)).toMatchObject({draft: 'Retained message', retry: true, error: kind === 'cancel' ? 'Send canceled. Your draft was kept.' : 'Send timed out after 2 minutes. Retry this message.'});
  expect(send).not.toHaveBeenCalled();
  finishWrite(); await sending;
  expect(send).not.toHaveBeenCalled();
  expect(records.get('agents-pending:a')?.value).toMatchObject({commandId, content: 'Retained message'});
  persistence.pending = undefined;
  await owner.submit(a);
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0].commandId).toBe(commandId);
  expect(owner.getSnapshot(a)).toMatchObject({draft: '', busy: false, retry: false, error: ''});
 } finally {finishWrite(); await sending; owner.dispose();}
});
