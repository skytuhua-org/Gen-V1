import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const bunBinary = join(process.cwd(), "node_modules/bun/bin/bun.exe");
const runCheck = (cwd: string) => spawnSync(bunBinary, ["check", "--no-script", "--no-pretty"], { cwd, encoding: "utf8" });

describe("bun check typecheck", () => {
  it("is the typecheck script", () => {
    const manifest = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as { scripts: Record<string, string> };
    expect(manifest.scripts.typecheck).toBe("bun check --no-script");
  });

  it("fails on a type error under the repository compiler options", () => {
    const dir = mkdtempSync(join(tmpdir(), "bun-check-"));
    try {
      const root = JSON.parse(readFileSync(new URL("../tsconfig.json", import.meta.url), "utf8")) as { compilerOptions: Record<string, unknown> };
      writeFileSync(join(dir, "tsconfig.json"), JSON.stringify({ compilerOptions: { ...root.compilerOptions, noEmit: true, types: [] }, include: ["*.ts"] }));
      writeFileSync(join(dir, "good.ts"), "export const value: number = 1;\n");
      expect(runCheck(dir).status).toBe(0);
      writeFileSync(join(dir, "bad.ts"), "export const value: number = \"x\";\n");
      const bad = runCheck(dir);
      expect(bad.status).not.toBe(0);
      expect(bad.stdout + bad.stderr).toMatch(/bad\.ts\(1,14\): error TS2322/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
