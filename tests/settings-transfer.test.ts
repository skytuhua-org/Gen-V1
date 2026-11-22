import {describe,expect,it} from 'vitest';
import {preferencesSchema,DEFAULT_PREFERENCES,getPreferences,mergePreferences,type UiPreferences} from '../packages/contracts/preferences.ts';
import {SETTINGS_FILE_LIMIT,PORTABLE_PREFERENCE_KEYS,EXCLUDED_PREFERENCE_KEYS,buildSettingsFile,parseSettingsFile,diffSettings,patchFromChanges} from '../packages/contracts/settings-transfer.ts';

const schemaKeys = Object.keys(preferencesSchema.shape);
const file = (preferences: Partial<UiPreferences>, extra: Record<string, unknown> = {}) => JSON.stringify({format:'gen.settings',version:1,exportedAt:'2026-11-22T00:00:00.000Z',theme:'dark',preferences,...extra});

describe('key classification',()=>{
 it('PORTABLE ∪ EXCLUDED covers every schema key exactly once',()=>{
  expect(new Set(PORTABLE_PREFERENCE_KEYS).size).toBe(PORTABLE_PREFERENCE_KEYS.length);
  expect([...PORTABLE_PREFERENCE_KEYS,...EXCLUDED_PREFERENCE_KEYS].sort()).toEqual([...schemaKeys].sort());
 });
});

describe('buildSettingsFile',()=>{
 it('emits only allowlisted keys, maps image→solid, ends with newline, stays small',()=>{
  const prefs = {...DEFAULT_PREFERENCES,browserStartUrl:'https://x.example',backgroundImage:'x'.repeat(100),backgroundStyle:'image' as const,projectColors:{p1:'#4F6EFF'},learningEnabled:false};
  const text = buildSettingsFile({theme:'dark',preferences:prefs,now:new Date('2026-11-22T00:00:00Z'),appVersion:'0.6.5'});
  expect(text.endsWith('\n')).toBe(true);expect(text.length).toBeLessThan(8192);
  const parsed = JSON.parse(text);
  expect(parsed.format).toBe('gen.settings');expect(parsed.version).toBe(1);expect(parsed.theme).toBe('dark');
  expect(Object.keys(parsed.preferences).sort()).toEqual([...PORTABLE_PREFERENCE_KEYS].sort());
  expect(parsed.preferences.backgroundStyle).toBe('solid');
  expect(parsed.preferences).not.toHaveProperty('browserStartUrl');
  expect(Object.keys(parsed.preferences.keybindings)).toHaveLength(6);
 });
 it('drops unknown stored fields',()=>{
  const prefs = getPreferences({preferences:{zzz:1} as never});
  const parsed = JSON.parse(buildSettingsFile({theme:'dark',preferences:prefs,now:new Date()}));
  expect(parsed.preferences).not.toHaveProperty('zzz');
 });
});

describe('parseSettingsFile errors',()=>{
 it('rejects oversize, unreadable, wrong format, bad versions',()=>{
  expect(parseSettingsFile(' '.repeat(SETTINGS_FILE_LIMIT+1))).toEqual({ok:false,error:'too-large'});
  expect(parseSettingsFile('{')).toEqual({ok:false,error:'unreadable'});
  for(const bad of ['[]','null','{}',file({},{format:'other'}),file({},{version:'1'}),file({},{version:0}),file({},{version:-1})])expect(parseSettingsFile(bad)).toEqual({ok:false,error:'not-settings-file'});
  expect(parseSettingsFile(file({},{version:2}))).toEqual({ok:false,error:'newer-version'});
 });
});

describe('parseSettingsFile issues',()=>{
 it('reports not-portable, unknown, invalid, and keybinding member issues',()=>{
  const result = parseSettingsFile(file({projectColors:{p:'#4F6EFF'},zzz:1,uiFontSize:99,backgroundStyle:'image',keybindings:{foo:'x',search:'bad'.repeat(30)}} as never));
  if(!result.ok)throw Error('parse failed');
  expect(result.issues).toContainEqual({key:'projectColors',reason:'not-portable'});
  expect(result.issues).toContainEqual({key:'zzz',reason:'unknown'});
  expect(result.issues).toContainEqual({key:'uiFontSize',reason:'invalid'});
  expect(result.issues).toContainEqual({key:'keybindings.foo',reason:'unknown'});
  expect(result.issues).toContainEqual({key:'keybindings.search',reason:'invalid'});
  expect(result.issues).toContainEqual({key:'backgroundStyle',reason:'invalid'});
 });
 it('rejects an invalid theme',()=>{
  const result = parseSettingsFile(file({},{theme:'blue'}));
  if(!result.ok)throw Error('parse failed');
  expect(result.issues).toContainEqual({key:'theme',reason:'invalid'});
  expect(result.theme).toBeUndefined();
 });
 it('flags colliding imported chords and still keeps clean members',()=>{
  const result = parseSettingsFile(file({keybindings:{search:'Ctrl+K',newThread:'ctrl+k',stop:'Escape'} as never}));
  if(!result.ok)throw Error('parse failed');
  expect(result.issues).toContainEqual({key:'keybindings.search',reason:'conflict',conflictWith:'newThread'});
  expect(result.issues).toContainEqual({key:'keybindings.newThread',reason:'conflict',conflictWith:'search'});
  expect(result.patch.keybindings).toEqual({stop:'Escape'});
 });
 it('yields an unknown issue for prototype keys without pollution',()=>{
  const result = parseSettingsFile('{"format":"gen.settings","version":1,"preferences":{"__proto__":{"x":1}}}');
  if(!result.ok)throw Error('parse failed');
  expect(result.issues).toContainEqual({key:'__proto__',reason:'unknown'});
  expect(({} as Record<string,unknown>).x).toBeUndefined();
 });
});

describe('round trip and diff',()=>{
 it('build → parse → diff reproduces every changed key; patch restores portable keys',()=>{
  const source = {...DEFAULT_PREFERENCES,density:'compact' as const,uiFontSize:16,wordWrap:false,keybindings:{...DEFAULT_PREFERENCES.keybindings,search:'Ctrl+Alt+K'}};
  const text = buildSettingsFile({theme:'light',preferences:source,now:new Date('2026-11-22T00:00:00Z')});
  const parsed = parseSettingsFile(text);
  if(!parsed.ok)throw Error('parse failed');
  const {changes} = diffSettings({theme:'dark',preferences:DEFAULT_PREFERENCES},parsed);
  const keys = changes.map(change=>change.key);
  expect(keys).toEqual(expect.arrayContaining(['theme','density','uiFontSize','wordWrap','keybindings.search']));
  const patch = patchFromChanges(changes,'after');
  const merged = mergePreferences(DEFAULT_PREFERENCES,patch.preferences);
  for(const key of PORTABLE_PREFERENCE_KEYS)expect(merged[key]).toEqual(source[key]);
  expect(patch.theme).toBe('light');
 });
 it('counts unchanged entries',()=>{
  const parsed = parseSettingsFile(file({density:'comfortable',wordWrap:true}));
  if(!parsed.ok)throw Error('parse failed');
  expect(diffSettings({theme:'dark',preferences:DEFAULT_PREFERENCES},parsed).unchanged).toBe(3); // theme + density + wordWrap match
 });
});
