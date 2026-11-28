import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AppearanceSettings } from '../apps/web/src/AppearanceSettings.tsx';
import { getPreferences } from '../packages/contracts/preferences.ts';

describe('font-size field markup (#1729)', () => {
  it('reserves the hint region under each size input without invalid state by default', () => {
    const html = renderToStaticMarkup(createElement(AppearanceSettings, { preferences: getPreferences({}), theme: 'dark', threads: [], busy: false, save: async () => true }));
    expect((html.match(/settings-field-error/g) ?? []).length).toBe(3);
    expect(html).toContain('appearance-uiFontSize-error');
    expect(html).toContain('appearance-chatFontSize-error');
    expect(html).toContain('appearance-codeFontSize-error');
    expect(html).not.toContain('aria-invalid="true"');
    expect(html).not.toContain('role="alert"');
    expect(html).toContain('min="13"'); expect(html).toContain('max="16"'); expect(html).toContain('step="1"');
  });
});
