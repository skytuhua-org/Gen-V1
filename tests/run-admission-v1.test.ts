import { cleanTempDirs, tempDir } from './fixtures/temp-dir.ts';
import { it, expect, afterEach, describe, vi } from 'vitest';
import { writeFileSync, mkdtempSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

import { evaluateExecution, digestFileSha256, type ExecutionBackend, type PlatformProof, type LaunchRequest } from '../packages/core/execution-policy';
import { createProjectTrust } from '../packages/core/project-trust';
import { executionProfileV1Schema, WORKSPACE_EXECUTE_NO_NETWORK, type ExecutionProfileV1 } from '../packages/contracts/execution-profile';
import { BackgroundWorkCoordinator } from '../packages/core/background-work.ts';
import { Store } from '../packages/storage/store.ts';
import { __setCapabilityFlagForTests } from '../packages/core/capability-flags.ts';
import type { Thread } from '../packages/contracts/index.ts';

// T01 freeze for #2048: the production RUN admission boundary is un-joined.
// apps/server/hermes-service.ts calls evaluateExecution with `backends: []`,
// no trust, no approvedBackendId and no trustRootPath, then BackgroundWorkCoordinator
// launches whatever passed the gate through raw `spawn` — the ApprovedLaunch
// contract that a backend's launch() consumes is discarded before it can reach
// any installed, approved executor.

const FLAGS_ON = {
  HARNESS_FLAG_SECURITY_EXECUTION_PROFILES_V1: '1',
  HARNESS_FLAG_SECURITY_PROJECT_TRUST_V1: '1',
  HARNESS_FLAG_SECURITY_SECRET_REFS_V1: '1',
};

const cleanups: (() => void | Promise<void>)[] = [];
afterEach(async () => {
  cleanTempDirs();
  __setCapabilityFlagForTests('jobs.backgroundV1', undefined);
  for (const key of Object.keys(FLAGS_ON)) delete process.env[key];
  vi.restoreAllMocks();
  while (cleanups.length) await cleanups.pop()!();
});

function execFixture() {
  const root = tempDir('run-admission-');
  writeFileSync(join(root, 'tool.exe'), 'approved-tool-bytes-v1');
  writeFileSync(join(root, 'app.json'), '{"v":1}');
  return root;
}
const approved = [{ path: 'tool.exe', kind: 'executable' as const }, { path: 'app.json', kind: 'configuration' as const }];
const scope = { read: true, write: false, network: 'none' as const };

function proof(over: Partial<PlatformProof> = {}): PlatformProof {
  return { platformProofRef: 'proof-fixture-v1', platform: process.platform, status: 'PASS', recordedAt: new Date().toISOString(), ...over };
}
function backend(launches: LaunchRequest[], over: Partial<ExecutionBackend> = {}): ExecutionBackend {
  return { backendId: 'backend-a', platform: process.platform, installed: true, approved: true, proof: proof(), launch: vi.fn(async request => { launches.push(request); return { id: 'handle-1', terminate: async () => {} }; }), ...over };
}
async function profile(root: string, over: Record<string, unknown> = {}) {
  const executableSha256 = await digestFileSha256(join(root, 'tool.exe'));
  const base: Record<string, unknown> = { profileId: WORKSPACE_EXECUTE_NO_NETWORK, version: 1, backendId: 'backend-a', capabilities: ['process.execute', 'fs.read'], readRoots: [root], writeRoots: [], networkPolicy: { mode: 'none' }, secretRefs: [], executableAllowlist: [{ executableSha256, argv: ['run', '--fast'] }], platformProofRef: 'proof-fixture-v1', ...over };
  return executionProfileV1Schema.parse(base) as ExecutionProfileV1;
}
const execRequest = (root: string): LaunchRequest => ({ kind: 'executable', executable: join(root, 'tool.exe'), argv: ['run', '--fast'], cwd: root });

describe('M10-T01 production RUN admission', () => {
  it('control: a fully admitted evaluation binds the approved backend launch', async () => {
    const root = execFixture();
    const launches: LaunchRequest[] = [];
    const trust = await createProjectTrust({ trustId: 'exec-trust', rootPath: root, approvedFiles: approved, scope, decision: 'trusted' });
    const p = await profile(root);
    const decision = await evaluateExecution({ profile: p, request: execRequest(root), trust, trustRootPath: root, approvedBackendId: 'backend-a', backends: [backend(launches)], env: FLAGS_ON, explicitTrustedHost: false });
    expect(decision.status).toBe('ALLOW');
    if (decision.status !== 'ALLOW') return;
    expect(decision.backendId).toBe('backend-a');
    expect(decision.launch.profileId).toBe(p.profileId);
    expect(decision.launch.executableSha256).toHaveLength(64);
  });

  it('frozen: the production gate in hermes-service can never admit a valid launch', async () => {
    const root = execFixture();
    const p = await profile(root);
    const profileStore = new Map<string, unknown>([['p', p]]);
    for (const [key, value] of Object.entries(FLAGS_ON)) process.env[key] = value;
    // Exact production composition from apps/server/hermes-service.ts:40-45 —
    // trust, approvedBackendId, trustRootPath and backends are never supplied.
    const productionGate = async ({ profileId, spec }: { profileId: string; spec: { executable: string; argv: string[]; cwd: string } }) => {
      const candidate = profileStore.get(profileId);
      if (!candidate) return { allowed: false, reason: 'HOLD_EXECUTION_PROFILE' };
      const decision = await evaluateExecution({ profile: candidate, request: { kind: 'executable', executable: spec.executable, argv: spec.argv, cwd: spec.cwd }, env: process.env, backends: [] });
      return decision.status === 'ALLOW' ? { allowed: true } : { allowed: false, reason: decision.status === 'BLOCKED' ? decision.code : 'HOLD_EXECUTION_PROFILE' };
    };
    // A fully valid profile still cannot be admitted: no trust decision is ever
    // supplied and no backend is ever installed in the composition.
    const outcome = await productionGate({ profileId: 'p', spec: { executable: join(root, 'tool.exe'), argv: ['run', '--fast'], cwd: root } });
    expect(outcome).toEqual({ allowed: false, reason: 'HOLD_EXECUTION_PROFILE' });
  });

  it('frozen: an allowed decision launches through raw spawn, never backend.launch', async () => {
    const root = mkdtempSync(join(realpathSync(tmpdir()), 'run-admission-'));
    const store = new Store(join(root, 'state'));
    let clock = 1_700_000_000_000;
    const launches: LaunchRequest[] = [];
    const approvedBackend = backend(launches);
    const coordinator = new BackgroundWorkCoordinator({
      store, now: () => clock,
      // Even a gate that carries an ApprovedLaunch-shaped payload cannot bind
      // it: the decision type returns only {allowed, reason} to the caller.
      executionGate: async () => ({ allowed: true, backendId: 'backend-a', backend: approvedBackend } as never),
    });
    const thread: Thread = { id: 'thread-1', title: 'Owner', projectName: null, createdAt: new Date(clock).toISOString(), updatedAt: new Date(clock).toISOString(), status: 'ready', epoch: 0, runId: null, modelId: null, sessionPath: null };
    store.internal('fixture.thread', thread.id, () => store.put('thread', thread.id, thread.id, thread));
    cleanups.push(() => { coordinator.dispose(); store.close(); rmSync(root, { recursive: true, force: true, maxRetries: 8, retryDelay: 150 }); });
    __setCapabilityFlagForTests('jobs.backgroundV1', true);
    const owner = { threadId: thread.id, runId: null, epoch: 0, projectId: null, workspaceId: null, accountBinding: null };
    const work = coordinator.admit({ id: randomUUID(), type: 'background.work.admit', payload: {}, threadId: thread.id }, { owner, kind: 'COMMAND', title: 'run', command: { executable: process.execPath, argv: ['-e', ''], cwd: root, profileId: 'p' } });
    const started = await coordinator.startCommand(work.workId);
    expect(started.state).toBe('RUNNING');
    const deadline = Date.now() + 8_000;
    while (coordinator.work(work.workId).state !== 'SETTLED') {
      if (Date.now() > deadline) throw new Error('Timed out waiting for the command to settle');
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    // Raw spawn ran — the recorded process identity belongs to Node spawn, not
    // to any backend-owned handle. backend-a's launch() was never invoked even
    // though admission nominally approved this backend.
    expect(started.processIdentity?.pid).toBeGreaterThan(0);
    expect(launches).toHaveLength(0);
    expect(approvedBackend.launch).not.toHaveBeenCalled();
  });
});
