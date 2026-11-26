import {expect, it} from 'vitest';
import {formatAbsoluteTime, formatMessageTime} from '../apps/web/src/conversation-workspace/ConversationPane';
const iso = (msAgo: number, base = 1700000000000) => new Date(base - msAgo).toISOString();
const now = 1700000000000;
it('formats boundaries', () => {
 expect(formatMessageTime(iso(0), now)).toBe('now');
 expect(formatMessageTime(iso(59000), now)).toBe('now');
 expect(formatMessageTime(iso(60000), now)).toBe('1m ago');
 expect(formatMessageTime(iso(5 * 60000), now)).toBe('5m ago');
 expect(formatMessageTime(iso(59 * 60000), now)).toBe('59m ago');
 expect(formatMessageTime(iso(3600000), now)).toBe('1h ago');
 expect(formatMessageTime(iso(23 * 3600000), now)).toBe('23h ago');
 expect(formatMessageTime(iso(24 * 3600000), now)).toBe(formatAbsoluteTime(iso(24 * 3600000)));
});
it('returns empty on missing or unparseable input', () => {
 expect(formatMessageTime('', now)).toBe('');
 expect(formatMessageTime('not a date', now)).toBe('');
 expect(formatAbsoluteTime('')).toBe('');
});
it('renders absolute local time as MMM D, HH:mm', () => {
 expect(formatAbsoluteTime('2026-11-23T08:41:00Z')).toMatch(/^[A-Z][a-z]{2} \d{1,2}, \d{2}:\d{2}$/);
});
it('treats future timestamps as now', () => {
 expect(formatMessageTime(iso(-60000), now)).toBe('now');
});
