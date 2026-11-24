import {createHash} from 'node:crypto';

/** Pure helpers for the GitHub blob permalink feature. No I/O here. */

const GITHUB_ORIGIN=/^(?:https:\/\/github\.com\/|git@github\.com:)([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+?)(?:\.git)?$/;

/** Admitted origin forms only; credentials, other hosts and extra segments fail. */
export function parseGitHubOrigin(url:string):{owner:string;repo:string}|null{
 const match=GITHUB_ORIGIN.exec(url.trim());if(!match)return null;
 const[owner,repo]=match[1]!.split('/');
 if(!owner||!repo||repo==='.'||repo==='..')return null;
 return{owner,repo};
}

/** The Git blob object ID of these exact bytes, computed with no filters. */
export function gitBlobId(bytes:Buffer):string{
 const header=Buffer.from('blob '+bytes.length+'\0','utf8');
 return createHash('sha1').update(header).update(bytes).digest('hex');
}

/** The canonical pinned blob URL: full SHA, one encoded segment at a time. */
export function githubBlobUrl(owner:string,repo:string,commit:string,path:string):string{
 return 'https://github.com/'+owner+'/'+repo+'/blob/'+commit+'/'+path.split('/').map(encodeURIComponent).join('/');
}

export type UpstreamResolution={ref:string;refname:string}|{reason:'upstream-not-origin'};

/** R4: configured upstream maps to refs/remotes/origin/<x>; absent config falls
 * back to refs/remotes/origin/<branch>; any other remote declines. */
export function upstreamRef(branch:string,config:{remote?:string;merge?:string}):UpstreamResolution{
 if(config.remote!==undefined||config.merge!==undefined){
  if(config.remote!=='origin')return{reason:'upstream-not-origin'};
  const match=/^refs\/heads\/(.+)$/.exec(config.merge??'');
  if(!match)return{reason:'upstream-not-origin'};
  return{ref:'refs/remotes/origin/'+match[1],refname:'origin/'+match[1]};
 }
 return{ref:'refs/remotes/origin/'+branch,refname:'origin/'+branch};
}
