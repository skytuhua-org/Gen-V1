import {describe,expect,it} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {ModelPicker} from '../apps/web/src/ModelPicker.tsx';
import {ComposerTaskActions} from '../apps/web/src/ComposerToolbar.tsx';
import type {ModelInfo} from '../packages/contracts';

const model:ModelInfo={id:'review/local-fixture',name:'Fixture',provider:'review'};

describe('ModelPicker disabled states',()=>{
 it('shows No model + connection hint when disabled with an empty catalog',()=>{
  const html=renderToStaticMarkup(createElement(ModelPicker,{models:[],modelId:'review/local-fixture',onChange:()=>{},disabled:true}));
  expect(html).toContain('>No model<');
  expect(html).toContain('title="No model connected — open Settings › Models to connect one"');
  expect(html).toContain('aria-label="No model connected — open Settings › Models to connect one"');
  expect(html).not.toContain('review/local-fixture');
 });
 it('keeps the model name with the locked reason when held',()=>{
  for(const [reason,state] of [['read-only','read-only'],['archived','archived'],['waiting for a pending action','waiting for a pending action'],['detached','detached'],['closing','closing']] as const){
   const html=renderToStaticMarkup(createElement(ModelPicker,{models:[model],modelId:model.id,onChange:()=>{},disabled:true,heldReason:reason}));
   expect(html).toContain('>Fixture<');
   expect(html).toContain(`title="Model selection is locked — thread is ${state}"`);
   expect(html).toContain(`aria-label="Model selection is locked — thread is ${state}"`);
  }
 });
 it('keeps the busy title when disabled without a held reason',()=>{
  const html=renderToStaticMarkup(createElement(ModelPicker,{models:[model],modelId:model.id,onChange:()=>{},disabled:true}));
  expect(html).toContain('title="Wait for the active run to finish to change models"');
 });
});

describe('ComposerTaskActions change counts',()=>{
 const props={onChanges:()=>{},onCreatePR:()=>{}};
 it('renders only the Changes label for a zero summary',()=>{
  const html=renderToStaticMarkup(createElement(ComposerTaskActions,{...props,changeSummary:{added:0,removed:0}}));
  expect(html).not.toContain('composer-change-counts');
  expect(html).toContain('>Changes<');
 });
 it('renders counts when any line changed',()=>{
  const html=renderToStaticMarkup(createElement(ComposerTaskActions,{...props,changeSummary:{added:2,removed:0}}));
  expect(html).toContain('>+2<');
  expect(html).toContain('>−0<');
 });
});
