// Copy/save patch client helpers (#1604, plan D8): request, filename, decode+verify, save, summaries.
import { authenticated, read } from './api.ts';
import { workspacePatchSchema, type WorkspacePatch, type WorkspacePatchSkip } from '../../../packages/contracts/workspace-patch.ts';

export interface PatchRequest {
  scope: 'staged' | 'worktree';
  purpose: 'copy' | 'save';
  revision: string;
  path?: string;
  threadId?: string;
}

export async function requestPatch(base: string, input: PatchRequest, signal?: AbortSignal): Promise<WorkspacePatch> {
  const query = new URLSearchParams({ scope: input.scope, purpose: input.purpose, revision: input.revision });
  if (input.path) query.set('path', input.path);
  if (input.threadId) query.set('threadId', input.threadId);
  const patch = await authenticated(() => fetch(base + '/git/patch?' + query, { credentials: 'same-origin', cache: 'no-store', signal })).then(read<unknown>);
  return workspacePatchSchema.parse(patch);
}

const sanitize = (value: string) => value.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');

/** R11 filename rules: <project>-<branch|short-head>-<staged|unstaged>[-file].patch, ≤120 chars. */
export function patchFilename(project: string | undefined, branch: string, head: string, scope: 'staged' | 'worktree', path?: string): string {
  const where = sanitize(branch) || head.slice(0, 10);
  const view = scope === 'staged' ? 'staged' : 'unstaged';
  const parts = [sanitize(project ?? '') || 'workspace', where, view];
  if (path) parts.push(sanitize(path));
  let name = parts.filter(Boolean).join('-') + '.patch';
  if (name.length > 120) name = name.slice(0, 114) + '.patch';
  return name;
}

export async function decodePatch(patch: WorkspacePatch): Promise<Uint8Array> {
  const bytes = Uint8Array.from(atob(patch.contentBase64), char => char.charCodeAt(0));
  if (bytes.length !== patch.bytes) throw new Error('The patch bytes did not match the response.');
  const digest = await crypto.subtle.digest('SHA-256', bytes as unknown as BufferSource);
  if ([...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('') !== patch.sha256)
    throw new Error('The patch digest did not match the response.');
  return bytes;
}

/** R10/R12: desktop savePatch bridge when present, else Blob download. */
export async function savePatchBytes(filename: string, patch: WorkspacePatch, bytes: Uint8Array): Promise<'saved' | 'cancelled'> {
  const desktop = (window as { harnessDesktop?: { savePatch?: (request: { filename: string; contentBase64: string; sha256: string }) => Promise<{ status: 'saved' | 'cancelled'; filename?: string }> } }).harnessDesktop;
  if (desktop?.savePatch) return (await desktop.savePatch({ filename, contentBase64: patch.contentBase64, sha256: patch.sha256 })).status;
  const url = URL.createObjectURL(new Blob([bytes as unknown as BlobPart], { type: 'text/x-diff' }));
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
  } finally { URL.revokeObjectURL(url); }
  return 'saved';
}

/** R13 skipped summary text. */
export function skippedSummary(skipped: WorkspacePatchSkip[]): string {
  if (!skipped.length) return '';
  const reason = (skip: WorkspacePatchSkip) =>
    skip.reason === 'binary' ? 'binary' : skip.reason === 'not-utf8' ? 'not UTF-8 text' : skip.reason === 'unreadable' ? 'unreadable' : 'unsupported';
  const label = skipped.map(skip => `${skip.path} (${reason(skip)})`);
  if (label.length <= 3) return `Skipped ${label.join(', ')}.`;
  return `Skipped ${label.slice(0, 3).join(', ')} and ${label.length - 3} more.`;
}
