import type { UiPreferences } from '../../../packages/contracts/preferences';

export type TimeFormat = UiPreferences['timeFormat'];

/** One hour-cycle rule for displayed absolute local clock times (T07/R10).
 * Schedules, explicitly labelled UTC logs, source timestamps and relative "ago"
 * values keep their own semantics and must not route through this helper. */
export function localTimeOptions(timeFormat: TimeFormat, base: Intl.DateTimeFormatOptions = {}): Intl.DateTimeFormatOptions {
  return timeFormat === 'system' ? base : { ...base, hour12: timeFormat === '12h' };
}

/** Clock-only display (last checked, device expiry): minute precision by default. */
export function formatLocalClock(value: string | number | Date, timeFormat: TimeFormat, locale?: string, options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' }): string {
  return new Date(value).toLocaleTimeString(locale, localTimeOptions(timeFormat, options));
}

/** Date+time display (captured/checked stamps): caller keeps its date/time semantics. */
export function formatLocalDateTime(value: string | number | Date, timeFormat: TimeFormat, locale?: string, options: Intl.DateTimeFormatOptions = {}): string {
  return new Date(value).toLocaleString(locale, localTimeOptions(timeFormat, options));
}

/** Relative "ago" display for past timestamps (stash ages, server uptime). */
export function formatRelative(value: string | number | Date, now: number | Date = Date.now()): string {
  const seconds = Math.max(0, Math.round(((typeof now === 'number' ? now : now.getTime()) - new Date(value).getTime()) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60); if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60); if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24); if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  const weeks = Math.floor(days / 7); if (weeks < 52) return `${weeks} wk ago`;
  return `${Math.floor(weeks / 52)} yr ago`;
}
