import {defineConfig} from '@playwright/test';
import {resolve} from 'node:path';

export default defineConfig({testDir:'.',testMatch:'running-servers.spec.ts',workers:1,timeout:20000,expect:{timeout:4000},outputDir:process.env.GEN_RUNNING_SERVERS_OUTPUT??'.harness-running-servers-results',use:{baseURL:'http://127.0.0.1:5815',channel:'chrome',headless:true,serviceWorkers:'block',viewport:{width:1280,height:900},trace:'retain-on-failure',screenshot:'only-on-failure'},webServer:{command:'pnpm exec vite --config tests/e2e/running-servers.vite.config.ts --host 127.0.0.1 --port 5815 --strictPort',cwd:resolve(import.meta.dirname,'../..'),url:'http://127.0.0.1:5815/tests/e2e/fixtures/running-servers.html',reuseExistingServer:false}});
