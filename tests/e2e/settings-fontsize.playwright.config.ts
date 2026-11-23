import {defineConfig} from '@playwright/test';
import {resolve} from 'node:path';
export default defineConfig({
  testDir: '.', testMatch: 'settings-fontsize.spec.ts', workers: 1,
  outputDir: process.env.GEN_SETTINGS_FONTSIZE_OUTPUT ?? '.harness-settings-fontsize',
  use: {baseURL: 'http://127.0.0.1:5599', channel: 'chrome', viewport: {width: 1440, height: 1000}, trace: 'retain-on-failure'},
  webServer: {command: 'pnpm exec vite --host 127.0.0.1 --port 5599 --strictPort', cwd: resolve(import.meta.dirname, '../..'), url: 'http://127.0.0.1:5599', reuseExistingServer: false},
});
