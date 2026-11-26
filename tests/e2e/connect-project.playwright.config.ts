import {defineConfig} from '@playwright/test';
import {resolve} from 'node:path';
export default defineConfig({expect:{timeout:15000},testDir:'.',testMatch:'connect-project.spec.ts',workers:1,timeout:30000,
 outputDir:resolve('.harness-ui-shell/connect-project'),
 use:{baseURL:'http://127.0.0.1:5833',browserName:'chromium',channel:process.platform==='win32'?'msedge':undefined,viewport:{width:1000,height:720},trace:'retain-on-failure'},
 webServer:{command:'pnpm exec vite --host 127.0.0.1 --port 5833 --strictPort',cwd:resolve(import.meta.dirname,'../..'),url:'http://127.0.0.1:5833',reuseExistingServer:false}});
