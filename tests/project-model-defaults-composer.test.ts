import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { modelPickWritesGlobal } from '../apps/web/src/project-model-defaults';
import { ComposerModelNotice } from '../apps/web/src/ComposerModelNotice';

describe('modelPickWritesGlobal (R05)', () => {
  it('skips the global write when the unbound thread has a project default', () => {
    expect(modelPickWritesGlobal({ modelId: 'a' }, false)).toBe(false);
  });
  it('keeps the global write without a project default or on a bound thread', () => {
    expect(modelPickWritesGlobal(null, false)).toBe(true);
    expect(modelPickWritesGlobal(undefined, false)).toBe(true);
    expect(modelPickWritesGlobal({ modelId: 'a' }, true)).toBe(true);
  });
});

type Node = ReactElement<Record<string, unknown>>;
const flatten = (node: unknown): Node[] => (Array.isArray(node) ? node : node ? [node] : []) as Node[];
const buttons = (root: Node) => flatten(root.props.children).filter(child => child.type === 'button');

describe('ComposerModelNotice (R07)', () => {
  it('unavailable notice announces itself and wires both actions', () => {
    const open = vi.fn(), edit = vi.fn();
    const root = ComposerModelNotice({ kind: 'unavailable', projectName: 'Web app', onChooseModel: open, onEditDefaults: edit }) as Node;
    expect(root.props.role).toBe('status');
    expect(root.props.className).toContain('composer-model-unavailable');
    const [choose, editButton] = buttons(root);
    expect(choose.props.children).toBe('Choose model');
    (choose.props.onClick as () => void)();
    expect(open).toHaveBeenCalledOnce();
    expect(editButton.props.children).toBe('Edit project defaults');
    (editButton.props.onClick as () => void)();
    expect(edit).toHaveBeenCalledOnce();
  });

  it('unavailable copy falls back to a generic project label', () => {
    const root = ComposerModelNotice({ kind: 'unavailable', onChooseModel: () => {} }) as Node;
    const text = JSON.stringify(root.props.children);
    expect(text).toContain('This project');
    expect(text).toContain('Choose a model to send.');
  });

  it('dropped notice names the model and level and dismisses', () => {
    const dismiss = vi.fn();
    const root = ComposerModelNotice({ kind: 'dropped', modelName: 'Gen Large', level: 'high', onDismiss: dismiss }) as Node;
    expect(root.props.role).toBe('status');
    expect(root.props.className).not.toContain('unavailable');
    const text = JSON.stringify(root.props.children);
    expect(text).toContain('Gen Large');
    expect(text).toContain('high');
    const [dismissButton] = buttons(root);
    expect(dismissButton.props['aria-label']).toBe('Dismiss');
    (dismissButton.props.onClick as () => void)();
    expect(dismiss).toHaveBeenCalledOnce();
  });
});
