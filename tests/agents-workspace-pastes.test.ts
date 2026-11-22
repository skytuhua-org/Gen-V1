import {beforeEach, expect, it, vi} from 'vitest';
import {createSharedAgentComposers, type ParentSend} from '../apps/web/src/agents-workspace/composer';
import type {PastedText} from '../apps/web/src/pasted-text';
import type {AgentSummary} from '../packages/contracts/agent-inventory';

const records = vi.hoisted(() => new Map<string, {value: unknown; generation: string}>());
vi.mock('../apps/web/src/journal', () => ({
 journalEntries: async () => [...records].map(([key,record])=>({key,record})),
 journalReadRecord: async (key: string) => records.get(key),
 journalWrite: async (key: string, value: unknown) => {const generation = crypto.randomUUID(); records.set(key, {value, generation}); return generation;},
 journalGeneration: (key: string) => records.get(key)?.generation,
 journalSubscribe: () => () => {},
 journalCompareAndSwap: async (key: string, generation: string, value: unknown) => {if (records.get(key)?.generation !== generation) return false; records.set(key, {value, generation: crypto.randomUUID()}); return true;},
}));
beforeEach(() => records.clear());

const ID1='11111111-1111-4111-8111-111111111111',ID2='22222222-2222-4222-8222-222222222222';
const paste = (id = crypto.randomUUID(), text = 'pasted'): PastedText => ({version: 1, id, createdAt: '2026-01-01T00:00:00.000Z', text});
const target = {kind: 'conversation' as const, projectId: 'p', threadId: 'owner', modelId: 'model', working: false};
const store = () => createSharedAgentComposers({sendParent: vi.fn(async (_input: ParentSend) => {}), stopParent: async () => {}});

it('prepares pastes from the journal and emits them in state', async () => {
 const owner = store(), p = paste();
 records.set('draft-pastes:owner', {value: [p], generation: 'g1'});
 await owner.prepare(target);
 expect(owner.getSnapshot(target).pastes).toEqual([p]);
 owner.dispose();
});
it('adds, edits and removes pastes with CAS persistence', async () => {
 const owner = store();
 await owner.prepare(target);
 await owner.addPaste(target, paste(ID1, 'first'));
 expect(records.get('draft-pastes:owner')?.value).toEqual([paste(ID1, 'first')]);
 await owner.editPaste(target, ID1, 'changed');
 expect((records.get('draft-pastes:owner')?.value as PastedText[])[0]?.text).toBe('changed');
 await owner.removePaste(target, ID1);
 expect(records.get('draft-pastes:owner')?.value).toEqual([]);
 owner.dispose();
});
it('serializes pasted text after typed content into the submission', async () => {
 const send = vi.fn(async (_input: ParentSend) => {});
 const owner = createSharedAgentComposers({sendParent: send, stopParent: async () => {}});
 await owner.prepare(target);
 await owner.edit(target, 'Typed question');
 await owner.addPaste(target, paste(ID1, 'line one\nline two'));
 await owner.submit(target);
 expect(send).toHaveBeenCalledTimes(1);
 expect(send.mock.calls[0][0].content).toBe('Typed question\n\nPasted text · 2 lines\nline one\nline two\nEnd pasted text');
 expect(records.get('draft-pastes:owner')?.value).toEqual([]);
 expect(owner.getSnapshot(target).pastes).toEqual([]);
 owner.dispose();
});
it('sends with only a paste and no typed draft', async () => {
 const send = vi.fn(async (_input: ParentSend) => {});
 const owner = createSharedAgentComposers({sendParent: send, stopParent: async () => {}});
 await owner.prepare(target);
 await owner.addPaste(target, paste(ID1, 'just this'));
 await owner.submit(target);
 expect(send).toHaveBeenCalledTimes(1);
 expect(send.mock.calls[0][0].content).toBe('Pasted text · 1 line\njust this\nEnd pasted text');
 owner.dispose();
});
it('keeps the frozen paste payload when a pending send is retried', async () => {
 const pending = {commandId: 'cmd', content: 'Frozen\n\nPasted text · 1 line\nold\nEnd pasted text', generation: 'g', pastes: [paste(ID1, 'old')], pasteGeneration: 'pg'};
 records.set('agents-pending:owner', {value: pending, generation: 'pg'});
 records.set('draft-pastes:owner', {value: [paste(ID2, 'newer')], generation: 'g2'});
 const send = vi.fn(async (_input: ParentSend) => {});
 const owner = createSharedAgentComposers({sendParent: send, stopParent: async () => {}});
 await owner.prepare(target);
 await owner.submit(target);
 expect(send).toHaveBeenCalledTimes(1);
 expect(send.mock.calls[0][0].content).toBe('Frozen\n\nPasted text · 1 line\nold\nEnd pasted text');
 owner.dispose();
});
it('rejects pastes on a side-question composer', async () => {
 const child = {agentId: 'c', parentId: 'p', rootId: 'r', jobId: null, threadId: 'c', projectId: 'p', projectName: 'P', title: 'c', status: 'working', modelId: 'm', currentAction: null, reportedPercent: null, createdAt: '', updatedAt: '', orderKey: 'c', revision: 1, archived: false, readOnly: false, metadata: 'thread'} as AgentSummary;
 const owner = store();
 await expect(owner.addPaste(child, paste())).rejects.toThrow('unavailable');
 owner.dispose();
});
it('surfaces a recovery error for unreadable paste drafts', async () => {
 const owner = store();
 records.set('draft-pastes:owner', {value: 'corrupt', generation: 'g'});
 await owner.prepare(target);
 expect(owner.getSnapshot(target).ready).toBe(false);
 owner.dispose();
});
