import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SettingsView, SETTINGS_SECTIONS, SETTINGS_ROWS } from '../apps/web/src/Settings.tsx';
import { buildSupportedSettings, searchSettings } from '../apps/web/src/settings-registry.ts';

// SSR render without a DesktopContext means the browser build (useDesktop() → null).
const data = { sequence: 1, settings: { theme: 'dark', modelId: null }, accounts: [], skills: [], skillProposals: [], learning: { supported: false, status: 'idle', lastReview: null }, projects: [], resources: [], resourcePage: { total: 0, nextCursor: null }, counts: { threads: 0, archivedThreads: 0, artifacts: 0, resources: 0, uncertainOperations: 0 } , archivedThreads: [] } as unknown as Parameters<typeof SettingsView>[0]['data'];
const render = (initialSection?: string) => renderToStaticMarkup(createElement(SettingsView, { data, draftReferences: async () => ({ threads: [], skills: [], requests: [], userStates: [] }), initialSection, modelError: '', refresh: async () => {}, loadModels: async () => {}, close: () => {}, addResource: () => {} }));

describe('browser build hides the dead-end Browser section (#1731)', () => {
  it('renders exactly eleven nav sections in the browser build', () => {
    expect(SETTINGS_SECTIONS.length).toBe(12);
    const html = render('general');
    const nav = html.split('aria-label="Settings sections"')[1]!.split('</nav>')[0]!;
    expect((nav.match(/<button /g) ?? []).length).toBe(11);
    expect(nav).not.toContain('>Browser<');
  });
  it('stored browser section falls back to general in the browser build', () => {
    const html = render('browser');
    expect(html).not.toContain('Manual browser');
    expect(html).not.toContain('Start page');
    expect(html).toContain('General');
  });
  it('search excludes browser-start-page in the browser build, keeps it on desktop', () => {
    const supported = buildSupportedSettings(SETTINGS_ROWS, SETTINGS_SECTIONS);
    expect(searchSettings('browser', supported, 'browser').map(row => row.id)).not.toContain('browser-start-page');
    expect(searchSettings('start page', supported, 'browser')).toEqual([]);
    expect(searchSettings('start page', supported, 'desktop').map(row => row.id)).toContain('browser-start-page');
    expect(supported.find(row => row.id === 'browser-start-page')?.platform).toBe('desktop');
  });
});
