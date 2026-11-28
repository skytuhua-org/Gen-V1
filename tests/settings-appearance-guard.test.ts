import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DiscardAppearanceDialog } from '../apps/web/src/AppearanceSettings.tsx';

describe('discard appearance dialog (#1728)', () => {
  const base = { open: true, applying: false, onKeep: () => {}, onDiscard: () => {}, onApply: () => {} };
  it('renders title, copy and the three actions', () => {
    const html = renderToStaticMarkup(createElement(DiscardAppearanceDialog, base));
    expect(html).toContain('Discard appearance changes?');
    expect(html).toContain('unsaved appearance changes');
    expect(html).toContain('Keep editing');
    expect(html).toContain('Discard changes');
    expect(html).toContain('Apply changes');
    expect(html).not.toContain('Applying…');
  });
  it('keeps buttons interactive when not applying and disabled while applying', () => {
    const idle = renderToStaticMarkup(createElement(DiscardAppearanceDialog, base));
    expect(idle.match(/disabled=""/g)).toBeNull();
    const busy = renderToStaticMarkup(createElement(DiscardAppearanceDialog, { ...base, applying: true }));
    expect(busy).toContain('Applying…');
    expect((busy.match(/disabled=""/g) ?? []).length).toBe(3);
    expect(busy).toContain('aria-busy="true"');
  });
  it('renders nothing when closed', () => {
    const html = renderToStaticMarkup(createElement(DiscardAppearanceDialog, { ...base, open: false }));
    expect(html.trim()).toBe('');
  });
});
