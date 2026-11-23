import { randomUUID } from 'node:crypto';
import { createHash } from 'node:crypto';
import { rmSync, writeFileSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { HarnessError } from '../contracts/index.ts';
import type { ToolOwner } from '../contracts/tool-effects.ts';
import {
  storedCaptureV1Schema,
  type ControlActionV1,
  type ControlMode,
  type ControlTargetCandidateV1,
  type ControlTargetIdentityV1,
  type InteractiveGrantV1,
  type StoredCaptureV1,
} from '../contracts/interactive-control.ts';
import type { Store } from '../storage/store.ts';
import { sameTargetIdentity, type BrowserConsentHost, type ControlDriverRegistry } from './browser-consent.ts';
import { ControlDispatcher, type ControlDriverOperations, type QueuedControlAction } from './desktop-control.ts';

/** M16 C3/C4 host runtime (followup/m16-windows-control-bridge). Owns the
 * single approved driver attachment, per-thread dispatchers and the artifact
 * store for captures. The consent host remains the only grant authority; this
 * runtime never writes grants, never relaxes a flag and never substitutes a
 * fallback driver — an unattached driver still resolves DRIVER_UNAVAILABLE
 * at the registry (D01/D02/D07). */

export interface ControlDriverAttachment {
  driver: ControlDriverOperations;
}

const ACTION_KINDS = ['CAPTURE', 'CLICK', 'TYPE', 'KEYPRESS', 'UPLOAD', 'DOWNLOAD', 'NAVIGATE'] as const;
type ActionKind = (typeof ACTION_KINDS)[number];

interface TargetOffer {
  consentId: string;
  pending: Promise<ControlTargetCandidateV1[]>;
  targets?: ControlTargetIdentityV1[];
}

export class ControlRuntime {
  private driver: ControlDriverOperations | null = null;
  private driverGeneration = 0;
  private readonly driverGrants = new Map<string, InteractiveGrantV1>();
  private readonly dispatchers = new Map<string, ControlDispatcher>();
  private readonly targetOffers = new Map<string, TargetOffer>();
  private readonly now: () => number;

  constructor(
    private readonly store: Store,
    private readonly consent: BrowserConsentHost,
    private readonly deps: {
      registry: ControlDriverRegistry;
      device: { deviceId: string; sessionId: string };
      artifactRoot: string;
      nowMs?: () => number;
      currentOwner?: (threadId: string) => ToolOwner | null;
    },
  ) {
    this.now = deps.nowMs ?? Date.now;
  }

  /** Attach the single approved driver. Registration entries were already
   * validated and registered by the caller's host path; this only wires the
   * executable handle. Detach leaves input functions unregistered again (D07). */
  attachDriver(driver: ControlDriverOperations): void {
    this.detachDriver();
    this.driver = driver;
  }
  detachDriver(): void {
    this.driverGeneration += 1;
    this.targetOffers.clear();
    const grants = [...this.driverGrants.values()];
    for (const threadId of new Set([...this.dispatchers.keys(), ...this.driverGrants.keys()])) {
      void this.stopDispatch(threadId);
    }
    this.driver = null;
    for (const grant of grants) {
      if (this.store.get('interactiveGrant', grant.grantId)) this.consent.revoke(grant.grantId);
    }
  }
  driverAttached(): boolean { return this.driver !== null; }

  private requireDriver(): ControlDriverOperations {
    if (!this.driver) throw new HarnessError('DRIVER_UNAVAILABLE', 'No approved control driver is attached.');
    return this.driver;
  }

  /** S02 target candidates for a pending consent: browser modes enumerate the
   * driver's registered in-app targets; the desktop-application mode lists the
   * driver's app-owned consent-chooser rows (each carries its own proven
   * window handle — the system picker's pickTarget stays held). */
  async targets(mode: ControlMode, threadId: string, consentId: string) {
    const driver = this.requireDriver();
    const existing = this.targetOffers.get(threadId);
    const offer = existing?.consentId === consentId && !existing.targets ? existing : {
      consentId, pending: this.consent.listTargets(mode, () => driver.candidates(mode)),
    };
    this.targetOffers.set(threadId, offer);
    try {
      const candidates = await (offer === existing
        ? this.consent.listTargets(mode, () => offer.pending)
        : offer.pending);
      return { offer, candidates };
    } catch (error) {
      if (this.targetOffers.get(threadId) === offer) this.discardTargetOffer(threadId);
      throw error;
    }
  }

  recordTargetOffer(threadId: string, result: Awaited<ReturnType<ControlRuntime['targets']>>): void {
    if (this.targetOffers.get(threadId) !== result.offer) {
      throw new HarnessError('CAPABILITY_DENIED', 'The target selection was invalidated.');
    }
    result.offer.targets = result.candidates.map(({ target }) => ({ ...target }));
  }

  discardTargetOffer(threadId: string): void {
    this.targetOffers.delete(threadId);
  }

  /** Consent resolution stays a synchronous host command path: the grant is
   * written under the open command transaction with this host's authenticated
   * device/session identity. */
  grant(consentId: string, owner: ToolOwner, target: ControlTargetIdentityV1): InteractiveGrantV1 {
    const offer = this.targetOffers.get(owner.threadId);
    const offeredTarget = offer?.consentId === consentId
      ? offer.targets?.find(candidate => sameTargetIdentity(candidate, target) && candidate.origin === target.origin)
      : undefined;
    if (!offeredTarget) {
      throw new HarnessError('CAPABILITY_DENIED', 'Select a target offered for this consent.');
    }
    const grant = this.consent.grant(consentId, owner, offeredTarget, this.deps.device);
    this.discardTargetOffer(owner.threadId);
    this.driverGrants.set(owner.threadId, grant);
    return grant;
  }

  private dispatcherFor(threadId: string, grant: InteractiveGrantV1): ControlDispatcher {
    const existing = this.dispatchers.get(threadId);
    if (existing) return existing;
    const dispatcher = new ControlDispatcher({
      driver: this.requireDriver(),
      registration: this.deps.registry.resolve(grant.mode),
      nowMs: this.now,
      isGrantLive: candidate => this.ownsGrant(candidate) && this.consent.activeGrant(threadId)?.grantId === candidate.grantId,
    });
    this.dispatchers.set(threadId, dispatcher);
    return dispatcher;
  }

  ownsGrant(grant: InteractiveGrantV1): boolean {
    return this.driver !== null && this.driverGrants.get(grant.owner.threadId)?.grantId === grant.grantId &&
      (!this.deps.currentOwner || isDeepStrictEqual(grant.owner, this.deps.currentOwner(grant.owner.threadId)));
  }

  private activeGrant(threadId: string): InteractiveGrantV1 {
    const grant = this.consent.activeGrant(threadId);
    if (!grant || !this.ownsGrant(grant)) {
      throw new HarnessError('CAPABILITY_DENIED', 'No active control grant for this driver attachment and thread scope.');
    }
    return grant;
  }

  private requireCurrentGrant(threadId: string, grantId: string): InteractiveGrantV1 {
    const current = this.activeGrant(threadId);
    if (current.grantId !== grantId) throw new HarnessError('CAPABILITY_DENIED', 'The original control grant is no longer active.');
    return current;
  }

  /** Observe permission is independent of interact permission (D03). The PNG
   * bytes are private task data: they are written only under the host artifact
   * root with a recorded digest and are never sent anywhere else (S05/S08). */
  async capture(threadId: string): Promise<{ capture: StoredCaptureV1; artifactRef: string }> {
    const grant = this.activeGrant(threadId);
    this.consent.authorizeAction(grant, 'CAPTURE');
    const registration = this.deps.registry.resolve(grant.mode);
    const driver = this.requireDriver();
    const generation = this.driverGeneration;
    const assertCaptureAuthorized = () => {
      this.requireCurrentGrant(threadId, grant.grantId);
      this.consent.authorizeAction(grant, 'CAPTURE');
      if (this.driverGeneration !== generation) throw new HarnessError('DRIVER_UNAVAILABLE', 'The capture driver is no longer attached.');
    };
    const frame = await driver.capture(grant.target);
    assertCaptureAuthorized();
    if (frame.width > registration.captureBounds.maxWidth || frame.height > registration.captureBounds.maxHeight || frame.data.byteLength > registration.captureBounds.maxBytes) {
      throw new HarnessError('CAPTURE_BOUNDS_EXCEEDED', 'The capture exceeded the approved driver bounds.');
    }
    const artifactId = `capture-${randomUUID()}`;
    const sha = createHash('sha256').update(frame.data).digest('hex');
    const relative = join('control-captures', threadId, `${artifactId}.png`);
    const absolute = join(this.deps.artifactRoot, relative);
    const capture = storedCaptureV1Schema.parse({
      artifactId,
      target: grant.target,
      timestampMs: this.now(),
      frameDimensions: { width: frame.width, height: frame.height },
      sourceOwner: grant.owner.threadId,
      captureScope: { kind: grant.target.kind === 'BROWSER_TAB' ? 'TAB' : 'WINDOW', region: null },
      artifactRef: relative.replaceAll('\\', '/'),
      sha256: sha,
      mimeType: 'image/png',
    });
    await mkdir(join(absolute, '..'), { recursive: true });
    assertCaptureAuthorized();
    try {
      // Keep bytes in memory until publication. There is no asynchronous gap
      // between the final grant check, writing this bounded frame and its receipt.
      writeFileSync(absolute, frame.data, { mode: 0o600 });
      this.store.internal('control.capture', threadId, () => { this.store.put('controlCapture', capture.artifactId, threadId, capture); });
    } catch (error) {
      try { rmSync(absolute, { force: true }); }
      catch (cleanupError) { throw new AggregateError([error, cleanupError], 'Could not publish or discard the private capture.'); }
      throw error;
    }
    return { capture, artifactRef: capture.artifactRef };
  }

  /** Dispatch one consent-admitted input action through the serialized queue.
   * The action is validated against the live grant, host-classified (D05),
   * enqueued with a fresh observation and settled before the durable
   * 'controlAction' record is written. Nothing bypasses the queue. */
  async action(threadId: string, owner: ToolOwner, input: { grantId: string; action: string; parameters?: Record<string, unknown>; observation: unknown }): Promise<{ action: ControlActionV1; outcome: QueuedControlAction['outcome']; reason?: string }> {
    if (!ACTION_KINDS.includes(input.action as ActionKind) || input.action === 'CAPTURE') throw new HarnessError('INVALID_INPUT', 'Choose a valid control input action.');
    const grant = this.requireCurrentGrant(threadId, input.grantId);
    if (!isDeepStrictEqual(grant.owner, owner)) {
      throw new HarnessError('CAPABILITY_DENIED', 'The original control owner scope is no longer active.');
    }
    const kind = input.action as Exclude<ActionKind, 'CAPTURE'>;
    this.consent.authorizeAction(grant, kind);
    if (!input.observation || typeof input.observation !== 'object') throw new HarnessError('INVALID_INPUT', 'A fresh target observation is required.');
    const observation = input.observation as import('../contracts/interactive-control.ts').TargetObservationV1;
    this.consent.validateTarget(grant, observation.target, observation.target.origin);
    const dispatcher = this.dispatcherFor(threadId, grant);
    const item = dispatcher.enqueue({
      grant,
      action: { action: kind, redactedParameters: input.parameters ?? {} },
      observation,
    });
    const settled = await item.settled!;
    const record = settled.action;
    this.store.internal('control.action.settled', threadId, () => {
      this.store.put('controlAction', record.actionId, threadId, { ...record, outcome: settled.outcome, reason: settled.reason ?? null });
    });
    return { action: record, outcome: settled.outcome, reason: settled.reason };
  }

  /** Fresh observation of the granted target straight from the driver —
   * callers enqueue input only against a current observation (S06). */
  async observe(threadId: string) {
    const grant = this.activeGrant(threadId);
    const observation = await this.requireDriver().observe(grant.target);
    this.requireCurrentGrant(threadId, grant.grantId);
    const state = this.consent.validateTarget(grant, observation.target, observation.target.origin);
    if (state !== 'ACTIVE') throw new HarnessError(state === 'NEEDS_NEW_PERMISSION' ? 'NEEDS_NEW_PERMISSION' : 'CAPABILITY_DENIED', 'The controlled target needs renewed consent.');
    return { grantId: grant.grantId, observation };
  }

  /** G03 rollback for dispatch: the dispatcher's generation is revoked before
   * queued actions are cancelled. Unconditional for this thread. */
  async stopDispatch(threadId: string): Promise<void> {
    this.discardTargetOffer(threadId);
    const target = this.driverGrants.get(threadId)?.target;
    this.driverGrants.delete(threadId);
    const dispatcher = this.dispatchers.get(threadId);
    if (dispatcher) {
      this.dispatchers.delete(threadId);
      await dispatcher.stop(target);
    } else if (target) {
      try { await this.driver?.cancelInput(target); }
      catch { /* Driver cancellation is best-effort after a Stop request. */ }
    }
  }

  /** Rollback: revoke grants via the consent host and stop input. Only this
   * thread's own control connection is touched; owned receipts stay (G03). */
  async stop(threadId: string) {
    const stopping = this.stopDispatch(threadId);
    const surface = this.consent.stop(threadId);
    await stopping;
    return surface;
  }
}
