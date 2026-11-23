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

/** Read-only committed-history contracts (Git history tab). No write authority. */
export const GIT_HISTORY_LIMITS = {
  pageSize: 50,
  rows: 1000,
  upstreamWalk: 10001,
  snapshotsPerOwner: 8,
  snapshots: 64,
  expiryMs: 15 * 60 * 1000,
  detailsPerSnapshot: 8,
} as const;
export const gitHistoryOidSchema = z.string().regex(/^[0-9a-f]{40}$/);
export const gitHistoryTokenSchema = z.string().regex(/^[a-f0-9]{64}$/);
export const gitHistoryCursorSchema = z.string().regex(/^h\.[a-f0-9]{64}\.[0-9]{1,6}$/);
export const GitHistoryPageRequestSchema = z.strictObject({ cursor: gitHistoryCursorSchema.optional() });
export const GitHistoryCommitRequestSchema = z.strictObject({
  snapshotId: gitHistoryTokenSchema,
  oid: gitHistoryOidSchema,
});
export const GitHistoryFileRequestSchema = z.strictObject({
  comparisonId: gitHistoryTokenSchema,
  path: z
    .string()
    .min(1)
    .max(4096)
    .refine((value) => !value.includes("\0")),
});
export type GitHistoryPushState = "unpushed" | "notMarked" | "unknown";
export interface GitHistoryRow {
  oid: string;
  subject: string;
  author: string;
  authoredAt: string;
  /** Exact count within limits, or null when it cannot be proven inside the read budget. */
  filesChanged: number | null;
  pushState: GitHistoryPushState;
}
export interface GitHistoryPage {
  snapshotId: string;
  branch: string | null;
  headOid: string | null;
  /** Exact local remote-tracking ref used as the comparison basis; null when unavailable. */
  upstreamRef: string | null;
  commits: GitHistoryRow[];
  nextCursor: string | null;
}
export interface CommitComparisonIdentity {
  kind: "commit";
  id: string;
  snapshotId: string;
  oid: string;
  parentOid: string | null;
  basis: "first-parent" | "root";
}
export type GitHistoryCommitRead =
  | {
      state: "ready";
      comparisonId: string;
      oid: string;
      parentOid: string | null;
      basis: "first-parent" | "root";
      files: ComparisonFile[];
      filesTruncated: boolean;
    }
  | { state: "unavailable"; reason: "missing-parent" | "unavailable" | "resource-limit" };
/** Patch for one file of a served commit comparison; same state/text/reason conventions as ComparisonPatch. */
export interface GitHistoryFilePatch {
  identity: CommitComparisonIdentity;
  file: ComparisonFile;
  state: "text" | "empty" | "binary" | "truncated" | "unavailable";
  text: string | null;
  reason?: "patch-omitted" | "unsupported-path" | "resource-limit" | "unsupported-file";
}
