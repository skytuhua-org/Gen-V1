export type ReadingMetric={id:string;top:number;bottom:number};
export type ReadingPoint={id:string;offset:number};
export type ReadingAnchor={
 owner:string;
 primary:ReadingPoint;
 next?:ReadingPoint;
 previous?:ReadingPoint;
};

function eligible(rows:readonly ReadingMetric[]):ReadingMetric[]{
 const seen=new Set<string>(),out:ReadingMetric[]=[];
 for(const row of rows){
  if(seen.has(row.id)||!Number.isFinite(row.top)||!Number.isFinite(row.bottom)||row.bottom<row.top)continue;
  seen.add(row.id);out.push(row);
 }
 return out;
}

export function captureReadingAnchor(owner:string,rows:readonly ReadingMetric[],height:number):ReadingAnchor|null{
 if(!Number.isFinite(height)||height<=0)return null;
 const valid=eligible(rows),index=valid.findIndex(row=>row.bottom>0&&row.top<height);
 if(index<0)return null;
 const point=(row:ReadingMetric):ReadingPoint=>({id:row.id,offset:row.top});
 return {owner,primary:point(valid[index]),...(valid[index+1]?{next:point(valid[index+1])}:{}),...(valid[index-1]?{previous:point(valid[index-1])}:{})};
}

export function resolveReadingTop(anchor:ReadingAnchor,rows:readonly ReadingMetric[],top:number,maximum:number):number|null{
 if(!Number.isFinite(top)||!Number.isFinite(maximum)||maximum<0)return null;
 const valid=eligible(rows);
 for(const point of [anchor.primary,anchor.next,anchor.previous]){
  if(!point)continue;
  const metric=valid.find(row=>row.id===point.id);
  if(metric)return Math.min(maximum,Math.max(0,top+metric.top-point.offset));
 }
 return null;
}
