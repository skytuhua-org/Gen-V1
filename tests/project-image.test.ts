import {afterEach,beforeEach,expect,it,vi} from 'vitest';

beforeEach(()=>vi.resetModules());
afterEach(()=>vi.unstubAllGlobals());

const api=()=>import('../apps/web/src/files/project-image.ts');

it('classifies previewable extensions case-insensitively',async()=>{
 const{imageKindFor}=await api();
 for(const name of ['a.png','b.jpg','c.jpeg','d.gif','e.webp'])expect(imageKindFor(name),name).toBe('raster');
 expect(imageKindFor('f.svg')).toBe('svg');expect(imageKindFor('ICON.PNG')).toBe('raster');expect(imageKindFor('Icon.SvG')).toBe('svg');
 for(const name of ['a.svgz','b.ico','c.bmp','noext','d.md','e.avif'])expect(imageKindFor(name),name).toBe(null);
});

it('formats byte sizes like the rest of the Files UI',async()=>{
 const{formatImageBytes}=await api();
 expect(formatImageBytes(0)).toBe('0 B');expect(formatImageBytes(1023)).toBe('1023 B');expect(formatImageBytes(1024)).toBe('1 KB');
 expect(formatImageBytes(24678)).toBe('24.1 KB');expect(formatImageBytes(10485760)).toBe('10 MB');expect(formatImageBytes(1572864)).toBe('1.5 MB');
});

it('refuses a declared over-limit image without reading the body',async()=>{
 const{readProjectImage}=await api();let bodyRead=false;
 vi.stubGlobal('fetch',vi.fn(async(url:string)=>{
  if(url==='/api/bootstrap')return Response.json({csrfToken:'token'});
  return new Response(new Blob([new Uint8Array(4)]),{status:200,headers:{'Content-Length':String(11*1024*1024),'X-File-Sha256':'abc'}});
 }));
 // Track body consumption by wrapping Response.prototype.blob once for this test.
 const blob=Response.prototype.blob;Response.prototype.blob=function(){bodyRead=true;return blob.call(this);};
 try{await expect(readProjectImage('/api/projects/project-one','threadId=t1','big.png',new AbortController().signal)).rejects.toMatchObject({code:'RESOURCE_LIMIT',message:'Image preview is limited to 10 MiB.'});}
 finally{Response.prototype.blob=blob;}
 expect(bodyRead).toBe(false);
});

it('returns blob, sha256 and byte count for an allowed response',async()=>{
 const{readProjectImage}=await api();const bytes=new Uint8Array([1,2,3,4,5]);
 vi.stubGlobal('fetch',vi.fn(async(url:string)=>{
  if(url==='/api/bootstrap')return Response.json({csrfToken:'token'});
  expect(url).toContain('/api/projects/project-one/file/image?');expect(url).toContain('path=logo.png');expect(url).toContain('threadId=t1');
  return new Response(bytes,{status:200,headers:{'Content-Length':String(bytes.length),'X-File-Sha256':'beef'}});
 }));
 const image=await readProjectImage('/api/projects/project-one','threadId=t1','logo.png',new AbortController().signal);
 expect(image.bytes).toBe(5);expect(image.sha256).toBe('beef');expect(image.blob.size).toBe(5);
});

it('rejects an under-declared body that still exceeds the cap',async()=>{
 const{readProjectImage}=await api();
 vi.stubGlobal('fetch',vi.fn(async(url:string)=>{
  if(url==='/api/bootstrap')return Response.json({csrfToken:'token'});
  return new Response(new Blob([new Uint8Array(10*1024*1024+1)]),{status:200,headers:{'Content-Length':'5'}});
 }));
 await expect(readProjectImage('/api/projects/project-one','','huge.png',new AbortController().signal)).rejects.toMatchObject({code:'RESOURCE_LIMIT'});
});

it('surfaces the host error code for rejected responses',async()=>{
 const{readProjectImage}=await api();
 vi.stubGlobal('fetch',vi.fn(async(url:string)=>{
  if(url==='/api/bootstrap')return Response.json({csrfToken:'token'});
  return Response.json({error:{code:'UNSUPPORTED',message:'This file is not a valid PNG image.'}},{status:400});
 }));
 await expect(readProjectImage('/api/projects/project-one','','fake.png',new AbortController().signal)).rejects.toMatchObject({code:'UNSUPPORTED',message:'This file is not a valid PNG image.'});
});
