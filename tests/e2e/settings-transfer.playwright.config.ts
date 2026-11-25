import {defineConfig} from '@playwright/test';
import {resolve} from 'node:path';
export default defineConfig({
  testDir: '.', testMatch: 'settings-transfer.spec.ts', workers: 1,
  outputDir: process.env.GEN_SETTINGS_TEST_OUTPUT ?? '.harness-settings-transfer',
  expect: {timeout: 15_000},
  use: {baseURL: 'http://127.0.0.1:5795', channel: process.platform === 'win32' ? 'msedge' : undefined, headless: true, serviceWorkers: 'block', viewport: {width: 1440, height: 1000}, trace: 'retain-on-failure', screenshot: 'only-on-failure'},
  webServer: {command: 'pnpm exec vite --host 127.0.0.1 --port 5795 --strictPort', cwd: resolve(import.meta.dirname, '../..'), url: 'http://127.0.0.1:5795', reuseExistingServer: false},
});
