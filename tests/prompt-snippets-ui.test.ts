import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PromptSnippetsTrigger, PromptSnippetsReceipt, type PromptSnippetsState } from '../apps/web/src/PromptSnippets';
import { spliceSnippet } from '../apps/web/src/snippet-insertion';

const base = {
  pickerId: 'ps-picker', listId: 'ps-list', open: false, invocation: null,
  library: null, items: [], search: '', active: 0, message: '', busyId: null,
  selectionCapture: null, manage: false, editor: null, conflict: null,
  confirm: null, discard: false, receipt: null,
} as unknown as PromptSnippetsState;
const state = (patch: Partial<PromptSnippetsState>) => ({ ...base, ...patch });

describe('prompt snippets trigger', () => {
  it('exposes dialog semantics and stays enabled independently of library content', () => {
    const html = renderToStaticMarkup(createElement(PromptSnippetsTrigger, { snippets: state({ open: false }) }));
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-controls="ps-picker"');
    expect(html).toContain('Snippets');
    expect(html).not.toContain('disabled');
  });
  it('reflects the open state and honors the owner disabled gate', () => {
    expect(renderToStaticMarkup(createElement(PromptSnippetsTrigger, { snippets: state({ open: true }) }))).toContain('aria-expanded="true"');
    expect(renderToStaticMarkup(createElement(PromptSnippetsTrigger, { snippets: base, disabled: true }))).toContain('disabled=""');
  });
});

describe('prompt snippets undo receipt', () => {
  it('announces the inserted name with an undo action via a polite status region', () => {
    const receipt = { signature: 's', restore: { signature: 's', text: 'a', start: 0, end: 0, direction: 'none' as const }, result: 'ab', caret: 2 };
    const html = renderToStaticMarkup(createElement(PromptSnippetsReceipt, { snippets: state({ receipt: { receipt, name: 'Standup note' } }) }));
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('Inserted Standup note');
    expect(html).toContain('Undo insertion');
  });
  it('is empty without a receipt', () => {
    const html = renderToStaticMarkup(createElement(PromptSnippetsReceipt, { snippets: base }));
    expect(html).not.toContain('Inserted');
    expect(html).not.toContain('Undo');
  });
});

describe('slash invocation splice', () => {
  it('replaces the token span with the snippet body and moves the caret after it', () => {
    // /snippets token at [4,13) is the splice target the picker reuses.
    const result = spliceSnippet('hey /snippets now', 4, 13, 'BODY');
    expect(result).toEqual({ text: 'hey BODY now', caret: 8 });
  });
});
