import {z} from 'zod';

export const TERMINAL_NAME_RAW_MAX = 256;
export const TERMINAL_NAME_MAX = 64;

/** Raw request input: a string bounded in UTF-16 units before normalization. */
export const terminalNameInputSchema = z.string().max(TERMINAL_NAME_RAW_MAX);

// C0, DEL+C1, U+2028/U+2029 separators, bidi embeddings/overrides and isolates.
const FORBIDDEN = /[\u0000-\u001F\u007F-\u009F\u2028\u2029\u202A-\u202E\u2066-\u2069]/;
const LONE_SURROGATE = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;

/** True when the raw string contains a code point the terminal name grammar rejects. */
export function terminalNameHasForbidden(raw: string): boolean {
  return FORBIDDEN.test(raw) || LONE_SURROGATE.test(raw);
}

/**
 * Canonical terminal name: rejects forbidden characters anywhere (no
 * trim-to-valid), trims like String.prototype.trim, requires at most
 * TERMINAL_NAME_MAX code points, and maps empty to null. Returns undefined
 * when the input violates raw or normalized limits.
 */
export function normalizeTerminalName(raw: string): string | null | undefined {
  if (typeof raw !== 'string' || raw.length > TERMINAL_NAME_RAW_MAX) return undefined;
  if (terminalNameHasForbidden(raw)) return undefined;
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  if ([...trimmed].length > TERMINAL_NAME_MAX) return undefined;
  return trimmed;
}
