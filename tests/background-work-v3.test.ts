import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { Store } from "../packages/storage/store.ts";
import { Service } from "../packages/core/service.ts";
import { BackgroundWorkCoordinator, captureCreationToken, verifyProcessIdentity, type BackgroundWorkRecord } from "../packages/core/background-work.ts";
import { DurableWakeupScheduler } from "../packages/core/durable-wakeups.ts";
import { ModelCapacity } from "../packages/runtime/model-capacity.ts";
import { __setCapabilityFlagForTests, registeredCapabilityFlags } from "../packages/core/capability-flags.ts";
import type { RuntimeAdapter, Thread } from "../packages/contracts/index.ts";
import { BACKGROUND_HOLD_REASONS, BACKGROUND_SCHEDULER_LIMITS, backgroundWorkV1Schema, humanStepV1Schema, intakeV1Schema, occurrenceKeyForEvent, occurrenceKeyForTime, wakeupV1Schema, type BackgroundOccurrenceV1, type BackgroundOutputPublicationV1 } from "../packages/contracts/background-work.ts";
import type { ToolResultHandleV1 } from "../packages/contracts/request-context.ts";
import { contextResultReadArgs } from "../packages/core/context-result-tool.ts";
import { openContextResultCustody } from "../packages/core/context-result-custody.ts";

const cleanups: (() => void | Promise<void>)[] = [];
afterEach(async () => {
  for (const key of ["jobs.backgroundV1", "jobs.serviceLifetimeV1", "jobs.idleReviewV1", "integrations.intakeV1", "context.compilerV1", "tools.deferredV1"] as const) __setCapabilityFlagForTests(key, undefined);
  vi.restoreAllMocks();
  while (cleanups.length) await cleanups.pop()!();
});

const M10_FLAGS = ["jobs.backgroundV1", "jobs.serviceLifetimeV1", "jobs.idleReviewV1", "integrations.intakeV1"] as const;
function enable(...keys: (typeof M10_FLAGS)[number][]) { for (const key of keys) __setCapabilityFlagForTests(key, true); }

const CANONICAL_HANDLE = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;

function fixture(options: { idleExecutor?: ConstructorParameters<typeof BackgroundWorkCoordinator>[0]["idleExecutor"]; gate?: ModelCapacity; executionGate?: ConstructorParameters<typeof BackgroundWorkCoordinator>[0]["executionGate"]; enqueueFollowUp?: ConstructorParameters<typeof BackgroundWorkCoordinator>[0]["enqueueFollowUp"]; publishOutput?: ConstructorParameters<typeof BackgroundWorkCoordinator>[0]["publishOutput"] } = {}) {
  const root = mkdtempSync(join(realpathSync(tmpdir()), "m10-background-"));
  const store = new Store(join(root, "state"));
  let clock = 1_700_000_000_000;
  const now = () => clock;
  const advance = (ms: number) => { clock += ms; };
  // Mirrors Service.publishBackgroundOutput: mints a canonical UUID record in
  // the same private custody the service uses (store.dataDir).
  const publishOutput = options.publishOutput ?? (async (input: BackgroundOutputPublicationV1) => {
    const custody = await openContextResultCustody(store.dataDir);
    const record: ToolResultHandleV1 = { handle: randomUUID(), owner: { threadId: input.owner.threadId, workspaceId: JSON.stringify([input.owner.workspaceId ?? null, input.owner.projectId ?? null]), accountId: input.owner.accountBinding },
      sourceInvocationId: input.effectId ?? input.workId, digest: createHash("sha256").update(input.bytes).digest("hex"), bytes: input.bytes.length,
      mediaType: "text/plain", expiresAtMs: now() + BACKGROUND_SCHEDULER_LIMITS.outputHandleTtlMs, operation: "read-result-range" };
    await custody.put(record.handle, input.bytes, record);
    return record;
  });
  const coordinator = new BackgroundWorkCoordinator({ store, now, gate: options.gate, idleExecutor: options.idleExecutor, executionGate: options.executionGate, enqueueFollowUp: options.enqueueFollowUp, publishOutput });
  const thread: Thread = { id: "thread-1", title: "Owner", projectName: null, createdAt: new Date(clock).toISOString(), updatedAt: new Date(clock).toISOString(), status: "ready", epoch: 0, runId: null, modelId: null, sessionPath: null };
  store.internal("fixture.thread", thread.id, () => store.put("thread", thread.id, thread.id, thread));
  cleanups.push(() => { coordinator.dispose(); store.close(); rmSync(root, { recursive: true, force: true, maxRetries: 8, retryDelay: 150 }); });
  const owner = { threadId: thread.id, runId: null, epoch: 0, projectId: null, workspaceId: null, accountBinding: null };
  return { root, store, coordinator, now, advance, owner, thread };
}

const command = (type: string, payload: Record<string, unknown> = {}, threadId?: string) => ({ id: randomUUID(), type, payload, ...(threadId ? { threadId } : {}) });

async function waitFor(assertion: () => boolean, timeoutMs = 8_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!assertion()) {
    if (Date.now() > deadline) throw new Error("Timed out waiting for condition");
    await new Promise(resolve => setTimeout(resolve, 20));
  }
}

/** Terminate a test-owned spawned command. POSIX children run detached in
 * their own group; Windows has no group signalling, so kill the pid directly. */
function killOwnedProcess(pid: number): void {
  try {
    if (process.platform === "win32") process.kill(pid, "SIGKILL");
    else process.kill(-pid, "SIGKILL");
  } catch { /* already gone */ }
}

describe("M10-C01/C02 strict contracts", () => {
  it("validates BackgroundWorkV1 terminal-state invariants and RUN default", () => {
    const base = { workId: "w1", owner: { threadId: "t", runId: null, epoch: 0, projectId: null, workspaceId: null, accountBinding: null }, kind: "COMMAND", effectId: null, processIdentity: null, state: "QUEUED", outcome: null, blockedReason: null, leaseGeneration: 0, leaseExpiresAtMs: null, deadlineMs: 1, outputRef: null };
    expect(backgroundWorkV1Schema.parse(base).lifetime).toBe("RUN");
    expect(backgroundWorkV1Schema.safeParse({ ...base, state: "SETTLED", outcome: null }).success).toBe(false);
    expect(backgroundWorkV1Schema.safeParse({ ...base, state: "SETTLED", outcome: "SUCCEEDED" }).success).toBe(true);
    expect(backgroundWorkV1Schema.safeParse({ ...base, state: "UNKNOWN", outcome: "FAILED" }).success).toBe(false);
    expect(backgroundWorkV1Schema.safeParse({ ...base, state: "UNKNOWN", outcome: null }).success).toBe(true);
    expect(backgroundWorkV1Schema.safeParse({ ...base, extra: 1 }).success).toBe(false);
  });
  it("validates WakeupV1 tagged triggers and rejects unsupported schedules", () => {
    const base = { wakeupId: "s1", taskId: "w1", scheduleRevision: 1, scheduleTimezone: null, occurrenceKey: null, state: "PENDING", claimGeneration: 0, leaseExpiresAtMs: null, deadlineMs: 10 };
    expect(wakeupV1Schema.safeParse({ ...base, trigger: { kind: "AT_UTC", dueAtMs: 5 } }).success).toBe(true);
    expect(wakeupV1Schema.safeParse({ ...base, trigger: { kind: "INTERVAL_UTC", anchorMs: 0, intervalMs: 60_000 } }).success).toBe(true);
    expect(wakeupV1Schema.safeParse({ ...base, trigger: { kind: "INTERVAL_UTC", anchorMs: 0, intervalMs: 0 } }).success).toBe(false);
    expect(wakeupV1Schema.safeParse({ ...base, trigger: { kind: "HOST_EVENT", eventKind: "runtime.settled", correlationKey: "t" } }).success).toBe(true);
    expect(wakeupV1Schema.safeParse({ ...base, trigger: { kind: "HOST_EVENT", eventKind: " arbitrary.event", correlationKey: "t" } }).success).toBe(false);
    expect(wakeupV1Schema.safeParse({ ...base, trigger: { kind: "CRON", expression: "* * * * *" } }).success).toBe(false);
    expect(humanStepV1Schema.safeParse({ requestId: "r", owner: base, questionRevision: 1, responseSchema: {}, requiredAction: "answer", deliveryState: "PENDING", resumeBinding: { workId: "w", threadId: "t" } }).success).toBe(false);
    expect(intakeV1Schema.safeParse({ intakeId: "i", sourceInstallation: "login", repositoryId: 1442565952, eventId: "n", deliveryId: "d", payloadDigest: "a".repeat(64), receivedAt: "now", proposedTask: { title: "t", sourceUrl: "u", issueNumber: 1 }, disposition: "PROPOSED" }).success).toBe(true);
  });
});

describe("M10-G02 host-owned flags", () => {
  it("registers only missing M10 keys, default false, without replacing other keys", () => {
    const flags = registeredCapabilityFlags();
    for (const key of M10_FLAGS) expect(flags[key]).toBe(false);
    for (const key of ["audit.effectsV1", "security.authorityV1", "context.compilerV1", "agents.workV1", "models.requestMetricsV1", "workspace.provenanceV1"]) expect(flags).toHaveProperty(key);
  });
  it("keeps background admission disabled until the host enables its own key", () => {
    const f = fixture();
    expect(() => f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "MAINTENANCE", title: "x" })).toThrowError(expect.objectContaining({ code: "BACKGROUND_DISABLED" }));
    enable("jobs.backgroundV1");
    const record = f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "MAINTENANCE", title: "x" });
    expect(record.state).toBe("QUEUED");
    expect(record.lifetime).toBe("RUN");
  });
});

describe("M10-S01/T01 scheduler claims and restart", () => {
  it("two racing schedulers create exactly one admission for one occurrence", async () => {
    const f = fixture();
    enable("jobs.backgroundV1");
    let deliveries = 0;
    const deliver = async () => { deliveries++; await Promise.resolve(); return { status: "DELIVERED" as const }; };
    const a = new DurableWakeupScheduler({ store: f.store, now: f.now, deliver });
    const b = new DurableWakeupScheduler({ store: f.store, now: f.now, deliver });
    cleanups.push(() => { a.stop(); b.stop(); });
    a.register(command("background.wakeup.register"), { taskId: "task-1", trigger: { kind: "AT_UTC", dueAtMs: f.now() } });
    await Promise.all([a.tick(), b.tick()]);
    await waitFor(() => deliveries > 0);
    await Promise.all([a.tick(), b.tick()]);
    expect(deliveries).toBe(1);
    const admissions = f.store.all("backgroundAdmission");
    expect(admissions).toHaveLength(1);
    const occurrences = f.store.all<BackgroundOccurrenceV1>("backgroundOccurrence");
    expect(occurrences).toHaveLength(1);
    expect(occurrences[0]!.state).toBe("DELIVERED");
  });
  it("restart before claim delivers once; restart after uncertain claim never redelivers without reconciliation", async () => {
    const f = fixture();
    let deliveries = 0;
    let release: (() => void) | null = null;
    const deliver = () => { deliveries++; return new Promise<{ status: "DELIVERED" }>(resolve => { release = () => resolve({ status: "DELIVERED" }); }); };
    const a = new DurableWakeupScheduler({ store: f.store, now: f.now, deliver });
    cleanups.push(() => a.stop());
    a.register(command("background.wakeup.register"), { taskId: "task-1", trigger: { kind: "AT_UTC", dueAtMs: f.now() } });
    await a.tick();
    expect(deliveries).toBe(1);
    a.stop();
    f.advance(31_000);
    const b = new DurableWakeupScheduler({ store: f.store, now: f.now, deliver: async () => { deliveries++; return { status: "DELIVERED" as const }; } });
    cleanups.push(() => b.stop());
    b.recover();
    const occurrence = f.store.all<BackgroundOccurrenceV1>("backgroundOccurrence")[0]!;
    expect(occurrence.state).toBe("UNKNOWN");
    await b.tick();
    expect(deliveries).toBe(1);
    b.reconcile(command("background.occurrence.reconcile"), occurrence.occurrenceKey, { observed: "NOT_DISPATCHED" });
    await b.tick();
    await waitFor(() => deliveries === 2);
    expect(f.store.all("backgroundAdmission")).toHaveLength(1);
    void release;
  });
  it("rejects unsupported schedule kinds with SCHEDULE_KIND_UNSUPPORTED", () => {
    const f = fixture();
    const scheduler = new DurableWakeupScheduler({ store: f.store, now: f.now, deliver: async () => ({ status: "DELIVERED" as const }) });
    cleanups.push(() => scheduler.stop());
    expect(() => scheduler.register(command("background.wakeup.register"), { taskId: "t", trigger: { kind: "CRON", expression: "0 * * * *" } })).toThrowError(expect.objectContaining({ code: "SCHEDULE_KIND_UNSUPPORTED" }));
    expect(() => scheduler.hostEvent("arbitrary.event", "k", "e1")).toThrowError(expect.objectContaining({ code: "SCHEDULE_KIND_UNSUPPORTED" }));
  });
});

describe("M10-S04 revalidation", () => {
  it("blocks delivery when the owner epoch changed and never revives prior authority", async () => {
    const f = fixture();
    enable("jobs.backgroundV1");
    const store = f.store;
    store.internal("fixture.run", f.thread.id, () => store.put("thread", f.thread.id, f.thread.id, { ...f.thread, runId: "run-1", status: "working" }));
    const work = f.coordinator.admit(command("background.work.admit"), { owner: { ...f.owner, runId: "run-1", epoch: 0 }, kind: "EXTERNAL_TASK", title: "x", intakeId: "missing" });
    expect(work.state).toBe("BLOCKED");
    const admitted = f.coordinator.admit(command("background.work.admit"), { owner: { ...f.owner, runId: "run-1", epoch: 0 }, kind: "MAINTENANCE", title: "y" });
    f.coordinator.scheduler.register(command("background.wakeup.register"), { taskId: admitted.workId, trigger: { kind: "AT_UTC", dueAtMs: f.now() } });
    store.internal("fixture.epoch", f.thread.id, () => store.put("thread", f.thread.id, f.thread.id, { ...f.thread, runId: "run-2", epoch: 1, status: "working" }));
    await f.coordinator.scheduler.tick();
    const wakeup = f.coordinator.scheduler.schedules()[0]!;
    expect(wakeup.state).toBe("BLOCKED");
    expect(wakeup.blockedReason).toBe("OWNER_REVOKED");
    expect(f.coordinator.work(admitted.workId).state).toBe("QUEUED");
  });
});

describe("M10-S06/T03 idle opt-in, preemption and permit custody", () => {
  it("requires persisted opt-in, a >=60s interval and one idle job per profile", () => {
    const f = fixture();
    enable("jobs.backgroundV1", "jobs.idleReviewV1");
    const idle = { projectId: "p1", profileId: "verify", intervalMs: 60_000 };
    expect(() => f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "MAINTENANCE", title: "idle", idle })).toThrowError(expect.objectContaining({ code: "IDLE_OPT_IN_REQUIRED" }));
    f.coordinator.configureIdle(command("background.idle.configure"), { ...idle, enabled: true });
    expect(() => f.coordinator.configureIdle(command("background.idle.configure"), { projectId: "p1", profileId: "fast", enabled: true, intervalMs: 1_000 })).toThrowError(expect.objectContaining({ code: "INVALID_INPUT" }));
    const first = f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "MAINTENANCE", title: "idle", idle });
    expect(first.state).toBe("QUEUED");
    expect(() => f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "MAINTENANCE", title: "idle2", idle })).toThrowError(expect.objectContaining({ code: "IDLE_LIMIT" }));
  });
  it("foreground admission cancels queued idle work and keeps a running permit until confirmed teardown", async () => {
    const gate = new ModelCapacity(1);
    let executorStarted: (() => void) | null = null;
    let finishExecutor: ((result: { outcome: "CANCELLED"; teardownConfirmed: boolean }) => void) | null = null;
    const f = fixture({
      gate,
      idleExecutor: (_work, signal) => new Promise(resolve => {
        executorStarted?.();
        finishExecutor = resolve;
        signal.addEventListener("abort", () => resolve({ outcome: "CANCELLED", teardownConfirmed: false }), { once: true });
      }),
    });
    enable("jobs.backgroundV1", "jobs.idleReviewV1");
    const idle = { projectId: "p1", profileId: "verify", intervalMs: 60_000 };
    f.coordinator.configureIdle(command("background.idle.configure"), { ...idle, enabled: true });
    const queued = f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "MAINTENANCE", title: "queued idle", idle });
    f.coordinator.noteForegroundAdmission("thread-1");
    expect(f.coordinator.work(queued.workId).state).toBe("SETTLED");
    expect(f.coordinator.work(queued.workId).outcome).toBe("CANCELLED");
    const running = f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "MAINTENANCE", title: "running idle", idle });
    f.advance(60_000);
    const started = new Promise<void>(resolve => { executorStarted = resolve; });
    await f.coordinator.scheduler.tick();
    await started;
    await waitFor(() => f.coordinator.work(running.workId).state === "RUNNING");
    expect(f.coordinator.permitHeld(running.workId)).toBe(true);
    f.coordinator.noteForegroundAdmission("thread-1");
    await waitFor(() => finishExecutor !== null);
    finishExecutor!({ outcome: "CANCELLED", teardownConfirmed: false });
    await waitFor(() => f.coordinator.work(running.workId).state === "SETTLED");
    // The account/model permit stays held: teardown was not confirmed.
    expect(f.coordinator.permitHeld(running.workId)).toBe(true);
    const control = new AbortController();
    let resolved = false;
    const pending = gate.acquire("background", null, control.signal).then(() => { resolved = true; });
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(resolved).toBe(false);
    control.abort();
    await expect(pending).rejects.toMatchObject({ code: "MODEL_REQUEST_CANCELLED" });
    f.coordinator.confirmTeardown(running.workId);
    expect(f.coordinator.permitHeld(running.workId)).toBe(false);
    const release = await gate.acquire("background", null);
    release();
  });
});

describe("M10-S07/G01 fork and service gates", () => {
  it("review forks require an auxiliary budget and report UNSUPPORTED_FORK on the pinned wrapper", () => {
    const f = fixture();
    enable("jobs.backgroundV1");
    expect(f.coordinator.admitReviewFork({ sourceCutDigest: "a".repeat(64), toolList: ["read"], auxiliaryBudget: null, parentThreadId: "thread-1" })).toEqual({ status: "AUXILIARY_BUDGET_REQUIRED" });
    expect(f.coordinator.admitReviewFork({ sourceCutDigest: "a".repeat(64), toolList: ["read"], auxiliaryBudget: { maxCalls: 4, maxTokens: 1000 }, parentThreadId: "thread-1" })).toEqual({ status: "UNSUPPORTED_FORK" });
    const review = f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "REVIEW", title: "fork" });
    expect(review.state).toBe("BLOCKED");
    expect(review.blockedReason).toBe(BACKGROUND_HOLD_REASONS.forkApi);
  });
  it("APPROVED_SERVICE stays blocked without a proven installed supervisor", () => {
    const f = fixture();
    enable("jobs.backgroundV1", "jobs.serviceLifetimeV1");
    const work = f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "COMMAND", title: "service", lifetime: "APPROVED_SERVICE" });
    expect(work.state).toBe("BLOCKED");
    expect(work.blockedReason).toBe(BACKGROUND_HOLD_REASONS.supervisor);
    expect(work.outcome).toBeNull();
  });
  it("commands without an approved execution profile stay HOLD_EXECUTION_PROFILE", async () => {
    const f = fixture();
    enable("jobs.backgroundV1");
    const work = f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "COMMAND", title: "cmd", command: { executable: process.execPath, argv: ["-e", "0"], cwd: f.root, profileId: "p" } });
    expect(work.state).toBe("BLOCKED");
    expect(work.blockedReason).toBe(BACKGROUND_HOLD_REASONS.executionProfile);
    const started = await f.coordinator.startCommand(work.workId);
    expect(started.blockedReason).toBe(BACKGROUND_HOLD_REASONS.executionProfile);
  });
});

describe("M10-S02/S03/T02 owned RUN-lifetime commands", () => {
  it("captures exact process identity, bounded cursor output and an exit receipt", async () => {
    const f = fixture({ executionGate: async () => ({ allowed: true }) });
    enable("jobs.backgroundV1");
    const work = f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "COMMAND", title: "echo", command: { executable: process.execPath, argv: ["-e", "console.log('hello background')"], cwd: f.root, profileId: "p" } });
    const started = await f.coordinator.startCommand(work.workId);
    expect(started.state).toBe("RUNNING");
    expect(started.processIdentity?.pid).toBeGreaterThan(0);
    if (process.platform === "linux") expect(started.processIdentity?.creationToken).toBeTruthy();
    await waitFor(() => f.coordinator.work(work.workId).state === "SETTLED");
    // Publication into canonical custody is asynchronous after stream close
    // (contract §5); wait for outputRef rather than racing it against settle.
    await waitFor(() => !!f.coordinator.work(work.workId).outputRef);
    const settled = f.coordinator.work(work.workId);
    expect(settled.outcome).toBe("SUCCEEDED");
    const output = f.coordinator.readOutput(work.workId, "thread-1", 0);
    expect(output.output).toContain("hello background");
    expect(output.cursor).toBeGreaterThan(0);
    expect(f.coordinator.readOutput(work.workId, "thread-1", output.cursor).output).toBe("");
    expect(f.coordinator.exitReceipt(work.workId)?.exitCode).toBe(0);
    expect(settled.outputRef).toMatch(CANONICAL_HANDLE);
    expect(() => f.coordinator.readOutput(work.workId, "other-thread")).toThrowError(expect.objectContaining({ code: "CAPABILITY_DENIED" }));
  });
  it("failed exit codes settle FAILED, never SUCCEEDED", async () => {
    const f = fixture({ executionGate: async () => ({ allowed: true }) });
    enable("jobs.backgroundV1");
    const work = f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "COMMAND", title: "fail", command: { executable: process.execPath, argv: ["-e", "process.exit(3)"], cwd: f.root, profileId: "p" } });
    await f.coordinator.startCommand(work.workId);
    await waitFor(() => f.coordinator.work(work.workId).state === "SETTLED");
    expect(f.coordinator.work(work.workId).outcome).toBe("FAILED");
  });
  it("PID reuse yields UNKNOWN and never signals the reused PID", async () => {
    const f = fixture({ executionGate: async () => ({ allowed: true }) });
    enable("jobs.backgroundV1");
    const work = f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "COMMAND", title: "sleep", command: { executable: process.execPath, argv: ["-e", "setTimeout(()=>{}, 30000)"], cwd: f.root, profileId: "p" } });
    const started = await f.coordinator.startCommand(work.workId);
    const pid = started.processIdentity!.pid;
    // Simulate a reused PID: the admitted creation token no longer matches.
    f.store.internal("fixture.reuse", work.workId, () => {
      const current = f.store.get<BackgroundWorkRecord>("backgroundWork", work.workId)!;
      f.store.put("backgroundWork", work.workId, current.owner.threadId, { ...current, processIdentity: { ...current.processIdentity!, creationToken: "reused-token" } });
    });
    const result = await f.coordinator.stopCommand(work.workId);
    expect(result.state).toBe("UNKNOWN");
    expect(f.coordinator.work(work.workId).outcome).toBeNull();
    expect(() => process.kill(pid, 0)).not.toThrow();
    killOwnedProcess(pid);
    await waitFor(() => f.coordinator.exitReceipt(work.workId) !== null);
  });
  it("host loss marks RUNNING commands UNKNOWN until the exact owned exit receipt resolves them", async () => {
    const f = fixture({ executionGate: async () => ({ allowed: true }) });
    enable("jobs.backgroundV1");
    const work = f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "COMMAND", title: "orphan", command: { executable: process.execPath, argv: ["-e", "setTimeout(()=>{}, 30000)"], cwd: f.root, profileId: "p" } });
    const started = await f.coordinator.startCommand(work.workId);
    const identity = started.processIdentity!;
    f.coordinator.recover();
    expect(f.coordinator.work(work.workId).state).toBe("UNKNOWN");
    expect(() => f.coordinator.resolveProcessExit(work.workId, { pid: identity.pid, creationToken: "wrong", exitCode: 0, signal: null, observedAt: new Date().toISOString() })).toThrowError(expect.objectContaining({ code: "RECONCILIATION_REQUIRED" }));
    killOwnedProcess(identity.pid);
    await waitFor(() => f.coordinator.exitReceipt(work.workId) !== null);
    const receipt = f.coordinator.exitReceipt(work.workId)!;
    if (process.platform === "linux") {
      const resolved = f.coordinator.resolveProcessExit(work.workId, receipt);
      expect(resolved.state).toBe("SETTLED");
      expect(resolved.outcome).toBe("FAILED");
    } else {
      // Without a platform creation token the receipt cannot prove the exact
      // owned process, so the quarantine holds rather than settling.
      expect(() => f.coordinator.resolveProcessExit(work.workId, receipt)).toThrowError(expect.objectContaining({ code: "RECONCILIATION_REQUIRED" }));
    }
  });
  it("identity helpers distinguish match, mismatch, gone and unproven", () => {
    expect(verifyProcessIdentity({ pid: process.pid, creationToken: captureCreationToken(process.pid), platform: process.platform, capturedAt: "now" })).toBe(process.platform === "linux" ? "MATCH" : "UNPROVEN");
    expect(verifyProcessIdentity({ pid: process.pid, creationToken: "not-the-token", platform: process.platform, capturedAt: "now" })).toBe(process.platform === "linux" ? "MISMATCH" : "UNPROVEN");
    expect(verifyProcessIdentity({ pid: 4_000_000, creationToken: "x", platform: "linux", capturedAt: "now" })).toBe(process.platform === "linux" ? "GONE" : "UNPROVEN");
    expect(verifyProcessIdentity({ pid: process.pid, creationToken: null, platform: "linux", capturedAt: "now" })).toBe("UNPROVEN");
  });
});

describe("M10 review regressions", () => {
  const cmdSpec = (cwd: string, argv: string[]) => ({ executable: process.execPath, argv, cwd, profileId: "p" });
  it("a repeated or concurrent start never spawns a second owned process", async () => {
    const f = fixture({ executionGate: async () => ({ allowed: true }) });
    enable("jobs.backgroundV1");
    const work = f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "COMMAND", title: "once", command: cmdSpec(f.root, ["-e", "console.log('only once')"]) });
    const [a, b] = await Promise.all([f.coordinator.startCommand(work.workId), f.coordinator.startCommand(work.workId)]);
    const third = await f.coordinator.startCommand(work.workId);
    const pid = (a.state === "RUNNING" ? a : b).processIdentity!.pid;
    expect(third.processIdentity?.pid).toBe(pid);
    await waitFor(() => f.coordinator.work(work.workId).state === "SETTLED");
    expect(f.coordinator.work(work.workId).outcome).toBe("SUCCEEDED");
    expect(f.store.all("backgroundExitReceipt")).toHaveLength(1);
    expect(f.coordinator.exitReceipt(work.workId)?.pid).toBe(pid);
  });
  it("a settled command releases its session so busy readiness clears", async () => {
    const f = fixture({ executionGate: async () => ({ allowed: true }) });
    enable("jobs.backgroundV1");
    const work = f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "COMMAND", title: "exit", command: cmdSpec(f.root, ["-e", "0"]) });
    await f.coordinator.startCommand(work.workId);
    await waitFor(() => f.coordinator.work(work.workId).state === "SETTLED");
    await waitFor(() => !f.coordinator.busy);
    const reopened = f.coordinator.readOutput(work.workId, "thread-1", 0);
    expect(reopened.exited).toBe(true);
  });
  it("a scheduled command stays parked while a human step is pending, then runs after the answer", async () => {
    const followUps: { id: string; threadId: string; content: string }[] = [];
    const f = fixture({ executionGate: async () => ({ allowed: true }), enqueueFollowUp: input => { followUps.push(input); f.store.put("outbox", input.id, input.threadId, { id: input.id, threadId: input.threadId, content: input.content, status: "persisted", runId: null }); } });
    enable("jobs.backgroundV1");
    const work = f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "COMMAND", title: "guarded", command: cmdSpec(f.root, ["-e", "0"]) });
    const scheduler = f.coordinator.scheduler;
    scheduler.register(command("background.wakeup.register"), { taskId: work.workId, trigger: { kind: "AT_UTC", dueAtMs: f.now() - 1 } });
    f.coordinator.requestHumanStep(command("background.human.request"), { requestId: "req-1", owner: f.owner, questionRevision: 1, responseSchema: {}, requiredAction: "answer", workId: work.workId });
    expect(f.coordinator.work(work.workId).state).toBe("WAITING_HUMAN");
    await scheduler.tick();
    await waitFor(() => scheduler.schedules()[0]?.state === "BLOCKED");
    const parked = scheduler.schedules()[0]!;
    expect(parked.state).toBe("BLOCKED");
    expect(parked.blockedReason).toBe("WAITING_HUMAN");
    expect(f.coordinator.work(work.workId).processIdentity).toBeNull();
    // The deferral holds the claimed firing for redelivery, never consumes it.
    const held = f.store.all<BackgroundOccurrenceV1>("backgroundOccurrence").filter(o => o.wakeupId === parked.wakeupId);
    expect(held).toHaveLength(1);
    expect(held[0]!.state).toBe("PENDING");
    f.coordinator.respondHumanStep(command("background.human.respond", {}, "thread-1"), { requestId: "req-1", revision: 1, response: { proceed: true } });
    expect(f.coordinator.work(work.workId).state).toBe("QUEUED");
    await waitFor(() => f.coordinator.work(work.workId).state === "SETTLED");
    expect(f.coordinator.work(work.workId).outcome).toBe("SUCCEEDED");
    expect(f.store.all<BackgroundOccurrenceV1>("backgroundOccurrence").filter(o => o.wakeupId === parked.wakeupId && o.state === "DELIVERED")).toHaveLength(1);
  });
  it("a blocked AT_UTC wakeup re-arms on resume instead of staying permanently dead", async () => {
    const f = fixture();
    enable("jobs.backgroundV1");
    let outcome: "BLOCKED" | "DELIVERED" = "BLOCKED";
    const scheduler = new DurableWakeupScheduler({ store: f.store, now: f.now, deliver: async () => outcome === "BLOCKED" ? { status: "BLOCKED", blockedReason: "EXTERNAL_HOLD" } : { status: "DELIVERED" } });
    cleanups.push(() => scheduler.stop());
    const dueAtMs = f.now() - 1;
    const wakeup = scheduler.register(command("background.wakeup.register"), { taskId: "task-1", trigger: { kind: "AT_UTC", dueAtMs } });
    await scheduler.tick();
    await waitFor(() => scheduler.schedules()[0]?.state === "BLOCKED");
    outcome = "DELIVERED";
    const resumed = scheduler.resume(command("background.wakeup.resume"), wakeup.wakeupId);
    expect(resumed.state).toBe("PENDING");
    expect(resumed.nextDueAtMs).toBe(dueAtMs);
    expect(resumed.scheduleRevision).toBe(wakeup.scheduleRevision + 1);
    await scheduler.tick();
    await waitFor(() => scheduler.schedules()[0]?.state === "DELIVERED");
    const occurrences = f.store.all<BackgroundOccurrenceV1>("backgroundOccurrence").filter(o => o.wakeupId === wakeup.wakeupId);
    expect(occurrences.filter(o => o.state === "CANCELLED")).toHaveLength(1);
    expect(occurrences.filter(o => o.state === "DELIVERED")).toHaveLength(1);
  });
  it("a human-deferred host-event firing delivers on resume without a new event", async () => {
    const f = fixture({ executionGate: async () => ({ allowed: true }), enqueueFollowUp: input => { f.store.put("outbox", input.id, input.threadId, { id: input.id, threadId: input.threadId, content: input.content, status: "persisted", runId: null }); } });
    enable("jobs.backgroundV1");
    const work = f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "COMMAND", title: "deferred event", command: cmdSpec(f.root, ["-e", "0"]) });
    const scheduler = f.coordinator.scheduler;
    scheduler.register(command("background.wakeup.register"), { taskId: work.workId, trigger: { kind: "HOST_EVENT", eventKind: "runtime.settled", correlationKey: "run-9" } });
    f.coordinator.requestHumanStep(command("background.human.request"), { requestId: "req-9", owner: f.owner, questionRevision: 1, responseSchema: {}, requiredAction: "answer", workId: work.workId });
    f.coordinator.notifyHostEvent("runtime.settled", "run-9", "runtime.settled:run-9");
    await waitFor(() => scheduler.schedules()[0]?.state === "BLOCKED");
    expect(scheduler.schedules()[0]!.blockedReason).toBe("WAITING_HUMAN");
    const held = f.store.all<BackgroundOccurrenceV1>("backgroundOccurrence").filter(o => o.wakeupId === scheduler.schedules()[0]!.wakeupId);
    expect(held).toHaveLength(1);
    expect(held[0]!.state).toBe("PENDING");
    f.coordinator.respondHumanStep(command("background.human.respond", {}, "thread-1"), { requestId: "req-9", revision: 1, response: { ok: true } });
    // The held occurrence redelivers under its original key — no second event.
    await waitFor(() => f.coordinator.work(work.workId).state === "SETTLED");
    expect(f.coordinator.work(work.workId).outcome).toBe("SUCCEEDED");
    expect(f.store.all<BackgroundOccurrenceV1>("backgroundOccurrence").filter(o => o.wakeupId === held[0]!.wakeupId && o.state === "DELIVERED")).toHaveLength(1);
  });
  it("settles a known unsubmitted firing when its blocked schedule is cancelled", () => {
    const f = fixture();
    const deliver = vi.fn(async () => ({ status: "DELIVERED" as const }));
    const scheduler = new DurableWakeupScheduler({ store: f.store, now: f.now, deliver, revalidate: () => ({ ok: false, blockedReason: "WAITING_HUMAN" }) });
    cleanups.push(() => scheduler.stop());
    const wakeup = scheduler.register(command("background.wakeup.register"), { taskId: "work", trigger: { kind: "HOST_EVENT", eventKind: "runtime.settled", correlationKey: "work" } });
    scheduler.hostEvent("runtime.settled", "work", "event");
    expect(scheduler.occurrences(wakeup.wakeupId)).toMatchObject([{ state: "PENDING", dispatch: "NOT_DISPATCHED" }]);
    scheduler.cancel(command("background.wakeup.cancel"), wakeup.wakeupId);
    expect(scheduler.occurrences(wakeup.wakeupId)).toMatchObject([{ state: "CANCELLED", dispatch: "NOT_DISPATCHED", leaseExpiresAtMs: null }]);
    expect(deliver).not.toHaveBeenCalled();
  });
  it("a held firing stranded before resume redelivers through recover()", async () => {
    const f = fixture({ executionGate: async () => ({ allowed: true }), enqueueFollowUp: input => { f.store.put("outbox", input.id, input.threadId, { id: input.id, threadId: input.threadId, content: input.content, status: "persisted", runId: null }); } });
    enable("jobs.backgroundV1");
    const work = f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "COMMAND", title: "stranded", command: cmdSpec(f.root, ["-e", "0"]) });
    const scheduler = f.coordinator.scheduler;
    scheduler.register(command("background.wakeup.register"), { taskId: work.workId, trigger: { kind: "HOST_EVENT", eventKind: "runtime.settled", correlationKey: "run-7" } });
    f.coordinator.requestHumanStep(command("background.human.request"), { requestId: "req-7", owner: f.owner, questionRevision: 1, responseSchema: {}, requiredAction: "answer", workId: work.workId });
    f.coordinator.notifyHostEvent("runtime.settled", "run-7", "runtime.settled:run-7");
    await waitFor(() => scheduler.schedules()[0]?.state === "BLOCKED");
    // Simulate a host interruption: the answer landed and the wakeup was
    // unblocked, but the process died before deliverHeld could re-claim the
    // held occurrence — restart reconciliation must still deliver it.
    const record = scheduler.allSchedules()[0]!;
    f.store.internal("fixture.stranded", null, () => {
      f.store.put("backgroundWakeup", record.wakeupId, null, { ...record, state: "PENDING", blockedReason: null });
      const w = f.store.get<BackgroundWorkRecord>("backgroundWork", work.workId)!;
      f.store.put("backgroundWork", work.workId, work.owner.threadId, { ...w, state: "QUEUED" });
    });
    scheduler.recover();
    await waitFor(() => f.coordinator.work(work.workId).state === "SETTLED");
    expect(f.coordinator.work(work.workId).outcome).toBe("SUCCEEDED");
  });
  it("recovery never executes a held firing while the feature is disabled", async () => {
    const f = fixture({ executionGate: async () => ({ allowed: true }), enqueueFollowUp: input => { f.store.put("outbox", input.id, input.threadId, { id: input.id, threadId: input.threadId, content: input.content, status: "persisted", runId: null }); } });
    enable("jobs.backgroundV1");
    const work = f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "COMMAND", title: "gated", command: cmdSpec(f.root, ["-e", "0"]) });
    const scheduler = f.coordinator.scheduler;
    const wakeup = scheduler.register(command("background.wakeup.register"), { taskId: work.workId, trigger: { kind: "HOST_EVENT", eventKind: "runtime.settled", correlationKey: "run-8" } });
    f.coordinator.requestHumanStep(command("background.human.request"), { requestId: "req-8", owner: f.owner, questionRevision: 1, responseSchema: {}, requiredAction: "answer", workId: work.workId });
    f.coordinator.notifyHostEvent("runtime.settled", "run-8", "runtime.settled:run-8");
    await waitFor(() => scheduler.schedules()[0]?.state === "BLOCKED");
    const record = scheduler.allSchedules()[0]!;
    f.store.internal("fixture.stranded", null, () => {
      f.store.put("backgroundWakeup", record.wakeupId, null, { ...record, state: "PENDING", blockedReason: null });
      const w = f.store.get<BackgroundWorkRecord>("backgroundWork", work.workId)!;
      f.store.put("backgroundWork", work.workId, work.owner.threadId, { ...w, state: "QUEUED" });
    });
    __setCapabilityFlagForTests("jobs.backgroundV1", false);
    scheduler.recover();
    await new Promise(resolve => setTimeout(resolve, 300));
    expect(f.coordinator.work(work.workId).processIdentity).toBeNull();
    expect(f.store.all<BackgroundOccurrenceV1>("backgroundOccurrence").find(o => o.wakeupId === wakeup.wakeupId)!.state).toBe("PENDING");
    __setCapabilityFlagForTests("jobs.backgroundV1", true);
    scheduler.recover();
    await waitFor(() => f.coordinator.work(work.workId).state === "SETTLED");
  });
  it("an auto-resumed schedule keeps an operator pause", async () => {
    const followUps: { id: string; threadId: string; content: string }[] = [];
    const f = fixture({ executionGate: async () => ({ allowed: true }), enqueueFollowUp: input => { followUps.push(input); f.store.put("outbox", input.id, input.threadId, { id: input.id, threadId: input.threadId, content: input.content, status: "persisted", runId: null }); } });
    enable("jobs.backgroundV1");
    const work = f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "COMMAND", title: "paused", command: cmdSpec(f.root, ["-e", "0"]) });
    const scheduler = f.coordinator.scheduler;
    const wakeup = scheduler.register(command("background.wakeup.register"), { taskId: work.workId, trigger: { kind: "AT_UTC", dueAtMs: f.now() - 1 } });
    f.coordinator.requestHumanStep(command("background.human.request"), { requestId: "req-p", owner: f.owner, questionRevision: 1, responseSchema: {}, requiredAction: "answer", workId: work.workId });
    await scheduler.tick();
    await waitFor(() => scheduler.schedules()[0]?.state === "BLOCKED");
    scheduler.pause(command("background.wakeup.pause"), wakeup.wakeupId);
    f.coordinator.respondHumanStep(command("background.human.respond", {}, "thread-1"), { requestId: "req-p", revision: 1, response: { ok: true } });
    const after = scheduler.allSchedules().find(w => w.wakeupId === wakeup.wakeupId)!;
    expect(after.paused).toBe(true);
    expect(after.state).toBe("PENDING");
    await new Promise(resolve => setTimeout(resolve, 300));
    expect(f.coordinator.work(work.workId).processIdentity).toBeNull();
    const resumed = scheduler.resume(command("background.wakeup.resume"), wakeup.wakeupId);
    expect(resumed.paused).toBe(false);
    await waitFor(() => f.coordinator.work(work.workId).state === "SETTLED");
  });
  it("a scheduled firing during an in-flight manual start waits instead of blocking", async () => {
    let release!: () => void;
    const gateHeld = new Promise<void>(resolve => { release = resolve; });
    const f = fixture({ executionGate: async () => { await gateHeld; return { allowed: true }; } });
    enable("jobs.backgroundV1");
    const work = f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "COMMAND", title: "overlap", command: cmdSpec(f.root, ["-e", "0"]) });
    const scheduler = f.coordinator.scheduler;
    const wakeup = scheduler.register(command("background.wakeup.register"), { taskId: work.workId, trigger: { kind: "AT_UTC", dueAtMs: f.now() - 1 } });
    const manual = f.coordinator.startCommand(work.workId);
    await new Promise(resolve => setTimeout(resolve, 20));
    const ticked = scheduler.tick();
    release();
    await Promise.all([manual, ticked]);
    await waitFor(() => f.coordinator.work(work.workId).state === "SETTLED");
    const record = scheduler.allSchedules().find(w => w.wakeupId === wakeup.wakeupId)!;
    expect(record.state).toBe("DELIVERED");
    expect(record.blockedReason).toBeNull();
  });
  it("a direct start on a revoked owner blocks instead of launching", async () => {
    const f = fixture({ executionGate: async () => ({ allowed: true }) });
    enable("jobs.backgroundV1");
    const owner = { ...f.owner, runId: "run-1" };
    f.store.internal("fixture.run", f.owner.threadId, () => f.store.put("thread", f.owner.threadId, f.owner.threadId, { ...f.thread, runId: "run-1" }));
    const work = f.coordinator.admit(command("background.work.admit"), { owner, kind: "COMMAND", title: "stale", command: cmdSpec(f.root, ["-e", "0"]) });
    f.store.internal("fixture.revoke", f.owner.threadId, () => f.store.put("thread", f.owner.threadId, f.owner.threadId, { ...f.thread, runId: "run-2" }));
    const result = await f.coordinator.startCommand(work.workId);
    expect(result.state).toBe("BLOCKED");
    expect(result.blockedReason).toBe("OWNER_REVOKED");
    expect(result.processIdentity).toBeNull();
  });
  it("an answer after the owner run changed is denied before any follow-up", () => {
    const followUps: unknown[] = [];
    const f = fixture({ enqueueFollowUp: input => { followUps.push(input); } });
    enable("jobs.backgroundV1");
    const owner = { ...f.owner, runId: "run-1" };
    f.store.internal("fixture.run", f.owner.threadId, () => f.store.put("thread", f.owner.threadId, f.owner.threadId, { ...f.thread, runId: "run-1" }));
    const work = f.coordinator.admit(command("background.work.admit"), { owner, kind: "MAINTENANCE", title: "x" });
    f.coordinator.requestHumanStep(command("background.human.request"), { requestId: "req-1", owner, questionRevision: 1, responseSchema: {}, requiredAction: "answer", workId: work.workId });
    f.store.internal("fixture.revoke", f.owner.threadId, () => f.store.put("thread", f.owner.threadId, f.owner.threadId, { ...f.thread, runId: "run-2" }));
    expect(() => f.coordinator.respondHumanStep(command("background.human.respond", {}, "thread-1"), { requestId: "req-1", revision: 1, response: { a: 1 } })).toThrowError(expect.objectContaining({ code: "CAPABILITY_DENIED" }));
    expect(followUps).toHaveLength(0);
  });
  it("host-event wakeups deliver when the host publishes an allowlisted event", async () => {
    const f = fixture({ executionGate: async () => ({ allowed: true }) });
    enable("jobs.backgroundV1");
    const work = f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "COMMAND", title: "on event", command: cmdSpec(f.root, ["-e", "0"]) });
    f.coordinator.scheduler.register(command("background.wakeup.register"), { taskId: work.workId, trigger: { kind: "HOST_EVENT", eventKind: "runtime.settled", correlationKey: "thread-1" } });
    f.coordinator.notifyHostEvent("runtime.settled", "other-key", "evt-1");
    expect(f.coordinator.work(work.workId).processIdentity).toBeNull();
    f.coordinator.notifyHostEvent("runtime.settled", "thread-1", "evt-1");
    await waitFor(() => f.coordinator.work(work.workId).state === "SETTLED");
    expect(f.coordinator.work(work.workId).outcome).toBe("SUCCEEDED");
    const before = f.store.all("backgroundOccurrence").length;
    f.coordinator.notifyHostEvent("runtime.settled", "thread-1", "evt-1");
    expect(f.store.all("backgroundOccurrence")).toHaveLength(before);
  });
});

describe("M10-S12/T06 shutdown and clock movement", () => {
  it("clears unused timeout handles after idle shutdown", async () => {
    const f = fixture();
    vi.useFakeTimers();
    try {
      const baseline = vi.getTimerCount();
      await f.coordinator.drain();
      expect(vi.getTimerCount()).toBe(baseline);
    } finally {
      vi.useRealTimers();
    }
  });

  it("drain prevents new admission, cancels eligible work and records uncertainty", async () => {
    const f = fixture();
    enable("jobs.backgroundV1");
    const work = f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "MAINTENANCE", title: "queued" });
    const scheduler = f.coordinator.scheduler;
    scheduler.register(command("background.wakeup.register"), { taskId: work.workId, trigger: { kind: "AT_UTC", dueAtMs: f.now() + 1_000 } });
    const drained = await f.coordinator.drain(100);
    expect(drained.cancelled).toBeGreaterThanOrEqual(1);
    expect(f.coordinator.work(work.workId).state).toBe("SETTLED");
    expect(f.coordinator.work(work.workId).outcome).toBe("CANCELLED");
    f.advance(2_000);
    expect(await scheduler.tick()).toHaveLength(0);
    expect(scheduler.schedules()[0]!.lastRunAtMs).toBeNull();
    expect(f.store.all("backgroundAdmission")).toHaveLength(0);
    expect(() => f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "MAINTENANCE", title: "late" })).toThrowError(expect.objectContaining({ code: "HOST_CLOSING" }));
  });
  it("wall-clock jumps preserve occurrence identity and timezone stays display metadata", async () => {
    const f = fixture();
    let deliveries = 0;
    const scheduler = new DurableWakeupScheduler({ store: f.store, now: f.now, deliver: async () => { deliveries++; return { status: "DELIVERED" as const }; } });
    cleanups.push(() => scheduler.stop());
    const anchor = f.now();
    scheduler.register(command("background.wakeup.register"), { taskId: "t", trigger: { kind: "INTERVAL_UTC", anchorMs: anchor, intervalMs: 60_000 }, scheduleTimezone: "America/New_York" });
    f.advance(5 * 60_000);
    await scheduler.tick();
    await waitFor(() => deliveries === 1);
    const occurrences = f.store.all<BackgroundOccurrenceV1>("backgroundOccurrence");
    expect(occurrences.filter(item => item.state === "SKIPPED")).toHaveLength(4);
    expect(occurrences.filter(item => item.state === "DELIVERED")).toHaveLength(1);
    const delivered = occurrences.find(item => item.state === "DELIVERED")!;
    expect(delivered.occurrenceKey).toBe(occurrenceKeyForTime(scheduler.schedules()[0]!.wakeupId, 1, anchor + 5 * 60_000));
    f.advance(-3 * 60_000);
    await scheduler.tick();
    expect(deliveries).toBe(1);
    expect(scheduler.schedules()[0]!.scheduleTimezone).toBe("America/New_York");
  });
});

describe("M10-G03 rollback", () => {
  it("pauses wakeups, preserves receipts and quarantines uncertain work", () => {
    const f = fixture();
    enable("jobs.backgroundV1");
    const work = f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "MAINTENANCE", title: "q" });
    f.coordinator.scheduler.register(command("background.wakeup.register"), { taskId: work.workId, trigger: { kind: "INTERVAL_UTC", anchorMs: f.now(), intervalMs: 60_000 } });
    const unknown = f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "MAINTENANCE", title: "u" });
    f.coordinator.markUnknown(unknown.workId, "uncertain dispatch");
    const result = f.coordinator.pauseAll(command("background.pauseAll"));
    expect(result.paused).toBe(1);
    expect(result.quarantined).toBe(1);
    expect(f.coordinator.work(unknown.workId).state).toBe("UNKNOWN");
    expect(f.coordinator.work(work.workId).outcome).toBe("CANCELLED");
    expect(f.coordinator.scheduler.schedules()[0]!.paused).toBe(true);
    expect(f.store.all("backgroundOccurrence").length).toBeGreaterThanOrEqual(0);
    expect(f.coordinator.closeSummary()).toMatchObject({ serviceSupervisorProven: false, runWorkStopsWithApp: true, uncertainWork: 1 });
  });
});

describe("M10 host command binding", () => {
  function serviceFixture() {
    const root = mkdtempSync(join(realpathSync(tmpdir()), "m10-service-"));
    const store = new Store(join(root, "state"));
    const runtime: RuntimeAdapter = {
      configure: () => {}, models: async () => [{ id: "test/model", provider: "test", name: "Test" }],
      start: async () => {}, followUp: async () => {}, cancel: async () => {}, compact: async () => {},
      history: async () => [], dispose: async () => {},
    };
    const service = new Service(store, runtime);
    cleanups.push(async () => { await service.dispose().catch(() => {}); store.close(); rmSync(root, { recursive: true, force: true }); });
    return { store, service, root };
  }
  it("admits background work through Service.command with host-derived ownership", async () => {
    enable("jobs.backgroundV1");
    const { service } = serviceFixture();
    const created = await service.command(command("thread.create", { title: "Background owner" }));
    const thread = created.result as Thread;
    const receipt = await service.command(command("background.work.admit", { kind: "MAINTENANCE", title: "verify" }, thread.id));
    const record = receipt.result as BackgroundWorkRecord;
    expect(record.owner.threadId).toBe(thread.id);
    expect(record.state).toBe("QUEUED");
    const replay = await service.command({ ...command("background.work.admit", { kind: "MAINTENANCE", title: "verify" }, thread.id), id: receipt.commandId });
    expect(replay.eventSeq).toBe(receipt.eventSeq);
    const view = service.backgroundWork.works(thread.id);
    expect(view).toHaveLength(1);
  });
  it("routes human respond/decline and intake configuration through the same command path", async () => {
    enable("jobs.backgroundV1", "integrations.intakeV1");
    const { service } = serviceFixture();
    const created = await service.command(command("thread.create", { title: "Handoff owner" }));
    const thread = created.result as Thread;
    const work = (await service.command(command("background.work.admit", { kind: "MAINTENANCE", title: "w" }, thread.id))).result as BackgroundWorkRecord;
    await service.command(command("background.human.request", { requestId: "req-1", questionRevision: 1, responseSchema: { type: "object", properties: { answer: { type: "string" } }, required: ["answer"] }, requiredAction: "answer", workId: work.workId }, thread.id));
    expect(service.backgroundWork.work(work.workId).state).toBe("WAITING_HUMAN");
    const answered = await service.command(command("background.human.respond", { requestId: "req-1", revision: 1, response: { answer: "yes" } }, thread.id));
    expect((answered.result as { inputId: string }).inputId).toBe("human:req-1:1");
    expect(service.backgroundWork.work(work.workId).state).toBe("QUEUED");
    const configured = await service.command(command("intake.configure", { repositoryId: 1442565952, enabled: true }));
    expect((configured.result as { repositoryId: number }).repositoryId).toBe(1442565952);
    await expect(service.command(command("intake.push", {}))).rejects.toMatchObject({ code: "UNKNOWN_COMMAND" });
  });
});
describe("M10 v6 completeness regressions", () => {
  it("S04: account mismatch and host authority revalidation block delivery without retry", async () => {
    const f = fixture();
    enable("jobs.backgroundV1");
    const store = f.store;
    store.internal("fixture.account", f.thread.id, () => store.put("thread", f.thread.id, f.thread.id, { ...f.thread, accountId: "account-a", modelId: "test/model" }));
    const work = f.coordinator.admit(command("background.work.admit"), { owner: { ...f.owner, accountBinding: "account-a" }, kind: "MAINTENANCE", title: "account bound" });
    f.coordinator.scheduler.register(command("background.wakeup.register"), { taskId: work.workId, trigger: { kind: "AT_UTC", dueAtMs: f.now() } });
    store.internal("fixture.account.change", f.thread.id, () => store.put("thread", f.thread.id, f.thread.id, { ...f.thread, accountId: "account-b" }));
    await f.coordinator.scheduler.tick();
    expect(f.coordinator.scheduler.schedules()[0]!.blockedReason).toBe("ACCOUNT_MISMATCH");
    expect(f.store.all("backgroundAdmission")).toHaveLength(0);
  });
  it("S04: injected grant/budget authority hook blocks delivery", async () => {
    const root = mkdtempSync(join(realpathSync(tmpdir()), "m10-authority-"));
    const store = new Store(join(root, "state"));
    let clock = 1_700_000_000_000;
    const coordinator = new BackgroundWorkCoordinator({ store, now: () => clock, revalidateAuthority: () => ({ ok: false, blockedReason: "BUDGET_EXHAUSTED" }) });
    cleanups.push(() => { coordinator.dispose(); store.close(); rmSync(root, { recursive: true, force: true, maxRetries: 8, retryDelay: 150 }); });
    enable("jobs.backgroundV1");
    const thread: Thread = { id: "thread-1", title: "Owner", projectName: null, createdAt: new Date(clock).toISOString(), updatedAt: new Date(clock).toISOString(), status: "ready", epoch: 0, runId: null, modelId: null, sessionPath: null };
    store.internal("fixture.thread", thread.id, () => store.put("thread", thread.id, thread.id, thread));
    const owner = { threadId: thread.id, runId: null, epoch: 0, projectId: null, workspaceId: null, accountBinding: null };
    const work = coordinator.admit(command("background.work.admit"), { owner, kind: "MAINTENANCE", title: "budget" });
    coordinator.scheduler.register(command("background.wakeup.register"), { taskId: work.workId, trigger: { kind: "AT_UTC", dueAtMs: clock } });
    await coordinator.scheduler.tick();
    expect(coordinator.scheduler.schedules()[0]!.state).toBe("BLOCKED");
    expect(coordinator.scheduler.schedules()[0]!.blockedReason).toBe("BUDGET_EXHAUSTED");
    expect(store.all("backgroundAdmission")).toHaveLength(0);
  });
  it("S01: one tick inspects at most 50 due records across wakeups and expired claims", async () => {
    const f = fixture();
    const scheduler = new DurableWakeupScheduler({ store: f.store, now: f.now, deliver: async () => ({ status: "DELIVERED" as const }) });
    cleanups.push(() => scheduler.stop());
    for (let index = 0; index < 60; index++) scheduler.register(command("background.wakeup.register"), { taskId: `task-${index}`, trigger: { kind: "AT_UTC", dueAtMs: f.now() } });
    await scheduler.tick();
    await waitFor(() => f.store.all("backgroundAdmission").length >= 50);
    expect(f.store.all("backgroundAdmission")).toHaveLength(50);
    await scheduler.tick();
    await waitFor(() => f.store.all("backgroundAdmission").length === 60);
  });
  it("does not spend the recovery batch on expired claims whose schedules are paused", async () => {
    const f = fixture();
    const deliver = vi.fn(async () => ({ status: "DELIVERED" as const }));
    const scheduler = new DurableWakeupScheduler({ store: f.store, now: f.now, deliver });
    cleanups.push(() => scheduler.stop());
    for (let index = 0; index <= 50; index++) {
      const wakeupId = `recovery-${String(index).padStart(2, "0")}`;
      scheduler.register(command("background.wakeup.register"), { wakeupId, taskId: "work", trigger: { kind: "HOST_EVENT", eventKind: "runtime.settled", correlationKey: wakeupId } });
      const key = occurrenceKeyForEvent(wakeupId, 1, "event");
      const stamp = new Date(f.now()).toISOString();
      f.store.internal("fixture.expired-claim", null, () => f.store.put("backgroundOccurrence", key, null, {
        occurrenceKey: key, wakeupId, scheduleRevision: 1, scheduledDueAtMs: null, hostEventId: "event",
        state: "CLAIMED", dispatch: "NOT_DISPATCHED", claimGeneration: 1, admissionId: null,
        leaseExpiresAtMs: f.now() - 1, createdAt: stamp, updatedAt: stamp,
      } satisfies BackgroundOccurrenceV1));
      if (index < 50) scheduler.pause(command("background.wakeup.pause"), wakeupId);
    }
    expect((await scheduler.tick()).map(item => item.wakeup.wakeupId)).toEqual(["recovery-50"]);
    expect(deliver).toHaveBeenCalledTimes(1);
  });
  it("records an older interval delivery without clearing a newer block", async () => {
    const f = fixture();
    const scheduler = new DurableWakeupScheduler({ store: f.store, now: f.now, deliver: async ({ occurrence }) =>
      occurrence.scheduledDueAtMs === anchor ? { status: "UNCERTAIN", reason: "Receipt delayed" } : { status: "BLOCKED", blockedReason: "TEMPORARILY_UNAVAILABLE" } });
    cleanups.push(() => scheduler.stop());
    const anchor = f.now();
    const { wakeupId } = scheduler.register(command("background.wakeup.register"), { taskId: "work", trigger: { kind: "INTERVAL_UTC", anchorMs: anchor, intervalMs: 60_000 } });
    await scheduler.tick();
    const oldKey = occurrenceKeyForTime(wakeupId, 1, anchor);
    expect(scheduler.occurrences(wakeupId)[0]?.state).toBe("UNKNOWN");
    f.advance(60_000);
    await scheduler.tick();
    const blocked = scheduler.schedules().find(item => item.wakeupId === wakeupId)!;
    expect(blocked).toMatchObject({ state: "BLOCKED", blockedReason: "TEMPORARILY_UNAVAILABLE" });
    expect(scheduler.reconcile(command("background.occurrence.reconcile"), oldKey, { observed: "DELIVERED" }).state).toBe("DELIVERED");
    expect(scheduler.schedules().find(item => item.wakeupId === wakeupId)).toMatchObject({
      state: "BLOCKED", blockedReason: blocked.blockedReason, nextDueAtMs: blocked.nextDueAtMs, lastRunAtMs: f.now(),
    });
  });
  it("S11: every missed occurrence is persisted, not only a bounded sample", async () => {
    const f = fixture();
    const scheduler = new DurableWakeupScheduler({ store: f.store, now: f.now, deliver: async () => ({ status: "DELIVERED" as const }) });
    cleanups.push(() => scheduler.stop());
    const anchor = f.now();
    scheduler.register(command("background.wakeup.register"), { taskId: "t", trigger: { kind: "INTERVAL_UTC", anchorMs: anchor, intervalMs: 60_000 } });
    f.advance(60 * 60_000);
    await scheduler.tick();
    await waitFor(() => f.store.all<BackgroundOccurrenceV1>("backgroundOccurrence").some(item => item.state === "DELIVERED"));
    const occurrences = f.store.all<BackgroundOccurrenceV1>("backgroundOccurrence");
    expect(occurrences.filter(item => item.state === "SKIPPED")).toHaveLength(59);
    expect(scheduler.schedules()[0]!.skippedTotal).toBe(59);
    expect(occurrences.filter(item => item.state === "DELIVERED")).toHaveLength(1);
  });
  it("S08: a confirmed successful idle teardown releases its permit", async () => {
    const gate = new ModelCapacity(1);
    const f = fixture({ gate, idleExecutor: async () => ({ outcome: "SUCCEEDED", teardownConfirmed: true }) });
    enable("jobs.backgroundV1", "jobs.idleReviewV1");
    const idle = { projectId: "p1", profileId: "verify", intervalMs: 60_000 };
    f.coordinator.configureIdle(command("background.idle.configure"), { ...idle, enabled: true });
    const work = f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "MAINTENANCE", title: "idle", idle });
    f.advance(60_000);
    await f.coordinator.scheduler.tick();
    await waitFor(() => !f.coordinator.permitHeld(work.workId));
    const release = await gate.acquire("background", null);
    release();
  });
  it("S07: a new parent turn invalidates actionable fork output while history remains", () => {
    const f = fixture();
    enable("jobs.backgroundV1");
    const review = f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "REVIEW", title: "fork", parentThreadId: "thread-1", advisory: true });
    expect(review.invalidated).toBe(false);
    f.coordinator.noteForegroundAdmission("thread-1");
    const after = f.coordinator.work(review.workId);
    expect(after.invalidated).toBe(true);
    expect(after.state).toBe("BLOCKED");
    expect(f.store.get("backgroundWork", review.workId)).not.toBeNull();
  });
  it("admission rejects malformed command specs and non-read-only idle kinds", () => {
    const f = fixture();
    enable("jobs.backgroundV1", "jobs.idleReviewV1");
    expect(() => f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "COMMAND", title: "bad", command: { executable: "", argv: [], cwd: f.root, profileId: "p" } })).toThrowError(expect.objectContaining({ code: "INVALID_INPUT" }));
    expect(() => f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "COMMAND", title: "bad", command: { executable: process.execPath, argv: [42 as unknown as string], cwd: f.root, profileId: "p" } })).toThrowError(expect.objectContaining({ code: "INVALID_INPUT" }));
    f.coordinator.configureIdle(command("background.idle.configure"), { projectId: "p1", profileId: "verify", enabled: true, intervalMs: 60_000 });
    expect(() => f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "EXTERNAL_TASK", title: "bad idle", idle: { projectId: "p1", profileId: "verify", intervalMs: 60_000 }, intakeId: "x" })).toThrowError(expect.objectContaining({ code: "INVALID_INPUT" }));
  });
  it("G03: rollback stops owned running commands and preserves their receipts", async () => {
    const f = fixture({ executionGate: async () => ({ allowed: true }) });
    enable("jobs.backgroundV1");
    const work = f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "COMMAND", title: "running", command: { executable: process.execPath, argv: ["-e", "setTimeout(()=>{}, 30000)"], cwd: f.root, profileId: "p" } });
    const started = await f.coordinator.startCommand(work.workId);
    expect(f.coordinator.work(work.workId).state).toBe("RUNNING");
    const result = f.coordinator.pauseAll(command("background.pauseAll"));
    expect(result.stopped).toBeGreaterThanOrEqual(1);
    if (process.platform === "linux") {
      await waitFor(() => f.coordinator.work(work.workId).state === "SETTLED");
      expect(f.coordinator.work(work.workId).outcome).toBe("FAILED");
      expect(f.coordinator.exitReceipt(work.workId)).not.toBeNull();
    } else {
      // Off Linux the owned identity is unproven, so rollback quarantines the
      // process as UNKNOWN without signalling it; tear it down directly.
      await waitFor(() => f.coordinator.work(work.workId).state === "UNKNOWN");
      expect(f.coordinator.work(work.workId).outcome).toBeNull();
      killOwnedProcess(started.processIdentity!.pid);
      await waitFor(() => f.coordinator.exitReceipt(work.workId) !== null);
    }
  });
  it("does not retry a transient read after its wakeup is cancelled during backoff", async () => {
    const f = fixture();
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    try {
      const deliver = vi.fn(async () => ({ status: "FAILED" as const, error: "temporary read failure", transient: true }));
      const scheduler = new DurableWakeupScheduler({ store: f.store, now: f.now, deliver });
      const wakeup = scheduler.register(command("background.wakeup.register"), { taskId: "t", trigger: { kind: "AT_UTC", dueAtMs: f.now() } });
      await scheduler.tick();
      expect(deliver).toHaveBeenCalledTimes(1);
      const [admitted] = scheduler.occurrences(wakeup.wakeupId);
      scheduler.cancel(command("background.wakeup.cancel"), wakeup.wakeupId);
      await vi.advanceTimersByTimeAsync(2_100);
      expect(deliver).toHaveBeenCalledTimes(1);
      expect(scheduler.schedules()[0]!.state).toBe("CANCELLED");
      expect(scheduler.occurrences(wakeup.wakeupId)[0]).toMatchObject({ state: "CANCELLED", dispatch: "DISPATCHED_UNCONFIRMED", admissionId: admitted!.admissionId });
      expect(f.store.get("backgroundAdmission", admitted!.occurrenceKey)).toMatchObject({ admissionId: admitted!.admissionId });
    } finally { vi.useRealTimers(); }
  });

  it("holds a paused backoff firing and resumes it with the original admission", async () => {
    const f = fixture();
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    try {
      let fail = true;
      const deliver = vi.fn(async () => fail ? { status: "FAILED" as const, error: "temporary read failure", transient: true } : { status: "DELIVERED" as const });
      const scheduler = new DurableWakeupScheduler({ store: f.store, now: f.now, deliver });
      cleanups.push(() => scheduler.stop());
      const wakeup = scheduler.register(command("background.wakeup.register"), { taskId: "t", trigger: { kind: "AT_UTC", dueAtMs: f.now() } });
      await scheduler.tick();
      const [admitted] = scheduler.occurrences(wakeup.wakeupId);
      expect(admitted).toMatchObject({ state: "CLAIMED", dispatch: "DISPATCHED_UNCONFIRMED", admissionId: expect.any(String) });
      scheduler.pause(command("background.wakeup.pause"), wakeup.wakeupId);
      await vi.advanceTimersByTimeAsync(2_100);
      expect(deliver).toHaveBeenCalledTimes(1);
      expect(scheduler.schedules()[0]).toMatchObject({ state: "PENDING", paused: true, occurrenceKey: null, leaseExpiresAtMs: null });
      expect(scheduler.occurrences(wakeup.wakeupId)[0]).toMatchObject({ state: "PENDING", dispatch: "NOT_DISPATCHED", admissionId: admitted!.admissionId });
      fail = false;
      scheduler.resume(command("background.wakeup.resume"), wakeup.wakeupId);
      await vi.advanceTimersByTimeAsync(1);
      expect(deliver).toHaveBeenCalledTimes(2);
      expect(scheduler.occurrences(wakeup.wakeupId)[0]).toMatchObject({ state: "DELIVERED", dispatch: "RECEIPT_CONFIRMED", admissionId: admitted!.admissionId, claimGeneration: admitted!.claimGeneration + 1 });
      expect(f.store.all("backgroundAdmission")).toHaveLength(1);
    } finally { vi.useRealTimers(); }
  });

  it("does not retry an older claim generation after backoff", async () => {
    const f = fixture();
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    try {
      const deliver = vi.fn(async () => ({ status: "FAILED" as const, error: "temporary read failure", transient: true }));
      const scheduler = new DurableWakeupScheduler({ store: f.store, now: f.now, deliver });
      cleanups.push(() => scheduler.stop());
      const wakeup = scheduler.register(command("background.wakeup.register"), { taskId: "t", trigger: { kind: "AT_UTC", dueAtMs: f.now() } });
      await scheduler.tick();
      const [admitted] = scheduler.occurrences(wakeup.wakeupId);
      const newer = { ...admitted!, claimGeneration: admitted!.claimGeneration + 1 };
      f.store.internal("fixture.newer-generation", null, () => f.store.put("backgroundOccurrence", newer.occurrenceKey, null, newer));
      await vi.advanceTimersByTimeAsync(2_100);
      expect(deliver).toHaveBeenCalledTimes(1);
      expect(scheduler.occurrences(wakeup.wakeupId)[0]).toEqual(newer);
    } finally { vi.useRealTimers(); }
  });
});

describe("M10-T01 canonical output custody reproduction (#2014)", () => {
  // T01 evidence: every assertion below states the canonical contract the
  // command-output path must satisfy. On the baseline each fails for the
  // specific audited mismatch — not for import or toolchain errors — and
  // T02/T03 implementations make them pass. Controls that already hold on
  // the baseline are marked (control).
  const HANDLE = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
  const spec = (f: ReturnType<typeof fixture>, argv: string[]) => ({ executable: process.execPath, argv, cwd: f.root, profileId: "p" });

  it("issues a canonical M04 handle that context_result_read accepts and custody resolves", async () => {
    const f = fixture({ executionGate: async () => ({ allowed: true }) });
    enable("jobs.backgroundV1");
    const work = f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "COMMAND", title: "custody", command: spec(f, ["-e", "console.log('custody bytes')"]) });
    await f.coordinator.startCommand(work.workId);
    await waitFor(() => f.coordinator.work(work.workId).state === "SETTLED");
    await waitFor(() => !!f.coordinator.work(work.workId).outputRef);
    const handle = f.coordinator.work(work.workId).outputRef;
    // Canonical contract: outputRef is a UUID that context_result_read's
    // z.uuid() schema accepts and private custody at the service's location
    // (store.dataDir) resolves.
    expect(handle).toMatch(HANDLE);
    expect(contextResultReadArgs.safeParse({ handle, offset: 0, length: 1 }).success).toBe(true);
    const custody = await openContextResultCustody(f.store.dataDir);
    await expect(custody.getRecord!(handle!)).resolves.toMatchObject({ handle });
  });

  it("preserves multi-byte scalars split across chunk boundaries with interleaved stderr", async () => {
    const f = fixture({ executionGate: async () => ({ allowed: true }) });
    enable("jobs.backgroundV1");
    const text = "héllo wörld —€× tail";
    // One byte per write on stdout plus a whole-UTF-8 stderr write: every
    // scalar boundary is split, and per-chunk toString('utf8') yields U+FFFD.
    const script = `const b=Buffer.from(${JSON.stringify(text)},"utf8"),fs=require("fs");let i=0;const t=setInterval(()=>{if(i>=b.length){clearInterval(t);return;}fs.writeSync(1,b.subarray(i,i+1));if(i===4)fs.writeSync(2,"mark\\n");i++},12);`;
    const work = f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "COMMAND", title: "split", command: spec(f, ["-e", script]) });
    await f.coordinator.startCommand(work.workId);
    await waitFor(() => f.coordinator.work(work.workId).state === "SETTLED");
    const output = f.coordinator.readOutput(work.workId, "thread-1", 0).output;
    // Streams multiplex in arrival order, so the stderr write may land
    // mid-word; removing it must restore the exact stdout text with every
    // scalar intact.
    expect(output).not.toContain("�");
    expect(output).toContain("mark\n");
    expect(output.replace("mark\n", "")).toContain(text);
  });

  it("round-trips complete multi-byte scalars delivered in aligned chunks (control)", async () => {
    const f = fixture({ executionGate: async () => ({ allowed: true }) });
    enable("jobs.backgroundV1");
    const text = "€é—".repeat(100);
    const work = f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "COMMAND", title: "aligned", command: spec(f, ["-e", `require("fs").writeSync(1,${JSON.stringify(text)})`]) });
    await f.coordinator.startCommand(work.workId);
    await waitFor(() => f.coordinator.work(work.workId).state === "SETTLED");
    expect(f.coordinator.readOutput(work.workId, "thread-1", 0).output).toBe(text);
  });

  it("bounds the retained window in bytes, not UTF-16 units", async () => {
    const f = fixture({ executionGate: async () => ({ allowed: true }) });
    enable("jobs.backgroundV1");
    // 200_000 '€' is 600_000 bytes but only 200_000 UTF-16 code units, so the
    // code-unit comparison against outputWindowBytes never trims on baseline.
    const work = f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "COMMAND", title: "window", command: spec(f, ["-e", `require("fs").writeSync(1,"€".repeat(200000))`]) });
    await f.coordinator.startCommand(work.workId);
    await waitFor(() => f.coordinator.work(work.workId).state === "SETTLED");
    const read = f.coordinator.readOutput(work.workId, "thread-1", 0);
    expect(Buffer.byteLength(read.output, "utf8")).toBeLessThanOrEqual(BACKGROUND_SCHEDULER_LIMITS.outputWindowBytes);
    expect(read.truncated).toBe(true);
  });

  it("bounds the retained ASCII window at the byte limit (control)", async () => {
    const f = fixture({ executionGate: async () => ({ allowed: true }) });
    enable("jobs.backgroundV1");
    const work = f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "COMMAND", title: "ascii-window", command: spec(f, ["-e", `require("fs").writeSync(1,"a".repeat(600000))`]) });
    await f.coordinator.startCommand(work.workId);
    await waitFor(() => f.coordinator.work(work.workId).state === "SETTLED");
    const read = f.coordinator.readOutput(work.workId, "thread-1", 0);
    expect(Buffer.byteLength(read.output, "utf8")).toBe(BACKGROUND_SCHEDULER_LIMITS.outputWindowBytes);
    expect(read.truncated).toBe(true);
  });

  it("mints the published digest over the final close-tail bytes", async () => {
    const f = fixture({ executionGate: async () => ({ allowed: true }) });
    enable("jobs.backgroundV1");
    // The child hands its stdout to a grandchild that writes the tail only
    // after the owned process exits: 'exit' publishes the handle, then
    // 'close' persists the tail — so the minted digest predates final bytes.
    const script = `const g=require("child_process").spawn(process.execPath,["-e","setTimeout(()=>process.stdout.write('tail-after-exit'),150)"],{stdio:["ignore","inherit","inherit"],detached:true});g.unref();process.stdout.write("head\\n");`;
    const work = f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "COMMAND", title: "tail", command: spec(f, ["-e", script]) });
    await f.coordinator.startCommand(work.workId);
    // Publication happens at close — after the grandchild's tail lands — so
    // the minted digest covers the final retained window.
    await waitFor(() => !!f.coordinator.work(work.workId).outputRef);
    await waitFor(() => f.coordinator.readOutput(work.workId, "thread-1", 0).output === "head\ntail-after-exit");
    const handle = f.coordinator.work(work.workId).outputRef!;
    expect(handle).toMatch(HANDLE);
    const custody = await openContextResultCustody(f.store.dataDir);
    const record = await custody.getRecord!(handle);
    expect(record?.digest).toBe(createHash("sha256").update("head\ntail-after-exit").digest("hex"));
  });

  it("denies output reads once the owner binding drifts (run, epoch, account)", async () => {
    const f = fixture({ executionGate: async () => ({ allowed: true }) });
    enable("jobs.backgroundV1");
    const owner = { ...f.owner, runId: "run-1", epoch: 1, projectId: "proj-1", workspaceId: "ws-1", accountBinding: "acct-1" };
    f.store.internal("fixture.owner", f.thread.id, () => f.store.put("thread", f.thread.id, f.thread.id, { ...f.thread, runId: "run-1", epoch: 1, projectId: "proj-1", workspaceId: "ws-1", accountId: "acct-1" } as Thread));
    const work = f.coordinator.admit(command("background.work.admit"), { owner, kind: "COMMAND", title: "drift", command: spec(f, ["-e", "console.log('x');setTimeout(()=>{},30000)"]) });
    const started = await f.coordinator.startCommand(work.workId);
    // Positive control: the authorized same-owner read succeeds while the
    // binding still matches.
    await waitFor(() => f.coordinator.readOutput(work.workId, f.thread.id, 0).output.includes("x"));
    // Owner revision drift: a new run/epoch under a different account makes
    // the prior binding stale; canonical custody must deny the read.
    f.store.internal("fixture.drift", f.thread.id, () => f.store.put("thread", f.thread.id, f.thread.id, { ...f.thread, runId: "run-2", epoch: 2, projectId: "proj-1", workspaceId: "ws-1", accountId: "acct-2" } as Thread));
    expect(() => f.coordinator.readOutput(work.workId, f.thread.id)).toThrowError(expect.objectContaining({ code: "CAPABILITY_DENIED" }));
    killOwnedProcess(started.processIdentity!.pid);
    await waitFor(() => f.coordinator.work(work.workId).state === "SETTLED" || f.coordinator.work(work.workId).state === "UNKNOWN");
  });

  it("mints a canonical custody record through the host publication seam (T02)", async () => {
    const f = fixture();
    const runtime = { configure: () => {}, models: async () => [], start: async () => {}, followUp: async () => {}, cancel: async () => {}, compact: async () => {}, history: async () => [], dispose: async () => {} } as unknown as RuntimeAdapter;
    const service = new Service(f.store, runtime, {});
    cleanups.push(async () => service.dispose());
    await service.recover();
    __setCapabilityFlagForTests("context.compilerV1", true); __setCapabilityFlagForTests("tools.deferredV1", true);
    f.store.internal("fixture.live-owner", f.thread.id, () => f.store.put("thread", f.thread.id, f.thread.id, { ...f.thread, runId: "run-1", epoch: 3, status: "working", accountId: "acct-1", workspaceId: "ws-1", projectId: "proj-1" } as Thread));
    const bytes = new TextEncoder().encode("retained window");
    const publish = (service as unknown as { publishBackgroundOutput: (i: unknown) => Promise<{ handle: string; digest: string; owner: { workspaceId: string; accountId: string | null } } | null> }).publishBackgroundOutput;
    const record = await publish.call(service, { workId: "work-1", owner: { threadId: f.thread.id, runId: "run-1", epoch: 3, projectId: "proj-1", workspaceId: "ws-1", accountBinding: "acct-1" }, effectId: "eff-1", bytes, startByte: 0, omittedBytes: 0 });
    // Canonical M04 shape: UUID handle accepted by context_result_read and
    // resolvable through the private custody vault, digest over retained bytes.
    expect(record?.handle).toMatch(HANDLE);
    expect(record?.digest).toBe(createHash("sha256").update(bytes).digest("hex"));
    expect(record?.owner).toMatchObject({ workspaceId: JSON.stringify(["ws-1", "proj-1"]), accountId: "acct-1" });
    expect(contextResultReadArgs.safeParse({ handle: record!.handle, offset: 0, length: 1 }).success).toBe(true);
    const custody = await openContextResultCustody(f.store.dataDir);
    await expect(custody.getRecord!(record!.handle)).resolves.toMatchObject({ handle: record!.handle });
    // A live-run read through the canonical vault returns the exact bytes…
    const vault = (service as unknown as { contextResultVault: () => { read: (i: unknown) => Promise<{ status: string }> } }).contextResultVault();
    const owner = { threadId: f.thread.id, workspaceId: JSON.stringify(["ws-1", "proj-1"]), accountId: "acct-1" };
    await expect(vault.read({ owner, handle: record!.handle, offset: 0, length: bytes.length })).resolves.toMatchObject({ status: "OK" });
    // …and drifts in the owner binding make it unavailable without touching
    // retained evidence.
    f.store.internal("fixture.drift-owner", f.thread.id, () => f.store.put("thread", f.thread.id, f.thread.id, { ...f.thread, runId: "run-1", epoch: 3, status: "working", accountId: "acct-2", workspaceId: "ws-1", projectId: "proj-1" } as Thread));
    await expect(vault.read({ owner: { ...owner, accountId: "acct-2" }, handle: record!.handle, offset: 0, length: 1 })).resolves.toMatchObject({ status: "UNAVAILABLE" });
    __setCapabilityFlagForTests("tools.deferredV1", undefined);
    expect(await publish.call(service, { workId: "work-1", owner: { threadId: f.thread.id, runId: "run-1", epoch: 3, projectId: "proj-1", workspaceId: "ws-1", accountBinding: "acct-2" }, effectId: null, bytes, startByte: 0, omittedBytes: 0 })).toBeNull();
  });
});

describe("M10-T04 composed verification (#2014)", () => {
  const HANDLE = CANONICAL_HANDLE;
  const runtimeStub: RuntimeAdapter = {
    configure: () => {}, models: async () => [{ id: "test/model", provider: "test", name: "Test" }],
    start: async () => {}, followUp: async () => {}, cancel: async () => {}, compact: async () => {},
    history: async () => [], dispose: async () => {},
  };
  function serviceFixture() {
    const root = mkdtempSync(join(realpathSync(tmpdir()), "m10-t04-"));
    const store = new Store(join(root, "state"));
    const service = new Service(store, runtimeStub, { background: { executionGate: async () => ({ allowed: true }) } });
    cleanups.push(async () => { await service.dispose().catch(() => {}); store.close(); rmSync(root, { recursive: true, force: true, maxRetries: 8, retryDelay: 150 }); });
    return { store, service, root };
  }
  const spec = (root: string, argv: string[]) => ({ executable: process.execPath, argv, cwd: root, profileId: "p" });
  const liveThread = async (service: Service, store: Store, title: string) => {
    const thread = (await service.command(command("thread.create", { title }))).result as Thread;
    store.internal("t04.live-owner", thread.id, () => store.put("thread", thread.id, thread.id, { ...thread, runId: "run-1", epoch: 2, status: "working", accountId: "acct-1", workspaceId: "ws-1", projectId: "p1" } as Thread));
    return store.get<Thread>("thread", thread.id)!;
  };
  const vaultOf = (service: Service) => (service as unknown as { contextResultVault: () => { read: (i: { owner: { threadId: string; workspaceId: string; accountId: string | null }; handle: string; offset: number; length: number }) => Promise<{ status: string; bytes?: Uint8Array }> } }).contextResultVault();

  it("denies live output after workspace-only drift through the production Service", async () => {
    enable("jobs.backgroundV1");
    const { store, service, root } = serviceFixture();
    await service.recover();
    const thread = await liveThread(service, store, "M10 workspace continuity");
    const work = (await service.command(command("background.work.admit", { kind: "COMMAND", title: "workspace", command: spec(root, ["-e", "console.log('live bytes');setTimeout(()=>{},30000)"]) }, thread.id))).result as BackgroundWorkRecord;
    const started = await service.backgroundWork.startCommand(work.workId);
    try {
      await waitFor(() => service.backgroundWork.readOutput(work.workId, thread.id).output.includes("live bytes"));
      store.internal("t04.workspace-drift", thread.id, () => store.put("thread", thread.id, thread.id, { ...thread, workspaceId: "ws-2" }));
      expect(() => service.backgroundWork.readOutput(work.workId, thread.id)).toThrowError(expect.objectContaining({ code: "CAPABILITY_DENIED", message: expect.stringContaining("SCOPE_CHANGED") }));
      store.internal("t04.workspace-restored", thread.id, () => store.put("thread", thread.id, thread.id, thread));
      expect(service.backgroundWork.readOutput(work.workId, thread.id).output).toContain("live bytes");
    } finally {
      killOwnedProcess(started.processIdentity!.pid);
      await waitFor(() => service.backgroundWork.work(work.workId).state === "SETTLED" || service.backgroundWork.work(work.workId).state === "UNKNOWN");
    }
  });

  it("approved process → bounded byte drawer window → canonical handle → context_result_read range", async () => {
    enable("jobs.backgroundV1");
    __setCapabilityFlagForTests("context.compilerV1", true); __setCapabilityFlagForTests("tools.deferredV1", true);
    const { store, service, root } = serviceFixture();
    await service.recover();
    const thread = await liveThread(service, store, "M10 owner");
    // 200_000 '€' = 600_000 bytes > 512 KiB window; real multibyte stream.
    const work = (await service.command(command("background.work.admit", { kind: "COMMAND", title: "window", command: spec(root, ["-e", `require("fs").writeSync(1,"€".repeat(200000)+"DONE")`]) }, thread.id))).result as BackgroundWorkRecord;
    await service.backgroundWork.startCommand(work.workId);
    await waitFor(() => service.backgroundWork.work(work.workId).state === "SETTLED");
    // Historical UI read: byte-bounded window, scalar-intact tail, byte cursor.
    const first = service.backgroundWork.readOutput(work.workId, thread.id, 0);
    expect(Buffer.byteLength(first.output, "utf8")).toBeLessThanOrEqual(BACKGROUND_SCHEDULER_LIMITS.outputWindowBytes);
    expect(first.truncated).toBe(true);
    expect(first.output.endsWith("DONE")).toBe(true);
    expect(service.backgroundWork.readOutput(work.workId, thread.id, first.cursor).output).toBe("");
    // Canonical handle minted by the real Service seam, not a test fake —
    // published once at stream close, after the SETTLED transition.
    await waitFor(() => !!service.backgroundWork.work(work.workId).outputRef);
    const handle = service.backgroundWork.work(work.workId).outputRef;
    expect(handle).toMatch(HANDLE);
    const custody = await openContextResultCustody(store.dataDir);
    await expect(custody.getRecord!(handle!)).resolves.toMatchObject({ handle });
    // Model read through the same canonical reader context_result_read uses.
    const owner = { threadId: thread.id, workspaceId: JSON.stringify(["ws-1", "p1"]), accountId: "acct-1" };
    const vault = vaultOf(service);
    // Ranges are byte-accurate: 15 bytes = five complete '€' scalars.
    const slice = await vault.read({ owner, handle: handle!, offset: 0, length: 15 });
    expect(slice).toMatchObject({ status: "OK" });
    expect(Buffer.from(slice.bytes!)).toEqual(Buffer.from("€".repeat(5), "utf8"));
    await expect(vault.read({ owner, handle: handle!, offset: 0, length: 2 * 1024 * 1024 })).resolves.toMatchObject({ status: "INVALID_RANGE" });
  });

  it("run drift keeps the authorized historical drawer read but revokes the model handle; account drift denies both", async () => {
    enable("jobs.backgroundV1");
    __setCapabilityFlagForTests("context.compilerV1", true); __setCapabilityFlagForTests("tools.deferredV1", true);
    const { store, service, root } = serviceFixture();
    await service.recover();
    const thread = await liveThread(service, store, "M10 drift");
    const work = (await service.command(command("background.work.admit", { kind: "COMMAND", title: "drift", command: spec(root, ["-e", "console.log('settled bytes')"]) }, thread.id))).result as BackgroundWorkRecord;
    await service.backgroundWork.startCommand(work.workId);
    await waitFor(() => service.backgroundWork.work(work.workId).state === "SETTLED");
    await waitFor(() => !!service.backgroundWork.work(work.workId).outputRef);
    const handle = service.backgroundWork.work(work.workId).outputRef!;
    const owner = { threadId: thread.id, workspaceId: JSON.stringify(["ws-1", "p1"]), accountId: "acct-1" };
    const vault = vaultOf(service);
    await expect(vault.read({ owner, handle, offset: 0, length: 4 })).resolves.toMatchObject({ status: "OK" });
    // A new run under the same account/scope: the model handle is bound to
    // the mint-time invocation, but the owner's drawer still reads history.
    store.internal("t04.new-run", thread.id, () => store.put("thread", thread.id, thread.id, { ...store.get<Thread>("thread", thread.id)!, runId: "run-2", epoch: 3 } as Thread));
    await expect(vault.read({ owner, handle, offset: 0, length: 4 })).resolves.toMatchObject({ status: "UNAVAILABLE" });
    expect(service.backgroundWork.readOutput(work.workId, thread.id, 0).output).toContain("settled bytes");
    // Workspace drift alone also revokes the settled drawer read; restoring
    // the original scope keeps the authorized historical window inspectable.
    store.internal("t04.new-workspace", thread.id, () => store.put("thread", thread.id, thread.id, { ...store.get<Thread>("thread", thread.id)!, workspaceId: "ws-2" }));
    expect(() => service.backgroundWork.readOutput(work.workId, thread.id, 0)).toThrowError(expect.objectContaining({ code: "CAPABILITY_DENIED" }));
    store.internal("t04.restore-workspace", thread.id, () => store.put("thread", thread.id, thread.id, { ...store.get<Thread>("thread", thread.id)!, workspaceId: "ws-1" }));
    expect(service.backgroundWork.readOutput(work.workId, thread.id, 0).output).toContain("settled bytes");
    // Account drift: both readers deny.
    store.internal("t04.new-account", thread.id, () => store.put("thread", thread.id, thread.id, { ...store.get<Thread>("thread", thread.id)!, accountId: "acct-2" } as Thread));
    expect(() => service.backgroundWork.readOutput(work.workId, thread.id, 0)).toThrowError(expect.objectContaining({ code: "CAPABILITY_DENIED" }));
  });
});
