import {z} from 'zod';
import {skillReferenceSchema} from '../../../packages/contracts/skill-catalog';

export interface CommandToken {start: number; end: number; query: string}
export function commandToken(text: string, caret: number, selectionEnd = caret): CommandToken | null {
  if (selectionEnd !== caret || caret < 0 || caret > text.length) return null;
  const match = /(?:^|\s)(\/[^\s/\\]*)$/u.exec(text.slice(0, caret));
  if (!match || match[1].length > 201) return null;
  const start = caret - match[1].length;
  const tail = /^[^\s/\\]*/u.exec(text.slice(caret))![0];
  const end = caret + tail.length;
  if (text[end] === '/' || text[end] === '\\') return null;
  return {start, end, query: match[1].slice(1)};
}
export function replaceCommandToken(text: string, token: CommandToken) {
  if (token.start < 0 || token.end > text.length || !/^\/[^\s/\\]*$/u.test(text.slice(token.start, token.end))) throw Error('The command token changed.');
  return {text: text.slice(0, token.start) + text.slice(token.end), caret: token.start};
}
export const skillBindingSchema = z.strictObject({
  id: z.string().uuid(), name: z.string().min(1).max(240), source: z.string().min(1).max(240),
  ref: skillReferenceSchema.refine(ref => ref.scope.kind === 'personal'),
});
export const skillBindingsSchema = z.array(skillBindingSchema).max(8).refine(items => new Set(items.map(item => item.id)).size === items.length);
export type SkillBinding = z.infer<typeof skillBindingSchema>;

/** Fixed pixel allowances matching the popover's non-option rows in composer-commands.css. */
export const commandPaletteMetrics = {cap: 352, minimum: 110, row: 42, hint: 26, status: 29, sourceRow: 17, sourcesCap: 76, sourcesBase: 6, more: 30, padding: 16} as const;
export interface CommandPaletteLayout {options: number; loading: boolean; error: boolean; skillStatus: boolean; unavailableSources: number; nextCursor: boolean}
/** Option rows plus exactly the footer/status blocks the JSX renders for the same state. */
export function commandPaletteHeight(layout: CommandPaletteLayout) {
  const m = commandPaletteMetrics;
  const status = (layout.loading ? m.status : 0) + (layout.error ? m.status : 0)
    + (!layout.loading && !layout.error && !layout.options && !layout.unavailableSources ? m.status : 0)
    + (layout.skillStatus ? m.status : 0);
  const sources = layout.unavailableSources ? Math.min(m.sourcesCap, layout.unavailableSources * m.sourceRow + m.sourcesBase) : 0;
  const chrome = m.hint + status + sources + (layout.nextCursor ? m.more : 0) + m.padding;
  return Math.min(m.cap, Math.max(m.minimum, layout.options * m.row + chrome));
}
