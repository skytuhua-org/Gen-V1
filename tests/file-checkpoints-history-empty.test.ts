import {expect,it} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {FileCheckpoints} from '../apps/web/src/FileCheckpoints.tsx';
import type {UiPreferences} from '../packages/contracts/preferences';

const preferences = {timeFormat:'system'} as UiPreferences;

it('renders the centered no-owner empty state with the recorded-copy split',()=>{
  const markup = renderToStaticMarkup(createElement(FileCheckpoints,{preferences,initialSource:'History',current:createElement('div'),recorded:createElement('div')}));
  expect(markup).toContain('file-checkpoints-history-empty');
  expect(markup).toContain('<strong>No checkpoint history</strong>');
  expect(markup).toContain('<p>Snapshots of this file will appear here once a checkpoint is recorded.</p>');
  expect(markup).not.toContain('class="file-checkpoints-note"');
  expect(markup).not.toContain('class="file-checkpoints-history"');
  expect(markup).not.toContain('Checkpoint history unavailable');
});
