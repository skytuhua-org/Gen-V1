/** Pure geometry and event-eligibility decisions for prompt navigation; no DOM side effects. */
export const PROMPT_ANCHOR_OFFSET=16,PROMPT_ALIGNMENT_TOLERANCE=2;
export type PromptDirection=-1|1;
export interface PromptTarget{id:string;top:number}

/** The viewport line a target row is aligned to, in scroll-content space. */
export function promptAnchor(scrollTop:number):number{
 return scrollTop+PROMPT_ANCHOR_OFFSET;
}

/** The previous/next prompt for an ordered rendered list. A live cursor steps by row
 * identity so repeat and reversal ignore animation in between; a stale cursor falls
 * back to the viewport anchor, which treats rows within tolerance as current. */
export function selectPromptTarget(targets:readonly PromptTarget[],anchor:number,direction:PromptDirection,cursor?:string|null):PromptTarget|null{
 const rows=targets.filter(target=>Number.isFinite(target.top));
 if(!rows.length)return null;
 if(cursor!==undefined&&cursor!==null){
  const index=rows.findIndex(target=>target.id===cursor);
  if(index>=0)return rows[index+direction]??null;
 }
 if(direction<0){for(let index=rows.length-1;index>=0;index--)if(rows[index]!.top<anchor-PROMPT_ALIGNMENT_TOLERANCE)return rows[index]!;return null;}
 for(const row of rows)if(row.top>anchor+PROMPT_ALIGNMENT_TOLERANCE)return row;
 return null;
}

/** Destination scroll offset for a target row top, clamped to the scrollable range. */
export function promptDestination(rowTop:number,scrollHeight:number,clientHeight:number):number{
 return Math.max(0,Math.min(Math.max(0,scrollHeight-clientHeight),rowTop-PROMPT_ANCHOR_OFFSET));
}

const PROMPT_EXCLUDED='input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"],[role="application"],[role="dialog"],[role="alertdialog"],[role="menu"],[role="listbox"],[role="combobox"],[role="spinbutton"],[role="slider"],dialog,.xterm-host,.terminal-read,.signature-pad';

/** Editable and interactive descendants keep Alt+Arrow for themselves; the scroller,
 * a prompt row, plain transcript content and the rail all stay eligible. */
export function promptContextEligible(target:EventTarget|null,owner:HTMLElement):boolean{
 if(target===owner)return true;
 const element=target as Element|null;
 if(!element||typeof element.closest!=='function')return false;
 if(element!==owner&&!owner.contains(element))return false;
 if((element as HTMLElement).isContentEditable)return false;
 return !element.closest(PROMPT_EXCLUDED);
}

/** Full keydown gate before a recognized chord is claimed: composition, prior
 * handling and an excluded focus context all pass the event through untouched. */
export function promptEventEligible(event:{defaultPrevented?:boolean;isComposing?:boolean;keyCode?:number;target?:EventTarget|null},owner:HTMLElement):boolean{
 if(event.defaultPrevented||event.isComposing||event.keyCode===229)return false;
 return promptContextEligible(event.target??null,owner);
}
