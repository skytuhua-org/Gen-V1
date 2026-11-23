import { defineConfig } from 'vite';
import { realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import application from './vite.config';

export default defineConfig({ ...application,
  cacheDir: resolve(tmpdir(), 'wo-1626-remote-sync-vite'),
  server: { ...application.server, port: 5481,
    fs: { allow: [resolve('.'), realpathSync('node_modules')] },
  },
});
