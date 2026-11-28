import {test as base} from '@playwright/test';
import {mkdtemp, rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import react from '@vitejs/plugin-react';
import {createServer, type ViteDevServer} from 'vite';

const fixtureUrl = '/@fs/' + resolve('tests/e2e/markdown-math-leaf.html').replaceAll('\\', '/');

// Each worker uses a private prebundle so a first KaTeX import cannot trigger
// a Vite reload while a test is holding an import or a selection.
export const test = base.extend<object, {mathFixture: string}>({
  mathFixture: [async ({}, use) => {
    const cacheDir = await mkdtemp(resolve('node_modules/.vite-math-leaf-'));
    let server: ViteDevServer | undefined;
    try {
      server = await createServer({
        configFile:false, root:'apps/web', plugins:[react()], cacheDir,
        optimizeDeps:{include:['katex', 'react', 'react-dom/client', 'react/jsx-dev-runtime', 'lucide-react'], noDiscovery:true},
        server:{host:'127.0.0.1', port:5477},
      });
      await server.listen();
      const address = server.httpServer?.address();
      if (!address || typeof address === 'string') throw new Error('Missing fixture server address');
      await use('http://127.0.0.1:' + address.port + fixtureUrl);
    } finally {
      await server?.close();
      await rm(cacheDir, {recursive:true, force:true});
    }
  }, {scope:'worker'}],
});
