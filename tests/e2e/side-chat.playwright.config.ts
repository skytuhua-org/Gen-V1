import {defineConfig} from '@playwright/test';
import {resolve} from 'node:path';
export default defineConfig({expect:{timeout:15000},testDir:'.',testMatch:'side-chat.spec.ts',workers:1,timeout:30000,use:{baseURL:'http://127.0.0.1:5484',viewport:{width:1440,height:1000},trace:'retain-on-failure'},webServer:{command:'pnpm exec vite --host 127.0.0.1 --port 5484 --strictPort',cwd:resolve(import.meta.dirname,'../..'),url:'http://127.0.0.1:5484',reuseExistingServer:false},reporter:'line'});
