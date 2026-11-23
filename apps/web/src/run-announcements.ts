// Maps conversation run state transitions to screen-reader announcements.
// Announce once when an event finishes; streamed tokens announce nothing.
export interface RunEventInput {
  previousStatus: string | null;
  status: string | null;
  error?: string | null;
  /** Names of the approvals pending before this observation. */
  previousPendingApprovals: string[];
  /** Names of the approvals pending now. */
  pendingApprovals: string[];
}
export interface RunAnnouncement {
  text: string;
  assertive: boolean;
}
export function runEventAnnouncements(input: RunEventInput): RunAnnouncement[] {
  const out: RunAnnouncement[] = [];
  if (input.status && input.previousStatus && input.status !== input.previousStatus) {
    if (input.status === 'failed') {
      out.push({ text: input.error ? `Run failed: ${input.error}` : 'Run failed.', assertive: true });
    } else if (input.status === 'completed' && input.previousStatus === 'working') {
      out.push({ text: 'Reply finished.', assertive: false });
    } else if (input.status === 'stopped' || input.status === 'interrupted') {
      out.push({ text: 'Run cancelled.', assertive: false });
    }
  }
  const previous = new Set(input.previousPendingApprovals);
  for (const name of input.pendingApprovals) {
    if (!previous.has(name)) out.push({ text: `Approval needed: ${name}`, assertive: true });
  }
  return out;
}

/** Assembles the text for an `aria-atomic` live region. Multiple events in
 * one pass are joined so an assertive failure cannot clobber a pending
 * approval (or vice versa); a repeat of the exact previous text alternates a
 * trailing no-break space so the DOM text changes and the screen reader
 * announces the repeat instead of swallowing it. */
export function announcementRegionText(previous: string, texts: string[]): string {
  if (texts.length === 0) return previous;
  const joined = texts.join(' ');
  return joined === previous ? `${joined}\u00a0` : joined;
}
