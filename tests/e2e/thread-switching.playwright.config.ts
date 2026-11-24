import {defineConfig} from '@playwright/test';
import {resolve} from 'node:path';
import {tmpdir} from 'node:os';

export default defineConfig({
  testDir: '.', testMatch: 'thread-switching.spec.ts', workers: 1, timeout: 45_000,
  outputDir: resolve(tmpdir(), 'wo-1598-thread-switching-playwright'),
  use: {baseURL: 'http://127.0.0.1:5531', viewport: {width: 1440, height: 1000}, trace: 'retain-on-failure'},
  webServer: {
    command: 'pnpm exec vite --config tests/e2e/thread-switching.vite.config.ts --configLoader runner --host 127.0.0.1 --port 5531 --strictPort',
    cwd: resolve(import.meta.dirname, '../..'), url: 'http://127.0.0.1:5531', reuseExistingServer: false,
  },
});
