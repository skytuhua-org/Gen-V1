import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';

export default defineConfig({
  testDir: '.', testMatch: /prompt-snippets\.spec\.ts/, workers: 1, timeout: 20000,
  outputDir: process.env.SNIPPETS_OUTPUT ?? resolve(tmpdir(), 'gen-prompt-snippets'),
  use: { baseURL: 'http://127.0.0.1:5413', viewport: { width: 1440, height: 900 }, trace: 'retain-on-failure' },
  webServer: { command: 'pnpm exec vite --config tests/e2e/compact-model-picker.vite.config.ts --port 5413 --strictPort', cwd: resolve(import.meta.dirname, '../..'), url: 'http://127.0.0.1:5413', reuseExistingServer: false },
});
