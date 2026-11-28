import {expect, it, vi} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {ComposerModelNotice} from '../apps/web/src/ComposerToolbar';
import {modelChoiceKey, thinkingExplicitKey, modelSourceLocks, pickWritesGlobalDefault} from '../apps/web/src/project-model-defaults';

const render = (props: Parameters<typeof ComposerModelNotice>[0]) => renderToStaticMarkup(createElement(ComposerModelNotice, props));

it('renders the unavailable notice with both recovery actions', () => {
  const html = render({source: 'project-unavailable', projectName: 'Gen V1', modelName: '', onChooseModel: () => {}, onEditProjectDefaults: () => {}, onDismiss: () => {}});
  expect(html).toContain("Gen V1&#x27;s default model isn&#x27;t available with your selected accounts. Choose a model to send.");
  expect(html).toContain('>Choose model</button>');
  expect(html).toContain('>Edit project defaults</button>');
  expect(html).toContain('role="status"');
});

it('omits the editor action when no project panel callback exists', () => {
  const html = render({source: 'project-unavailable', projectName: 'Gen V1', modelName: '', onChooseModel: () => {}, onDismiss: () => {}});
  expect(html).toContain('>Choose model</button>');
  expect(html).not.toContain('Edit project defaults');
});

it('renders the reasoning-dropped info bar and hides it once dismissed', () => {
  const onDismiss = vi.fn();
  const html = render({source: 'project', reasoningDropped: true, droppedLevel: 'high', modelName: 'Gemini 3', onChooseModel: () => {}, onDismiss});
  expect(html).toContain('Gemini 3 doesn&#x27;t offer high reasoning, so it uses the model default.'); // apostrophe escaped by renderToStaticMarkup
  expect(html).toContain('aria-label="Dismiss"');
  expect(render({source: 'project', reasoningDropped: true, dismissed: true, modelName: 'Gemini 3', onChooseModel: () => {}, onDismiss})).toBe('');
});

it('renders nothing for non-project sources', () => {
  for (const source of ['bound', 'explicit', 'global', 'first', undefined] as const) {
    expect(render({source, reasoningDropped: true, modelName: 'm', onChooseModel: () => {}, onDismiss: () => {}})).toBe('');
  }
});

it('keeps per-owner journal keys distinct and locks resolved sources', () => {
  expect(modelChoiceKey('new')).toBe('modelChoice:new');
  expect(modelChoiceKey('thread-1')).toBe('modelChoice:thread-1');
  expect(thinkingExplicitKey('new')).toBe('thinkingExplicit:new');
  expect(modelSourceLocks('explicit')).toBe(true);
  expect(modelSourceLocks('project')).toBe(true);
  expect(modelSourceLocks('project-unavailable')).toBe(true);
  expect(modelSourceLocks('bound')).toBe(false);
  expect(modelSourceLocks('global')).toBe(false);
  expect(modelSourceLocks('first')).toBe(false);
  expect(modelSourceLocks(undefined)).toBe(false);
});

it('skips the global settings write only while a project default exists', () => {
  expect(pickWritesGlobalDefault({projectDefault: {modelId: 'gpt-5'}})).toBe(false);
  expect(pickWritesGlobalDefault({projectDefault: null})).toBe(true);
  expect(pickWritesGlobalDefault({})).toBe(true);
});
