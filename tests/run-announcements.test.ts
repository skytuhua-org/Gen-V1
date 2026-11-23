import { describe, expect, it } from 'vitest';
import { announcementRegionText, runEventAnnouncements } from '../apps/web/src/run-announcements';

const base = { previousStatus: 'working' as string | null, status: 'working' as string | null, previousPendingApprovals: [] as string[], pendingApprovals: [] as string[] };

describe('runEventAnnouncements', () => {
  it('announces nothing while a reply streams (no transition)', () => {
    expect(runEventAnnouncements({ ...base })).toEqual([]);
  });
  it('politely announces a finished reply on working -> completed', () => {
    expect(runEventAnnouncements({ ...base, status: 'completed' })).toEqual([{ text: 'Reply finished.', assertive: false }]);
  });
  it('does not announce finished for non-working transitions', () => {
    expect(runEventAnnouncements({ ...base, previousStatus: 'ready', status: 'completed' })).toEqual([]);
  });
  it('assertively announces a failed run, including the error text', () => {
    expect(runEventAnnouncements({ ...base, status: 'failed', error: 'model offline' })).toEqual([{ text: 'Run failed: model offline', assertive: true }]);
    expect(runEventAnnouncements({ ...base, status: 'failed' })).toEqual([{ text: 'Run failed.', assertive: true }]);
  });
  it('announces a cancelled run politely for stopped and interrupted', () => {
    for (const status of ['stopped', 'interrupted']) {
      expect(runEventAnnouncements({ ...base, status })).toEqual([{ text: 'Run cancelled.', assertive: false }]);
    }
  });
  it('assertively announces a new approval request, naming the operation', () => {
    expect(runEventAnnouncements({ ...base, pendingApprovals: ['Install package lodash'] })).toEqual([{ text: 'Approval needed: Install package lodash', assertive: true }]);
  });
  it('does not re-announce approvals that were already pending', () => {
    expect(runEventAnnouncements({ ...base, previousPendingApprovals: ['a', 'b'], pendingApprovals: ['a', 'b'] })).toEqual([]);
    expect(runEventAnnouncements({ ...base, previousPendingApprovals: ['a', 'b'], pendingApprovals: ['a'] })).toEqual([]);
    expect(runEventAnnouncements({ ...base, previousPendingApprovals: ['a'], pendingApprovals: ['a', 'b'] })).toEqual([{ text: 'Approval needed: b', assertive: true }]);
  });
  it('emits both announcements when a failure arrives with a new approval', () => {
    expect(runEventAnnouncements({ ...base, status: 'failed', pendingApprovals: ['Send message'] })).toEqual([
      { text: 'Run failed.', assertive: true },
      { text: 'Approval needed: Send message', assertive: true },
    ]);
  });
});

describe('announcementRegionText', () => {
  it('keeps the previous text when there is nothing new to announce', () => {
    expect(announcementRegionText('Reply finished.', [])).toBe('Reply finished.');
  });
  it('joins multiple same-region events so none is clobbered', () => {
    expect(announcementRegionText('', ['Run failed.', 'Approval needed: Send message'])).toBe('Run failed. Approval needed: Send message');
  });
  it('re-announces a repeat by alternating a trailing no-break space', () => {
    const first = announcementRegionText('', ['Run cancelled.']);
    expect(first).toBe('Run cancelled.');
    const second = announcementRegionText(first, ['Run cancelled.']);
    expect(second).toBe('Run cancelled. ');
    expect(second).not.toBe(first);
    const third = announcementRegionText(second, ['Run cancelled.']);
    expect(third).toBe('Run cancelled.');
    expect(third).not.toBe(second);
  });
  it('does not treat a different announcement as a repeat', () => {
    expect(announcementRegionText('Run cancelled.', ['Reply finished.'])).toBe('Reply finished.');
  });
});
