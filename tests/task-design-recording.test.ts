import {expect,it} from 'vitest';
import {CAPABILITIES,validateSurface} from '../packages/ui-catalog';
import {taskDesignScenes,TASK_DESIGN_SELECTORS} from '../scripts/task-design-scenes';

it('keeps all 48 advertised components in 19 valid recording scenes with visible selectors',()=>{
 const scenes=taskDesignScenes();
 expect(scenes.map(scene=>scene.id)).toEqual(['time-offered','time-visits','review-copy','review-patch','investigation-failure','investigation-latency','software-release','image-work','measurements','private-entry','document','pr-dark','pr-light','questions','migration','work-objects','delivery','records','chart-variants']);
 expect(new Set(scenes.map(scene=>scene.id)).size).toBe(scenes.length);
 const recorded=new Set(scenes.flatMap(scene=>{validateSurface(scene.spec);return Object.values(scene.spec.elements).map(node=>node.type);}));
 expect([...recorded].sort()).toEqual(CAPABILITIES.map(component=>component.name).sort());expect(recorded.size).toBe(48);
 for(const component of recorded)expect(TASK_DESIGN_SELECTORS[component]).toBeTruthy();
});

it('exercises line, bar and scatter chart presentations in the chart scene',()=>{
 const charts=taskDesignScenes().find(scene=>scene.id==='chart-variants')!;
 const kinds=['line','bars','points'].map(id=>{const element=charts.spec.elements[id];expect(element?.type).toBe('Chart');return element!.props.kind;});
 expect(kinds).toEqual(['line','bar','scatter']);
 for(const id of ['line','bars','points'])expect(charts.spec.elements[id]!.props).toMatchObject({rowsBinding:'reviews',xKey:'day',yKey:'reviews'});
 expect(charts.spec.elements.charts.children).toEqual(['line','bars','points']);
});

it('records an editable prepared handoff and an explicit download proposal beside disclosed source evidence',()=>{
 const delivery=taskDesignScenes().find(scene=>scene.id==='delivery')!;
 const {elements}=delivery.spec;
 expect(elements.delivery).toMatchObject({type:'Stack',children:['handoff','form','sources']});
 expect(elements.handoff).toMatchObject({type:'Document',props:{title:'Delivery handoff',dataBinding:'handoff',presentation:'window',editableStateKey:'handoffDraft',linkLabel:'Open handoff'}});
 expect(delivery.inputs.handoff).toMatch(/Agreement handoff/);
 expect(elements.form.props).toMatchObject({actionId:'proposeDelivery',submitLabel:'Prepare download',payloadFromState:{document:'handoffDraft',note:'note',format:'format',includeOriginal:'original'}});
 expect(elements.sources).toMatchObject({type:'Disclosure',props:{title:'Source files'},children:['bundle']});
 expect(elements.document).toMatchObject({type:'Document',props:{resourceId:'agreement'}});
 expect(elements.files.type).toBe('Tree');expect(elements.evidence.type).toBe('EvidenceList');
});

it('records topic continuation through the composer without an automatic question footer',()=>{
 const questions=taskDesignScenes().find(scene=>scene.id==='questions')!;
 expect(questions.spec.elements.questions.children).toEqual(['retry','limits']);
 expect(questions.spec.elements.ask).toBeUndefined();
 expect(questions.spec.elements.question).toBeUndefined();
 expect(questions.spec.elements.retry).toMatchObject({type:'Disclosure',props:{onOpenActionId:'answer'}});
});
