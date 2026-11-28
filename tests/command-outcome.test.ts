// Reconciling command outcomes across a renderer transport failure (#1968):
// a dropped reply after the host committed must retry under the SAME command
// id so the host dedup resolves the recorded receipt instead of writing twice.
import {afterEach, beforeEach, expect, it, vi} from 'vitest';

beforeEach(() => vi.resetModules());
afterEach(() => vi.unstubAllGlobals());

const bootstrap = {csrfToken: 'token', widgetOrigin: 'http://localhost:4318'};

// In-memory command ledger mirroring Store.command: identical id+body returns
// the recorded receipt; the same id under a different body is rejected.
function host() {
  const committed = new Map<string, {body: string; receipt: unknown}>();
  const state = {executions: 0, transportDown: false};
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url === '/api/bootstrap') return Response.json(bootstrap);
    if (url === '/api/commands') {
      const body = String(init?.body);
      const command = JSON.parse(body);
      const seen = committed.get(command.id);
      if (seen) {
        if (seen.body !== body) return Response.json({error: {code: 'COMMAND_ID_REUSED', message: 'id reused'}}, {status: 409});
        if (state.transportDown) throw new TypeError('fetch failed');
        return Response.json(seen.receipt);
      }
      state.executions += 1; // the host commits before the reply leaves
      committed.set(command.id, {body, receipt: {commandId: command.id, eventSeq: state.executions, result: {ok: true}}});
      if (state.transportDown) throw new TypeError('fetch failed');
      return Response.json(committed.get(command.id)!.receipt);
    }
    return Response.json({});
  }));
  return state;
}

it('binds one command id to an unchanged command and releases it on settle', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({})));
  const {commandIdentity} = await import('../apps/web/src/api.ts');
  const identity = commandIdentity();
  const send = {type: 'message.send', threadId: 't-1', payload: {content: 'hello', modelId: 'm'}};
  const id = identity.issue(send);
  expect(identity.issue(send)).toBe(id);
  expect(identity.issue({...send, threadId: 't-2'})).not.toBe(id);
  expect(identity.issue({...send, payload: {content: 'edited', modelId: 'm'}})).not.toBe(id);
  expect(identity.issue({...send, type: 'run.stop'})).not.toBe(id);
  const changed = identity.issue({...send, payload: {content: 'edited', modelId: 'm'}});
  identity.settle();
  expect(identity.issue({...send, payload: {content: 'edited', modelId: 'm'}})).not.toBe(changed);
});

it('resolves a dropped write to the recorded receipt on a same-identity retry', async () => {
  const state = host();
  const api = await import('../apps/web/src/api.ts');
  const identity = api.commandIdentity();
  const send = () => api.command('message.send', {content: 'hello', modelId: 'm'}, 't-1', identity.issue({type: 'message.send', threadId: 't-1', payload: {content: 'hello', modelId: 'm'}}));

  // Host commits; the reply and the in-command retry both die in transit.
  state.transportDown = true;
  await expect(send()).rejects.toThrow();
  expect(state.executions).toBe(1);

  // The retained submission retries under the same identity once transport
  // recovers: the host returns the recorded receipt — one effect, known outcome.
  state.transportDown = false;
  const receipt = await send();
  identity.settle();
  expect(receipt).toMatchObject({commandId: expect.any(String), eventSeq: 1});
  expect(state.executions).toBe(1);
});

it('keeps the outcome unknown while transport stays down instead of writing twice', async () => {
  const state = host();
  const api = await import('../apps/web/src/api.ts');
  const identity = api.commandIdentity();
  const send = () => api.command('message.send', {content: 'hello', modelId: 'm'}, 't-1', identity.issue({type: 'message.send', threadId: 't-1', payload: {content: 'hello', modelId: 'm'}}));

  state.transportDown = true;
  await expect(send()).rejects.toThrow();
  await expect(send()).rejects.toThrow(); // caller retry under the same identity
  expect(state.executions).toBe(1); // deduplicated server-side, still unresolved

  state.transportDown = false;
  await expect(send()).resolves.toMatchObject({eventSeq: 1});
  expect(state.executions).toBe(1);
});

it('issues a fresh id for a changed submission so a deliberate resend still writes', async () => {
  const state = host();
  const api = await import('../apps/web/src/api.ts');
  const identity = api.commandIdentity();
  const send = (content: string) => api.command('message.send', {content, modelId: 'm'}, 't-1', identity.issue({type: 'message.send', threadId: 't-1', payload: {content, modelId: 'm'}}));

  await send('first'); identity.settle();
  await send('first edited'); identity.settle();
  expect(state.executions).toBe(2); // different submissions are distinct writes
});

it('still rejects a reused id under a different body', async () => {
  const state = host();
  const api = await import('../apps/web/src/api.ts');
  const commandId = crypto.randomUUID();
  await api.command('message.send', {content: 'first'}, 't-1', commandId);
  await expect(api.command('message.send', {content: 'different'}, 't-1', commandId)).rejects.toMatchObject({code: 'COMMAND_ID_REUSED'});
  expect(state.executions).toBe(1);
});
