import { z } from 'zod';

// `GET /api/projects/:projectId/branches` response for the composer branch
// picker. Read-only: it never writes to the working copy and carries no write
// authority beyond the existing context read.
const shortOid = z.string().regex(/^[a-f0-9]{7,40}$/);
const branchName = z.string().min(1).max(250);
export const projectBranchEntrySchema = z.strictObject({
  name: branchName,
  head: shortOid,
  committedAt: z.string().datetime(),
  /** 'here' = checked out in this working copy; 'other' = checked out in
      another worktree of the same family; 'none' = not checked out anywhere. */
  occupancy: z.enum(['here', 'other', 'none']),
  current: z.boolean(),
});
export type ProjectBranchEntry = z.infer<typeof projectBranchEntrySchema>;
export const projectBranchesSchema = z.strictObject({
  /** Current branch name, null on a detached HEAD. */
  branch: z.string().min(1).max(250).nullable(),
  head: z.string().regex(/^[a-f0-9]{40}$/),
  revision: z.string().min(1).max(128),
  detached: z.boolean(),
  /** Uncommitted changes summary used to decide the bring-changes confirm. */
  dirty: z.strictObject({ files: z.number().int().nonnegative(), untracked: z.number().int().nonnegative() }),
  local: z.array(projectBranchEntrySchema).max(500),
  remote: z.array(projectBranchEntrySchema).max(500),
  /** True when either list hit its cap. */
  truncated: z.boolean(),
});
export type ProjectBranches = z.infer<typeof projectBranchesSchema>;
