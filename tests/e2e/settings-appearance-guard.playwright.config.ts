import {defineConfig} from '@playwright/test';
import {resolve} from 'node:path';
export default defineConfig({
  testDir: '.', testMatch: 'settings-appearance-guard.spec.ts', workers: 1,
  outputDir: process.env.GEN_SETTINGS_GUARD_OUTPUT ?? '.harness-settings-appearance-guard',
  use: {baseURL: 'http://127.0.0.1:5597', channel: 'chrome', viewport: {width: 1440, height: 1000}, trace: 'retain-on-failure'},
  webServer: {command: 'pnpm exec vite --host 127.0.0.1 --port 5597 --strictPort', cwd: resolve(import.meta.dirname, '../..'), url: 'http://127.0.0.1:5597', reuseExistingServer: false},
});
