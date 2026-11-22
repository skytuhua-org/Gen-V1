import { z } from "zod";
// Copy/save patch contract (#1604): byte-exact git output via base64.
export const WORKSPACE_PATCH_LIMIT_BYTES = 4 * 1024 * 1024;
export const workspacePatchQuerySchema = z.object({
  scope: z.enum(["staged", "worktree"]),
  purpose: z.enum(["copy", "save"]),
  revision: z.string().min(1).max(128),
  path: z.string().min(1).max(4096).refine(value => !value.includes("\0")).optional(),
  threadId: z.string().optional(),
});
export const workspacePatchSkipSchema = z.object({
  path: z.string(),
  reason: z.enum(["binary", "not-utf8", "unreadable", "unsupported-file"]),
});
export const workspacePatchSchema = z.object({
  scope: z.enum(["staged", "worktree"]),
  revision: z.string(),
  head: z.string(),
  branch: z.string(),
  paths: z.array(z.string()),
  skipped: z.array(workspacePatchSkipSchema),
  bytes: z.number().int().nonnegative(),
  sha256: z.string().regex(/^[0-9a-f]{64}$/),
  contentBase64: z.string(),
});
export type WorkspacePatch = z.infer<typeof workspacePatchSchema>;
export type WorkspacePatchSkip = z.infer<typeof workspacePatchSkipSchema>;
