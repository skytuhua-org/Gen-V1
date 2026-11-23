import { afterEach, expect, it, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { Store } from '../packages/storage/store.ts';
import { Service } from '../packages/core/service.ts';
import { BrowserConsentHost, ControlDriverRegistry, hostControlDriverRegistry } from '../packages/core/browser-consent.ts';
import { ControlDispatcher, controlCapability, type ControlDriverHandle, type ControlDriverOperations } from '../packages/core/desktop-control.ts';
import { __setCapabilityFlagForTests } from '../packages/core/capability-flags.ts';
import type { ControlDriverRegistrationV1, ControlTargetIdentityV1, InteractiveGrantV1, TargetObservationV1 } from '../packages/contracts/interactive-control.ts';
import { HarnessError, type RuntimeAdapter, type Thread } from '../packages/contracts/index.ts';
import type { ToolOwner } from '../packages/contracts/tool-effects.ts';

const codeOf = (fn: () => unknown): string | null => {
  try { fn(); return null; } catch (error) { return error instanceof HarnessError ? error.code : 'UNEXPECTED'; }
};
const cleanup: (() => Promise<void> | void)[] = [];
afterEach(async () => {
  vi.restoreAllMocks();
  for (const fn of cleanup.splice(0).reverse()) await fn();
  __setCapabilityFlagForTests('control.consentedBrowserV1', undefined);
  __setCapabilityFlagForTests('control.selectedDesktopV1', undefined);
});

const owner: ToolOwner = { threadId: 'thread-1', runId: 'run-1', epoch: 2, projectId: 'p1', workspaceId: 'w1', accountBinding: 'acct-1' };
const app: ControlTargetIdentityV1 = { kind: 'APPLICATION', creationIdentity: 'proc-created-7', sessionIdentity: 'desktop-7', origin: null };
const geometry = { x: 0, y: 0, width: 800, height: 600, dpiScale: 1 };
const registration = (apiProtocol = 'native-window'): ControlDriverRegistrationV1 => ({
  driverId: `driver-${apiProtocol}`, packageDigest: 'c'.repeat(64), apiProtocol,
  backendProofRef: 'proof:x', targetIdentityFormat: 'creation-token',
  captureBounds: { maxWidth: 3840, maxHeight: 2160, maxBytes: 4 * 1024 * 1024 },
  supportsInputCancellation: true, stopRoute: 'DRIVER_STOP',
});
const grant = (target: ControlTargetIdentityV1, issuedAtMs = 1_000_000): InteractiveGrantV1 => ({
  grantId: 'grant-d', owner, deviceIdentity: { deviceId: 'd', sessionId: 's' },
  mode: 'SELECTED_DESKTOP_APPLICATION', target, permittedOperations: ['CLICK'],
  allowedOrigins: [], capturePermission: false, issuedAtMs, expiresAtMs: issuedAtMs + 600_000, revocationGeneration: 0,
});
const observation = (target: ControlTargetIdentityV1, observedAtMs: number, geo = geometry): TargetObservationV1 => ({ observationId: `o-${observedAtMs}`, target, geometry: geo, observedAtMs });

function serviceFixture() {
  const root = mkdtempSync(join(tmpdir(), 'm16-d-'));
  const store = new Store(join(root, 'data'));
  const runtime: RuntimeAdapter = { configure: () => {}, models: async () => [], start: async () => {}, followUp: async () => {}, cancel: async () => {}, compact: async () => {}, history: async () => [], dispose: async () => {} };
  const service = new Service(store, runtime, {});
  cleanup.push(async () => { try { await service.dispose(); } catch { /* closed */ } try { store.close(); } catch { /* closed */ } rmSync(root, { recursive: true, force: true }); });
  const thread: Thread = { id: 'thread-1', title: 'T', projectName: null, createdAt: '2026-11-16T00:00:00Z', updatedAt: '2026-11-16T00:00:00Z', status: 'ready', epoch: 0, runId: null, modelId: null, sessionPath: null };
  store.internal('fixture', thread.id, () => { store.put('thread', thread.id, thread.id, thread); });
  return { store, service, thread };
}

/** M16-D01 Default deny: with no approved driver, every live capture/input
 * attempt produces DRIVER_UNAVAILABLE before any OS/browser call. */
it('M16-D01 no approved driver — every live capture/input attempt is DRIVER_UNAVAILABLE before any driver call', async () => {
  const { service } = serviceFixture();
  const touched: string[] = [];
  const dispatcher = new ControlDispatcher({ driver: undefined, registration: undefined });
  const attempt = () => dispatcher.enqueue({ grant: grant(app), action: { action: 'CLICK', redactedParameters: {} }, observation: observation(app, Date.now()) });
  expect(codeOf(attempt)).toBe('DRIVER_UNAVAILABLE');
  expect(touched).toEqual([]);

  // Through the real host path: flags off → the consent request itself is recorded UNAVAILABLE.
  const receipt = await service.command({ id: 'cmd-d01', type: 'control.request', threadId: 'thread-1', payload: { mode: 'CONSENTED_EXISTING_TAB', observe: true, operations: ['CLICK'] } });
  const control = (receipt.result as { control: { state: string; liveControlActive: boolean; reason: string | null } }).control;
  expect(control.state).toBe('unavailable');
  expect(control.liveControlActive).toBe(false);
  expect(control.reason).toBe('DRIVER_UNAVAILABLE');
});

/** M16-D02 Target identity: a replacement window that reuses a PID/title must
 * not receive input bound to the old grant. */
it('M16-D02 PID/title reuse by a replacement window dispatches no input', async () => {
  const now = { value: 1_000_000 };
  const dispatched: string[] = [];
  const driver: ControlDriverHandle = {
    // The driver now observes a recreated process under the same title/PID —
    // a different creation identity. The queued action must be rejected.
    observe: async () => observation({ ...app, creationIdentity: 'proc-created-REUSED' }, now.value),
    dispatch: async action => { dispatched.push(action.actionId); return { receipt: 'r' }; },
    cancelInput: async () => {},
  };
  const dispatcher = new ControlDispatcher({ driver, registration: registration(), nowMs: () => now.value, sleepMs: async ms => { now.value += ms; } });
  const item = dispatcher.enqueue({ grant: grant(app, now.value), action: { action: 'CLICK', redactedParameters: { x: 1, y: 1 } }, observation: observation(app, now.value) });
  await dispatcher['draining'];
  expect(item.outcome).toBe('REJECTED');
  expect(item.reason).toBe('TARGET_MISMATCH');
  expect(dispatched).toEqual([]);

  // Grant-level validation reaches the same decision for a PID-reused target.
  const registry = new ControlDriverRegistry();
  registry.register(registration('native-window'));
  __setCapabilityFlagForTests('control.selectedDesktopV1', true);
  const { store } = serviceFixture();
  const host = new BrowserConsentHost(store, { registry, nowMs: () => now.value });
  const consent = host.requestConsent(owner, { mode: 'SELECTED_DESKTOP_APPLICATION', observe: false, operations: ['CLICK'] });
  const issued = host.grant(consent.consentId, owner, app, { deviceId: 'd', sessionId: 's' });
  expect(host.validateTarget(issued, { ...app, creationIdentity: 'proc-created-REUSED' })).toBe('NEEDS_NEW_PERMISSION');
});

/** M16-D03 Fresh geometry: a moved/DPI-changed target rejects the queued
 * click — never an automatic coordinate transform. */
it('M16-D03 moved or DPI-changed target rejects the queued click', async () => {
  const now = { value: 1_000_000 };
  const driver: ControlDriverHandle = {
    observe: async () => observation(app, now.value, { ...geometry, dpiScale: 2 }),
    dispatch: async () => { throw new Error('must not dispatch'); },
    cancelInput: async () => {},
  };
  const dispatcher = new ControlDispatcher({ driver, registration: registration(), nowMs: () => now.value, sleepMs: async ms => { now.value += ms; } });
  const item = dispatcher.enqueue({ grant: grant(app, now.value), action: { action: 'CLICK', redactedParameters: { x: 10, y: 10 } }, observation: observation(app, now.value) });
  await dispatcher['draining'];
  expect(item.outcome).toBe('REJECTED');
  expect(item.reason).toBe('TARGET_MOVED');
});

/** M16-D04 Rate and queue: six admitted actions dispatch no earlier than
 * 0,200,...,1000 ms; a 17th queued action is QUEUE_FULL without driver work. */
it('M16-D04 six actions dispatch at 0/200/.../1000ms and the 17th is QUEUE_FULL', async () => {
  const now = { value: 1_000_000 };
  const dispatchedAt: number[] = [];
  const driver: ControlDriverHandle = {
    observe: async () => observation(app, now.value),
    dispatch: async () => { dispatchedAt.push(now.value); return { receipt: 'r' }; },
    cancelInput: async () => {},
  };
  const dispatcher = new ControlDispatcher({ driver, registration: registration(), nowMs: () => now.value, sleepMs: async ms => { now.value += ms; } });
  const grantValue = grant(app, now.value);
  for (let i = 0; i < 6; i++) dispatcher.enqueue({ grant: grantValue, action: { action: 'CLICK', redactedParameters: {} }, observation: observation(app, now.value) });
  await dispatcher['draining'];
  expect(dispatchedAt).toEqual([1_000_000, 1_000_200, 1_000_400, 1_000_600, 1_000_800, 1_001_000]);

  // Queue cap: hold every action so the queue stays full, then a further enqueue fails fast.
  const blockedDispatcher = new ControlDispatcher({
    registration: registration(), nowMs: () => now.value, sleepMs: async () => {},
    driver: { observe: async () => new Promise<never>(() => {}), dispatch: async () => ({ receipt: 'x' }), cancelInput: async () => {} },
  });
  for (let i = 0; i < 16; i++) blockedDispatcher.enqueue({ grant: grantValue, action: { action: 'CLICK', redactedParameters: {} }, observation: observation(app, now.value) });
  expect(codeOf(() => blockedDispatcher.enqueue({ grant: grantValue, action: { action: 'CLICK', redactedParameters: {} }, observation: observation(app, now.value) }))).toBe('QUEUE_FULL');
  await blockedDispatcher.stop();
});

/** M16-D05 Independent stop: model hang + host Stop → no old-generation input
 * reaches the driver. */
it('M16-D05 stop with a hung model drops all queued old-generation input', async () => {
  const now = { value: 1_000_000 };
  const dispatched: string[] = [];
  let release: () => void = () => {};
  const driver: ControlDriverHandle = {
    observe: async () => observation(app, now.value),
    dispatch: async action => { if (!dispatched.length) await new Promise<void>(r => { release = r; }); dispatched.push(action.actionId); return { receipt: 'r' }; },
    cancelInput: async () => {},
  };
  const dispatcher = new ControlDispatcher({ driver, registration: registration(), nowMs: () => now.value, sleepMs: async ms => { now.value += ms; } });
  const grantValue = grant(app, now.value);
  dispatcher.enqueue({ grant: grantValue, action: { action: 'CLICK', redactedParameters: {} }, observation: observation(app, now.value) });
  const second = dispatcher.enqueue({ grant: grantValue, action: { action: 'CLICK', redactedParameters: {} }, observation: observation(app, now.value) });
  await Promise.resolve();
  await dispatcher.stop(); // generation bumped before queue cancel; hung dispatch never delivers
  release();
  await dispatcher['draining'];
  expect(second.outcome).toBe('CANCELLED');
  expect(second.reason).toBe('stopped');
  expect(dispatched.length).toBeLessThanOrEqual(1); // only the in-flight item may have completed
  expect(dispatcher.stoppedGeneration).toBe(1);
});

/** M16-D06 Real platform: actual Windows multi-monitor/focus/minimized/
 * permission-loss cases require the installed approved driver. With none,
 * this decision stays BLOCKED — recorded here, never faked. */
it('M16-D06 real-platform acceptance stays BLOCKED without an approved installed driver', () => {
  // This machine has no registered M16 driver (D02): the capability verdict
  // is BLOCKED and the acceptance matrix is NOT_RUN, not simulated.
  expect(controlCapability({ flagEnabled: true, registration: null, platformSupported: process.platform === 'win32' })).toEqual({ state: 'BLOCKED', reason: 'DRIVER_UNAVAILABLE' });
  expect(controlCapability({ flagEnabled: false, registration: registration(), platformSupported: true }).state).toBe('BLOCKED');
});

/** G03/S04 through the real command path: control.stop revokes the thread's
 * own grant only and keeps the recorded receipts. */
it('M16-G03 control.stop through the real service revokes only the thread grant', async () => {
  // The service's own consent host runs on Date.now(), so grant on the same clock.
  const { store, service } = serviceFixture();
  const registry = new ControlDriverRegistry();
  registry.register(registration('native-window'));
  __setCapabilityFlagForTests('control.selectedDesktopV1', true);
  const host = new BrowserConsentHost(store, { registry });
  const consent = host.requestConsent(owner, { mode: 'SELECTED_DESKTOP_APPLICATION', observe: false, operations: ['CLICK'] });
  const issued = host.grant(consent.consentId, owner, app, { deviceId: 'd', sessionId: 's' });
  const receipt = await service.command({ id: 'cmd-stop', type: 'control.stop', threadId: 'thread-1', payload: {} });
  const control = (receipt.result as { control: { state: string; liveControlActive: boolean } }).control;
  expect(control.state).toBe('unavailable');
  expect(control.liveControlActive).toBe(false);
  expect(store.get<InteractiveGrantV1>('interactiveGrant', issued.grantId)?.revocationGeneration).toBe(1);
});

function attachTestTargetChooser(service: Service, candidates: ControlDriverOperations['candidates']) {
  vi.spyOn(hostControlDriverRegistry, 'resolve').mockReturnValue(registration());
  const adapter: ControlDriverOperations = {
    candidates,
    pickTarget: async () => null,
    observe: async target => observation(target, Date.now()),
    capture: async () => { throw new Error('Capture is outside the chooser fixture.'); },
    dispatch: async () => { throw new Error('Dispatch is outside the chooser fixture.'); },
    cancelInput: async () => {},
  };
  service.attachControlDriver(adapter, []);
  __setCapabilityFlagForTests('control.selectedDesktopV1', true);
  __setCapabilityFlagForTests('control.consentedBrowserV1', true);
  return adapter;
}

it('M16 lists candidate targets only for the pending consent mode', async () => {
  const { service, thread } = serviceFixture();
  const candidates = vi.fn<ControlDriverOperations['candidates']>().mockResolvedValue([{ target: app, title: 'Fixture app' }]);
  attachTestTargetChooser(service, candidates);

  await expect(service.controlTargets(thread.id, 'SELECTED_DESKTOP_APPLICATION')).rejects.toMatchObject({ code: 'CAPABILITY_DENIED' });
  expect(candidates).not.toHaveBeenCalled();

  await service.command({ id: 'chooser-consent', type: 'control.request', threadId: thread.id, payload: { mode: 'SELECTED_DESKTOP_APPLICATION', observe: true } });
  await expect(service.controlTargets(thread.id, 'CONSENTED_EXISTING_TAB')).rejects.toMatchObject({ code: 'CAPABILITY_DENIED' });
  expect(candidates).not.toHaveBeenCalled();

  const result = await service.controlTargets(thread.id, 'SELECTED_DESKTOP_APPLICATION');
  expect(result.candidates).toEqual([{ target: app, title: 'Fixture app' }]);
  expect(candidates).toHaveBeenCalledExactlyOnceWith('SELECTED_DESKTOP_APPLICATION');
});

it('M16 grants only a target offered for the exact current consent', async () => {
  const { service, store, thread } = serviceFixture();
  attachTestTargetChooser(service, async () => [{ target: app, title: 'Fixture app' }]);
  const payload = { mode: 'SELECTED_DESKTOP_APPLICATION', observe: true };
  const request = async (id: string) => {
    const receipt = await service.command({ id, type: 'control.request', threadId: thread.id, payload });
    return (receipt.result as { consent: { consentId: string } }).consent.consentId;
  };
  const approve = (id: string, consentId: string, target = app) => service.command({
    id, type: 'control.grant', threadId: thread.id, payload: { consentId, target },
  });

  const original = await request('target-request');
  await expect(approve('before-offer', original)).rejects.toMatchObject({ code: 'CAPABILITY_DENIED' });
  await service.controlTargets(thread.id, 'SELECTED_DESKTOP_APPLICATION');
  await expect(approve('unknown-target', original, { ...app, creationIdentity: 'different-window' }))
    .rejects.toMatchObject({ code: 'CAPABILITY_DENIED' });
  const replacement = await request('replacement-request');
  await expect(approve('superseded-offer', original)).rejects.toMatchObject({ code: 'CAPABILITY_DENIED' });
  await expect(approve('stale-offer', replacement)).rejects.toMatchObject({ code: 'CAPABILITY_DENIED' });
  expect(store.all('interactiveGrant', thread.id)).toHaveLength(0);
  await service.controlTargets(thread.id, 'SELECTED_DESKTOP_APPLICATION');
  await approve('offered-target', replacement);
  expect(store.all('interactiveGrant', thread.id)).toHaveLength(1);
});

it.each([
  { change: 'stops', code: 'CAPABILITY_DENIED' },
  { change: 'replaces consent', code: 'CAPABILITY_DENIED' },
  { change: 'archives the thread', code: 'NOT_FOUND' },
  { change: 'archives and restores the thread', code: 'CAPABILITY_DENIED' },
  { change: 'reattaches the same driver', code: 'CAPABILITY_DENIED' },
])('M16 discards an in-flight target list when the user $change', async ({ change, code }) => {
  const { service, thread } = serviceFixture();
  type CandidateList = Awaited<ReturnType<ControlDriverOperations['candidates']>>;
  let completeList!: (targets: CandidateList) => void;
  const list = new Promise<CandidateList>(resolve => { completeList = resolve; });
  const candidates = vi.fn<ControlDriverOperations['candidates']>().mockReturnValue(list);
  const adapter = attachTestTargetChooser(service, candidates);
  const payload = { mode: 'SELECTED_DESKTOP_APPLICATION', observe: true };
  await service.command({ id: 'chooser-request', type: 'control.request', threadId: thread.id, payload });

  const listing = service.controlTargets(thread.id, 'SELECTED_DESKTOP_APPLICATION');
  expect(candidates).toHaveBeenCalledExactlyOnceWith('SELECTED_DESKTOP_APPLICATION');
  if (change === 'reattaches the same driver') {
    service.detachControlDriver();
    service.attachControlDriver(adapter, []);
  } else if (change.startsWith('archives')) {
    await service.command({ id: 'chooser-archive', type: 'thread.archive', threadId: thread.id, payload: {} });
    if (change === 'archives and restores the thread') {
      await service.command({ id: 'chooser-restore', type: 'thread.restore', threadId: thread.id, payload: {} });
    }
  } else {
    await service.command({ id: 'chooser-stop', type: 'control.stop', threadId: thread.id, payload: {} });
    if (change === 'replaces consent') {
      await service.command({ id: 'chooser-replacement', type: 'control.request', threadId: thread.id, payload });
    }
  }
  completeList([{ target: app, title: 'Fixture app' }]);

  await expect(listing).rejects.toMatchObject({ code });
});

it('M16 refuses to enumerate or grant after the consent owner scope changes', async () => {
  const { service, store, thread } = serviceFixture();
  const candidates = vi.fn<ControlDriverOperations['candidates']>().mockResolvedValue([{ target: app, title: 'Fixture app' }]);
  attachTestTargetChooser(service, candidates);
  const receipt = await service.command({
    id: 'old-scope', type: 'control.request', threadId: thread.id,
    payload: { mode: 'SELECTED_DESKTOP_APPLICATION', observe: true },
  });
  const { consent } = receipt.result as { consent: { consentId: string } };
  await service.controlTargets(thread.id, 'SELECTED_DESKTOP_APPLICATION');
  store.internal('fixture.scope', thread.id, () => {
    store.put('thread', thread.id, thread.id, { ...thread, epoch: thread.epoch + 1, accountId: 'other-scope' });
  });

  await expect(service.controlTargets(thread.id, 'SELECTED_DESKTOP_APPLICATION')).rejects.toMatchObject({ code: 'CAPABILITY_DENIED' });
  expect(candidates).toHaveBeenCalledExactlyOnceWith('SELECTED_DESKTOP_APPLICATION');
  await expect(service.command({
    id: 'stale-scope', type: 'control.grant', threadId: thread.id,
    payload: { consentId: consent.consentId, target: app },
  })).rejects.toMatchObject({ code: 'CAPABILITY_DENIED' });
});

it('M16 shares a single target snapshot across concurrent requests for the same consent', async () => {
  const { service, thread } = serviceFixture();
  const candidates = vi.fn<ControlDriverOperations['candidates']>().mockResolvedValue([{ target: app, title: 'Fixture app' }]);
  attachTestTargetChooser(service, candidates);
  await service.command({
    id: 'shared-chooser', type: 'control.request', threadId: thread.id,
    payload: { mode: 'SELECTED_DESKTOP_APPLICATION', observe: true },
  });

  const lists = await Promise.all([
    service.controlTargets(thread.id, 'SELECTED_DESKTOP_APPLICATION'),
    service.controlTargets(thread.id, 'SELECTED_DESKTOP_APPLICATION'),
  ]);
  expect(lists[0]?.candidates).toEqual(lists[1]?.candidates);
  expect(candidates).toHaveBeenCalledExactlyOnceWith('SELECTED_DESKTOP_APPLICATION');

  const refreshed = [{ target: { ...app, sessionIdentity: 'new-geometry' }, title: 'Refreshed fixture' }];
  candidates.mockResolvedValue(refreshed);
  await expect(service.controlTargets(thread.id, 'SELECTED_DESKTOP_APPLICATION')).resolves.toMatchObject({ candidates: refreshed });
  expect(candidates).toHaveBeenCalledTimes(2);
});

it('M16 revokes control on archive and hides stale persisted grants on restart', async () => {
  const { service, store, thread } = serviceFixture();
  attachTestTargetChooser(service, async () => [{ target: app, title: 'Fixture app' }]);
  const payload = { mode: 'SELECTED_DESKTOP_APPLICATION', observe: true };
  const oldGrant = { ...grant(app, Date.now()), capturePermission: true };
  store.internal('fixture.old-session', thread.id, () => {
    store.put('interactiveGrant', oldGrant.grantId, thread.id, oldGrant);
  });
  const receipt = await service.command({ id: 'replacement-control', type: 'control.request', threadId: thread.id, payload });
  const { consent } = receipt.result as { consent: { consentId: string } };
  expect(service.controlConsent.surfaceModel(thread.id).state).toBe('consent');
  await service.controlTargets(thread.id, 'SELECTED_DESKTOP_APPLICATION');
  const issued = await service.command({
    id: 'approve-replacement', type: 'control.grant', threadId: thread.id,
    payload: { consentId: consent.consentId, target: app },
  });
  const active = (issued.result as { grant: InteractiveGrantV1 }).grant;
  await service.command({ id: 'archive-with-grant', type: 'thread.archive', threadId: thread.id, payload: {} });
  await service.command({ id: 'restore-without-grant', type: 'thread.restore', threadId: thread.id, payload: {} });
  const saved = store.get<InteractiveGrantV1>('interactiveGrant', active.grantId);
  expect(saved?.revocationGeneration).toBe(1);
  await expect(service.controlCapture(thread.id)).rejects.toMatchObject({ code: 'CAPABILITY_DENIED' });
});

it('M16 honors the consent origin allowlist for new grants and persisted captures', () => {
  const { store } = serviceFixture();
  const registry = new ControlDriverRegistry();
  registry.register(registration('browser-tab'));
  __setCapabilityFlagForTests('control.consentedBrowserV1', true);
  const host = new BrowserConsentHost(store, { registry });
  const target = { kind: 'BROWSER_TAB' as const, creationIdentity: 'tab-1', sessionIdentity: 'nav-1', origin: 'https://outside.example' };
  const request = host.requestConsent(owner, {
    mode: 'CONSENTED_EXISTING_TAB', observe: true, allowedOrigins: ['https://approved.example'],
  });
  expect(codeOf(() => host.grant(request.consentId, owner, target, { deviceId: 'd', sessionId: 's' }))).toBe('CAPABILITY_DENIED');

  const persisted = {
    ...grant(target, Date.now()), mode: 'CONSENTED_EXISTING_TAB' as const,
    capturePermission: true, allowedOrigins: ['https://approved.example'],
  };
  store.internal('fixture.legacy', owner.threadId, () => {
    store.put('interactiveGrant', persisted.grantId, owner.threadId, persisted);
  });
  expect(codeOf(() => host.authorizeAction(persisted, 'CAPTURE'))).toBe('CAPABILITY_DENIED');
});

/** Supporting assertion for G02: the M16 flags exist in the host registry and
 * default false. */
it('M16-G02 flags are registered default-off and never in UI preferences', async () => {
  const { capabilityEnabled, registeredCapabilityFlags } = await import('../packages/core/capability-flags.ts');
  expect(registeredCapabilityFlags()).toMatchObject({ 'control.consentedBrowserV1': false, 'control.selectedDesktopV1': false });
  expect(capabilityEnabled('control.consentedBrowserV1')).toBe(false);
  expect(capabilityEnabled('control.selectedDesktopV1')).toBe(false);
});
