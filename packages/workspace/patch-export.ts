// Byte-exact patch export for the Changes panel (#1604, plan D3): tracked diff
// via nativeGitBytes, untracked files synthesized into `diff --git` form.
import { createHash } from "node:crypto";
import { open } from "node:fs/promises";
import { join } from "node:path";
import { HarnessError } from "../contracts/index.ts";
import { nativeGitBytes } from "./git-storage.ts";
import { withPathGuard } from "../core/file-access.ts";
import type { WorkspacePatch, WorkspacePatchSkip } from "../contracts/workspace-patch.ts";
import { WORKSPACE_PATCH_LIMIT_BYTES } from "../contracts/workspace-patch.ts";

export interface PatchFileInfo { path: string; oldPath?: string; untracked: boolean; binary: boolean }
export interface PatchInput {
  scope: "staged" | "worktree";
  purpose: "copy" | "save";
  path?: string;
  managed: boolean;
  head: string;
  branch: string;
  revision: string;
  files: PatchFileInfo[];
}

const sha256 = (data: Buffer) => createHash("sha256").update(data).digest("hex");
const sha1 = (data: Buffer) => createHash("sha1").update(data).digest("hex");

/** Git's C-style quoting for paths that need it (controls, ", \, non-ASCII). */
export function quotePath(value: string): string {
  const bytes = Buffer.from(value, "utf8");
  let needsQuote = false;
  for (const byte of bytes) if (byte < 0x20 || byte >= 0x80 || byte === 0x22 || byte === 0x5c) { needsQuote = true; break; }
  if (!needsQuote) return value;
  let out = '"';
  for (const byte of bytes) {
    if (byte === 0x22 || byte === 0x5c) out += "\\" + String.fromCharCode(byte);
    else if (byte === 0x07) out += "\\a";
    else if (byte === 0x08) out += "\\b";
    else if (byte === 0x09) out += "\\t";
    else if (byte === 0x0a) out += "\\n";
    else if (byte === 0x0b) out += "\\v";
    else if (byte === 0x0c) out += "\\f";
    else if (byte === 0x0d) out += "\\r";
    else if (byte < 0x20 || byte >= 0x80) out += "\\" + byte.toString(8).padStart(3, "0");
    else out += String.fromCharCode(byte);
  }
  return out + '"';
}

/** Same bound-read guard as untrackedDigest; returns bytes + binary flag. */
async function readUntracked(path: string, signal: AbortSignal): Promise<{ bytes: Buffer; binary: boolean; executable: boolean }> {
  return withPathGuard([{ path, leaf: true, readOnly: true }], signal, async () => {
    const file = await open(path, "r");
    try {
      const info = await file.stat({ bigint: true });
      if (!info.isFile() || info.nlink !== 1n) throw new HarnessError("CAPABILITY_DENIED", "Changed paths must be ordinary files.");
      const parts: Buffer[] = [];
      const buffer = Buffer.alloc(1024 * 1024);
      let offset = 0, binary = false;
      while (offset < Number(info.size)) {
        if (signal.aborted) throw new HarnessError("CANCELLED", "Git review cancelled.");
        const part = await file.read(buffer, 0, Math.min(buffer.length, Number(info.size) - offset), offset);
        if (!part.bytesRead) throw new HarnessError("CAPABILITY_DENIED", "Changed file changed during review.");
        const bytes = buffer.subarray(0, part.bytesRead);
        binary ||= bytes.includes(0);
        parts.push(Buffer.from(bytes));
        offset += part.bytesRead;
      }
      return { bytes: Buffer.concat(parts), binary, executable: (Number(info.mode) & 0o111) !== 0 };
    } finally { await file.close(); }
  });
}

/** Synthesize a `diff --git` new-file block, matching `git diff --no-index` form. */
export function synthesizeUntrackedPatch(path: string, bytes: Buffer, executable: boolean): Buffer {
  const mode = executable ? "100755" : "100644";
  const blob = sha1(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`), bytes]));
  const q = quotePath(path);
  const head = `diff --git a/${q} b/${q}\nnew file mode ${mode}\nindex 0000000000000000000000000000000000000000..${blob}\n`;
  if (!bytes.length) return Buffer.from(head, "utf8");
  const lines: Buffer[] = [];
  let start = 0;
  for (let index = 0; index < bytes.length; index++) {
    if (bytes[index] === 0x0a) { lines.push(bytes.subarray(start, index + 1)); start = index + 1; }
  }
  if (start < bytes.length) lines.push(bytes.subarray(start));
  const body = Buffer.concat(lines.map(line => Buffer.concat([Buffer.from("+"), line])));
  const noEol = bytes.length > 0 && bytes[bytes.length - 1] !== 0x0a;
  return Buffer.concat([
    Buffer.from(head, "utf8"),
    Buffer.from("--- /dev/null\n+++ b/" + q + "\n@@ -0,0 +1," + lines.length + " @@\n", "utf8"),
    body,
    ...(noEol ? [Buffer.from("\n\\ No newline at end of file\n", "utf8")] : []),
  ]);
}

/** Split a raw diff into per-file blocks at `diff --git ` boundaries. */
function splitBlocks(diff: Buffer): Buffer[] {
  const marker = Buffer.from("diff --git ");
  const blocks: Buffer[] = [];
  let start = -1;
  for (let index = 0; ; index++) {
    const hit = diff.indexOf(marker, start + 1);
    if (hit < 0) { if (start >= 0) blocks.push(diff.subarray(start)); else if (diff.length) blocks.push(diff); return blocks; }
    if (start >= 0) blocks.push(diff.subarray(start, hit));
    start = hit;
  }
}

export async function buildWorkspacePatch(executable: string, metadata: string, worktree: string, input: PatchInput, signal: AbortSignal): Promise<WorkspacePatch> {
  const skipped: WorkspacePatchSkip[] = [];
  const blocks: Buffer[] = [];
  const paths: string[] = [];
  const single = input.path;
  const wanted = single ? new Set([single]) : undefined;
  // Renames produce both pathspecs so the whole file block is included.
  const rename = single ? input.files.find(file => file.path === single && file.oldPath) : undefined;
  const pathspecs = single ? [":(literal)" + single, ...(rename?.oldPath ? [":(literal)" + rename.oldPath] : [])] : [];
  const diffArgs = ["diff", "--full-index", "--no-color", "--no-ext-diff", "--no-textconv", "--find-renames", ...(input.scope === "staged" ? ["--cached", "HEAD"] : []), "--", ...pathspecs];
  const tracked = await nativeGitBytes(executable, metadata, worktree, diffArgs, signal);
  // Binary rows in numstat show "-\t-\t"; map blocks to paths in the same order.
  const numstatArgs = ["diff", "--numstat", "-z", "--no-ext-diff", "--no-textconv", ...(input.scope === "staged" ? ["--cached", "HEAD"] : []), "--", ...pathspecs];
  const numstat = (await nativeGitBytes(executable, metadata, worktree, numstatArgs, signal)).toString("utf8");
  const statRows: { binary: boolean; path: string }[] = [];
  const rows = numstat.split("\0");
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    if (!row) continue;
    const [added, , ...parts] = row.split("\t");
    let name = parts.join("\t");
    if (!name) name = rows[++index] ?? "";
    statRows.push({ binary: added === "-", path: name });
  }
  const trackedBlocks = splitBlocks(tracked).filter(block => block.length > 0);
  trackedBlocks.forEach((block, index) => {
    const row = statRows[index];
    const name = row?.path ?? "";
    if (wanted && !wanted.has(name)) return;
    if (row?.binary) { skipped.push({ path: name, reason: "binary" }); return; }
    blocks.push(block);
    if (name) paths.push(name);
  });
  // Untracked: worktree scope, managed mode only, never in the staged view.
  if (input.scope === "worktree" && input.managed) {
    const untracked = input.files.filter(file => file.untracked && (!wanted || wanted.has(file.path))).sort((a, b) => Buffer.compare(Buffer.from(a.path), Buffer.from(b.path)));
    for (const file of untracked) {
      let data;
      try { data = await readUntracked(join(worktree, file.path), signal); }
      catch (cause) {
        if (cause instanceof HarnessError && cause.code === "CAPABILITY_DENIED") { skipped.push({ path: file.path, reason: "unreadable" }); continue; }
        skipped.push({ path: file.path, reason: "unsupported-file" });
        continue;
      }
      if (file.binary || data.binary) { skipped.push({ path: file.path, reason: "binary" }); continue; }
      blocks.push(synthesizeUntrackedPatch(file.path, data.bytes, data.executable));
      paths.push(file.path);
    }
  }
  let bytes = Buffer.concat(blocks);
  // Clipboard holds text only: purpose=copy drops non-UTF-8 blocks.
  if (input.purpose === "copy" && bytes.length) {
    try { new TextDecoder("utf-8", { fatal: true }).decode(bytes); }
    catch {
      const kept: Buffer[] = [];
      const decoder = new TextDecoder("utf-8", { fatal: true });
      for (const block of blocks) {
        try { decoder.decode(block); kept.push(block); }
        catch { skipped.push({ path: paths[blocks.indexOf(block)] ?? "unknown", reason: "not-utf8" }); }
      }
      const keptPaths = paths.filter((_, index) => kept.includes(blocks[index]!));
      paths.length = 0; paths.push(...keptPaths);
      bytes = Buffer.concat(kept);
    }
  }
  if (bytes.length > WORKSPACE_PATCH_LIMIT_BYTES)
    throw new HarnessError("RESOURCE_LIMIT", "This patch is larger than 4 MiB. Use git diff in a terminal for changes this large.");
  return {
    scope: input.scope,
    revision: input.revision,
    head: input.head,
    branch: input.branch,
    paths,
    skipped,
    bytes: bytes.length,
    sha256: sha256(bytes),
    contentBase64: bytes.toString("base64"),
  };
}
