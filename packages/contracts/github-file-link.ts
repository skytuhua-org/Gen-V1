import {z} from 'zod';

/** Read-only contract for GET /api/projects/:projectId/file/github-link.
 * The server decides eligibility from guarded local Git state; the client
 * validates the response and treats a parse failure as `check-failed`. */
export const GitHubFileLinkReasonSchema = z.enum([
  'no-origin','origin-not-github','detached-head','unborn-head',
  'no-upstream','upstream-not-origin','not-on-upstream',
  'untracked','not-regular-file','changed','binary','not-utf8',
  'preview-stale','changed-during-check','check-failed']);
export const GitHubFileLinkSchema = z.discriminatedUnion('state',[
  z.strictObject({
    state:z.literal('ready'),
    url:z.string().regex(/^https:\/\/github\.com\//).max(2048),
    commit:z.string().regex(/^[0-9a-f]{40}$/),
    repository:z.string().regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/),
    upstream:z.string().max(300),
    path:z.string().min(1).max(1024)}),
  z.strictObject({
    state:z.literal('unavailable'),
    reason:GitHubFileLinkReasonSchema,
    detail:z.strictObject({
      branch:z.string().max(300).optional(),
      commit:z.string().max(40).optional(),
      upstream:z.string().max(300).optional()}).optional()})]);
export type GitHubFileLink = z.infer<typeof GitHubFileLinkSchema>;
export type GitHubFileLinkReason = z.infer<typeof GitHubFileLinkReasonSchema>;
