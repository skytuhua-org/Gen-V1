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
  const head = text.slice(0, token.start), tail = text.slice(token.end);
  const collapse = tail.startsWith(' ') && (head.endsWith(' ') || head === '');
  return {text: head + (collapse ? tail.slice(1) : tail), caret: token.start};
}
export type CommandMode = 'plan' | 'build';
export interface BuiltinCommand {id: 'model' | 'plan' | 'default'; description: string}
export const builtinCommands: BuiltinCommand[] = [{id: 'model', description: 'Choose a model'}, {id: 'plan', description: 'Switch to Plan'}, {id: 'default', description: 'Switch to Build'}];
/** The already-active mode's command is a no-op: /plan maps to 'plan', /default to Build. */
export function builtinOptions(query: string, mode?: CommandMode): BuiltinCommand[] {
  const activeModeId = mode === 'plan' ? 'plan' : mode === 'build' ? 'default' : null;
  return builtinCommands.filter(item => item.id.includes(query.toLowerCase()) && item.id !== activeModeId);
}
export const skillBindingSchema = z.strictObject({
  id: z.string().uuid(), name: z.string().min(1).max(240), source: z.string().min(1).max(240),
  ref: skillReferenceSchema.refine(ref => ref.scope.kind === 'personal'),
});
export const skillBindingsSchema = z.array(skillBindingSchema).max(8).refine(items => new Set(items.map(item => item.id)).size === items.length);
export type SkillBinding = z.infer<typeof skillBindingSchema>;
