import { z } from 'zod';

// `GET /api/projects/:projectId/branches` response for the composer branch
// picker (plan docs/agent-plans/composer-branch-chip.md r1). Read-only: it
// never writes to the working copy and carries no write authority beyond the
// existing context read.
const oid = z.string().regex(/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/);
const revision = z.string().regex(/^[a-f0-9]{64}$/);
export const branchEntrySchema = z.strictObject({
  /** 'feature/x' or 'origin/feature/x'. */
  name: z.string().min(1).max(250),
  head: oid,
  subject: z.string().max(200),
  /** ISO 8601 committer date of `head`. */
  committedAt: z.string().min(1).max(100),
  upstream: z.string().max(250).nullable(),
  current: z.boolean(),
  /** 'this' = checked out in this working copy; 'other' = checked out in
      another worktree of the same git family; null = not checked out. */
  occupiedBy: z.enum(['this', 'other']).nullable(),
});
export type BranchEntry = z.infer<typeof branchEntrySchema>;
export const branchListSchema = z.strictObject({
  /** Current branch name, null on a detached HEAD. */
  current: z.string().min(1).max(250).nullable(),
  head: oid.nullable(),
  revision,
  detached: z.boolean(),
  dirty: z.strictObject({ tracked: z.number().int().min(0), untracked: z.number().int().min(0) }),
  canSwitch: z.boolean(),
  reason: z.enum(['run-active', 'read-only', 'no-git']).nullable(),
  local: z.array(branchEntrySchema).max(500),
  remote: z.array(branchEntrySchema).max(500),
  /** True when either list hit its cap. */
  truncated: z.boolean(),
});
export type BranchList = z.infer<typeof branchListSchema>;
