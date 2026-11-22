import {describe,expect,it} from 'vitest';
import {createLineCarry,detectAddresses,stripAnsi} from '../packages/workspace/dev-server-detect.ts';

describe('detectAddresses',()=>{
 it('finds a vite-style localhost address',()=>{
  expect(detectAddresses('  ➜  Local:   http://localhost:5173/')).toEqual([{url:'http://localhost:5173/',port:5173}]);
 });
 it('normalizes wildcard hosts to localhost and dedupes',()=>{
  expect(detectAddresses('ready - started server on 0.0.0.0:3000, url: http://localhost:3000')).toEqual([{url:'http://localhost:3000/',port:3000}]);
  expect(detectAddresses('Serving HTTP on :: port 8000 (http://[::]:8000/)')).toEqual([{url:'http://localhost:8000/',port:8000}]);
 });
 it('keeps loopback literals and drops query strings',()=>{
  expect(detectAddresses('https://127.0.0.1:8443/app/?x=1')).toEqual([{url:'https://127.0.0.1:8443/app/',port:8443}]);
  expect(detectAddresses('http://[::1]:3000/a')).toEqual([{url:'http://[::1]:3000/a',port:3000}]);
 });
 it('detects ANSI-colored output',()=>{
  expect(detectAddresses('\x1b[36mhttp://localhost:\x1b[1m5173\x1b[22m/\x1b[39m')).toEqual([{url:'http://localhost:5173/',port:5173}]);
 });
 it('detects an address split across chunks via the carry',()=>{
  const carry=createLineCarry();
  expect(detectAddresses(carry.feed('http://local'))).toEqual([]);
  expect(detectAddresses(carry.feed('host:4321/\n'))).toEqual([{url:'http://localhost:4321/',port:4321}]);
 });
 it('bounds the carry so a split address past the limit is lost but a whole one still scans',()=>{
  const carry=createLineCarry(10);
  carry.feed('xxxxhttp://localhost:3000');
  expect(detectAddresses(carry.feed('/\n'))).toEqual([]);
  carry.feed('x'.repeat(20));
  expect(detectAddresses(carry.feed('http://localhost:3000\n'))).toEqual([{url:'http://localhost:3000/',port:3000}]);
 });
 it('rejects userinfo redirects and loopback-looking hostnames',()=>{
  expect(detectAddresses('http://localhost:8080@192.168.1.20:9000/')).toEqual([]);
  expect(detectAddresses('http://127.0.0.1.evil.com:8080/')).toEqual([]);
  expect(detectAddresses('http://localhost:8080@localhost:9000/')).toEqual([]);
 });
 it('rejects non-loopback, malformed and out-of-range candidates',()=>{
  for(const text of ['http://example.com:3000','mylocalhost:3000','http://localhost:80','http://localhost:70000','file://localhost:3000/x','http://192.168.1.5:3000'])
   expect(detectAddresses(text),text).toEqual([]);
 });
 it('returns matches in order without duplicates',()=>{
  expect(detectAddresses('http://localhost:5173/ http://localhost:5173/ http://127.0.0.1:4000')).toEqual([
   {url:'http://localhost:5173/',port:5173},
   {url:'http://127.0.0.1:4000/',port:4000},
  ]);
 });
});

describe('stripAnsi',()=>{
 it('removes SGR and charset sequences',()=>{
  expect(stripAnsi('\x1b[1m\x1b[36mok\x1b[0m\x1b(B')).toBe('ok');
 });
});
