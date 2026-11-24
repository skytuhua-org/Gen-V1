import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const config = JSON.parse(readFileSync(new URL("../.oxlintrc.json", import.meta.url), "utf8")) as { rules: Record<string, string> };
const bunBinary = join(process.cwd(), "node_modules/bun/bin/bun.exe");
const runBun = (args: string[], cwd = process.cwd()) => spawnSync(bunBinary, args, { cwd, encoding: "utf8" });

describe("bun lint configuration", () => {
  it("sets every lint rule explicitly so a new rule cannot arrive unreviewed", () => {
    const listed = runBun(["lint", "--no-script", "--rules"]).stdout.split("\n").map((line) => line.trim()).filter((line) => line && !/^(markdown|json)\//.test(line));
    expect(listed.length).toBeGreaterThan(1000);
    expect(listed.filter((rule) => !(rule in config.rules))).toEqual([]);
    expect(Object.values(config.rules).every((level) => level === "error" || level === "off")).toBe(true);
    expect(Object.values(config.rules).filter((level) => level === "error").length).toBeGreaterThanOrEqual(533);
  });

  it("fails on a violation of an enabled rule", () => {
    const dir = mkdtempSync(join(tmpdir(), "bun-lint-"));
    try {
      writeFileSync(join(dir, ".oxlintrc.json"), JSON.stringify(config));
      writeFileSync(join(dir, "bad.ts"), "export function f(): void {\n  debugger;\n}\n");
      writeFileSync(join(dir, "good.ts"), "export const value = 1;\n");
      const bad = runBun(["lint", "--no-script", "bad.ts"], dir);
      expect(config.rules["eslint/no-debugger"]).toBe("error");
      expect(bad.status).not.toBe(0);
      expect(bad.stdout + bad.stderr).toContain("no-debugger");
      expect(runBun(["lint", "--no-script", "good.ts"], dir).status).toBe(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

