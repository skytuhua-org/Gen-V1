import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {searchSettings,buildSupportedSettings} from '../apps/web/src/settings-registry';
import {SETTINGS_ROWS,SETTINGS_SECTIONS} from '../apps/web/src/Settings';

const rows=buildSupportedSettings(SETTINGS_ROWS,SETTINGS_SECTIONS);
const row=rows.find(item=>item.id==='start-at-sign-in');

describe('start-at-sign-in registry row (#1594 T06)',()=>{
 it('is registered in the General section and searchable',()=>{
  expect(row?.title).toBe('Start at sign-in');
  expect(row?.section).toBe('general');
  expect(row?.sectionLabel).toBe('General');
  expect(searchSettings('sign in',rows,'desktop').map(item=>item.id)).toContain('start-at-sign-in');
  expect(searchSettings('startup',rows,'desktop').map(item=>item.id)).toContain('start-at-sign-in');
  expect(searchSettings('hidden tray',rows,'desktop').map(item=>item.id)).toContain('start-at-sign-in');
 });
 it('is desktop-only so browser search never surfaces it',()=>{
  expect(row?.platform).toBe('desktop');
  expect(searchSettings('sign in',rows,'browser').map(item=>item.id)).not.toContain('start-at-sign-in');
 });
 it('keeps every required copy string exact',()=>{
  const source=readFileSync('apps/web/src/StartupSettings.tsx','utf8');
  expect(source).toContain("Couldn't change the sign-in setting. Windows didn't accept the change.");
  expect(source).toContain('Available in the installed app.');
  expect(source).toContain('Start hidden in tray');
  expect(source).toContain('openStartupApps');
  expect(readFileSync('apps/desktop/login-item.ts','utf8')).toContain('ms-settings:startupapps');
 });
 it('drives the switch through the three login-item bridge channels',()=>{
  const source=readFileSync('apps/web/src/StartupSettings.tsx','utf8');
  for(const method of ['loginItem','setLoginItem','openStartupApps'])expect(source).toContain(method);
  expect(readFileSync('apps/web/src/Settings.tsx','utf8')).toContain('StartupSettings');
 });
});
