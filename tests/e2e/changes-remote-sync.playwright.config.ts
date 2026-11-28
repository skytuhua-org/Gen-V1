import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';

export default defineConfig({
  testDir: '.', testMatch: ['changes-remote-sync.spec.ts'], workers: 1, timeout: 45_000,
  outputDir: resolve(tmpdir(), 'wo-1626-remote-sync-playwright'),
  use: { baseURL: 'http://127.0.0.1:5481', viewport: { width: 1024, height: 768 }, trace: 'retain-on-failure' },
  webServer: {
    command: 'pnpm exec vite --config tests/e2e/changes-remote-sync.vite.config.ts --port 5481 --strictPort',
    cwd: resolve(import.meta.dirname, '../..'), url: 'http://127.0.0.1:5481', reuseExistingServer: false,
  },
});
