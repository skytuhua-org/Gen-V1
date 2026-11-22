import { afterEach, describe, expect, it, vi } from "vitest";
import { execFileSync } from "node:child_process";
import { chmod, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { Store } from "../packages/storage/store.ts";
import { ProjectTools } from "../packages/workspace/tools.ts";
import { synthesizeUntrackedPatch, quotePath } from "../packages/workspace/patch-export.ts";

const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => {
  vi.restoreAllMocks();
  for (const close of cleanup.splice(0).reverse()) await close();
});

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "gen-patch-")),
    source = join(root, "source");
  await mkdir(source);
  const git = (...args: string[]) =>
    execFileSync("git", ["-C", source, ...args], { encoding: "utf8", windowsHide: true }).trim();
  git("init");
  git("config", "user.name", "Fixture");
  git("config", "user.email", "fixture@example.invalid");
  git("config", "core.autocrlf", "false");
  await writeFile(join(source, "one.txt"), "base\n");
  await writeFile(join(source, "two.txt"), "second\n");
  git("add", ".");
  git("commit", "-m", "Base");
  const store = new Store(join(root, "data")),
    tools = new ProjectTools(store);
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
    id: "main",
    title: "Main",
    projectId,
    projectName: "Fixture",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    primaryProjectId: projectId,
    status: "ready" as const,
    epoch: 0,
    runId: null,
    modelId: null,
    sessionPath: null,
    kind: "main" as const,
  };
  store.internal("fixture", null, () => store.put("thread", thread.id, thread.id, thread));
  await tools.prepareWorkspace(thread);
  return { root, source, git, tools, projectId };
}

function decode(patch: { contentBase64: string; bytes: number; sha256: string }) {
  const bytes = Buffer.from(patch.contentBase64, "base64");
  expect(bytes.length).toBe(patch.bytes);
  expect(createHash("sha256").update(bytes).digest("hex")).toBe(patch.sha256);
  return bytes;
}

function applies(clean: string, head: string, patch: Buffer) {
  execFileSync("git", ["-C", clean, "checkout", "-q", head], { windowsHide: true });
  execFileSync("git", ["-C", clean, "apply", "--check"], { input: patch, windowsHide: true });
  execFileSync("git", ["-C", clean, "apply"], { input: patch, windowsHide: true });
}

describe("gitPatch", () => {
  it("exports a modified file that applies to a fresh clone", async () => {
    const { source, tools, projectId } = await fixture();
    await writeFile(join(source, "one.txt"), "base\nchanged\n");
    const status = await tools.gitStatus(projectId, "main");
    const patch = await tools.gitPatch(projectId, { scope: "worktree", purpose: "save", revision: status.revision });
    const bytes = decode(patch);
    expect(bytes.toString("utf8")).toContain("+changed");
    expect(patch.paths).toEqual(["one.txt"]);
    const clean = join(await mkdtemp(join(tmpdir(), "gen-patch-clone-")), "c");
    execFileSync("git", ["clone", "-q", source, clean]);
    applies(clean, patch.head, bytes);
    expect(execFileSync("git", ["-C", clean, "diff", "HEAD"], { encoding: "utf8" })).toContain("+changed");
  });

  it("staged scope exports only staged content", async () => {
    const { source, git, tools, projectId } = await fixture();
    await writeFile(join(source, "one.txt"), "base\nstaged\n");
    git("add", "one.txt");
    await writeFile(join(source, "one.txt"), "base\nstaged\nunstaged\n");
    const status = await tools.gitStatus(projectId, "main");
    const patch = await tools.gitPatch(projectId, { scope: "staged", purpose: "save", revision: status.revision });
    const text = decode(patch).toString("utf8");
    expect(text).toContain("+staged");
    expect(text).not.toContain("+unstaged");
    const work = await tools.gitPatch(projectId, { scope: "worktree", purpose: "save", revision: status.revision });
    expect(decode(work).toString("utf8")).toContain("+unstaged");
  });

  it("includes untracked files with synthesized headers", async () => {
    const { source, tools, projectId } = await fixture();
    await writeFile(join(source, "new-file.txt"), "hello\nworld\n");
    const status = await tools.gitStatus(projectId, "main");
    const patch = await tools.gitPatch(projectId, { scope: "worktree", purpose: "save", revision: status.revision });
    const text = decode(patch).toString("utf8");
    expect(text).toContain("diff --git a/new-file.txt b/new-file.txt");
    expect(text).toContain("new file mode 100644");
    expect(text).toContain("+hello\n+world\n");
    const clean = join(await mkdtemp(join(tmpdir(), "gen-patch-clone-")), "c");
    execFileSync("git", ["clone", "-q", source, clean]);
    applies(clean, patch.head, decode(patch));
    expect(execFileSync("git", ["-C", clean, "diff", "--stat", "HEAD"], { encoding: "utf8" })).toContain("new-file.txt");
  });

  it("marks executable and empty untracked files correctly", async () => {
    const { source, tools, projectId } = await fixture();
    const script = join(source, "run.sh");
    await writeFile(script, "#!/bin/sh\necho hi\n");
    await chmod(script, 0o755);
    await writeFile(join(source, "empty.txt"), "");
    const status = await tools.gitStatus(projectId, "main");
    const patch = await tools.gitPatch(projectId, { scope: "worktree", purpose: "save", revision: status.revision });
    const text = decode(patch).toString("utf8");
    expect(text).toContain("new file mode 100755");
    expect(text).toMatch(/diff --git a\/empty\.txt b\/empty\.txt\nnew file mode 100644\nindex 0+\.\.\.[0-9a-f]{40}\n(?!-)/);
  });

  it("skips binary files with a reason", async () => {
    const { source, tools, projectId } = await fixture();
    await writeFile(join(source, "blob.bin"), Buffer.from([0, 1, 2, 3, 255]));
    const status = await tools.gitStatus(projectId, "main");
    const patch = await tools.gitPatch(projectId, { scope: "worktree", purpose: "save", revision: status.revision });
    expect(patch.skipped).toEqual([{ path: "blob.bin", reason: "binary" }]);
    expect(patch.paths).not.toContain("blob.bin");
  });

  it("handles rename detection and no trailing newline", async () => {
    const { source, git, tools, projectId } = await fixture();
    git("mv", "one.txt", "renamed.txt");
    await writeFile(join(source, "two.txt"), "second\nno-newline"); // no trailing LF
    const status = await tools.gitStatus(projectId, "main");
    const patch = await tools.gitPatch(projectId, { scope: "worktree", purpose: "save", revision: status.revision });
    const text = decode(patch).toString("utf8");
    expect(text).toContain("rename from one.txt");
    expect(text).toContain("rename to renamed.txt");
    expect(text).toContain("\\ No newline at end of file");
  });

  it("returns only the requested file", async () => {
    const { source, tools, projectId } = await fixture();
    await writeFile(join(source, "one.txt"), "base\none\n");
    await writeFile(join(source, "two.txt"), "second\ntwo\n");
    const status = await tools.gitStatus(projectId, "main");
    const patch = await tools.gitPatch(projectId, { scope: "worktree", purpose: "save", revision: status.revision, path: "one.txt" });
    const text = decode(patch).toString("utf8");
    expect(patch.paths).toEqual(["one.txt"]);
    expect(text).toContain("+one");
    expect(text).not.toContain("two.txt");
  });

  it("rejects stale revision, bad paths and files without changes", async () => {
    const { source, tools, projectId } = await fixture();
    await writeFile(join(source, "one.txt"), "base\nchanged\n");
    const status = await tools.gitStatus(projectId, "main");
    await expect(tools.gitPatch(projectId, { scope: "worktree", purpose: "save", revision: "wrong" })).rejects.toMatchObject({ code: "STALE_REVISION" });
    await expect(tools.gitPatch(projectId, { scope: "worktree", purpose: "save", revision: status.revision, path: "../escape" })).rejects.toMatchObject({ code: "UNSUPPORTED_PATH" });
    await expect(tools.gitPatch(projectId, { scope: "worktree", purpose: "save", revision: status.revision, path: "/abs" })).rejects.toMatchObject({ code: "UNSUPPORTED_PATH" });
    await expect(tools.gitPatch(projectId, { scope: "worktree", purpose: "save", revision: status.revision, path: "unchanged.txt" })).rejects.toMatchObject({ code: "UNSUPPORTED_PATH" });
    await expect(tools.gitPatch(projectId, { scope: "worktree", purpose: "save", revision: status.revision, path: "one.txt" })).resolves.toMatchObject({ paths: ["one.txt"] });
  });

  it("drops non-UTF-8 blocks for purpose=copy but keeps them for save", async () => {
    const { source, tools, projectId } = await fixture();
    await writeFile(join(source, "latin.txt"), Buffer.from([0x61, 0xe9, 0x0a])); // "aé\n" in Latin-1
    const status = await tools.gitStatus(projectId, "main");
    const copy = await tools.gitPatch(projectId, { scope: "worktree", purpose: "copy", revision: status.revision });
    expect(copy.skipped).toEqual([{ path: "latin.txt", reason: "not-utf8" }]);
    expect(copy.paths).toEqual([]);
    const save = await tools.gitPatch(projectId, { scope: "worktree", purpose: "save", revision: status.revision });
    expect(save.paths).toEqual(["latin.txt"]);
  });

  it("returns empty paths for a clean view and leaves the index untouched", async () => {
    const { git, tools, projectId } = await fixture();
    const status = await tools.gitStatus(projectId, "main");
    const before = git("status", "--porcelain");
    const patch = await tools.gitPatch(projectId, { scope: "worktree", purpose: "save", revision: status.revision });
    expect(patch.paths).toEqual([]);
    expect(patch.bytes).toBe(0);
    expect(git("status", "--porcelain")).toBe(before);
  });
});

describe("synthesized untracked headers", () => {
  it("quotePath matches git C-style quoting", () => {
    expect(quotePath("plain.txt")).toBe("plain.txt");
    expect(quotePath('a"b.txt')).toBe('"a\\"b.txt"');
    expect(quotePath("café.txt")).toBe('"caf\\303\\251.txt"');
    expect(quotePath("with space.txt")).toBe("with space.txt");
  });

  it("produces headers identical to git's own new-file diff", async () => {
    const root = await mkdtemp(join(tmpdir(), "gen-patch-noindex-"));
    cleanup.push(() => rm(root, { recursive: true, force: true }));
    const git = (...args: string[]) =>
      execFileSync("git", ["-C", root, ...args], { encoding: "utf8", windowsHide: true });
    git("init", "-q");
    git("config", "user.name", "Fixture");
    git("config", "user.email", "fixture@example.invalid");
    await writeFile(join(root, "seed.txt"), "seed\n");
    git("add", "seed.txt");
    git("commit", "-qm", "seed");
    const bytes = Buffer.from("alpha\nbeta\n");
    await writeFile(join(root, "new.txt"), bytes);
    // intent-to-add makes git emit its canonical new-file block for the same bytes.
    git("add", "-N", "new.txt");
    const canonical = git("diff", "--full-index", "--no-color", "--no-ext-diff", "--no-textconv");
    const synthesized = synthesizeUntrackedPatch("new.txt", bytes, false).toString("utf8");
    const header = (text: string) => text.split("\n").filter(line => !line.startsWith("@@") && !line.startsWith(" ") && !line.startsWith("-") && !line.startsWith("\\")).join("\n");
    expect(header(synthesized)).toBe(header(canonical));
    expect(synthesized).toBe(canonical);
  });

  it("matches git for empty and exec-mode new files", async () => {
    const root = await mkdtemp(join(tmpdir(), "gen-patch-noindex-"));
    cleanup.push(() => rm(root, { recursive: true, force: true }));
    const git = (...args: string[]) =>
      execFileSync("git", ["-C", root, ...args], { encoding: "utf8", windowsHide: true });
    git("init", "-q");
    git("config", "user.name", "Fixture");
    git("config", "user.email", "fixture@example.invalid");
    await writeFile(join(root, "seed.txt"), "seed\n");
    git("add", "seed.txt");
    git("commit", "-qm", "seed");
    await writeFile(join(root, "empty.txt"), "");
    const run = join(root, "run.sh");
    await writeFile(run, "#!/bin/sh\necho x\n");
    await chmod(run, 0o755);
    git("add", "-N", "empty.txt", "run.sh");
    const canonical = git("diff", "--full-index", "--no-color", "--no-ext-diff", "--no-textconv");
    const empty = synthesizeUntrackedPatch("empty.txt", Buffer.alloc(0), false).toString("utf8");
    const exec = synthesizeUntrackedPatch("run.sh", Buffer.from("#!/bin/sh\necho x\n"), true).toString("utf8");
    expect(canonical).toContain(empty.trimEnd());
    expect(canonical).toContain(exec.trimEnd());
  });
});
