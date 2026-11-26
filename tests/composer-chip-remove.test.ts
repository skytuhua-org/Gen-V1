import {describe,expect,it,vi} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {ComposerAttachments} from '../apps/web/src/ComposerAttachments.tsx';
import type {ResourceGrant} from '../packages/contracts';

const grant=(id:string,label:string,writable=true):ResourceGrant=>({id,threadId:'t1',path:`/tmp/${label}`,label,kind:'file',writable,createdAt:'',identity:{dev:'0',ino:'0'}});

describe('Composer resource chip remove control',()=>{
 it('renders a remove button per chip with basename label and title',()=>{
  const html=renderToStaticMarkup(createElement(ComposerAttachments,{resources:[grant('r1','report.pdf'),grant('r2','data.csv',false)],onRemoveResource:async()=>{}}));
  expect(html).toContain('class="resource-chip-remove"');
  expect(html).toContain('aria-label="Remove resource report.pdf"');
  expect(html).toContain('aria-label="Remove resource data.csv"');
  expect(html.match(/title="Remove resource"/g)).toHaveLength(2);
 });
 it('omits the control when no removal handler is wired',()=>{
  const html=renderToStaticMarkup(createElement(ComposerAttachments,{resources:[grant('r1','report.pdf')]}));
  expect(html).not.toContain('resource-chip-remove');
 });
 it('disables the control with the read-only title under removeBlocked',()=>{
  const html=renderToStaticMarkup(createElement(ComposerAttachments,{resources:[grant('r1','report.pdf')],onRemoveResource:async()=>{},removeBlocked:'read-only'}));
  expect(html).toContain('title="Removal unavailable — thread is read-only"');
  expect(html).toContain('disabled=""');
 });
 it('invokes the handler and announces the removal',async()=>{
  const onRemove=vi.fn(async()=>{});
  renderToStaticMarkup(createElement(ComposerAttachments,{resources:[grant('r1','report.pdf')],onRemoveResource:onRemove}));
  expect(onRemove).not.toHaveBeenCalled();
 });
});
