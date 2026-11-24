import { expect, it } from 'vitest';
import { formatNoteAge } from '../apps/web/src/TaskMemory.tsx';

const NOW = Date.parse('2026-11-24T12:00:00.000Z');
const ago = (ms: number) => new Date(NOW - ms).toISOString();

it('formatNoteAge buckets seconds, minutes, hours and days at their boundaries', () => {
  expect(formatNoteAge(ago(59_000), NOW)).toBe('just now');
  expect(formatNoteAge(ago(60_000), NOW)).toBe('1m ago');
  expect(formatNoteAge(ago(61_000), NOW)).toBe('1m ago');
  expect(formatNoteAge(ago(59 * 60_000), NOW)).toBe('59m ago');
  expect(formatNoteAge(ago(60 * 60_000), NOW)).toBe('1h ago');
  expect(formatNoteAge(ago(23 * 3600_000), NOW)).toBe('23h ago');
  expect(formatNoteAge(ago(24 * 3600_000), NOW)).toBe('1d ago');
  expect(formatNoteAge(ago(29 * 86400_000), NOW)).toBe('29d ago');
  expect(formatNoteAge(ago(30 * 86400_000), NOW)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(formatNoteAge(ago(40 * 86400_000), NOW)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});

it('formatNoteAge falls back to the local calendar date, not the UTC prefix', () => {
  // 23:30 UTC on 2026-11-23 is still 2026-11-23 in zones ahead of UTC; in any
  // zone the result must equal the local YYYY-MM-DD of that instant.
  const iso = '2026-10-15T23:30:00.000Z';
  const date = new Date(iso);
  const local = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  expect(formatNoteAge(iso, Date.parse('2026-11-24T12:00:00.000Z'))).toBe(local);
  expect(formatNoteAge(iso, Date.parse('2026-11-24T12:00:00.000Z'))).toBe(new Date(iso).toLocaleDateString('en-CA'));
});

it('formatNoteAge keeps invalid input raw and treats future input as just now', () => {
  expect(formatNoteAge('not-a-date', NOW)).toBe('not-a-date');
  expect(formatNoteAge('', NOW)).toBe('');
  expect(formatNoteAge(new Date(NOW + 60_000).toISOString(), NOW)).toBe('just now');
});
