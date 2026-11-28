// Measures the local-git cost of a remote-sync read (#1626 T07) against a real
// repository: the same commands `ProjectTools.sync` issues, timed individually.
// Usage: pnpm exec tsx scripts/measure-git-sync-perf.ts [repo-path] [iterations]
// The sync read never touches the network — it resolves the upstream ref and
// ahead/behind counts from refs already fetched locally.
import { execFileSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';

const repo = process.argv[2] ?? '.', iterations = Math.max(1, Number(process.argv[3]) || 20);
const git = (args: string[]) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 }).trim();
const time = (label: string, run: () => unknown) => {
  const samples: number[] = [];
  for (let i = 0; i < iterations; i++) { const t = performance.now(); run(); samples.push(performance.now() - t); }
  samples.sort((a, b) => a - b);
  console.log(`${label}: median=${samples[Math.floor(samples.length / 2)]!.toFixed(1)}ms max=${samples[samples.length - 1]!.toFixed(1)}ms`);
  return samples[Math.floor(samples.length / 2)]!;
};

const commits = Number(git(['rev-list', '--count', 'HEAD']));
const branch = git(['branch', '--show-current']);
const head = git(['rev-parse', 'HEAD']);
const escapedBranch = branch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const pairs = git(['config', '--get-regexp', `^branch\\.${escapedBranch}\\.(remote|merge)$`]).split('\n').filter(Boolean);
const config = Object.fromEntries(pairs.map(line => { const [key, ...rest] = line.split(/\s+/); return [key, rest.join(' ')]; }));
const candidates: string[] = [];
if (config[`branch.${branch}.remote`] === 'origin' && config[`branch.${branch}.merge`]?.startsWith('refs/heads/')) candidates.push('refs/remotes/origin/' + config[`branch.${branch}.merge`].slice('refs/heads/'.length));
candidates.push('refs/remotes/origin/' + branch);
const remoteRefs = git(['for-each-ref', '--format=%(refname) %(objectname)', 'refs/remotes/origin']).split('\n').filter(Boolean);
const oids = Object.fromEntries(remoteRefs.map(line => { const [ref, oid] = line.split(' '); return [ref, oid]; }));
const upstream = candidates.map(ref => ({ ref, oid: oids[ref] })).find((entry): entry is { ref: string; oid: string } => entry.oid !== undefined);
if (!upstream) { console.log(`${repo}: no upstream ref among ${candidates.join(', ')} — sync returns no-upstream without further calls.`); process.exit(0); }
const upstreamOid = upstream.oid;

console.log(`${repo}: ${commits} commits, upstream ${upstream.ref}@${upstreamOid.slice(0, 12)}, ${iterations} iterations`);
let total = 0;
total += time('config --get-regexp branch.*', () => git(['config', '--get-regexp', `^branch\\.${escapedBranch}\\.`]));
total += time('for-each-ref refs/remotes/origin', () => git(['for-each-ref', '--format=%(refname) %(objectname)', 'refs/remotes/origin']));
total += time('rev-list --left-right --count', () => git(['rev-list', '--left-right', '--count', upstreamOid + '...' + head]));
const changed = git(['-c', 'diff.renames=false', 'diff', '--name-only', '-z', head, upstreamOid]).split('\0').filter(Boolean);
total += time(`diff --name-only -z HEAD upstream (${changed.length} paths)`, () => git(['-c', 'diff.renames=false', 'diff', '--name-only', '-z', head, upstreamOid]));
total += time('ls-files --others --ignored (changed-scoped)', () => git(['ls-files', '-z', '--others', '--ignored', '--exclude-standard', '--', ...changed]));
console.log(`sync git work total: ${total.toFixed(1)}ms median (target < 150ms on the 50k-commit reference repo)`);
