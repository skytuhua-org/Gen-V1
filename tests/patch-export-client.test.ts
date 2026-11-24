import { describe, expect, it, vi } from "vitest";
import { patchFilename, decodePatch, savePatchBytes, skippedSummary } from "../apps/web/src/patch-export.ts";
import type { WorkspacePatch } from "../packages/contracts/workspace-patch.ts";

const patch = (overrides: Partial<WorkspacePatch> = {}): WorkspacePatch => ({
  scope: "worktree",
  revision: "a".repeat(64),
  head: "b".repeat(40),
  branch: "main",
  paths: [],
  skipped: [],
  bytes: 0,
  sha256: "",
  contentBase64: "",
  ...overrides,
});
const sha256 = async (bytes: Uint8Array) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes as unknown as BufferSource))].map(b => b.toString(16).padStart(2, "0")).join("");
const encoded = async (text: string) => {
  const bytes = new TextEncoder().encode(text);
  return patch({ bytes: bytes.length, contentBase64: btoa(String.fromCharCode(...bytes)), sha256: await sha256(bytes) });
};

describe("patchFilename", () => {
  it("builds project-branch-view names", () => {
    expect(patchFilename("My App", "feature/x", "a".repeat(40), "worktree")).toBe("My-App-feature-x-unstaged.patch");
    expect(patchFilename("gen", "", "0123456789abcdef".repeat(3).slice(0, 40), "staged")).toBe("gen-0123456789-staged.patch");
  });
  it("sanitizes to the allowed charset and caps at 120 chars", () => {
    const long = patchFilename("p r o j: e c t 💥", "b".repeat(200), "a".repeat(40), "worktree");
    expect(long.length).toBeLessThanOrEqual(120);
    expect(long).toMatch(/^[A-Za-z0-9._-]+\.patch$/);
    expect(patchFilename("", "", "c".repeat(40), "worktree", "dir/odd file.ts")).toBe("workspace-cccccccccc-unstaged-dir-odd-file.ts.patch");
  });
});

describe("decodePatch", () => {
  it("round-trips bytes and verifies sha256", async () => {
    const value = await encoded("diff --git a/x b/x\n");
    await expect(decodePatch(value)).resolves.toEqual(new TextEncoder().encode("diff --git a/x b/x\n"));
    await expect(decodePatch({ ...value, sha256: "0".repeat(64) })).rejects.toThrow("digest");
    await expect(decodePatch({ ...value, bytes: 5 })).rejects.toThrow("bytes");
  });
});

describe("savePatchBytes", () => {
  it("uses the desktop bridge when present", async () => {
    const value = await encoded("x");
    const savePatch = vi.fn(async () => ({ status: "saved" as const, filename: "n.patch" }));
    vi.stubGlobal("window", { harnessDesktop: { savePatch } });
    await expect(savePatchBytes("n.patch", value, new Uint8Array(1))).resolves.toBe("saved");
    expect(savePatch).toHaveBeenCalledWith({ filename: "n.patch", contentBase64: value.contentBase64, sha256: value.sha256 });
    vi.unstubAllGlobals();
  });
  it("falls back to a Blob download and revokes the URL", async () => {
    const value = await encoded("x");
    const create = vi.fn(() => "blob:patch"), revoke = vi.fn();
    vi.stubGlobal("window", {});
    vi.stubGlobal("URL", { createObjectURL: create, revokeObjectURL: revoke });
    const link = { href: "", download: "", click: vi.fn(), remove: vi.fn() };
    vi.stubGlobal("document", { createElement: () => link, body: { append: () => {} } });
    await expect(savePatchBytes("n.patch", value, new Uint8Array(1))).resolves.toBe("saved");
    expect(revoke).toHaveBeenCalledWith("blob:patch");
    vi.unstubAllGlobals();
  });
});

describe("skippedSummary", () => {
  it("summarizes skipped files", () => {
    expect(skippedSummary([])).toBe("");
    expect(skippedSummary([{ path: "a.bin", reason: "binary" }])).toBe("Skipped a.bin (binary).");
    expect(skippedSummary([
      { path: "a", reason: "binary" }, { path: "b", reason: "not-utf8" },
      { path: "c", reason: "unreadable" }, { path: "d", reason: "unsupported-file" }, { path: "e", reason: "binary" },
    ])).toBe("Skipped a (binary), b (not UTF-8 text), c (unreadable) and 2 more.");
  });
});
