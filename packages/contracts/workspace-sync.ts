import { z } from 'zod';

const oid = z.string().regex(/^[a-f0-9]{40}$/);
const revision = z.string().regex(/^[a-f0-9]{64}$/);
const repo = z.string().regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/);
const ref = z.string().min(1).max(1024);

/** Pull blockers per plan R5 (plus the fetch-only set R6: READ_ONLY, NO_REMOTE). */
export const gitSyncBlockerSchema = z.enum([
  'RUN_ACTIVE',
  'READ_ONLY',
  'NO_REMOTE',
  'NO_UPSTREAM',
  'DETACHED',
  'UP_TO_DATE',
  'AHEAD_ONLY',
  'DIVERGED',
  'DIRTY_OVERLAP',
]);
export type GitSyncBlocker = z.infer<typeof gitSyncBlockerSchema>;

export const gitSyncStateSchema = z.enum(['no-remote', 'no-upstream', 'detached', 'up-to-date', 'ahead', 'behind', 'diverged']);
export type GitSyncState = z.infer<typeof gitSyncStateSchema>;

export const gitSyncRemoteSchema = z.strictObject({ name: z.literal('origin'), repo });
export const gitSyncUpstreamSchema = z.strictObject({ ref, short: ref, oid });

/** R1: local-only sync read; never touches the network. */
export const gitSyncResultSchema = z.strictObject({
  branch: z.string().max(1024).nullable(),
  head: oid,
  revision,
  remote: gitSyncRemoteSchema.nullable(),
  upstream: gitSyncUpstreamSchema.nullable(),
  ahead: z.number().int().nonnegative().nullable(),
  behind: z.number().int().nonnegative().nullable(),
  state: gitSyncStateSchema,
  lastFetchedAt: z.string().datetime({ offset: true }).nullable(),
  blockers: z.array(gitSyncBlockerSchema),
});
export type GitSyncResult = z.infer<typeof gitSyncResultSchema>;
