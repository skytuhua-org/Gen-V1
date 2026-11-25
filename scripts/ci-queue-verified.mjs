// The merge queue runs CI on a merge commit and then fast-forwards main to that
// same commit, so the push run on main would repeat the full suite on a revision
// that already passed it. This looks for that proof: a successful merge_group run
// of the CI workflow on the exact pushed SHA in which every required job passed.
// Anything short of that proof (no run, a failed lookup, an unexpected job state)
// reports verified=false and the push run keeps the full suite.
import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const requiredJobs = [
  'Windows checks',
  'Tests (shard 1/4)',
  'Tests (shard 2/4)',
  'Tests (shard 3/4)',
  'Tests (shard 4/4)',
  'Browser tests',
  'Installed desktop memory retention and opt-in',
];
const workflowPath = '.github/workflows/ci.yml';
const queueBranch = 'gh-readonly-queue/main/';

export async function findQueueProof({ api = 'https://api.github.com', repository, sha, token, request = fetch }) {
  if (!/^[A-Za-z0-9-]+\/(?!\.{1,2}$)[\w.-]+$/.test(repository ?? '') || !/^[0-9a-f]{40}$/.test(sha ?? '')) return { verified: false, reason: 'no repository or commit to look up' };
  const get = async path => {
    const response = await request(api + '/repos/' + repository + path, {
      headers: { accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28', ...(token ? { authorization: 'Bearer ' + token } : {}) },
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new Error('GitHub answered ' + response.status + ' for ' + path);
    return response.json();
  };
  const listed = await get('/actions/runs?event=merge_group&head_sha=' + sha + '&per_page=100');
  const runs = (listed.workflow_runs ?? []).filter(run => run.event === 'merge_group' && run.head_sha === sha && run.path === workflowPath
    && run.repository?.full_name === repository && run.head_repository?.full_name === repository
    && typeof run.head_branch === 'string' && run.head_branch.startsWith(queueBranch)
    && run.status === 'completed' && run.conclusion === 'success');
  if (!runs.length) return { verified: false, reason: 'no successful merge-queue run of ' + workflowPath + ' on ' + sha };
  let reason = '';
  for (const run of runs) {
    const { jobs = [], total_count: total } = await get('/actions/runs/' + run.id + '/jobs?filter=latest&per_page=100');
    const unsettled = jobs.find(job => job.head_sha !== sha || job.status !== 'completed' || (job.conclusion !== 'success' && job.conclusion !== 'skipped'));
    const missing = requiredJobs.find(name => jobs.filter(job => job.name === name).length !== 1 || jobs.find(job => job.name === name).conclusion !== 'success');
    if (total !== jobs.length) reason = 'run ' + run.id + ' lists ' + total + ' jobs but returned ' + jobs.length;
    else if (unsettled) reason = 'run ' + run.id + ' job "' + unsettled.name + '" is ' + unsettled.status + '/' + unsettled.conclusion;
    else if (missing) reason = 'run ' + run.id + ' has no single successful "' + missing + '" job';
    else return { verified: true, run: run.html_url, reason: 'merge-queue run ' + run.id + ' passed all ' + requiredJobs.length + ' required jobs on ' + sha };
  }
  return { verified: false, reason };
}

// The runner's own Node may predate import.meta.main.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { GITHUB_API_URL: api, GITHUB_REPOSITORY: repository, GITHUB_SHA: sha, GITHUB_TOKEN: token, GITHUB_OUTPUT: output, GITHUB_STEP_SUMMARY: summary } = process.env;
  const result = await findQueueProof({ api, repository, sha, token }).catch(error => ({ verified: false, reason: 'lookup failed: ' + error.message }));
  const line = result.verified
    ? 'Full suite skipped: ' + result.reason + ' (' + result.run + ').'
    : 'Full suite runs: ' + result.reason + '.';
  console.log(line);
  if (summary) appendFileSync(summary, line + '\n');
  if (output) appendFileSync(output, 'verified=' + (result.verified === true) + '\n');
}
