import {preferencesSchema, parsePreferencePatch, type UiPreferences, type PreferencePatch} from './preferences.ts';

export const SETTINGS_FILE_FORMAT = 'gen.settings';
export const SETTINGS_FILE_VERSION = 1;
export const SETTINGS_FILE_LIMIT = 64 * 1024;
export type Theme = 'light' | 'dark' | 'system';

// Grouped for preview ordering; every key not listed here is in EXCLUDED_PREFERENCE_KEYS.
const PORTABLE_GROUPS: readonly (readonly (keyof UiPreferences)[])[] = [
 ['density', 'uiFontSize', 'chatFontSize', 'codeFontSize', 'controlRadius', 'customAccent', 'appearanceAccent', 'backgroundStyle', 'backgroundOpacity', 'interfaceFont', 'promptFont', 'codeFont', 'contrast', 'chatWidth', 'motion', 'motionSpeed', 'motionDuration', 'panelAnimations', 'timeFormat', 'wordWrap'],
 ['sendShortcut', 'composerPredictions', 'showComposerContext', 'showThreadDetails'],
 ['projectGrouping', 'projectOrder', 'showWorkingSection', 'archiveConfirmation', 'deleteConfirmation', 'unpinConfirmation'],
 ['diffLayout', 'hideWhitespace', 'diffDefaultExpanded', 'diffColors'],
 ['threadNotifications', 'inAppNotifications', 'notificationVolume', 'notificationPreview', 'notificationQuietHours', 'showUsageFooter'],
 ['keybindings'],
];
export const PORTABLE_PREFERENCE_KEYS: readonly (keyof UiPreferences)[] = PORTABLE_GROUPS.flat();
export const EXCLUDED_PREFERENCE_KEYS: readonly (keyof UiPreferences)[] = ['browserStartUrl', 'backgroundImage', 'projectColors', 'fontSize', 'learningEnabled', 'learningApproval', 'learningInterval', 'skillCurator'];
const excluded = new Set<string>(EXCLUDED_PREFERENCE_KEYS);
const keybindingMembers = Object.keys(preferencesSchema.shape.keybindings.shape) as (keyof UiPreferences['keybindings'])[];

export interface SettingsFileV1 { format: 'gen.settings'; version: 1; exportedAt: string; appVersion?: string; theme?: Theme; preferences: Partial<UiPreferences> }

export function buildSettingsFile(input: { theme: Theme; preferences: UiPreferences; now: Date; appVersion?: string }): string {
 const preferences: Partial<UiPreferences> = {};
 for (const key of PORTABLE_PREFERENCE_KEYS) {
  const value = input.preferences[key];
  if (key === 'keybindings') {
   const source = value as UiPreferences['keybindings'];
   const bindings: Partial<UiPreferences['keybindings']> = {};
   for (const member of keybindingMembers) bindings[member] = source[member];
   preferences.keybindings = bindings as UiPreferences['keybindings'];
  } else if (key === 'backgroundStyle' && value === 'image') {
   preferences.backgroundStyle = 'solid';
  } else {
   (preferences as Record<string, unknown>)[key] = value;
  }
 }
 const file: SettingsFileV1 = { format: SETTINGS_FILE_FORMAT, version: SETTINGS_FILE_VERSION, exportedAt: input.now.toISOString(), ...(input.appVersion ? { appVersion: input.appVersion } : {}), theme: input.theme, preferences };
 return JSON.stringify(file, null, 2) + '\n';
}

export type ImportIssue = { key: string; reason: 'not-portable' | 'unknown' | 'invalid' | 'conflict'; conflictWith?: string };
export type ParsedSettingsFile =
 | { ok: true; exportedAt?: string; appVersion?: string; theme?: Theme; patch: PreferencePatch; issues: ImportIssue[] }
 | { ok: false; error: 'not-settings-file' | 'newer-version' | 'too-large' | 'unreadable' };

function normalizeChord(chord: string): string {
 const order = ['ctrl', 'shift', 'alt', 'mod', 'meta', 'cmd', 'command'];
 const parts = chord.toLowerCase().split('+').map(part => part.trim()).filter(Boolean);
 const mods = parts.filter(part => order.includes(part)).sort((a, b) => order.indexOf(a) - order.indexOf(b));
 return [...mods, ...parts.filter(part => !order.includes(part))].join('+');
}

export function parseSettingsFile(text: string): ParsedSettingsFile {
 if (text.length > SETTINGS_FILE_LIMIT) return { ok: false, error: 'too-large' };
 let raw: unknown;
 try { raw = JSON.parse(text); } catch { return { ok: false, error: 'unreadable' }; }
 if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ok: false, error: 'not-settings-file' };
 const file = raw as Record<string, unknown>;
 if (file.format !== SETTINGS_FILE_FORMAT) return { ok: false, error: 'not-settings-file' };
 if (typeof file.version !== 'number' || !Number.isInteger(file.version) || file.version <= 0) return { ok: false, error: 'not-settings-file' };
 if (file.version > SETTINGS_FILE_VERSION) return { ok: false, error: 'newer-version' };
 const issues: ImportIssue[] = [];
 const patch: PreferencePatch = {};
 let theme: Theme | undefined;
 if (file.theme !== undefined) {
  if (file.theme === 'light' || file.theme === 'dark' || file.theme === 'system') theme = file.theme;
  else issues.push({ key: 'theme', reason: 'invalid' });
 }
 const imported = (typeof file.preferences === 'object' && file.preferences !== null && !Array.isArray(file.preferences) ? file.preferences : {}) as Record<string, unknown>;
 const shape = preferencesSchema.shape;
 for (const key of Object.keys(imported)) {
  const value = imported[key];
  if (excluded.has(key)) { issues.push({ key, reason: 'not-portable' }); continue; }
  if (!Object.hasOwn(shape, key)) { issues.push({ key, reason: 'unknown' }); continue; }
  if (key === 'keybindings') {
   if (typeof value !== 'object' || value === null || Array.isArray(value)) { issues.push({ key, reason: 'invalid' }); continue; }
   const members = value as Record<string, unknown>, valid: Partial<UiPreferences['keybindings']> = {};
   for (const member of Object.keys(members)) {
    if (!(keybindingMembers as string[]).includes(member)) { issues.push({ key: `keybindings.${member}`, reason: 'unknown' }); continue; }
    try { Object.assign(valid, parsePreferencePatch({ keybindings: { [member]: members[member] } }).keybindings); }
    catch { issues.push({ key: `keybindings.${member}`, reason: 'invalid' }); }
   }
   // Chord conflicts inside the imported set: skip every imported member that collides.
   const byChord = new Map<string, string[]>();
   for (const member of Object.keys(valid)) {
    const chord = normalizeChord(valid[member as keyof UiPreferences['keybindings']]!);
    byChord.set(chord, [...(byChord.get(chord) ?? []), member]);
   }
   for (const members_ of byChord.values()) {
    if (members_.length < 2) continue;
    for (const member of members_) {
     issues.push({ key: `keybindings.${member}`, reason: 'conflict', conflictWith: members_.find(other => other !== member) });
     delete valid[member as keyof UiPreferences['keybindings']];
    }
   }
   if (Object.keys(valid).length) patch.keybindings = valid;
   continue;
  }
  if (key === 'backgroundStyle' && value === 'image') { issues.push({ key, reason: 'invalid' }); continue; }
  try { Object.assign(patch, parsePreferencePatch({ [key]: value })); }
  catch { issues.push({ key, reason: 'invalid' }); }
 }
 return { ok: true, exportedAt: typeof file.exportedAt === 'string' ? file.exportedAt : undefined, appVersion: typeof file.appVersion === 'string' ? file.appVersion : undefined, theme, patch, issues };
}

export type SettingChange = { key: string; group: string; before: unknown; after: unknown };
const CHANGE_GROUPS = ['Theme', 'Appearance', 'Chat & composer', 'Threads & projects', 'Diffs', 'Notifications & usage', 'Keyboard'];

function groupOf(key: string): string {
 if (key === 'theme') return CHANGE_GROUPS[0];
 if (key.startsWith('keybindings.')) return CHANGE_GROUPS[6];
 const index = PORTABLE_GROUPS.findIndex(group => (group as readonly string[]).includes(key));
 return CHANGE_GROUPS[index + 1] ?? CHANGE_GROUPS[1];
}

function equal(left: unknown, right: unknown): boolean {
 return JSON.stringify(left) === JSON.stringify(right);
}

export function diffSettings(current: { theme: Theme; preferences: UiPreferences }, parsed: Extract<ParsedSettingsFile, { ok: true }>): { changes: SettingChange[]; unchanged: number; issues: ImportIssue[] } {
 const changes: SettingChange[] = [];
 const issues = [...parsed.issues], bindings = {...parsed.patch.keybindings};
 // Qualify the resulting bindings, so complete swaps remain valid. Removing
 // an import restores its current chord and can reveal another collision.
 // Each pass removes at least one imported member, so this is bounded by
 // the fixed set of keybinding members and never modifies current settings.
 for (;;) {
  const merged = {...current.preferences.keybindings, ...bindings};
  const rejected: (keyof UiPreferences['keybindings'])[] = [];
  for (const member of keybindingMembers) {
   if (!Object.hasOwn(bindings, member)) continue;
   const conflictWith = keybindingMembers.find(other => other !== member && normalizeChord(merged[other]) === normalizeChord(merged[member]));
   if (conflictWith) {
    issues.push({key: `keybindings.${member}`, reason: 'conflict', conflictWith});
    rejected.push(member);
   }
  }
  if (!rejected.length) break;
  for (const member of rejected) delete bindings[member];
 }
 let unchanged = 0;
 const push = (key: string, before: unknown, after: unknown) => {
  if (equal(before, after)) unchanged++;
  else changes.push({ key, group: groupOf(key), before, after });
 };
 if (parsed.theme !== undefined) push('theme', current.theme, parsed.theme);
 for (const key of PORTABLE_PREFERENCE_KEYS) {
  const value = key === 'keybindings' ? bindings : (parsed.patch as Record<string, unknown>)[key];
  if (value === undefined) continue;
  if (key === 'keybindings') {
   for (const member of Object.keys(value as object)) push(`keybindings.${member}`, current.preferences.keybindings[member as keyof UiPreferences['keybindings']], (value as Record<string, unknown>)[member]);
  } else push(key, current.preferences[key], value);
 }
 return { changes, unchanged, issues };
}

export function patchFromChanges(changes: SettingChange[], side: 'before' | 'after'): { theme?: Theme; preferences: PreferencePatch } {
 const result: { theme?: Theme; preferences: PreferencePatch } = { preferences: {} };
 for (const change of changes) {
  const value = change[side];
  if (change.key === 'theme') result.theme = value as Theme;
  else if (change.key.startsWith('keybindings.')) (result.preferences.keybindings ??= {})[change.key.slice('keybindings.'.length) as keyof UiPreferences['keybindings']] = value as string;
  else (result.preferences as Record<string, unknown>)[change.key] = value;
 }
 return result;
}
