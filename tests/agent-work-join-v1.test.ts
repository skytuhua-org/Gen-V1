import { afterEach, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Store } from "../packages/storage/store.ts";
import { AgentWorkCoordinator, type AgentWorkHooks } from "../packages/core/agent-work.ts";
import type { RunContext } from "../packages/contracts/index.ts";

// Issue #2038 T02 (M08 managed child workspaces): a CODE_WORKTREE child must be
// joinable through exact approval and a real managed-worktree proof. The host
// constructs AgentWorkCoordinator at apps/../packages/core/service.ts without
// roleProofs/roleHandlers, so the availability gate can never open — this is
// the "un-joined" gap frozen here at coordinator level (native worktree/cwd
// cases stay NOT_RUN without the path-guard boundary).
const stores: Store[] = [];
const roots: string[] = [];
afterEach(async () => {
  for (const store of stores.splice(0)) store.close();
  for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true });
});

const ctx = {} as RunContext;

const setup = async (extra: Partial<AgentWorkHooks> = {}) => {
  const root = await mkdtemp(join(tmpdir(), "agent-work-join-"));
  roots.push(root);
  const store = new Store(join(root, "state"));
  stores.push(store);
  // The same hook set Service wires at service.ts:296 — roleProofs and
  // roleHandlers are absent, exactly as in production.
  const hooks: AgentWorkHooks = {
    store,
    assertRun: () => {},
    isEnabled: () => true, // agents.workV1 + workspace.writeDelegateV1 both on
    resourceResolver: async () => ({}),
    ...extra,
  };
  return new AgentWorkCoordinator(hooks);
};

it("admits CODE_WORKTREE when the flag and a managed-worktree proof are wired", async () => {
  const coordinator = await setup({
    roleProofs: { codeWorktree: async () => ({ worktreeId: "wc-1", path: "/proj", profileDigest: "digest" }) },
  });
  // Control: with the proof actually supplied the gate opens — the mechanism
  // works; only the production wiring is missing.
  expect(coordinator.roleAvailability(ctx, "CODE_WORKTREE")).toEqual({ available: true });
});

it("joins a managed child workspace once the flag and proof exist — production wiring", async () => {
  // Service never supplies roleProofs; under that exact hook shape the gate
  // must still report joinable once workspace.writeDelegateV1 is on.
  const coordinator = await setup();
  expect(coordinator.roleAvailability(ctx, "CODE_WORKTREE")).toEqual({ available: true });
});
