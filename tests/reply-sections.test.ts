import {expect,it} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {ReplyMarkdown} from '../apps/web/src/Markdown.tsx';
import type {ReplyHeading} from '../apps/web/src/Markdown.tsx';

const collect=(text:string)=>{let headings:ReplyHeading[]=[];renderToStaticMarkup(createElement(ReplyMarkdown,{text,renderOutline:list=>{headings=list;return null;}}));return headings;};

it('suffixes equal heading labels with their own positions in source order',()=>{
  const headings=collect('## Results\n\na\n\n## Results\n\nb\n\n## Results\n');
  expect(headings.map(heading=>heading.label)).toEqual(['Results (1 of 3)','Results (2 of 3)','Results (3 of 3)']);
});

it('leaves unique labels unadorned and keeps heading identity keys',()=>{
  const headings=collect('## Alpha\n\n## Beta\n\ntext\n\n## Alpha\n');
  expect(headings.map(heading=>heading.label)).toEqual(['Alpha (1 of 2)','Beta','Alpha (2 of 2)']);
  expect(new Set(headings.map(heading=>heading.key)).size).toBe(3);
});

it('does not count heading-like lines inside fences or unclosed fences',()=>{
  const headings=collect('## Real\n\n```\n## Fake\n```\n\n~~~\n## Also fake\n');
  expect(headings.map(heading=>heading.label)).toEqual(['Real']);
});
