export const ZOOM_STEPS=[0.5,0.67,0.75,0.8,0.9,1,1.1,1.25,1.5,1.75,2] as const;
export type ZoomCommand='in'|'out'|'reset';
export interface ZoomKey {type:string;key:string;code:string;ctrlKey:boolean;metaKey:boolean;altKey:boolean;shiftKey:boolean}
/** Next factor for a command; clamps at the ends, snaps unknown factors in the command's direction. */
export function nextZoom(current:number,command:ZoomCommand):number {
 if(command==='reset')return 1;
 if(command==='in')return ZOOM_STEPS.find(step=>step>current)??ZOOM_STEPS[ZOOM_STEPS.length-1];
 return[...ZOOM_STEPS].reverse().find(step=>step<current)??ZOOM_STEPS[0];
}
/** Loads a saved value: any value not in ZOOM_STEPS becomes 1. */
export function parseSavedZoom(value:unknown):number {
 if(typeof value!=='number'||!Number.isFinite(value))return 1;
 return (ZOOM_STEPS as readonly number[]).includes(value)?value:1;
}
/** Maps a key event to a zoom command, or null. keyDown only; Alt never matches. */
export function zoomCommandFor(event:ZoomKey):ZoomCommand|null {
 if(event.type!=='keyDown'||event.altKey)return null;
 if((event.ctrlKey||event.metaKey)&&!event.shiftKey&&event.key==='=')return 'in';
 if((event.ctrlKey||event.metaKey)&&event.key==='+')return 'in';
 if((event.ctrlKey||event.metaKey)&&event.code==='NumpadAdd')return 'in';
 if((event.ctrlKey||event.metaKey)&&!event.shiftKey&&event.key==='-')return 'out';
 if((event.ctrlKey||event.metaKey)&&event.code==='NumpadSubtract')return 'out';
 if((event.ctrlKey||event.metaKey)&&event.key==='0')return 'reset';
 if((event.ctrlKey||event.metaKey)&&event.code==='Numpad0')return 'reset';
 return null;
}
