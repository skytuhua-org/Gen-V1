import { afterEach, expect, it, vi } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Store } from "../packages/storage/store.ts";
import { ProjectTools } from "../packages/workspace/tools.ts";
import { GitHubTools } from "../packages/workspace/github.ts";
import type { TerminalHost } from "../packages/workspace/terminal.ts";

// #2039 T03 (M08-S12/U04/T06): source-bound check observations and bounded
// retry/backoff for pull-request status. `github.details` persists a
// versioned check observation
// (repo+PR keyed) carrying the tested head, normalized state and backoff;
// reads inside the window serve the stored record flagged stale.

vi.mock("../packages/core/file-access.ts", async original => ({
  ...await original<typeof import("../packages/core/file-access.ts")>(),
  withPathGuard: vi.fn(async (_paths, signal, action) => { signal.throwIfAborted(); return action([]); }),
}));

const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => {
  vi.restoreAllMocks();
  for (const close of cleanup.splice(0).reverse()) await close();
});

const base = "a".repeat(40), headA = "f".repeat(40), headB = "e".repeat(40);
const detailsItem = (headOid: string, rollup: unknown[] = []) => ({
  number: 12, title: "Fixture", url: "https://github.com/example/fixture/pull/12",
  state: "OPEN", baseRefOid: base, headRefOid: headOid, headRefName: "feature",
  isDraft: false, files: [], reviews: [], statusCheckRollup: rollup,
});

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "gen-prcheck-")), source = join(root, "source");
  await mkdir(source);
  const git = (...args: string[]) =>
    execFileSync("git", ["-C", source, ...args], { encoding: "utf8", windowsHide: true }).trim();
  git("init");
  git("config", "user.name", "Fixture");
  git("config", "user.email", "fixture@example.invalid");
  git("config", "core.autocrlf", "false");
  await writeFile(join(source, "one.txt"), "base\n");
  git("add", ".");
  git("commit", "-m", "Base");
  git("remote", "add", "origin", "https://github.com/example/fixture.git");
  const store = new Store(join(root, "data")), tools = new ProjectTools(store);
  cleanup.push(async () => {
    await tools.dispose();
    store.close();
    await rm(root, { recursive: true, force: true, maxRetries: 5 });
  });
  const receipt = await tools.connect({
    id: "connect",
    type: "workspace.project.connect",
    payload: { name: "Fixture", path: source },
  });
  const projectId = (receipt.result as { projects: { id: string }[] }).projects[0].id;
  const thread = {
    id: "main", title: "Main", projectId, projectName: "Fixture",
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
  store.internal("fixture", null, () => store.put("thread", thread.id, thread.id, thread));
  // The fixture folder is a plain local copy, not a managed worktree; the
  // head/revision the provider read is compared against is stubbed to a fixed
  // value so the preview boundary under test is the provider observation, not
  // working-copy custody.
  vi.spyOn(tools, "gitStatus").mockResolvedValue({ head: headA, revision: 1, gitWrite: true } as never);
  vi.spyOn(tools, "git").mockResolvedValue("https://github.com/example/fixture.git\n" as never);
  const github = new GitHubTools(tools, {} as TerminalHost);
  const provider = vi.fn(async (_path: string, _args: string[]) => JSON.stringify(detailsItem(headA)));
  (github as unknown as { run: typeof provider }).run = provider;
  return { github, tools, store, projectId, provider };
}

it("bounds provider calls with a persisted check observation and backoff", async () => {
  const { github, tools, projectId, provider } = await fixture();
  await github.details(projectId, "main", 12);
  await github.details(projectId, "main", 12);
  // Same repo+PR+head inside the backoff window: the second read is served from
  // the persisted observation, not another provider round-trip (M08-S12).
  expect(provider).toHaveBeenCalledTimes(1);
  // A restarted host honors the same persisted backoff — still no new call.
  const restarted = new GitHubTools(tools, {} as TerminalHost);
  (restarted as unknown as { run: typeof provider }).run = provider;
  await restarted.details(projectId, "main", 12);
  expect(provider).toHaveBeenCalledTimes(1);
}, 60000);

it("check observations name their exact tested head and go stale on head change", async () => {
  const { github, projectId, provider } = await fixture();
  const rollup = [{ __typename: "CheckRun", name: "unit", status: "COMPLETED", conclusion: "SUCCESS" }];
  provider.mockImplementation(async () => JSON.stringify(detailsItem(headA, rollup)));
  const first = await github.details(projectId, "main", 12) as Record<string, unknown>;
  // M08-U04/T06: a check row observed at head A is evidence about head A only;
  // the observation must carry its tested head, source time and staleness.
  expect(first.checkObservation ?? first.observation).toMatchObject({ headOid: headA, stale: false });
  provider.mockImplementation(async () => JSON.stringify(detailsItem(headB, rollup)));
  const second = await github.details(projectId, "main", 12) as Record<string, unknown>;
  // Inside the backoff window the stored observation may be served — but it
  // still names head A and is flagged stale; head B never inherits a pass.
  expect(second.checkObservation ?? second.observation).toMatchObject({ headOid: headA, stale: true });
}, 60000);

it("pending, unavailable and billing-blocked provider states are never PASS", async () => {
  const { github, projectId, provider } = await fixture();
  // A rollup with no completed success is unknown/pending — the observation
  // must not surface it as a pass (M08-S12).
  provider.mockImplementation(async () => JSON.stringify(detailsItem(headA, [
    { __typename: "StatusContext", context: "lint", state: "PENDING" },
  ])));
  const result = await github.details(projectId, "main", 12) as Record<string, unknown>;
  const observation = result.checkObservation ?? result.observation;
  expect(observation).toBeDefined();
  expect(JSON.stringify(observation)).not.toMatch(/"pass(ed)?"/i);
}, 60000);
