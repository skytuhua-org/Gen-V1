interface DevServerQuitItem{url?:string;port?:number;label?:string}

/** Options for the quit-time running-servers prompt; pure for tests. */
export function quitDialogOptions(count:number,items:DevServerQuitItem[]|unknown){
 const rows=Array.isArray(items)?items.slice(0,5):[];
 const detail=rows.map(item=>`localhost:${typeof item.port==='number'?item.port:'?'} — ${typeof item.label==='string'&&item.label?item.label:'Terminal'}`).join('\n');
 return {
  type:'question' as const,
  title:'Gen V1',
  message:`Stop ${count} running server${count===1?'':'s'} and quit Gen?`,
  detail,
  buttons:['Stop and quit','Cancel'],
  defaultId:0,
  cancelId:1,
  noLink:true,
 };
}
