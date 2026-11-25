import {defineConfig} from '@playwright/test';
import {resolve} from 'node:path';
export default defineConfig({testDir:'.',testMatch:'browser-find.spec.ts',workers:1,timeout:30000,expect:{timeout:4000},
 outputDir:process.env.GEN_BROWSER_FIND_EVIDENCE??resolve('.harness-browser-find'),use:{baseURL:'http://127.0.0.1:5789',headless:true,serviceWorkers:'block',viewport:{width:900,height:700},trace:'retain-on-failure'},
 webServer:{command:'pnpm exec vite --config tests/e2e/vite.config.ts --port 5789 --strictPort',cwd:resolve(import.meta.dirname,'../..'),url:'http://127.0.0.1:5789',reuseExistingServer:false}});
