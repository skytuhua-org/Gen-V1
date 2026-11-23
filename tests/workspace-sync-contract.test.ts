import { expect, it } from 'vitest';
import {
  workspaceActionPayloadSchemas,
  workspaceActionTypeSchema,
} from '../packages/contracts/workspace-action-outcomes.ts';
import { gitSyncResultSchema } from '../packages/contracts/workspace-sync.ts';

const oid = 'a'.repeat(40);
const revision = 'b'.repeat(64);

const validSync = {
  branch: 'main',
  head: oid,
  revision,
  remote: { name: 'origin', repo: 'owner/name' },
  upstream: { ref: 'refs/remotes/origin/main', short: 'origin/main', oid },
  ahead: 1,
  behind: 2,
  state: 'diverged',
  lastFetchedAt: '2026-11-23T00:00:00Z',
  blockers: ['RUN_ACTIVE', 'DIRTY_OVERLAP'],
};

it('gitSyncResultSchema accepts a full sync read', () => {
  expect(gitSyncResultSchema.parse(validSync)).toEqual(validSync);
});

it('gitSyncResultSchema accepts nullable fields', () => {
  for (const state of ['no-remote', 'no-upstream', 'detached', 'up-to-date', 'ahead', 'behind', 'diverged'] as const) {
    const result = gitSyncResultSchema.parse({
      ...validSync,
      branch: state === 'detached' ? null : validSync.branch,
      remote: state === 'no-remote' ? null : validSync.remote,
      upstream: null,
      ahead: null,
      behind: null,
      state,
      lastFetchedAt: null,
      blockers: state === 'no-remote' ? ['NO_REMOTE'] : ['NO_UPSTREAM'],
    });
    expect(result.state).toBe(state);
  }
});

it('gitSyncResultSchema rejects extra keys and malformed values', () => {
  expect(gitSyncResultSchema.safeParse({ ...validSync, extra: true }).success).toBe(false);
  expect(gitSyncResultSchema.safeParse({ ...validSync, head: 'not-an-oid' }).success).toBe(false);
  expect(gitSyncResultSchema.safeParse({ ...validSync, revision: 'short' }).success).toBe(false);
  expect(gitSyncResultSchema.safeParse({ ...validSync, remote: { name: 'upstream', repo: 'o/n' } }).success).toBe(false);
  expect(gitSyncResultSchema.safeParse({ ...validSync, ahead: -1 }).success).toBe(false);
  expect(gitSyncResultSchema.safeParse({ ...validSync, state: 'merging' }).success).toBe(false);
  expect(gitSyncResultSchema.safeParse({ ...validSync, blockers: ['UNKNOWN'] }).success).toBe(false);
  expect(gitSyncResultSchema.safeParse({ ...validSync, lastFetchedAt: 'yesterday' }).success).toBe(false);
});

it('fetch and pull payloads accept revision plus expectedHead only', () => {
  expect(workspaceActionTypeSchema.parse('fetch')).toBe('fetch');
  expect(workspaceActionTypeSchema.parse('pull')).toBe('pull');
  for (const type of ['fetch', 'pull'] as const) {
    const schema = workspaceActionPayloadSchemas[type];
    expect(schema.parse({ revision, expectedHead: oid })).toEqual({ revision, expectedHead: oid });
    expect(schema.safeParse({ revision }).success).toBe(false);
    expect(schema.safeParse({ revision, expectedHead: oid, paths: ['x'] }).success).toBe(false);
    expect(schema.safeParse({ revision: 'not-hex', expectedHead: oid }).success).toBe(false);
  }
});
