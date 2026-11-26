import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';

const read=(path:string)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const workspace=read('pnpm-workspace.yaml'),lock=read('pnpm-lock.yaml');
const direct=(JSON.parse(read('package.json')) as {dependencies:Record<string,string>}).dependencies['node-pty'];
const allowed=(/^onlyBuiltDependencies:\n((?: {2}- .*\n)+)/m.exec(workspace)?.[1]??'').split('\n').filter(Boolean).map(line=>line.replace(/^ {2}- /,'').trim());

it('builds only the node-pty version the terminal uses',()=>{
 // A bare name also ran the build of node-pty 1.0.0, an optional fallback of
 // Gemini CLI. That build failed on the Windows runners in every job and cost
 // about two minutes each time before pnpm ignored it.
 expect(direct).toMatch(/^\d+\.\d+\.\d+$/);
 expect(allowed.filter(entry=>entry.split('@')[0]==='node-pty')).toEqual(['node-pty@'+direct]);
 expect(workspace).toContain(`\n  node-pty@${direct}: patches/node-pty-${direct}.patch\n`);
});

it('leaves unbuilt only node-pty versions that have a prebuilt alternative',()=>{
 const snapshots=lock.slice(lock.indexOf('\nsnapshots:\n'));
 const others=[...new Set([...snapshots.matchAll(/^ {6}node-pty: (\d+\.\d+\.\d+)$/gm)].map(match=>match[1]))].filter(version=>version!==direct);
 for(const version of others){
  const users=snapshots.split(/\n(?= {2}\S)/).filter(entry=>entry.includes(`\n      node-pty: ${version}`));
  expect(users.length).toBeGreaterThan(0);
  for(const user of users){
   const optional=/\n {4}optionalDependencies:\n((?: {6}.*\n?)+)/.exec(user)?.[1]??'';
   expect(optional).toContain(`node-pty: ${version}`);
   expect(optional).toMatch(/^ {6}'@lydell\/node-pty': /m);
  }
 }
});
