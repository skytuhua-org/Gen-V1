import {remoteBrowserUrl} from './window-policy.ts';
import type {DesktopBrowserBookmark} from '../../packages/desktop-contract/index.ts';

export const BOOKMARK_LIMIT=200;
export const BOOKMARK_STORE_MAX_BYTES=256*1024;
export const BOOKMARK_TITLE_MAX=120;
export const BOOKMARK_URL_MAX=2048;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ISO=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})$/;
export type BookmarkError='limit'|'duplicate'|'missing'|'invalid';

/** Normalized public http(s) bookmark target, or null when the page cannot be stored. */
export function normalizeBookmarkUrl(raw:string,keepQuery:boolean):string|null {
 try{
  const url=remoteBrowserUrl(raw);
  if(url.href.length>BOOKMARK_URL_MAX||url.username||url.password)return null;
  if(!keepQuery){url.search='';url.hash='';}
  return url.href;
 }catch{return null;}
}

function validBookmark(value:unknown):value is DesktopBrowserBookmark {
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)return false;
 const item=value as Record<string,unknown>;
 return Object.keys(item).length===5&&typeof item.id==='string'&&UUID.test(item.id)&&typeof item.url==='string'&&normalizeBookmarkUrl(item.url,true)===item.url&&typeof item.title==='string'&&item.title===item.title.trim()&&item.title.length>=1&&item.title.length<=BOOKMARK_TITLE_MAX&&typeof item.createdAt==='string'&&ISO.test(item.createdAt)&&!Number.isNaN(Date.parse(item.createdAt))&&typeof item.updatedAt==='string'&&ISO.test(item.updatedAt)&&!Number.isNaN(Date.parse(item.updatedAt));
}

function sorted(items:readonly DesktopBrowserBookmark[]):DesktopBrowserBookmark[] {return [...items].sort((a,b)=>b.createdAt.localeCompare(a.createdAt));}

export function parseBookmarkStore(text:string):{items:DesktopBrowserBookmark[];dropped:number}|{invalid:true} {
 let value:unknown;try{value=JSON.parse(text);}catch{return{invalid:true};}
 if(!value||typeof value!=='object'||Array.isArray(value)||(value as Record<string,unknown>).version!==1||!Array.isArray((value as Record<string,unknown>).bookmarks))return{invalid:true};
 const raw=(value as {bookmarks:unknown[]}).bookmarks,items:DesktopBrowserBookmark[]=[],urls=new Set<string>(),ids=new Set<string>();
 for(const entry of sorted(raw.filter(validBookmark))){
  if(items.length>=BOOKMARK_LIMIT||urls.has(entry.url)||ids.has(entry.id))continue;
  items.push(entry);urls.add(entry.url);ids.add(entry.id);
 }
 return{items,dropped:raw.length-items.length};
}

export function addBookmark(items:readonly DesktopBrowserBookmark[],input:{url:string;title:string;now:string;id:string}):DesktopBrowserBookmark[]|BookmarkError {
 if(items.length>=BOOKMARK_LIMIT)return'limit';
 const title=input.title.trim();
 if(!title||title.length>BOOKMARK_TITLE_MAX||!UUID.test(input.id))return'invalid';
 if(items.some(item=>item.url===input.url))return'duplicate';
 return[{id:input.id,url:input.url,title,createdAt:input.now,updatedAt:input.now},...items];
}

export function updateBookmark(items:readonly DesktopBrowserBookmark[],id:string,change:{title?:string;url?:string;now:string}):DesktopBrowserBookmark[]|BookmarkError {
 const index=items.findIndex(item=>item.id===id);
 if(index<0)return'missing';
 const item=items[index]!,next={...item,updatedAt:change.now};
 if(change.title!==undefined){const title=change.title.trim();if(!title||title.length>BOOKMARK_TITLE_MAX)return'invalid';next.title=title;}
 if(change.url!==undefined&&change.url!==item.url){if(items.some(other=>other.id!==id&&other.url===change.url))return'duplicate';next.url=change.url;}
 return items.map((entry,position)=>position===index?next:entry);
}

export function removeBookmark(items:readonly DesktopBrowserBookmark[],id:string):DesktopBrowserBookmark[]|BookmarkError {
 if(!items.some(item=>item.id===id))return'missing';
 return items.filter(item=>item.id!==id);
}

export function restoreBookmark(items:readonly DesktopBrowserBookmark[],bookmark:DesktopBrowserBookmark):DesktopBrowserBookmark[]|BookmarkError {
 if(!validBookmark(bookmark))return'invalid';
 if(items.length>=BOOKMARK_LIMIT)return'limit';
 if(items.some(item=>item.url===bookmark.url||item.id===bookmark.id))return'duplicate';
 return sorted([...items,bookmark]);
}

export function serializeBookmarkStore(items:readonly DesktopBrowserBookmark[]):string {return JSON.stringify({version:1,bookmarks:items},null,2);}
