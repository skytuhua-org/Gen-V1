import {expect,it} from 'vitest';
import {githubDeviceAllowed} from '../apps/desktop/github-device-policy.ts';
import type {DesktopSurface} from '../packages/desktop-contract/index.ts';

it.each<DesktopSurface>([
 {kind:'main'},{kind:'thread',threadId:'thread'},
 {kind:'workspace',tab:'pull-request'},{kind:'workspace',tab:'linked-pull-requests'},
])('allows the fixed device action from eligible native surface %j',surface=>{
 expect(githubDeviceAllowed(surface)).toBe(true);
});

it.each<DesktopSurface>([
 {kind:'browser',browserId:'browser'},{kind:'plugin',pluginId:'company',scopeId:'company',surfaceId:'workspace'},
 {kind:'artifact',threadId:'thread',artifactId:'artifact'},{kind:'workspace',tab:'files'},
 {kind:'plan',threadId:'thread'},{kind:'usage',threadId:'thread'},
 {kind:'agent',threadId:'thread',agentId:'child'},{kind:'navigation'},
])('denies the fixed device action from ineligible native surface %j',surface=>{
 expect(githubDeviceAllowed(surface)).toBe(false);
});
