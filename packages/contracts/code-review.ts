import { z } from "zod";

/** Read-only contracts. These identifiers do not authorize Git or review writes. */
export const CODE_REVIEW_LIMITS = {
  files: 1000,
  remoteFiles: 300,
  patchBytes: 256 * 1024,
  hashBytes: 32 * 1024 * 1024,
  snapshots: 8,
} as const;
export const ComparisonScopeSchema = z.strictObject({ scope: z.enum(["staged", "worktree"]) });
export const ComparisonFileRequestSchema = z.strictObject({
  comparisonId: z.string().regex(/^[a-f0-9]{64}$/),
  path: z
    .string()
    .min(1)
    .max(4096)
    .refine((value) => !value.includes("\0")),
});
export interface LocalComparisonIdentity {
  kind: "local";
  id: string;
  scope: "staged" | "worktree";
  headOid: string;
  branch: string;
  /** Complete local read snapshot, separate from the existing action revision. */
  revision: string;
  base: { kind: "commit" | "index"; revision: string };
  head: { kind: "index" | "worktree"; revision: string };
}
export interface PullRequestComparisonIdentity {
  kind: "pull-request";
  id: string;
  repo: string;
  number: number;
  pullRequestId: string;
  baseOid: string;
  headOid: string;
  mergeBaseOid: string;
  baseRef: string;
  headRef: string;
  semantics: "merge-base";
}
export type ComparisonIdentity = LocalComparisonIdentity | PullRequestComparisonIdentity;
export interface ComparisonFile {
  path: string;
  oldPath?: string;
  status: string;
  index?: string;
  worktree?: string;
  untracked: boolean;
  additions: number | null;
  deletions: number | null;
  blobOid?: string;
  patchUnavailable?: "unsupported-file" | "unsupported-path";
}
export interface ComparisonCheck {
  name: string;
  status: "pending" | "passed" | "failed" | "neutral" | "unknown";
}
export interface CodeReviewComparison {
  identity: ComparisonIdentity;
  files: ComparisonFile[];
  filesTruncated: boolean;
  checks: ComparisonCheck[];
  observedAt: string;
  access: { mode: "managed" | "legacy" | "remote"; untrackedIncluded: boolean };
}
export type ComparisonRead =
  | { state: "loading" }
  | { state: "error"; error: { code: string; message: string } }
  | { state: "ready" | "empty"; value: CodeReviewComparison };
export interface ComparisonPatch {
  identity: ComparisonIdentity;
  file: ComparisonFile;
  state: "text" | "empty" | "untracked" | "binary" | "truncated" | "unavailable";
  /** Never contains a partial patch. Treat repository content as inert text. */
  text: string | null;
  reason?: "patch-omitted" | "unsupported-path" | "conflict" | "resource-limit" | "unsupported-file";
}

/** Read-only Git history contracts. Scoped to the owning project and optional thread. */
export const GIT_HISTORY_LIMITS = {
  page: 50,
  rowsPerSnapshot: 1000,
  snapshotsPerOwner: 8,
  snapshotsGlobal: 64,
  idleMs: 15 * 60 * 1000,
  unpushedDepth: 10001,
} as const;
export const gitHistoryOid = z.string().regex(/^[a-f0-9]{40}$/);
export const GitHistoryQuerySchema = z.strictObject({
  threadId: z.string().regex(/^[a-zA-Z0-9:_.-]{1,200}$/).optional(),
  cursor: z.string().min(1).max(200).optional(),
});
export const GitHistoryCommitQuerySchema = z.strictObject({
  threadId: z.string().regex(/^[a-zA-Z0-9:_.-]{1,200}$/).optional(),
  snapshotId: z.string().regex(/^[a-f0-9]{64}$/),
  oid: gitHistoryOid,
});
export const GitHistoryFileQuerySchema = z.strictObject({
  threadId: z.string().regex(/^[a-zA-Z0-9:_.-]{1,200}$/).optional(),
  comparisonId: z.string().regex(/^[a-f0-9]{64}$/),
  path: z
    .string()
    .min(1)
    .max(4096)
    .refine((value) => !value.includes("\0")),
});
export interface GitHistoryCommit {
  oid: string;
  subject: string;
  author: string;
  authoredAt: string;
  filesChanged: number | null;
  pushState: "unpushed" | "notMarked" | "unknown";
}
export interface GitHistoryPage {
  /** Null when the working copy has no commits yet. */
  snapshotId: string | null;
  branch: string | null;
  headOid: string | null;
  upstreamRef: string | null;
  commits: GitHistoryCommit[];
  nextCursor: string | null;
}
export interface GitHistoryCommitDetail {
  comparisonId: string;
  oid: string;
  parentOid: string | null;
  basis: "first-parent" | "root";
  files: ComparisonFile[];
  filesTruncated: boolean;
}
export interface GitHistoryPatch {
  comparisonId: string;
  file: ComparisonFile;
  state: ComparisonPatch["state"];
  /** Never contains a partial patch. Treat repository content as inert text. */
  text: string | null;
  reason?: ComparisonPatch["reason"];
}
