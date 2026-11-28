import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import * as childProcess from "node:child_process";
import { Store } from "../packages/storage/store.ts";
import { Service } from "../packages/core/service.ts";
import { BackgroundWorkCoordinator, captureCreationToken, verifyProcessIdentity, type BackgroundWorkRecord } from "../packages/core/background-work.ts";
import { DurableWakeupScheduler } from "../packages/core/durable-wakeups.ts";
import { ModelCapacity } from "../packages/runtime/model-capacity.ts";
import { __setCapabilityFlagForTests, registeredCapabilityFlags } from "../packages/core/capability-flags.ts";
import type { RuntimeAdapter, StartRun, Thread } from "../packages/contracts/index.ts";
import { BACKGROUND_HOLD_REASONS, BACKGROUND_SCHEDULER_LIMITS, backgroundWorkV1Schema, humanStepV1Schema, intakeV1Schema, occurrenceKeyForEvent, occurrenceKeyForTime, wakeupV1Schema, type BackgroundOccurrenceV1 } from "../packages/contracts/background-work.ts";

vi.mock("node:child_process", { spy: true });

const cleanups: (() => void | Promise<void>)[] = [];
afterEach(async () => {
  for (const key of ["jobs.backgroundV1", "jobs.serviceLifetimeV1", "jobs.idleReviewV1", "integrations.intakeV1"] as const) __setCapabilityFlagForTests(key, undefined);
  vi.restoreAllMocks();
  while (cleanups.length) await cleanups.pop()!();
});

const M10_FLAGS = ["jobs.backgroundV1", "jobs.serviceLifetimeV1", "jobs.idleReviewV1", "integrations.intakeV1"] as const;
function enable(...keys: (typeof M10_FLAGS)[number][]) { for (const key of keys) __setCapabilityFlagForTests(key, true); }

function fixture(options: { idleExecutor?: ConstructorParameters<typeof BackgroundWorkCoordinator>[0]["idleExecutor"]; gate?: ModelCapacity; executionGate?: ConstructorParameters<typeof BackgroundWorkCoordinator>[0]["executionGate"]; enqueueFollowUp?: ConstructorParameters<typeof BackgroundWorkCoordinator>[0]["enqueueFollowUp"]; forkApi?: ConstructorParameters<typeof BackgroundWorkCoordinator>[0]["forkApi"] } = {}) {
  const root = mkdtempSync(join(realpathSync(tmpdir()), "m10-background-"));
  const store = new Store(join(root, "state"));
  let clock = 1_700_000_000_000;
  const now = () => clock;
  const advance = (ms: number) => { clock += ms; };
  const coordinator = new BackgroundWorkCoordinator({ store, now, gate: options.gate, idleExecutor: options.idleExecutor, executionGate: options.executionGate, enqueueFollowUp: options.enqueueFollowUp, forkApi: options.forkApi });
  const thread: Thread = { id: "thread-1", title: "Owner", projectName: null, createdAt: new Date(clock).toISOString(), updatedAt: new Date(clock).toISOString(), status: "ready", epoch: 0, runId: null, modelId: null, sessionPath: null };
  store.internal("fixture.thread", thread.id, () => store.put("thread", thread.id, thread.id, thread));
  cleanups.push(() => { coordinator.dispose(); store.close(); rmSync(root, { recursive: true, force: true, maxRetries: 8, retryDelay: 150 }); });
  const owner = { threadId: thread.id, runId: null, epoch: 0, projectId: null, workspaceId: null, accountBinding: null };
  return { root, store, coordinator, now, advance, owner, thread };
}

const command = (type: string, payload: Record<string, unknown> = {}, threadId?: string) => ({ id: randomUUID(), type, payload, ...(threadId ? { threadId } : {}) });

async function waitFor(assertion: () => boolean, timeoutMs = 8_000): Promise<void> {
  const deadline = performance.now() + timeoutMs;
  while (!assertion()) {
    if (performance.now() > deadline) throw new Error("Timed out waiting for condition");
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
  it("contains a heartbeat write failure and renews independent active leases", async () => {
    const f = fixture();
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    let complete!: () => void;
    const finishing = new Promise<void>(resolve => { complete = resolve; });
    const deliver = vi.fn(async () => { await finishing; return { status: "DELIVERED" as const }; });
    const scheduler = new DurableWakeupScheduler({ store: f.store, now: f.now, deliver });
    try {
      const a = scheduler.register(command("background.wakeup.register"), { taskId: "a", trigger: { kind: "AT_UTC", dueAtMs: f.now() } });
      const b = scheduler.register(command("background.wakeup.register"), { taskId: "b", trigger: { kind: "AT_UTC", dueAtMs: f.now() } });
      await scheduler.tick();
      const firstLease = scheduler.occurrences(a.wakeupId)[0]!.leaseExpiresAtMs!;
      const original = f.store.internal.bind(f.store);
      let failed = false;
      vi.spyOn(f.store, "internal").mockImplementation((event, thread, apply) => {
        if (event === "background.occurrence.heartbeat" && !failed) { failed = true; throw Error("injected heartbeat write failure"); }
        return original(event, thread, apply);
      });
      scheduler.start();
      f.advance(BACKGROUND_SCHEDULER_LIMITS.heartbeatMs);
      expect(() => vi.advanceTimersByTime(BACKGROUND_SCHEDULER_LIMITS.heartbeatMs)).not.toThrow();
      expect(failed).toBe(true);
      expect(scheduler.occurrences(a.wakeupId)[0]!.leaseExpiresAtMs).toBe(firstLease);
      expect(scheduler.occurrences(b.wakeupId)[0]!.leaseExpiresAtMs).toBe(f.now() + BACKGROUND_SCHEDULER_LIMITS.leaseMs);
      f.advance(BACKGROUND_SCHEDULER_LIMITS.heartbeatMs);
      vi.advanceTimersByTime(BACKGROUND_SCHEDULER_LIMITS.heartbeatMs);
      expect(scheduler.occurrences(a.wakeupId)[0]!.leaseExpiresAtMs).toBe(f.now() + BACKGROUND_SCHEDULER_LIMITS.leaseMs);
      expect(deliver).toHaveBeenCalledTimes(2);
    } finally {
      scheduler.stop();
      vi.useRealTimers();
      complete();
      await finishing;
    }
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
  it("review forks admit through the callable fork API after the budget check", () => {
    const calls: { sourceCutDigest: string; toolList: readonly string[]; auxiliaryBudget: { maxCalls: number; maxTokens: number }; parentThreadId: string }[] = [];
    const f = fixture({ forkApi: request => { calls.push(request); return { forkId: "fork-1" }; } });
    enable("jobs.backgroundV1");
    expect(f.coordinator.admitReviewFork({ sourceCutDigest: "a".repeat(64), toolList: ["read"], auxiliaryBudget: null, parentThreadId: "thread-1" })).toEqual({ status: "AUXILIARY_BUDGET_REQUIRED" });
    expect(calls).toEqual([]);
    const request = { sourceCutDigest: "a".repeat(64), toolList: ["read"], auxiliaryBudget: { maxCalls: 4, maxTokens: 1000 }, parentThreadId: "thread-1" };
    expect(f.coordinator.admitReviewFork(request)).toEqual({ status: "ADMITTED", forkId: "fork-1" });
    expect(calls).toEqual([request]);
    const review = f.coordinator.admit(command("background.work.admit"), { owner: f.owner, kind: "REVIEW", title: "fork" });
    expect(review.state).toBe("QUEUED");
    expect(review.blockedReason).toBeNull();
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
    const settled = f.coordinator.work(work.workId);
    expect(settled.outcome).toBe("SUCCEEDED");
    const output = f.coordinator.readOutput(work.workId, "thread-1", 0);
    expect(output.output).toContain("hello background");
    expect(output.cursor).toBeGreaterThan(0);
    expect(f.coordinator.readOutput(work.workId, "thread-1", output.cursor).output).toBe("");
    expect(f.coordinator.exitReceipt(work.workId)?.exitCode).toBe(0);
    expect(settled.outputRef).toMatch(/^bw-result:/);
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
  it("preserves a held host event without admitting it during shutdown", async () => {
    const f = fixture();
    let finishActive!: () => void;
    const active = new Promise<{ status: "DELIVERED" }>(resolve => { finishActive = () => resolve({ status: "DELIVERED" }); });
    let park = true;
    const deliver = vi.fn(async ({ wakeup }: { wakeup: { taskId: string } }) =>
      wakeup.taskId === "active" ? active : { status: "DELIVERED" as const });
    const scheduler = new DurableWakeupScheduler({ store: f.store, now: f.now, deliver,
      revalidate: ({ wakeup }) => wakeup.taskId === "held" && park ? { ok: false, blockedReason: "WAITING_HUMAN" } : { ok: true } });
    const register = (taskId: string) => scheduler.register(command("background.wakeup.register"),
      { taskId, trigger: { kind: "HOST_EVENT", eventKind: "runtime.settled", correlationKey: taskId } });
    const held = register("held");
    register("active");
    scheduler.hostEvent("runtime.settled", "held", "held-event");
    scheduler.hostEvent("runtime.settled", "active", "active-event");
    expect(scheduler.schedules().find(item => item.wakeupId === held.wakeupId)?.state).toBe("BLOCKED");
    expect(deliver).toHaveBeenCalledTimes(1);
    const draining = scheduler.drain(1_000);
    park = false;
    try {
      scheduler.resume(command("background.wakeup.resume"), held.wakeupId);
      expect(deliver).toHaveBeenCalledTimes(1);
      expect(scheduler.occurrences(held.wakeupId)).toMatchObject([{ state: "PENDING", dispatch: "NOT_DISPATCHED" }]);
    } finally {
      finishActive();
      await draining;
    }
    const replacement = new DurableWakeupScheduler({ store: f.store, now: f.now, deliver });
    replacement.recover();
    await waitFor(() => !replacement.busy);
    expect(deliver).toHaveBeenCalledTimes(2);
    expect(replacement.occurrences(held.wakeupId)).toMatchObject([{ state: "DELIVERED", dispatch: "RECEIPT_CONFIRMED" }]);
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
  it("clears the lease for a drained uncertain occurrence without replaying it after restart", async () => {
    const f = fixture();
    let finish!: () => void;
    const outcome = new Promise<{ status: "UNCERTAIN"; reason: string }>(resolve => { finish = () => resolve({ status: "UNCERTAIN", reason: "Receipt unavailable" }); });
    const old = new DurableWakeupScheduler({ store: f.store, now: f.now, deliver: () => outcome });
    const deliver = vi.fn(async () => ({ status: "DELIVERED" as const }));
    const reopened = new DurableWakeupScheduler({ store: f.store, now: f.now, deliver });
    cleanups.push(() => { old.stop(); reopened.stop(); });
    const { wakeupId } = old.register(command("background.wakeup.register"), { taskId: "task", trigger: { kind: "AT_UTC", dueAtMs: f.now() } });
    try {
      await old.tick();
      expect(old.schedules()[0]).toMatchObject({ state: "CLAIMED" });
      expect((await old.drain(1)).uncertain).toBe(1);
      reopened.recover();
      expect(reopened.schedules()[0]).toMatchObject({ state: "PENDING", occurrenceKey: null, leaseExpiresAtMs: null, nextDueAtMs: null });
      expect(reopened.occurrences(wakeupId)).toMatchObject([{ state: "UNKNOWN", dispatch: "DISPATCHED_UNCONFIRMED", leaseExpiresAtMs: null }]);
      expect(await reopened.tick()).toEqual([]);
      expect(deliver).not.toHaveBeenCalled();
    } finally { finish(); await waitFor(() => !old.busy); }
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
  function serviceFixture(background?: NonNullable<ConstructorParameters<typeof Service>[2]>["background"]) {
    const root = mkdtempSync(join(realpathSync(tmpdir()), "m10-service-"));
    const store = new Store(join(root, "state"));
    const runtime = {
      configure: () => {}, models: async () => [{ id: "test/model", provider: "test", name: "Test" }],
      start: vi.fn(async (_input: StartRun) => {}), followUp: vi.fn(async (_input: StartRun) => {}), cancel: async () => {}, compact: async () => {},
      history: async () => [], dispose: async () => {},
    } satisfies RuntimeAdapter;
    const service = new Service(store, runtime, { background });
    cleanups.push(async () => { await service.dispose().catch(() => {}); store.close(); rmSync(root, { recursive: true, force: true }); });
    return { store, service, root, runtime };
  }
  it("reconciles an uncertain COMMAND through Service without replacing its work or effect", async () => {
    enable("jobs.backgroundV1");
    let stamp = 1_735_689_600_123;
    vi.spyOn(Date, "now").mockImplementation(() => stamp);
    const spawn = vi.mocked(childProcess.spawn).mockClear().mockReturnValueOnce(new childProcess.ChildProcess());
    const background = { executionGate: vi.fn(async () => ({ allowed: true as const })) };
    const { service, store, root, runtime } = serviceFixture(background);
    const thread = (await service.command(command("thread.create", { title: "Command custody" }))).result as Thread;
    const effectId = "fixture-command-effect";
    const work = (await service.command(command("background.work.admit", {
      kind: "COMMAND", title: "Fixture command", effectId,
      command: { executable: "fixture-command", argv: [], cwd: root, profileId: "fixture" },
    }, thread.id))).result as BackgroundWorkRecord;
    const scheduler = service.backgroundWork.scheduler;
    const wakeup = scheduler.register(command("background.wakeup.register"), {
      wakeupId: "command-custody", taskId: work.workId, trigger: { kind: "AT_UTC", dueAtMs: stamp },
    });
    const key = '["command-custody",1,1735689600123]';
    await scheduler.tick();
    await waitFor(() => scheduler.occurrences(wakeup.wakeupId)[0]?.state === "UNKNOWN");
    const before = scheduler.occurrences(wakeup.wakeupId)[0]!;
    const admissions = store.all("backgroundAdmission");
    expect(before).toMatchObject({ occurrenceKey: key, wakeupId: "command-custody", scheduleRevision: 1, dispatch: "DISPATCHED_UNCONFIRMED" });
    expect(before.admissionId).toEqual(expect.any(String));
    expect(admissions).toHaveLength(1);
    expect(spawn).toHaveBeenCalledTimes(1);

    stamp += 30_001;
    scheduler.stop();
    const reopened = new Store(join(root, "state"));
    const replacement = new Service(reopened, runtime, { background });
    cleanups.push(async () => { await replacement.dispose(); reopened.close(); });
    replacement.backgroundWork.recover();
    const next = replacement.backgroundWork.scheduler;
    await next.tick();
    expect(next.occurrences(wakeup.wakeupId)[0]).toEqual(before);
    expect(replacement.backgroundWork.work(work.workId)).toMatchObject({ workId: work.workId, effectId, state: "UNKNOWN", processIdentity: null });
    expect(reopened.all("backgroundAdmission")).toEqual(admissions);
    expect(spawn).toHaveBeenCalledTimes(1);
    await replacement.command(command("background.occurrence.reconcile", { occurrenceKey: key, receipt: { observed: "DELIVERED" } }, thread.id));
    await replacement.command(command("background.command.start", { workId: work.workId }, thread.id));
    expect(next.occurrences(wakeup.wakeupId)[0]).toMatchObject({ occurrenceKey: key, admissionId: before.admissionId, state: "DELIVERED", dispatch: "RECEIPT_CONFIRMED" });
    expect(replacement.backgroundWork.work(work.workId)).toMatchObject({ workId: work.workId, effectId, state: "UNKNOWN", processIdentity: null });
    expect(reopened.all("backgroundExitReceipt")).toEqual([]);
    expect(reopened.all("backgroundAdmission")).toEqual(admissions);
    expect(spawn).toHaveBeenCalledTimes(1);
  });
  it("retries a proven undispatched COMMAND under the original Service admission", async () => {
    enable("jobs.backgroundV1");
    const spawn = vi.mocked(childProcess.spawn).mockClear().mockReturnValueOnce(new childProcess.ChildProcess());
    const executionGate = vi.fn(async () => ({ allowed: true as const })).mockRejectedValueOnce(new Error("Fixture gate stopped before spawn."));
    const { service, store, root } = serviceFixture({ executionGate });
    const thread = (await service.command(command("thread.create", { title: "Proven no submission" }))).result as Thread;
    const effectId = "fixture-retry-effect";
    const work = (await service.command(command("background.work.admit", {
      kind: "COMMAND", title: "Fixture retry", effectId,
      command: { executable: "fixture-command", argv: [], cwd: root, profileId: "fixture" },
    }, thread.id))).result as BackgroundWorkRecord;
    const scheduler = service.backgroundWork.scheduler;
    const wakeup = scheduler.register(command("background.wakeup.register"), {
      taskId: work.workId, trigger: { kind: "AT_UTC", dueAtMs: Date.now() },
    });
    const internal = store.internal.bind(store);
    const commit = vi.spyOn(store, "internal").mockImplementation((type, threadId, apply) => {
      if (type === "background.occurrence.blocked") throw new Error("Fixture cuts before recording the local failure.");
      return internal(type, threadId, apply);
    });
    await scheduler.tick();
    await waitFor(() => commit.mock.calls.some(([type]) => type === "background.occurrence.blocked"));
    commit.mockRestore();
    expect(spawn).not.toHaveBeenCalled();
    expect(scheduler.busy).toBe(false);
    const before = scheduler.occurrences(wakeup.wakeupId)[0]!;
    expect(before).toMatchObject({ state: "CLAIMED", dispatch: "DISPATCHED_UNCONFIRMED" });
    const admissions = store.all("backgroundAdmission");
    expect(admissions).toHaveLength(1);
    await service.command(command("background.occurrence.reconcile", {
      occurrenceKey: before.occurrenceKey, receipt: { observed: "NOT_DISPATCHED" },
    }, thread.id));
    await scheduler.tick();
    await waitFor(() => scheduler.occurrences(wakeup.wakeupId)[0]?.state === "UNKNOWN");
    expect(scheduler.occurrences(wakeup.wakeupId)[0]).toMatchObject({
      occurrenceKey: before.occurrenceKey, scheduleRevision: before.scheduleRevision, admissionId: before.admissionId,
    });
    expect(service.backgroundWork.work(work.workId)).toMatchObject({ workId: work.workId, effectId, state: "UNKNOWN" });
    expect(store.all("backgroundAdmission")).toEqual(admissions);
    expect(executionGate).toHaveBeenCalledTimes(2);
    expect(spawn).toHaveBeenCalledTimes(1);
  });
  it("revalidates COMMAND ownership after a shared pending Service execution gate", async () => {
    enable("jobs.backgroundV1");
    const spawn = vi.mocked(childProcess.spawn).mockClear();
    let allow!: (decision: { allowed: true }) => void;
    const decision = new Promise<{ allowed: true }>(resolve => { allow = resolve; });
    const executionGate = vi.fn(() => decision);
    const { service, store, root } = serviceFixture({ executionGate });
    const thread = (await service.command(command("thread.create", { title: "Owner before gate" }))).result as Thread;
    const effectId = "fixture-revoked-effect";
    const work = (await service.command(command("background.work.admit", {
      kind: "COMMAND", title: "Revoked fixture command", effectId,
      command: { executable: "fixture-command", argv: [], cwd: root, profileId: "fixture" },
    }, thread.id))).result as BackgroundWorkRecord;
    const scheduler = service.backgroundWork.scheduler;
    const wakeup = scheduler.register(command("background.wakeup.register"), {
      taskId: work.workId, trigger: { kind: "AT_UTC", dueAtMs: Date.now() },
    });
    await scheduler.tick();
    const repeat = service.command(command("background.command.start", { workId: work.workId }, thread.id));
    expect(executionGate).toHaveBeenCalledTimes(1);
    store.internal("fixture.owner-revoked", thread.id, () => {
      store.put("thread", thread.id, thread.id, { ...thread, projectId: "moved-project" });
    });
    allow({ allowed: true });
    await repeat;
    await waitFor(() => scheduler.occurrences(wakeup.wakeupId)[0]?.state === "CANCELLED");
    expect(service.backgroundWork.work(work.workId)).toMatchObject({ effectId, state: "BLOCKED", blockedReason: "SCOPE_CHANGED" });
    expect(store.all("backgroundAdmission")).toHaveLength(1);
    expect(executionGate).toHaveBeenCalledTimes(1);
    expect(spawn).not.toHaveBeenCalled();
  });
  it.each(["persistence cut", "normal runtime delivery"])("preserves the approved EXTERNAL_TASK input identity through %s", async mode => {
    enable("jobs.backgroundV1", "integrations.intakeV1");
    let stamp = 1_735_689_600_123;
    vi.spyOn(Date, "now").mockImplementation(() => stamp);
    const { service, store, root, runtime } = serviceFixture();
    const thread = (await service.command(command("thread.create", { title: "External input custody" }))).result as Thread;
    const effectId = "fixture-external-effect";
    const cut = mode === "persistence cut";
    store.internal("fixture.approved-intake", null, () => {
      store.put("intakeRecord", "fixture-approval", null, {
        disposition: "APPROVED", proposedTask: { title: "Fixture task", sourceUrl: "https://example.invalid/issues/1" },
      });
      if (!cut) store.put("thread", thread.id, thread.id, { ...thread, modelId: "test/model" });
    });
    const work = (await service.command(command("background.work.admit", {
      kind: "EXTERNAL_TASK", title: "Approved fixture task", effectId, intakeId: "fixture-approval",
    }, thread.id))).result as BackgroundWorkRecord;
    const scheduler = service.backgroundWork.scheduler;
    const wakeup = scheduler.register(command("background.wakeup.register"), {
      wakeupId: "external-custody", taskId: work.workId, trigger: { kind: "AT_UTC", dueAtMs: stamp },
    });
    const key = '["external-custody",1,1735689600123]';
    const inputId = `external:${work.workId}`;
    const internal = store.internal.bind(store);
    const commit = vi.spyOn(store, "internal").mockImplementation((type, threadId, apply) => {
      if (cut && type === "background.occurrence.delivered") throw new Error("Fixture cuts after input commit and before occurrence receipt.");
      return internal(type, threadId, apply);
    });
    await scheduler.tick();
    await waitFor(() => commit.mock.calls.some(([type]) => type === "background.occurrence.delivered"));
    const input = store.get<{ id: string; content: string }>("outbox", inputId)!;
    expect(input).toMatchObject({ id: inputId, threadId: thread.id });
    expect(input.content).toContain("Fixture task");
    const admissions = store.all("backgroundAdmission");
    expect(admissions).toHaveLength(1);
    const before = scheduler.occurrences(wakeup.wakeupId)[0]!;
    expect(before).toMatchObject({
      occurrenceKey: key, wakeupId: "external-custody", scheduleRevision: 1,
      dispatch: cut ? "DISPATCHED_UNCONFIRMED" : "RECEIPT_CONFIRMED",
    });
    expect(before.admissionId).toEqual(expect.any(String));
    if (!cut) {
      await waitFor(() => runtime.start.mock.calls.length === 1);
      expect(runtime.start).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ inputId, inputIds: [inputId] }));
      expect(runtime.followUp).not.toHaveBeenCalled();
      return;
    }

    expect(runtime.start).not.toHaveBeenCalled();
    expect(runtime.followUp).not.toHaveBeenCalled();
    const savedBytes = JSON.stringify(input);
    stamp += 30_001;
    scheduler.stop();
    const reopened = new Store(join(root, "state"));
    const replacement = new Service(reopened, runtime);
    cleanups.push(async () => { await replacement.dispose(); reopened.close(); });
    replacement.backgroundWork.recover();
    const next = replacement.backgroundWork.scheduler;
    await next.tick();
    expect(next.occurrences(wakeup.wakeupId)[0]).toMatchObject({ occurrenceKey: key, admissionId: before.admissionId, state: "UNKNOWN" });
    expect(replacement.backgroundWork.work(work.workId)).toMatchObject({ workId: work.workId, effectId, state: "UNKNOWN" });
    await replacement.command(command("background.wakeup.cancel", { wakeupId: wakeup.wakeupId }, thread.id));
    await replacement.command(command("background.occurrence.reconcile", { occurrenceKey: key, receipt: { observed: "DELIVERED" } }, thread.id));
    await next.tick();
    expect(next.occurrences(wakeup.wakeupId)[0]).toMatchObject({ occurrenceKey: key, admissionId: before.admissionId, state: "DELIVERED" });
    expect(next.allSchedules()[0]).toMatchObject({ state: "CANCELLED", occurrenceKey: null });
    expect(reopened.all("backgroundAdmission")).toEqual(admissions);
    expect(reopened.all("outbox").map(row => JSON.stringify(row))).toEqual([savedBytes]);
    expect(runtime.start).not.toHaveBeenCalled();
    expect(runtime.followUp).not.toHaveBeenCalled();
  });
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
  it("rejects unsupported schedule shapes through Service without writes or dispatch and preserves UTC identity", async () => {
    enable("jobs.backgroundV1");
    const { service, store, runtime } = serviceFixture();
    const thread = (await service.command(command("thread.create", { title: "Schedule binding" }))).result as Thread;
    const work = (await service.command(command("background.work.admit", { kind: "MAINTENANCE", title: "audit" }, thread.id))).result as BackgroundWorkRecord;
    const scheduler = service.backgroundWork.scheduler;
    const state = () => ({
      seq: store.sequence,
      projections: ["backgroundWakeup", "backgroundOccurrence", "backgroundAdmission", "backgroundWork", "outbox"].map(kind => store.all(kind)),
    });
    const before = state();
    for (const trigger of [
      { kind: "CRON", expression: "0 * * * *" },
      { kind: "LOCAL_WALL_CLOCK", localTime: "2026-11-01T01:30:00", timeZone: "America/New_York" },
      { kind: "UNSUPPORTED_KIND" },
      { kind: "HOST_EVENT", eventKind: "arbitrary.event", correlationKey: "thread-fixed" },
      { kind: "INTERVAL_UTC", anchorMs: 1735689600123, intervalMs: 0 },
      { kind: "INTERVAL_UTC", anchorMs: 1735689600123, intervalMs: -1 },
    ]) {
      const registration = command("background.wakeup.register", { taskId: work.workId, trigger }, thread.id);
      await expect(service.command(registration)).rejects.toMatchObject({ code: "SCHEDULE_KIND_UNSUPPORTED" });
      expect(store.receipt(registration)).toBeNull();
      expect(state()).toEqual(before);
    }
    expect(() => scheduler.hostEvent("arbitrary.event", "thread-fixed", "event-fixed"))
      .toThrowError(expect.objectContaining({ code: "SCHEDULE_KIND_UNSUPPORTED" }));
    expect(state()).toEqual(before);
    expect(runtime.start).not.toHaveBeenCalled();
    expect(runtime.followUp).not.toHaveBeenCalled();

    const schedulerNow = Date.now();
    for (const scheduleTimezone of [null, "UTC", "America/New_York", "Europe/Berlin"]) {
      const anchorMs = 8_000_000_000_123, intervalMs = 2500;
      expect(anchorMs).toBeGreaterThan(schedulerNow);
      for (const trigger of [{ kind: "AT_UTC", dueAtMs: anchorMs }, { kind: "INTERVAL_UTC", anchorMs, intervalMs }]) {
        const result = (await service.command(command("background.wakeup.register", { taskId: work.workId, trigger, scheduleTimezone }, thread.id))).result;
        expect(result).toMatchObject({ trigger, scheduleTimezone, nextDueAtMs: anchorMs, occurrenceKey: null });
      }
    }
    for (const [eventKind, correlationKey] of [["runtime.settled", "thread-fixed"], ["humanStep.answered", "human-fixed"]]) {
      const trigger = { kind: "HOST_EVENT", eventKind, correlationKey };
      const result = (await service.command(command("background.wakeup.register", { taskId: work.workId, trigger }, thread.id))).result as { wakeupId: string };
      expect(result).toMatchObject({ trigger, nextDueAtMs: null });
      expect(scheduler.hostEvent(eventKind, "different-owner", "event-fixed")).toEqual([]);
      const claimed = scheduler.hostEvent(eventKind, correlationKey, "event-fixed");
      expect(claimed.map(item => item.occurrence.occurrenceKey)).toEqual([JSON.stringify([result.wakeupId, 1, "event-fixed"])]);
      expect(scheduler.hostEvent(eventKind, correlationKey, "event-fixed")).toEqual([]);
    }
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
  it.each([100_002, 100_005])("accounts for all skipped slots after a %i interval jump with bounded projection writes", async (slots) => {
    const f = fixture(), anchor = f.now(), delivered: string[] = [];
    const scheduler = new DurableWakeupScheduler({ store: f.store, now: f.now, deliver: async ({ occurrence }) => {
      delivered.push(occurrence.occurrenceKey);
      return { status: "DELIVERED" as const };
    } });
    cleanups.push(() => scheduler.stop());
    const { wakeupId } = scheduler.register(command("background.wakeup.register"), {
      taskId: "t", trigger: { kind: "INTERVAL_UTC", anchorMs: anchor, intervalMs: 1 },
    });
    let writes = 0;
    const counts: number[] = [];
    const put = f.store.put.bind(f.store), remove = f.store.remove.bind(f.store), internal = f.store.internal.bind(f.store);
    vi.spyOn(f.store, "put").mockImplementation((...args) => { writes++; return put(...args); });
    vi.spyOn(f.store, "remove").mockImplementation((...args) => { writes++; return remove(...args); });
    vi.spyOn(f.store, "internal").mockImplementation((...args) => {
      writes = 0;
      try { return internal(...args); } finally { counts.push(writes); }
    });
    f.advance(slots);
    await scheduler.tick();
    const latest = JSON.stringify([wakeupId, 1, anchor + slots]);
    expect(delivered).toEqual([latest]);
    expect(scheduler.schedules()[0]).toMatchObject({ skippedTotal: slots - 1, nextDueAtMs: anchor + slots + 1 });
    expect(f.store.all("backgroundOccurrenceBackfill")).toHaveLength(1);
    for (let batch = 0; batch < 400 && f.store.all("backgroundOccurrenceBackfill").length; batch++) {
      await scheduler.tick();
    }
    expect(f.store.all("backgroundOccurrenceBackfill")).toHaveLength(0);
    expect(Math.max(...counts)).toBeLessThanOrEqual(257);
    const rows = f.store.all<BackgroundOccurrenceV1>("backgroundOccurrence");
    const skipped = rows.filter(row => row.state === "SKIPPED").sort((a,b) => a.scheduledDueAtMs! - b.scheduledDueAtMs!);
    expect(skipped).toHaveLength(slots - 1);
    expect(skipped.map(row => row.occurrenceKey)).toEqual(Array.from({ length: slots - 1 }, (_, index) => JSON.stringify([wakeupId, 1, anchor + index + 1])));
    expect(skipped.every(row => row.dispatch === "NOT_DISPATCHED" && row.admissionId === null)).toBe(true);
    expect(rows.filter(row => row.state === "DELIVERED").map(row => row.occurrenceKey)).toEqual([latest]);
    expect(f.store.all("backgroundAdmission")).toHaveLength(1);
    expect(delivered).toEqual([latest]);
  });

  it("keeps interval identity exact when elapsed time exceeds safe integer precision", async () => {
    const f = fixture();
    const reached = 8_000_000_000_000_000;
    let clock = reached;
    const deliver = vi.fn(async () => ({ status: "DELIVERED" as const }));
    const scheduler = new DurableWakeupScheduler({ store: f.store, now: () => clock, deliver });
    cleanups.push(() => scheduler.stop());
    const wakeup = scheduler.register(command("background.wakeup.register"), {
      wakeupId: "wide-elapsed", taskId: "t",
      trigger: { kind: "INTERVAL_UTC", anchorMs: -8_000_000_000_000_001, intervalMs: 2 },
    });
    expect(wakeup.nextDueAtMs).toBe(8_000_000_000_000_001);
    expect(await scheduler.tick()).toEqual([]);
    clock++;
    await scheduler.tick();
    expect(scheduler.occurrences(wakeup.wakeupId)[0]?.occurrenceKey).toBe('["wide-elapsed",1,8000000000000001]');
    expect(scheduler.allSchedules()[0]).toMatchObject({ nextDueAtMs: 8_000_000_000_000_003, skippedTotal: 0 });
    expect(deliver).toHaveBeenCalledTimes(1);
  });

  it("rolls back a failed skipped batch and resumes exactly after Store restart and cancellation", async () => {
    const root = mkdtempSync(join(realpathSync(tmpdir()), "m10-backfill-restart-"));
    let store = new Store(root), clock = 1_700_000_000_000;
    const anchor = clock, delivered: string[] = [];
    const start = () => new DurableWakeupScheduler({ store, now: () => clock, deliver: async ({ occurrence }) => {
      delivered.push(occurrence.occurrenceKey);
      return { status: "DELIVERED" as const };
    } });
    let scheduler = start();
    cleanups.push(() => { scheduler.stop(); store.close(); rmSync(root, { recursive: true, force: true }); });
    const { wakeupId } = scheduler.register(command("background.wakeup.register"), {
      taskId: "t", trigger: { kind: "INTERVAL_UTC", anchorMs: anchor, intervalMs: 1 },
    });
    clock += 700;
    await scheduler.tick();
    const rangesBefore = store.all("backgroundOccurrenceBackfill");
    const rowsBefore = store.all("backgroundOccurrence");
    expect(rangesBefore).toHaveLength(1);
    const put = store.put.bind(store);
    let attempted = 0;
    const write = vi.spyOn(store, "put").mockImplementation((...args) => {
      put(...args);
      if (args[0] === "backgroundOccurrence" && ++attempted === 2) throw new Error("synthetic interrupted skipped batch");
    });
    await expect(scheduler.tick()).rejects.toThrow("synthetic interrupted skipped batch");
    expect(store.all("backgroundOccurrenceBackfill")).toEqual(rangesBefore);
    expect(store.all("backgroundOccurrence")).toEqual(rowsBefore);
    write.mockRestore();
    scheduler.stop();
    const priorAdmissions = store.all("backgroundAdmission");
    store.close();
    store = new Store(root);
    scheduler = start();
    scheduler.cancel(command("background.wakeup.cancel"), wakeupId);
    clock = anchor + 120; // the replayed reading of time cannot admit the old slots
    const competing = new DurableWakeupScheduler({ store, now: () => clock, deliver: async () => { throw new Error("skipped slot was dispatched"); } });
    cleanups.push(() => competing.stop());
    await Promise.all([scheduler.tick(), competing.tick()]);
    expect(store.all("backgroundOccurrenceBackfill")).toHaveLength(0);
    const rows = store.all<BackgroundOccurrenceV1>("backgroundOccurrence");
    expect(rows.filter(row => row.state === "SKIPPED").map(row => row.occurrenceKey).sort())
      .toEqual(Array.from({ length: 699 }, (_, index) => JSON.stringify([wakeupId, 1, anchor + index + 1])).sort());
    expect(store.all("backgroundAdmission")).toEqual(priorAdmissions);
    expect(delivered).toEqual([JSON.stringify([wakeupId, 1, anchor + 700])]);
    expect(scheduler.allSchedules()[0]?.state).toBe("CANCELLED");
  });

  it("retains a legacy skipped-count shortfall without creating historical admissions or guessed rows", async () => {
    const root = mkdtempSync(join(realpathSync(tmpdir()), "m10-legacy-backfill-"));
    const anchor = 1_700_000_000_000;
    let clock = anchor;
    let store = new Store(root);
    const deliver = vi.fn(async () => ({ status: "DELIVERED" as const }));
    let scheduler = new DurableWakeupScheduler({ store, now: () => clock, deliver });
    cleanups.push(() => { scheduler.stop(); store.close(); rmSync(root, { recursive: true, force: true }); });
    const wakeup = scheduler.register(command("background.wakeup.register"), {
      wakeupId: "legacy-capped", taskId: "t", trigger: { kind: "INTERVAL_UTC", anchorMs: anchor, intervalMs: 1 },
    });
    const knownKey = '["legacy-capped",1,1700000100001]';
    store.internal("fixture.legacy-cap", null, () => {
      store.put("backgroundWakeup", wakeup.wakeupId, null, {
        ...wakeup, skippedTotal: 100_001, lastProcessedDueAtMs: 1_700_000_100_002, nextDueAtMs: 1_700_000_100_003,
      });
      store.put("backgroundOccurrence", knownKey, null, {
        occurrenceKey: knownKey, wakeupId: wakeup.wakeupId, scheduleRevision: 1, scheduledDueAtMs: 1_700_000_100_001,
        hostEventId: null, state: "SKIPPED", dispatch: "NOT_DISPATCHED", claimGeneration: 0, admissionId: null,
        leaseExpiresAtMs: null, createdAt: wakeup.createdAt, updatedAt: wakeup.createdAt,
      } satisfies BackgroundOccurrenceV1);
    });
    scheduler.stop();
    store.close();
    store = new Store(root);
    scheduler = new DurableWakeupScheduler({ store, now: () => clock, deliver });
    scheduler.recover();
    clock = 1_700_000_000_001;
    await scheduler.tick();
    expect(scheduler.occurrences(wakeup.wakeupId).map(row => row.occurrenceKey)).toEqual([knownKey]);
    expect(scheduler.allSchedules()[0]!.skippedTotal - scheduler.occurrences(wakeup.wakeupId).length).toBe(100_000);
    expect(store.all("backgroundOccurrenceBackfill")).toEqual([]);
    expect(store.all("backgroundAdmission")).toEqual([]);
    expect(deliver).not.toHaveBeenCalled();
    clock = 1_700_000_100_003;
    await scheduler.tick();
    expect(scheduler.occurrences(wakeup.wakeupId).map(row => row.occurrenceKey)).toEqual([knownKey, '["legacy-capped",1,1700000100003]']);
    expect(scheduler.allSchedules()[0]!.skippedTotal).toBe(100_001);
    expect(store.all("backgroundAdmission")).toHaveLength(1);
    expect(deliver).toHaveBeenCalledTimes(1);
  });

  it("keeps an occurrence behind the persisted cadence ineligible while its skipped row is pending", async () => {
    const f = fixture(), anchor = f.now(), sent: string[] = [];
    const deliver = async ({ occurrence }: { occurrence: BackgroundOccurrenceV1 }) => {
      sent.push(occurrence.occurrenceKey);
      return { status: "DELIVERED" as const };
    };
    const stale = new DurableWakeupScheduler({ store: f.store, now: () => anchor + 700, deliver });
    const current = new DurableWakeupScheduler({ store: f.store, now: () => anchor + 1_000, deliver });
    const registration = new DurableWakeupScheduler({ store: f.store, now: f.now, deliver });
    cleanups.push(() => { stale.stop(); current.stop(); registration.stop(); });
    registration.register(command("background.wakeup.register"), {
      wakeupId: "stale-cadence", taskId: "t", trigger: { kind: "INTERVAL_UTC", anchorMs: anchor, intervalMs: 1 },
    });
    const internal = f.store.internal.bind(f.store);
    let racing = false;
    vi.spyOn(f.store, "internal").mockImplementation((type, thread, run) => {
      if (type === "background.occurrence.claimed" && !racing) {
        racing = true;
        void current.tick();
        expect(f.store.get("backgroundOccurrence", JSON.stringify(["stale-cadence", 1, anchor + 700]))).toBeNull();
      }
      return internal(type, thread, run);
    });
    await stale.tick();
    expect(sent).toEqual([JSON.stringify(["stale-cadence", 1, anchor + 1000])]);
    expect(f.store.all("backgroundAdmission")).toHaveLength(1);
  });

  it("rotates unfinished skipped ranges after admitting a newly due live schedule", async () => {
    const f = fixture(), anchor = f.now(), sent: string[] = [];
    const scheduler = new DurableWakeupScheduler({ store: f.store, now: f.now, deliver: async ({ wakeup }) => {
      sent.push(wakeup.wakeupId);
      return { status: "DELIVERED" as const };
    } });
    cleanups.push(() => scheduler.stop());
    for (const wakeupId of ["first-range", "second-range"]) scheduler.register(command("background.wakeup.register"), {
      wakeupId, taskId: "t", trigger: { kind: "INTERVAL_UTC", anchorMs: anchor, intervalMs: 1 },
    });
    f.advance(900);
    await scheduler.tick();
    const cursor = (id: string) => f.store.all<{ wakeupId: string; nextDueAtMs: number }>("backgroundOccurrenceBackfill")
      .find(record => record.wakeupId === id)?.nextDueAtMs;
    const first = cursor("first-range"), second = cursor("second-range");
    expect(first).toBeGreaterThan(second!);
    scheduler.register(command("background.wakeup.register"), {
      wakeupId: "ready-live", taskId: "t", trigger: { kind: "AT_UTC", dueAtMs: f.now() },
    });
    await scheduler.tick();
    expect(sent).toEqual(["first-range", "second-range", "ready-live"]);
    expect(cursor("first-range")).toBe(first);
    expect(cursor("second-range")).toBeGreaterThan(second!);
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
