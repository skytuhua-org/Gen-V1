import { defineConfig } from "vitest/config";
import { realpathSync } from "node:fs";
import { tmpdir } from "node:os";

// Windows runners can expose TEMP through an 8.3 alias; fixtures use canonical paths.
if (process.platform === "win32") process.env.TEMP = process.env.TMP = realpathSync.native(tmpdir());

// With --changed (pull-request feedback), a change to any of these selects every
// test: they are read at run time or shape every test, so the module graph
// cannot tell which tests depend on them. The merge queue always runs everything.
// Vitest matches these against absolute paths, so each starts with **/, and
// dot directories are named because ** does not enter them.
const forceRerunTriggers = [
  "**/package.json/**", "**/{vitest,vite}.config.*/**", "**/pnpm-lock.yaml", "**/pnpm-workspace.yaml", "**/tsconfig*.json",
  "**/patches/**", "**/.github/**", "**/scripts/**", "**/tests/fixtures/**", "**/tests/e2e/**", "**/third-party/**",
  "**/docs/**", "**/plugins/**", "**/.{gitattributes,gitignore,node-version,nvmrc}",
  "**/*.{json,yml,yaml,md,py,html,css,txt,toml,sql,sh,ps1}",
];

export default defineConfig({ test: { include: ["tests/**/*.test.{ts,tsx,js,jsx,mjs,cjs,mts,cts}"], exclude: ["tests/plugin-api-package.test.mjs"], testTimeout: 60000, hookTimeout: 60000, forceRerunTriggers } });
